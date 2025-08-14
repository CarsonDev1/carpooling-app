# 🚗 VehicleTypeSelector Component

Component hiển thị danh sách loại xe với hình ảnh và tự động tính giá.

## ✨ Tính năng

- **Hiển thị hình ảnh** cho từng loại xe
- **Tự động tính giá** khi thay đổi loại xe
- **UI đẹp** với card design và màu sắc riêng cho từng loại xe
- **Responsive** với grid layout 2 cột
- **Hiển thị giá ước tính** tích hợp

## 🎯 Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `vehicleTypes` | Array | ✅ | Danh sách loại xe |
| `selectedVehicleType` | String | ✅ | Loại xe đang được chọn |
| `onVehicleTypeChange` | Function | ✅ | Callback khi thay đổi loại xe |
| `estimatedPrice` | Object | ❌ | Thông tin giá ước tính |
| `onPriceUpdate` | Function | ❌ | Callback khi cập nhật giá |

## 📱 Cách sử dụng

```jsx
import VehicleTypeSelector from '../components/VehicleTypeSelector';

// Trong component
<VehicleTypeSelector
  vehicleTypes={vehicleTypes}
  selectedVehicleType={vehicleType}
  onVehicleTypeChange={handleVehicleTypeChange}
  estimatedPrice={estimatedPrice}
  onPriceUpdate={handlePriceUpdate}
/>
```

## 🚗 Cấu trúc dữ liệu VehicleType

```javascript
{
  key: 'car',                    // Key duy nhất
  name: 'Ô tô',                  // Tên hiển thị
  baseRate: 10000,               // Giá cơ bản (VNĐ/km)
  description: 'Mô tả loại xe',  // Mô tả chi tiết
  maxPassengers: 4               // Số ghế tối đa
}
```

## 🎨 Styling

Component sử dụng:
- **Grid layout** 2 cột responsive
- **Card design** với shadow và border radius
- **Màu sắc riêng** cho từng loại xe
- **Icon Ionicons** thay vì hình ảnh
- **Hover effects** và active states

## 🔄 Auto Price Update

Khi người dùng thay đổi loại xe:
1. Component tự động tính toán giá mới
2. Sử dụng tỷ lệ baseRate để cập nhật
3. Gọi callback `onPriceUpdate` với giá mới
4. Hiển thị giá cập nhật real-time

## 📱 Responsive Design

- **Mobile**: 2 cột với gap 12px
- **Tablet**: Tự động điều chỉnh width
- **Touch friendly**: Kích thước button phù hợp

## 🎯 Future Improvements

- [ ] Thêm animation khi chọn loại xe
- [ ] Hỗ trợ dark mode
- [ ] Thêm loading states
- [ ] Hỗ trợ custom themes
- [ ] Thêm accessibility features
