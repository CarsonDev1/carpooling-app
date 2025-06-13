// screens/PrivacySettings.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import HeaderProfile from "../components/Header";

const PrivacySettings = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [settings, setSettings] = useState({
    shareWithEmergencyContacts: true,
    autoShareOnAbnormal: false,
  });

  const toggleSwitch = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
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
        <Text style={styles["main-breadcrumb-current"]}>Riêng tư</Text>
      </View>

      {/* Privacy toggles */}
      <View style={{ padding: 16 }}>
        <View style={styles.item}>
          <Text style={styles.label}>
            Chia sẻ chi tiết chuyến đi với những người liên hệ khẩn cấp
          </Text>
          <Switch
            value={settings.shareWithEmergencyContacts}
            onValueChange={() => toggleSwitch("shareWithEmergencyContacts")}
          />
        </View>

        <View style={styles.item}>
          <Text style={styles.label}>
            Tự động chia sẻ chi tiết chuyến đi với những người liên hệ khẩn cấp nếu phát hiện hoạt động bất thường
          </Text>
          <Switch
            value={settings.autoShareOnAbnormal}
            onValueChange={() => toggleSwitch("autoShareOnAbnormal")}
          />
        </View>
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
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  label: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    marginRight: 10,
  },
});

export default PrivacySettings;
