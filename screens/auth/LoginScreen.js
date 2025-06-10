// screens/auth/LoginScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { loginUser } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";

const LoginScreen = ({ navigation }) => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login } = useAuth();

  const validateForm = () => {
    const newErrors = {};
    if (!phone.trim()) {
      newErrors.phone = "Số điện thoại là bắt buộc";
    } else if (!/^[0-9]{10}$/.test(phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }
    if (!password.trim()) {
      newErrors.password = "Mật khẩu là bắt buộc";
    } else if (password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    try {
      setLoading(true);
      setErrors({});
      const response = await loginUser({
        phone: phone.trim(),
        password,
      });
      if (response.status === "success") {
        login(response.data.user, response.data.token);
        Alert.alert("Thành công", "Đăng nhập thành công!", [
          {
            text: "OK",
            onPress: () => navigation.navigate("HomeMain"),
          },
        ]);
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error.errors) {
        const serverErrors = {};
        error.errors.forEach((err) => {
          serverErrors[err.field] = err.message;
        });
        setErrors(serverErrors);
      } else {
        Alert.alert("Lỗi đăng nhập", error.message || "Đăng nhập thất bại");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Header */}
        <View style={styles.header} />

        {/* Title */}
        <Text style={styles.title}>Đăng nhập</Text>

        {/* Phone input */}
        <TextInput
          style={[styles.input, errors.phone && styles.inputError]}
          placeholder="Số điện thoại"
          placeholderTextColor="#999"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          editable={!loading}
        />
        {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

        {/* Password input */}
        <TextInput
          style={[styles.input, errors.password && styles.inputError]}
          placeholder="Mật khẩu"
          placeholderTextColor="#999"
          secureTextEntry={true}
          value={password}
          onChangeText={setPassword}
          editable={!loading}
        />
        {errors.password && (
          <Text style={styles.errorText}>{errors.password}</Text>
        )}

        {/* Forgot password */}
        <TouchableOpacity
          onPress={() => navigation.navigate("ForgotPassword")}
          disabled={loading}
          style={{ alignSelf: "flex-end" }}
        >
          <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
        </TouchableOpacity>

        {/* Login button */}
        <TouchableOpacity
          style={[styles.loginButton, loading && styles.disabledButton]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.loginButtonText}>Đăng nhập</Text>
          )}
        </TouchableOpacity>

        {/* Register link */}
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Chưa có tài khoản? </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("Register")}
            disabled={loading}
          >
            <Text style={styles.registerLink}>Đăng ký ngay</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 100,
    alignItems: "center",
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
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
    marginBottom: 30,
  },
  input: {
    width: "100%",
    height: 44,
    borderWidth: 1,
    borderColor: "#B3B3B3",
    borderRadius: 10,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  inputError: {
    borderColor: "#F44336",
  },
  errorText: {
    alignSelf: "flex-start",
    color: "#F44336",
    fontSize: 13,
    marginBottom: 8,
  },
  forgotPasswordText: {
    alignSelf: "flex-end",
    fontSize: 14,
    color: "#8B8B8B",
    textAlign: "right",
    display: "flex",
    justifyContent: "flex-end",
    fontWeight: "600",
    marginBottom: 24,
  },
  loginButton: {
    width: "100%",
    height: 44,
    backgroundColor: "#57C2FE",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  registerContainer: {
    flexDirection: "row",
  },
  registerText: {
    fontSize: 14,
    color: "#000",
  },
  registerLink: {
    fontSize: 14,
    fontWeight: "700",
    color: "#57C2FE",
  },
});

export default LoginScreen;
