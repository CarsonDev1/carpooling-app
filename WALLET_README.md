# 💰 Wallet System - Hệ thống ví điện tử

Hệ thống ví điện tử hoàn chỉnh cho ứng dụng carpooling với đầy đủ tính năng quản lý tài chính.

## ✨ Tính năng chính

### 🏦 **Quản lý ví**

-   **Xem số dư** hiện tại với trạng thái màu sắc
-   **Nạp tiền** qua VNPay với số tiền tùy chọn
-   **Kiểm tra số dư** đủ để thanh toán chuyến đi
-   **Cảnh báo số dư thấp** khi dưới 100,000 VNĐ

### 📊 **Thống kê chi tiết**

-   **Thống kê theo thời gian**: Hôm nay, 7 ngày, 30 ngày, 1 năm, tất cả
-   **Tổng thu nhập** từ chuyến đi
-   **Tổng chi tiêu** cho chuyến đi
-   **Tổng nạp tiền** từ ngân hàng
-   **Số dư ròng** và số giao dịch

### 💳 **Lịch sử giao dịch**

-   **Xem tất cả giao dịch** với pagination
-   **Lọc theo loại**: Nạp tiền, rút tiền, thanh toán, thu nhập, hoàn tiền
-   **Lọc theo trạng thái**: Thành công, đang xử lý, thất bại, đã hủy
-   **Lọc theo thời gian** với date range picker
-   **Chi tiết giao dịch** với thông tin đầy đủ

### 🔄 **Tích hợp thanh toán**

-   **VNPay integration** cho nạp tiền
-   **Tự động xử lý** thanh toán chuyến đi
-   **Webhook handling** cho cập nhật trạng thái
-   **Return URL handling** cho mobile app

## 🏗️ Kiến trúc hệ thống

### **Components**

```
📁 components/
├── 🎴 WalletCard.js          # Card hiển thị ví chính
├── 📊 StatisticsCard.js      # Card thống kê
└── 💳 TransactionItem.js     # Item giao dịch
```

### **Screens**

```
📁 screens/
└── 💰 WalletScreen.js        # Màn hình chính ví
```

### **API**

```
📁 api/
└── 💰 walletApi.js           # API client cho wallet
```

## 🎯 Cách sử dụng

### **1. Import và sử dụng WalletCard**

```jsx
import WalletCard from '../components/WalletCard';

<WalletCard
	balance={500000}
	currency='VND'
	onRecharge={() => handleRecharge()}
	onViewTransactions={() => handleViewTransactions()}
	onViewStatistics={() => handleViewStatistics()}
/>;
```

### **2. Import và sử dụng StatisticsCard**

```jsx
import StatisticsCard from '../components/StatisticsCard';

<StatisticsCard statistics={walletStats} period='month' onPeriodChange={(newPeriod) => setPeriod(newPeriod)} />;
```

### **3. Import và sử dụng TransactionItem**

```jsx
import TransactionItem from '../components/TransactionItem';

<TransactionItem
	transaction={transactionData}
	onPress={() => handleTransactionPress(transaction)}
	showDetails={true}
/>;
```

### **4. Sử dụng WalletScreen**

```jsx
import WalletScreen from '../screens/WalletScreen';

// Trong navigation
<Stack.Screen name='Wallet' component={WalletScreen} />;
```

## 🔌 API Endpoints

### **Wallet Management**

```javascript
// Lấy số dư
GET /api/wallet/balance

// Kiểm tra số dư đủ
POST /api/wallet/check-balance
Body: { amount: 100000 }

// Lấy lịch sử giao dịch
GET /api/wallet/transactions?page=1&limit=20&type=deposit

// Lấy thống kê
GET /api/wallet/statistics?period=month
```

### **Payment Integration**

```javascript
// Nạp tiền
POST /api/payments/recharge
Body: {
  amount: 100000,
  returnUrl: "app://wallet/success",
  cancelUrl: "app://wallet/cancel"
}

// Lấy lịch sử thanh toán
GET /api/payments?page=1&limit=20
```

## 🎨 UI/UX Features

### **Responsive Design**

