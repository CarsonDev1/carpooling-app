// screens/auth/ForgotPasswordScreen.js
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
import { forgotPassword } from '../../api/authApi';

const ForgotPasswordScreen = ({ navigation }) => {
	const [email, setEmail] = useState('');
	const [loading, setLoading] = useState(false);
	const [emailSent, setEmailSent] = useState(false);
	const [errors, setErrors] = useState({});

	// Validate email
	const validateEmail = () => {
		const newErrors = {};

		if (!email.trim()) {
			newErrors.email = 'Email là bắt buộc';
		} else if (!/\S+@\S+\.\S+/.test(email)) {
			newErrors.email = 'Email không hợp lệ';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	// Handle forgot password
	const handleForgotPassword = async () => {
		if (!validateEmail()) return;

		try {
			setLoading(true);
			setErrors({});

			const response = await forgotPassword(email.toLowerCase().trim());

			if (response.status === 'success') {
				setEmailSent(true);
				Alert.alert('Email đã được gửi!', 'Vui lòng kiểm tra email của bạn để đặt lại mật khẩu.', [
					{ text: 'OK' },
				]);
			}
		} catch (error) {
			console.error('Forgot password error:', error);
			Alert.alert('Lỗi', error.message || 'Không thể gửi email đặt lại mật khẩu');
		} finally {
			setLoading(false);
		}
	};

	// Handle resend email
	const handleResendEmail = async () => {
		setEmailSent(false);
		await handleForgotPassword();
	};

	if (emailSent) {
		return (
			<View style={styles.container}>
				<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
					<View style={styles.successContainer}>
						<Icon name='mark-email-read' type='material' size={80} color='#4CAF50' />
						<Text style={styles.successTitle}>Email đã được gửi!</Text>
						<Text style={styles.successMessage}>
							Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email:
						</Text>
						<Text style={styles.emailText}>{email}</Text>
						<Text style={styles.instructionText}>
							Vui lòng kiểm tra hộp thư đến và thực hiện theo hướng dẫn để đặt lại mật khẩu.
						</Text>

						<TouchableOpacity style={styles.resendButton} onPress={handleResendEmail} disabled={loading}>
							{loading ? (
								<ActivityIndicator color='white' size='small' />
							) : (
								<Text style={styles.resendButtonText}>Gửi lại email</Text>
							)}
						</TouchableOpacity>

						<TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Login')}>
							<Text style={styles.backButtonText}>Quay lại đăng nhập</Text>
						</TouchableOpacity>
					</View>
				</ScrollView>
			</View>
		);
	}

	return (
		<KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
			<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
				{/* Header */}
				<View style={styles.header}>
					<TouchableOpacity style={styles.backIcon} onPress={() => navigation.goBack()}>
						<Icon name='arrow-back' type='material' size={24} color='#212121' />
					</TouchableOpacity>
					<Icon name='lock-reset' type='material-community' size={80} color='#4285F4' />
					<Text style={styles.title}>Quên mật khẩu?</Text>
					<Text style={styles.subtitle}>
						Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu
					</Text>
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

					{/* Send Button */}
					<TouchableOpacity
						style={[styles.sendButton, loading && styles.sendButtonDisabled]}
						onPress={handleForgotPassword}
						disabled={loading}
					>
						{loading ? (
							<ActivityIndicator color='white' size='small' />
						) : (
							<Text style={styles.sendButtonText}>Gửi hướng dẫn</Text>
						)}
					</TouchableOpacity>

					{/* Back to Login */}
					<TouchableOpacity
						style={styles.loginButton}
						onPress={() => navigation.navigate('Login')}
						disabled={loading}
					>
						<Icon name='arrow-back' type='material' size={20} color='#4285F4' />
						<Text style={styles.loginButtonText}>Quay lại đăng nhập</Text>
					</TouchableOpacity>
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
		position: 'relative',
	},
	backIcon: {
		position: 'absolute',
		top: 0,
		left: 0,
		padding: 4,
	},
	title: {
		fontSize: 28,
		fontWeight: 'bold',
		color: '#212121',
		marginTop: 20,
		marginBottom: 12,
		textAlign: 'center',
	},
	subtitle: {
		fontSize: 16,
		color: '#757575',
		textAlign: 'center',
		lineHeight: 22,
		paddingHorizontal: 20,
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
	errorText: {
		fontSize: 14,
		color: '#F44336',
		marginTop: 4,
		marginLeft: 4,
	},
	sendButton: {
		backgroundColor: '#4285F4',
		borderRadius: 12,
		height: 56,
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 20,
		shadowColor: '#4285F4',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 8,
	},
	sendButtonDisabled: {
		opacity: 0.6,
	},
	sendButtonText: {
		color: 'white',
		fontSize: 18,
		fontWeight: 'bold',
	},
	loginButton: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		paddingVertical: 16,
	},
	loginButtonText: {
		fontSize: 16,
		color: '#4285F4',
		fontWeight: '600',
		marginLeft: 8,
	},
	successContainer: {
		alignItems: 'center',
		paddingHorizontal: 20,
	},
	successTitle: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#212121',
		marginTop: 20,
		marginBottom: 16,
		textAlign: 'center',
	},
	successMessage: {
		fontSize: 16,
		color: '#757575',
		textAlign: 'center',
		marginBottom: 8,
		lineHeight: 22,
	},
	emailText: {
		fontSize: 16,
		color: '#4285F4',
		fontWeight: 'bold',
		marginBottom: 16,
		textAlign: 'center',
	},
	instructionText: {
		fontSize: 14,
		color: '#757575',
		textAlign: 'center',
		lineHeight: 20,
		marginBottom: 30,
	},
	resendButton: {
		backgroundColor: '#4285F4',
		borderRadius: 12,
		height: 48,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 24,
		marginBottom: 16,
	},
	resendButtonText: {
		color: 'white',
		fontSize: 16,
		fontWeight: 'bold',
	},
	backButton: {
		paddingVertical: 12,
	},
	backButtonText: {
		fontSize: 16,
		color: '#4285F4',
		fontWeight: '600',
		textAlign: 'center',
	},
});

export default ForgotPasswordScreen;
