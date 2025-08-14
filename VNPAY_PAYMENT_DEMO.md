# 🚀 **DEMO THANH TOÁN VNPAY - CARPOOLING APP**

## 📱 **CÁCH TEST THANH TOÁN VNPAY**

### **1. Khởi động app**
```bash
cd carpooling-app
npm start
```

### **2. Đăng nhập vào app**
- Mở app trên thiết bị/emulator
- Đăng nhập với tài khoản đã có

### **3. Truy cập Wallet**
- Tab "Ví" ở bottom navigation
- Hoặc từ HomeScreen → Wallet Card
- Hoặc từ ProfileScreen → "Ví điện tử"

### **4. Nạp tiền**
- Nhấn nút "Nạp tiền" trên WalletCard
- Nhập số tiền (tối thiểu 10,000 VNĐ)
- Nhấn "Nạp tiền"

### **5. Modal thanh toán VNPay**
- Hiển thị thông tin thanh toán
- Số tiền cần thanh toán
- Thông tin bảo mật và phương thức thanh toán

### **6. Thực hiện thanh toán**
- Nhấn "Mở trang thanh toán"
- App sẽ mở trình duyệt với URL VNPay
- Hoặc nhấn "Sao chép URL" để copy link

## 🔧 **CÁC TÍNH NĂNG ĐÃ IMPLEMENT**

### ✅ **WalletScreen**
- Modal nạp tiền với validation
- Modal hiển thị thông tin thanh toán VNPay
- Tích hợp API `rechargeWallet`
- Xử lý lỗi và loading states

### ✅ **Payment Modal**
- Hiển thị số tiền cần thanh toán
- Thông tin bảo mật và phương thức thanh toán
- Nút mở trang thanh toán (external browser)
- Nút sao chép URL thanh toán
- Nút hủy bỏ

### ✅ **API Integration**
- `walletApi.rechargeWallet()` - Tạo yêu cầu nạp tiền
- Tự động tạo return URLs cho VNPay
- Xử lý response và hiển thị payment URL

### ✅ **Error Handling**
- Validation số tiền (10,000 - 10,000,000 VNĐ)
- Xử lý lỗi API
- Loading states
- User feedback

## 🌐 **FLOW THANH TOÁN VNPAY**

### **1. User nhập số tiền**
```
User → Nhập số tiền → Validation → API call
```

### **2. Backend tạo payment**
```
Frontend → rechargeWallet() → Backend → VNPay → Payment URL
```

### **3. Hiển thị thanh toán**
```
Payment URL → Modal thanh toán → External browser → VNPay
```

### **4. Return từ VNPay**
```
VNPay → Return URL → App (deep link) → Cập nhật số dư
```

## 📋 **TEST CASES**

### **✅ Test Case 1: Nạp tiền thành công**
1. Nhập số tiền hợp lệ (50,000 VNĐ)
2. Nhấn "Nạp tiền"
3. Modal thanh toán hiển thị
4. Nhấn "Mở trang thanh toán"
5. Trình duyệt mở VNPay
6. Hoàn tất thanh toán
7. Return về app

### **✅ Test Case 2: Validation số tiền**
1. Nhập số tiền < 10,000 VNĐ → Error
2. Nhập số tiền > 10,000,000 VNĐ → Error
3. Nhập text → Error
4. Nhập số tiền hợp lệ → Success

### **✅ Test Case 3: Hủy bỏ thanh toán**
1. Mở modal thanh toán
2. Nhấn "Hủy bỏ"
3. Modal đóng
4. Quay về WalletScreen

### **✅ Test Case 4: Sao chép URL**
1. Mở modal thanh toán
2. Nhấn "Sao chép URL"
3. URL được copy (Alert hiển thị)

## 🚨 **LƯU Ý QUAN TRỌNG**

### **1. Backend phải chạy**
- Server VNPay phải hoạt động
- API endpoints phải accessible
- Database connection OK

### **2. Network connectivity**
- App cần internet để gọi API
- External browser cần internet để mở VNPay

### **3. Deep linking**
- Return URLs: `carpooling://wallet/recharge-success`
- Cancel URLs: `carpooling://wallet/recharge-cancel`

### **4. Sandbox mode**
- VNPay đang ở chế độ sandbox
- Test với thẻ giả hoặc sandbox credentials

## 🔮 **TÍNH NĂNG TƯƠNG LAI**

### **1. WebView Integration**
- Hiển thị VNPay trực tiếp trong app
- Không cần mở external browser

### **2. Payment Status Tracking**
- Real-time tracking trạng thái thanh toán
- Push notifications khi hoàn tất

### **3. Payment History**
- Lưu lịch sử các lần nạp tiền
- Trạng thái: pending, success, failed

### **4. Auto-refresh Balance**
- Tự động cập nhật số dư sau thanh toán
- Polling hoặc WebSocket

## 📞 **SUPPORT**

Nếu gặp vấn đề:
1. Kiểm tra console logs
2. Kiểm tra network connectivity
3. Kiểm tra backend status
4. Kiểm tra VNPay sandbox status

---

**🎉 CHÚC BẠN TEST THÀNH CÔNG! 🎉**
