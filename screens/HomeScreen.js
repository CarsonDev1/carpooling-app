// Đảm bảo TẤT CẢ import đều ở đây, trước bất kỳ code nào khác
import React, { useEffect, useState, useRef } from "react";
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
  Animated,
  Dimensions,
  RefreshControl,
} from "react-native";
import { getCurrentUser } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { getMyJoinedTrips, getMyTrips } from "../api/tripsApi";
import { getWalletBalance } from "../api/walletApi";

// Sau đó mới có các constants và components
const { width: screenWidth } = Dimensions.get("window");

// Remove static trips data - will be loaded from API

// Component đám mây
const CloudComponent = ({ size = 30, style }) => (
  <Image
    source={require("../assets/ic-cloud.png")}
    style={{ width: 60, height: 30 }}
  />
);

// Component nhân vật hành khách
const PassengerCharacter = ({ size = 60 }) => (
  <Image
    source={require("../assets/ic-monkey.png")}
    style={{ width: 65, height: 100 }}
  />
);

// Component nhân vật tài xế
const DriverCharacter = ({ size = 60 }) => (
  <Image
    source={require("../assets/ic-driver.png")}
    style={{ width: 65, height: 100 }}
  />
);

const AnimatedCloud = ({ delay = 0, speed, size, top }) => {
  const translateX = useRef(new Animated.Value(-180)).current;
  const frameWidth = (screenWidth - 40) / 2 - 10;

  useEffect(() => {
    const animate = () => {
      setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(translateX, {
              toValue: frameWidth + 60,
              duration: speed,
              useNativeDriver: true,
            }),
            Animated.timing(translateX, {
              toValue: -190,
              duration: 0,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }, delay);
    };

    animate();
  }, [translateX, speed, frameWidth, delay]);

  return (
    <Animated.View
      style={[
        styles.cloudContainer,
        {
          transform: [{ translateX }],
          top: top,
        },
      ]}
    >
      <CloudComponent size={size} />
    </Animated.View>
  );
};

// Component khung hành khách
const PassengerFrame = () => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      style={styles.animatedFrame}
      onPress={() => navigation.navigate("CreateTrip")}
    >
      <AnimatedCloud initialPosition={-40} speed={9000} size={25} top={10} />
      <AnimatedCloud initialPosition={-60} speed={10000} size={20} top={25} />
      <AnimatedCloud initialPosition={-80} speed={11000} size={22} top={40} />

      <View style={styles.characterContainer2}>
        <PassengerCharacter size={50} />
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.frameTitle}>Hành khách</Text>
      </View>
    </TouchableOpacity>
  );
};

