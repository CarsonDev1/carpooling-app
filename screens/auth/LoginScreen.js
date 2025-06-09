// screens/auth/LoginScreen.js
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
import { loginUser } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';

const LoginScreen = ({ navigation }) => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState({});

	const { login } = useAuth();

	// Validate form
	const validateForm = () => {
		const newErrors = {};

		if (!email.trim()) {
			newErrors.email = 'Email là bắt buộc';
		} else if (!/\S+@\S+\.\S+/.test(email)) {
			newErrors.email = 'Email không hợp lệ';
		}

		if (!password.trim()) {
			newErrors.password = 'Mật khẩu là bắt buộc';
		} else if (password.length < 6) {
			newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	// Handle login
	const handleLogin = async () => {
		if (!validateForm()) return;

		try {
			setLoading(true);
			setErrors({});

			const response = await loginUser({
				email: email.toLowerCase().trim(),
				password,
			});

			if (response.status === 'success') {
				// Update auth context
				login(response.data.user, response.data.token);

				Alert.alert('Thành công', 'Đăng nhập thành công!');
			}
		} catch (error) {
			console.error('Login error:', error);

			if (error.errors) {
				// Validation errors from server
				const serverErrors = {};
				error.errors.forEach((err) => {
					serverErrors[err.field] = err.message;
				});
				setErrors(serverErrors);
			} else {
				Alert.alert('Lỗi đăng nhập', error.message || 'Đăng nhập thất bại');
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
					<Text style={styles.title}>Đăng nhập</Text>
					<Text style={styles.subtitle}>Chào mừng bạn quay lại!</Text>
				</View>

				{/* Form */}
				<View style={styles.form}>
					{/* Email Input */}
					<View style={styles.inputContainer}>
						<Text style={styles.label}>Email</Text>
						<View style={[styles.inputWrapper, errors.email && styles.inputError]}>
							<Icon name='email' type='material' size={20} color='#757575' style={styles.inputIcon} />
							<TextInput
								style={styles.input}
								placeholder='Nhập email của bạn'
								placeholderTextColor='#999'
								value={email}
								onChangeText={setEmail}
								keyboardType='email-address'
								autoCapitalize='none'
								autoCorrect={false}
								editable={!loading}
							/>
						</View>
						{errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
					</View>

					{/* Password Input */}
					<View style={styles.inputContainer}>
						<Text style={styles.label}>Mật khẩu</Text>
						<View style={[styles.inputWrapper, errors.password && styles.inputError]}>
							<Icon name='lock' type='material' size={20} color='#757575' style={styles.inputIcon} />
							<TextInput
								style={styles.input}
								placeholder='Nhập mật khẩu'
								placeholderTextColor='#999'
								value={password}
								onChangeText={setPassword}
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

					{/* Forgot Password */}
					<TouchableOpacity
						style={styles.forgotPassword}
						onPress={() => navigation.navigate('ForgotPassword')}
						disabled={loading}
					>
						<Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
					</TouchableOpacity>

					{/* Login Button */}
					<TouchableOpacity
						style={[styles.loginButton, loading && styles.loginButtonDisabled]}
						onPress={handleLogin}
						disabled={loading}
					>
						{loading ? (
							<ActivityIndicator color='white' size='small' />
						) : (
							<Text style={styles.loginButtonText}>Đăng nhập</Text>
						)}
					</TouchableOpacity>

					{/* Divider */}
					<View style={styles.divider}>
						<View style={styles.dividerLine} />
						<Text style={styles.dividerText}>HOẶC</Text>
						<View style={styles.dividerLine} />
					</View>

					{/* Register Link */}
					<View style={styles.registerContainer}>
						<Text style={styles.registerText}>Chưa có tài khoản? </Text>
						<TouchableOpacity onPress={() => navigation.navigate('Register')} disabled={loading}>
							<Text style={styles.registerLink}>Đăng ký ngay</Text>
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
		justifyContent: 'center',
	},
	header: {
		alignItems: 'center',
		marginBottom: 40,
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
	forgotPassword: {
		alignSelf: 'flex-end',
		marginBottom: 30,
	},
	forgotPasswordText: {
		fontSize: 14,
		color: '#4285F4',
		fontWeight: '600',
	},
	loginButton: {
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
	loginButtonDisabled: {
		opacity: 0.6,
	},
	loginButtonText: {
		color: 'white',
		fontSize: 18,
		fontWeight: 'bold',
	},
	divider: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 30,
	},
	dividerLine: {
		flex: 1,
		height: 1,
		backgroundColor: '#E0E0E0',
	},
	dividerText: {
		marginHorizontal: 16,
		fontSize: 14,
		color: '#757575',
		fontWeight: '600',
	},
	registerContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
	registerText: {
		fontSize: 16,
		color: '#757575',
	},
	registerLink: {
		fontSize: 16,
		color: '#4285F4',
		fontWeight: 'bold',
	},
});

export default LoginScreen;
