import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  Image,
  Dimensions,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { joinTrip } from "../api/tripsApi";

const { width } = Dimensions.get("window");

export default function SimilarTripsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(null);

  // Get data from navigation params
  const { 
    trips: tripsData = [], 
    searchParams = {}, 
    fromLocation = "", 
    toLocation = "",
    estimatedPrice = null 
  } = route.params || {};

  useEffect(() => {
    // Set trips data with calculated match percentage
    const processedTrips = tripsData.map((trip, index) => ({
      ...trip,
      match: calculateMatchPercentage(trip, searchParams),
      formattedFrom: trip.startLocation?.address || fromLocation,
      formattedTo: trip.endLocation?.address || toLocation,
      formattedDepartureTime: formatDateTime(trip.departureTime),
    }));
    setTrips(processedTrips);
  }, [tripsData, searchParams, fromLocation, toLocation]);

  // Calculate match percentage based on location proximity and time
  const calculateMatchPercentage = (trip, params) => {
    // Simple calculation based on distance and time
    let match = 100;
    
    // Reduce match if time difference is too large
    if (params.departureTime) {
      const timeDiff = Math.abs(new Date(trip.departureTime) - new Date(params.departureTime));
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      if (hoursDiff > 2) match -= 20;
      else if (hoursDiff > 1) match -= 10;
    }
    
    // Random variation for demo
    match -= Math.floor(Math.random() * 15);
    return Math.max(75, Math.min(100, match));
  };

  // Format date time for display
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return `${date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })} ${date.toLocaleDateString('vi-VN')}`;
  };

  // Handle join trip
  const handleJoinTrip = async (trip) => {
    try {
      setJoinLoading(trip._id);
      
      const passengerData = {
        pickupLocation: {
          address: fromLocation,
          coordinates: searchParams.startLat && searchParams.startLng ? {
            lat: searchParams.startLat,
            lng: searchParams.startLng
          } : null
        },
        dropoffLocation: {
          address: toLocation,
          coordinates: searchParams.endLat && searchParams.endLng ? {
            lat: searchParams.endLat,
            lng: searchParams.endLng
          } : null
        }
      };

      const response = await joinTrip(trip._id, passengerData);
      
      Alert.alert(
        "Thành công! 🚗",
        "Yêu cầu tham gia chuyến đi đã được gửi. Đang chờ tài xế xác nhận...",
        [
          {
            text: "Chờ phản hồi",
            onPress: () => navigation.navigate("WaitingForDriver", { 
              tripId: trip._id,
              passengerRequestId: response.data?._id 
            })
          }
        ]
      );
    } catch (error) {
      Alert.alert("Lỗi", error.message || "Không thể tham gia chuyến đi");
    } finally {
      setJoinLoading(null);
    }
  };
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        {/* LEFT: Address + Time */}
        <View style={styles.infoSection}>
          <View style={styles.row}>
            <Image
              source={require("../assets/ic-doc.png")}
              style={styles.dotIcon}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={styles.address}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.formattedFrom || item.startLocation?.address}
              </Text>
              <Text
                style={styles.address}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.formattedTo || item.endLocation?.address}
              </Text>
            </View>
          </View>
          <Text style={styles.departure}>
            Khởi hành: {item.formattedDepartureTime}
          </Text>
          <Text style={styles.priceText}>
            Giá: {item.price?.toLocaleString('vi-VN') || 'Chưa có'} VND
          </Text>
          <Text style={styles.seatsText}>
            Còn {item.availableSeats} chỗ trống
          </Text>
        </View>

        {/* RIGHT: Match + Button */}
        <View style={styles.rightSection}>
          <Text style={styles.matchText}>Độ tương thích: {item.match}%</Text>
          <TouchableOpacity 
            style={[styles.matchBtn, joinLoading === item._id && styles.disabledBtn]}
            onPress={() => handleJoinTrip(item)}
            disabled={joinLoading === item._id}
          >
            {joinLoading === item._id ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.btnText}>Ghép chuyến</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.headerWrapper}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.headerTitle}>Lộ trình tương tự</Text>
      <FlatList
        data={trips}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: 100,
        }}
      />

      <View style={styles.footer}>
        <TouchableOpacity style={styles.autoMatchBtn}>
          <Text
            style={styles.autoMatchText}
            onPress={() => navigation.navigate("WaitingMatch")}
          >
            Ghép tự động
          </Text>
        </TouchableOpacity>
        <Text style={styles.footerNote}>
          Chưa tìm được lộ trình phù hợp? Đừng lo, bật chế độ ghép tự động để{" "}
          <Text style={{ fontWeight: "700" }}>2gether</Text> giúp bạn tìm thêm
          đối tác phù hợp nhé!
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  headerWrapper: {
    backgroundColor: "#58C2F0",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 44,
    paddingBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  backBtn: {
    position: "absolute",
    left: 16,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginTop: 10,
  },

  card: {
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#F9F9F9",
    borderColor: "#EEE",
    borderWidth: 1,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },

  infoSection: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  dotIcon: {
    width: 18,
    height: 42,
    resizeMode: "contain",
    marginRight: 8,
  },
  address: {
    fontSize: width < 360 ? 13 : 14,
    color: "#333",
    marginBottom: 2,
    maxWidth: width * 0.6,
  },
  departure: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  priceText: {
    fontSize: 12,
    color: "#2E7D32",
    fontWeight: "600",
    marginTop: 2,
  },
  seatsText: {
    fontSize: 12,
    color: "#FF9800",
    marginTop: 2,
  },

  rightSection: {
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  matchText: {
    fontSize: 13,
    color: "#888",
    marginBottom: 8,
    textAlign: "right",
    maxWidth: 100,
  },
  matchBtn: {
    backgroundColor: "#58C2F0",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },
  disabledBtn: {
    opacity: 0.6,
  },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#EEE",
    alignItems: "center",
  },
  autoMatchBtn: {
    backgroundColor: "#58C2F0",
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 10,
    marginBottom: 12,
  },
  autoMatchText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  footerNote: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
  },
});
