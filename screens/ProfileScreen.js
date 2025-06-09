// screens/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	Image,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	Alert,
	ActivityIndicator,
	Modal,
	TextInput,
} from 'react-native';
import { Icon } from '@rneui/themed';
import { useAuth } from '../context/AuthContext';
import { updateProfile, changePassword, uploadAvatar, deleteAvatar } from '../api/authApi';
import * as ImagePicker from 'expo-image-picker';

const ProfileScreen = ({ navigation }) => {
	const { user, updateUser, logout } = useAuth();
	const [loading, setLoading] = useState(false);
	const [editModalVisible, setEditModalVisible] = useState(false);
	const [passwordModalVisible, setPasswordModalVisible] = useState(false);

	// Edit profile state
	const [editData, setEditData] = useState({
		fullName: '',
		phone: '',
	});

	// Change password state
	const [passwordData, setPasswordData] = useState({
		currentPassword: '',
		newPassword: '',
		confirmPassword: '',
	});

	const [errors, setErrors] = useState({});

	useEffect(() => {
		if (user) {
			setEditData({
				fullName: user.fullName || '',
				phone: user.phone || '',
			});
		}
	}, [user]);

	// Handle avatar selection
	const handleSelectAvatar = () => {
		Alert.alert('Chọn ảnh đại diện', 'Bạn muốn chọn ảnh từ đâu?', [
			{ text: 'Hủy', style: 'cancel' },
			{ text: 'Thư viện', onPress: () => pickImage('library') },
			{ text: 'Camera', onPress: () => pickImage('camera') },
			...(user?.avatar ? [{ text: 'Xóa ảnh hiện tại', onPress: handleDeleteAvatar, style: 'destructive' }] : []),
		]);
	};

	// Pick image from library or camera
	const pickImage = async (source) => {
		try {
			const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
			if (status !== 'granted') {
				Alert.alert('Lỗi', 'Cần quyền truy cập thư viện ảnh');
				return;
			}

			let result;
			if (source === 'camera') {
				const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
				if (cameraStatus !== 'granted') {
					Alert.alert('Lỗi', 'Cần quyền truy cập camera');
					return;
				}
				result = await ImagePicker.launchCameraAsync({
					mediaTypes: ImagePicker.MediaTypeOptions.Images,
					allowsEditing: true,
					aspect: [1, 1],
					quality: 0.8,
				});
			} else {
				result = await ImagePicker.launchImageLibraryAsync({
					mediaTypes: ImagePicker.MediaTypeOptions.Images,
					allowsEditing: true,
					aspect: [1, 1],
					quality: 0.8,
				});
			}

			if (!result.canceled && result.assets[0]) {
				await handleUploadAvatar(result.assets[0].uri);
			}
		} catch (error) {
			console.error('Pick image error:', error);
			Alert.alert('Lỗi', 'Không thể chọn ảnh');
		}
	};

	// Upload avatar
	const handleUploadAvatar = async (imageUri) => {
		try {
			setLoading(true);
			const response = await uploadAvatar(imageUri);

			if (response.status === 'success') {
				updateUser(response.data.user);
				Alert.alert('Thành công', 'Cập nhật ảnh đại diện thành công');
			}
		} catch (error) {
			console.error('Upload avatar error:', error);
			Alert.alert('Lỗi', error.message || 'Upload ảnh thất bại');
		} finally {
			setLoading(false);
		}
	};

	// Delete avatar
	const handleDeleteAvatar = async () => {
		try {
			setLoading(true);
			const response = await deleteAvatar();

			if (response.status === 'success') {
				updateUser(response.data.user);
				Alert.alert('Thành công', 'Đã xóa ảnh đại diện');
			}
		} catch (error) {
			console.error('Delete avatar error:', error);
			Alert.alert('Lỗi', error.message || 'Xóa ảnh thất bại');
		} finally {
			setLoading(false);
		}
	};

	// Handle update profile
	const handleUpdateProfile = async () => {
		try {
			setLoading(true);
			setErrors({});

			// Validate
			const newErrors = {};
			if (!editData.fullName.trim()) {
				newErrors.fullName = 'Họ tên là bắt buộc';
			}
			if (editData.phone.trim() && !/^[0-9]{10,11}$/.test(editData.phone)) {
				newErrors.phone = 'Số điện thoại không hợp lệ';
			}

			if (Object.keys(newErrors).length > 0) {
				setErrors(newErrors);
				return;
			}

			const response = await updateProfile(editData);

			if (response.status === 'success') {
				updateUser(response.data.user);
				setEditModalVisible(false);
				Alert.alert('Thành công', 'Cập nhật thông tin thành công');
			}
		} catch (error) {
			console.error('Update profile error:', error);
			Alert.alert('Lỗi', error.message || 'Cập nhật thông tin thất bại');
		} finally {
			setLoading(false);
		}
	};

	// Handle change password
	const handleChangePassword = async () => {
		try {
			setLoading(true);
			setErrors({});

			// Validate
			const newErrors = {};
			if (!passwordData.currentPassword) {
				newErrors.currentPassword = 'Mật khẩu hiện tại là bắt buộc';
			}
			if (!passwordData.newPassword) {
				newErrors.newPassword = 'Mật khẩu mới là bắt buộc';
			} else if (passwordData.newPassword.length < 6) {
				newErrors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự';
			}
			if (passwordData.newPassword !== passwordData.confirmPassword) {
				newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
			}

			if (Object.keys(newErrors).length > 0) {
				setErrors(newErrors);
				return;
			}

			const response = await changePassword(passwordData);

			if (response.status === 'success') {
				setPasswordModalVisible(false);
				setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
				Alert.alert('Thành công', 'Đổi mật khẩu thành công');
			}
		} catch (error) {
			console.error('Change password error:', error);
			Alert.alert('Lỗi', error.message || 'Đổi mật khẩu thất bại');
		} finally {
			setLoading(false);
		}
	};

	// Handle logout
	const handleLogout = () => {
		Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
			{ text: 'Hủy', style: 'cancel' },
			{
				text: 'Đăng xuất',
				style: 'destructive',
				onPress: logout,
			},
		]);
	};

	const getAvatarSource = () => {
		if (user?.avatar) {
			// Nếu avatar là URL đầy đủ (Cloudinary)
			if (user.avatar.startsWith('http')) {
				return { uri: user.avatar };
			}
			// Nếu avatar là đường dẫn local
			return { uri: `http://192.168.1.5:5000${user.avatar}` };
		}
		return require('../assets/icon.png'); // Thêm ảnh mặc định
	};

	return (
		<ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity style={styles.avatarContainer} onPress={handleSelectAvatar}>
					<Image source={getAvatarSource()} style={styles.avatar} />
					<View style={styles.avatarOverlay}>
						<Icon name='camera-alt' type='material' size={20} color='white' />
					</View>
					{loading && (
						<View style={styles.avatarLoading}>
							<ActivityIndicator color='white' size='small' />
						</View>
					)}
				</TouchableOpacity>

				<Text style={styles.userName}>{user?.fullName}</Text>
				<Text style={styles.userEmail}>{user?.email}</Text>
			</View>

			{/* Profile Options */}
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Thông tin cá nhân</Text>

				<TouchableOpacity style={styles.option} onPress={() => setEditModalVisible(true)}>
					<Icon name='edit' type='material' size={24} color='#4285F4' />
					<Text style={styles.optionText}>Chỉnh sửa thông tin</Text>
					<Icon name='chevron-right' type='material' size={24} color='#999' />
				</TouchableOpacity>

				<TouchableOpacity style={styles.option} onPress={() => setPasswordModalVisible(true)}>
					<Icon name='lock' type='material' size={24} color='#4285F4' />
					<Text style={styles.optionText}>Đổi mật khẩu</Text>
					<Icon name='chevron-right' type='material' size={24} color='#999' />
				</TouchableOpacity>
			</View>

			{/* App Settings */}
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Cài đặt</Text>

				<TouchableOpacity style={styles.option}>
					<Icon name='notifications' type='material' size={24} color='#4285F4' />
					<Text style={styles.optionText}>Thông báo</Text>
					<Icon name='chevron-right' type='material' size={24} color='#999' />
				</TouchableOpacity>

				<TouchableOpacity style={styles.option}>
					<Icon name='help' type='material' size={24} color='#4285F4' />
					<Text style={styles.optionText}>Trợ giúp</Text>
					<Icon name='chevron-right' type='material' size={24} color='#999' />
				</TouchableOpacity>

				<TouchableOpacity style={styles.option}>
					<Icon name='info' type='material' size={24} color='#4285F4' />
					<Text style={styles.optionText}>Về ứng dụng</Text>
					<Icon name='chevron-right' type='material' size={24} color='#999' />
				</TouchableOpacity>
			</View>

			{/* Logout */}
			<View style={styles.section}>
				<TouchableOpacity style={styles.logoutOption} onPress={handleLogout}>
					<Icon name='logout' type='material' size={24} color='#F44336' />
					<Text style={styles.logoutText}>Đăng xuất</Text>
				</TouchableOpacity>
			</View>

			{/* Edit Profile Modal */}
			<Modal
				visible={editModalVisible}
				animationType='slide'
				presentationStyle='pageSheet'
				onRequestClose={() => setEditModalVisible(false)}
			>
				<View style={styles.modalContainer}>
					<View style={styles.modalHeader}>
						<TouchableOpacity onPress={() => setEditModalVisible(false)}>
							<Text style={styles.modalCancel}>Hủy</Text>
						</TouchableOpacity>
						<Text style={styles.modalTitle}>Chỉnh sửa thông tin</Text>
						<TouchableOpacity onPress={handleUpdateProfile} disabled={loading}>
							<Text style={[styles.modalSave, loading && styles.modalSaveDisabled]}>
								{loading ? 'Đang lưu...' : 'Lưu'}
							</Text>
						</TouchableOpacity>
					</View>

					<ScrollView style={styles.modalContent}>
						<View style={styles.inputGroup}>
							<Text style={styles.inputLabel}>Họ và tên *</Text>
							<TextInput
								style={[styles.modalInput, errors.fullName && styles.modalInputError]}
								value={editData.fullName}
								onChangeText={(text) => setEditData({ ...editData, fullName: text })}
								placeholder='Nhập họ và tên'
								editable={!loading}
							/>
							{errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
						</View>

						<View style={styles.inputGroup}>
							<Text style={styles.inputLabel}>Số điện thoại</Text>
							<TextInput
								style={[styles.modalInput, errors.phone && styles.modalInputError]}
								value={editData.phone}
								onChangeText={(text) => setEditData({ ...editData, phone: text })}
								placeholder='Nhập số điện thoại'
								keyboardType='phone-pad'
								editable={!loading}
							/>
							{errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
						</View>
					</ScrollView>
				</View>
			</Modal>

			{/* Change Password Modal */}
			<Modal
				visible={passwordModalVisible}
				animationType='slide'
				presentationStyle='pageSheet'
				onRequestClose={() => setPasswordModalVisible(false)}
			>
				<View style={styles.modalContainer}>
					<View style={styles.modalHeader}>
						<TouchableOpacity onPress={() => setPasswordModalVisible(false)}>
							<Text style={styles.modalCancel}>Hủy</Text>
						</TouchableOpacity>
						<Text style={styles.modalTitle}>Đổi mật khẩu</Text>
						<TouchableOpacity onPress={handleChangePassword} disabled={loading}>
							<Text style={[styles.modalSave, loading && styles.modalSaveDisabled]}>
								{loading ? 'Đang lưu...' : 'Lưu'}
							</Text>
						</TouchableOpacity>
					</View>

					<ScrollView style={styles.modalContent}>
						<View style={styles.inputGroup}>
							<Text style={styles.inputLabel}>Mật khẩu hiện tại *</Text>
							<TextInput
								style={[styles.modalInput, errors.currentPassword && styles.modalInputError]}
								value={passwordData.currentPassword}
								onChangeText={(text) => setPasswordData({ ...passwordData, currentPassword: text })}
								placeholder='Nhập mật khẩu hiện tại'
								secureTextEntry
								editable={!loading}
							/>
							{errors.currentPassword && <Text style={styles.errorText}>{errors.currentPassword}</Text>}
						</View>

						<View style={styles.inputGroup}>
							<Text style={styles.inputLabel}>Mật khẩu mới *</Text>
							<TextInput
								style={[styles.modalInput, errors.newPassword && styles.modalInputError]}
								value={passwordData.newPassword}
								onChangeText={(text) => setPasswordData({ ...passwordData, newPassword: text })}
								placeholder='Nhập mật khẩu mới'
								secureTextEntry
								editable={!loading}
							/>
							{errors.newPassword && <Text style={styles.errorText}>{errors.newPassword}</Text>}
						</View>

						<View style={styles.inputGroup}>
							<Text style={styles.inputLabel}>Xác nhận mật khẩu mới *</Text>
							<TextInput
								style={[styles.modalInput, errors.confirmPassword && styles.modalInputError]}
								value={passwordData.confirmPassword}
								onChangeText={(text) => setPasswordData({ ...passwordData, confirmPassword: text })}
								placeholder='Nhập lại mật khẩu mới'
								secureTextEntry
								editable={!loading}
							/>
							{errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
						</View>
					</ScrollView>
				</View>
			</Modal>
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#F9F9F9',
	},
	header: {
		backgroundColor: 'white',
		alignItems: 'center',
		paddingVertical: 30,
		paddingHorizontal: 20,
		borderBottomWidth: 1,
		borderBottomColor: '#E0E0E0',
	},
	avatarContainer: {
		position: 'relative',
		marginBottom: 16,
	},
	avatar: {
		width: 100,
		height: 100,
		borderRadius: 50,
		backgroundColor: '#E0E0E0',
	},
	avatarOverlay: {
		position: 'absolute',
		bottom: 0,
		right: 0,
		backgroundColor: '#4285F4',
		borderRadius: 15,
		width: 30,
		height: 30,
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 2,
		borderColor: 'white',
	},
	avatarLoading: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		borderRadius: 50,
		backgroundColor: 'rgba(0,0,0,0.5)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	userName: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#212121',
		marginBottom: 4,
	},
	userEmail: {
		fontSize: 16,
		color: '#757575',
	},
	section: {
		backgroundColor: 'white',
		marginTop: 10,
		paddingHorizontal: 20,
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: 'bold',
		color: '#212121',
		paddingVertical: 15,
		borderBottomWidth: 1,
		borderBottomColor: '#F0F0F0',
	},
	option: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 15,
		borderBottomWidth: 1,
		borderBottomColor: '#F0F0F0',
	},
	optionText: {
		flex: 1,
		fontSize: 16,
		color: '#212121',
		marginLeft: 15,
	},
	logoutOption: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 15,
	},
	logoutText: {
		fontSize: 16,
		color: '#F44336',
		marginLeft: 15,
		fontWeight: '600',
	},
	modalContainer: {
		flex: 1,
		backgroundColor: 'white',
	},
	modalHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingVertical: 15,
		borderBottomWidth: 1,
		borderBottomColor: '#E0E0E0',
	},
	modalCancel: {
		fontSize: 16,
		color: '#757575',
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		color: '#212121',
	},
	modalSave: {
		fontSize: 16,
		color: '#4285F4',
		fontWeight: 'bold',
	},
	modalSaveDisabled: {
		color: '#CCCCCC',
	},
	modalContent: {
		flex: 1,
		padding: 20,
	},
	inputGroup: {
		marginBottom: 20,
	},
	inputLabel: {
		fontSize: 16,
		fontWeight: '600',
		color: '#212121',
		marginBottom: 8,
	},
	modalInput: {
		borderWidth: 1,
		borderColor: '#E0E0E0',
		borderRadius: 8,
		paddingHorizontal: 16,
		paddingVertical: 12,
		fontSize: 16,
		backgroundColor: '#F8F9FA',
	},
	modalInputError: {
		borderColor: '#F44336',
		backgroundColor: '#FFEBEE',
	},
	errorText: {
		fontSize: 14,
		color: '#F44336',
		marginTop: 4,
	},
});

export default ProfileScreen;
