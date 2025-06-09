import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function RegisterSuccessScreen() {
  const navigation = useNavigation();

  const goToLogin = () => {
    navigation.navigate("Login"); // Cập nhật tên route nếu khác
  };

  return (
    <View style={styles.container}>
      {/* Header màu xanh */}
      <View style={styles.header} />

      {/* Icon ✅ */}
      <View style={styles.checkmarkContainer}>
        <Text style={styles.checkmark}>✅</Text>
      </View>

      {/* Tiêu đề */}
      <Text style={styles.title}>Đăng ký tài khoản thành công!</Text>

      {/* Nội dung phụ */}
      <Text style={styles.subtitle}>
        Chúc mừng bạn đã đăng ký tài khoản 2gether thành công! Đăng nhập ngay để
        cùng trải nghiệm ghép xe với 2gether nha!
      </Text>

      {/* Nút điều hướng */}
      <TouchableOpacity style={styles.button} onPress={goToLogin}>
        <Text style={styles.buttonText}>Về trang đăng nhập</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 120,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 66,
    backgroundColor: "#57C2FE",
  },
  checkmarkContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E5F9E7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  checkmark: {
    fontSize: 36,
    color: "green",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#000",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 20,
  },
  button: {
    backgroundColor: "#57C2FE",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
