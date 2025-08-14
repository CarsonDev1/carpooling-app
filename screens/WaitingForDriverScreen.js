import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ActivityIndicator,
  Alert,
  StatusBar,
  Animated,
  ScrollView,
  RefreshControl,
  Vibration,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { getTripById, respondToDriverRequest } from "../api/tripsApi";
import { createPayment } from "../api/paymentApi";
import { useAuth } from "../context/AuthContext";

export default function WaitingForDriverScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();

  console.log('🎯 WaitingForDriverScreen rendering...');

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [responding, setResponding] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [lastRequestCount, setLastRequestCount] = useState(0);
  const [sortBy, setSortBy] = useState('price');
  const [shouldStopPolling, setShouldStopPolling] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(30000);
  const [retryCount, setRetryCount] = useState(0);
  const [networkError, setNetworkError] = useState(false);
  const [statusHistory, setStatusHistory] = useState([]);
  const [debugInfo, setDebugInfo] = useState('Initializing...');
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [consecutiveErrors, setConsecutiveErrors] = useState(0);
  const [isPolling, setIsPolling] = useState(false); // Add this to prevent multiple polling calls

  // Animated values for pulse effect
  const pulse1 = useRef(new Animated.Value(1)).current;
  const pulse2 = useRef(new Animated.Value(1)).current;
  const pulse3 = useRef(new Animated.Value(1)).current;

  const { tripId, bookingInfo, tripData } = route.params || {};
  const intervalRef = useRef(null);
  const timerRef = useRef(null);
  const loadingRef = useRef(false); // Prevent multiple simultaneous calls

  // Error boundary-like behavior
  const handleError = useCallback((error, context = 'Unknown') => {
    console.error(`❌ Error in ${context}:`, error);

    // Better error message handling
    let errorMsg = 'Unknown error';
    if (error && typeof error === 'object') {
      errorMsg = error.message || error.toString();
    } else if (typeof error === 'string') {
      errorMsg = error;
    }

    setHasError(true);
    setErrorMessage(`${context}: ${errorMsg}`);
    setLoading(false);
    setIsPolling(false);
    loadingRef.current = false;
  }, []);

  // Enhanced loadTripDetails with better error handling and status tracking
  const loadTripDetails = useCallback(async (isRefresh = false, isPollingCall = false) => {
    console.log(`🔄 loadTripDetails called: isRefresh=${isRefresh}, isPolling=${isPollingCall}`);

    // Prevent multiple simultaneous calls
    if (loadingRef.current && !isRefresh) {
      console.log('🚫 Already loading, skipping...');
      return;
    }

    // Don't make polling calls if we're already in an error state
    if (isPollingCall && (hasError || networkError || shouldStopPolling)) {
      console.log('🚫 Skipping polling call due to error state');
      return;
    }

    if (!tripId) {
      handleError('No tripId provided', 'Validation');
      return;
    }

    try {
      loadingRef.current = true;

      if (isRefresh) {
        setRefreshing(true);
        setDebugInfo('Refreshing...');
        setHasError(false);
        setErrorMessage('');
        setNetworkError(false);
      } else if (!isPollingCall) {
        setLoading(true);
        setDebugInfo('Loading trip details...');
      }

      if (isPollingCall) {
        setIsPolling(true);
      }

      console.log(`📡 Loading trip details for: ${tripId}`);

      const response = await getTripById(tripId);
      console.log('📡 getTripById response:', response);

      // Better response validation
      if (!response) {
        throw new Error('No response from server');
      }

      if (response.success && response.data) {
        const tripDataFromApi = response.data;
        console.log('✅ Trip data loaded:', {
          id: tripDataFromApi._id,
          status: tripDataFromApi.status,
          driverRequestsCount: tripDataFromApi.driverRequests?.length || 0
        });

        const currentRequestCount = tripDataFromApi.driverRequests?.length || 0;
        const previousStatus = trip?.status;

        // Track status changes
        if (previousStatus && tripDataFromApi.status !== previousStatus) {
          console.log(`🔄 Status changed: ${previousStatus} → ${tripDataFromApi.status}`);
          const statusChange = {
            from: previousStatus,
            to: tripDataFromApi.status,
            timestamp: new Date(),
          };
          setStatusHistory(prev => [...prev, statusChange]);
        }

        // Check for new driver requests (only if not refreshing to avoid spam)
        if (currentRequestCount > lastRequestCount && lastRequestCount > 0 && !isRefresh) {
          const newRequestsCount = currentRequestCount - lastRequestCount;

          try {
            Vibration.vibrate([0, 100, 100, 100]);
          } catch (vibrationError) {
            console.log('Vibration not available:', vibrationError);
          }

          Alert.alert(
            "🚗 Có tài xế mới quan tâm!",
            `${newRequestsCount} tài xế vừa gửi yêu cầu. Hãy xem và chọn tài xế phù hợp nhất!`,
            [
              { text: "Xem ngay", onPress: () => { } },
              { text: "Để sau", style: "cancel" }
            ]
          );
        }

        setTrip(tripDataFromApi);
        setLastRequestCount(currentRequestCount);
        setRetryCount(0);
        setConsecutiveErrors(0);
        setNetworkError(false);
        setHasError(false);
        setDebugInfo(`Loaded: ${tripDataFromApi.status}, ${currentRequestCount} requests`);

        // Check if trip status changed to terminal states
        if (['paid', 'completed', 'cancelled'].includes(tripDataFromApi.status)) {
          console.log('🛑 Trip in terminal state, stopping polling');
          setShouldStopPolling(true);

          if (tripDataFromApi.status === 'paid') {
            Alert.alert(
              "💰 Đã thanh toán thành công!",
              "Chuyến đi đã được xác nhận. Chuẩn bị sẵn sàng nhé!",
              [
                {
                  text: "Theo dõi chuyến đi",
                  onPress: () => navigation.replace("TripInProgress", { tripId })
                },
                {
                  text: "Ở lại",
                  style: "cancel"
                }
              ]
            );
          } else if (tripDataFromApi.status === 'confirmed') {
            Alert.alert(
              "✅ Tài xế đã được chọn!",
              "Bạn đã chọn tài xế thành công. Hãy thanh toán để hoàn tất đặt xe.",
              [{ text: "OK" }]
            );
          }
        }
      } else {
        const errorMsg = response?.message || 'API response not successful';
        console.log('❌ API response not successful:', response);
        setDebugInfo(`API Error: ${errorMsg}`);
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error("❌ Load trip details error:", error);

      // Better error handling
      const isNetworkError = error.message?.includes('Network Error') ||
        error.message?.includes('Network request failed') ||
        error.code === 'NETWORK_ERROR' ||
        !error.response;

      const isRateLimitError = error.response?.status === 429 ||
        error.message?.includes('Too many requests');

      if (isRateLimitError) {
        console.log('🛑 Rate limit hit, stopping polling for 2 minutes');
        setShouldStopPolling(true);
        setDebugInfo('Rate limit reached. Pausing requests...');

        setTimeout(() => {
          console.log('🔄 Resuming polling after rate limit cooldown');
          setShouldStopPolling(false);
          setRetryCount(0);
          setPollingInterval(60000);
        }, 120000);

        if (!isRefresh && !isPollingCall) {
          Alert.alert(
            "Quá nhiều yêu cầu",
            "Server đang bận, sẽ tự động thử lại sau 2 phút",
            [{ text: "OK" }]
          );
        }
      } else if (isNetworkError) {
        setNetworkError(true);
        setRetryCount(prev => prev + 1);
        setDebugInfo(`Network Error (retry ${retryCount + 1})`);

        const newInterval = Math.min(30000 * Math.pow(2, retryCount), 120000);
        setPollingInterval(newInterval);

        console.log(`🌐 Network error, retry ${retryCount + 1}, next interval: ${newInterval}ms`);

        if (!isRefresh && !isPollingCall) {
          Alert.alert(
            "Lỗi kết nối",
            `Không thể kết nối đến server. Đang thử lại tự động...\n\nError: ${error.message || 'Unknown error'}`,
            [{ text: "OK" }]
          );
        }
      } else {
        setConsecutiveErrors(prev => prev + 1);
        const errorMsg = error?.message || error?.toString() || 'Unknown error';
        setDebugInfo(`Error: ${errorMsg}`);

        // Stop polling after 3 consecutive errors
        if (consecutiveErrors >= 2) {
          console.log('🛑 Too many consecutive errors, stopping polling');
          setShouldStopPolling(true);
          setPollingInterval(300000);

          if (!isPollingCall) {
            Alert.alert(
              'Lỗi kết nối',
              'Đã xảy ra quá nhiều lỗi. Polling đã bị dừng.',
              [
                {
                  text: 'Thử lại ngay',
                  onPress: () => {
                    setConsecutiveErrors(0);
                    setShouldStopPolling(false);
                    setNetworkError(false);
                    setHasError(false);
                    setPollingInterval(30000);
                    loadTripDetails(true);
                  }
                },
                {
                  text: 'Về trang chủ',
                  onPress: () => navigation.goBack()
                }
              ]
            );
          }
        }

        if (!isRefresh && !isPollingCall) {
          handleError(error, 'Load trip details');
        }
      }
    } finally {
      loadingRef.current = false;
      setLoading(false);
      setRefreshing(false);
      setIsPolling(false);
    }
  }, [tripId, trip?.status, retryCount, consecutiveErrors, lastRequestCount, navigation, handleError, hasError, networkError, shouldStopPolling]);

  // Initial load when screen mounts
  useEffect(() => {
    console.log('🎯 WaitingForDriverScreen mounted with tripId:', tripId);

    if (!tripId) {
      handleError('No tripId provided', 'Initial validation');
      return;
    }

    // Reset states
    setHasError(false);
    setErrorMessage('');
    setNetworkError(false);
    setShouldStopPolling(false);
    setConsecutiveErrors(0);

    setDebugInfo(`TripId: ${tripId}, User: ${user?.fullName || 'Unknown'}`);

    // If we have tripData from navigation, use it as initial data
    if (tripData) {
      console.log('📦 Using initial tripData from navigation');
      setTrip(tripData);
      setLoading(false);
    }

    loadTripDetails();
    startPulseAnimation();
    startTimer();

    return () => {
      console.log('🧹 WaitingForDriverScreen unmounting...');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      loadingRef.current = false;
    };
  }, [tripId, user?.fullName]); // Remove dependencies that cause re-runs

  // Enhanced polling with better controls
  useEffect(() => {
    // Clear any existing interval first
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Don't start polling if conditions aren't met
    if (!tripId || shouldStopPolling || networkError || hasError || isPolling) {
      console.log('🛑 Polling stopped due to conditions:', {
        tripId: !!tripId,
        shouldStopPolling,
        networkError,
        hasError,
        isPolling
      });
      return;
    }

    // Stop polling for terminal states
    if (trip && ['paid', 'completed', 'cancelled'].includes(trip.status)) {
      console.log('🛑 Trip in terminal state, stopping polling');
      return;
    }

    console.log('⏰ Starting polling with interval:', pollingInterval, 'ms');

    intervalRef.current = setInterval(() => {
      // Double-check conditions before each poll
      if (!shouldStopPolling && !networkError && !hasError && !loadingRef.current && !isPolling) {
        console.log('🔄 Auto-refreshing trip data...');
        loadTripDetails(false, true); // isPollingCall=true
      } else {
        console.log('⏸️ Skipping poll due to conditions');
      }
    }, pollingInterval);

    return () => {
      if (intervalRef.current) {
        console.log('🧹 Cleaning up polling interval');
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [tripId, trip?.status, shouldStopPolling, pollingInterval, networkError, hasError, isPolling]); // Remove loadTripDetails from deps

  // Focus effect to resume polling when screen becomes active
  useFocusEffect(
    useCallback(() => {
      console.log('📱 Screen focused, checking trip status...');
      if (tripId && !shouldStopPolling && !hasError && !loadingRef.current) {
        loadTripDetails(true); // Force refresh on focus
      }
    }, [tripId, shouldStopPolling, hasError])
  );

  const startTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
  }, []);

  const startPulseAnimation = useCallback(() => {
    try {
      const createPulseAnimation = (animatedValue, delay) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(animatedValue, {
              toValue: 1.2,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(animatedValue, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        );
      };

      createPulseAnimation(pulse1, 0).start();
      createPulseAnimation(pulse2, 333).start();
      createPulseAnimation(pulse3, 666).start();
    } catch (error) {
      console.error('❌ Animation error:', error);
    }
  }, [pulse1, pulse2, pulse3]);

  const handleDriverResponse = async (driverRequestId, action, driverName) => {
    const actionText = action === 'accept' ? 'chấp nhận' : 'từ chối';

    Alert.alert(
      `${actionText === 'chấp nhận' ? 'Chấp nhận' : 'Từ chối'} tài xế`,
      `Bạn có chắc chắn muốn ${actionText} yêu cầu từ ${driverName}?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: actionText === 'chấp nhận' ? 'Chấp nhận' : 'Từ chối',
          onPress: async () => {
            try {
              setResponding(driverRequestId);

              const isMockRequest = driverRequestId.startsWith('mock-');

              if (isMockRequest) {
                console.log('🧪 Handling mock driver request');
                await new Promise(resolve => setTimeout(resolve, 1000));

                if (action === 'accept') {
                  setTrip(prev => ({
                    ...prev,
                    status: 'confirmed',
                    driverRequests: prev.driverRequests?.map(req =>
                      req._id === driverRequestId
                        ? { ...req, status: 'accepted' }
                        : { ...req, status: 'declined' }
                    )
                  }));

                  Alert.alert(
                    "Tài xế đã được chấp nhận! 🎉",
                    "Đây là test mode. Trong app thực tế, bạn sẽ cần thanh toán để xác nhận chuyến đi.",
                    [
                      {
                        text: "Mô phỏng thanh toán",
                        onPress: () => {
                          Alert.alert("Thanh toán thành công! 🎉", "Test mode: Chuyến đi đã được xác nhận!");
                          setTrip(prev => ({ ...prev, status: 'paid' }));
                        }
                      },
                      { text: "OK", style: "cancel" }
                    ]
                  );
                } else {
                  setTrip(prev => ({
                    ...prev,
                    driverRequests: prev.driverRequests?.map(req =>
                      req._id === driverRequestId
                        ? { ...req, status: 'declined' }
                        : req
                    )
                  }));
                  Alert.alert("✅ Đã từ chối", `Đã từ chối yêu cầu từ ${driverName}`);
                }
              } else {
                const response = await respondToDriverRequest(tripId, driverRequestId, action);

                if (action === 'accept' && response.success) {
                  Alert.alert(
                    "Tài xế đã được chấp nhận! 🎉",
                    "Bây giờ bạn cần thanh toán để xác nhận chuyến đi.",
                    [
                      {
                        text: "Thanh toán ngay",
                        onPress: () => handleCreatePayment(response.data.finalPrice)
                      }
                    ]
                  );
                } else {
                  loadTripDetails(true);
                }
              }
            } catch (error) {
              console.error('❌ Driver response error:', error);

              let errorMessage = error?.message || `Không thể ${actionText} yêu cầu`;

              if (error.message?.includes('Network Error') || error.code === 'NETWORK_ERROR') {
                errorMessage = `🌐 Lỗi kết nối mạng!\n\nKiểm tra:\n• Backend server có chạy không?\n• Kết nối internet\n\nLỗi: ${error.message}`;
              } else if (error.response?.status === 404) {
                errorMessage = `❌ Không tìm thấy trip hoặc driver request\n\nTripId: ${tripId}\nRequestId: ${driverRequestId}`;
              } else if (error.response?.status === 401) {
                errorMessage = "🔐 Lỗi xác thực. Vui lòng đăng nhập lại.";
              }

              Alert.alert("Lỗi", errorMessage);
            } finally {
              setResponding(null);
            }
          }
        }
      ]
    );
  };

  const handleCreatePayment = async (amount) => {
    try {
      setLoading(true);
      const paymentData = {
        tripId: tripId,
        returnUrl: `myapp://payment-result?tripId=${tripId}`,
        cancelUrl: `myapp://payment-cancel?tripId=${tripId}`
      };

      const response = await createPayment(paymentData);

      if (response.success && response.data.paymentUrl) {
        Alert.alert(
          "Chuyển đến thanh toán",
          `Số tiền: ${amount?.toLocaleString('vi-VN')} VND\n\nTrong ứng dụng thực tế, bạn sẽ được chuyển đến trang thanh toán VNPay.`,
          [
            {
              text: "Mô phỏng thanh toán thành công",
              onPress: () => {
                Alert.alert(
                  "Thanh toán thành công! 🎉",
                  "Chuyến đi đã được xác nhận. Tài xế sẽ liên hệ với bạn sớm!",
                  [
                    {
                      text: "Xem chi tiết chuyến đi",
                      onPress: () => navigation.replace("TripDetail", { tripId })
                    }
                  ]
                );
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('❌ Payment error:', error);
      Alert.alert("Lỗi thanh toán", error?.message || "Không thể tạo thanh toán");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = useCallback((seconds) => {
    try {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } catch (error) {
      console.error('❌ Format time error:', error);
      return '00:00';
    }
  }, []);

  const formatDateTime = useCallback((dateString) => {
    try {
      const date = new Date(dateString);
      return {
        date: date.toLocaleDateString('vi-VN'),
        time: date.toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit'
        })
      };
    } catch (error) {
      console.error('❌ Format date error:', error);
      return { date: 'N/A', time: 'N/A' };
    }
  }, []);

  const getStatusInfo = useCallback(() => {
    try {
      if (!trip) return { text: 'Đang tải...', color: '#666' };

      switch (trip.status) {
        case 'pending_driver':
          return {
            text: trip.driverRequests?.length > 0
              ? `Có ${trip.driverRequests.length} tài xế quan tâm`
              : 'Đang chờ tài xế quan tâm...',
            color: '#FF9800'
          };
        case 'confirmed':
          return { text: 'Đã có tài xế, cần thanh toán', color: '#4CAF50' };
        case 'paid':
          return { text: 'Đã thanh toán, sẵn sàng khởi hành', color: '#2196F3' };
        default:
          return { text: trip.status, color: '#666' };
      }
    } catch (error) {
      console.error('❌ Get status info error:', error);
      return { text: 'Lỗi hiển thị trạng thái', color: '#FF5722' };
    }
  }, [trip]);

  const sortDriverRequests = useCallback((requests) => {
    try {
      if (!Array.isArray(requests)) {
        console.warn('⚠️ sortDriverRequests: requests is not an array');
        return [];
      }

      const sorted = [...requests];

      switch (sortBy) {
        case 'price':
          return sorted.sort((a, b) => (a.proposedPrice || 0) - (b.proposedPrice || 0));
        case 'rating':
          return sorted.sort((a, b) =>
            (b.driver?.rating?.asDriver?.average || 0) - (a.driver?.rating?.asDriver?.average || 0)
          );
        case 'time':
          return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        default:
          return sorted;
      }
    } catch (error) {
      console.error('❌ Sort requests error:', error);
      return Array.isArray(requests) ? requests : [];
    }
  }, [sortBy]);

  const getRequestTimeAgo = useCallback((createdAt) => {
    try {
      const now = new Date();
      const requestTime = new Date(createdAt);
      const diffMinutes = Math.floor((now - requestTime) / (1000 * 60));

      if (diffMinutes < 1) return "Vừa xong";
      if (diffMinutes < 60) return `${diffMinutes} phút trước`;
      const hours = Math.floor(diffMinutes / 60);
      return `${hours} giờ trước`;
    } catch (error) {
      console.error('❌ Get request time error:', error);
      return "N/A";
    }
  }, []);

  // Handle error state
  if (hasError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lỗi</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF5722" />
          <Text style={styles.errorText}>Đã xảy ra lỗi</Text>
          <Text style={styles.debugText}>{errorMessage}</Text>
          <Text style={styles.debugText}>TripId: {tripId}</Text>
          <Text style={styles.debugText}>Debug: {debugInfo}</Text>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => {
              setHasError(false);
              setErrorMessage('');
              setConsecutiveErrors(0);
              setShouldStopPolling(false);
              loadTripDetails(true);
            }}
          >
            <Text style={styles.primaryBtnText}>Thử lại</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryBtn, { marginTop: 12, backgroundColor: '#666' }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.primaryBtnText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loading && !trip) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Đang tải...</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4285F4" />
          <Text style={styles.loadingText}>Đang tải thông tin...</Text>
          <Text style={styles.debugText}>{debugInfo}</Text>
          <Text style={styles.debugText}>TripId: {tripId}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!trip) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Không tìm thấy</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="car-outline" size={64} color="#ccc" />
          <Text style={styles.errorText}>Không tìm thấy thông tin yêu cầu đặt xe</Text>
          <Text style={styles.debugText}>{debugInfo}</Text>
          <Text style={styles.debugText}>TripId: {tripId}</Text>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate("CreateTrip")}
          >
            <Text style={styles.primaryBtnText}>Tạo yêu cầu mới</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  try {
    const { date: departureDate, time: departureTime } = formatDateTime(trip.departureTime);
    const statusInfo = getStatusInfo();
    const driverRequests = trip.driverRequests || [];
    const pendingRequests = driverRequests.filter(req => req.status === 'pending');
    const sortedPendingRequests = sortDriverRequests(pendingRequests);

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
          <Text style={styles.headerTitle}>Chờ tài xế</Text>

          {/* Network Status Indicator */}
          {networkError && (
            <View style={styles.networkStatusContainer}>
              <Ionicons name="wifi-outline" size={16} color="white" />
              <Text style={styles.networkStatusText}>Offline</Text>
            </View>
          )}
        </View>

        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadTripDetails(true)}
            />
          }
        >
          {/* Status Animation */}
          <View style={styles.statusContainer}>
            <View style={styles.pulseContainer}>
              <Animated.View
                style={[
                  styles.pulse,
                  styles.pulse1,
                  { transform: [{ scale: pulse1 }] }
                ]}
              />
              <Animated.View
                style={[
                  styles.pulse,
                  styles.pulse2,
                  { transform: [{ scale: pulse2 }] }
                ]}
              />
              <Animated.View
                style={[
                  styles.pulse,
                  styles.pulse3,
                  { transform: [{ scale: pulse3 }] }
                ]}
              />
              <View style={styles.centerIcon}>
                <Ionicons name="car" size={24} color="#4285F4" />
              </View>
            </View>

            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.text}
            </Text>
            <Text style={styles.timeText}>
              Thời gian chờ: {formatTime(timeElapsed)}
            </Text>

            {/* Polling Status */}
            <View style={styles.pollingStatus}>
              <Text style={styles.pollingInfo}>
                {shouldStopPolling ? '⏸️ Đã tạm dừng' : '🔄 Đang cập nhật'}
                {!shouldStopPolling && ` (${Math.round(pollingInterval / 1000)}s)`}
                {retryCount > 0 && ` - Thử lại ${retryCount}`}
              </Text>
              {isPolling && (
                <ActivityIndicator size="small" color="#4285F4" style={{ marginLeft: 8 }} />
              )}
            </View>
          </View>

          {/* Booking Info */}
          <View style={styles.bookingCard}>
            <Text style={styles.cardTitle}>Thông tin đặt xe</Text>

            <View style={styles.routeContainer}>
              <View style={styles.routePoint}>
                <Ionicons name="radio-button-on" size={16} color="#4285F4" />
                <Text style={styles.addressText} numberOfLines={2}>
                  {trip.startLocation.address}
                </Text>
              </View>
              <View style={styles.routeLine} />
              <View style={styles.routePoint}>
                <Ionicons name="location" size={16} color="#FF5722" />
                <Text style={styles.addressText} numberOfLines={2}>
                  {trip.endLocation.address}
                </Text>
              </View>
            </View>

            <View style={styles.tripDetails}>
              <View style={styles.detailRow}>
                <Ionicons name="time-outline" size={16} color="#666" />
                <Text style={styles.detailText}>
                  {departureTime} - {departureDate}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Ionicons name="people-outline" size={16} color="#666" />
                <Text style={styles.detailText}>
                  {trip.availableSeats} chỗ cần đặt
                </Text>
              </View>

              {trip.maxPrice && (
                <View style={styles.detailRow}>
                  <Ionicons name="cash-outline" size={16} color="#666" />
                  <Text style={styles.detailText}>
                    Tối đa: {trip.maxPrice.toLocaleString('vi-VN')}đ
                  </Text>
                </View>
              )}

              {bookingInfo?.estimatedPrice && (
                <View style={styles.detailRow}>
                  <Ionicons name="information-circle-outline" size={16} color="#666" />
                  <Text style={styles.detailText}>
                    Giá ước tính: {bookingInfo.estimatedPrice.toLocaleString('vi-VN')}đ
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Driver Requests */}
          {pendingRequests.length > 0 && (
            <View style={styles.requestsCard}>
              <View style={styles.requestsHeader}>
                <Text style={styles.cardTitle}>
                  Yêu cầu từ tài xế ({pendingRequests.length})
                </Text>

                {/* Price Range Summary */}
                {(() => {
                  const prices = sortedPendingRequests.map(r => r.proposedPrice || 0).filter(p => p > 0);
                  if (prices.length > 1) {
                    const minPrice = Math.min(...prices);
                    const maxPrice = Math.max(...prices);
                    return (
                      <Text style={styles.priceRangeSummary}>
                        Giá từ {minPrice.toLocaleString('vi-VN')} - {maxPrice.toLocaleString('vi-VN')}đ
                      </Text>
                    );
                  }
                  return null;
                })()}

                <View style={styles.sortContainer}>
                  <Text style={styles.sortLabel}>Sắp xếp:</Text>
                  {['price', 'rating', 'time'].map((sortType) => (
                    <TouchableOpacity
                      key={sortType}
                      style={[styles.sortBtn, sortBy === sortType && styles.sortBtnActive]}
                      onPress={() => setSortBy(sortType)}
                    >
                      <Text style={[styles.sortBtnText, sortBy === sortType && styles.sortBtnTextActive]}>
                        {sortType === 'price' ? 'Giá' : sortType === 'rating' ? 'Đánh giá' : 'Thời gian'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {sortedPendingRequests.map((request) => (
                <View key={request._id} style={styles.driverRequestCard}>
                  {/* Best Price/Rating Badges */}
                  {(() => {
                    const allPrices = sortedPendingRequests.map(r => r.proposedPrice || 0).filter(p => p > 0);
                    const allRatings = sortedPendingRequests.map(r => r.driver?.rating?.asDriver?.average || 0);
                    const minPrice = Math.min(...allPrices);
                    const maxRating = Math.max(...allRatings);
                    const isBestPrice = request.proposedPrice === minPrice && minPrice > 0;
                    const isTopRated = request.driver?.rating?.asDriver?.average === maxRating && maxRating > 0;

                    return (
                      <View style={styles.badgeContainer}>
                        {isBestPrice && (
                          <View style={styles.bestPriceBadge}>
                            <Text style={styles.badgeText}>💰 Giá tốt nhất</Text>
                          </View>
                        )}
                        {isTopRated && (
                          <View style={styles.topRatedBadge}>
                            <Text style={styles.badgeText}>⭐ Đánh giá cao</Text>
                          </View>
                        )}
                      </View>
                    );
                  })()}

                  <View style={styles.driverInfo}>
                    <View style={styles.driverLeft}>
                      <View style={styles.avatar}>
                        {request.driver?.avatar ? (
                          <Image source={{ uri: request.driver.avatar }} style={styles.avatarImage} />
                        ) : (
                          <Ionicons name="person" size={20} color="#666" />
                        )}
                      </View>
                      <View style={styles.driverDetails}>
                        <Text style={styles.driverName}>{request.driver?.fullName || 'Unknown Driver'}</Text>
                        <Text style={styles.driverPhone}>{request.driver?.phone || 'N/A'}</Text>
                        {request.driver?.vehicle && (
                          <Text style={styles.vehicleText}>
                            {request.driver.vehicle.brand} {request.driver.vehicle.model} - {request.driver.vehicle.licensePlate}
                          </Text>
                        )}
                        <Text style={styles.requestTimeText}>
                          {getRequestTimeAgo(request.createdAt)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.driverRight}>
                      <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={14} color="#FFD700" />
                        <Text style={styles.ratingText}>
                          {request.driver?.rating?.asDriver?.average?.toFixed(1) || 'N/A'}
                        </Text>
                      </View>
                      <Text style={styles.priceText}>
                        {request.proposedPrice?.toLocaleString('vi-VN') || 'N/A'}đ
                      </Text>
                      {(() => {
                        const estimatedPrice = bookingInfo?.estimatedPrice;
                        if (estimatedPrice && request.proposedPrice && typeof estimatedPrice === 'number' && estimatedPrice > 0) {
                          const diff = request.proposedPrice - estimatedPrice;
                          const diffPercentage = (diff / estimatedPrice) * 100;
                          return (
                            <Text style={[
                              styles.priceComparisonText,
                              { color: diff > 0 ? '#FF5722' : '#4CAF50' }
                            ]}>
                              {diff > 0 ? '+' : ''}{diffPercentage.toFixed(0)}% so với ước tính
                            </Text>
                          );
                        }
                        return null;
                      })()}
                    </View>
                  </View>

                  {request.message && (
                    <View style={styles.messageContainer}>
                      <Text style={styles.messageText}>"{request.message}"</Text>
                    </View>
                  )}

                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.declineBtn]}
                      onPress={() => handleDriverResponse(request._id, 'decline', request.driver?.fullName)}
                      disabled={responding === request._id}
                    >
                      {responding === request._id ? (
                        <ActivityIndicator color="#666" size="small" />
                      ) : (
                        <Text style={styles.declineBtnText}>Từ chối</Text>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.acceptBtn]}
                      onPress={() => handleDriverResponse(request._id, 'accept', request.driver?.fullName)}
                      disabled={responding === request._id}
                    >
                      {responding === request._id ? (
                        <ActivityIndicator color="white" size="small" />
                      ) : (
                        <Text style={styles.acceptBtnText}>Chấp nhận</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* No requests yet */}
          {pendingRequests.length === 0 && trip.status === 'pending_driver' && (
            <View style={styles.noRequestsCard}>
              <Ionicons name="car-outline" size={48} color="#ccc" />
              <Text style={styles.noRequestsText}>Chưa có tài xế nào quan tâm</Text>
              <Text style={styles.noRequestsSubtext}>
                Đừng lo lắng! Các tài xế sẽ thấy yêu cầu của bạn và phản hồi sớm thôi.
              </Text>

              {/* Test Button for Development */}
              {__DEV__ && (
                <TouchableOpacity
                  style={[styles.primaryBtn, { marginTop: 16, backgroundColor: '#FF9800' }]}
                  onPress={() => {
                    const mockDriverRequests = [
                      {
                        _id: 'mock-request-1',
                        driver: {
                          _id: 'mock-driver-1',
                          fullName: 'Nguyễn Văn A',
                          phone: '0901234567',
                          avatar: null,
                          rating: { asDriver: { average: 4.8 } },
                          vehicle: {
                            brand: 'Toyota',
                            model: 'Vios',
                            licensePlate: '30A-12345'
                          }
                        },
                        proposedPrice: 85000,
                        message: 'Tôi có thể đón bạn đúng giờ',
                        status: 'pending',
                        createdAt: new Date().toISOString()
                      },
                      {
                        _id: 'mock-request-2',
                        driver: {
                          _id: 'mock-driver-2',
                          fullName: 'Trần Thị B',
                          phone: '0909876543',
                          avatar: null,
                          rating: { asDriver: { average: 4.5 } },
                          vehicle: {
                            brand: 'Honda',
                            model: 'City',
                            licensePlate: '29B-67890'
                          }
                        },
                        proposedPrice: 90000,
                        message: 'Xe mới, điều hòa mát',
                        status: 'pending',
                        createdAt: new Date().toISOString()
                      }
                    ];

                    setTrip(prev => ({
                      ...prev,
                      driverRequests: mockDriverRequests
                    }));

                    Alert.alert("🧪 Test Mode", "Đã tạo 2 driver requests giả để test");
                  }}
                >
                  <Text style={styles.primaryBtnText}>🧪 Tạo Driver Requests Test</Text>
                </TouchableOpacity>
              )}

              {/* Helpful Tips */}
              <View style={styles.tipsContainer}>
                <Text style={styles.tipsTitle}>💡 Gợi ý để thu hút tài xế:</Text>
                <Text style={styles.tipsText}>• Tăng giá tối đa nếu có thể</Text>
                <Text style={styles.tipsText}>• Thêm ghi chú rõ ràng về điểm đón</Text>
                <Text style={styles.tipsText}>• Chọn thời gian đi phù hợp</Text>
              </View>
            </View>
          )}

          {/* Debug Info */}
          {__DEV__ && (
            <View style={styles.debugContainer}>
              <Text style={styles.debugTitle}>🔍 Debug Info</Text>
              <Text style={styles.debugItem}>Status: {trip.status}</Text>
              <Text style={styles.debugItem}>Driver Requests: {trip.driverRequests?.length || 0}</Text>
              <Text style={styles.debugItem}>Pending: {pendingRequests.length}</Text>
              <Text style={styles.debugItem}>Polling: {shouldStopPolling ? 'Stopped' : 'Active'}</Text>
              <Text style={styles.debugItem}>Network: {networkError ? 'Error' : 'OK'}</Text>
              <Text style={styles.debugItem}>Consecutive Errors: {consecutiveErrors}</Text>
              <Text style={styles.debugItem}>Retry Count: {retryCount}</Text>
              <Text style={styles.debugItem}>Interval: {pollingInterval}ms</Text>
            </View>
          )}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          {/* Polling Controls */}
          <View style={styles.pollingControls}>
            <TouchableOpacity
              style={[
                styles.pollingBtn,
                { backgroundColor: shouldStopPolling ? '#28a745' : '#dc3545' }
              ]}
              onPress={() => {
                if (shouldStopPolling) {
                  setShouldStopPolling(false);
                  setConsecutiveErrors(0);
                  setNetworkError(false);
                  setHasError(false);
                  setPollingInterval(30000);
                  setDebugInfo('Polling resumed by user');
                } else {
                  setShouldStopPolling(true);
                  setDebugInfo('Polling stopped by user');
                }
              }}
            >
              <Text style={styles.pollingBtnText}>
                {shouldStopPolling ? '▶️ Tiếp tục' : '⏸️ Tạm dừng'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.pollingBtn, { backgroundColor: '#007bff', marginLeft: 8 }]}
              onPress={() => {
                setConsecutiveErrors(0);
                setNetworkError(false);
                setHasError(false);
                setDebugInfo('Manual refresh');
                loadTripDetails(true);
              }}
              disabled={loading || refreshing}
            >
              <Text style={styles.pollingBtnText}>🔄 Làm mới</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => {
              Alert.alert(
                "Hủy yêu cầu đặt xe",
                "Bạn có chắc chắn muốn hủy yêu cầu này?",
                [
                  { text: "Không", style: "cancel" },
                  {
                    text: "Hủy",
                    style: "destructive",
                    onPress: () => navigation.goBack()
                  }
                ]
              );
            }}
          >
            <Text style={styles.cancelBtnText}>Hủy yêu cầu</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  } catch (renderError) {
    console.error('❌ Render error:', renderError);
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lỗi render</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="bug-outline" size={64} color="#FF5722" />
          <Text style={styles.errorText}>Lỗi hiển thị màn hình</Text>
          <Text style={styles.debugText}>{renderError?.message || 'Unknown render error'}</Text>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.primaryBtnText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
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
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
    flex: 1,
  },
  networkStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  networkStatusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
    marginLeft: 4,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  debugText: {
    marginTop: 8,
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    fontFamily: "monospace",
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
    marginTop: 12,
    marginBottom: 20,
  },
  statusContainer: {
    alignItems: "center",
    backgroundColor: "white",
    margin: 16,
    marginTop: 8,
    padding: 24,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  pulseContainer: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  pulse: {
    position: "absolute",
    borderRadius: 40,
    borderWidth: 1,
    borderColor: "#4285F4",
    backgroundColor: "rgba(66, 133, 244, 0.1)",
  },
  pulse1: {
    width: 40,
    height: 40,
    opacity: 0.8,
  },
  pulse2: {
    width: 60,
    height: 60,
    opacity: 0.5,
  },
  pulse3: {
    width: 80,
    height: 80,
    opacity: 0.3,
  },
  centerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "center",
  },
  timeText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  pollingStatus: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  pollingInfo: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  bookingCard: {
    backgroundColor: "white",
    margin: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  routeContainer: {
    marginBottom: 16,
  },
  routePoint: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 8,
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: "#E0E0E0",
    marginLeft: 7,
  },
  addressText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  tripDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
  },
  requestsCard: {
    backgroundColor: "white",
    margin: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  requestsHeader: {
    marginBottom: 16,
  },
  priceRangeSummary: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
    fontStyle: "italic",
  },
  sortContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    flexWrap: "wrap",
  },
  sortLabel: {
    fontSize: 12,
    color: "#666",
    marginRight: 8,
  },
  sortBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#F5F7FA",
    marginRight: 8,
    marginBottom: 4,
  },
  sortBtnActive: {
    backgroundColor: "#4285F4",
  },
  sortBtnText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  sortBtnTextActive: {
    color: "white",
  },
  driverRequestCard: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  badgeContainer: {
    flexDirection: "row",
    marginBottom: 8,
    flexWrap: "wrap",
  },
  bestPriceBadge: {
    backgroundColor: "#E8F5E8",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 6,
    marginBottom: 4,
  },
  topRatedBadge: {
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 6,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#333",
  },
  driverInfo: {
    flexDirection: "row",
    marginBottom: 12,
  },
  driverLeft: {
    flex: 1,
    flexDirection: "row",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F7FA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  driverPhone: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  vehicleText: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  requestTimeText: {
    fontSize: 11,
    color: "#FF9800",
    marginTop: 4,
    fontWeight: "500",
  },
  driverRight: {
    alignItems: "flex-end",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 12,
    color: "#666",
  },
  priceText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4285F4",
  },
  priceComparisonText: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 2,
  },
  messageContainer: {
    backgroundColor: "#F5F7FA",
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
  },
  messageText: {
    fontSize: 13,
    color: "#333",
    fontStyle: "italic",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  declineBtn: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  declineBtnText: {
    color: "#666",
    fontWeight: "600",
    fontSize: 14,
  },
  acceptBtn: {
    backgroundColor: "#4285F4",
  },
  acceptBtnText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  noRequestsCard: {
    backgroundColor: "white",
    margin: 16,
    marginTop: 8,
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  noRequestsText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginTop: 12,
    marginBottom: 8,
    textAlign: "center",
  },
  noRequestsSubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    lineHeight: 20,
  },
  tipsContainer: {
    backgroundColor: "#F8F9FA",
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    width: "100%",
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
    marginBottom: 4,
  },
  debugContainer: {
    backgroundColor: "white",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  debugItem: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
    fontFamily: "monospace",
  },
  footer: {
    padding: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  pollingControls: {
    flexDirection: "row",
    marginBottom: 12,
  },
  pollingBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 80,
  },
  pollingBtnText: {
    fontSize: 12,
    color: "white",
    fontWeight: "600",
  },
  cancelBtn: {
    backgroundColor: "#FF5722",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelBtnText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  primaryBtn: {
    backgroundColor: "#4285F4",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  primaryBtnText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});