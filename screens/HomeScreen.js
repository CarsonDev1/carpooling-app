import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import { getCurrentUser } from "../api/authApi";
import { useAuth } from "../context/AuthContext";

const HomeScreen = () => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const { logout } = useAuth();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await getCurrentUser();
      if (response.status === "success") {
        setUserData(response.data.user);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      Alert.alert("Lỗi", "Không thể lấy thông tin người dùng");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Lỗi", "Đăng xuất thất bại");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#57C2FE" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {userData && (
        <View style={styles.userInfoContainer}>
          <Text style={styles.welcomeText}>Xin chào, {userData.fullName}!</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Số điện thoại:</Text>
            <Text style={styles.value}>{userData.phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Trạng thái:</Text>
            <Text style={styles.value}>
              {userData.isActive ? "Đang hoạt động" : "Đã khóa"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Vai trò:</Text>
            <Text style={styles.value}>{userData.role}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#57C2FE",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  userInfoContainer: {
    padding: 16,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: "#666",
    width: 100,
  },
  value: {
    fontSize: 16,
    color: "#000",
    flex: 1,
  },
});

export default HomeScreen;
