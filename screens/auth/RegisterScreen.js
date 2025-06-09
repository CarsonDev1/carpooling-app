// screens/auth/RegisterScreen.js
import React, { useState } from 'react';
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	Alert,
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
} from 'react-native';
import { Icon } from '@rneui/themed';
import { registerUser } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';

const RegisterScreen = ({ navigation }) => {
	const [formData, setFormData] = useState({
		fullName: '',
		email: '',
		password: '',
		confirmPassword: '',
		phone: '',
	});
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState({});

	const { login } = useAuth();

	// Update form data
	const updateFormData = (field, value) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		// Clear error when user starts typing
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: null }));
		}
	};

	// Validate form
	const validateForm = () => {
		const newErrors = {};

		// Full name validation
		if (!formData.fullName.trim()) {
			newErrors.fullName = 'Họ tên là bắt buộc';
		} else if (formData.fullName.length < 2) {
			newErrors.fullName = 'Họ tên phải có ít nhất 2 ký tự';
		}

		// Email validation
		if (!formData.email.trim()) {
			newErrors.email = 'Email là bắt buộc';
		} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
			newErrors.email = 'Email không hợp lệ';
		}

		// Password validation
		if (!formData.password.trim()) {
			newErrors.password = 'Mật khẩu là bắt buộc';
		} else if (formData.password.length < 6) {
			newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
		} else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
			newErrors.password = 'Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 số';
		}

		// Confirm password validation
		if (!formData.confirmPassword.trim()) {
			newErrors.confirmPassword = 'Xác nhận mật khẩu là bắt buộc';
		} else if (formData.password !== formData.confirmPassword) {
			newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
		}

		// Phone validation (optional)
		if (formData.phone.trim() && !/^[0-9]{10,11}$/.test(formData.phone)) {
			newErrors.phone = 'Số điện thoại không hợp lệ';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	// Handle register
	const handleRegister = async () => {
		if (!validateForm()) return;

		try {
			setLoading(true);
			setErrors({});

			const userData = {
				fullName: formData.fullName.trim(),
				email: formData.email.toLowerCase().trim(),
				password: formData.password,
			};

			// Add phone if provided
			if (formData.phone.trim()) {
				userData.phone = formData.phone.trim();
			}

			const response = await registerUser(userData);

			if (response.status === 'success') {
				// Update auth context
				login(response.data.user, response.data.token);

				Alert.alert('Đăng ký thành công!', 'Chào mừng bạn đến với Carpooling!', [{ text: 'OK' }]);
			}
		} catch (error) {
			console.error('Register error:', error);

			if (error.errors) {
				// Validation errors from server
				const serverErrors = {};
				error.errors.forEach((err) => {
					serverErrors[err.field] = err.message;
				});
				setErrors(serverErrors);
			} else {
				Alert.alert('Lỗi đăng ký', error.message || 'Đăng ký thất bại');
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
			<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
				{/* Header */}
				<View style={styles.header}>
					<Text style={styles.title}>Đăng ký</Text>
					<Text style={styles.subtitle}>Tạo tài khoản mới để bắt đầu</Text>
				</View>

				{/* Form */}
				<View style={styles.form}>
					{/* Full Name Input */}
					<View style={styles.inputContainer}>
						<Text style={styles.label}>Họ và tên *</Text>
						<View style={[styles.inputWrapper, errors.fullName && styles.inputError]}>
							<Icon name='person' type='material' size={20} color='#757575' style={styles.inputIcon} />
							<TextInput
								style={styles.input}
								placeholder='Nhập họ và tên'
								placeholderTextColor='#999'
								value={formData.fullName}
								onChangeText={(value) => updateFormData('fullName', value)}
								autoCapitalize='words'
								editable={!loading}
							/>
						</View>
						{errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
					</View>

					{/* Email Input */}
					<View style={styles.inputContainer}>
						<Text style={styles.label}>Email *</Text>
						<View style={[styles.inputWrapper, errors.email && styles.inputError]}>
							<Icon name='email' type='material' size={20} color='#757575' style={styles.inputIcon} />
							<TextInput
								style={styles.input}
								placeholder='Nhập email'
								placeholderTextColor='#999'
								value={formData.email}
								onChangeText={(value) => updateFormData('email', value)}
								keyboardType='email-address'
								autoCapitalize='none'
								autoCorrect={false}
								editable={!loading}
							/>
						</View>
						{errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
					</View>

					{/* Phone Input */}
					<View style={styles.inputContainer}>
						<Text style={styles.label}>Số điện thoại (tùy chọn)</Text>
						<View style={[styles.inputWrapper, errors.phone && styles.inputError]}>
							<Icon name='phone' type='material' size={20} color='#757575' style={styles.inputIcon} />
							<TextInput
								style={styles.input}
								placeholder='Nhập số điện thoại'
								placeholderTextColor='#999'
								value={formData.phone}
								onChangeText={(value) => updateFormData('phone', value)}
								keyboardType='phone-pad'
								editable={!loading}
							/>
						</View>
						{errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
					</View>

					{/* Password Input */}
					<View style={styles.inputContainer}>
						<Text style={styles.label}>Mật khẩu *</Text>
						<View style={[styles.inputWrapper, errors.password && styles.inputError]}>
							<Icon name='lock' type='material' size={20} color='#757575' style={styles.inputIcon} />
							<TextInput
								style={styles.input}
								placeholder='Nhập mật khẩu'
								placeholderTextColor='#999'
								value={formData.password}
								onChangeText={(value) => updateFormData('password', value)}
								secureTextEntry={!showPassword}
								autoCapitalize='none'
								autoCorrect={false}
								editable={!loading}
							/>
							<TouchableOpacity
								onPress={() => setShowPassword(!showPassword)}
								style={styles.eyeIcon}
								disabled={loading}
							>
								<Icon
									name={showPassword ? 'visibility' : 'visibility-off'}
									type='material'
									size={20}
									color='#757575'
								/>
							</TouchableOpacity>
						</View>
						{errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
					</View>

					{/* Confirm Password Input */}
					<View style={styles.inputContainer}>
						<Text style={styles.label}>Xác nhận mật khẩu *</Text>
						<View style={[styles.inputWrapper, errors.confirmPassword && styles.inputError]}>
							<Icon name='lock' type='material' size={20} color='#757575' style={styles.inputIcon} />
							<TextInput
								style={styles.input}
								placeholder='Nhập lại mật khẩu'
								placeholderTextColor='#999'
								value={formData.confirmPassword}
								onChangeText={(value) => updateFormData('confirmPassword', value)}
								secureTextEntry={!showConfirmPassword}
								autoCapitalize='none'
								autoCorrect={false}
								editable={!loading}
							/>
							<TouchableOpacity
								onPress={() => setShowConfirmPassword(!showConfirmPassword)}
								style={styles.eyeIcon}
								disabled={loading}
							>
								<Icon
									name={showConfirmPassword ? 'visibility' : 'visibility-off'}
									type='material'
									size={20}
									color='#757575'
								/>
							</TouchableOpacity>
						</View>
						{errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
					</View>

					{/* Password Requirements */}
					<View style={styles.passwordRequirements}>
						<Text style={styles.requirementsTitle}>Yêu cầu mật khẩu:</Text>
						<Text style={styles.requirementText}>• Ít nhất 6 ký tự</Text>
						<Text style={styles.requirementText}>• Có ít nhất 1 chữ hoa, 1 chữ thường và 1 số</Text>
					</View>

					{/* Register Button */}
					<TouchableOpacity
						style={[styles.registerButton, loading && styles.registerButtonDisabled]}
						onPress={handleRegister}
						disabled={loading}
					>
						{loading ? (
							<ActivityIndicator color='white' size='small' />
						) : (
							<Text style={styles.registerButtonText}>Đăng ký</Text>
						)}
					</TouchableOpacity>

					{/* Login Link */}
					<View style={styles.loginContainer}>
						<Text style={styles.loginText}>Đã có tài khoản? </Text>
						<TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={loading}>
							<Text style={styles.loginLink}>Đăng nhập ngay</Text>
						</TouchableOpacity>
					</View>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#FFFFFF',
	},
	scrollContainer: {
		flexGrow: 1,
		padding: 20,
		paddingTop: 40,
	},
	header: {
		alignItems: 'center',
		marginBottom: 30,
	},
	title: {
		fontSize: 32,
		fontWeight: 'bold',
		color: '#212121',
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 16,
		color: '#757575',
		textAlign: 'center',
	},
	form: {
		width: '100%',
	},
	inputContainer: {
		marginBottom: 20,
	},
	label: {
		fontSize: 16,
		fontWeight: '600',
		color: '#212121',
		marginBottom: 8,
	},
	inputWrapper: {
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: '#E0E0E0',
		borderRadius: 12,
		backgroundColor: '#F8F9FA',
		paddingHorizontal: 16,
		height: 56,
	},
	inputError: {
		borderColor: '#F44336',
		backgroundColor: '#FFEBEE',
	},
	inputIcon: {
		marginRight: 12,
	},
	input: {
		flex: 1,
		fontSize: 16,
		color: '#212121',
		paddingVertical: 0,
	},
	eyeIcon: {
		padding: 4,
	},
	errorText: {
		fontSize: 14,
		color: '#F44336',
		marginTop: 4,
		marginLeft: 4,
	},
	passwordRequirements: {
		backgroundColor: '#F3F4F6',
		padding: 16,
		borderRadius: 8,
		marginBottom: 30,
	},
	requirementsTitle: {
		fontSize: 14,
		fontWeight: '600',
		color: '#374151',
		marginBottom: 8,
	},
	requirementText: {
		fontSize: 13,
		color: '#6B7280',
		marginBottom: 4,
	},
	registerButton: {
		backgroundColor: '#4285F4',
		borderRadius: 12,
		height: 56,
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 30,
		shadowColor: '#4285F4',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 8,
	},
	registerButtonDisabled: {
		opacity: 0.6,
	},
	registerButtonText: {
		color: 'white',
		fontSize: 18,
		fontWeight: 'bold',
	},
	loginContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
	loginText: {
		fontSize: 16,
		color: '#757575',
	},
	loginLink: {
		fontSize: 16,
		color: '#4285F4',
		fontWeight: 'bold',
	},
});

export default RegisterScreen;
