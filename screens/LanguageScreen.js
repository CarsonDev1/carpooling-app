import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import HeaderProfile from "../components/Header";

const LanguageScreen = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation();

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
    <ScrollView
      style={styles["main-container"]}
      showsVerticalScrollIndicator={false}
    >
      <HeaderProfile />

      <View style={styles["main-breadcrumb"]}>
        <TouchableOpacity onPress={() => navigation.navigate("ProfileMain")}>
          <Text style={styles["main-breadcrumb-back"]}>Tài khoản</Text>
        </TouchableOpacity>
      
          <Text style={styles["main-breadcrumb-divider"]}> › </Text>
          <Text style={styles["main-breadcrumb-current"]}  onPress={() => navigation.navigate("Setting")}>Cài đặt</Text>
      
        <Text style={styles["main-breadcrumb-divider"]}> › </Text>
        <Text style={styles["main-breadcrumb-current"]}>Ngôn ngữ</Text>
      </View>

      <View style={styles["main-menu"]}>
        <TouchableOpacity style={styles["main-menu-item"]}>
          <Text style={styles["main-label"]}>Tiếng Việt</Text>
          <Text style={styles["main-arrow"]}></Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles["main-menu-item"]}>
          <Text style={styles["main-label"]}>Tiếng Anh</Text>
         <Image source={require("../assets/ic-tick.png")} style={styles["main-arrow"]}/>
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
  "main-label": {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
  },
  "main-arrow": {
    fontSize: 15,
    color: "#999",
  },
});

export default LanguageScreen;
