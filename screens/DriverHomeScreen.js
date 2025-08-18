import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Image,
  Dimensions,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { getDriverTrips, getDriverStats, getAvailableTrips, acceptTrip } from '../api/driverApi';
import { estimatePrice, updateTripStatus } from '../api/tripsApi';

const { width } = Dimensions.get('window');

const DriverHomeScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [activeTrips, setActiveTrips] = useState([]);
  const [availableTrips, setAvailableTrips] = useState([]);
  const [stats, setStats] = useState({
    totalTrips: 0,
    totalEarnings: 0,
    rating: 0,
    completedTrips: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [selectedTab, setSelectedTab] = useState('active'); // 'active' or 'available'
  const intervalRef = useRef(null);
  // Removed price modal/state per updated flow

  // Load driver data
  const loadDriverData = useCallback(async () => {
    try {
      setLoading(true);

      // Load driver trips and filter active ones (confirmed or in_progress)
      const activeTripsResponse = await getDriverTrips('all');
      if (activeTripsResponse.success) {
        const trips = activeTripsResponse.data || [];
        setActiveTrips(trips.filter(t => ['confirmed', 'in_progress'].includes(t.status)));
      }

      // Load available trips
      const availableTripsResponse = await getAvailableTrips();
      if (availableTripsResponse.success) {
        const baseTrips = availableTripsResponse.data || [];
        // Try to estimate price per trip (avoid showing 0đ)
        const vehicleSeats = user?.vehicle?.seats || 4;
        const vehicleType = vehicleSeats <= 2 ? 'motorcycle' : vehicleSeats > 5 ? 'suv' : 'car';
        const enriched = await Promise.all(
          baseTrips.map(async (t) => {
            try {
              const start = t?.startLocation?.coordinates?.coordinates || [];
              const end = t?.endLocation?.coordinates?.coordinates || [];
              if (start.length === 2 && end.length === 2) {
                const res = await estimatePrice({
                  startLocation: { coordinates: { lat: start[1], lng: start[0] } },
                  endLocation: { coordinates: { lat: end[1], lng: end[0] } },
                  vehicleType: vehicleType,
                });
                if (res?.success && (res?.data?.estimatedPrice || res?.data?.price)) {
                  return { ...t, _estimatedPrice: res.data.estimatedPrice || res.data.price };
                }
              }
            } catch (_) { }
            return t;
          })
        );
        setAvailableTrips(enriched);
      }

      // Load driver stats
      const statsResponse = await getDriverStats();
      if (statsResponse.success) {
        setStats(statsResponse.data);
      }
    } catch (error) {
      console.error('❌ Load driver data error:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh data
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDriverData();
    setRefreshing(false);
  }, [loadDriverData]);

  // Toggle online/offline status
  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline);
    if (!isOnline) {
      Alert.alert(
        'Đã bật chế độ nhận chuyến',
        'Bạn đang online và có thể nhận chuyến đi mới!',
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'Đã tắt chế độ nhận chuyến',
        'Bạn đang offline và sẽ không nhận chuyến đi mới.',
        [{ text: 'OK' }]
      );
    }
  };

  // Auto-refresh when online
  useEffect(() => {
    if (isOnline) {
      intervalRef.current = setInterval(() => {
        loadDriverData();
      }, 30000); // Refresh every 30 seconds when online
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isOnline, loadDriverData]);

  // Load data on focus
  useFocusEffect(
    useCallback(() => {
      loadDriverData();
    }, [loadDriverData])
  );

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString || Date.now());
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Handle trip selection
  const handleTripSelect = (trip) => {
    navigation.navigate('TripDetail', { tripId: trip._id, tripData: trip });
  };

  // Handle start trip (update status then navigate)
  const handleStartTrip = (trip) => {
    Alert.alert(
      'Bắt đầu chuyến đi',
      `Bạn có chắc chắn muốn bắt đầu chuyến đi đến ${trip.endLocation.address}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Bắt đầu',
          onPress: async () => {
            try {
              await updateTripStatus(trip._id, 'in_progress');
              await loadDriverData();
              navigation.navigate('TripInProgress', { tripId: trip._id, tripData: { ...trip, status: 'in_progress' } });
            } catch (e) {
              Alert.alert('Lỗi', e?.message || 'Không thể bắt đầu chuyến đi');
            }
          },
        },
      ]
    );
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4285F4" />x

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Tài xế</Text>
          <Text style={styles.headerSubtitle}>{user?.fullName || 'Unknown'}</Text>
        </View>

        <TouchableOpacity
          style={[styles.onlineToggle, { backgroundColor: isOnline ? '#4CAF50' : '#FF5722' }]}
          onPress={toggleOnlineStatus}
        >
          <Ionicons
            name={isOnline ? 'radio-button-on' : 'radio-button-off'}
            size={20}
            color="white"
          />
          <Text style={styles.onlineToggleText}>
            {isOnline ? 'Online' : 'Offline'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="car-outline" size={24} color="#4285F4" />
          <Text style={styles.statNumber}>{stats.totalTrips}</Text>
          <Text style={styles.statLabel}>Tổng chuyến</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="cash-outline" size={24} color="#4CAF50" />
          <Text style={styles.statNumber}>{formatCurrency(stats.totalEarnings)}</Text>
          <Text style={styles.statLabel}>Tổng thu nhập</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="star-outline" size={24} color="#FFD700" />
          <Text style={styles.statNumber}>{Number(stats?.rating || 0).toFixed(1)}</Text>
          <Text style={styles.statLabel}>Đánh giá</Text>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'active' && styles.activeTab]}
          onPress={() => setSelectedTab('active')}
        >
          <Text style={[styles.tabText, selectedTab === 'active' && styles.activeTabText]}>
            Chuyến đang thực hiện ({activeTrips.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'available' && styles.activeTab]}
          onPress={() => setSelectedTab('available')}
        >
          <Text style={[styles.tabText, selectedTab === 'available' && styles.activeTabText]}>
            Chuyến có sẵn ({availableTrips.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {selectedTab === 'active' ? (
          // Active Trips
          <View style={styles.tabContent}>
            {activeTrips.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="car-outline" size={64} color="#ccc" />
                <Text style={styles.emptyStateText}>Không có chuyến đi đang thực hiện</Text>
                <Text style={styles.emptyStateSubtext}>
                  Bật chế độ online để nhận chuyến đi mới
                </Text>
              </View>
            ) : (
              activeTrips.map((trip) => (
                <View key={trip._id} style={styles.tripCard}>
                  <View style={styles.tripHeader}>
                    <View style={styles.tripStatus}>
                      <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
                      <Text style={styles.tripStatusText}>Đang thực hiện</Text>
                    </View>
                    <Text style={styles.tripPrice}>
                      {formatCurrency(trip.price || trip._estimatedPrice || 0)}
                    </Text>
                  </View>

                  <View style={styles.tripRoute}>
                    <View style={styles.routePoint}>
                      <View style={styles.routeDot} />
                      <Text style={styles.routeText}>{trip.startLocation.address}</Text>
                    </View>
                    <View style={styles.routeLine} />
                    <View style={styles.routePoint}>
                      <View style={[styles.routeDot, { backgroundColor: '#FF5722' }]} />
                      <Text style={styles.routeText}>{trip.endLocation.address}</Text>
                    </View>
                  </View>

                  <View style={styles.tripDetails}>
                    <View style={styles.tripDetail}>
                      <Ionicons name="time-outline" size={16} color="#666" />
                      <Text style={styles.tripDetailText}>
                        {formatTime(trip.departureTime)}
                      </Text>
                    </View>
                    <View style={styles.tripDetail}>
                      <Ionicons name="people-outline" size={16} color="#666" />
                      <Text style={styles.tripDetailText}>
                        {trip.passengers?.length || 0} hành khách
                      </Text>
                    </View>
                  </View>

                  {trip.status === 'confirmed' ? (
                    <TouchableOpacity
                      style={styles.startTripBtn}
                      onPress={() => handleStartTrip(trip)}
                    >
                      <Text style={styles.startTripBtnText}>Bắt đầu chuyến đi</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.startTripBtn, { backgroundColor: '#9E9E9E' }]}
                      onPress={() => navigation.navigate('TripInProgress', { tripId: trip._id, tripData: trip })}
                    >
                      <Text style={styles.startTripBtnText}>Xem chuyến đang chạy</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </View>
        ) : (
          // Available Trips
          <View style={styles.tabContent}>
            {availableTrips.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={64} color="#ccc" />
                <Text style={styles.emptyStateText}>Không có chuyến đi phù hợp</Text>
                <Text style={styles.emptyStateSubtext}>
                  Hãy thử điều chỉnh tiêu chí tìm kiếm
                </Text>
              </View>
            ) : (
              availableTrips.map((trip) => (
                <TouchableOpacity
                  key={trip._id}
                  style={styles.tripCard}
                  onPress={() => handleTripSelect(trip)}
                >
                  <View style={styles.tripHeader}>
                    <View style={styles.tripStatus}>
                      <View style={[styles.statusDot, { backgroundColor: '#FF9800' }]} />
                      <Text style={styles.tripStatusText}>Có sẵn</Text>
                    </View>
                    <Text style={styles.tripPrice}>{formatCurrency(trip.price || trip._estimatedPrice || 0)}</Text>
                  </View>

                  <View style={styles.tripRoute}>
                    <View style={styles.routePoint}>
                      <View style={styles.routeDot} />
                      <Text style={styles.routeText}>{trip.startLocation.address}</Text>
                    </View>
                    <View style={styles.routeLine} />
                    <View style={styles.routePoint}>
                      <View style={[styles.routeDot, { backgroundColor: '#FF5722' }]} />
                      <Text style={styles.routeText}>{trip.endLocation.address}</Text>
                    </View>
                  </View>

                  <View style={styles.tripDetails}>
                    <View style={styles.tripDetail}>
                      <Ionicons name="time-outline" size={16} color="#666" />
                      <Text style={styles.tripDetailText}>
                        {formatTime(trip.departureTime)}
                      </Text>
                    </View>
                    <View style={styles.tripDetail}>
                      <Ionicons name="people-outline" size={16} color="#666" />
                      <Text style={styles.tripDetailText}>
                        {trip.seatsRequested || 1} chỗ
                      </Text>
                    </View>
                    <View style={styles.tripDetail}>
                      <Ionicons name="star-outline" size={16} color="#666" />
                      <Text style={styles.tripDetailText}>
                        {Number(trip?.requestedBy?.rating?.asPassenger?.average || 0).toFixed(1)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.tripActions}>
                    <TouchableOpacity
                      style={[styles.acceptBtn, { marginRight: 8 }]}
                      onPress={() => handleTripSelect(trip)}
                    >
                      <Text style={styles.acceptBtnText}>Chi tiết</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.acceptBtn, { backgroundColor: '#4CAF50' }]}
                      onPress={async () => {
                        try {
                          setLoading(true);
                          const response = await acceptTrip(trip._id, {});
                          if (response?.success) {
                            Alert.alert('Thành công', 'Đã nhận chuyến.', [
                              { text: 'OK', onPress: () => loadDriverData() },
                            ]);
                          }
                        } catch (err) {
                          Alert.alert('Lỗi', err?.message || 'Không thể nhận chuyến.');
                        } finally {
                          setLoading(false);
                        }
                      }}
                    >
                      <Text style={styles.acceptBtnText}>Nhận chuyến</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#4285F4',
    paddingTop: StatusBar.currentHeight || 4,
    paddingBottom: 6,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  onlineToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  onlineToggleText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#4285F4',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: 'white',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  tripCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tripStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tripStatusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  tripPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  tripRoute: {
    marginBottom: 16,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4285F4',
    marginRight: 12,
  },
  routeText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: '#E0E0E0',
    marginLeft: 5,
    marginBottom: 8,
  },
  tripDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  tripDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tripDetailText: {
    fontSize: 12,
    color: '#666',
  },
  startTripBtn: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  startTripBtnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  tripActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  acceptBtn: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  acceptBtnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  bottomActions: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  actionBtnText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
});

export default DriverHomeScreen;
