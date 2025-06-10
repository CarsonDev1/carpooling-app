import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
const { width } = Dimensions.get("window");
import IconBack from "../../assets/ic-back.svg";
import { forgotPassword } from "../../api/authApi";

const ForgotPasswordScreen = () => {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const validatePhone = (phoneNumber) => {
    // Vietnamese phone number format: 10 digits starting with 0
    const phoneRegex = /^0[0-9]{9}$/;
    return phoneRegex.test(phoneNumber);
  };

  const handleSubmit = async () => {
    // Trim whitespace from phone number
    const trimmedPhone = phone.trim();

    if (!trimmedPhone) {
      Alert.alert("Lỗi", "Vui lòng nhập số điện thoại");
      return;
    }

    if (!validatePhone(trimmedPhone)) {
      Alert.alert(
        "Lỗi",
        "Số điện thoại không hợp lệ. Vui lòng nhập đúng định dạng số điện thoại Việt Nam"
      );
      return;
    }

    setLoading(true);
    try {
      const response = await forgotPassword(trimmedPhone);
      if (response.status === "success") {
        // Pass the development OTP to the OTP screen if available
        navigation.navigate("OTPPassWord", {
          phone: trimmedPhone,
          isResetPassword: true,
          developmentOTP: response.data?.developmentResetOTP,
        });
      }
    } catch (error) {
      console.log("Forgot password error:", error);
      let errorMessage = "Có lỗi xảy ra, vui lòng thử lại";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert("Lỗi", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}></View>

      {/* Back Button */}
      <TouchableOpacity
        style={{
          position: "absolute",
          left: 16,
          top: 80,
          padding: 4,
          zIndex: 10,
        }}
        onPress={() => navigation.goBack()}
      >
        <Image source={IconBack} style={{ width: 8, height: 15 }} />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>Lấy lại mật khẩu</Text>

      {/* Input: Số điện thoại */}
      <View style={styles.inputWrapper}>
        <TextInput
          placeholder="Số điện thoại"
          placeholderTextColor="#8B8B8B"
          style={styles.input}
          value={phone}
          onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, ""))}
          keyboardType="phone-pad"
          maxLength={10}
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.buttonText}>Tiếp tục</Text>
        )}
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
    marginBottom: 40,
    marginTop: 40,
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
  submitButton: {
    backgroundColor: "#57C2FE",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ForgotPasswordScreen;
