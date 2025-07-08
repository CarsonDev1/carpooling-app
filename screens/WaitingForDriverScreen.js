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
  console.log('📦 Route params received:', route.params);
  
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [responding, setResponding] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [lastRequestCount, setLastRequestCount] = useState(0);
  const [sortBy, setSortBy] = useState('price'); // 'price', 'rating', 'time'
  const [shouldStopPolling, setShouldStopPolling] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(5000); // Start with 30s
  const [retryCount, setRetryCount] = useState(0);
  const [networkError, setNetworkError] = useState(false);
  const [statusHistory, setStatusHistory] = useState([]); // Track status changes
  const [debugInfo, setDebugInfo] = useState('Initializing...');
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Animated values for pulse effect
  const pulse1 = useRef(new Animated.Value(1)).current;
  const pulse2 = useRef(new Animated.Value(1)).current;
  const pulse3 = useRef(new Animated.Value(1)).current;
  
  const { tripId, bookingInfo, tripData } = route.params || {};
  const intervalRef = useRef(null);
  const timerRef = useRef(null);

  // Error boundary-like behavior
  const handleError = useCallback((error, context = 'Unknown') => {
    console.error(`❌ Error in ${context}:`, error);
    setHasError(true);
    setErrorMessage(`${context}: ${error.message || error}`);
    setLoading(false);
  }, []);

  // Enhanced loadTripDetails with better error handling and status tracking
  const loadTripDetails = useCallback(async (isRefresh = false, isPolling = false) => {
    console.log(`🔄 loadTripDetails called: isRefresh=${isRefresh}, isPolling=${isPolling}`);
    
    // Prevent multiple simultaneous calls
    if (loading && !isRefresh && !isPolling) {
      console.log('🚫 Already loading, skipping...');
      return;
    }
    
    // Reset error state when manually refreshing
    if (isRefresh) {
      setHasError(false);
      setErrorMessage('');
    }
    
    try {
      if (isRefresh) {
        setRefreshing(true);
        setDebugInfo('Refreshing...');
      } else if (!isPolling) {
        setLoading(true);
        setDebugInfo('Loading trip details...');
      }
      
      // Clear network error state
      setNetworkError(false);
      
      console.log(`📡 Loading trip details for: ${tripId} ${isPolling ? '(polling)' : '(manual)'}`);
      
      if (!tripId) {
        throw new Error('No tripId provided');
      }
      
      const response = await getTripById(tripId);
      console.log('📡 getTripById response:', response);
      
      if (response.success) {
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
          
          // Show status change notification
          if (!isPolling) {
            showStatusChangeNotification(statusChange);
          }
        }
        
        // Check for new driver requests
        if (currentRequestCount > lastRequestCount && lastRequestCount > 0 && !isRefresh) {
          const newRequestsCount = currentRequestCount - lastRequestCount;
          
          // Vibrate to get attention
          try {
            Vibration.vibrate([0, 100, 100, 100]);
          } catch (vibrationError) {
            console.log('Vibration not available:', vibrationError);
          }
          
          Alert.alert(
            "🚗 Có tài xế mới quan tâm!", 
            `${newRequestsCount} tài xế vừa gửi yêu cầu. Hãy xem và chọn tài xế phù hợp nhất!`,
            [
              { text: "Xem ngay", onPress: () => {} },
              { text: "Để sau", style: "cancel" }
            ]
          );
        }
        
        setTrip(tripDataFromApi);
        setLastRequestCount(currentRequestCount);
        setRetryCount(0); // Reset retry count on success
        setDebugInfo(`Loaded: ${tripDataFromApi.status}, ${currentRequestCount} requests`);
        
        // Adjust polling interval based on activity
        if (currentRequestCount > 0 && pollingInterval > 10000) {
          setPollingInterval(10000); // Poll faster when there are requests
        } else if (currentRequestCount === 0 && pollingInterval < 30000) {
          setPollingInterval(30000); // Poll slower when no requests
        }
        
        // Check if trip status changed to terminal states
        if (['paid', 'completed', 'cancelled'].includes(tripDataFromApi.status)) {
          setShouldStopPolling(true);
          
          if (tripDataFromApi.status === 'paid') {
            Alert.alert(
              "💰 Đã thanh toán thành công!", 
              "Chuyến đi đã được xác nhận. Chuẩn bị sẵn sàng nhé!", 
              [
                {
                  text: "Xem chi tiết",
                  onPress: () => navigation.replace("TripDetail", { tripId })
                },
                {
                  text: "Ở lại",
                  style: "cancel"
                }
              ]
            );
          } else if (tripDataFromApi.status === 'confirmed') {
            // Trip confirmed, need payment
            Alert.alert(
              "✅ Tài xế đã được chọn!", 
              "Bạn đã chọn tài xế thành công. Hãy thanh toán để hoàn tất đặt xe.", 
              [{ text: "OK" }]
            );
          }
        }
      } else {
        console.log('❌ API response not successful:', response);
        setDebugInfo(`API Error: ${response.message || 'Unknown'}`);
        throw new Error(response.message || 'API response not successful');
      }
    } catch (error) {
      console.error("❌ Load trip details error:", error);
      
      // Handle network errors with exponential backoff
      const isNetworkError = error.message?.includes('Network Error') || 
                            error.code === 'NETWORK_ERROR' ||
                            !error.response;
      
      if (isNetworkError) {
        setNetworkError(true);
        setRetryCount(prev => prev + 1);
        setDebugInfo(`Network Error (retry ${retryCount + 1})`);
        
        // Exponential backoff: 30s, 60s, 120s, then stay at 120s
        const newInterval = Math.min(5000 * Math.pow(2, retryCount), 5000);
        setPollingInterval(newInterval);
        
        console.log(`🌐 Network error, retry ${retryCount + 1}, next interval: ${newInterval}ms`);
        
        if (!isRefresh && !isPolling) {
          Alert.alert(
            "Lỗi kết nối", 
            `Không thể kết nối đến server. Đang thử lại tự động...\n\nError: ${error.message}`,
            [{ text: "OK" }]
          );
        }
      } else {
        setDebugInfo(`Error: ${error.message}`);
        if (!isRefresh && !isPolling) {
          handleError(error, 'Load trip details');
        }
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [tripId, loading, lastRequestCount, navigation, trip?.status, retryCount, pollingInterval, handleError]);

  const showStatusChangeNotification = (statusChange) => {
    try {
      const statusMessages = {
        'pending_driver': 'Đang chờ tài xế quan tâm',
        'confirmed': 'Đã có tài xế, cần thanh toán',
        'paid': 'Đã thanh toán, sẵn sàng khởi hành',
        'in_progress': 'Chuyến đi đang diễn ra',
        'completed': 'Chuyến đi hoàn thành',
        'cancelled': 'Chuyến đi đã bị hủy'
      };
      
      const message = statusMessages[statusChange.to] || statusChange.to;
      console.log(`📢 Status: ${message}`);
    } catch (error) {
      console.error('❌ Status notification error:', error);
    }
  };

  // Initial load when screen mounts
  useEffect(() => {
    console.log('🎯 WaitingForDriverScreen mounted with tripId:', tripId);
    console.log('📦 Route params:', route.params);
    
    // Reset error state
    setHasError(false);
    setErrorMessage('');
    
    setDebugInfo(`TripId: ${tripId}, User: ${user?.fullName}`);
    
    if (!tripId) {
      console.log('❌ No tripId provided to WaitingForDriverScreen');
      setDebugInfo('❌ No tripId provided');
      handleError(new Error('No tripId provided'), 'Initial validation');
      return;
    }

    try {
      console.log('✅ TripId exists, loading trip details...');
      
      // If we have tripData from navigation, use it as initial data
      if (tripData) {
        console.log('📦 Using initial tripData from navigation:', tripData);
        setTrip(tripData);
        setLoading(false);
      }
      
      loadTripDetails();
      startPulseAnimation();
      startTimer();
    } catch (error) {
      handleError(error, 'Initial setup');
    }

    return () => {
      // Cleanup on unmount
      console.log('🧹 WaitingForDriverScreen unmounting...');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [tripId, handleError, loadTripDetails]);

  // Enhanced polling with exponential backoff
  useEffect(() => {
    if (!tripId || !trip || shouldStopPolling || networkError || hasError) return;
    
    // Stop polling for terminal states
    if (['paid', 'completed', 'cancelled'].includes(trip.status)) {
      console.log('🛑 Trip in terminal state, stopping polling');
      return;
    }
    
    console.log('⏰ Starting enhanced polling for trip:', tripId, 'status:', trip.status);
    console.log('📊 Polling interval:', pollingInterval, 'ms');
    
    intervalRef.current = setInterval(() => {
      // Only poll if trip is still pending and not stopped
      if (trip?.status === 'pending_driver' && !loading && !refreshing && !shouldStopPolling) {
        console.log('🔄 Auto-refreshing trip data...');
        loadTripDetails(false, true); // isRefresh=false, isPolling=true
      }
    }, pollingInterval);

    return () => {
      if (intervalRef.current) {
        console.log('🧹 Cleaning up polling interval');
        clearInterval(intervalRef.current);
      }
    };
  }, [tripId, trip?.status, shouldStopPolling, pollingInterval, loadTripDetails, networkError, hasError]);

  // Focus effect to resume polling when screen becomes active
  useFocusEffect(
    useCallback(() => {
      console.log('📱 Screen focused, checking trip status...');
      if (tripId && !shouldStopPolling && !hasError) {
        loadTripDetails(true); // Force refresh on focus
      }
    }, [tripId, shouldStopPolling, hasError, loadTripDetails])
  );

  const startTimer = () => {
    try {
      timerRef.current = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('❌ Timer error:', error);
    }
  };

  const startPulseAnimation = () => {
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
      // Don't crash the app for animation errors
    }
  };



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
              
              // Check if this is a mock request (for testing)
              const isMockRequest = driverRequestId.startsWith('mock-');
              
              if (isMockRequest) {
                console.log('🧪 Handling mock driver request:', { driverRequestId, action, driverName });
                
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                if (action === 'accept') {
                  // Update local state to simulate accepted request
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
                          Alert.alert(
                            "Thanh toán thành công! 🎉", 
                            "Test mode: Chuyến đi đã được xác nhận!"
                          );
                          setTrip(prev => ({ ...prev, status: 'paid' }));
                        }
                      },
                      { text: "OK", style: "cancel" }
                    ]
                  );
                } else {
                  // Update local state to decline request
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
                // Real API call
                const response = await respondToDriverRequest(tripId, driverRequestId, action);
                
                if (action === 'accept' && response.success) {
                  // Driver accepted, now need payment
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
                  loadTripDetails(true); // Refresh data
                }
              }
            } catch (error) {
              console.error('❌ Driver response error:', error);
              
              // Better error handling
              let errorMessage = error.message || `Không thể ${actionText} yêu cầu`;
              
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
        // In a real app, you would open the payment URL in a webview or browser
        Alert.alert(
          "Chuyển đến thanh toán",
          `Số tiền: ${amount?.toLocaleString('vi-VN')} VND\n\nTrong ứng dụng thực tế, bạn sẽ được chuyển đến trang thanh toán VNPay.`,
          [
            {
              text: "Mô phỏng thanh toán thành công",
              onPress: () => {
                // Simulate successful payment
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
      Alert.alert("Lỗi thanh toán", error.message || "Không thể tạo thanh toán");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    try {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } catch (error) {
      console.error('❌ Format time error:', error);
      return '00:00';
    }
  };

  const formatDateTime = (dateString) => {
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
  };

  const getStatusInfo = () => {
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
  };

  const sortDriverRequests = (requests) => {
    try {
      if (!Array.isArray(requests)) {
        console.warn('⚠️ sortDriverRequests: requests is not an array, returning empty array');
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
  };

  const getRequestTimeAgo = (createdAt) => {
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
  };

  console.log('🔍 Current state:', { 
    loading, 
    trip: !!trip, 
    tripId, 
    debugInfo,
    hasError,
    errorMessage
  });

  // Handle error state
  if (hasError) {
    console.log('📱 Rendering error screen...');
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
    console.log('📱 Rendering loading screen...');
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
          
          <TouchableOpacity
            style={[styles.primaryBtn, { marginTop: 20 }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.primaryBtnText}>Hủy</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!trip) {
    console.log('📱 Rendering no trip screen...');
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

  console.log('📱 Rendering main screen...');
  
  try {
    const { date: departureDate, time: departureTime } = formatDateTime(trip.departureTime);
    const statusInfo = getStatusInfo();
    const driverRequests = trip.driverRequests || [];
    const pendingRequests = (driverRequests || []).filter(req => req.status === 'pending');
    const sortedPendingRequests = sortDriverRequests(pendingRequests || []);

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
          {/* Status Progress Stepper */}
          <View style={styles.statusProgressContainer}>
            <Text style={styles.statusProgressTitle}>Tiến trình đặt xe</Text>
            <View style={styles.statusSteps}>
              {[
                { key: 'pending_driver', label: 'Chờ tài xế', icon: 'hourglass-outline' },
                { key: 'confirmed', label: 'Đã chọn', icon: 'checkmark-circle-outline' },
                { key: 'paid', label: 'Đã trả', icon: 'card-outline' },
                { key: 'in_progress', label: 'Đang đi', icon: 'car-outline' }
              ].map((step, index) => {
                const isActive = trip?.status === step.key;
                const isCompleted = ['confirmed', 'paid', 'in_progress', 'completed'].includes(trip?.status) && 
                                   (['pending_driver', 'confirmed', 'paid'].indexOf(step.key) < 
                                    ['pending_driver', 'confirmed', 'paid', 'in_progress'].indexOf(trip?.status));
                
                return (
                  <View key={step.key} style={styles.statusStep}>
                    <View style={[
                      styles.statusStepIcon,
                      isActive && styles.statusStepIconActive,
                      isCompleted && styles.statusStepIconCompleted
                    ]}>
                      <Ionicons 
                        name={step.icon} 
                        size={16} 
                        color={isActive ? "#4285F4" : isCompleted ? "#4CAF50" : "#ccc"} 
                      />
                    </View>
                    <Text style={[
                      styles.statusStepLabel,
                      isActive && styles.statusStepLabelActive,
                      isCompleted && styles.statusStepLabelCompleted
                    ]}>
                      {step.label}
                    </Text>
                    {index < 3 && (
                      <View style={[
                        styles.statusStepLine,
                        isCompleted && styles.statusStepLineCompleted
                      ]} />
                    )}
                  </View>
                );
              })}
            </View>
          </View>

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
            
            {/* Enhanced Polling Control */}
            <View style={styles.pollingControls}>
              <TouchableOpacity
                style={styles.pollingButton}
                onPress={() => {
                  setShouldStopPolling(!shouldStopPolling);
                  if (shouldStopPolling) {
                    loadTripDetails(true); // Refresh immediately when resuming
                  }
                }}
              >
                <Ionicons 
                  name={shouldStopPolling ? "play" : "pause"} 
                  size={12} 
                  color="#666" 
                />
                <Text style={styles.pollingButtonText}>
                  {shouldStopPolling ? 'Bật tự động cập nhật' : 'Tạm dừng cập nhật'}
                </Text>
              </TouchableOpacity>
              
              <Text style={styles.pollingInfo}>
                Cập nhật mỗi {Math.round(pollingInterval / 1000)}s
                {retryCount > 0 && ` (thử lại ${retryCount})`}
              </Text>
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

              {bookingInfo && bookingInfo.estimatedPrice && (
                <View style={styles.detailRow}>
                  <Ionicons name="information-circle-outline" size={16} color="#666" />
                  <Text style={styles.detailText}>
                    Giá ước tính: {bookingInfo.estimatedPrice?.toLocaleString('vi-VN')}đ
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Debug Driver Requests Info */}
          {__DEV__ && (
            <View style={styles.debugContainer}>
              <Text style={styles.debugTitle}>🔍 Debug: Driver Requests</Text>
              <Text style={styles.debugItem}>Total driverRequests: {trip.driverRequests?.length || 0}</Text>
              <Text style={styles.debugItem}>Pending requests: {pendingRequests.length}</Text>
              <Text style={styles.debugItem}>Trip status: {trip.status}</Text>
              {trip.driverRequests?.map((req, index) => (
                <Text key={index} style={styles.debugItem}>
                  Request {index}: {req.driver?.fullName} - Status: {req.status}
                </Text>
              ))}
            </View>
          )}

          {/* Driver Requests */}
          {pendingRequests.length > 0 && (
            <View style={styles.requestsCard}>
              <View style={styles.requestsHeader}>
                <Text style={styles.cardTitle}>
                  Yêu cầu từ tài xế ({pendingRequests.length})
                </Text>
                
                {/* Price Range Summary */}
                {(() => {
                  const prices = (sortedPendingRequests || []).map(r => r.proposedPrice || 0).filter(p => p > 0);
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
                  <TouchableOpacity
                    style={[styles.sortBtn, sortBy === 'price' && styles.sortBtnActive]}
                    onPress={() => setSortBy('price')}
                  >
                    <Text style={[styles.sortBtnText, sortBy === 'price' && styles.sortBtnTextActive]}>
                      Giá
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.sortBtn, sortBy === 'rating' && styles.sortBtnActive]}
                    onPress={() => setSortBy('rating')}
                  >
                    <Text style={[styles.sortBtnText, sortBy === 'rating' && styles.sortBtnTextActive]}>
                      Đánh giá
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.sortBtn, sortBy === 'time' && styles.sortBtnActive]}
                    onPress={() => setSortBy('time')}
                  >
                    <Text style={[styles.sortBtnText, sortBy === 'time' && styles.sortBtnTextActive]}>
                      Thời gian
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              {sortedPendingRequests.map((request) => (
                <View key={request._id} style={styles.driverRequestCard}>
                  {/* Best Price/Rating Badges */}
                  {(() => {
                    const allPrices = (sortedPendingRequests || []).map(r => r.proposedPrice || 0).filter(p => p > 0);
                    const allRatings = (sortedPendingRequests || []).map(r => r.driver.rating?.asDriver?.average || 0);
                    const minPrice = Math.min(...allPrices);
                    const maxRating = Math.max(...allRatings);
                    const isBestPrice = request.proposedPrice === minPrice && minPrice > 0;
                    const isTopRated = request.driver.rating?.asDriver?.average === maxRating && maxRating > 0;
                    
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
                        {request.driver.avatar ? (
                          <Image source={{ uri: request.driver.avatar }} style={styles.avatarImage} />
                        ) : (
                          <Ionicons name="person" size={20} color="#666" />
                        )}
                      </View>
                      <View style={styles.driverDetails}>
                        <Text style={styles.driverName}>{request.driver.fullName}</Text>
                        <Text style={styles.driverPhone}>{request.driver.phone}</Text>
                        {request.driver.vehicle && (
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
                          {request.driver.rating?.asDriver?.average?.toFixed(1) || 'N/A'}
                        </Text>
                      </View>
                      <Text style={styles.priceText}>
                        {request.proposedPrice?.toLocaleString('vi-VN')}đ
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
                      onPress={() => handleDriverResponse(request._id, 'decline', request.driver.fullName)}
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
                      onPress={() => handleDriverResponse(request._id, 'accept', request.driver.fullName)}
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
                    // Simulate driver requests by updating local state
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
                    
                    // Update trip with mock driver requests
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
              <View style={styles.noRequestsTips}>
                <Text style={styles.noRequestsTipsTitle}>💡 Gợi ý để thu hút tài xế:</Text>
                <Text style={styles.noRequestsTip}>• Tăng giá tối đa nếu có thể</Text>
                <Text style={styles.noRequestsTip}>• Thêm ghi chú rõ ràng về điểm đón</Text>
                <Text style={styles.noRequestsTip}>• Chọn thời gian đi phù hợp</Text>
              </View>
            </View>
          )}

          {/* Status History (Debug) */}
          {__DEV__ && statusHistory.length > 0 && (
            <View style={styles.debugContainer}>
              <Text style={styles.debugTitle}>📊 Lịch sử trạng thái</Text>
              {statusHistory.slice(-3).map((change, index) => (
                <Text key={index} style={styles.debugItem}>
                  {change.timestamp.toLocaleTimeString()}: {change.from} → {change.to}
                </Text>
              ))}
            </View>
          )}

          {/* Tips */}
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>💡 Lưu ý</Text>
            <Text style={styles.tipsText}>
              • Bạn có thể chọn tài xế phù hợp nhất từ các yêu cầu
            </Text>
            <Text style={styles.tipsText}>
              • Giá cuối cùng sẽ theo đề xuất của tài xế bạn chọn
            </Text>
            <Text style={styles.tipsText}>
              • Sau khi chọn tài xế, bạn cần thanh toán để xác nhận
            </Text>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
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
    // Fallback UI in case of render errors
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
          <Text style={styles.debugText}>{renderError.message}</Text>
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
  },

  content: {
    flex: 1,
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
    marginBottom: 20,
  },

  statusContainer: {
    alignItems: "center",
    backgroundColor: "white",
    margin: 16,
    marginTop: 8,
    padding: 24,
    borderRadius: 12,
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
  },
  timeText: {
    fontSize: 14,
    color: "#666",
  },
  pollingButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: "#F5F7FA",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  pollingButtonText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },

  bookingCard: {
    backgroundColor: "white",
    margin: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
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
    position: "relative",
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
  },
  noRequestsText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginTop: 12,
    marginBottom: 8,
  },
  noRequestsSubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    lineHeight: 20,
  },

  noRequestsTips: {
    backgroundColor: "white",
    margin: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
  },
  noRequestsTipsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  noRequestsTip: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
    marginBottom: 4,
  },

  tipsContainer: {
    backgroundColor: "white",
    margin: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
  },
  tipsTitle: {
    fontSize: 16,
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

  footer: {
    padding: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
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
  },
  primaryBtnText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },

  networkStatusContainer: {
    backgroundColor: "#FF5722",
    padding: 8,
    borderRadius: 8,
    marginLeft: 16,
  },
  networkStatusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },

  statusProgressContainer: {
    backgroundColor: "white",
    margin: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
  },
  statusProgressTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  statusSteps: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statusStep: {
    alignItems: "center",
  },
  statusStepIcon: {
    width: 40,
    height: 40,
    borderWidth: 2,
    borderColor: "#ccc",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  statusStepIconActive: {
    borderColor: "#4285F4",
  },
  statusStepIconCompleted: {
    borderColor: "#4CAF50",
  },
  statusStepLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  statusStepLabelActive: {
    fontWeight: "600",
  },
  statusStepLabelCompleted: {
    fontWeight: "500",
  },
  statusStepLine: {
    width: 100,
    height: 2,
    backgroundColor: "#ccc",
    marginTop: 8,
  },
  statusStepLineCompleted: {
    backgroundColor: "#4CAF50",
  },
  pollingControls: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  pollingInfo: {
    fontSize: 12,
    color: "#666",
    marginLeft: 8,
  },

  debugContainer: {
    backgroundColor: "white",
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  debugItem: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  pollingControls: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  pollingInfo: {
    fontSize: 12,
    color: "#666",
    marginLeft: 8,
  },
}); 