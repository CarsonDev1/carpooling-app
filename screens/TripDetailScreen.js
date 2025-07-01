import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { getTripById, updatePassengerStatus, cancelJoinRequest, updateTripStatus } from "../api/tripsApi";
import { useAuth } from "../context/AuthContext";

export default function TripDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  
  const { tripId } = route.params || {};

  useEffect(() => {
    if (tripId) {
      loadTripDetails();
    }
  }, [tripId]);

  const loadTripDetails = async () => {
    try {
      setLoading(true);
      const response = await getTripById(tripId);
      if (response.success) {
        setTrip(response.data);
      }
    } catch (error) {
      Alert.alert("Lỗi", error.message || "Không thể lấy thông tin chuyến đi");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const isDriver = trip?.driver?._id === user?._id;
  const myPassengerRecord = trip?.passengers?.find(p => p.user._id === user?._id);
  const isPassenger = !!myPassengerRecord;

  const handleAcceptPassenger = async (passengerId) => {
    try {
      setActionLoading(passengerId);
      await updatePassengerStatus(tripId, passengerId, "accepted");
      await loadTripDetails(); // Refresh data
      Alert.alert("Thành công", "Đã chấp nhận hành khách");
    } catch (error) {
      Alert.alert("Lỗi", error.message || "Không thể chấp nhận hành khách");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeclinePassenger = async (passengerId) => {
    try {
      setActionLoading(passengerId);
      await updatePassengerStatus(tripId, passengerId, "declined");
      await loadTripDetails(); // Refresh data
      Alert.alert("Thành công", "Đã từ chối hành khách");
    } catch (error) {
      Alert.alert("Lỗi", error.message || "Không thể từ chối hành khách");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelBooking = async () => {
    try {
      setActionLoading("cancel");
      await cancelJoinRequest(tripId);
      Alert.alert("Thành công", "Đã hủy đặt chỗ", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert("Lỗi", error.message || "Không thể hủy đặt chỗ");
    } finally {
      setActionLoading(null);
    }
  };

  const handleStartTrip = async () => {
    try {
      setActionLoading("start");
      await updateTripStatus(tripId, "in_progress");
      await loadTripDetails();
      Alert.alert("Thành công", "Đã bắt đầu chuyến đi");
    } catch (error) {
      Alert.alert("Lỗi", error.message || "Không thể bắt đầu chuyến đi");
    } finally {
      setActionLoading(null);
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('vi-VN'),
      time: date.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return '#4CAF50';
      case 'declined': return '#F44336';
      case 'pending': return '#FF9800';
      case 'cancelled': return '#9E9E9E';
      default: return '#666';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4285F4" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!trip) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Không tìm thấy chuyến đi</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { date: departureDate, time: departureTime } = formatDateTime(trip.departureTime);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.headerWrapper}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.headerTitle}>Chi tiết chuyến đi</Text>
      
      <ScrollView contentContainerStyle={styles.content}>
        {/* Driver Info */}
        <View style={styles.driverBox}>
          <View>
            <Text style={styles.driverName}>{trip.driver.fullName}</Text>
            <Text style={styles.vehicle}>
              {trip.driver.vehicle?.brand || 'Xe'} | {trip.driver.vehicle?.model || 'N/A'}
            </Text>
            {trip.driver.vehicle?.licensePlate && (
              <View style={styles.plateBox}>
                <Text style={styles.plateText}>{trip.driver.vehicle.licensePlate}</Text>
              </View>
            )}
          </View>
          <View style={styles.avatar}>
            {trip.driver.avatar ? (
              <Image source={{ uri: trip.driver.avatar }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person" size={24} color="#666" />
            )}
          </View>
        </View>

        {/* Trip Status */}
        <View style={styles.statusContainer}>
          <Text style={[styles.statusText, { color: getStatusColor(trip.status) }]}>
            Trạng thái: {
              trip.status === 'scheduled' ? 'Đã lên lịch' :
              trip.status === 'in_progress' ? 'Đang di chuyển' :
              trip.status === 'completed' ? 'Hoàn thành' :
              trip.status === 'cancelled' ? 'Đã hủy' : trip.status
            }
          </Text>
          <Text style={styles.seatsText}>
            Còn {trip.availableSeats} chỗ trống
          </Text>
        </View>

        {/* Route */}
        <View style={styles.routeBox}>
          <View style={styles.routeRow}>
            <Image
              source={require("../assets/ic-doc.png")}
              style={styles.dotImage}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.routeLine} numberOfLines={2}>
                {trip.startLocation.address}
              </Text>
              <Text style={styles.routeLine} numberOfLines={2}>
                {trip.endLocation.address}
              </Text>
              <Text style={styles.routeTime}>
                Khởi hành: {departureTime} {departureDate}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment */}
        <View style={styles.paymentBox}>
          <View style={styles.paymentHeader}>
            <Text style={styles.paymentTitle}>Chi phí</Text>
            <Text style={styles.vehicleType}>
              {trip.vehicleTypeUsed || 'car'}
            </Text>
          </View>
          <View style={styles.paymentLine}>
            <Text>Giá chuyến đi</Text>
            <Text>{trip.price?.toLocaleString('vi-VN')}đ</Text>
          </View>
          <View style={styles.paymentLine}>
            <Text style={styles.totalText}>Tổng</Text>
            <Text style={styles.totalText}>
              {trip.price?.toLocaleString('vi-VN')}đ
            </Text>
          </View>
        </View>

        {/* Notes */}
        {trip.notes && (
          <View style={styles.notesBox}>
            <Text style={styles.notesTitle}>Ghi chú</Text>
            <Text style={styles.notesText}>{trip.notes}</Text>
          </View>
        )}

        {/* Trip code */}
        <Text style={styles.tripCode}>Mã chuyến đi: {trip._id.slice(-8).toUpperCase()}</Text>
        <Text style={styles.tripTime}>
          {departureDate} | {departureTime}
        </Text>

        {/* Passengers List (for driver) */}
        {isDriver && trip.passengers?.length > 0 && (
          <View style={styles.passengersContainer}>
            <Text style={styles.passengersTitle}>Danh sách hành khách</Text>
            {trip.passengers.map((passenger) => (
              <View key={passenger._id} style={styles.passengerCard}>
                <View style={styles.passengerInfo}>
                  <Text style={styles.passengerName}>{passenger.user.fullName}</Text>
                  <Text style={styles.passengerPhone}>{passenger.user.phone}</Text>
                  <Text style={[styles.passengerStatus, { color: getStatusColor(passenger.status) }]}>
                    {passenger.status === 'pending' ? 'Đang chờ' :
                     passenger.status === 'accepted' ? 'Đã chấp nhận' :
                     passenger.status === 'declined' ? 'Đã từ chối' : passenger.status}
                  </Text>
                </View>
                {passenger.status === 'pending' && (
                  <View style={styles.passengerActions}>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.acceptBtn]}
                      onPress={() => handleAcceptPassenger(passenger.user._id)}
                      disabled={actionLoading === passenger.user._id}
                    >
                      {actionLoading === passenger.user._id ? (
                        <ActivityIndicator color="white" size="small" />
                      ) : (
                        <Text style={styles.actionBtnText}>Chấp nhận</Text>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.declineBtn]}
                      onPress={() => handleDeclinePassenger(passenger.user._id)}
                      disabled={actionLoading === passenger.user._id}
                    >
                      <Text style={styles.actionBtnText}>Từ chối</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        {isDriver && trip.status === 'scheduled' && (
          <TouchableOpacity
            style={[styles.primaryBtn, actionLoading === "start" && styles.disabledBtn]}
            onPress={handleStartTrip}
            disabled={actionLoading === "start"}
          >
            {actionLoading === "start" ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.primaryBtnText}>Bắt đầu chuyến đi</Text>
            )}
          </TouchableOpacity>
        )}
        
        {isPassenger && myPassengerRecord?.status === 'pending' && (
          <TouchableOpacity
            style={[styles.cancelBtn, actionLoading === "cancel" && styles.disabledBtn]}
            onPress={handleCancelBooking}
            disabled={actionLoading === "cancel"}
          >
            {actionLoading === "cancel" ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.cancelBtnText}>Hủy đặt chỗ</Text>
            )}
          </TouchableOpacity>
        )}

        {trip.status === 'in_progress' && (
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate("TripInProgress", { tripId })}
          >
            <Text style={styles.primaryBtnText}>Xem chuyến đi</Text>
          </TouchableOpacity>
        )}
        
        <Text style={styles.supportText}>Bạn cần hỗ trợ?</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  headerWrapper: {
    backgroundColor: "#58C2F0",
    paddingTop: StatusBar.currentHeight || 44,
    paddingBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  backBtn: {
    position: "absolute",
    left: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginTop: 10,
  },

  content: {
    padding: 20,
    paddingBottom: 120,
  },

  driverBox: {
    backgroundColor: "#D9F2FF",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  driverName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  vehicle: {
    fontSize: 13,
    color: "#555",
    marginBottom: 6,
  },
  plateBox: {
    backgroundColor: "#fff",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  plateText: {
    fontWeight: "bold",
    fontSize: 13,
    color: "#007AFF",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },

  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 16,
  },
  actionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    fontWeight: "600",
    fontSize: 13,
  },

  routeBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  routeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  dotImage: {
    width: 12,
    height: 42,
    resizeMode: "contain",
    marginRight: 8,
  },
  routeLine: {
    fontSize: 14,
    color: "#000",
    marginBottom: 2,
  },
  routeTime: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },

  paymentBox: {
    backgroundColor: "#FFF7C8",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  paymentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  paymentTitle: {
    fontWeight: "bold",
    fontSize: 15,
  },
  zaloIcon: {
    width: 50,
    height: 20,
    resizeMode: "contain",
  },
  paymentLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 2,
  },
  totalText: {
    fontWeight: "bold",
    fontSize: 14,
  },

  tripCode: {
    fontWeight: "bold",
    fontSize: 13,
    marginBottom: 2,
  },
  tripTime: {
    fontSize: 12,
    color: "#666",
    marginBottom: 16,
  },

  insuranceBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#D9F2FF",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
  },
  insuranceText: {
    fontWeight: "bold",
    fontSize: 14,
  },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
  },
  retryBtn: {
    backgroundColor: "#58C2F0",
    paddingVertical: 14,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  retryText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  supportText: {
    marginTop: 12,
    fontSize: 13,
    color: "#999",
  },
  
  // New styles
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  statusContainer: {
    backgroundColor: "#F0F8FF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  seatsText: {
    fontSize: 14,
    color: "#666",
  },
  vehicleType: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
  },
  notesBox: {
    backgroundColor: "#FFF8E1",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    color: "#333",
  },
  notesText: {
    fontSize: 14,
    color: "#666",
  },
  passengersContainer: {
    marginTop: 16,
  },
  passengersTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  passengerCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  passengerInfo: {
    marginBottom: 8,
  },
  passengerName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  passengerPhone: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  passengerStatus: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  passengerActions: {
    flexDirection: "row",
    gap: 8,
  },
  acceptBtn: {
    backgroundColor: "#4CAF50",
    flex: 1,
  },
  declineBtn: {
    backgroundColor: "#F44336",
    flex: 1,
  },
  actionBtnText: {
    color: "white",
    fontWeight: "600",
    fontSize: 12,
    textAlign: "center",
  },
  primaryBtn: {
    backgroundColor: "#4285F4",
    paddingVertical: 14,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    marginBottom: 8,
  },
  primaryBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  cancelBtn: {
    backgroundColor: "#F44336",
    paddingVertical: 14,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    marginBottom: 8,
  },
  cancelBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  disabledBtn: {
    opacity: 0.6,
  },
});
