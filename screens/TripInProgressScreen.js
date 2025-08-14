import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Modal,
  Dimensions,
  StatusBar,
  Alert,
  ActivityIndicator,
  Animated,
  Linking,
  Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { getTripById } from '../api/tripsApi';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get("window");

export default function TripInProgressScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Animation for status indicators
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const { tripId } = route.params || {};
  const timerRef = useRef(null);
  const intervalRef = useRef(null);

  // Load trip details
  const loadTripDetails = useCallback(async () => {
    if (!tripId) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin chuyến đi');
      navigation.goBack();
      return;
    }

    try {
      if (!loading) setLoading(true);
      const response = await getTripById(tripId);

      if (response?.success) {
        setTrip(response.data);
      } else {
        throw new Error(response?.message || 'Không thể tải thông tin chuyến đi');
      }
    } catch (error) {
      console.error('Load trip error:', error);

      // Handle rate limit errors
      if (error.response?.status === 429 || error.message?.includes('Too many requests')) {
        console.log('🛑 Rate limit hit in TripInProgressScreen, pausing polling');
        // Stop polling temporarily
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        // Resume after 2 minutes with longer interval
        setTimeout(() => {
          console.log('🔄 Resuming polling with 2 minute interval');
          intervalRef.current = setInterval(() => {
            if (trip?.status && !['completed', 'cancelled'].includes(trip.status)) {
              loadTripDetails();
            }
          }, 120000); // 2 minutes
        }, 120000);
      } else {
        Alert.alert('Lỗi', error.message || 'Không thể tải thông tin chuyến đi');
      }
    } finally {
      setLoading(false);
    }
  }, [tripId, navigation, loading, trip?.status]);

  // Start polling for trip status updates
  useEffect(() => {
    loadTripDetails();

    // Poll every 60 seconds for updates (reduced frequency)
    intervalRef.current = setInterval(() => {
      // Only poll if trip is still active and not in terminal state
      if (trip?.status && !['completed', 'cancelled'].includes(trip.status)) {
        console.log('🔄 Polling trip status update...');
        loadTripDetails();
      } else {
        console.log('🛑 Trip in terminal state, stopping polling');
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
    }, 60000); // 60 seconds instead of 30

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Start elapsed time counter
  useEffect(() => {
    if (trip?.status === 'in_progress') {
      timerRef.current = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [trip?.status]);

  // Pulse animation for status indicator
  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => pulse());
    };

    if (trip?.status === 'in_progress') {
      pulse();
    }
  }, [trip?.status, pulseAnim]);

  // Handle actions
  const handleCallDriver = () => {
    if (trip?.driver?.phone) {
      const phoneNumber = Platform.OS === 'ios' ? `tel:${trip.driver.phone}` : `tel:${trip.driver.phone}`;
      Linking.openURL(phoneNumber);
    } else {
      Alert.alert('Thông báo', 'Không tìm thấy số điện thoại tài xế');
    }
  };

  const handleEmergency = () => {
    Alert.alert(
      'Khẩn cấp',
      'Bạn có cần hỗ trợ khẩn cấp không?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Gọi 113', onPress: () => Linking.openURL('tel:113') },
        { text: 'Báo cáo sự cố', onPress: () => setShowSafetyModal(true) }
      ]
    );
  };

  const handleShareTrip = () => {
    // TODO: Implement trip sharing
    Alert.alert('Chia sẻ', 'Tính năng chia sẻ chuyến đi đang được phát triển');
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusDisplay = () => {
    if (!trip) return { text: 'Đang tải...', color: '#666' };

    switch (trip.status) {
      case 'paid':
        return { text: 'Chờ khởi hành', color: '#4285F4' };
      case 'in_progress':
        return { text: 'Đang di chuyển', color: '#4CAF50' };
      case 'completed':
        return { text: 'Hoàn thành', color: '#8BC34A' };
      case 'cancelled':
        return { text: 'Đã hủy', color: '#F44336' };
      default:
        return { text: trip.status, color: '#666' };
    }
  };

  if (loading || !trip) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4285F4" />
          <Text style={styles.loadingText}>Đang tải thông tin chuyến đi...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusDisplay = getStatusDisplay();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.headerWrapper}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Chuyến đi</Text>
            <View style={styles.statusContainer}>
              <Animated.View style={[styles.statusDot, {
                backgroundColor: statusDisplay.color,
                transform: [{ scale: trip?.status === 'in_progress' ? pulseAnim : 1 }]
              }]} />
              <Text style={[styles.statusText, { color: statusDisplay.color }]}>
                {statusDisplay.text}
              </Text>
              {trip?.status === 'in_progress' && (
                <Text style={styles.timeText}>{formatTime(timeElapsed)}</Text>
              )}
            </View>
          </View>
          <TouchableOpacity style={styles.emergencyBtn} onPress={handleEmergency}>
            <Ionicons name="warning" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Map Image */}
      {/* <Image
        source={require("../assets/map-trip.png")}
        style={styles.mapImage}
      /> */}

      {/* Bottom Info */}
      <View style={styles.bottomSheet}>
        {/* Driver Info */}
        <View style={styles.driverBox}>
          <View style={styles.driverInfo}>
            <Text style={styles.driverName}>
              {trip?.driver?.fullName || 'Đang tìm tài xế...'}
            </Text>
            <Text style={styles.vehicle}>
              {trip?.driver?.vehicleInfo?.make} | {trip?.driver?.vehicleInfo?.model || 'Xe'}
            </Text>
            {trip?.driver?.vehicleInfo?.licensePlate && (
              <View style={styles.plateBox}>
                <Text style={styles.plateText}>{trip.driver.vehicleInfo.licensePlate}</Text>
              </View>
            )}
            {trip?.driver?.rating && (
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={styles.ratingText}>{trip.driver.rating.toFixed(1)}</Text>
              </View>
            )}
          </View>

          <View style={styles.driverActions}>
            {trip?.driver?.profileImageUrl ? (
              <Image source={{ uri: trip.driver.profileImageUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatar}>
                <Ionicons name="person" size={24} color="#666" />
              </View>
            )}

            {trip?.driver?.phone && (
              <TouchableOpacity style={styles.callButton} onPress={handleCallDriver}>
                <Ionicons name="call" size={20} color="#4285F4" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Route */}
        <View style={styles.routeBox}>
          <View style={styles.routeHeader}>
            <Text style={styles.routeTitle}>Lộ trình</Text>
            <Text style={styles.tripDistance}>
              {trip?.distance ? `${(trip.distance / 1000).toFixed(1)} km` : ''}
            </Text>
          </View>

          <View style={styles.routeRow}>
            <View style={styles.routeIndicator}>
              <View style={styles.startDot} />
              <View style={styles.routeLine} />
              <View style={styles.endDot} />
            </View>

            <View style={styles.routeDetails}>
              <View style={styles.locationRow}>
                <Ionicons name="radio-button-on" size={12} color="#4285F4" />
                <Text style={styles.locationText} numberOfLines={2}>
                  {trip?.startLocation?.address || 'Điểm đón'}
                </Text>
              </View>

              <View style={styles.locationRow}>
                <Ionicons name="location" size={12} color="#F44336" />
                <Text style={styles.locationText} numberOfLines={2}>
                  {trip?.endLocation?.address || 'Điểm đến'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.timeInfo}>
            <Text style={styles.routeTime}>
              Khởi hành: {trip?.departureTime ? formatDateTime(trip.departureTime) : 'Chưa xác định'}
            </Text>
          </View>
        </View>

        {/* Payment */}
        <View style={styles.paymentBox}>
          <View style={styles.paymentHeader}>
            <Text style={styles.paymentTitle}>Thanh toán</Text>
            <View style={styles.paymentStatus}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.paymentStatusText}>Đã thanh toán</Text>
            </View>
          </View>

          <View style={styles.paymentLine}>
            <Text style={styles.paymentLabel}>Cước phí</Text>
            <Text style={styles.paymentValue}>
              {trip?.price ? formatCurrency(trip.price) : '0 VNĐ'}
            </Text>
          </View>

          {trip?.platformFee && trip.platformFee > 0 && (
            <View style={styles.paymentLine}>
              <Text style={styles.paymentLabel}>Phí dịch vụ</Text>
              <Text style={styles.paymentValue}>
                {formatCurrency(trip.platformFee)}
              </Text>
            </View>
          )}

          <View style={[styles.paymentLine, styles.totalLine]}>
            <Text style={styles.totalText}>Tổng cộng</Text>
            <Text style={styles.totalText}>
              {trip?.totalAmount ? formatCurrency(trip.totalAmount) : formatCurrency(trip?.price || 0)}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.helpBtn} onPress={handleEmergency}>
            <Ionicons name="help-circle-outline" size={18} color="#666" />
            <Text style={styles.helpText}>Trợ giúp</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.shareBtn} onPress={handleShareTrip}>
            <Ionicons name="share-outline" size={18} color="#fff" />
            <Text style={styles.shareText}>Chia sẻ</Text>
          </TouchableOpacity>

          {trip?.driver?.phone && (
            <TouchableOpacity style={styles.callBtn} onPress={handleCallDriver}>
              <Ionicons name="call" size={18} color="#fff" />
              <Text style={styles.callText}>Gọi tài xế</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Safety Check Modal */}
      <Modal visible={showSafetyModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.popupBox}>
            <View style={styles.modalHeader}>
              <Ionicons name="shield-checkmark" size={32} color="#4285F4" />
              <Text style={styles.modalTitle}>An toàn của bạn</Text>
            </View>

            <Text style={styles.popupText}>
              Bạn có cảm thấy an toàn trong chuyến đi này không?
              Nếu có bất kỳ vấn đề gì, hãy cho chúng tôi biết.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.safeBtn}
                onPress={() => setShowSafetyModal(false)}
              >
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={styles.safeBtnText}>Tôi an toàn</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.emergencyModalBtn}
                onPress={() => {
                  setShowSafetyModal(false);
                  Linking.openURL('tel:113');
                }}
              >
                <Ionicons name="warning" size={20} color="#F44336" />
                <Text style={styles.emergencyModalBtnText}>Cần hỗ trợ khẩn cấp</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5'
  },

  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center'
  },

  headerWrapper: {
    backgroundColor: "#4285F4",
    paddingTop: StatusBar.currentHeight || 44,
    paddingBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },

  backBtn: {
    padding: 8,
  },

  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },

  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },

  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
  },

  timeText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 8,
  },

  emergencyBtn: {
    padding: 8,
  },

  mapImage: {
    width: "100%",
    height: 280,
    resizeMode: "cover",
  },

  bottomSheet: {
    padding: 20,
    backgroundColor: "#fff",
    flex: 1,
  },

  driverBox: {
    backgroundColor: "#E3F2FD",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },

  driverInfo: {
    flex: 1,
  },

  driverName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1976D2",
    marginBottom: 4,
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
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#2196F3',
  },

  plateText: {
    fontWeight: "600",
    fontSize: 12,
    color: "#1976D2",
  },

  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  ratingText: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '500',
    marginLeft: 4,
  },

  driverActions: {
    alignItems: 'center',
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#2196F3',
  },

  callButton: {
    backgroundColor: '#4285F4',
    padding: 8,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },

  routeBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
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

  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  helpBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  shareBtn: {
    flex: 1,
    backgroundColor: "#58C2F0",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  helpText: {
    color: "#000",
    fontWeight: "bold",
  },
  shareText: {
    color: "#fff",
    fontWeight: "bold",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  popupBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    elevation: 5,
  },
  popupText: {
    fontSize: 15,
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  primaryBtn: {
    backgroundColor: "#58C2F0",
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: "center",
  },
  primaryText: {
    color: "#fff",
    fontWeight: "bold",
  },
  secondaryBtn: {
    borderColor: "#ccc",
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  secondaryText: {
    color: "#000",
    fontWeight: "bold",
  },
});
