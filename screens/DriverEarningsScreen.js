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
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getDriverEarnings, getDriverEarningsHistory } from '../api/driverApi';

const { width } = Dimensions.get('window');

const DriverEarningsScreen = () => {
  const navigation = useNavigation();
  const [earnings, setEarnings] = useState({
    today: 0,
    week: 0,
    month: 0,
    total: 0,
    trips: 0,
    hours: 0,
  });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('week'); // 'today', 'week', 'month'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'completed', 'cancelled'

  // Load earnings data
  const loadEarningsData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load earnings summary
      const earningsResponse = await getDriverEarnings();
      if (earningsResponse.success) {
        setEarnings(earningsResponse.data);
      }

      // Load earnings history
      const historyResponse = await getDriverEarningsHistory({
        period: selectedPeriod,
        status: filterStatus,
      });
      if (historyResponse.success) {
        setHistory(historyResponse.data || []);
      }
    } catch (error) {
      console.error('❌ Load earnings error:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu thu nhập. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod, filterStatus]);

  // Refresh data
  const onRefresh = useCallback(async () => {
    await loadEarningsData();
  }, [loadEarningsData]);

  // Load data on focus
  useFocusEffect(
    useCallback(() => {
      loadEarningsData();
    }, [loadEarningsData])
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

  // Get period label
  const getPeriodLabel = (period) => {
    switch (period) {
      case 'today':
        return 'Hôm nay';
      case 'week':
        return 'Tuần này';
      case 'month':
        return 'Tháng này';
      default:
        return 'Tuần này';
    }
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
      default:
        return status;
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
        <Text style={styles.headerTitle}>Thu nhập</Text>
        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => {
            // Show filter options
            Alert.alert(
              'Lọc theo trạng thái',
              'Chọn trạng thái chuyến đi',
              [
                { text: 'Tất cả', onPress: () => setFilterStatus('all') },
                { text: 'Hoàn thành', onPress: () => setFilterStatus('completed') },
                { text: 'Đã hủy', onPress: () => setFilterStatus('cancelled') },
                { text: 'Hủy', style: 'cancel' },
              ]
            );
          }}
        >
          <Ionicons name="filter-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {['today', 'week', 'month'].map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodTab,
                selectedPeriod === period && styles.activePeriodTab,
              ]}
              onPress={() => setSelectedPeriod(period)}
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

        {/* Earnings Summary */}
        <View style={styles.earningsSummary}>
          <View style={styles.earningsCard}>
            <View style={styles.earningsHeader}>
              <Ionicons name="cash-outline" size={24} color="#4CAF50" />
              <Text style={styles.earningsTitle}>Thu nhập {getPeriodLabel(selectedPeriod)}</Text>
            </View>
            <Text style={styles.earningsAmount}>
              {formatCurrency(earnings[selectedPeriod] || 0)}
            </Text>
            <View style={styles.earningsStats}>
              <View style={styles.earningsStat}>
                <Text style={styles.earningsStatLabel}>Chuyến đi</Text>
                <Text style={styles.earningsStatValue}>{earnings.trips || 0}</Text>
              </View>
              <View style={styles.earningsStat}>
                <Text style={styles.earningsStatLabel}>Giờ lái</Text>
                <Text style={styles.earningsStatValue}>{earnings.hours || 0}h</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="calendar-outline" size={20} color="#4285F4" />
            <Text style={styles.statNumber}>{formatCurrency(earnings.today || 0)}</Text>
            <Text style={styles.statLabel}>Hôm nay</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="calendar-outline" size={20} color="#4CAF50" />
            <Text style={styles.statNumber}>{formatCurrency(earnings.week || 0)}</Text>
            <Text style={styles.statLabel}>Tuần này</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="calendar-outline" size={20} color="#FF9800" />
            <Text style={styles.statNumber}>{formatCurrency(earnings.month || 0)}</Text>
            <Text style={styles.statLabel}>Tháng này</Text>
          </View>
        </View>

        {/* Total Earnings */}
        <View style={styles.totalEarnings}>
          <View style={styles.totalEarningsCard}>
            <Text style={styles.totalEarningsTitle}>Tổng thu nhập</Text>
            <Text style={styles.totalEarningsAmount}>
              {formatCurrency(earnings.total || 0)}
            </Text>
            <Text style={styles.totalEarningsSubtitle}>
              Từ {earnings.trips || 0} chuyến đi
            </Text>
          </View>
        </View>

        {/* Earnings History */}
        <View style={styles.historyContainer}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Lịch sử thu nhập</Text>
            <TouchableOpacity
              style={styles.refreshBtn}
              onPress={onRefresh}
            >
              <Ionicons name="refresh-outline" size={20} color="#4285F4" />
            </TouchableOpacity>
          </View>

          {history.length === 0 ? (
            <View style={styles.emptyHistory}>
              <Ionicons name="cash-outline" size={64} color="#ccc" />
              <Text style={styles.emptyHistoryText}>Chưa có lịch sử thu nhập</Text>
              <Text style={styles.emptyHistorySubtext}>
                Hoàn thành chuyến đi để bắt đầu kiếm tiền
              </Text>
            </View>
          ) : (
            history.map((item, index) => (
              <View key={index} style={styles.historyItem}>
                <View style={styles.historyLeft}>
                  <View style={styles.historyIcon}>
                    <Ionicons name="car" size={20} color="#4285F4" />
                  </View>
                  <View style={styles.historyContent}>
                    <Text style={styles.historyTitle}>
                      Chuyến đi đến {item.endLocation?.address || 'N/A'}
                    </Text>
                    <Text style={styles.historySubtitle}>
                      {formatDate(item.completedAt)} • {formatTime(item.completedAt)}
                    </Text>
                    <View style={styles.historyDetails}>
                      <View style={styles.historyDetail}>
                        <Ionicons name="people-outline" size={14} color="#666" />
                        <Text style={styles.historyDetailText}>
                          {item.passengers?.length || 0} hành khách
                        </Text>
                      </View>
                      <View style={styles.historyDetail}>
                        <Ionicons name="time-outline" size={14} color="#666" />
                        <Text style={styles.historyDetailText}>
                          {item.duration || 0} phút
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
                
                <View style={styles.historyRight}>
                  <Text style={styles.historyAmount}>
                    {formatCurrency(item.earnings || 0)}
                  </Text>
                  <View style={[
                    styles.historyStatus,
                    { backgroundColor: getStatusColor(item.status) }
                  ]}>
                    <Text style={styles.historyStatusText}>
                      {getStatusText(item.status)}
                    </Text>
                  </View>
                  {item.rating && (
                    <View style={styles.historyRating}>
                      <Ionicons name="star" size={14} color="#FFD700" />
                      <Text style={styles.historyRatingText}>
                        {item.rating.toFixed(1)}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))
          )}
        </View>

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 Mẹo tăng thu nhập</Text>
          <Text style={styles.tipText}>• Bật chế độ online thường xuyên</Text>
          <Text style={styles.tipText}>• Chấp nhận chuyến đi trong giờ cao điểm</Text>
          <Text style={styles.tipText}>• Duy trì đánh giá cao từ hành khách</Text>
          <Text style={styles.tipText}>• Hoàn thành chuyến đi đúng giờ</Text>
        </View>
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
  earningsSummary: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  earningsCard: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  earningsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  earningsTitle: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  earningsAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 20,
  },
  earningsStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  earningsStat: {
    alignItems: 'center',
  },
  earningsStatLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  earningsStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
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
    fontSize: 16,
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
  totalEarnings: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  totalEarningsCard: {
    backgroundColor: '#4CAF50',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  totalEarningsTitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  totalEarningsAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  totalEarningsSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  historyContainer: {
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
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  refreshBtn: {
    padding: 8,
  },
  emptyHistory: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyHistoryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyHistorySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  historyLeft: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 16,
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyContent: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  historySubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  historyDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  historyDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  historyDetailText: {
    fontSize: 12,
    color: '#666',
  },
  historyRight: {
    alignItems: 'flex-end',
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  historyStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  historyStatusText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  historyRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  historyRatingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  tipsContainer: {
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
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
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

export default DriverEarningsScreen;
