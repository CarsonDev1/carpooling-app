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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
const { width } = Dimensions.get("window");
import IconBack from "../../assets/ic-back.svg";
const ForgotPasswordScreen = () => {
  const [agreed, setAgreed] = useState(false);
  const navigation = useNavigation();

  const handleRegister = () => {
    // TODO: Add form validation, API call, etc.
    navigation.navigate("OTP");
  };
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}></View>

      {/* Back Button */}
      <TouchableOpacity
        style={{ position: "absolute", left: 16, top: 80, padding: 4, zIndex: 10 }}
        onPress={() => navigation.goBack()}
      >
        <Image source={IconBack} style={{ width: 8, height: 15 }} />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>Lấy lại mật khẩu</Text>

      {/* Input: Tên tài khoản */}
      <View style={styles.inputWrapper}>
        <TextInput
          placeholder="Số tài khoản"
          placeholderTextColor="#8B8B8B"
          style={styles.input}
        />
      </View>

      {/* Đăng ký Button */}
      <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
        <Text style={styles.buttonText}>Đăng ký</Text>
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
    marginTop: 20,
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

export default ForgotPasswordScreen;
