import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TransactionItem = ({
  transaction,
  onPress,
  showDetails = false
}) => {

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit':
        return 'add-circle';
      case 'withdrawal':
        return 'remove-circle';
      case 'trip_payment':
        return 'car';
      case 'trip_earning':
        return 'trending-up';
      case 'refund':
        return 'refresh-circle';
      default:
        return 'card';
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'deposit':
      case 'trip_earning':
      case 'refund':
        return '#34A853'; // Xanh lá cho tiền vào
      case 'withdrawal':
      case 'trip_payment':
        return '#EA4335'; // Đỏ cho tiền ra
      default:
        return '#666';
    }
  };

  const getTransactionTypeText = (type) => {
    switch (type) {
      case 'deposit':
        return 'Nạp tiền';
      case 'withdrawal':
        return 'Rút tiền';
      case 'trip_payment':
        return 'Thanh toán chuyến đi';
      case 'trip_earning':
        return 'Thu nhập chuyến đi';
      case 'refund':
        return 'Hoàn tiền';
      default:
        return 'Giao dịch khác';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#34A853';
      case 'pending':
        return '#FF6B35';
      case 'failed':
        return '#EA4335';
      case 'cancelled':
        return '#666';
      default:
        return '#666';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Thành công';
      case 'pending':
        return 'Đang xử lý';
      case 'failed':
        return 'Thất bại';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return 'Không xác định';
    }
  };

  const formatAmount = (amount) => {
    const isPositive = ['deposit', 'trip_earning', 'refund'].includes(transaction.type);
    const sign = isPositive ? '+' : '-';
    return `${sign}${Math.abs(amount).toLocaleString('vi-VN')} VNĐ`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Hôm nay';
    } else if (diffDays === 2) {
      return 'Hôm qua';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} ngày trước`;
    } else {
      return date.toLocaleDateString('vi-VN');
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Icon và thông tin chính */}
      <View style={styles.mainContent}>
        <View style={[
          styles.iconContainer,
          { backgroundColor: `${getTransactionColor(transaction.type)}20` }
        ]}>
          <Ionicons
            name={getTransactionIcon(transaction.type)}
            size={24}
            color={getTransactionColor(transaction.type)}
          />
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.typeText}>
            {getTransactionTypeText(transaction.type)}
          </Text>

          {showDetails && transaction.description && (
            <Text style={styles.descriptionText} numberOfLines={2}>
              {transaction.description}
            </Text>
          )}

          <Text style={styles.dateText}>
            {formatDate(transaction.createdAt)}
          </Text>
        </View>
      </View>

      {/* Số tiền và trạng thái */}
      <View style={styles.rightContent}>
        <Text style={[
          styles.amountText,
          { color: getTransactionColor(transaction.type) }
        ]}>
          {formatAmount(transaction.amount)}
        </Text>

        <View style={styles.statusContainer}>
          <View style={[
            styles.statusDot,
            { backgroundColor: getStatusColor(transaction.status) }
          ]} />
          <Text style={[
            styles.statusText,
            { color: getStatusColor(transaction.status) }
          ]}>
            {getStatusText(transaction.status)}
          </Text>
        </View>

        {/* Số dư sau giao dịch */}
        {showDetails && transaction.balanceAfter && (
          <Text style={styles.balanceAfterText}>
            Số dư: {transaction.balanceAfter.toLocaleString('vi-VN')} VNĐ
          </Text>
        )}
      </View>

      {/* Arrow indicator */}
      <Ionicons name="chevron-forward" size={16} color="#CCC" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  typeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  rightContent: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  balanceAfterText: {
    fontSize: 10,
    color: '#999',
  },
});

export default TransactionItem;
