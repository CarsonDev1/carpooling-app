import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function TripDetailScreen() {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.headerWrapper}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.headerTitle}>Chi tiết chuyến đi</Text>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Driver Info */}
        <View style={styles.driverBox}>
          <View>
            <Text style={styles.driverName}>Nguyễn Văn Sang</Text>
            <Text style={styles.vehicle}>Yamaha | SIRIUS</Text>
            <View style={styles.plateBox}>
              <Text style={styles.plateText}>59X1 - 250.12</Text>
            </View>
          </View>
          <View style={styles.avatar} />
        </View>

        {/* Actions */}
        <View style={styles.actionRow}>
          {["Yêu thích", "Hạn chế", "Chặn"].map((label, idx) => (
            <TouchableOpacity key={idx} style={styles.actionBtn}>
              <Text style={styles.actionText}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Route */}
        <View style={styles.routeBox}>
          <View style={styles.routeRow}>
            <Image
              source={require("../assets/ic-doc.png")}
              style={styles.dotImage}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={styles.routeLine}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                129 Phạm Ngọc Thạch, Đống Đa, Hà Nội 129 Phạm Ngọc Thạch, Đống
              </Text>
              <Text
                style={styles.routeLine}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                77 Hào Nam, Ô Chợ Dừa, Đống Đa, Hà Nội
              </Text>
              <Text style={styles.routeTime}>Khởi hành: 14:50 21/2/2025</Text>
            </View>
          </View>
        </View>

        {/* Payment */}
        <View style={styles.paymentBox}>
          <View style={styles.paymentHeader}>
            <Text style={styles.paymentTitle}>Thanh toán</Text>
            <Image
              source={require("../assets/zalopay.png")}
              style={styles.zaloIcon}
            />
          </View>
          <View style={styles.paymentLine}>
            <Text>Cước phí</Text>
            <Text>18.000đ</Text>
          </View>
          <View style={styles.paymentLine}>
            <Text>Khuyến mại</Text>
            <Text style={{ color: "green" }}>-6000đ</Text>
          </View>
          <View style={styles.paymentLine}>
            <Text style={styles.totalText}>Tổng</Text>
            <Text style={styles.totalText}>12.000đ</Text>
          </View>
        </View>

        {/* Trip code */}
        <Text style={styles.tripCode}>Mã chuyến đi: 291402502</Text>
        <Text style={styles.tripTime}>21/2/2025 | 14:50 - 15:08</Text>

        {/* Insurance */}
        <TouchableOpacity style={styles.insuranceBox}>
          <Text style={styles.insuranceText}>Bảo hiểm chuyến đi</Text>
          <Ionicons name="chevron-forward" size={20} color="#000" />
        </TouchableOpacity>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.retryBtn}
          onPress={() => navigation.navigate("TripInProgress")}
        >
          <Text style={styles.retryText}>Đặt lại</Text>
        </TouchableOpacity>
        <Text style={styles.supportText}>Bạn cần hỗ trợ?</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  headerWrapper: {
    backgroundColor: "#58C2F0",
    paddingTop: StatusBar.currentHeight || 44,
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
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginTop: 10,
  },

  content: {
    padding: 20,
    paddingBottom: 120,
  },

  driverBox: {
    backgroundColor: "#D9F2FF",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  driverName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  vehicle: {
    fontSize: 13,
    color: "#555",
    marginBottom: 6,
  },
  plateBox: {
    backgroundColor: "#fff",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  plateText: {
    fontWeight: "bold",
    fontSize: 13,
    color: "#007AFF",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
  },

  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 16,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    alignItems: "center",
  },
  actionText: {
    fontWeight: "600",
    fontSize: 13,
  },

  routeBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  routeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  dotImage: {
    width: 12,
    height: 42,
    resizeMode: "contain",
    marginRight: 8,
  },
  routeLine: {
    fontSize: 14,
    color: "#000",
    marginBottom: 2,
  },
  routeTime: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },

  paymentBox: {
    backgroundColor: "#FFF7C8",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  paymentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  paymentTitle: {
    fontWeight: "bold",
    fontSize: 15,
  },
  zaloIcon: {
    width: 50,
    height: 20,
    resizeMode: "contain",
  },
  paymentLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 2,
  },
  totalText: {
    fontWeight: "bold",
    fontSize: 14,
  },

  tripCode: {
    fontWeight: "bold",
    fontSize: 13,
    marginBottom: 2,
  },
  tripTime: {
    fontSize: 12,
    color: "#666",
    marginBottom: 16,
  },

  insuranceBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#D9F2FF",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
  },
  insuranceText: {
    fontWeight: "bold",
    fontSize: 14,
  },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
  },
  retryBtn: {
    backgroundColor: "#58C2F0",
    paddingVertical: 14,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  retryText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  supportText: {
    marginTop: 12,
    fontSize: 13,
    color: "#999",
  },
});
