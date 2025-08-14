import React from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const VehicleTypeSelector = ({
	vehicleTypes,
	selectedVehicleType,
	onVehicleTypeChange,
	estimatedPrice,
	onPriceUpdate
}) => {

	// Hàm xử lý khi chọn loại xe
	const handleVehicleTypeSelect = (vehicleType) => {
		onVehicleTypeChange(vehicleType.key);

		// Nếu đã có giá ước tính, tự động cập nhật giá theo loại xe mới
		if (estimatedPrice && estimatedPrice.estimatedPrice) {
			// Tính toán giá mới dựa trên loại xe
			const baseRate = vehicleType.baseRate || 10000;
			const currentBaseRate = estimatedPrice.baseRate || 10000;
			const rateRatio = baseRate / currentBaseRate;

			const newPrice = Math.round(estimatedPrice.estimatedPrice * rateRatio);

			// Cập nhật giá mới
			onPriceUpdate({
				...estimatedPrice,
				estimatedPrice: newPrice,
				baseRate: baseRate,
				vehicleType: vehicleType.key
			});
		}
	};

	// Hàm lấy hình ảnh theo loại xe - Không còn sử dụng

	// Hàm lấy icon Ionicons theo loại xe
	const getVehicleIcon = (vehicleKey) => {
		switch (vehicleKey) {
			case 'motorcycle':
				return 'bicycle';
			case 'car':
				return 'car';
			case 'suv':
				return 'car-sport';
			case 'luxury':
				return 'car-sport';
			default:
				return 'car';
		}
	};

	// Hàm lấy màu nền theo loại xe
	const getVehicleColor = (vehicleKey) => {
		switch (vehicleKey) {
			case 'motorcycle':
				return '#FF6B35';
			case 'car':
				return '#4285F4';
			case 'suv':
				return '#34A853';
			case 'luxury':
				return '#9C27B0';
			default:
				return '#4285F4';
		}
	};

	return (
		<View style={styles.container}>
			<Text style={styles.sectionTitle}>🚗 Chọn loại xe</Text>

			<View style={styles.vehicleTypesGrid}>
				{Array.isArray(vehicleTypes) &&
					vehicleTypes.map((vehicle) => (
						<TouchableOpacity
							key={vehicle.key}
							style={[
								styles.vehicleTypeCard,
								selectedVehicleType === vehicle.key && styles.vehicleTypeCardActive,
								{ borderColor: getVehicleColor(vehicle.key) }
							]}
							onPress={() => handleVehicleTypeSelect(vehicle)}
						>
														<View style={[
								styles.vehicleIconContainer,
								{ backgroundColor: getVehicleColor(vehicle.key) }
							]}>
								<Ionicons 
									name={getVehicleIcon(vehicle.key)} 
									size={32} 
									color="white" 
								/>
							</View>

							<Text style={[
								styles.vehicleName,
								selectedVehicleType === vehicle.key && styles.vehicleNameActive
							]}>
								{vehicle.name}
							</Text>

							<Text style={styles.vehicleDescription}>
								{vehicle.description || `${vehicle.maxPassengers || 4} người`}
							</Text>

							<Text style={styles.vehiclePrice}>
								{vehicle.baseRate?.toLocaleString('vi-VN')} VNĐ/km
							</Text>

							{selectedVehicleType === vehicle.key && (
								<View style={[
									styles.selectedIndicator,
									{ backgroundColor: getVehicleColor(vehicle.key) }
								]}>
									<Text style={styles.selectedText}>✓</Text>
								</View>
							)}
						</TouchableOpacity>
					))}
			</View>

			{/* Hiển thị giá ước tính nếu có */}
			{estimatedPrice && estimatedPrice.estimatedPrice && (
				<View style={styles.priceDisplay}>
					<Text style={styles.priceLabel}>💰 Giá ước tính:</Text>
					<Text style={styles.priceValue}>
						{estimatedPrice.estimatedPrice.toLocaleString('vi-VN')} VNĐ
					</Text>
					<Text style={styles.priceDetail}>
						{estimatedPrice.estimatedDistance ?
							`(${estimatedPrice.estimatedDistance}km)` :
							`(${estimatedPrice.baseRate || 10000} VNĐ/km)`
						}
					</Text>
				</View>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		marginBottom: 16,
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: '600',
		color: '#333',
		marginBottom: 16,
	},
	vehicleTypesGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
		gap: 12,
	},
	vehicleTypeCard: {
		width: (width - 56) / 2, // 2 cột với padding và gap
		backgroundColor: 'white',
		borderRadius: 16,
		padding: 16,
		borderWidth: 2,
		borderColor: '#E0E0E0',
		alignItems: 'center',
		position: 'relative',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	vehicleTypeCardActive: {
		borderColor: '#4285F4',
		backgroundColor: '#F8F9FF',
		shadowColor: '#4285F4',
		shadowOpacity: 0.2,
	},
	vehicleIconContainer: {
		width: 60,
		height: 60,
		borderRadius: 30,
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 12,
	},
	// Icon styles handled by Ionicons
	vehicleName: {
		fontSize: 16,
		fontWeight: '600',
		color: '#333',
		textAlign: 'center',
		marginBottom: 4,
	},
	vehicleNameActive: {
		color: '#4285F4',
	},
	vehicleDescription: {
		fontSize: 12,
		color: '#666',
		textAlign: 'center',
		marginBottom: 8,
	},
	vehiclePrice: {
		fontSize: 14,
		fontWeight: '500',
		color: '#34A853',
		textAlign: 'center',
	},
	selectedIndicator: {
		position: 'absolute',
		top: 8,
		right: 8,
		width: 24,
		height: 24,
		borderRadius: 12,
		justifyContent: 'center',
		alignItems: 'center',
	},
	selectedText: {
		color: 'white',
		fontSize: 14,
		fontWeight: 'bold',
	},
	priceDisplay: {
		backgroundColor: '#F8F9FA',
		padding: 16,
		borderRadius: 12,
		marginTop: 16,
		alignItems: 'center',
	},
	priceLabel: {
		fontSize: 14,
		fontWeight: '500',
		color: '#666',
		marginBottom: 4,
	},
	priceValue: {
		fontSize: 24,
		fontWeight: '700',
		color: '#34A853',
		marginBottom: 4,
	},
	priceDetail: {
		fontSize: 12,
		color: '#999',
		textAlign: 'center',
	},
});

export default VehicleTypeSelector;
