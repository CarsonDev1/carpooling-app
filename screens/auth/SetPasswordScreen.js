import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { setPassword } from "../../api/authApi";

const SetPasswordScreen = () => {
  const [password, setPasswordValue] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigation = useNavigation();
  const route = useRoute();

  // Get user data from navigation params
  const { userId, phone, fullName } = route.params || {};

  // Password validation
  const validatePassword = (pwd) => {
    const minLength = 6;
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasNumbers = /\d/.test(pwd);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);

    const errors = [];

    if (pwd.length < minLength) {
      errors.push(`Mật khẩu phải có ít nhất ${minLength} ký tự`);
    }

    if (!hasNumbers) {
      errors.push("Mật khẩu phải chứa ít nhất 1 số");
    }

    // Optional: Add more strict requirements
    // if (!hasUpperCase) {
    //   errors.push("Mật khẩu phải chứa ít nhất 1 chữ hoa");
    // }

    return errors;
  };

  const validateForm = () => {
    if (!password.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập mật khẩu");
      return false;
    }

    if (!confirmPassword.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập lại mật khẩu");
      return false;
    }

    // Password validation
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      Alert.alert("Mật khẩu không hợp lệ", passwordErrors.join("\n"));
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu nhập lại không khớp");
      return false;
    }

    if (!userId) {
      Alert.alert("Lỗi", "Thông tin người dùng không hợp lệ");
      return false;
    }

    return true;
  };

  const handleSetPassword = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const passwordData = {
        userId: userId,
        password: password.trim(),
        confirmPassword: confirmPassword.trim(),
      };

      const response = await setPassword(passwordData);

      if (response.status === "success") {
        navigation.navigate("RegisterSuccess");
      }
    } catch (error) {
      console.error("Set password error:", error);

      let errorMessage = "Đặt mật khẩu thất bại. Vui lòng thử lại.";

      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      Alert.alert("Lỗi", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { strength: 0, text: "", color: "#B3B3B3" };

    let score = 0;
    const checks = [
      pwd.length >= 6,
      pwd.length >= 8,
      /[a-z]/.test(pwd),
      /[A-Z]/.test(pwd),
      /\d/.test(pwd),
      /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    ];

    score = checks.filter(Boolean).length;

    if (score <= 2) return { strength: 1, text: "Yếu", color: "#FF6B6B" };
    if (score <= 4)
      return { strength: 2, text: "Trung bình", color: "#FFB74D" };
    return { strength: 3, text: "Mạnh", color: "#4CAF50" };
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}></View>

      {/* Title */}
      <Text style={styles.title}>Đặt mật khẩu</Text>
      <Text style={styles.subtitle}>
        Tạo mật khẩu bảo mật cho tài khoản{" "}
        {phone ? `***${phone.slice(-4)}` : "của bạn"}
      </Text>

      {/* Input: Password */}
      <View style={styles.inputWrapper}>
        <TextInput
          placeholder="Nhập mật khẩu"
          placeholderTextColor="#8B8B8B"
          style={styles.input}
          value={password}
          onChangeText={setPasswordValue}
          secureTextEntry={!showPassword}
          editable={!loading}
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Text style={styles.eyeText}>{showPassword ? "🙈" : "👁️"}</Text>
        </TouchableOpacity>
      </View>

      {/* Password Strength Indicator */}
      {password.length > 0 && (
        <View style={styles.strengthContainer}>
          <View style={styles.strengthBar}>
            <View
              style={[
                styles.strengthFill,
                {
                  width: `${(passwordStrength.strength / 3) * 100}%`,
                  backgroundColor: passwordStrength.color,
                },
              ]}
            />
          </View>
          <Text
            style={[styles.strengthText, { color: passwordStrength.color }]}
          >
            {passwordStrength.text}
          </Text>
        </View>
      )}

      {/* Input: Confirm Password */}
      <View style={styles.inputWrapper}>
        <TextInput
          placeholder="Nhập lại mật khẩu"
          placeholderTextColor="#8B8B8B"
          style={[
            styles.input,
            confirmPassword &&
              password !== confirmPassword &&
              styles.inputError,
          ]}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
          editable={!loading}
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          <Text style={styles.eyeText}>
            {showConfirmPassword ? "🙈" : "👁️"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Password mismatch warning */}
      {confirmPassword && password !== confirmPassword && (
        <Text style={styles.errorText}>Mật khẩu nhập lại không khớp</Text>
      )}

      {/* Password Requirements */}
      <View style={styles.requirementsContainer}>
        <Text style={styles.requirementsTitle}>Mật khẩu phải có:</Text>
        <Text style={styles.requirementText}>• Ít nhất 6 ký tự</Text>
        <Text style={styles.requirementText}>• Ít nhất 1 số</Text>
        <Text style={styles.requirementText}>
          • Nên có chữ hoa, chữ thường và ký tự đặc biệt
        </Text>
      </View>

      {/* Register Button */}
      <TouchableOpacity
        style={[styles.registerButton, loading && styles.disabledButton]}
        onPress={handleSetPassword}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Text style={styles.buttonText}>Hoàn tất đăng ký</Text>
        )}
      </TouchableOpacity>

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        disabled={loading}
      >
        <Text style={styles.backText}>Quay lại</Text>
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
    marginBottom: 8,
    marginTop: 20,
  },
  subtitle: {
    fontSize: 14,
    color: "#8B8B8B",
    textAlign: "center",
    marginBottom: 30,
  },
  inputWrapper: {
    marginBottom: 16,
    position: "relative",
  },
  input: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#B3B3B3",
    paddingHorizontal: 16,
    paddingRight: 50,
    fontSize: 16,
    color: "#000",
  },
  inputError: {
    borderColor: "#FF6B6B",
  },
  eyeButton: {
    position: "absolute",
    right: 16,
    top: 12,
    padding: 4,
  },
  eyeText: {
    fontSize: 18,
  },
  strengthContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    overflow: "hidden",
  },
  strengthFill: {
    height: "100%",
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: "600",
    minWidth: 60,
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 12,
    marginBottom: 16,
    marginTop: -8,
  },
  requirementsContainer: {
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  registerButton: {
    backgroundColor: "#57C2FE",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
  backButton: {
    alignItems: "center",
    padding: 8,
  },
  backText: {
    color: "#8B8B8B",
    fontSize: 14,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default SetPasswordScreen;
