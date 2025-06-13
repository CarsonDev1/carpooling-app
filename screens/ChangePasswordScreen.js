// screens/ChangePasswordScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import HeaderProfile from "../components/Header";

const ChangePasswordScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [form, setForm] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const getAvatarSource = () => {
    if (user?.avatar) {
      if (user.avatar.startsWith("http")) {
        return { uri: user.avatar };
      }
      return { uri: `http://192.168.1.91:5000${user.avatar}` };
    }
    return require("../assets/avatar.png");
  };

  return (
    <ScrollView style={styles["main-container"]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <HeaderProfile />

      {/* Breadcrumb */}
      <View style={styles["main-breadcrumb"]}>
        <TouchableOpacity onPress={() => navigation.navigate("ProfileMain")}>
          <Text style={styles["main-breadcrumb-back"]}>Tài khoản</Text>
        </TouchableOpacity>
        <Text style={styles["main-breadcrumb-divider"]}> › </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Setting")}>
          <Text style={styles["main-breadcrumb-current"]}>Cài đặt</Text>
        </TouchableOpacity>
        <Text style={styles["main-breadcrumb-divider"]}> › </Text>
        <Text style={styles["main-breadcrumb-current"]}>Đổi mật khẩu</Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Mật khẩu cũ"
          secureTextEntry
          value={form.current}
          onChangeText={(text) => handleChange("current", text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Mật khẩu mới"
          secureTextEntry
          value={form.new}
          onChangeText={(text) => handleChange("new", text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Xác nhận mật khẩu"
          secureTextEntry
          value={form.confirm}
          onChangeText={(text) => handleChange("confirm", text)}
        />
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Lưu mật khẩu</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  "main-container": {
    flex: 1,
    backgroundColor: "#fff",
  },
  "main-header": {
    backgroundColor: "#57C2FE",
    paddingVertical: 24,
    alignItems: "center",
  },
  "main-header-content": {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginTop: 60,
  },
  "main-header-left": {
    alignItems: "center",
  },
  "main-header-right": {
    alignItems: "flex-start",
  },
  "main-avatar": {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E0E0E0",
    marginBottom: 8,
  },
  "main-name": {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  "main-status": {
    color: "#000",
    fontSize: 13,
    opacity: 0.9,
    marginTop: 2,
    textAlign: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  "main-breadcrumb": {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    paddingHorizontal: 16,
  },
  "main-breadcrumb-back": {
    fontSize: 14,
    color: "#007AFF",
  },
  "main-breadcrumb-divider": {
    fontSize: 14,
    color: "#333",
  },
  "main-breadcrumb-current": {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },
  form: {
    padding: 16,
  },
  input: {
    backgroundColor: "#F9F9F9",
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#eee",
  },
  button: {
    backgroundColor: "#57C2FE",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ChangePasswordScreen;