-   **Mobile-first** approach
-   **Grid layout** cho thống kê
-   **Card design** với shadow và border radius
-   **Touch-friendly** buttons và interactions

### **Color System**

-   **Số dư cao** (≥1M): Xanh lá (#34A853)
-   **Số dư trung bình** (≥500K): Xanh dương (#4285F4)
-   **Số dư thấp** (≥100K): Cam (#FF6B35)
-   **Số dư rất thấp** (<100K): Đỏ (#EA4335)

### **Icon System**

-   **Ionicons** cho tất cả icons
-   **Màu sắc nhất quán** với theme
-   **Size phù hợp** cho mobile

## 📱 Navigation Flow

### **Main Wallet Screen**

```
WalletScreen
├── WalletCard (Số dư + Actions)
├── StatisticsCard (Thống kê)
└── Recent Transactions (5 giao dịch gần nhất)
```

### **Navigation Actions**

```
WalletCard Actions:
├── Nạp tiền → Recharge Modal
├── Xem giao dịch → TransactionHistory
└── Xem thống kê → WalletStatistics

Transaction Item:
└── Tap → TransactionDetail
```

## 🔒 Security Features

### **Authentication**

-   **JWT required** cho tất cả wallet endpoints
-   **User isolation** - chỉ xem được giao dịch của mình
-   **Input validation** cho số tiền nạp

### **Payment Security**

-   **VNPay integration** với hash verification
-   **Return URL validation** để prevent fraud
-   **Amount limits** (10K - 10M VNĐ)

## 🧪 Testing

### **Component Testing**

```bash
# Test WalletCard
npm test -- --testNamePattern="WalletCard"

# Test StatisticsCard
npm test -- --testNamePattern="StatisticsCard"

# Test TransactionItem
npm test -- --testNamePattern="TransactionItem"
```

### **API Testing**

```bash
# Test wallet endpoints
npm test -- --testNamePattern="wallet"

# Test payment endpoints
npm test -- --testNamePattern="payment"
```

## 🚀 Deployment

### **Environment Variables**

```env
# VNPay Configuration
VNPAY_TMN_CODE=your_tmn_code
VNPAY_HASH_SECRET=your_hash_secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html

# App Configuration
APP_SCHEME=carpooling
WALLET_MIN_AMOUNT=10000
WALLET_MAX_AMOUNT=10000000
```

### **Production Checklist**

-   [ ] **VNPay production** credentials
-   [ ] **SSL certificates** cho payment URLs
-   [ ] **Webhook endpoints** cho production
-   [ ] **Error monitoring** và logging
-   [ ] **Rate limiting** cho payment endpoints

## 🔄 Future Enhancements

### **Planned Features**

-   [ ] **QR Code** cho nạp tiền
-   [ ] **Bank transfer** integration
-   [ ] **Credit card** support
-   [ ] **Split payment** cho chuyến đi nhóm
-   [ ] **Auto-recharge** khi số dư thấp

### **Technical Improvements**

-   [ ] **Real-time updates** với WebSocket
-   [ ] **Push notifications** cho giao dịch
-   [ ] **Offline support** với local storage
-   [ ] **Biometric authentication** cho giao dịch lớn
-   [ ] **Multi-currency** support

## 📚 Documentation

### **API Documentation**

-   **Swagger docs**: `/api-docs`
-   **Postman collection**: `docs/postman/wallet-api.json`
-   **API examples**: `docs/api-examples/wallet.md`

### **Component Documentation**

-   **Storybook**: `docs/storybook/wallet-components`
-   **Usage examples**: `docs/components/wallet-usage.md`
-   **Props reference**: `docs/components/wallet-props.md`

## 🆘 Support

### **Common Issues**

1. **Payment failed**: Kiểm tra VNPay credentials
2. **Balance not updated**: Kiểm tra webhook endpoints
3. **Transaction not showing**: Kiểm tra database connection

### **Contact**

-   **Developer**: [Your Name]
-   **Email**: [your.email@example.com]
-   **GitHub Issues**: [Repository Issues]

---

**Wallet System** đã sẵn sàng cho production với đầy đủ tính năng bảo mật và UI/UX chuyên nghiệp! 🎉
