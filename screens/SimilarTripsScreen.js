import React from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const trips = [
  {
    id: "1",
    from: "129 Phạm Ngọc Thạch, Đống Đa, Hà Nội",
    to: "77 Hào Nam, Ô Chợ Dừa, Đống Đa, Hà Nội",
    match: 90,
  },
  {
    id: "2",
    from: "129 Phạm Ngọc Thạch, Đống Đa, Hà Nội",
    to: "77 Hào Nam, Ô Chợ Dừa, Đống Đa, Hà Nội",
    match: 75,
  },
  {
    id: "3",
    from: "129 Phạm Ngọc Thạch, Đống Đa, Hà Nội",
    to: "77 Hào Nam, Ô Chợ Dừa, Đống Đa, Hà Nội",
    match: 90,
  },
  {
    id: "4",
    from: "129 Phạm Ngọc Thạch, Đống Đa, Hà Nội",
    to: "77 Hào Nam, Ô Chợ Dừa, Đống Đa, Hà Nội",
    match: 90,
  },
];

export default function SimilarTripsScreen() {
  const navigation = useNavigation();
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
                {item.from}
              </Text>
              <Text
                style={styles.address}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.to}
              </Text>
            </View>
          </View>
          <Text style={styles.departure}>Khởi hành: 14:50 21/2/2025</Text>
        </View>

        {/* RIGHT: Match + Button */}
        <View style={styles.rightSection}>
          <Text style={styles.matchText}>Độ tương thích: {item.match}%</Text>
          <TouchableOpacity style={styles.matchBtn}>
            <Text style={styles.btnText}>Ghép chuyến</Text>
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
          <TouchableOpacity style={styles.backBtn}>
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
