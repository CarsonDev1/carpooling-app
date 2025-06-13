import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import HeaderProfile from "../components/Header";
import { useAuth } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";

const ProfileDetailScreen = () => {
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
    <ScrollView style={styles.container}>
      <HeaderProfile />

      {/* Breadcrumb + Edit */}
      <View style={styles.headerRow}>
        <View style={styles.breadcrumb}>
          <Text style={styles.breadcrumbText} onPress={() => navigation.goBack()}>
            Tài khoản
          </Text>
          <Text style={styles.breadcrumbDivider}>›</Text>
          <Text style={styles.breadcrumbCurrent}>Hồ sơ</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate("EditProfile")}>
          <Ionicons name="pencil" size={20} color="#333" />
        </TouchableOpacity>
      </View>

    

      {/* Profile Fields */}
      <View style={styles.infoWrapper}>
        <View style={styles.infoBox}>
          <Text style={styles.label}>Họ và tên:</Text>
          <Text style={styles.value}>{user?.fullName || "Chưa cập nhật"}</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.label}>Sinh nhật:</Text>
          <Text style={styles.value}>{user?.birthday || "Chưa cập nhật"}</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.label}>Số điện thoại:</Text>
          <Text style={styles.value}>{user?.phone || "Chưa cập nhật"}</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{user?.email || "Chưa cập nhật"}</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.label}>Số CCCD:</Text>
          <Text style={styles.value}>{user?.cccd || "Chưa cập nhật"}</Text>
        </View>
      </View>

      {/* Ride Stats */}
      <View style={styles.statsWrapper}>
        <Text style={styles.statText}>Số chuyến chạy: {user?.totalRides || 0}</Text>
        <Text style={styles.statText}>Số chuyến đi ké: {user?.joinedRides || 0}</Text>
        <Text style={styles.statText}>Điểm tích cực: {user?.activeScore || "0%"}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 16,
  },
  breadcrumb: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  breadcrumbText: {
    fontSize: 14,
    color: "#007AFF",
  },
  breadcrumbDivider: {
    fontSize: 14,
    color: "#333",
  },
  breadcrumbCurrent: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },
  avatarContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#eee",
  },
  infoWrapper: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  infoBox: {
    backgroundColor: "#F9F9F9",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 10,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 13,
    color: "#555",
    marginBottom: 4,
  },
  value: {
    fontSize: 15,
    color: "#000",
    fontWeight: "500",
  },
  statsWrapper: {
    marginTop: 20,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  statText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
  },
});

export default ProfileDetailScreen;
