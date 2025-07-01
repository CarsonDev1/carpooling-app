import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getMyTrips, getMyJoinedTrips } from "../api/tripsApi";
import { useAuth } from "../context/AuthContext";

const HistoryScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [tab, setTab] = useState("hanhkhach");
  const [passengerTrips, setPassengerTrips] = useState([]);
  const [driverTrips, setDriverTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTripsHistory();
  }, []);

  const loadTripsHistory = async () => {
    try {
      setLoading(true);
      
      // Load both passenger trips and driver trips
      const [passengerResponse, driverResponse] = await Promise.all([
        getMyJoinedTrips({ includePast: true, limit: 50 }).catch(() => ({ data: [] })),
        getMyTrips({ includePast: true, limit: 50 }).catch(() => ({ data: [] }))
      ]);

      // Format passenger trips
      const formattedPassengerTrips = (passengerResponse.data || []).map(trip => formatTripForHistory(trip, 'passenger'));
      
      // Format driver trips  
      const formattedDriverTrips = (driverResponse.data || []).map(trip => formatTripForHistory(trip, 'driver'));

      setPassengerTrips(formattedPassengerTrips);
      setDriverTrips(formattedDriverTrips);
    } catch (error) {
      console.error("Error loading trips history:", error);
      Alert.alert("Lỗi", "Không thể tải lịch sử chuyến đi");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTripsHistory();
    setRefreshing(false);
  };

  const formatTripForHistory = (trip, role) => {
    const departureDate = new Date(trip.departureTime);
    const formattedDate = `${departureDate.getDate()}/${departureDate.getMonth() + 1}/${departureDate.getFullYear()}`;
    const formattedTime = departureDate.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    return {
      id: trip._id,
      from: trip.startLocation?.address || '',
      to: trip.endLocation?.address || '',
      time: formattedTime,
      date: formattedDate,
      price: trip.price?.toLocaleString('vi-VN') || '0',
      status: trip.status,
      role,
      fullTrip: trip
    };
  };

  const handleTripPress = (trip) => {
    navigation.navigate("TripDetail", { tripId: trip.id });
  };

  const handleReorder = (trip) => {
            navigation.navigate("CreateTrip");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'cancelled': return '#F44336';
      case 'in_progress': return '#FF9800';
      case 'scheduled': return '#2196F3';
      default: return '#666';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      case 'in_progress': return 'Đang di chuyển';
      case 'scheduled': return 'Đã lên lịch';
      default: return status;
    }
  };

  const renderList = (dataList) => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4285F4" />
          <Text style={styles.loadingText}>Đang tải lịch sử...</Text>
        </View>
      );
    }

    if (dataList.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {tab === "hanhkhach" ? 
              "Chưa có chuyến đi nào với vai trò hành khách" : 
              "Chưa có chuyến đi nào với vai trò tài xế"}
          </Text>
                      <TouchableOpacity
              style={styles.createTripButton}
              onPress={() => navigation.navigate("CreateTrip")}
            >
            <Text style={styles.createTripButtonText}>
              {tab === "hanhkhach" ? "Tìm chuyến đi" : "Tạo chuyến đi"}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <ScrollView 
        style={styles.list} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {dataList.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={() => handleTripPress(item)}
          >
            <View style={styles.cardHeader}>
              <View style={{ flexDirection: "row", flex: 1 }}>
                <Image
                  source={require("../assets/ic-doc.png")}
                  style={styles.dot}
                />
                <View style={styles.row}>
                  <Text style={styles.place} numberOfLines={1}>
                    {item.from}
                  </Text>
                  <Text style={styles.place} numberOfLines={1}>
                    {item.to}
                  </Text>
                </View>
              </View>
              <View style={styles.priceContainer}>
                <Text style={styles.price}>{item.price}đ</Text>
                <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
                  {getStatusText(item.status)}
                </Text>
              </View>
            </View>

            <View style={styles.footerRow}>
              <Text style={styles.subInfo}>
                {item.time} {item.date}
              </Text>
              <View style={styles.rightActions}>
                <TouchableOpacity onPress={() => handleReorder(item)}>
                  <Text style={styles.reorder}>Đặt lại →</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === "hanhkhach" && styles.activeTab]}
          onPress={() => setTab("hanhkhach")}
        >
          <Text
            style={[
              styles.tabText,
              tab === "hanhkhach" && styles.activeTabText,
            ]}
          >
            Hành khách
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === "taixe" && styles.activeTab]}
          onPress={() => setTab("taixe")}
        >
          <Text
            style={[styles.tabText, tab === "taixe" && styles.activeTabText]}
          >
            Tài xế
          </Text>
        </TouchableOpacity>
      </View>

      {tab === "hanhkhach" ? renderList(passengerTrips) : renderList(driverTrips)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#F2F2F2",
    margin: 16,
    borderRadius: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: "#fff",
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    color: "#777",
  },
  activeTabText: {
    color: "#000",
    fontWeight: "600",
  },
  list: {
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: "#F9F9F9",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  row: {
    flex: 1,
  },
  dot: {
    marginTop: 10,
    marginRight: 10,
  },
  place: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  footerRow: {
    marginTop: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  subInfo: {
    fontSize: 12,
    color: "#777",
  },
  rightActions: {
    alignItems: "flex-end",
  },
  price: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#000",
    marginLeft: 10,
  },
  reorder: {
    fontSize: 12,
    color: "#007BFF",
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  createTripButton: {
    backgroundColor: "#4285F4",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createTripButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  status: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
});

export default HistoryScreen;
