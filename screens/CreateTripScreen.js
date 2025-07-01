import React, { useState, useEffect } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import { createBookingRequest, estimatePrice, getVehicleTypes } from "../api/tripsApi";
import { useAuth } from "../context/AuthContext";

export default function CreateTripScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [estimating, setEstimating] = useState(false);

  // Form data - Auto-filled for testing
  const [startLocation, setStartLocation] = useState("Nhà Tao 22, TP HCM");
  const [endLocation, setEndLocation] = useState("Nhà mài 222, TP HCM");
  const [startCoordinates, setStartCoordinates] = useState({ lat: 10.7631, lng: 106.6814 });
  const [endCoordinates, setEndCoordinates] = useState({ lat: 10.7951, lng: 106.7218 });
  
  // Set future date/time - 1 hour from now
  const futureDateTime = new Date(Date.now() + 60 * 60 * 1000);
  const [departureDate, setDepartureDate] = useState(futureDateTime);
  const [departureTime, setDepartureTime] = useState(futureDateTime);
  
  const [availableSeats, setAvailableSeats] = useState("1");
  const [notes, setNotes] = useState("Cần xe có điều hòa");
  const [vehicleType, setVehicleType] = useState("car");
  const [estimatedPrice, setEstimatedPrice] = useState(null);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [maxPrice, setMaxPrice] = useState("100000");

  // Date/Time picker states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    loadVehicleTypes();
  }, []);

  const loadVehicleTypes = async () => {
    try {
      const response = await getVehicleTypes();
      if (response.success && response.data) {
        const typesArray = Object.keys(response.data).map(key => ({
          key,
          ...response.data[key]
        }));
        setVehicleTypes(typesArray);
      }
    } catch (error) {
      console.error("Error loading vehicle types:", error);
    }
  };

  // Mock function to get coordinates from address
  const getCoordinatesFromAddress = (address) => {
    const mockCoordinates = {
      // Hà Nội addresses
      "24 Chùa Láng, P. Láng Thượng, Đống Đa, Hà Nội": { lat: 21.0285, lng: 105.8542 },
      "46 Nguyễn Trường Tộ, Trúc Bạch, Ba Đình, Hà Nội": { lat: 21.0245, lng: 105.8412 },
      "53 Hào Nam, Ô Chợ Dừa, Đống Đa, Hà Nội": { lat: 21.0167, lng: 105.8448 },
      "168 Lương Định Của, Kim Liên, Đống Đa, Hà Nội": { lat: 21.0178, lng: 105.8398 },
      
      // TP HCM addresses
      "Nhà Tao, TP HCM": { lat: 10.7631, lng: 106.6814 },
      "Nhà mài, TP HCM": { lat: 10.7951, lng: 106.7218 },
      "Đại học Sài Gòn, Q5, TP HCM": { lat: 10.7595, lng: 106.6782 },
      "Quận 1, TP HCM": { lat: 10.7769, lng: 106.7009 },
      "Sân bay Tân Sơn Nhất, TP HCM": { lat: 10.8231, lng: 106.6297 },
      "Bến xe Miền Đông, TP HCM": { lat: 10.8142, lng: 106.7317 },
      "Chợ Bến Thành, TP HCM": { lat: 10.7722, lng: 106.6980 },
    };
    
    const coords = mockCoordinates[address] || { lat: 10.7631, lng: 106.6814 }; // Default TP HCM
    console.log('📍 getCoordinatesFromAddress:', address, '→', coords);
    return coords;
  };

  const handleEstimatePrice = async () => {
    if (!startCoordinates || !endCoordinates) {
      Alert.alert("Lỗi", "Vui lòng chọn điểm đi và điểm đến");
      return;
    }

    try {
      setEstimating(true);
      const priceData = {
        startLocation: { coordinates: startCoordinates },
        endLocation: { coordinates: endCoordinates },
        departureTime: combineDateAndTime(departureDate, departureTime),
        vehicleType
      };

      const response = await estimatePrice(priceData);
      setEstimatedPrice(response.data);
    } catch (error) {
      Alert.alert("Lỗi", error.message || "Không thể ước tính giá");
    } finally {
      setEstimating(false);
    }
  };

  const handleCreateBookingRequestWithTestData = async () => {
    console.log('🧪 Creating booking request with TEST DATA...');
    
    try {
      setLoading(true);
      
      // Hard-coded test data matching your format
      const testBookingData = {
        startLocation: {
          address: "Nhà Tao 1111, TP HCM",
          coordinates: {
            type: "Point",
            coordinates: [106.6814, 10.7631] // [longitude, latitude]
          }
        },
        endLocation: {
          address: "Nhà mài 1111, TP HCM", 
          coordinates: {
            type: "Point",
            coordinates: [106.7218, 10.7951] // [longitude, latitude]
          }
        },
        departureTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        estimatedArrivalTime: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours from now
        preferredVehicleType: "car",
        maxPrice: 100000,
        availableSeats: 1,
        requestNote: "Cần đi gấp, tôi sẽ chờ ở tầng 1",
        currency: "VND",
        notes: "Cần xe có điều hòa",
        stops: [
          {
            address: "Đại học Sài Gòn, Q5, TP HCM",
            coordinates: {
              type: "Point",
              coordinates: [106.6782, 10.7595] // [longitude, latitude]
            },
            estimatedArrivalTime: new Date(Date.now() + 2.5 * 60 * 60 * 1000)
          }
        ],
        recurring: {
          isRecurring: false,
          pattern: "daily",
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
        }
      };

      console.log('🚗 Creating booking request with TEST data:', {
        ...testBookingData,
        departureTime: testBookingData.departureTime.toISOString(),
        estimatedArrivalTime: testBookingData.estimatedArrivalTime.toISOString(),
      });

      console.log('📡 Calling createBookingRequest API...');
      const response = await createBookingRequest(testBookingData);
      console.log('✅ TEST API Response:', response);
      console.log('🔍 Response structure:', {
        success: response?.success,
        hasData: !!response?.data,
        hasTripId: !!response?.data?._id,
        tripId: response?.data?._id
      });

      // Check if response is valid before navigation - VERY STRICT
      if (response && 
          response.success === true && 
          response.data && 
          response.data._id && 
          typeof response.data._id === 'string' &&
          response.data._id.length > 0) {
        const tripId = response.data._id;
        
        // Safely extract booking info with fallback
        const bookingInfo = response.pricing ? {
          estimatedPrice: response.pricing.estimatedPrice,
          maxPrice: response.pricing.maxPrice,
          preferredVehicleType: response.pricing.preferredVehicleType || 'car',
          currency: response.pricing.currency || 'VND',
          breakdown: response.pricing.breakdown
        } : {
          estimatedPrice: testBookingData.maxPrice || 100000,
          maxPrice: testBookingData.maxPrice || 100000,
          preferredVehicleType: testBookingData.preferredVehicleType || 'car',
          currency: 'VND',
          breakdown: null
        };
        
        console.log('🚀 Navigating to WaitingForDriver with:', { tripId, bookingInfo });
        console.log('🔍 tripId type:', typeof tripId, 'value:', tripId);
        console.log('💰 bookingInfo:', bookingInfo);
        
        // Navigate first
        navigation.navigate("WaitingForDriver", { 
          tripId: tripId,
          bookingInfo: bookingInfo,
          tripData: response.data // Pass full trip data as backup
        });
        
        // Then show success message
        setTimeout(() => {
          Alert.alert(
            "TEST thành công! 🎉", 
            "Yêu cầu đặt xe TEST đã được tạo! Đang chờ tài xế phản hồi.",
            [{ text: "OK" }]
          );
        }, 500);
      } else {
        console.log('❌ Invalid API response:', response);
        console.log('❌ Response validation failed:', {
          hasResponse: !!response,
          success: response?.success,
          hasData: !!response?.data,
          hasTripId: !!response?.data?._id,
          tripIdType: typeof response?.data?._id,
          tripIdValue: response?.data?._id
        });
        
        Alert.alert(
          "❌ KHÔNG TẠO ĐƯỢC CHUYẾN ĐI!", 
          `Phản hồi từ server không hợp lệ:\n\n` +
          `• Success: ${response?.success}\n` +
          `• Has Data: ${!!response?.data}\n` +
          `• Trip ID: ${response?.data?._id || 'null'}\n\n` +
          `🚫 APP KHÔNG ĐƯỢC CHUYỂN TRANG!\n` +
          `📞 Kiểm tra backend server có chạy không?`
        );
      }
    } catch (error) {
      console.error('❌ Create TEST booking request error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack
      });
      
      // More specific error messages
      let errorMessage = "Không thể tạo yêu cầu đặt xe TEST";
      
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        errorMessage = "🌐 BACKEND CHƯA CHẠY!\n\n" +
                      "🔧 Hãy start backend server:\n" +
                      "cd carpooling-be && npm start\n\n" +
                      "🚫 KHÔNG TẠO ĐƯỢC CHUYẾN ĐI!";
      } else if (error.response?.status === 500) {
        errorMessage = "🔥 Lỗi server - Backend có vấn đề\n🚫 KHÔNG TẠO ĐƯỢC CHUYẾN ĐI!";
      } else if (error.response?.status === 401) {
        errorMessage = "🔐 Lỗi xác thực - Vui lòng đăng nhập lại\n🚫 KHÔNG TẠO ĐƯỢC CHUYẾN ĐI!";
      } else if (error.response?.data?.message) {
        errorMessage = `📝 ${error.response.data.message}\n🚫 KHÔNG TẠO ĐƯỢC CHUYẾN ĐI!`;
      } else if (error.message) {
        errorMessage = `⚠️ ${error.message}\n🚫 KHÔNG TẠO ĐƯỢC CHUYẾN ĐI!`;
      }
      
      Alert.alert("Lỗi TEST", errorMessage);
    } finally {
      setLoading(false);

    }
  };

  const handleCreateBookingRequest = async () => {
    console.log('🔍 Starting validation checks...');
    
    // Debug current values
    console.log('📋 Current form values:', {
      startLocation,
      endLocation,
      startCoordinates,
      endCoordinates,
      availableSeats,
      maxPrice,
      departureDate: departureDate.toISOString(),
      departureTime: departureTime.toISOString(),
    });
    
    // Validation
    if (!startLocation || !endLocation || !startCoordinates || !endCoordinates) {
      console.log('❌ Location validation failed');
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ điểm đi và điểm đến");
      return;
    }

    if (!availableSeats || parseInt(availableSeats) <= 0 || parseInt(availableSeats) > 8) {
      console.log('❌ Seats validation failed');
      Alert.alert("Lỗi", "Vui lòng nhập số chỗ cần đặt hợp lệ (1-8 chỗ)");
      return;
    }

    if (maxPrice && parseInt(maxPrice) <= 0) {
      console.log('❌ Price validation failed');
      Alert.alert("Lỗi", "Giá tối đa phải lớn hơn 0");
      return;
    }

    // Check if departure time is in the future
    const departureDateTime = combineDateAndTime(departureDate, departureTime);
    const now = new Date();
    console.log('⏰ Time check:', {
      departureDateTime: departureDateTime.toISOString(),
      now: now.toISOString(),
      isInFuture: departureDateTime > now
    });
    
    if (departureDateTime <= now) {
      console.log('❌ Time validation failed');
      Alert.alert("Lỗi", `Thời gian khởi hành phải trong tương lai.\nHiện tại: ${now.toLocaleString('vi-VN')}\nĐã chọn: ${departureDateTime.toLocaleString('vi-VN')}`);
      return;
    }
    
    console.log('✅ All validations passed!');

    try {
      setLoading(true);
      
      const departureDateTime = combineDateAndTime(departureDate, departureTime);
      
      // Calculate estimated arrival time based on distance and traffic
      let estimatedDurationMinutes = 60; // Default 1 hour
      if (estimatedPrice?.distance) {
        // Base calculation: 30km/h average speed in city traffic
        const avgSpeedKmh = 30;
        estimatedDurationMinutes = Math.ceil((estimatedPrice.distance / avgSpeedKmh) * 60);
        
        // Add buffer time for traffic and stops
        estimatedDurationMinutes += 15; // 15 minutes buffer
        
        // Minimum 15 minutes, maximum 4 hours
        estimatedDurationMinutes = Math.max(15, Math.min(240, estimatedDurationMinutes));
      }
      
      const estimatedArrivalDateTime = new Date(
        departureDateTime.getTime() + estimatedDurationMinutes * 60 * 1000
      );
      
      const bookingData = {
        startLocation: {
          address: startLocation,
          coordinates: {
            type: "Point",
            coordinates: [startCoordinates.lng, startCoordinates.lat] // [longitude, latitude]
          }
        },
        endLocation: {
          address: endLocation,
          coordinates: {
            type: "Point", 
            coordinates: [endCoordinates.lng, endCoordinates.lat] // [longitude, latitude]
          }
        },
        departureTime: departureDateTime,
        estimatedArrivalTime: estimatedArrivalDateTime,
        availableSeats: parseInt(availableSeats),
        notes: notes.trim(), // General notes for trip
        requestNote: notes.trim(), // Specific message for drivers
        preferredVehicleType: vehicleType,
        maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
        currency: "VND",
        stops: [], // Empty array for now, can be enhanced later 
        // Note: When adding stops, use format:
        // { address: "...", coordinates: { type: "Point", coordinates: [lng, lat] } }
        recurring: {
          isRecurring,
          pattern: isRecurring ? "daily" : undefined,
          endDate: isRecurring ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : undefined // 1 year from now
        }
      };

      console.log('🚗 Creating booking request with data:', {
        ...bookingData,
        departureTime: bookingData.departureTime.toISOString(),
        estimatedArrivalTime: bookingData.estimatedArrivalTime.toISOString(),
        estimatedDurationMinutes
      });

      console.log('📡 Calling createBookingRequest API...');
      const response = await createBookingRequest(bookingData);
      console.log('✅ API Response:', response);

      // Check if response is valid before navigation
      if (response && response.success && response.data && response.data._id) {
        const tripId = response.data._id;
        
        // Safely extract booking info with fallback
        const bookingInfo = response.pricing ? {
          estimatedPrice: response.pricing.estimatedPrice,
          maxPrice: response.pricing.maxPrice,
          preferredVehicleType: response.pricing.preferredVehicleType || 'car',
          currency: response.pricing.currency || 'VND',
          breakdown: response.pricing.breakdown
        } : {
          estimatedPrice: maxPrice ? parseInt(maxPrice) : 100000,
          maxPrice: maxPrice ? parseInt(maxPrice) : 100000,
          preferredVehicleType: vehicleType || 'car',
          currency: 'VND',
          breakdown: null
        };
        
        console.log('🚀 Navigating to WaitingForDriver with:', { tripId, bookingInfo });
        console.log('🔍 tripId type:', typeof tripId, 'value:', tripId);
        console.log('💰 bookingInfo:', bookingInfo);
        
        // Navigate first
        navigation.navigate("WaitingForDriver", { 
          tripId: tripId,
          bookingInfo: bookingInfo,
          tripData: response.data // Pass full trip data as backup
        });
        
        // Then show success message
        setTimeout(() => {
          Alert.alert(
            "Thành công! 🎉", 
            "Yêu cầu đặt xe đã được tạo! Đang chờ tài xế phản hồi.",
            [{ text: "OK" }]
          );
        }, 500);
      } else {
        console.log('❌ Invalid API response:', response);
        Alert.alert("Lỗi", "Phản hồi từ server không hợp lệ");
      }
    } catch (error) {
      console.error('❌ Create booking request error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack
      });
      
      const errorMessage = error.response?.data?.message || error.message || "Không thể tạo yêu cầu đặt xe";
      Alert.alert("Lỗi", errorMessage);
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đặt xe</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Location Inputs */}
        <View style={styles.locationContainer}>
          <View style={styles.inputRow}>
            <Ionicons name="radio-button-on" size={20} color="#4285F4" />
            <TextInput
              style={styles.locationInput}
              placeholder="Điểm khởi hành"
              value={startLocation}
              onChangeText={(text) => {
                setStartLocation(text);
                setStartCoordinates(getCoordinatesFromAddress(text));
              }}
            />
          </View>
          
          <View style={styles.inputRow}>
            <Ionicons name="location" size={20} color="#FF5722" />
            <TextInput
              style={styles.locationInput}
              placeholder="Điểm đến"
              value={endLocation}
              onChangeText={(text) => {
                setEndLocation(text);
                setEndCoordinates(getCoordinatesFromAddress(text));
              }}
            />
          </View>
        </View>

        {/* Date & Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thời gian khởi hành</Text>
          <View style={styles.dateTimeRow}>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar" size={20} color="#666" />
              <Text style={styles.dateTimeText}>
                {departureDate.toLocaleDateString('vi-VN')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Ionicons name="time" size={20} color="#666" />
              <Text style={styles.dateTimeText}>
                {departureTime.toLocaleTimeString('vi-VN', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Available Seats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Số chỗ cần đặt</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập số chỗ cần đặt"
            value={availableSeats}
            onChangeText={setAvailableSeats}
            keyboardType="numeric"
          />
        </View>

        {/* Max Price */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Giá tối đa (VND)</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập giá tối đa bạn chấp nhận (tùy chọn)"
            value={maxPrice}
            onChangeText={setMaxPrice}
            keyboardType="numeric"
          />
          {estimatedPrice && (
            <Text style={styles.priceHint}>
              Giá ước tính: {estimatedPrice.estimatedPrice?.toLocaleString('vi-VN')} VND
            </Text>
          )}
        </View>

        {/* Vehicle Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Loại xe</Text>
          <View style={styles.vehicleTypes}>
            {vehicleTypes.map((vehicle) => (
              <TouchableOpacity
                key={vehicle.key}
                style={[
                  styles.vehicleTypeButton,
                  vehicleType === vehicle.key && styles.vehicleTypeActive
                ]}
                onPress={() => setVehicleType(vehicle.key)}
              >
                <Text style={[
                  styles.vehicleTypeText,
                  vehicleType === vehicle.key && styles.vehicleTypeTextActive
                ]}>
                  {vehicle.name}
                </Text>
                <Text style={[
                  styles.vehicleTypePrice,
                  vehicleType === vehicle.key && styles.vehicleTypePriceActive
                ]}>
                  {vehicle.baseRate?.toLocaleString('vi-VN')} VND/km
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Price Estimation */}
        <View style={styles.section}>
          <View style={styles.priceHeader}>
            <Text style={styles.sectionTitle}>Ước tính giá</Text>
            <TouchableOpacity
              style={styles.estimateButton}
              onPress={handleEstimatePrice}
              disabled={estimating}
            >
              {estimating ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.estimateButtonText}>Tính giá</Text>
              )}
            </TouchableOpacity>
          </View>
          
          {estimatedPrice && (
            <View style={styles.priceResult}>
              <Text style={styles.priceValue}>
                {estimatedPrice.estimatedPrice?.toLocaleString('vi-VN')} VND
              </Text>
              <Text style={styles.priceDistance}>
                Khoảng cách: {estimatedPrice.distance} km
              </Text>
            </View>
          )}
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ghi chú (tùy chọn)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Thêm ghi chú về chuyến đi..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Recurring */}
        <TouchableOpacity
          style={styles.recurringContainer}
          onPress={() => setIsRecurring(!isRecurring)}
        >
          <Ionicons
            name={isRecurring ? "checkbox" : "square-outline"}
            size={20}
            color="#4285F4"
          />
          <Text style={styles.recurringText}>Lặp lại hàng ngày</Text>
        </TouchableOpacity>

        {/* Debug Info */}
        <View style={styles.debugContainer}>
          <Text style={styles.debugTitle}>🔍 Debug Info</Text>
          <Text style={styles.debugText}>Start: {startLocation} {startCoordinates ? '✅' : '❌'}</Text>
          <Text style={styles.debugText}>End: {endLocation} {endCoordinates ? '✅' : '❌'}</Text>
          <Text style={styles.debugText}>Seats: {availableSeats}</Text>
          <Text style={styles.debugText}>Time: {departureDate.toLocaleString('vi-VN')}</Text>
          <Text style={styles.debugText}>Max Price: {maxPrice || 'Not set'}</Text>
        </View>

        {/* Backend Status Check */}
        <TouchableOpacity
          style={[styles.checkButton, loading && styles.disabledButton]}
          onPress={async () => {
            try {
              setLoading(true);
              console.log('🔍 Checking backend status...');
              const response = await fetch('http://192.168.2.68:5000/api/trips/vehicle-types');
              
              if (response.ok) {
                const data = await response.json();
                Alert.alert("✅ Backend OK!", "Backend server đang chạy bình thường");
                console.log('✅ Backend response:', data);
              } else {
                Alert.alert("❌ Backend Error", `Status: ${response.status}`);
              }
            } catch (error) {
              console.log('❌ Backend check error:', error);
              Alert.alert(
                "🚨 Backend KHÔNG chạy!", 
                "Hãy start backend:\ncd carpooling-be && npm start"
              );
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.checkButtonText}>🔍 Kiểm tra Backend</Text>
          )}
        </TouchableOpacity>

        {/* Test Button */}
        <TouchableOpacity
          style={[styles.testButton, loading && styles.disabledButton]}
          onPress={handleCreateBookingRequestWithTestData}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.testButtonText}>🧪 Test với data mẫu</Text>
          )}
        </TouchableOpacity>

        {/* Create Button */}
        <TouchableOpacity
          style={[styles.createButton, loading && styles.disabledButton]}
          onPress={handleCreateBookingRequest}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.createButtonText}>Tạo yêu cầu đặt xe</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Date/Time Pickers */}
      {showDatePicker && (
        <DateTimePicker
          value={departureDate}
          mode="date"
          display="default"
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={departureTime}
          mode="time"
          display="default"
          onChange={onTimeChange}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    backgroundColor: "#4285F4",
    paddingTop: Platform.OS === "ios" ? 44 : 25,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  locationContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  locationInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  section: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  dateTimeRow: {
    flexDirection: "row",
    gap: 12,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
    padding: 12,
    borderRadius: 8,
  },
  dateTimeText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  vehicleTypes: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  vehicleTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    backgroundColor: "#F5F7FA",
    minWidth: 120,
  },
  vehicleTypeActive: {
    backgroundColor: "#4285F4",
    borderColor: "#4285F4",
  },
  vehicleTypeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    textAlign: "center",
  },
  vehicleTypeTextActive: {
    color: "white",
  },
  vehicleTypePrice: {
    fontSize: 11,
    color: "#999",
    textAlign: "center",
    marginTop: 4,
  },
  vehicleTypePriceActive: {
    color: "rgba(255,255,255,0.8)",
  },
  priceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  estimateButton: {
    backgroundColor: "#FF9800",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  estimateButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  priceResult: {
    backgroundColor: "#E8F5E8",
    padding: 12,
    borderRadius: 8,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1B5E20",
  },
  priceDistance: {
    fontSize: 12,
    color: "#4CAF50",
    marginTop: 4,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    height: 80,
    textAlignVertical: "top",
  },
  recurringContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  recurringText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#333",
  },
  checkButton: {
    backgroundColor: "#9C27B0",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  checkButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  testButton: {
    backgroundColor: "#FF9800",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  testButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  createButton: {
    backgroundColor: "#4285F4",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 32,
  },
  disabledButton: {
    opacity: 0.6,
  },
  createButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  priceHint: {
    fontSize: 12,
    color: "#666",
    marginTop: 8,
    fontStyle: "italic",
  },
  debugContainer: {
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
}); 