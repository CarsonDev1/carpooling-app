import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const StatisticsCard = ({
  statistics,
  period = 'month',
  onPeriodChange
}) => {

  const formatAmount = (amount) => {
    return amount.toLocaleString('vi-VN');
  };

  const getPeriodText = (period) => {
    switch (period) {
      case 'today':
        return 'Hôm nay';
      case 'week':
        return '7 ngày qua';
      case 'month':
        return '30 ngày qua';
      case 'year':
        return '1 năm qua';
      case 'all':
        return 'Tất cả';
      default:
        return '30 ngày qua';
    }
  };

  const getPeriodIcon = (period) => {
    switch (period) {
      case 'today':
        return 'today';
      case 'week':
        return 'calendar';
      case 'month':
        return 'calendar-outline';
      case 'year':
        return 'calendar-clear';
      case 'all':
        return 'infinite';
      default:
        return 'calendar-outline';
    }
  };

  const StatItem = ({ icon, title, value, color, subtitle }) => (
    <View style={styles.statItem}>
      <View style={[styles.statIcon, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue} numberOfLines={1}>
          {formatAmount(value)} VNĐ
        </Text>
        <Text style={styles.statTitle}>{title}</Text>
        {subtitle && (
          <Text style={styles.statSubtitle}>{subtitle}</Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="analytics" size={20} color="#4285F4" />
          <Text style={styles.headerTitle}>Thống kê ví</Text>
        </View>
        <View style={styles.periodContainer}>
          <Ionicons name={getPeriodIcon(period)} size={16} color="#666" />
          <Text style={styles.periodText}>{getPeriodText(period)}</Text>
        </View>
      </View>

      {/* Statistics Grid */}
      <View style={styles.statsGrid}>
        <StatItem
          icon="wallet"
          title="Số dư hiện tại"
          value={statistics?.currentBalance || 0}
          color="#4285F4"
          subtitle="Tiền có sẵn"
        />

        <StatItem
          icon="trending-up"
          title="Tổng thu nhập"
          value={statistics?.totalEarnings || 0}
          color="#34A853"
          subtitle="Từ chuyến đi"
        />

        <StatItem
          icon="trending-down"
          title="Tổng chi tiêu"
          value={statistics?.totalSpendings || 0}
          color="#EA4335"
          subtitle="Cho chuyến đi"
        />

        <StatItem
          icon="add-circle"
          title="Tổng nạp tiền"
          value={statistics?.totalDeposits || 0}
          color="#FF6B35"
          subtitle="Từ ngân hàng"
        />
      </View>

      {/* Additional Stats */}
      <View style={styles.additionalStats}>
        <View style={styles.additionalStatItem}>
          <Text style={styles.additionalStatLabel}>Hoàn tiền</Text>
          <Text style={[styles.additionalStatValue, { color: '#34A853' }]}>
            {formatAmount(statistics?.totalRefunds || 0)} VNĐ
          </Text>
        </View>

        <View style={styles.additionalStatItem}>
          <Text style={styles.additionalStatLabel}>Số giao dịch</Text>
          <Text style={[styles.additionalStatValue, { color: '#4285F4' }]}>
            {statistics?.transactionCount || 0}
          </Text>
        </View>
      </View>

      {/* Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Tổng thu:</Text>
          <Text style={[styles.summaryValue, { color: '#34A853' }]}>
            {formatAmount((statistics?.totalEarnings || 0) + (statistics?.totalDeposits || 0))} VNĐ
          </Text>
        </View>

        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Tổng chi:</Text>
          <Text style={[styles.summaryValue, { color: '#EA4335' }]}>
            {formatAmount(statistics?.totalSpendings || 0)} VNĐ
          </Text>
        </View>

        <View style={[styles.summaryItem, styles.netBalanceItem]}>
          <Text style={styles.summaryLabel}>Số dư ròng:</Text>
          <Text style={[
            styles.summaryValue,
            {
              color: (statistics?.currentBalance || 0) >= 0 ? '#34A853' : '#EA4335'
            }
          ]}>
            {formatAmount(statistics?.currentBalance || 0)} VNĐ
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginLeft: 8,
  },
  periodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  periodText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    width: (width - 72) / 2, // 2 cột với padding và gap
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  statTitle: {
    fontSize: 11,
    color: '#666',
    marginBottom: 1,
  },
  statSubtitle: {
    fontSize: 9,
    color: '#999',
  },
  additionalStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  additionalStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  additionalStatLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  additionalStatValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  summaryContainer: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  netBalanceItem: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 8,
    marginTop: 8,
  },
});

export default StatisticsCard;
