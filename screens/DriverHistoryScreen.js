import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getDriverTrips } from '../api/driverApi';

const DriverHistoryScreen = () => {
  const navigation = useNavigation();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all'); // 'all', 'completed', 'cancelled'
  const [selectedPeriod, setSelectedPeriod] = useState('month'); // 'week', 'month', 'year'

  // Load driver trips
  const loadTrips = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getDriverTrips(selectedStatus, selectedPeriod);
      if (response.success) {
        setTrips(response.data || []);
      }
    } catch (error) {
      console.error('❌ Load trips error:', error);
      Alert.alert('Lỗi', 'Không thể tải lịch sử chuyến đi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, selectedPeriod]);

  // Refresh data
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTrips();
    setRefreshing(false);
  }, [loadTrips]);

  // Load data on focus
  useFocusEffect(
    useCallback(() => {
      loadTrips();
    }, [loadTrips])
  );

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'cancelled':
        return '#FF5722';
      case 'in_progress':
        return '#FF9800';
      case 'confirmed':
        return '#2196F3';
      default:
        return '#666';
    }
  };

  // Get status text
  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      case 'in_progress':
        return 'Đang thực hiện';
      case 'confirmed':
        return 'Đã xác nhận';
      default:
        return status;
    }
  };

  // Get period label
  const getPeriodLabel = (period) => {
    switch (period) {
      case 'week':
        return 'Tuần này';
      case 'month':
        return 'Tháng này';
      case 'year':
        return 'Năm nay';
      default:
        return 'Tháng này';
    }
  };

  // Handle trip selection
  const handleTripSelect = (trip) => {
    navigation.navigate('TripDetail', { tripId: trip._id, tripData: trip });
  };

  // Handle filter change
  const handleFilterChange = (status) => {
    setSelectedStatus(status);
  };

  // Handle period change
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
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
      <StatusBar barStyle="light-content" backgroundColor="#4285F4" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử chuyến đi</Text>
        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => {
            Alert.alert(
              'Lọc theo trạng thái',
              'Chọn trạng thái chuyến đi',
              [
                { text: 'Tất cả', onPress: () => handleFilterChange('all') },
                { text: 'Hoàn thành', onPress: () => handleFilterChange('completed') },
                { text: 'Đã hủy', onPress: () => handleFilterChange('cancelled') },
                { text: 'Hủy', style: 'cancel' },
              ]
            );
          }}
        >
          <Ionicons name="filter-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {['week', 'month', 'year'].map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodTab,
                selectedPeriod === period && styles.activePeriodTab,
              ]}
              onPress={() => handlePeriodChange(period)}
            >
              <Text
                style={[
                  styles.periodTabText,
                  selectedPeriod === period && styles.activePeriodTabText,
                ]}
              >
                {getPeriodLabel(period)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Status Filter */}
        <View style={styles.statusFilter}>
          {['all', 'completed', 'cancelled', 'in_progress'].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.statusTab,
                selectedStatus === status && styles.activeStatusTab,
              ]}
              onPress={() => handleFilterChange(status)}
            >
              <View style={[
                styles.statusDot,
                { backgroundColor: getStatusColor(status) }
              ]} />
              <Text
                style={[
                  styles.statusTabText,
                  selectedStatus === status && styles.activeStatusTabText,
                ]}
              >
                {getStatusText(status)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Trips List */}
        <View style={styles.tripsContainer}>
          {trips.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="time-outline" size={64} color="#ccc" />
              <Text style={styles.emptyStateText}>Chưa có chuyến đi</Text>
              <Text style={styles.emptyStateSubtext}>
                {selectedStatus === 'all' 
                  ? 'Bắt đầu nhận chuyến đi để tạo lịch sử'
                  : `Không có chuyến đi ${getStatusText(selectedStatus).toLowerCase()}`
                }
              </Text>
            </View>
          ) : (
            trips.map((trip, index) => (
              <TouchableOpacity
                key={trip._id || index}
                style={styles.tripCard}
                onPress={() => handleTripSelect(trip)}
              >
                <View style={styles.tripHeader}>
                  <View style={styles.tripStatus}>
                    <View style={[
                      styles.statusDot,
                      { backgroundColor: getStatusColor(trip.status) }
                    ]} />
                    <Text style={styles.tripStatusText}>
                      {getStatusText(trip.status)}
                    </Text>
                  </View>
                  <Text style={styles.tripDate}>
                    {formatDate(trip.departureTime || trip.createdAt)}
                  </Text>
                </View>

                <View style={styles.tripRoute}>
                  <View style={styles.routePoint}>
                    <View style={styles.routeDot} />
                    <Text style={styles.routeText}>
                      {trip.startLocation?.address || 'Điểm đi'}
                    </Text>
                  </View>
                  <View style={styles.routeLine} />
                  <View style={styles.routePoint}>
                    <View style={[styles.routeDot, { backgroundColor: '#FF5722' }]} />
                    <Text style={styles.routeText}>
                      {trip.endLocation?.address || 'Điểm đến'}
                    </Text>
                  </View>
                </View>

                <View style={styles.tripDetails}>
                  <View style={styles.tripDetail}>
                    <Ionicons name="time-outline" size={16} color="#666" />
                    <Text style={styles.tripDetailText}>
                      {formatTime(trip.departureTime || trip.createdAt)}
                    </Text>
                  </View>
                  <View style={styles.tripDetail}>
                    <Ionicons name="people-outline" size={16} color="#666" />
                    <Text style={styles.tripDetailText}>
                      {trip.passengers?.length || trip.seatsRequested || 1} chỗ
                    </Text>
                  </View>
                  {trip.earnings && (
                    <View style={styles.tripDetail}>
                      <Ionicons name="cash-outline" size={16} color="#4CAF50" />
                      <Text style={[styles.tripDetailText, { color: '#4CAF50' }]}>
                        {formatCurrency(trip.earnings)}
                      </Text>
                    </View>
                  )}
                </View>

                {trip.rating && (
                  <View style={styles.tripRating}>
                    <Ionicons name="star" size={16} color="#FFD700" />
                    <Text style={styles.tripRatingText}>
                      {trip.rating.toFixed(1)} ({trip.ratingCount || 1} đánh giá)
                    </Text>
                  </View>
                )}

                <View style={styles.tripActions}>
                  <TouchableOpacity
                    style={styles.viewDetailsBtn}
                    onPress={() => handleTripSelect(trip)}
                  >
                    <Text style={styles.viewDetailsBtnText}>Xem chi tiết</Text>
                  </TouchableOpacity>
                  
                  {trip.status === 'completed' && (
                    <TouchableOpacity
                      style={styles.rateBtn}
                      onPress={() => {
                        // Navigate to rating screen
                        navigation.navigate('RatePassenger', { tripId: trip._id });
                      }}
                    >
                      <Text style={styles.rateBtnText}>Đánh giá</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Summary Stats */}
        {trips.length > 0 && (
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Thống kê {getPeriodLabel(selectedPeriod)}</Text>
            <View style={styles.summaryStats}>
              <View style={styles.summaryStat}>
                <Text style={styles.summaryStatNumber}>{trips.length}</Text>
                <Text style={styles.summaryStatLabel}>Tổng chuyến</Text>
              </View>
              <View style={styles.summaryStat}>
                <Text style={styles.summaryStatNumber}>
                  {formatCurrency(trips.reduce((sum, trip) => sum + (trip.earnings || 0), 0))}
                </Text>
                <Text style={styles.summaryStatLabel}>Tổng thu nhập</Text>
              </View>
              <View style={styles.summaryStat}>
                <Text style={styles.summaryStatNumber}>
                  {trips.filter(trip => trip.status === 'completed').length}
                </Text>
                <Text style={styles.summaryStatLabel}>Hoàn thành</Text>
              </View>
            </View>
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
    paddingTop: StatusBar.currentHeight || 44,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  filterBtn: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  periodTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activePeriodTab: {
    backgroundColor: '#4285F4',
  },
  periodTabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activePeriodTabText: {
    color: 'white',
    fontWeight: '600',
  },
  statusFilter: {
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
  statusTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  activeStatusTab: {
    backgroundColor: '#F0F8FF',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusTabText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  activeStatusTabText: {
    color: '#4285F4',
    fontWeight: '600',
  },
  tripsContainer: {
    paddingHorizontal: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
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
  tripDate: {
    fontSize: 12,
    color: '#666',
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
  tripRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 6,
  },
  tripRatingText: {
    fontSize: 12,
    color: '#666',
  },
  tripActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  viewDetailsBtn: {
    flex: 1,
    backgroundColor: '#4285F4',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewDetailsBtnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  rateBtn: {
    backgroundColor: '#FF9800',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  rateBtnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  summaryContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryStat: {
    alignItems: 'center',
  },
  summaryStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4285F4',
    marginBottom: 4,
  },
  summaryStatLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
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

export default DriverHistoryScreen;
