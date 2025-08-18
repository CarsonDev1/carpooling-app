import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import WalletCard from '../components/WalletCard';
import StatisticsCard from '../components/StatisticsCard';
import TransactionItem from '../components/TransactionItem';
import {
  getWalletBalance,
  getTransactionHistory,
  getWalletStatistics,
  rechargeWallet,
  mockRechargeWallet,
} from '../api/walletApi';
import { WebView } from 'react-native-webview';

export default function WalletScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();

  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [statisticsPeriod, setStatisticsPeriod] = useState('month');

  // Modal states
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [recharging, setRecharging] = useState(false);

  // Payment modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(0);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Refs
  const scrollViewRef = useRef();

  // State for WebView
  const [showWebView, setShowWebView] = useState(false);

  // Load initial data
  useEffect(() => {
    loadWalletData();
  }, []);

  // Load wallet data
  const loadWalletData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadBalance(),
        loadTransactions(),
        loadStatistics(),
      ]);
    } catch (error) {
      console.error('Load wallet data error:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu ví');
    } finally {
      setLoading(false);
    }
  };

  // Load balance
  const loadBalance = async () => {
    try {
      const response = await getWalletBalance();
      if (response?.success) {
        setBalance(response.data.balance || 0);
      }
    } catch (error) {
      console.error('Load balance error:', error);
    }
  };

  // Load transactions
  const loadTransactions = async (page = 1, append = false) => {
    try {
      const response = await getTransactionHistory({
        page,
        limit: 20,
      });

      if (response?.success) {
        const newTransactions = response.data || [];

        if (append) {
          setTransactions(prev => [...prev, ...newTransactions]);
        } else {
          setTransactions(newTransactions);
        }

        setHasMore(newTransactions.length === 20);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Load transactions error:', error);
    }
  };

  // Load statistics
  const loadStatistics = async () => {
    try {
      const response = await getWalletStatistics(statisticsPeriod);
      if (response?.success) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error('Load statistics error:', error);
    }
  };

  // Refresh data
  const onRefresh = async () => {
    setRefreshing(true);
    await loadWalletData();
    setRefreshing(false);
  };

  // Load more transactions
  const loadMoreTransactions = async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      await loadTransactions(currentPage + 1, true);
    } catch (error) {
      console.error('Load more transactions error:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Handle recharge
  const handleRecharge = () => {
    setShowRechargeModal(true);
  };

  // Confirm recharge
  const confirmRecharge = async () => {
    if (!rechargeAmount || isNaN(rechargeAmount) || parseFloat(rechargeAmount) <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập số tiền hợp lệ');
      return;
    }

    const amount = parseInt(rechargeAmount);
    if (amount < 10000) {
      Alert.alert('Lỗi', 'Số tiền tối thiểu là 10,000 VNĐ');
      return;
    }

    if (amount > 10000000) {
      Alert.alert('Lỗi', 'Số tiền tối đa là 10,000,000 VNĐ');
      return;
    }

    try {
      setRecharging(true);

      // Tạo return URLs
      const returnUrl = 'http://192.168.1.55:7/api/payments/vnpay/return';
      const cancelUrl = 'http://192.168.1.55:7/api/payments/vnpay/cancel';

      const response = await rechargeWallet(amount, returnUrl, cancelUrl);

      if (response?.success && response.data?.paymentUrl) {
        // Hiển thị WebView VNPay
        setPaymentUrl(response.data.paymentUrl);
        setPaymentAmount(amount);
        setShowWebView(true);
      }
    } catch (error) {
      console.error('Recharge error:', error);
      Alert.alert('Lỗi', error.message || 'Nạp tiền thất bại');
    } finally {
      setRecharging(false);
      setShowRechargeModal(false);
      setRechargeAmount('');
    }
  };

  // Handle view transactions
  const handleViewTransactions = () => {
    navigation.navigate('TransactionHistory', { transactions });
  };

  // Handle view statistics
  const handleViewStatistics = () => {
    navigation.navigate('WalletStatistics', { statistics, period: statisticsPeriod });
  };

  // Handle transaction press
  const handleTransactionPress = (transaction) => {
    navigation.navigate('TransactionDetail', { transaction });
  };

  // Handle WebView navigation state change
  const handleWebViewNavigationStateChange = (navState) => {
    const { url } = navState;
    console.log('WebView URL:', url);

    // Check for return URLs
    if (url.includes('/vnpay/return') || url.includes('vnp_ResponseCode')) {
      try {
        // Extract URL parameters
        const urlParams = new URLSearchParams(url.split('?')[1]);
        const responseCode = urlParams.get('vnp_ResponseCode');
        const transactionStatus = urlParams.get('vnp_TransactionStatus');

        console.log('Response Code:', responseCode);
        console.log('Transaction Status:', transactionStatus);

        if (responseCode === '00' && transactionStatus === '00') {
          // Payment successful
          handlePaymentSuccess({
            responseCode,
            transactionStatus,
            txnRef: urlParams.get('vnp_TxnRef'),
            amount: parseInt(urlParams.get('vnp_Amount')) / 100,
            bankCode: urlParams.get('vnp_BankCode'),
            payDate: urlParams.get('vnp_PayDate'),
          });
        } else {
          // Payment failed
          handlePaymentCancel({
            responseCode,
            message: getErrorMessage(responseCode),
          });
        }
      } catch (error) {
        console.error('Error parsing URL:', error);
        handlePaymentCancel({
          responseCode: null,
          message: 'Không thể xác định kết quả giao dịch'
        });
      }
    }

    // Check for cancel URLs
    if (url.includes('/vnpay/cancel')) {
      handlePaymentCancel({ message: 'Người dùng hủy thanh toán' });
    }
  };

  const handlePaymentSuccess = async (paymentData) => {
    console.log('Payment success:', paymentData);

    setShowWebView(false);
    setPaymentUrl('');
    setPaymentAmount(0);

    Alert.alert(
      'Thành công!',
      `Nạp tiền thành công ${paymentData.amount?.toLocaleString('vi-VN')} VNĐ`,
      [{ text: 'OK', onPress: () => loadWalletData() }]
    );
  };

  const handlePaymentCancel = (errorData) => {
    console.log('Payment cancelled:', errorData);

    setShowWebView(false);
    setPaymentUrl('');
    setPaymentAmount(0);

    Alert.alert('Thông báo', errorData.message || 'Giao dịch đã bị hủy');
  };

  const handleWebViewClose = () => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn đóng trang thanh toán? Giao dịch sẽ bị hủy.',
      [
        { text: 'Tiếp tục thanh toán', style: 'cancel' },
        {
          text: 'Đóng', style: 'destructive', onPress: () => {
            setShowWebView(false);
            setPaymentUrl('');
            setPaymentAmount(0);
          }
        },
      ]
    );
  };

  // Get error message function
  const getErrorMessage = (responseCode) => {
    const errorMessages = {
      '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ',
      '09': 'Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking',
      '10': 'Xác thực thông tin không đúng quá 3 lần',
      '11': 'Đã hết hạn chờ thanh toán',
      '12': 'Thẻ/Tài khoản bị khóa',
      '13': 'Mật khẩu OTP không đúng',
      '24': 'Khách hàng hủy giao dịch',
      '51': 'Tài khoản không đủ số dư',
      '65': 'Vượt quá hạn mức giao dịch trong ngày',
      '75': 'Ngân hàng đang bảo trì',
      '79': 'Nhập sai mật khẩu quá số lần quy định',
      '97': 'Chữ ký không hợp lệ',
      '99': 'Lỗi không xác định',
    };

    return errorMessages[responseCode] || 'Giao dịch không thành công';
  };

  // Thêm test card info vào modal
  const testCardInfo = `
  💳 VNPay Test Card:
  - Số thẻ: 9704000000000018
  - Tên chủ thẻ: NGUYEN VAN A
  - Ngày phát hành: 07/15
  - OTP: 123456
  `;

  // Handle mock payment - call real API
  const handleMockPayment = async () => {
    if (!rechargeAmount || isNaN(rechargeAmount) || parseFloat(rechargeAmount) <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập số tiền hợp lệ');
      return;
    }

    const amount = parseInt(rechargeAmount);
    if (amount < 10000) {
      Alert.alert('Lỗi', 'Số tiền tối thiểu là 10,000 VNĐ');
      return;
    }

    if (amount > 10000000) {
      Alert.alert('Lỗi', 'Số tiền tối đa là 10,000,000 VNĐ');
      return;
    }

    try {
      setRecharging(true);

      // Call mock payment API
      const response = await mockRechargeWallet(amount);

      if (response?.success) {
        // Update balance with server response
        setBalance(response.data.newBalance);

        Alert.alert(
          'Thành công! 🎉',
          `Nạp tiền thành công ${amount.toLocaleString('vi-VN')} VNĐ\nSố dư mới: ${response.data.newBalance.toLocaleString('vi-VN')} VNĐ`,
          [{ text: 'OK', onPress: () => loadWalletData() }]
        );

        setShowRechargeModal(false);
        setRechargeAmount('');

        // Reload wallet data to get updated transactions
        setTimeout(() => {
          loadWalletData();
        }, 500);
      }
    } catch (error) {
      console.error('Mock payment error:', error);
      Alert.alert('Lỗi', error.message || 'Mock payment thất bại');
    } finally {
      setRecharging(false);
    }
  };

  // Render loading
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
        <Text style={styles.loadingText}>Đang tải thông tin ví...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>

      <ScrollView
        ref={scrollViewRef}
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const paddingToBottom = 20;

          if (
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - paddingToBottom
          ) {
            loadMoreTransactions();
          }
        }}
        scrollEventThrottle={400}
      >
        {/* Wallet Card */}
        <WalletCard
          balance={balance}
          currency="VND"
          onRecharge={handleRecharge}
          onViewTransactions={handleViewTransactions}
          onViewStatistics={handleViewStatistics}
        />

        {/* Statistics Card */}
        <StatisticsCard
          statistics={statistics}
          period={statisticsPeriod}
        />

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📋 Giao dịch gần đây</Text>
            <TouchableOpacity onPress={handleViewTransactions}>
              <Text style={styles.viewAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          {transactions.length > 0 ? (
            <View>
              {transactions.slice(0, 5).map((transaction, index) => (
                <TransactionItem
                  key={transaction._id || index}
                  transaction={transaction}
                  onPress={() => handleTransactionPress(transaction)}
                  showDetails={false}
                />
              ))}

              {transactions.length > 5 && (
                <TouchableOpacity
                  style={styles.viewMoreButton}
                  onPress={handleViewTransactions}
                >
                  <Text style={styles.viewMoreText}>
                    Xem thêm {transactions.length - 5} giao dịch
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#4285F4" />
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.emptyTransactions}>
              <Ionicons name="receipt-outline" size={48} color="#CCC" />
              <Text style={styles.emptyText}>Chưa có giao dịch nào</Text>
              <Text style={styles.emptySubtext}>
                Các giao dịch sẽ xuất hiện ở đây
              </Text>
            </View>
          )}
        </View>

        {/* Loading more indicator */}
        {loadingMore && (
          <View style={styles.loadingMore}>
            <ActivityIndicator size="small" color="#4285F4" />
            <Text style={styles.loadingMoreText}>Đang tải thêm...</Text>
          </View>
        )}
      </ScrollView>

      {/* Recharge Modal */}
      <Modal
        visible={showRechargeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRechargeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nạp tiền vào ví</Text>
              <TouchableOpacity
                onPress={() => setShowRechargeModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <Text style={styles.modalLabel}>Số tiền (VNĐ)</Text>
              <TextInput
                style={styles.amountInput}
                value={rechargeAmount}
                onChangeText={setRechargeAmount}
                placeholder="Nhập số tiền muốn nạp"
                keyboardType="numeric"
                autoFocus={true}
              />

              <Text style={styles.amountNote}>
                Số tiền tối thiểu: 10,000 VNĐ
              </Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowRechargeModal(false)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>

              {/* VNPay button - Tạm pending */}
              {/* <TouchableOpacity
                style={[styles.confirmButton, recharging && styles.disabledButton]}
                onPress={confirmRecharge}
                disabled={recharging}
              >
                {recharging ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.confirmButtonText}>Nạp tiền VNPay</Text>
                )}
              </TouchableOpacity> */}

              <TouchableOpacity
                style={[styles.mockPaymentButton, recharging && styles.disabledButton]}
                onPress={handleMockPayment}
                disabled={recharging}
              >
                {recharging ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.mockPaymentButtonText}>💳 Nạp tiền (Test)</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Payment Modal (WebView) */}
      {showWebView && (
        <Modal
          visible={showWebView}
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={handleWebViewClose}
        >
          <SafeAreaView style={styles.webViewContainer}>
            {/* Header */}
            <View style={styles.webViewHeader}>
              <TouchableOpacity style={styles.webViewCloseButton} onPress={handleWebViewClose}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>

              <View style={styles.webViewHeaderCenter}>
                <Text style={styles.webViewHeaderTitle}>Thanh toán VNPay</Text>
                <Text style={styles.webViewHeaderSubtitle}>
                  {paymentAmount?.toLocaleString('vi-VN')} VNĐ
                </Text>
              </View>

              <View style={styles.webViewHeaderRight}>
                <Ionicons name="shield-checkmark" size={20} color="white" />
              </View>
            </View>

            {/* WebView */}
            <WebView
              source={{ uri: paymentUrl }}
              onNavigationStateChange={handleWebViewNavigationStateChange}
              onError={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;
                console.error('WebView error: ', nativeEvent);
                Alert.alert('Lỗi', 'Không thể tải trang thanh toán');
              }}
              startInLoadingState={true}
              scalesPageToFit={true}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              allowsInlineMediaPlayback={true}
              mixedContentMode="compatibility"
              style={styles.webView}
              renderLoading={() => (
                <View style={styles.webViewLoading}>
                  <ActivityIndicator size="large" color="#4285F4" />
                  <Text style={styles.webViewLoadingText}>Đang tải trang thanh toán...</Text>
                </View>
              )}
            />

            {/* Bottom Info */}
            <View style={styles.webViewBottomInfo}>
              <View style={styles.webViewSecurityInfo}>
                <Ionicons name="shield-checkmark" size={16} color="#4CAF50" />
                <Text style={styles.webViewSecurityText}>
                  Kết nối bảo mật SSL/TLS 256-bit
                </Text>
              </View>
            </View>
          </SafeAreaView>
        </Modal>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#4285F4',
    paddingTop: Platform.OS === 'ios' ? 44 : 25,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  settingsButton: {
    marginLeft: 16,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  viewAllText: {
    fontSize: 14,
    color: '#4285F4',
    fontWeight: '500',
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  viewMoreText: {
    fontSize: 14,
    color: '#4285F4',
    fontWeight: '500',
    marginRight: 4,
  },
  emptyTransactions: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  loadingMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingMoreText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    margin: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  amountInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
    marginBottom: 8,
  },
  amountNote: {
    fontSize: 12,
    color: '#999',
  },
  modalActions: {
    gap: 12,
  },
  cancelButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  confirmButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#4285F4',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  disabledButton: {
    opacity: 0.6,
  },

  // Payment Modal Styles
  paymentModalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    margin: 20,
    width: '90%',
    maxWidth: 400,
  },
  paymentModalContent: {
    alignItems: 'center',
  },
  paymentInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  paymentAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2C3E50',
    marginTop: 16,
    marginBottom: 8,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  paymentDetails: {
    width: '100%',
    marginBottom: 24,
  },
  paymentDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 8,
  },
  paymentDetailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    flex: 1,
  },
  paymentActions: {
    width: '100%',
    gap: 12,
  },
  primaryPaymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4285F4',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryPaymentButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },

  cancelPaymentButton: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cancelPaymentButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  copyButton: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#F8F9FA',
  },
  copyButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  testCardInfo: {
    marginTop: 20,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },

  // Mock Payment Button Styles
  mockPaymentButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#4CAF50', // A green color for mock payment
  },
  mockPaymentButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },

  // WebView Styles
  webViewContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  webViewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4285F4',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  webViewCloseButton: {
    padding: 8,
  },
  webViewHeaderCenter: {
    flex: 1,
    alignItems: 'center',
  },
  webViewHeaderTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  webViewHeaderSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    marginTop: 2,
  },
  webViewHeaderRight: {
    padding: 8,
  },
  webView: {
    flex: 1,
  },
  webViewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  webViewLoadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  webViewBottomInfo: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  webViewSecurityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  webViewSecurityText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
});
