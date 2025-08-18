// Custom Mapbox Geocoding implementation for React Native
// Simple input without any conflicts

import React, { useState, useEffect, useRef } from 'react';
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	ScrollView,
	SafeAreaView,
	Alert,
	ActivityIndicator,
	Platform,
	Switch,
	FlatList,
	Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { createBookingRequest, estimatePrice, getVehicleTypes } from '../api/tripsApi';
import { useAuth } from '../context/AuthContext';
import MapView, { Marker, PROVIDER_GOOGLE, UrlTile } from 'react-native-maps';
import Constants from 'expo-constants';
import RouteInfo from '../components/RouteInfo';
import VehicleTypeSelector from '../components/VehicleTypeSelector';

const { width, height } = Dimensions.get('window');

const MAPBOX_ACCESS_TOKEN =
	'sk.eyJ1IjoiY2Fyc29uZGV2MSIsImEiOiJjbWVoOXk0bGwwNXE1Mm1yNWg0dWhnZnUzIn0.Ovjrdod0bfZkQ84DT0mX-w';

export default function CreateTripScreen() {
	const navigation = useNavigation();
	const route = useRoute();
	const { user } = useAuth();
	const [loading, setLoading] = useState(false);
	const [estimating, setEstimating] = useState(false);

	// Form data
	const [startLocation, setStartLocation] = useState('');
	const [endLocation, setEndLocation] = useState('');
	const [startCoordinates, setStartCoordinates] = useState(null);
	const [endCoordinates, setEndCoordinates] = useState(null);

	const futureDateTime = new Date(Date.now() + 60 * 60 * 1000);
	const [departureDate, setDepartureDate] = useState(futureDateTime);
	const [departureTime, setDepartureTime] = useState(futureDateTime);

	const [availableSeats, setAvailableSeats] = useState('1');
	const [notes, setNotes] = useState('');
	const [vehicleType, setVehicleType] = useState('car');
	const [estimatedPrice, setEstimatedPrice] = useState(null);
	const [vehicleTypes, setVehicleTypes] = useState([]);
	const [isRecurring, setIsRecurring] = useState(false);
	// Max price removed per new flow

	// Date/Time picker states
	const [showDatePicker, setShowDatePicker] = useState(false);
	const [showTimePicker, setShowTimePicker] = useState(false);

	// Location search states
	const [startSuggestions, setStartSuggestions] = useState([]);
	const [endSuggestions, setEndSuggestions] = useState([]);
	const [showStartSuggestions, setShowStartSuggestions] = useState(false);
	const [showEndSuggestions, setShowEndSuggestions] = useState(false);
	const [startSearching, setStartSearching] = useState(false);
	const [endSearching, setEndSearching] = useState(false);

	useEffect(() => {
		loadVehicleTypes();
	}, []);

	const loadVehicleTypes = async () => {
		try {
			const response = await getVehicleTypes();
			if (response?.success && response?.data) {
				const typesArray = Object.keys(response.data).map((key) => ({
					key,
					...response.data[key],
				}));
				setVehicleTypes(typesArray);
			} else {
				// Fallback data với đầy đủ thông tin
				setVehicleTypes([
					{
						key: 'motorcycle',
						name: 'Xe máy',
						baseRate: 5000,
						description: 'Phù hợp cho 1-2 người, chi phí thấp',
						maxPassengers: 2
					},
					{
						key: 'car',
						name: 'Ô tô',
						baseRate: 10000,
						description: 'Phù hợp cho gia đình nhỏ hoặc nhóm 3-4 người',
						maxPassengers: 4
					},
					{
						key: 'suv',
						name: 'SUV/MPV',
						baseRate: 12000,
						description: 'Phù hợp cho nhóm 5-7 người và khoảng trống cho hành lý',
						maxPassengers: 7
					},
					{
						key: 'luxury',
						name: 'Xe sang',
						baseRate: 15000,
						description: 'Trải nghiệm cao cấp với xe hiện đại và thoải mái',
						maxPassengers: 4
					}
				]);
			}
		} catch (error) {
			console.error('Error loading vehicle types:', error);
			// Fallback data với đầy đủ thông tin
			setVehicleTypes([
				{
					key: 'motorcycle',
					name: 'Xe máy',
					baseRate: 5000,
					description: 'Phù hợp cho 1-2 người, chi phí thấp',
					maxPassengers: 2
				},
				{
					key: 'car',
					name: 'Ô tô',
					baseRate: 10000,
					description: 'Phù hợp cho gia đình nhỏ hoặc nhóm 3-4 người',
					maxPassengers: 4
				},
				{
					key: 'suv',
					name: 'SUV/MPV',
					baseRate: 12000,
					description: 'Phù hợp cho nhóm 5-7 người và khoảng trống cho hành lý',
					maxPassengers: 7
				},
				{
					key: 'luxury',
					name: 'Xe sang',
					baseRate: 15000,
					description: 'Trải nghiệm cao cấp với xe hiện đại và thoải mái',
					maxPassengers: 4
				}
			]);
		}
	};

	// Search function
	const searchLocations = async (query, setSuggestions, setShowSuggestions, setSearching) => {
		if (query.length < 2) {
			Alert.alert('Thông báo', 'Vui lòng nhập ít nhất 2 ký tự để tìm kiếm');
			return;
		}

		try {
			setSearching(true);
			const response = await fetch(
				`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
				`access_token=${MAPBOX_ACCESS_TOKEN}&` +
				`country=VN&` +
				`language=vi&` +
				`limit=5&` +
				`types=poi,address`
			);

			const data = await response.json();
			console.log('🗺️ Mapbox search results:', data);

			if (data.features && data.features.length > 0) {
				setSuggestions(data.features);
				setShowSuggestions(true);
			} else {
				Alert.alert('Thông báo', 'Không tìm thấy địa điểm nào');
			}
		} catch (error) {
			console.error('Mapbox search error:', error);
			Alert.alert('Lỗi', 'Không thể tìm kiếm địa điểm');
		} finally {
			setSearching(false);
		}
	};

	const handleStartSearch = () => {
		searchLocations(startLocation, setStartSuggestions, setShowStartSuggestions, setStartSearching);
	};

	const handleEndSearch = () => {
		searchLocations(endLocation, setEndSuggestions, setShowEndSuggestions, setEndSearching);
	};

	const handleStartSuggestionPress = (item) => {
		const coordinates = item.geometry.coordinates;
		setStartLocation(item.place_name);
		setStartCoordinates({
			lat: coordinates[1],
			lng: coordinates[0],
		});
		setShowStartSuggestions(false);
	};

	const handleEndSuggestionPress = (item) => {
		const coordinates = item.geometry.coordinates;
		setEndLocation(item.place_name);
		setEndCoordinates({
			lat: coordinates[1],
			lng: coordinates[0],
		});
		setShowEndSuggestions(false);
	};

	const handleEstimatePrice = async () => {
		if (!startCoordinates || !endCoordinates) {
			Alert.alert('Lỗi', 'Vui lòng chọn điểm đi và điểm đến');
			return;
		}

		try {
			setEstimating(true);
			const priceData = {
				startLocation: { coordinates: startCoordinates },
				endLocation: { coordinates: endCoordinates },
				departureTime: combineDateAndTime(departureDate, departureTime),
				vehicleType,
			};

			const response = await estimatePrice(priceData);

			// Thêm thông tin baseRate từ loại xe hiện tại
			const currentVehicle = vehicleTypes.find(v => v.key === vehicleType);
			const enhancedPriceData = {
				...response.data,
				baseRate: currentVehicle?.baseRate || 10000,
				vehicleType: vehicleType
			};

			setEstimatedPrice(enhancedPriceData);
		} catch (error) {
			Alert.alert('Lỗi', error.message || 'Không thể ước tính giá');
		} finally {
			setEstimating(false);
		}
	};

	const handleCreateBookingRequest = async () => {
		if (!startLocation || !endLocation) {
			Alert.alert('Lỗi', 'Vui lòng nhập điểm đi và điểm đến');
			return;
		}

		if (!startCoordinates || !endCoordinates) {
			Alert.alert('Lỗi', 'Vui lòng chọn địa điểm từ danh sách gợi ý');
			return;
		}

		if (!user) {
			Alert.alert('Lỗi', 'Vui lòng đăng nhập để tạo yêu cầu');
			return;
		}

		try {
			setLoading(true);
			const bookingData = {
				startLocation: {
					address: startLocation,
					coordinates: startCoordinates,
				},
				endLocation: {
					address: endLocation,
					coordinates: endCoordinates,
				},
				departureTime: combineDateAndTime(departureDate, departureTime),
				vehicleType,
				availableSeats: parseInt(availableSeats),
				notes,
				isRecurring,
			};

			const response = await createBookingRequest(bookingData);

			if (response?.success) {
				Alert.alert(
					'🎉 Đặt xe thành công!',
					'Yêu cầu đặt xe đã được tạo. Đang tìm kiếm tài xế...',
					[
						{
							text: 'Chờ tài xế',
							onPress: () => navigation.navigate('WaitingForDriver', {
								tripId: response.data._id,
								bookingData: response.data
							}),
						},
					]
				);
			} else {
				Alert.alert('Lỗi', response?.message || 'Không thể tạo yêu cầu đặt xe');
			}
		} catch (error) {
			console.error('Create booking error:', error);
			Alert.alert('Lỗi', error.message || 'Có lỗi xảy ra khi tạo yêu cầu');
		} finally {
			setLoading(false);
		}
	};

	const combineDateAndTime = (date, time) => {
		const combined = new Date(date);
		combined.setHours(time.getHours());
		combined.setMinutes(time.getMinutes());
		combined.setSeconds(0);
		combined.setMilliseconds(0);
		return combined;
	};

	const onDateChange = (event, selectedDate) => {
		setShowDatePicker(false);
		if (selectedDate) setDepartureDate(selectedDate);
	};

	const onTimeChange = (event, selectedTime) => {
		setShowTimePicker(false);
		if (selectedTime) setDepartureTime(selectedTime);
	};

	const isFormValid = () => {
		return startLocation && endLocation && startCoordinates && endCoordinates;
	};

	const handleVehicleTypeChange = (newVehicleType) => {
		setVehicleType(newVehicleType);

		// Nếu đã có giá ước tính, tự động cập nhật giá theo loại xe mới
		if (estimatedPrice && estimatedPrice.estimatedPrice) {
			// Tìm thông tin loại xe mới
			const newVehicle = vehicleTypes.find(v => v.key === newVehicleType);
			if (newVehicle && newVehicle.baseRate) {
				// Tính toán giá mới dựa trên loại xe
				const currentBaseRate = estimatedPrice.baseRate || 10000;
				const rateRatio = newVehicle.baseRate / currentBaseRate;

				const newPrice = Math.round(estimatedPrice.estimatedPrice * rateRatio);

				// Cập nhật giá mới
				setEstimatedPrice({
					...estimatedPrice,
					estimatedPrice: newPrice,
					baseRate: newVehicle.baseRate,
					vehicleType: newVehicleType
				});
			}
		}
	};

	const handlePriceUpdate = (newPriceData) => {
		setEstimatedPrice(newPriceData);
	};

	return (
		<SafeAreaView style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
					<Ionicons name='chevron-back' size={24} color='white' />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Đặt xe</Text>
			</View>

			<ScrollView
				style={styles.content}
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled"
			>
				{/* Location Inputs */}
				<View style={styles.locationContainer}>
					<Text style={styles.sectionTitle}>📍 Địa điểm</Text>

					{/* Start Location Input */}
					<View style={styles.inputSection}>
						<Text style={styles.inputLabel}>Điểm khởi hành</Text>
						<View style={styles.searchInputRow}>
							<TextInput
								style={styles.locationInput}
								placeholder='Nhập điểm khởi hành...'
								value={startLocation}
								onChangeText={setStartLocation}
								multiline={false}
								numberOfLines={1}
							/>
							<TouchableOpacity
								style={styles.searchButton}
								onPress={handleStartSearch}
								disabled={startSearching}
							>
								{startSearching ? (
									<ActivityIndicator size="small" color="#4285F4" />
								) : (
									<Ionicons name="search" size={20} color="#4285F4" />
								)}
							</TouchableOpacity>
						</View>

						{/* Start Suggestions */}
						{showStartSuggestions && startSuggestions.length > 0 && (
							<View style={styles.suggestionsList}>
								<View style={styles.suggestionsHeader}>
									<Text style={styles.suggestionsHeaderText}>Chọn địa điểm:</Text>
									<TouchableOpacity
										style={styles.closeSuggestions}
										onPress={() => setShowStartSuggestions(false)}
									>
										<Ionicons name="close" size={18} color="#666" />
									</TouchableOpacity>
								</View>
								<FlatList
									data={startSuggestions}
									keyExtractor={(item, index) => index.toString()}
									renderItem={({ item }) => (
										<TouchableOpacity
											style={styles.suggestionItem}
											onPress={() => handleStartSuggestionPress(item)}
											activeOpacity={0.7}
										>
											<Ionicons name="location" size={16} color="#666" />
											<Text style={styles.suggestionText} numberOfLines={2}>
												{item.place_name}
											</Text>
										</TouchableOpacity>
									)}
									showsVerticalScrollIndicator={false}
									keyboardShouldPersistTaps="handled"
								/>
							</View>
						)}
					</View>

					{/* End Location Input */}
					<View style={styles.inputSection}>
						<Text style={styles.inputLabel}>Điểm đến</Text>
						<View style={styles.searchInputRow}>
							<TextInput
								style={styles.locationInput}
								placeholder='Nhập điểm đến...'
								value={endLocation}
								onChangeText={setEndLocation}
								multiline={false}
								numberOfLines={1}
							/>
							<TouchableOpacity
								style={styles.searchButton}
								onPress={handleEndSearch}
								disabled={endSearching}
							>
								{endSearching ? (
									<ActivityIndicator size="small" color="#4285F4" />
								) : (
									<Ionicons name="search" size={20} color="#4285F4" />
								)}
							</TouchableOpacity>
						</View>

						{/* End Suggestions */}
						{showEndSuggestions && endSuggestions.length > 0 && (
							<View style={styles.suggestionsList}>
								<View style={styles.suggestionsHeader}>
									<Text style={styles.suggestionsHeaderText}>Chọn địa điểm:</Text>
									<TouchableOpacity
										style={styles.closeSuggestions}
										onPress={() => setShowEndSuggestions(false)}
									>
										<Ionicons name="close" size={18} color="#666" />
									</TouchableOpacity>
								</View>
								<FlatList
									data={endSuggestions}
									keyExtractor={(item, index) => index.toString()}
									renderItem={({ item }) => (
										<TouchableOpacity
											style={styles.suggestionItem}
											onPress={() => handleEndSuggestionPress(item)}
											activeOpacity={0.7}
										>
											<Ionicons name="location" size={16} color="#666" />
											<Text style={styles.suggestionText} numberOfLines={2}>
												{item.place_name}
											</Text>
										</TouchableOpacity>
									)}
									showsVerticalScrollIndicator={false}
									keyboardShouldPersistTaps="handled"
								/>
							</View>
						)}
					</View>

					{/* Maps for visualization */}
					{startCoordinates && (
						<View style={styles.mapContainer}>
							<Text style={styles.mapTitle}>📍 Điểm khởi hành</Text>
							<MapView
								provider={Platform.OS === 'android' && Constants.appOwnership !== 'expo' ? PROVIDER_GOOGLE : undefined}
								style={styles.map}
								region={{
									latitude: startCoordinates.lat,
									longitude: startCoordinates.lng,
									latitudeDelta: 0.01,
									longitudeDelta: 0.01,
								}}
							>
								{Platform.OS === 'android' && (
									<UrlTile urlTemplate="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png" maximumZ={19} flipY={false} />
								)}
								<Marker
									coordinate={{
										latitude: startCoordinates.lat,
										longitude: startCoordinates.lng,
									}}
									title='Điểm khởi hành'
									description={startLocation}
								/>
							</MapView>
						</View>
					)}

					{endCoordinates && (
						<View style={styles.mapContainer}>
							<Text style={styles.mapTitle}>🏁 Điểm đến</Text>
							<MapView
								provider={Platform.OS === 'android' && Constants.appOwnership !== 'expo' ? PROVIDER_GOOGLE : undefined}
								style={styles.map}
								region={{
									latitude: endCoordinates.lat,
									longitude: endCoordinates.lng,
									latitudeDelta: 0.01,
									longitudeDelta: 0.01,
								}}
							>
								{Platform.OS === 'android' && (
									<UrlTile urlTemplate="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png" maximumZ={19} flipY={false} />
								)}
								<Marker
									coordinate={{
										latitude: endCoordinates.lat,
										longitude: endCoordinates.lng,
									}}
									title='Điểm đến'
									description={endLocation}
								/>
							</MapView>
						</View>
					)}

					{/* Estimate Price Button */}
					{isFormValid() && (
						<TouchableOpacity
							style={[styles.estimateButton, estimating && styles.disabledButton]}
							onPress={handleEstimatePrice}
							disabled={estimating}
						>
							{estimating ? (
								<ActivityIndicator color='white' size='small' />
							) : (
								<Text style={styles.estimateButtonText}>💰 Ước tính giá</Text>
							)}
						</TouchableOpacity>
					)}

					{/* Estimated Price Display - Moved to VehicleTypeSelector */}

					{/* Route Information */}
					{estimatedPrice && (
						<RouteInfo
							estimatedTime={estimatedPrice.estimatedTime}
							distance={estimatedPrice.estimatedDistance}
							startLocation={startLocation}
							endLocation={endLocation}
							showDetails={true}
						/>
					)}

					{/* Navigation Button */}
					{isFormValid() && (
						<TouchableOpacity
							style={styles.navigationButton}
							onPress={() => {
								navigation.navigate('Navigation', {
									startLocation,
									endLocation,
									startCoordinates,
									endCoordinates,
								});
							}}
						>
							<Ionicons name="navigate" size={20} color="white" />
							<Text style={styles.navigationButtonText}>🗺️ Xem tuyến đường</Text>
						</TouchableOpacity>
					)}
				</View>

				{/* Date & Time */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>🕒 Thời gian khởi hành</Text>
					<View style={styles.dateTimeRow}>
						<TouchableOpacity style={styles.dateTimeButton} onPress={() => setShowDatePicker(true)}>
							<Ionicons name='calendar' size={20} color='#666' />
							<Text style={styles.dateTimeText}>{departureDate.toLocaleDateString('vi-VN')}</Text>
						</TouchableOpacity>

						<TouchableOpacity style={styles.dateTimeButton} onPress={() => setShowTimePicker(true)}>
							<Ionicons name='time' size={20} color='#666' />
							<Text style={styles.dateTimeText}>
								{departureTime.toLocaleTimeString('vi-VN', {
									hour: '2-digit',
									minute: '2-digit',
								})}
							</Text>
						</TouchableOpacity>
					</View>
				</View>

				{/* Vehicle Type Selector */}
				<View style={styles.section}>
					<VehicleTypeSelector
						vehicleTypes={vehicleTypes}
						selectedVehicleType={vehicleType}
						onVehicleTypeChange={handleVehicleTypeChange}
						estimatedPrice={estimatedPrice}
						onPriceUpdate={handlePriceUpdate}
					/>
				</View>

				{/* Additional Options */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>⚙️ Tùy chọn khác</Text>

					{/* Available Seats */}
					<View style={styles.inputSection}>
						<Text style={styles.inputLabel}>Số ghế cần</Text>
						<TextInput
							style={styles.textInput}
							value={availableSeats}
							onChangeText={setAvailableSeats}
							keyboardType='numeric'
							placeholder='Nhập số ghế cần'
						/>
					</View>

					{/* Max Price - Tự động tính từ giá ước tính */}
					{estimatedPrice && estimatedPrice.estimatedPrice && (
						<View style={styles.inputSection}>
							<Text style={styles.inputLabel}>Giá tối đa (VNĐ)</Text>
							<View style={styles.maxPriceDisplay}>
								<Text style={styles.maxPriceValue}>
									{Math.round(estimatedPrice.estimatedPrice * 1.2).toLocaleString('vi-VN')} VNĐ
								</Text>
								<Text style={styles.maxPriceNote}>
									(Tự động: 120% giá ước tính)
								</Text>
							</View>
						</View>
					)}

					{/* Recurring Trip */}
					<View style={styles.switchContainer}>
						<Text style={styles.switchLabel}>Chuyến đi định kỳ</Text>
						<Switch
							value={isRecurring}
							onValueChange={setIsRecurring}
							trackColor={{ false: '#E0E0E0', true: '#4285F4' }}
							thumbColor={isRecurring ? '#FFFFFF' : '#FFFFFF'}
						/>
					</View>

					{/* Notes */}
					<View style={styles.inputSection}>
						<Text style={styles.inputLabel}>Ghi chú</Text>
						<TextInput
							style={[styles.textInput, styles.textArea]}
							value={notes}
							onChangeText={setNotes}
							placeholder='Nhập ghi chú (tùy chọn)'
							multiline
							numberOfLines={3}
						/>
					</View>
				</View>

				{/* Create Button */}
				<TouchableOpacity
					style={[styles.createButton, (!isFormValid() || loading) && styles.disabledButton]}
					onPress={handleCreateBookingRequest}
					disabled={!isFormValid() || loading}
				>
					{loading ? (
						<ActivityIndicator color='white' size='small' />
					) : (
						<Text style={styles.createButtonText}>🚀 Tạo yêu cầu đặt xe</Text>
					)}
				</TouchableOpacity>
			</ScrollView>

			{/* Date/Time Pickers */}
			{showDatePicker && (
				<DateTimePicker
					value={departureDate}
					mode='date'
					display='default'
					onChange={onDateChange}
					minimumDate={new Date()}
				/>
			)}

			{showTimePicker && (
				<DateTimePicker value={departureTime} mode='time' display='default' onChange={onTimeChange} />
			)}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#F5F7FA',
	},
	header: {
		backgroundColor: '#4285F4',
		paddingTop: Platform.OS === 'ios' ? 44 : 25,
		paddingBottom: 16,
		paddingHorizontal: 16,
		flexDirection: 'row',
		alignItems: 'center',
	},
	backButton: {
		marginRight: 16,
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: 'white',
	},
	content: {
		flex: 1,
		padding: 16,
	},
	locationContainer: {
		backgroundColor: 'white',
		borderRadius: 12,
		padding: 16,
		marginBottom: 16,
	},
	section: {
		backgroundColor: 'white',
		borderRadius: 12,
		padding: 16,
		marginBottom: 16,
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: '600',
		color: '#333',
		marginBottom: 12,
	},
	inputSection: {
		marginBottom: 16,
	},
	inputLabel: {
		fontSize: 14,
		fontWeight: '500',
		color: '#666',
		marginBottom: 8,
	},
	// Location Input styles
	locationInputContainer: {
		position: 'relative',
		zIndex: 1000,
	},
	searchInputRow: {
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: '#E0E0E0',
		borderRadius: 8,
		backgroundColor: '#FFF',
	},
	locationInput: {
		flex: 1,
		height: 44,
		paddingHorizontal: 12,
		fontSize: 16,
	},
	searchButton: {
		padding: 12,
		borderLeftWidth: 1,
		borderLeftColor: '#E0E0E0',
	},
	suggestionsList: {
		position: 'absolute',
		top: 46,
		left: 0,
		right: 0,
		backgroundColor: 'white',
		borderWidth: 1,
		borderColor: '#E0E0E0',
		borderRadius: 8,
		maxHeight: 250,
		zIndex: 1001,
		elevation: 5,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
	},
	suggestionsHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: 12,
		borderBottomWidth: 1,
		borderBottomColor: '#F0F0F0',
		backgroundColor: '#F8F9FA',
	},
	suggestionsHeaderText: {
		fontSize: 12,
		fontWeight: '500',
		color: '#666',
	},
	closeSuggestions: {
		padding: 4,
	},
	suggestionItem: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 12,
		borderBottomWidth: 1,
		borderBottomColor: '#F0F0F0',
	},
	suggestionText: {
		fontSize: 14,
		color: '#333',
		marginLeft: 8,
		flex: 1,
	},
	mapContainer: {
		marginBottom: 12,
	},
	mapTitle: {
		fontSize: 14,
		fontWeight: '500',
		color: '#666',
		marginBottom: 8,
	},
	map: {
		height: 120,
		borderRadius: 12,
	},
	textInput: {
		height: 44,
		borderWidth: 1,
		borderColor: '#E0E0E0',
		borderRadius: 8,
		paddingHorizontal: 12,
		fontSize: 16,
		backgroundColor: '#FFF',
	},
	textArea: {
		height: 80,
		paddingTop: 12,
		paddingBottom: 12,
		textAlignVertical: 'top',
	},
	switchContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 16,
	},
	switchLabel: {
		fontSize: 14,
		fontWeight: '500',
		color: '#666',
	},
	estimateButton: {
		backgroundColor: '#34A853',
		padding: 14,
		borderRadius: 8,
		alignItems: 'center',
		marginTop: 8,
	},
	estimateButtonText: {
		color: 'white',
		fontSize: 14,
		fontWeight: '600',
	},
	priceContainer: {
		backgroundColor: '#F8F9FA',
		padding: 12,
		borderRadius: 8,
		marginTop: 8,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	priceLabel: {
		fontSize: 14,
		fontWeight: '500',
		color: '#666',
	},
	priceValue: {
		fontSize: 16,
		fontWeight: '600',
		color: '#34A853',
	},
	dateTimeRow: {
		flexDirection: 'row',
		gap: 12,
	},
	dateTimeButton: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#F5F7FA',
		padding: 12,
		borderRadius: 8,
	},
	dateTimeText: {
		marginLeft: 8,
		fontSize: 14,
		color: '#333',
	},
	// Vehicle type styles moved to VehicleTypeSelector component
	maxPriceDisplay: {
		backgroundColor: '#F8F9FA',
		padding: 12,
		borderRadius: 8,
		alignItems: 'center',
	},
	maxPriceValue: {
		fontSize: 18,
		fontWeight: '700',
		color: '#34A853',
		marginBottom: 4,
	},
	maxPriceNote: {
		fontSize: 12,
		color: '#999',
		textAlign: 'center',
	},
	createButton: {
		backgroundColor: '#4285F4',
		padding: 16,
		borderRadius: 12,
		alignItems: 'center',
		marginBottom: 32,
	},
	disabledButton: {
		opacity: 0.6,
	},
	createButtonText: {
		color: 'white',
		fontSize: 16,
		fontWeight: '600',
	},
	navigationButton: {
		backgroundColor: '#FF6B35',
		padding: 12,
		borderRadius: 8,
		alignItems: 'center',
		marginTop: 8,
		flexDirection: 'row',
		justifyContent: 'center',
		gap: 8,
	},
	navigationButtonText: {
		color: 'white',
		fontSize: 14,
		fontWeight: '600',
	},
});