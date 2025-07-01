import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Picker } from '@react-native-picker/picker';
import { registerAsDriver } from "../api/driversApi";
import { useAuth } from "../context/AuthContext";

export default function DriverRegistrationScreen() {
  const navigation = useNavigation();
  const { user, updateUser } = useAuth();
  
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    licensePlate: "",
    seats: "",
    color: "",
    year: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Common vehicle brands and colors
  const vehicleBrands = [
    "Toyota", "Honda", "Suzuki", "Mitsubishi", "Nissan", 
    "Mazda", "Ford", "Chevrolet", "Hyundai", "Kia",
    "Mercedes-Benz", "BMW", "Audi", "Lexus", "Acura"
  ];

  const vehicleColors = [
    "Trắng", "Đen", "Xám", "Bạc", "Đỏ", 
    "Xanh dương", "Xanh lá", "Nâu", "Vàng", "Cam"
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1990 + 1 }, (_, i) => currentYear - i);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.brand.trim()) newErrors.brand = "Vui lòng chọn hãng xe";
    if (!formData.model.trim()) newErrors.model = "Vui lòng nhập model xe";
    if (!formData.licensePlate.trim()) {
      newErrors.licensePlate = "Vui lòng nhập biển số xe";
    } else if (!/^[0-9]{2}[A-Z]{1}[0-9]{1}-[0-9]{3,5}(\.[0-9]{2})?$/.test(formData.licensePlate)) {
      newErrors.licensePlate = "Biển số xe không hợp lệ (VD: 51A1-12345)";
    }
    
    if (!formData.seats || formData.seats < 2 || formData.seats > 8) {
      newErrors.seats = "Số ghế phải từ 2-8";
    }
    if (!formData.color.trim()) newErrors.color = "Vui lòng chọn màu xe";
    if (!formData.year || formData.year < 1990 || formData.year > currentYear) {
      newErrors.year = "Năm sản xuất không hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      const vehicleData = {
        brand: formData.brand,
        model: formData.model,
        licensePlate: formData.licensePlate.toUpperCase(),
        seats: parseInt(formData.seats),
        color: formData.color,
        year: parseInt(formData.year),
      };

      const response = await registerAsDriver(vehicleData);
      
      // Update user context
      const updatedUser = {
        ...user,
        role: response.data.data.role,
        vehicle: response.data.data.vehicle
      };
      updateUser(updatedUser);
      
      Alert.alert(
        "Đăng ký thành công! 🎉",
        "Bạn đã trở thành tài xế. Có thể bắt đầu nhận chuyến ngay bây giờ!",
        [
          {
            text: "Xem yêu cầu chuyến đi",
            onPress: () => navigation.replace("DriverRequests")
          }
        ]
      );
    } catch (error) {
      Alert.alert(
        "Đăng ký thất bại",
        error.response?.data?.error || error.message || "Có lỗi xảy ra"
      );
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.headerWrapper}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.headerTitle}>Đăng ký làm tài xế</Text>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Info Section */}
        <View style={styles.infoCard}>
          <View style={styles.iconContainer}>
            <Ionicons name="car" size={48} color="#4285F4" />
          </View>
          <Text style={styles.infoTitle}>Trở thành tài xế 2GETHER</Text>
          <Text style={styles.infoText}>
            Đăng ký thông tin xe để bắt đầu nhận các yêu cầu chuyến đi từ hành khách
          </Text>
        </View>

        {/* Vehicle Information Form */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Thông tin xe</Text>
          
          {/* Brand */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Hãng xe *</Text>
            <View style={[styles.pickerContainer, errors.brand && styles.errorInput]}>
              <Picker
                selectedValue={formData.brand}
                onValueChange={(value) => updateFormData('brand', value)}
                style={styles.picker}
              >
                <Picker.Item label="Chọn hãng xe" value="" />
                {vehicleBrands.map(brand => (
                  <Picker.Item key={brand} label={brand} value={brand} />
                ))}
              </Picker>
            </View>
            {errors.brand && <Text style={styles.errorText}>{errors.brand}</Text>}
          </View>

          {/* Model */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Model xe *</Text>
            <TextInput
              style={[styles.textInput, errors.model && styles.errorInput]}
              placeholder="VD: Vios, City, Swift..."
              value={formData.model}
              onChangeText={(value) => updateFormData('model', value)}
            />
            {errors.model && <Text style={styles.errorText}>{errors.model}</Text>}
          </View>

          {/* License Plate */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Biển số xe *</Text>
            <TextInput
              style={[styles.textInput, errors.licensePlate && styles.errorInput]}
              placeholder="VD: 51A1-12345"
              value={formData.licensePlate}
              onChangeText={(value) => updateFormData('licensePlate', value)}
              autoCapitalize="characters"
            />
            {errors.licensePlate && <Text style={styles.errorText}>{errors.licensePlate}</Text>}
          </View>

          {/* Seats and Year Row */}
          <View style={styles.rowContainer}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Số ghế *</Text>
              <TextInput
                style={[styles.textInput, errors.seats && styles.errorInput]}
                placeholder="4"
                value={formData.seats}
                onChangeText={(value) => updateFormData('seats', value)}
                keyboardType="numeric"
                maxLength={1}
              />
              {errors.seats && <Text style={styles.errorText}>{errors.seats}</Text>}
            </View>
            
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Năm sản xuất *</Text>
              <View style={[styles.pickerContainer, errors.year && styles.errorInput]}>
                <Picker
                  selectedValue={formData.year}
                  onValueChange={(value) => updateFormData('year', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Chọn năm" value="" />
                  {years.map(year => (
                    <Picker.Item key={year} label={year.toString()} value={year} />
                  ))}
                </Picker>
              </View>
              {errors.year && <Text style={styles.errorText}>{errors.year}</Text>}
            </View>
          </View>

          {/* Color */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Màu xe *</Text>
            <View style={[styles.pickerContainer, errors.color && styles.errorInput]}>
              <Picker
                selectedValue={formData.color}
                onValueChange={(value) => updateFormData('color', value)}
                style={styles.picker}
              >
                <Picker.Item label="Chọn màu xe" value="" />
                {vehicleColors.map(color => (
                  <Picker.Item key={color} label={color} value={color} />
                ))}
              </Picker>
            </View>
            {errors.color && <Text style={styles.errorText}>{errors.color}</Text>}
          </View>
        </View>

        {/* Benefits Section */}
        <View style={styles.benefitsSection}>
          <Text style={styles.sectionTitle}>Lợi ích khi trở thành tài xế</Text>
          
          <View style={styles.benefitItem}>
            <Ionicons name="cash" size={20} color="#4CAF50" />
            <Text style={styles.benefitText}>Thu nhập thêm từ việc chia sẻ chuyến đi</Text>
          </View>
          
          <View style={styles.benefitItem}>
            <Ionicons name="people" size={20} color="#FF9800" />
            <Text style={styles.benefitText}>Kết nối với cộng đồng và kết bạn mới</Text>
          </View>
          
          <View style={styles.benefitItem}>
            <Ionicons name="leaf" size={20} color="#8BC34A" />
            <Text style={styles.benefitText}>Góp phần bảo vệ môi trường</Text>
          </View>
          
          <View style={styles.benefitItem}>
            <Ionicons name="time" size={20} color="#2196F3" />
            <Text style={styles.benefitText}>Thời gian linh hoạt, chủ động lựa chọn chuyến</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.disabledBtn]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.submitBtnText}>Đăng ký làm tài xế</Text>
          )}
        </TouchableOpacity>
        
        <Text style={styles.footerNote}>
          Bằng việc đăng ký, bạn đồng ý với{" "}
          <Text style={styles.linkText}>Điều khoản sử dụng</Text> và{" "}
          <Text style={styles.linkText}>Chính sách bảo mật</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff" 
  },
  
  headerWrapper: {
    backgroundColor: "#58C2F0",
    paddingTop: StatusBar.currentHeight || 44,
    paddingBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  backBtn: {
    position: "absolute",
    left: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 20,
  },

  content: {
    padding: 20,
    paddingBottom: 120,
  },

  infoCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginBottom: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },

  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  picker: {
    height: 50,
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  errorInput: {
    borderColor: "#F44336",
  },
  errorText: {
    fontSize: 12,
    color: "#F44336",
    marginTop: 4,
  },

  benefitsSection: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 12,
    flex: 1,
  },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  submitBtn: {
    backgroundColor: "#4285F4",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  submitBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  footerNote: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    lineHeight: 16,
  },
  linkText: {
    color: "#4285F4",
    fontWeight: "500",
  },
}); 