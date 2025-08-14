import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';

const VNPayWebView = ({
  paymentUrl,
  onPaymentSuccess,
  onPaymentCancel,
  onClose,
  amount
}) => {
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const webViewRef = useRef(null);

  // Handle navigation state change
  const handleNavigationStateChange = (navState) => {
    const { url, canGoBack, canGoForward } = navState;
    setCanGoBack(canGoBack);
    setCanGoForward(canGoForward);

    console.log('WebView URL:', url);

    // Check for return URLs - both your configured return URL and VNPay's possible redirects
    const isReturnUrl = url.includes('/vnpay/return') ||
      url.includes('192.168.1.55:5000/api/payments/vnpay/return') ||
      url.includes('/api/payments/vnpay/return');

    // Check for cancel URLs
    const isCancelUrl = url.includes('/vnpay/cancel') ||
      url.includes('192.168.1.55:5000/api/payments/vnpay/cancel') ||
      url.includes('/api/payments/vnpay/cancel');

    // Also check if URL contains VNPay response parameters directly
    const hasVnpayParams = url.includes('vnp_ResponseCode') && url.includes('vnp_TransactionStatus');

    if (isReturnUrl || hasVnpayParams) {
      try {
        // Extract URL parameters
        const urlParts = url.split('?');
        if (urlParts.length > 1) {
          const urlParams = new URLSearchParams(urlParts[1]);
          const responseCode = urlParams.get('vnp_ResponseCode');
          const transactionStatus = urlParams.get('vnp_TransactionStatus');

          console.log('Response Code:', responseCode);
          console.log('Transaction Status:', transactionStatus);

          if (responseCode === '00' && transactionStatus === '00') {
            // Payment successful
            const txnRef = urlParams.get('vnp_TxnRef');
            const amountParam = urlParams.get('vnp_Amount');
            const bankCode = urlParams.get('vnp_BankCode');
            const payDate = urlParams.get('vnp_PayDate');

            onPaymentSuccess({
              responseCode,
              transactionStatus,
              txnRef,
              amount: amountParam ? parseInt(amountParam) / 100 : amount,
              bankCode,
              payDate,
            });
          } else {
            // Payment failed
            onPaymentCancel({
              responseCode,
              message: getErrorMessage(responseCode),
            });
          }
        } else {
          // If no parameters found but it's a return URL, treat as cancelled
          onPaymentCancel({
            responseCode: null,
            message: 'Không thể xác định kết quả giao dịch'
          });
        }
      } catch (error) {
        console.error('Error parsing payment response:', error);
        onPaymentCancel({
          responseCode: null,
          message: 'Lỗi xử lý kết quả thanh toán'
        });
      }
    } else if (isCancelUrl) {
      onPaymentCancel({ message: 'Người dùng hủy thanh toán' });
    }

    // Handle specific VNPay error pages or timeout pages
    if (url.includes('error') || url.includes('timeout') || url.includes('fail')) {
      onPaymentCancel({ message: 'Giao dịch thất bại hoặc hết thời gian' });
    }
  };

  // Handle message from WebView (alternative method to catch redirects)
  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('WebView message:', data);

      if (data.type === 'payment_result') {
        if (data.success) {
          onPaymentSuccess(data.data);
        } else {
          onPaymentCancel(data.data);
        }
      }
    } catch (error) {
      console.log('WebView message (not JSON):', event.nativeEvent.data);
    }
  };

  // Get error message from response code
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

  // Handle back button
  const handleGoBack = () => {
    if (canGoBack) {
      webViewRef.current?.goBack();
    }
  };

  // Handle forward button
  const handleGoForward = () => {
    if (canGoForward) {
      webViewRef.current?.goForward();
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    webViewRef.current?.reload();
  };

  // Handle close
  const handleClose = () => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn đóng trang thanh toán? Giao dịch sẽ bị hủy.',
      [
        { text: 'Tiếp tục thanh toán', style: 'cancel' },
        { text: 'Đóng', style: 'destructive', onPress: onClose },
      ]
    );
  };

  // Inject JavaScript to capture form submissions and redirects
  const injectedJavaScript = `
    (function() {
      // Monitor for form submissions
      const forms = document.querySelectorAll('form');
      forms.forEach(form => {
        form.addEventListener('submit', function(e) {
          console.log('Form submitted:', form.action);
        });
      });

      // Monitor for URL changes
      let currentUrl = window.location.href;
      const urlChecker = setInterval(() => {
        if (window.location.href !== currentUrl) {
          currentUrl = window.location.href;
          console.log('URL changed to:', currentUrl);
          
          // Check if this is a result page
          if (currentUrl.includes('vnp_ResponseCode') || 
              currentUrl.includes('return') || 
              currentUrl.includes('cancel')) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'url_change',
              url: currentUrl
            }));
          }
        }
      }, 1000);

      // Clean up on page unload
      window.addEventListener('beforeunload', () => {
        clearInterval(urlChecker);
      });

      true; // Note: this is required, or you'll sometimes get silent failures
    })();
  `;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Thanh toán VNPay</Text>
          <Text style={styles.headerSubtitle}>
            {amount?.toLocaleString('vi-VN')} VNĐ
          </Text>
        </View>

        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Ionicons name="refresh" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Navigation Bar */}
      <View style={styles.navigationBar}>
        <TouchableOpacity
          style={[styles.navButton, !canGoBack && styles.navButtonDisabled]}
          onPress={handleGoBack}
          disabled={!canGoBack}
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color={canGoBack ? '#4285F4' : '#ccc'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, !canGoForward && styles.navButtonDisabled]}
          onPress={handleGoForward}
          disabled={!canGoForward}
        >
          <Ionicons
            name="chevron-forward"
            size={20}
            color={canGoForward ? '#4285F4' : '#ccc'}
          />
        </TouchableOpacity>

        <View style={styles.urlContainer}>
          <Ionicons name="lock-closed" size={16} color="#4CAF50" />
          <Text style={styles.urlText}>sandbox.vnpayment.vn</Text>
        </View>
      </View>

      {/* WebView */}
      <View style={styles.webViewContainer}>
        <WebView
          ref={webViewRef}
          source={{ uri: paymentUrl }}
          onNavigationStateChange={handleNavigationStateChange}
          onMessage={handleMessage}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('WebView error: ', nativeEvent);
            Alert.alert('Lỗi', 'Không thể tải trang thanh toán');
          }}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('WebView HTTP error: ', nativeEvent);
            if (nativeEvent.statusCode >= 400) {
              Alert.alert('Lỗi', `Lỗi tải trang: ${nativeEvent.statusCode}`);
            }
          }}
          injectedJavaScript={injectedJavaScript}
          startInLoadingState={true}
          scalesPageToFit={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsInlineMediaPlayback={true}
          mixedContentMode="compatibility"
          thirdPartyCookiesEnabled={true}
          sharedCookiesEnabled={true}
          style={styles.webView}
        />

        {/* Loading Overlay */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#4285F4" />
            <Text style={styles.loadingText}>Đang tải trang thanh toán...</Text>
          </View>
        )}
      </View>

      {/* Bottom Info */}
      <View style={styles.bottomInfo}>
        <View style={styles.securityInfo}>
          <Ionicons name="shield-checkmark" size={16} color="#4CAF50" />
          <Text style={styles.securityText}>
            Kết nối bảo mật SSL/TLS 256-bit
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
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
  closeButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    marginTop: 2,
  },
  refreshButton: {
    padding: 8,
  },
  navigationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  navButton: {
    padding: 8,
    marginRight: 8,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  urlContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 8,
  },
  urlText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  webViewContainer: {
    flex: 1,
    position: 'relative',
  },
  webView: {
    flex: 1,
  },
  loadingOverlay: {
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  bottomInfo: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
});

export default VNPayWebView;