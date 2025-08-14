import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const WalletCard = ({
  balance = 0,
  currency = 'VND',
  onRecharge,
  onViewTransactions,
  onViewStatistics
}) => {

  const formatBalance = (amount) => {
    return amount.toLocaleString('vi-VN');
  };

  const getBalanceColor = (amount) => {
    if (amount >= 1000000) return '#34A853'; // Xanh lá cho số dư cao
    if (amount >= 500000) return '#4285F4'; // Xanh dương cho số dư trung bình
    if (amount >= 100000) return '#FF6B35'; // Cam cho số dư thấp
    return '#EA4335'; // Đỏ cho số dư rất thấp
  };

  const getBalanceStatus = (amount) => {
    if (amount >= 1000000) return 'Tốt';
    if (amount >= 500000) return 'Khá';
    if (amount >= 100000) return 'Trung bình';
    return 'Thấp';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <Ionicons name="wallet" size={24} color="#4285F4" />
          </View>
          <View>
            <Text style={styles.title}>Ví điện tử</Text>
            <Text style={styles.subtitle}>Số dư hiện tại</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Balance Display */}
      <View style={styles.balanceContainer}>
        <Text style={styles.currency}>{currency}</Text>
        <Text style={[styles.balance, { color: getBalanceColor(balance) }]}>
          {formatBalance(balance)}
        </Text>
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: getBalanceColor(balance) }]} />
          <Text style={styles.statusText}>
            Trạng thái: {getBalanceStatus(balance)}
          </Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.rechargeButton]}
          onPress={onRecharge}
        >
          <Ionicons name="add-circle" size={20} color="white" />
          <Text style={styles.actionButtonText}>Nạp tiền</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.transactionsButton]}
          onPress={onViewTransactions}
        >
          <Ionicons name="list" size={20} color="#4285F4" />
          <Text style={[styles.actionButtonText, { color: '#4285F4' }]}>Giao dịch</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.statsButton]}
          onPress={onViewStatistics}
        >
          <Ionicons name="analytics" size={20} color="#34A853" />
          <Text style={[styles.actionButtonText, { color: '#34A853' }]}>Thống kê</Text>
        </TouchableOpacity>
      </View>

      {/* Balance Tips */}
      {balance < 100000 && (
        <View style={styles.tipContainer}>
          <Ionicons name="information-circle" size={16} color="#FF6B35" />
          <Text style={styles.tipText}>
            Số dư thấp! Hãy nạp tiền để sử dụng dịch vụ.
          </Text>
        </View>
      )}
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
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  settingsButton: {
    padding: 8,
  },
  balanceContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  currency: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  balance: {
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  rechargeButton: {
    backgroundColor: '#4285F4',
  },
  transactionsButton: {
    backgroundColor: '#F0F7FF',
    borderWidth: 1,
    borderColor: '#E0E8FF',
  },
  statsButton: {
    backgroundColor: '#F0FFF4',
    borderWidth: 1,
    borderColor: '#E0F8E0',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8F0',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B35',
  },
  tipText: {
    fontSize: 12,
    color: '#FF6B35',
    marginLeft: 8,
    flex: 1,
    fontWeight: '500',
  },
});

export default WalletCard;
