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
import { verifyOtp, resendOtp } from "../../api/authApi";

export default function OTPScreen() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputs = useRef([]);
  const navigation = useNavigation();
  const route = useRoute();

  // Get user data from navigation params
  const { userId, phone, fullName, developmentOTP } = route.params || {};

  // Timer for resend functionality
  useEffect(() => {
    let interval = null;
    if (timer > 0 && !canResend) {
      interval = setInterval(() => {
        setTimer(timer => timer - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer, canResend]);

  // Auto-fill OTP in development mode
  useEffect(() => {
    if (developmentOTP && __DEV__) {
      const otpArray = developmentOTP.split('');
      setOtp(otpArray);
      // Auto verify in development
      setTimeout(() => {
        handleSubmit(otpArray.join(''));
      }, 1000);
    }
  }, [developmentOTP]);

  const handleChange = (text, index) => {
    // Filter only numbers
    const filteredText = text.replace(/[^0-9]/g, '');
    
    const newOtp = [...otp];
    newOtp[index] = filteredText;
    setOtp(newOtp);

    // Auto move to next input
    if (filteredText && index < 5) {
      inputs.current[index + 1]?.focus();
    }
    
    // Auto move to previous input when deleting
    if (!filteredText && index > 0) {
      inputs.current[index - 1]?.focus();
    }

    // Auto submit when all fields are filled
    const newCode = newOtp.join('');
    if (newCode.length === 6) {
      setTimeout(() => {
        handleSubmit(newCode);
      }, 100);
    }
  };

  const handleSubmit = async (code = null) => {
    const otpCode = code || otp.join("");
    
    if (otpCode.length !== 6) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ mã OTP");
      return;
    }

    if (!userId) {
      Alert.alert("Lỗi", "Thông tin người dùng không hợp lệ");
      return;
    }

    setLoading(true);

    try {
      const response = await verifyOtp({
        userId: userId,
        otp: otpCode
      });

      if (response.status === 'success') {
        Alert.alert(
          "Thành công", 
          "Xác thực OTP thành công!",
          [
            {
              text: "OK",
              onPress: () => {
                // Navigate based on API response nextStep
                if (response.data.nextStep === 'set_password') {
                  navigation.navigate("SetPassword", {
                    userId: response.data.userId,
                    phone: phone,
                    fullName: fullName
                  });
                } else {
                  // If no password needed, go to main app
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'Main' }],
                  });
                }
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      
      // Clear OTP on error
      setOtp(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
      
      let errorMessage = "Mã OTP không chính xác. Vui lòng thử lại.";
      
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

  const handleResend = async () => {
    if (!canResend || !userId) return;

    setResendLoading(true);

    try {
      const response = await resendOtp(userId);
      
      if (response.status === 'success') {
        // Reset timer
        setTimer(60);
        setCanResend(false);
        
        // Clear current OTP
        setOtp(["", "", "", "", "", ""]);
        inputs.current[0]?.focus();
        
        Alert.alert("Thành công", "Mã OTP mới đã được gửi đến số điện thoại của bạn");
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      
      let errorMessage = "Gửi lại mã OTP thất bại. Vui lòng thử lại.";
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert("Lỗi", errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
        Nhập mã OTP được gửi đến {phone ? `***${phone.slice(-4)}` : 'số điện thoại của bạn'}
      </Text>

      {/* Development OTP Display */}
      {__DEV__ && developmentOTP && (
        <Text style={styles.devOtp}>Dev OTP: {developmentOTP}</Text>
      )}

      {/* OTP Inputs */}
      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputs.current[index] = ref)}
            style={[
              styles.otpInput,
              digit && styles.otpInputFilled,
              loading && styles.otpInputDisabled
            ]}
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            autoFocus={index === 0}
            editable={!loading}
            selectTextOnFocus
          />
        ))}
      </View>

      {/* Timer and Resend */}
      <View style={styles.resendContainer}>
        {!canResend ? (
          <Text style={styles.timerText}>
            Gửi lại mã sau {formatTimer(timer)}
          </Text>
        ) : (
          <Text style={styles.resendText}>
            Không nhận được mã?{" "}
            <Text 
              onPress={handleResend} 
              style={[
                styles.resendLink,
                resendLoading && styles.disabledLink
              ]}
            >
              {resendLoading ? "Đang gửi..." : "Gửi lại"}
            </Text>
          </Text>
        )}
      </View>

      {/* Submit button */}
      <TouchableOpacity 
        style={[
          styles.submitButton,
          (loading || otp.join('').length !== 6) && styles.submitButtonDisabled
        ]} 
        onPress={() => handleSubmit()}
        disabled={loading || otp.join('').length !== 6}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.submitText}>Xác thực</Text>
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