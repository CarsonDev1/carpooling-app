import { useNavigation } from "@react-navigation/native";
import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

export default function OTPScreen() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputs = useRef([]);
  const navigation = useNavigation();
  const handleChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }

    if (!text && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = () => {
    const code = otp.join("");
    console.log("OTP entered:", code);
    navigation.navigate("SetPassword");
  };

  const handleResend = () => {
    console.log("Resend OTP");
    // TODO: Trigger resend OTP API
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
      <Text style={styles.subTitle}>Nhập mã OTP của bạn</Text>

      {/* OTP Inputs */}
      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputs.current[index] = ref)}
            style={styles.otpInput}
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            autoFocus={index === 0}
          />
        ))}
      </View>

      {/* Resend link */}
      <Text style={styles.resendText}>
        Không nhận được mã?
        <Text onPress={handleResend} style={styles.resendLink}>
          {" "}
          Gửi lại
        </Text>
      </Text>

      {/* Submit button */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>Xác thực</Text>
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
  },
  resendText: {
    fontSize: 14,
    color: "#8B8B8B",
    marginBottom: 30,
  },
  resendLink: {
    fontWeight: "bold",
    color: "#8B8B8B",
  },
  submitButton: {
    width: "85%",
    height: 44,
    backgroundColor: "#57C2FE",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
