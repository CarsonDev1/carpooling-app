import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import HeaderProfile from "../components/Header";

const HelpCenterScreen = ({ navigation }) => {
  const helpTopics = [
    "Vấn đề an toàn và khẩn cấp",
    "Vấn đề với tài xế",
    "Vấn đề với hành khách",
    "Vấn đề về thanh toán/hoàn tiền",
    "Thông tin về cước phí",
    "Vấn đề về ứng dụng",
  ];

  return (
    <ScrollView style={styles.container}>
      <HeaderProfile />

      {/* Breadcrumb */}
      <View style={styles.breadcrumb}>
        <Text
          style={styles.breadcrumbText}
          onPress={() => navigation.navigate("ProfileMain")}
        >
          Tài khoản
        </Text>
        <Text style={styles.breadcrumbDivider}>›</Text>
        <Text style={styles.breadcrumbCurrent}>Trung tâm hỗ trợ</Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>Chúng tôi có thể giúp gì cho bạn?</Text>

      {/* Help Topics */}
      <View style={{ paddingHorizontal: 16 }}>
        {helpTopics.map((topic, index) => (
          <TouchableOpacity key={index} style={styles.item}>
            <Text style={styles.itemText}>{topic}</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}

        {/* Hỗ trợ ngay */}
        <TouchableOpacity
  style={styles.banner}
  onPress={() => navigation.navigate("LiveSupport")}
>
  <View style={styles.bannerRow}>
    <Image
      source={require("../assets/ic-help.png")}
      style={styles.bannerIcon}
    />
    <View style={styles.bannerTextWrapper}>
      <Text style={styles.bannerTitle}>Hỗ trợ ngay</Text>
      <Text style={styles.bannerDesc}>
        Liên hệ ngay với 2gether nếu bạn muốn được hỗ trợ ngoài các gợi ý trên.
      </Text>
    </View>
    <Text style={styles.arrow}>›</Text>
  </View>
</TouchableOpacity>

      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  breadcrumb: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 16,
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
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  item: {
    backgroundColor: "#F9F9F9",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemText: {
    fontSize: 14,
    color: "#333",
  },
  arrow: {
    fontSize: 18,
    color: "#999",
  },
  banner: {
    marginTop: 16,
    backgroundColor: "#FFF9DB",
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 4,
    borderColor: "#FFD700",
  },
  bannerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  bannerIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  bannerTextWrapper: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  bannerDesc: {
    fontSize: 13,
    color: "#555",
    lineHeight: 18,
  },
  arrow: {
    fontSize: 20,
    color: "#000",
    marginLeft: 6,
  },

});

export default HelpCenterScreen;