// Component khung tài xế
const DriverFrame = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  const handleDriverPress = () => {
    // Check if user is already a driver
    const isDriver = user?.role === 'driver' || user?.role === 'both';

    if (isDriver) {
      // Show options for existing drivers
      Alert.alert(
        'Chế độ tài xế',
        'Chọn hành động:',
        [
          {
            text: 'Xem yêu cầu',
            onPress: () => navigation.navigate("DriverRequests"),
          },
          {
            text: 'Chuyển sang Driver mode',
            onPress: () => navigation.navigate("DriverHome"),
            style: 'default',
          },
          {
            text: 'Hủy',
            style: 'cancel',
          },
        ]
      );
    } else {
      // Navigate to driver registration
      navigation.navigate("DriverRegistration");
    }
  };

  const getDriverTitle = () => {
    const isDriver = user?.role === 'driver' || user?.role === 'both';
    return isDriver ? "Xem yêu cầu" : "Làm tài xế";
  };

  return (
    <TouchableOpacity
      style={styles.animatedFrame}
      onPress={handleDriverPress}
    >
      <AnimatedCloud initialPosition={-50} speed={7500} size={24} top={12} />
      <AnimatedCloud initialPosition={-70} speed={9000} size={18} top={30} />
      <AnimatedCloud initialPosition={-90} speed={6500} size={26} top={45} />

      <View style={styles.characterContainer}>
        <DriverCharacter size={50} />
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.frameTitle}>{getDriverTitle()}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [upcomingTrips, setUpcomingTrips] = useState([]);
  const [tripsLoading, setTripsLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const { logout } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    fetchUserData();
    fetchUpcomingTrips();
    fetchWalletBalance();
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
      // Don't show alert for network errors, just log
      if (error.response?.status === 429) {
        console.log("Rate limited, will retry later");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const response = await getWalletBalance();
      if (response?.success) {
        setWalletBalance(response.data.balance || 0);
      }
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
      // Don't show error to user, just keep 0 balance
      setWalletBalance(0);
    }
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await Promise.all([
        fetchUserData(),
        fetchUpcomingTrips(),
        fetchWalletBalance(),
      ]);
    } catch (error) {
      console.error("Error during refresh:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const fetchUpcomingTrips = async () => {
    try {
      setTripsLoading(true);

      // Get both my trips (as driver) and joined trips (as passenger)
      const [myTripsResponse, joinedTripsResponse] = await Promise.all([
        getMyTrips({
          status: 'confirmed',
          limit: 5
        }).catch(() => ({ data: [] })),
        getMyJoinedTrips({
          status: 'waiting_for_driver',
          limit: 5
        }).catch(() => ({ data: [] }))
      ]);

      // Combine and format trips
      const allTrips = [
        ...(myTripsResponse.data || []).map(trip => ({ ...trip, role: 'driver' })),
        ...(joinedTripsResponse.data || []).map(trip => ({ ...trip, role: 'passenger' }))
      ];

      // Sort by departure time and take only first 3
      const sortedTrips = allTrips
        .sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime))
        .slice(0, 3)
        .map(trip => formatTripForDisplay(trip));

      setUpcomingTrips(sortedTrips);
    } catch (error) {
      console.error("Error fetching trips:", error);
      // Don't show error to user, just keep empty array
      setUpcomingTrips([]);
    } finally {
      setTripsLoading(false);
    }
  };

  const formatTripForDisplay = (trip) => {
    const raw = trip?.departureTime || trip?.createdAt;
    const departureDate = raw ? new Date(raw) : null;
    const isValid = departureDate && !isNaN(departureDate.getTime());
    const formattedDate = isValid ? `${departureDate.getDate()}/${departureDate.getMonth() + 1}` : '';
    const formattedTime = isValid
      ? departureDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      : '';

    // Truncate long addresses
    const truncateAddress = (address, maxLength = 20) => {
      if (!address) return "";
      return address.length > maxLength ?
        address.substring(0, maxLength) + "..." :
        address;
    };

    // Determine status based on trip data
    let status = "Chưa ghép nối";
    if (trip.role === 'driver') {
      const acceptedPassengers = (trip.passengers || []).filter(p => p.status === 'accepted');
      status = acceptedPassengers.length > 0 ? "Đã ghép nối" : "Chưa ghép nối";
    } else {
      // For passenger, check if accepted
      const myPassengerRecord = (trip.passengers || []).find(p => p.user === userData?._id);
      status = myPassengerRecord?.status === 'accepted' ? "Đã ghép nối" : "Đang chờ xác nhận";
    }

    return {
      id: trip._id,
      date: formattedDate || '—',
      time: formattedTime || '—',
      from: truncateAddress(trip.startLocation?.address),
      to: truncateAddress(trip.endLocation?.address),
      status,
      role: trip.role,
      fullTrip: trip
    };
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.welcomeSection}>
          <Image
            source={require("../assets/img-header-main.png")}
            style={styles.imageHeaderMain}
          />

          {/* Wallet Info */}
          <View style={styles.walletInfo}>
            <TouchableOpacity
              style={styles.walletCard}
              onPress={() => navigation.navigate("Wallet")}
            >
              <View style={styles.walletLeft}>
                <Text style={styles.walletIcon}>💰</Text>
                <Text style={styles.walletLabel}>Ví điện tử</Text>
              </View>
              <View style={styles.walletRight}>
                <Text style={styles.walletBalance}>
                  {walletBalance ? walletBalance.toLocaleString('vi-VN') : '0'} VNĐ
                </Text>
                <Text style={styles.walletAction}>Nhấn để xem chi tiết ›</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sectionMain}>
          <PassengerFrame />
          <DriverFrame />
        </View>

        <View style={styles.tripSection}>
          <Text style={styles.tripTitle}>Chuyến đi sắp tới</Text>
        </View>

        <View style={styles.mainContainer}>
          <View style={styles.mainLeft}>
            <TouchableOpacity onPress={() => navigation.navigate("Schedule")}>
              <Image
                source={require("../assets/img-view-schedule-main.png")}
                style={styles.mainCalendarImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.mainRight}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {tripsLoading ? (
                <View style={styles.loadingTrips}>
                  <ActivityIndicator color="#4285F4" size="small" />
                  <Text style={styles.loadingTripsText}>Đang tải chuyến đi...</Text>
                </View>
              ) : (upcomingTrips || []).length > 0 ? (
                (upcomingTrips || []).map((trip, index) => (
                  <TouchableOpacity
                    key={trip.id || index}
                    style={styles.mainTripCard}
                    onPress={() => navigation.navigate("TripDetail", { tripId: trip.id })}
                  >
                    <Text
                      style={[
                        styles.mainStatus,
                        trip.status === "Đã ghép nối"
                          ? styles.mainStatusSuccess
                          : trip.status === "Đang chờ xác nhận"
                            ? styles.mainStatusPending
                            : styles.mainStatusDefault,
                      ]}
                    >
                      {trip.status}
                    </Text>
                    <View style={styles.mainLeftPart}>
                      <Text style={styles.mainDate}>{trip.date}</Text>
                      <Text style={styles.mainTime}>{trip.time}</Text>
                    </View>
                    <View style={styles.mainMiddlePart}>
                      <Text
                        style={styles.mainPlace}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {trip.from}
                      </Text>
                      <Text
                        style={styles.mainPlace}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {trip.to}
                      </Text>
                    </View>
                    <View style={styles.roleIndicator}>
                      <Text style={styles.roleText}>
                        {trip.role === 'driver' ? '🚗 Tài xế' : '👤 Hành khách'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.noTrips}>
                  <Text style={styles.noTripsText}>Chưa có chuyến đi nào</Text>
                  <TouchableOpacity
                    style={styles.createTripButton}
                    onPress={() => navigation.navigate("CreateTrip")}
                  >
                    <Text style={styles.createTripButtonText}>Tạo chuyến đi</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>

        <View style={styles.favoriteHeader}>
          <Text style={styles.tripTitle}>Điểm đến yêu thích</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Profile', { screen: 'Favorites' })}>
            <Image
              source={require("../assets/ic-add.png")}
              style={styles.favoriteAddIcon}
            />
          </TouchableOpacity>
        </View>

        {(() => {
          const favorites = Array.isArray(userData?.addresses) ? userData.addresses : [];
          const getIconForLabel = (label) => {
            const l = (label || '').toLowerCase();
            if (l.includes('nhà') || l.includes('home')) return require('../assets/icon-home.png');
            if (l.includes('trường') || l.includes('school')) return require('../assets/icon-school.png');
            return require('../assets/icon-location.png');
          };
          if (!favorites.length) {
            return (
              <View style={styles.favoriteRow}>
                <View style={styles.favoriteLeft}>
                  <Image source={require('../assets/icon-location.png')} style={styles.favoriteIcon} />
                  <View style={styles.favoriteDropdown}>
                    <Text style={styles.favoriteDropdownText}>Chưa có địa điểm</Text>
                  </View>
                </View>
                <View style={styles.favoriteRight}>
                  <TouchableOpacity onPress={() => navigation.navigate('Profile', { screen: 'Favorites' })}>
                    <Text style={styles.viewAllText}>Thêm địa điểm</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }
          return favorites.map((fav, idx) => (
            <View key={`${fav.label}-${idx}`} style={styles.favoriteRow}>
              <View style={styles.favoriteLeft}>
                <Image source={getIconForLabel(fav.label)} style={styles.favoriteIcon} />
                <View style={styles.favoriteDropdown}>
                  <Text style={styles.favoriteDropdownText} numberOfLines={1}>
                    {fav.label || 'Địa điểm'}
                  </Text>
                </View>
              </View>
              <View style={styles.favoriteRight}>
                <Text
                  style={styles.favoriteAddress}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {fav.address || ''}
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Profile', { screen: 'Favorites' })}>
                  <Image
                    source={require('../assets/icon-edit.png')}
                    style={styles.favoriteEditIcon}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ));
        })()}
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
  animatedFrame: {
    flex: 1,
    height: 150,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    borderWidth: 3,
    borderColor: "#A0E3F2",
    position: "relative",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  cloudContainer: {
    position: "absolute",
    zIndex: 1,
  },
  characterContainer: {
    position: "absolute",
    top: 30,
    right: 15,
    zIndex: 10,
  },
  characterContainer2: {
    position: "absolute",
    top: 30,
    right: 0,
    zIndex: 10,
  },
  titleContainer: {
    position: "absolute",
    bottom: 15,
    left: 15,
    zIndex: 10,
  },
  frameTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
  },
  tripSection: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginTop: 10,
    gap: 4,
  },
  favoriteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 20,
  },
  favoriteAddIcon: {
    width: 22,
    height: 22,
  },
  favoriteRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 12,
    padding: 8,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    gap: 10,
  },
  favoriteLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 3,
  },
  favoriteIcon: {
    width: 18,
    height: 18,
    resizeMode: "contain",
    marginRight: 6,
  },
  favoriteDropdown: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    maxWidth: 90,
    minWidth: 90,
    flex: 1,
  },
  favoriteDropdownText: {
    fontWeight: "600",
    color: "#222",
    fontSize: 13,
    textAlign: "center",
    flex: 1,
  },
  favoriteDropdownIcon: {
    width: 10,
    height: 10,
    resizeMode: "contain",
  },
  favoriteRight: {
    flex: 6,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  favoriteAddress: {
    fontSize: 14,
    color: "#222",
    flex: 1,
    marginRight: 6,
  },
  favoriteEditIcon: {
    width: 16,
    height: 16,
    resizeMode: "contain",
    marginTop: 2,
  },
  loadingTrips: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingTripsText: {
    marginLeft: 8,
    color: "#666",
    fontSize: 14,
  },
  noTrips: {
    alignItems: "center",
    padding: 20,
  },
  noTripsText: {
    color: "#666",
    fontSize: 14,
    marginBottom: 12,
  },
  createTripButton: {
    backgroundColor: "#4285F4",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createTripButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  roleIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  roleText: {
    fontSize: 10,
    color: "#666",
  },
  mainStatusDefault: {
    backgroundColor: "#E0E0E0",
    color: "#666",
  },
  tripTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2C3E50",
    marginBottom: 8,
  },
  mainContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
  },
  mainLeft: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  mainCalendarImage: {
    contentFit: "contain",
  },
  mainRight: {
    flex: 1,
    justifyContent: "flex-start",
    paddingVertical: 16,
  },
  mainTripCard: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 6,
    marginBottom: 6,
    alignItems: "center",
    justifyContent: "space-between",
  },
  mainLeftPart: {
    alignItems: "center",
    marginRight: 10,
  },
  mainDate: {
    fontWeight: "700",
    fontSize: 13,
    marginBottom: 4,
  },
  mainTime: {
    fontSize: 13,
    color: "#444",
  },
  mainMiddlePart: {
    flex: 1,
    marginHorizontal: 8,
  },
  mainPlace: {
    fontSize: 13,
    color: "#333",
  },
  mainStatus: {
    fontSize: 10,
    fontWeight: "600",
    position: "absolute",
    right: 4,
    top: 2,
  },
  mainStatusSuccess: {
    color: "#28a745",
  },
  mainStatusPending: {
    color: "#dc3545",
  },
  walletInfo: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 10,
  },
  walletCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 200,
  },
  walletLeft: {
    alignItems: "center",
    marginRight: 12,
  },
  walletIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  walletLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  walletRight: {
    flex: 1,
    alignItems: "flex-end",
  },
  walletBalance: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2C3E50",
    marginBottom: 4,
  },
  walletAction: {
    fontSize: 10,
    color: "#4285F4",
    fontWeight: "500",
  },
});
