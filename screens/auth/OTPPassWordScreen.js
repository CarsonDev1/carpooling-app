import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { verifyOtp, resendOtp, resetPassword } from "../../api/authApi";

export default function OTPPassWordScreen() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [developmentOTP, setDevelopmentOTP] = useState("");
  const inputs = useRef([]);
  const navigation = useNavigation();
  const route = useRoute();

  // Get user data from navigation params
  const {
    phone,
    isResetPassword,
    developmentOTP: routeDevelopmentOTP,
  } = route.params || {};

  // Auto-fill OTP in development mode
  useEffect(() => {
    if (routeDevelopmentOTP && __DEV__) {
      const otpArray = routeDevelopmentOTP.split("");
      setOtp(otpArray);
    }
  }, [routeDevelopmentOTP]);

  const isFormValid = () => {
    const otpCode = otp.join("");
    return (
      otpCode.length === 6 &&
      password.length >= 6 &&
      confirmPassword.length >= 6 &&
      password === confirmPassword
    );
  };

  const handleSubmit = async () => {
    const otpCode = otp.join("");

    if (!isFormValid()) {
      if (password.length < 6) {
        Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 6 ký tự");
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert("Lỗi", "Mật khẩu không khớp");
        return;
      }
      return;
    }

    if (!phone) {
      Alert.alert("Lỗi", "Thông tin người dùng không hợp lệ");
      return;
    }

    setLoading(true);

    try {
      // Reset password directly with phone and OTP
      const resetResponse = await resetPassword({
        phone,
        otp: otpCode,
        password,
        confirmPassword,
      });

      if (resetResponse.status === "success") {
        Alert.alert(
          "Thành công",
          resetResponse.message || "Đặt lại mật khẩu thành công!",
          [
            {
              text: "OK",
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: "Login" }],
                });
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error("Error:", error);
      let errorMessage = "Có lỗi xảy ra. Vui lòng thử lại.";
      if (error.message) {
        if (error.message.includes("Invalid OTP")) {
          errorMessage = "Mã OTP không hợp lệ hoặc đã hết hạn";
        } else if (error.message.includes("password")) {
          errorMessage = "Mật khẩu không đáp ứng yêu cầu bảo mật";
        } else {
          errorMessage = error.message;
        }
      }
      Alert.alert("Lỗi", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || !phone) return;

    setResendLoading(true);

    try {
      const response = await resendOtp(phone);

      if (response.status === "success") {
        setTimer(60);
        setCanResend(false);
        setOtp(["", "", "", "", "", ""]);
        inputs.current[0]?.focus();

        // If in development mode and we got a development OTP, update it
        if (__DEV__ && response.data?.developmentResetOTP) {
          setDevelopmentOTP(response.data.developmentResetOTP);
        }

        Alert.alert(
          "Thành công",
          response.message || "Mã OTP mới đã được gửi đến số điện thoại của bạn"
        );
      }
    } catch (error) {
      let errorMessage = "Gửi lại mã OTP thất bại";
      if (error.message) {
        if (error.message.includes("Invalid registration step")) {
          errorMessage = "Phiên xác thực không hợp lệ. Vui lòng thử lại.";
        } else {
          errorMessage = error.message;
        }
      }
      Alert.alert("Lỗi", errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header} />

      {/* Title */}
      <Text style={styles.title}>Xác minh điện thoại</Text>
      <Text style={styles.subTitle}>
        Nhập mã OTP được gửi đến{" "}
        {phone ? `***${phone.slice(-4)}` : "số điện thoại của bạn"}
      </Text>

      {/* Development OTP Display */}
      {__DEV__ && routeDevelopmentOTP && (
        <Text style={styles.devOtp}>Dev OTP: {routeDevelopmentOTP}</Text>
      )}

      {/* OTP Inputs - Disabled */}
      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputs.current[index] = ref)}
            style={[
              styles.otpInput,
              digit && styles.otpInputFilled,
              styles.otpInputDisabled,
            ]}
            value={digit}
            editable={false}
          />
        ))}
      </View>

      {/* Password Inputs */}
      <View style={styles.inputWrapper}>
        <TextInput
          placeholder="Mật khẩu mới"
          placeholderTextColor="#8B8B8B"
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>
      <View style={styles.inputWrapper}>
        <TextInput
          placeholder="Xác nhận mật khẩu"
          placeholderTextColor="#8B8B8B"
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
      </View>

      {/* Submit button */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          (!isFormValid() || loading) && styles.submitButtonDisabled,
        ]}
        onPress={handleSubmit}
        disabled={!isFormValid() || loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.submitText}>Đặt lại mật khẩu</Text>
        )}
      </TouchableOpacity>

      {/* Back button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        disabled={loading}
      >
        <Text style={styles.backText}>Quay lại</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    width: "100%",
    paddingTop: 100,
    paddingHorizontal: 24,
  },
  header: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: 66,
    backgroundColor: "#57C2FE",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#000",
  },
  subTitle: {
    fontSize: 14,
    color: "#8B8B8B",
    marginBottom: 20,
    textAlign: "center",
  },
  devOtp: {
    fontSize: 12,
    color: "#FF6B6B",
    backgroundColor: "#FFF5F5",
    padding: 8,
    borderRadius: 4,
    marginBottom: 10,
    fontFamily: "monospace",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 20,
  },
  otpInput: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderColor: "#B3B3B3",
    borderRadius: 10,
    textAlign: "center",
    fontSize: 18,
    color: "#000",
    backgroundColor: "#fff",
  },
  otpInputFilled: {
    borderColor: "#57C2FE",
    backgroundColor: "#F0F9FF",
  },
  otpInputDisabled: {
    backgroundColor: "#F5F5F5",
    color: "#999",
  },
  inputWrapper: {
    width: "100%",
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
  resendContainer: {
    marginBottom: 30,
    height: 20,
  },
  resendText: {
    fontSize: 14,
    color: "#8B8B8B",
  },
  resendLink: {
    fontWeight: "bold",
    color: "#57C2FE",
  },
  disabledLink: {
    color: "#B3B3B3",
  },
  timerText: {
    fontSize: 14,
    color: "#8B8B8B",
    textAlign: "center",
  },
  submitButton: {
    width: "100%",
    height: 44,
    backgroundColor: "#57C2FE",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  submitButtonDisabled: {
    backgroundColor: "#B3B3B3",
    opacity: 0.6,
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    padding: 8,
  },
  backText: {
    color: "#8B8B8B",
    fontSize: 14,
  },
});
