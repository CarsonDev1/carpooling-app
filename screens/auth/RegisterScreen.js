import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { registerUser } from "../../api/authApi";

const { width } = Dimensions.get("window");

const RegisterScreen = () => {
  const [agreed, setAgreed] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  // Validate input data
  const validateForm = () => {
    if (!fullName.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên tài khoản");
      return false;
    }
    
    if (!phone.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập số điện thoại");
      return false;
    }

    // Validate Vietnamese phone number format
    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!phoneRegex.test(phone)) {
      Alert.alert("Lỗi", "Số điện thoại không hợp lệ");
      return false;
    }

    if (!agreed) {
      Alert.alert("Lỗi", "Vui lòng đồng ý với điều khoản dịch vụ");
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const userData = {
        fullName: fullName.trim(),
        phone: phone.trim(),
      };

      const response = await registerUser(userData);
      
      if (response.status === 'success') {
        Alert.alert(
          "Thành công", 
          "Tài khoản được tạo thành công. Mã OTP đã được gửi đến số điện thoại của bạn.",
          [
            {
              text: "OK",
              onPress: () => {
                // Navigate to OTP screen with user data
                navigation.navigate("OTP", {
                  userId: response.data.userId,
                  phone: response.data.phone,
                  fullName: response.data.fullName,
                  developmentOTP: response.data.developmentOTP, // For development only
                });
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle different error cases
      let errorMessage = "Đăng ký thất bại. Vui lòng thử lại.";
      
      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      Alert.alert("Lỗi", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneLogin = () => {
    // Navigate to login screen
    navigation.navigate("Login");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}></View>

      {/* Title */}
      <Text style={styles.title}>Đăng ký tài khoản</Text>

      {/* Input: Tên tài khoản */}
      <View style={styles.inputWrapper}>
        <TextInput
          placeholder="Tên tài khoản"
          placeholderTextColor="#8B8B8B"
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          editable={!loading}
        />
      </View>

      {/* Input: Số điện thoại */}
      <View style={styles.inputWrapper}>
        <TextInput
          placeholder="Số điện thoại"
          placeholderTextColor="#8B8B8B"
          style={styles.input}
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          editable={!loading}
        />
      </View>

      {/* Checkbox & Terms */}
      <View style={styles.checkboxRow}>
        <TouchableOpacity
          onPress={() => setAgreed(!agreed)}
          style={[
            styles.checkbox,
            agreed && { backgroundColor: "#57C2FE", borderColor: "#57C2FE" },
          ]}
          disabled={loading}
        >
          {agreed && <Text style={styles.checkmark}>✔</Text>}
        </TouchableOpacity>

        <Text style={styles.termsText}>
          Bằng cách đăng ký, bạn đồng ý với{" "}
          <Text style={styles.bold}>Điều khoản dịch vụ</Text> và{" "}
          <Text style={styles.bold}>Chính sách bảo mật</Text>.
        </Text>
      </View>

      {/* Đăng ký Button */}
      <TouchableOpacity 
        style={[
          styles.registerButton, 
          loading && styles.disabledButton
        ]} 
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Text style={styles.buttonText}>Đăng ký</Text>
        )}
      </TouchableOpacity>

      {/* Divider hoặc */}
      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.orText}>hoặc</Text>
        <View style={styles.divider} />
      </View>

      {/* Đăng nhập bằng SDT */}
      <TouchableOpacity 
        style={[
          styles.phoneLoginButton,
          loading && styles.disabledButton
        ]}
        onPress={handlePhoneLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Đăng nhập bằng Số điện thoại</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 66,
    paddingBottom: 40,
    paddingHorizontal: 24,
    backgroundColor: "white",
    minHeight: "100%",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 66,
    backgroundColor: "#57C2FE",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    color: "black",
    marginBottom: 20,
    marginTop: 20,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  input: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#B3B3B3",
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#000",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 12,
    marginBottom: 32,
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: "#B3B3B3",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  checkmark: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  termsText: {
    fontSize: 12,
    color: "#8B8B8B",
    flex: 1,
    lineHeight: 18,
  },
  bold: {
    fontWeight: "700",
  },
  registerButton: {
    backgroundColor: "#57C2FE",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 24,
  },
  disabledButton: {
    opacity: 0.6,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#000",
  },
  orText: {
    marginHorizontal: 12,
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
  },
  phoneLoginButton: {
    backgroundColor: "#57C2FE",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default RegisterScreen;