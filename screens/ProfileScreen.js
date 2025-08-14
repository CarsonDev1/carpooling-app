// screens/ProfileScreen.js
import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";

const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation();

  const getAvatarSource = () => {
    if (user?.avatar) {
      if (user.avatar.startsWith("http")) {
        return { uri: user.avatar };
      }
      return { uri: `http://192.168.1.91:5000${user.avatar}` };
    }
    return require("../assets/avatar.png"); // Ảnh avatar mặc định
  };

  const menuItems = [
    { icon: "👤", label: "Hồ sơ người dùng" },
    { icon: "💰", label: "Ví điện tử" },
    { icon: "💳", label: "Thanh toán" },
    { icon: "🎁", label: "Tích điểm & Ưu đãi" },
    { icon: "⚙️", label: "Cài đặt" },
    { icon: "🔒", label: "Quyền riêng tư & Bảo mật" },
    { icon: "🛟", label: "Trung tâm hỗ trợ" },
  ];

  return (
    <ScrollView
      style={styles["main-container"]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles["main-header"]}>
        <View style={styles["main-header-content"]}>
          <View style={styles["main-header-left"]}>
            <Image source={getAvatarSource()} style={styles["main-avatar"]} />

          </View>
          <View style={styles["main-header-right"]}>
            <Text style={styles["main-name"]}>
              {user?.fullName || "Người dùng"}
            </Text>
            <Text style={styles["main-status"]}>Hạng đồng</Text>
          </View>
        </View>
      </View>

      {/* Menu items */}
      <View style={styles["main-menu"]}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles["main-menu-item"]}
            activeOpacity={0.7}
            onPress={() => {
              if (item.label === "Cài đặt") {
                navigation.navigate("Setting");
              }
              if (item.label === "Tích điểm & Ưu đãi") {
                navigation.navigate("Rewards");
              }
              if (item.label === "Trung tâm hỗ trợ") {
                navigation.navigate("HelpCenter");
              }
              if (item.label === "Quyền riêng tư & Bảo mật") {
                navigation.navigate("PrivacyPolicy");
              }
              if (item.label === "Thanh toán") {
                navigation.navigate("Payment");
              }
              if (item.label === "Hồ sơ người dùng") {
                navigation.navigate("ProfileDetail");
              }
              if (item.label === "Ví điện tử") {
                navigation.navigate("Wallet");
              }
            }}
          >
            <View style={styles["main-menu-left"]}>
              <Text style={styles["main-icon"]}>{item.icon}</Text>
              <Text style={styles["main-label"]}>{item.label}</Text>
            </View>
            <Text style={styles["main-arrow"]}>›</Text>
          </TouchableOpacity>
        ))}

        {/* Đăng xuất
        <TouchableOpacity style={styles['main-menu-item']} onPress={logout}>
          <View style={styles['main-menu-left']}>
            <Text style={styles['main-icon']}>🚪</Text>
            <Text style={[styles['main-label'], { color: '#F44336' }]}>Đăng xuất</Text>
          </View>
        </TouchableOpacity> */}
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

    marginBottom: 8,
    backgroundColor: "#E0E0E0",
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
  "main-menu": {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  "main-menu-item": {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
    marginBottom: 10,
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#eee",
  },
  "main-menu-left": {
    flexDirection: "row",
    alignItems: "center",
  },
  "main-icon": {
    fontSize: 18,
    marginRight: 12,
  },
  "main-label": {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
  },
  "main-arrow": {
    fontSize: 18,
    color: "#999",
  },
});

export default ProfileScreen;
