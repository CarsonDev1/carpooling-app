import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Modal,
  Dimensions,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function TripInProgressScreen() {
  const [showPopup, setShowPopup] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.headerWrapper}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Di chuyển</Text>
        </View>
      </View>

      {/* Map Image */}
      {/* <Image
        source={require("../assets/map-trip.png")}
        style={styles.mapImage}
      /> */}

      {/* Bottom Info */}
      <View style={styles.bottomSheet}>
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

        {/* Route */}
        <View style={styles.routeBox}>
          <View style={styles.routeRow}>
            <Image
              source={require("../assets/ic-doc.png")}
              style={styles.dotImage}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.routeLine} numberOfLines={1}>
                129 Phạm Ngọc Thạch, Đống Đa, Hà Nội
              </Text>
              <Text style={styles.routeLine} numberOfLines={1}>
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
            <Text style={styles.totalText}>Tổng</Text>
            <Text style={styles.totalText}>18.000đ</Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.helpBtn}>
            <Text style={styles.helpText}>Cần trợ giúp?</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareBtn}>
            <Text style={styles.shareText}>Chia sẻ chuyến đi</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Popup Modal */}
      <Modal visible={showPopup} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.popupBox}>
            <Text style={styles.popupText}>
              Chúng tôi nhận thấy lộ trình của bạn vừa thay đổi. Bạn có đang di
              chuyển an toàn không? Hãy phản hồi để chúng tôi biết bạn vẫn ổn
              nhé!
            </Text>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => setShowPopup(false)}
            >
              <Text style={styles.primaryText}>Tôi vẫn ổn</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => setShowPopup(false)}
            >
              <Text style={styles.secondaryText}>
                Tôi cảm thấy không an toàn
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },

  mapImage: {
    width: "100%",
    height: 280,
    resizeMode: "cover",
  },

  bottomSheet: {
    padding: 20,
    backgroundColor: "#fff",
    flex: 1,
  },

  driverBox: {
    backgroundColor: "#D9F2FF",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
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

  routeBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
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

  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  helpBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  shareBtn: {
    flex: 1,
    backgroundColor: "#58C2F0",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  helpText: {
    color: "#000",
    fontWeight: "bold",
  },
  shareText: {
    color: "#fff",
    fontWeight: "bold",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  popupBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    elevation: 5,
  },
  popupText: {
    fontSize: 15,
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  primaryBtn: {
    backgroundColor: "#58C2F0",
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: "center",
  },
  primaryText: {
    color: "#fff",
    fontWeight: "bold",
  },
  secondaryBtn: {
    borderColor: "#ccc",
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  secondaryText: {
    color: "#000",
    fontWeight: "bold",
  },
});
