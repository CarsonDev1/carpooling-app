import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { getAvailableBookings, driverRequestBooking, getTripById } from "../api/tripsApi";
import { useAuth } from "../context/AuthContext";

export default function DriverRequestsScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [requestingBooking, setRequestingBooking] = useState(null);
  
  // Modal states
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [proposedPrice, setProposedPrice] = useState("");
  const [driverMessage, setDriverMessage] = useState("");

  // Check user role when screen focuses
  useFocusEffect(
    React.useCallback(() => {
      checkDriverRole();
    }, [user])
  );

  useEffect(() => {
    if (isUserDriver()) {
      loadAvailableBookings();
    }
  }, [user]);

  const isUserDriver = () => {
    // Only users with pure "driver" role can access
    // "both" role users must register as driver first
    // Also check if they have vehicle information
    return user && 
           user.role === 'driver' && 
           user.vehicle && 
           user.vehicle.licensePlate;
  };

  const checkDriverRole = () => {
    if (!user) {
      // User not logged in, redirect to login
      navigation.replace('Login');
      return;
    }

    console.log('🔍 Driver Role Check:', {
      userId: user._id,
      role: user.role,
      isActive: user.isActive,
      registrationStep: user.registrationStep,
      hasVehicle: !!user.vehicle,
      licensePlate: user.vehicle?.licensePlate
    });

    // Check if registration is complete
    if (!user.isActive || user.registrationStep < 3) {
      Alert.alert(
        "Hoàn tất đăng ký",
        "Bạn cần hoàn tất quá trình đăng ký tài khoản trước khi sử dụng tính năng này.",
        [
          {
            text: "OK", 
            onPress: () => navigation.goBack()
          }
        ]
      );
      return;
    }

    if (!isUserDriver()) {
      // User is not a complete driver, show registration prompt
      let message = "";
      
      if (user.role !== 'driver') {
        message = user.role === 'both' 
          ? "Bạn cần chuyển đổi và đăng ký thành tài xế chuyên nghiệp để xem các yêu cầu đặt xe. Bạn có muốn đăng ký ngay không?"
          : "Bạn cần đăng ký làm tài xế để xem các yêu cầu đặt xe. Bạn có muốn đăng ký ngay không?";
      } else if (!user.vehicle || !user.vehicle.licensePlate) {
        message = "Bạn cần hoàn tất thông tin xe để có thể nhận chuyến. Bạn có muốn cập nhật thông tin xe ngay không?";
      }
        
      Alert.alert(
        "Đăng ký làm tài xế",
        message,
        [
          {
            text: "Để sau",
            style: "cancel",
            onPress: () => navigation.goBack()
          },
          {
            text: "Đăng ký ngay",
            onPress: () => navigation.navigate('DriverRegistration')
          }
        ]
      );
      return;
    }
  };

  const loadAvailableBookings = async () => {
    try {
      setLoading(true);
      
      const response = await getAvailableBookings({
        status: 'pending_driver',
        limit: 100, // Increased limit to show more
        includePast: false // Only future trips
      });
      
      if (response.success) {
        // Show ALL available bookings without filtering
        // Include both new requests and ones the driver already applied to
        setBookings(response.data);
      }
    } catch (error) {
      console.error("Load bookings error:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách yêu cầu đặt xe");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAvailableBookings();
    setRefreshing(false);
  };

  const handleRequestBooking = (booking) => {
    setSelectedBooking(booking);
    setProposedPrice("");
    setDriverMessage("");
    setShowRequestModal(true);
  };

  const submitDriverRequest = async () => {
    if (!proposedPrice) {
      Alert.alert("Lỗi", "Vui lòng nhập giá đề xuất");
      return;
    }

    const price = parseInt(proposedPrice);
    if (isNaN(price) || price <= 0) {
      Alert.alert("Lỗi", "Giá đề xuất không hợp lệ");
      return;
    }

    if (selectedBooking.maxPrice && price > selectedBooking.maxPrice) {
      Alert.alert(
        "Giá vượt quá ngân sách",
        `Giá đề xuất (${price.toLocaleString('vi-VN')}đ) vượt quá ngân sách tối đa của khách (${selectedBooking.maxPrice.toLocaleString('vi-VN')}đ). Bạn có muốn tiếp tục?`,
        [
          { text: "Hủy", style: "cancel" },
          { text: "Tiếp tục", onPress: () => doSubmitRequest(price) }
        ]
      );
      return;
    }

    doSubmitRequest(price);
  };

  const doSubmitRequest = async (price) => {
    try {
      setRequestingBooking(selectedBooking._id);
      setShowRequestModal(false);
      
      const requestData = {
        proposedPrice: price,
        message: driverMessage.trim()
      };
      
      await driverRequestBooking(selectedBooking._id, requestData);
      
      Alert.alert(
        "Thành công! 🎉",
        "Yêu cầu của bạn đã được gửi. Hành khách sẽ xem xét và phản hồi sớm!",
        [
          {
            text: "OK",
            onPress: () => loadAvailableBookings() // Refresh list
          }
        ]
      );
    } catch (error) {
      Alert.alert("Lỗi", error.message || "Không thể gửi yêu cầu");
    } finally {
      setRequestingBooking(null);
    }
  };

  const calculateDistance = (booking) => {
    // Simple distance calculation - in real app, use geolocation APIs
    if (booking.startLocation?.coordinates && booking.endLocation?.coordinates) {
      const start = booking.startLocation.coordinates.coordinates;
      const end = booking.endLocation.coordinates.coordinates;
      
      // Simple distance formula (approximate)
      const dLat = Math.abs(end[1] - start[1]) * 111; // 1 degree ≈ 111km
      const dLng = Math.abs(end[0] - start[0]) * 111 * Math.cos(start[1] * Math.PI / 180);
      return Math.sqrt(dLat * dLat + dLng * dLng).toFixed(1);
    }
    
    return (Math.random() * 15 + 2).toFixed(1); // Fallback: 2-17km
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    let timeLabel = "";
    if (diffHours < 24) {
      timeLabel = "Hôm nay";
    } else if (diffHours < 48) {
      timeLabel = "Ngày mai";
    } else {
      timeLabel = date.toLocaleDateString('vi-VN');
    }
    
    const time = date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    return { date: timeLabel, time };
  };

  const getTimeUntilDeparture = (dateString) => {
    const now = new Date();
    const departure = new Date(dateString);
    const diffHours = (departure.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 1) {
      return "Sắp khởi hành";
    } else if (diffHours < 24) {
      return `${Math.round(diffHours)} giờ nữa`;
    } else {
      return `${Math.round(diffHours / 24)} ngày nữa`;
    }
  };

  const renderBookingItem = ({ item }) => {
    const { date, time } = formatDateTime(item.departureTime);
    const distance = calculateDistance(item);
    const timeUntil = getTimeUntilDeparture(item.departureTime);
    const hasMaxPrice = item.maxPrice && item.maxPrice > 0;
    
    // Check if current driver already requested this booking
    const hasMyRequest = item.driverRequests?.some(
      req => req.driver === user._id || req.driver._id === user._id
    );
    const myRequest = item.driverRequests?.find(
      req => req.driver === user._id || req.driver._id === user._id
    );

    return (
      <View style={styles.bookingCard}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.timeInfo}>
            <Text style={styles.timeText}>{time}</Text>
            <Text style={styles.dateText}>{date}</Text>
          </View>
          <View style={styles.distanceInfo}>
            <Ionicons name="location" size={16} color="#4285F4" />
            <Text style={styles.distanceText}>{distance}km</Text>
          </View>
        </View>

        {/* Route */}
        <View style={styles.routeContainer}>
          <View style={styles.routePoint}>
            <Ionicons name="radio-button-on" size={16} color="#4285F4" />
            <Text style={styles.addressText} numberOfLines={2}>
              {item.startLocation?.address}
            </Text>
          </View>
          <View style={styles.routeLine} />
          <View style={styles.routePoint}>
            <Ionicons name="location" size={16} color="#FF5722" />
            <Text style={styles.addressText} numberOfLines={2}>
              {item.endLocation?.address}
            </Text>
          </View>
        </View>

        {/* Passenger Info */}
        <View style={styles.passengerSection}>
          <View style={styles.passengerInfo}>
            <View style={styles.passengerAvatar}>
              {item.requestedBy?.avatar ? (
                <Image 
                  source={{ uri: item.requestedBy.avatar }} 
                  style={styles.avatarImage}
                />
              ) : (
                <Ionicons name="person" size={20} color="#666" />
              )}
            </View>
            <View style={styles.passengerDetails}>
              <Text style={styles.passengerName}>
                {item.requestedBy?.fullName || 'Hành khách'}
              </Text>
              <Text style={styles.passengerPhone}>
                {item.requestedBy?.phone}
              </Text>
              {item.requestedBy?.rating?.asPassenger && (
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={12} color="#FFD700" />
                  <Text style={styles.ratingText}>
                    {item.requestedBy.rating.asPassenger.average || '5.0'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Trip Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Ionicons name="people-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              {item.availableSeats} chỗ cần đặt
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="car-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              Xe {item.preferredVehicleType === 'motorcycle' ? 'máy' : 
                  item.preferredVehicleType === 'suv' ? 'SUV' :
                  item.preferredVehicleType === 'luxury' ? 'sang' : 'hơi'} ưu tiên
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{timeUntil}</Text>
          </View>

          {hasMaxPrice && (
            <View style={styles.detailRow}>
              <Ionicons name="cash-outline" size={16} color="#666" />
              <Text style={styles.detailText}>
                Tối đa: {item.maxPrice.toLocaleString('vi-VN')}đ
              </Text>
            </View>
          )}
        </View>

        {/* Note */}
        {item.requestNote && (
          <View style={styles.noteContainer}>
            <Text style={styles.noteLabel}>Ghi chú:</Text>
            <Text style={styles.noteText}>{item.requestNote}</Text>
          </View>
        )}

        {/* Request Count */}
        {item.driverRequests && item.driverRequests.length > 0 && (
          <View style={styles.requestCount}>
            <Ionicons name="people" size={14} color="#FF9800" />
            <Text style={styles.requestCountText}>
              {item.driverRequests.length} tài xế đã quan tâm
            </Text>
          </View>
        )}

        {/* My Request Status */}
        {hasMyRequest && (
          <View style={styles.myRequestStatus}>
            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
            <Text style={styles.myRequestText}>
              Đã gửi yêu cầu - Giá: {myRequest?.proposedPrice?.toLocaleString('vi-VN')}đ
            </Text>
          </View>
        )}

        {/* Action Button */}
        <TouchableOpacity
          style={[
            styles.requestBtn,
            hasMyRequest && styles.alreadyRequestedBtn,
            requestingBooking === item._id && styles.disabledBtn
          ]}
          onPress={() => hasMyRequest ? 
            Alert.alert("Thông báo", "Bạn đã gửi yêu cầu cho chuyến này rồi") :
            handleRequestBooking(item)
          }
          disabled={requestingBooking === item._id}
        >
          {requestingBooking === item._id ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <Text style={styles.requestBtnText}>
                {hasMyRequest ? "Đã gửi yêu cầu" : "Gửi yêu cầu nhận chuyến"}
              </Text>
              <Ionicons 
                name={hasMyRequest ? "checkmark" : "send"} 
                size={16} 
                color="white" 
              />
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="car-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>Chưa có yêu cầu đặt xe nào</Text>
      <Text style={styles.emptyText}>
        Hiện tại chưa có hành khách nào tạo yêu cầu đặt xe. 
        Hãy quay lại sau để xem các yêu cầu mới!
      </Text>
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={loadAvailableBookings}
      >
        <Text style={styles.refreshButtonText}>Tải lại</Text>
      </TouchableOpacity>
    </View>
  );

  // Don't render anything if user is not a driver
  if (!isUserDriver()) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4285F4" />
          <Text style={styles.loadingText}>Đang kiểm tra quyền truy cập...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4285F4" />
          <Text style={styles.loadingText}>Đang tải yêu cầu đặt xe...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4285F4" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Yêu cầu đặt xe</Text>
          <Text style={styles.headerSubtitle}>
            Chế độ: Tài xế chuyên nghiệp
          </Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{bookings.length}</Text>
          <Text style={styles.statLabel}>Yêu cầu có sẵn</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {bookings.reduce((total, booking) => 
              total + booking.availableSeats, 0
            )}
          </Text>
          <Text style={styles.statLabel}>Tổng chỗ cần đặt</Text>
        </View>
      </View>

      {/* Bookings List */}
      <FlatList
        data={bookings}
        renderItem={renderBookingItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* Request Modal */}
      <Modal
        visible={showRequestModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowRequestModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Gửi yêu cầu nhận chuyến</Text>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setShowRequestModal(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {selectedBooking && (
              <>
                <View style={styles.modalRoute}>
                  <Text style={styles.modalRouteText} numberOfLines={1}>
                    {selectedBooking.startLocation?.address}
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color="#666" />
                  <Text style={styles.modalRouteText} numberOfLines={1}>
                    {selectedBooking.endLocation?.address}
                  </Text>
                </View>

                <View style={styles.inputSection}>
                  <Text style={styles.inputLabel}>
                    Giá đề xuất (VND) <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="Nhập giá bạn muốn đưa"
                    value={proposedPrice}
                    onChangeText={setProposedPrice}
                    keyboardType="numeric"
                  />
                  {selectedBooking.maxPrice && (
                    <Text style={styles.maxPriceHint}>
                      Ngân sách tối đa: {selectedBooking.maxPrice.toLocaleString('vi-VN')}đ
                    </Text>
                  )}
                </View>

                <View style={styles.inputSection}>
                  <Text style={styles.inputLabel}>Tin nhắn cho khách hàng</Text>
                  <TextInput
                    style={styles.messageInput}
                    placeholder="Ví dụ: Tôi có thể đón bạn đúng giờ, xe Honda City mới..."
                    value={driverMessage}
                    onChangeText={setDriverMessage}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.cancelModalBtn}
                    onPress={() => setShowRequestModal(false)}
                  >
                    <Text style={styles.cancelModalBtnText}>Hủy</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.submitModalBtn}
                    onPress={submitDriverRequest}
                  >
                    <Text style={styles.submitModalBtnText}>Gửi yêu cầu</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F5F7FA" 
  },
  
  header: {
    backgroundColor: "#4285F4",
    paddingTop: StatusBar.currentHeight || 44,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  backBtn: {
    marginRight: 16,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },

  statsContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4285F4",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },

  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

  bookingCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  timeInfo: {
    alignItems: "flex-start",
  },
  timeText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  dateText: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  distanceInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  distanceText: {
    fontSize: 14,
    color: "#4285F4",
    marginLeft: 4,
    fontWeight: "600",
  },

  routeContainer: {
    marginBottom: 16,
  },
  routePoint: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 4,
  },
  routeLine: {
    width: 2,
    height: 16,
    backgroundColor: "#E0E0E0",
    marginLeft: 7,
  },
  addressText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: "#333",
    lineHeight: 18,
  },

  passengerSection: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  passengerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  passengerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  passengerDetails: {
    flex: 1,
  },
  passengerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  passengerPhone: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  ratingText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },

  detailsContainer: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },

  noteContainer: {
    backgroundColor: "#F5F7FA",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  noteLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
  },
  noteText: {
    fontSize: 14,
    color: "#333",
    fontStyle: "italic",
  },

  requestCount: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  requestCountText: {
    fontSize: 12,
    color: "#FF9800",
    marginLeft: 4,
    fontStyle: "italic",
  },

  requestBtn: {
    backgroundColor: "#4285F4",
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  requestBtnText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  alreadyRequestedBtn: {
    backgroundColor: "#4CAF50",
  },

  myRequestStatus: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E8",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 12,
  },
  myRequestText: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "500",
    marginLeft: 6,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  refreshButton: {
    backgroundColor: "#4285F4",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  closeBtn: {
    padding: 4,
  },

  modalRoute: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  modalRouteText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },

  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  required: {
    color: "#FF5722",
  },
  priceInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  maxPriceHint: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    fontStyle: "italic",
  },
  messageInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    height: 80,
    textAlignVertical: "top",
  },

  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelModalBtn: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelModalBtnText: {
    color: "#666",
    fontWeight: "600",
    fontSize: 16,
  },
  submitModalBtn: {
    flex: 1,
    backgroundColor: "#4285F4",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  submitModalBtnText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
}); 