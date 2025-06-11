import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
} from "react-native";
import { getCurrentUser } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";

const upcomingTrips = [
  {
    date: "24/6",
    time: "08:30",
    from: "Nhà",
    to: "27 Đường Láng, Ba...",
    status: "Đã ghép nối",
  },
  {
    date: "24/6",
    time: "13:30",
    from: "27 Đường Láng, Ba...",
    to: "Nhà",
    status: "Đã ghép nối",
  },
  {
    date: "24/6",
    time: "17:30",
    from: "Nhà",
    to: "231 Thái Hà, Đống...",
    status: "Chưa ghép nối",
  },
];

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const { logout } = useAuth();
  const navigation = useNavigation();

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
    Alert.alert(
      "Xác nhận đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất không?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đăng xuất",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error("Logout error:", error);
              Alert.alert("Lỗi", "Đăng xuất thất bại");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.welcomeSection}>
          <Image
            source={require("../assets/img-header-main.png")}
            style={styles.imageHeaderMain}
          />
        </View>

        <View style={styles.sectionMain}>
          <Image
            source={require("../assets/img-passenger-main.png")}
            style={styles.imageHeader}
          />
          <Image
            source={require("../assets/img-driver-main.png")}
            style={styles.imageHeader}
          />
        </View>

        {/* Chuyến đi sắp tới */}
        <View style={styles.tripSection}>
          <Text style={styles.tripTitle}>Chuyến đi sắp tới</Text>
        </View>
        <View style={styles.tripSection}>
          <View style={styles.leftColumn}>
            <Image
              source={require("../assets/img-view-schedule-main.png")} // bạn có thể thay đổi ảnh lịch tại đây
              style={styles.calendarImage}
            />
          </View>

          {/* Danh sách chuyến đi bên phải */}
          <View style={styles.rightColumn}>
            {upcomingTrips.map((trip, index) => (
              <View key={index} style={styles.tripCard}>
                <Text
                  style={[
                    styles.tripStatus,
                    trip.status === "Đã ghép nối"
                      ? styles.statusSuccess
                      : styles.statusPending,
                  ]}
                >
                  {trip.status}
                </Text>
                <View style={styles.tripTime}>
                  <Text style={styles.tripDate}>{trip.date}</Text>
                  <Text style={styles.tripHour}>{trip.time}</Text>
                </View>
                <View style={styles.tripDetail}>
                  <Text
                    style={styles.tripPlace}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {trip.from}
                  </Text>
                  <Text
                    style={styles.tripPlace}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {trip.to}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  scrollContent: {
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  welcomeSection: {
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: -20,
  },
  imageHeaderMain: {
    width: "100%",
    height: 200,
    resizeMode: "contain",
  },
  sectionMain: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    gap: 20,
    marginBottom: 20,
  },
  imageHeader: {
    flex: 1,
    height: 150,
    resizeMode: "contain",
  },

  // --- Chuyến đi sắp tới ---
  tripSection: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginTop: 10,
    gap: 4,
  },
  leftColumn: {
    flex: 5, // 40%
    alignItems: "center",
  },
  tripTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2C3E50",
    marginBottom: 8,
  },
  calendarImage: {
    width: "100%",
  },

  linkText: {
    fontSize: 13,
    color: "#4285F4",
    textDecorationLine: "underline",
    marginTop: 4,
  },
  rightColumn: {
    flex: 5, // 60%
    gap: 4,
  },
  tripCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D8E6F3",
    padding: 8,
    justifyContent: "space-between",
    alignItems: "center",
  },
  tripTime: {
    flex: 3,
    alignItems: "center",
  },
  tripDate: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
  },
  tripHour: {
    fontSize: 12,
    color: "#7F8C8D",
    marginTop: 4,
  },
  tripDetail: {
    flex: 7,
    paddingLeft: 12,
  },
  tripPlace: {
    fontSize: 12,
    color: "#2C3E50",
  },
  tripStatus: {
    marginTop: 4,
    fontSize: 10,
    position: "absolute",
    right: 10,
    top: 0,
    fontWeight: "600",
  },
  statusSuccess: {
    color: "#2ECC71",
  },
  statusPending: {
    color: "#E74C3C",
  },
});
