import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function PaymentSuccessScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  
  const { tripId, amount, transactionNo } = route.params || {};

  const handleGoToTripDetail = () => {
    navigation.navigate('TripDetail', { tripId });
  };

  const handleBackToHome = () => {
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thanh toán thành công</Text>
      </View>

      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={60} color="white" />
          </View>
          <Text style={styles.successTitle}>Thanh toán thành công!</Text>
          <Text style={styles.successMessage}>
            Chuyến đi đã được xác nhận. Tài xế sẽ liên hệ với bạn sớm!
          </Text>
        </View>

        {/* Payment Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Chi tiết thanh toán</Text>
          
          {amount && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Số tiền:</Text>
              <Text style={styles.detailValue}>
                {amount.toLocaleString('vi-VN')} VND
              </Text>
            </View>
          )}
          
          {transactionNo && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Mã giao dịch:</Text>
              <Text style={styles.detailValue}>{transactionNo}</Text>
            </View>
          )}
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Trạng thái:</Text>
            <Text style={[styles.detailValue, styles.successValue]}>
              Thành công
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Thời gian:</Text>
            <Text style={styles.detailValue}>
              {new Date().toLocaleString('vi-VN')}
            </Text>
          </View>
        </View>

        {/* Next Steps */}
        <View style={styles.nextStepsCard}>
          <Text style={styles.nextStepsTitle}>Bước tiếp theo</Text>
          <View style={styles.stepRow}>
            <Ionicons name="phone" size={20} color="#4285F4" />
            <Text style={styles.stepText}>
              Tài xế sẽ liên hệ với bạn qua điện thoại
            </Text>
          </View>
          <View style={styles.stepRow}>
            <Ionicons name="time" size={20} color="#4285F4" />
            <Text style={styles.stepText}>
              Chuẩn bị sẵn sàng đúng giờ khởi hành
            </Text>
          </View>
          <View style={styles.stepRow}>
            <Ionicons name="location" size={20} color="#4285F4" />
            <Text style={styles.stepText}>
              Đợi tài xế tại điểm đón đã thống nhất
            </Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={handleBackToHome}
        >
          <Text style={styles.secondaryBtnText}>Về trang chủ</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={handleGoToTripDetail}
        >
          <Text style={styles.primaryBtnText}>Xem chi tiết chuyến đi</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  
  header: {
    backgroundColor: '#4CAF50',
    paddingTop: StatusBar.currentHeight || 44,
    paddingBottom: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },

  content: {
    flex: 1,
    padding: 16,
  },

  successContainer: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },

  detailsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  successValue: {
    color: '#4CAF50',
  },

  nextStepsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  nextStepsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    flex: 1,
  },

  actionsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: '#4285F4',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
}); 