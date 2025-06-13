// screens/RewardsScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import HeaderProfile from "../components/Header";

const RewardsScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState("driver"); // 'passenger' or 'driver'

  const getAvatarSource = () => {
    if (user?.avatar) {
      if (user.avatar.startsWith("http")) {
        return { uri: user.avatar };
      }
      return { uri: `http://192.168.1.91:5000${user.avatar}` };
    }
    return require("../assets/avatar.png");
  };

  const coupons = {
    passenger: new Array(3).fill({
      title: "Ưu đãi cho hành khách",
      points: 300,
    }),
    driver: new Array(6).fill({
      title: "Tặng 10% giá trị chuyến xe, tối đa 10k",
      points: 500,
    }),
  };

  return (
    <ScrollView style={styles.container}>
        <HeaderProfile />

      <View style={styles.breadcrumb}>
        <Text style={styles.breadcrumbText} onPress={() => navigation.navigate("ProfileMain")}>Tài khoản</Text>
        <Text style={styles.breadcrumbDivider}>›</Text>
        <Text style={styles.breadcrumbCurrent}>Tích điểm & Ưu đãi</Text>
        <Text style={styles.pointTotal}><Image source={require("../assets/ic-start.png")} style={styles.pointIcon}/> 3.829</Text>
      </View>

      <View style={styles.tabWrapper}>
        <TouchableOpacity onPress={() => setActiveTab("passenger")}> 
          <Text style={[styles.tab, activeTab === "passenger" ? styles.tabActive : styles.tabInactive]}>Ưu đãi hành khách</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab("driver")}> 
          <Text style={[styles.tab, activeTab === "driver" ? styles.tabActive : styles.tabInactive]}>Ưu đãi tài xế</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.couponList}>
        {coupons[activeTab].map((item, index) => (
          <View key={index} style={styles.couponItem}>
            <Text style={styles.couponTitle}>{item.title}</Text>
            <View style={styles.couponBottom}>
              <Text style={styles.couponPoints}><Image source={require("../assets/ic-start.png")} style={styles.pointIcon}/> {item.points}</Text>
              <TouchableOpacity style={styles.couponButton}>
                <Text style={styles.couponButtonText}>Đổi ngay</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#57C2FE",
    paddingVertical: 24,
    alignItems: "center",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginTop: 60,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E0E0E0",
    marginBottom: 8,
  },
  headerRight: {
    alignItems: "flex-start",
  },
  name: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  rank: {
    color: "#000",
    fontSize: 13,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginTop: 2,
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
  pointTotal: {
    marginLeft: "auto",
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  tabWrapper: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    fontSize: 14,
  },
  tabActive: {
    borderColor: "#57C2FE",
    color: "#57C2FE",
    fontWeight: "bold",
  },
  tabInactive: {
    borderColor: "#eee",
    color: "#999",
  },
  couponList: {
    padding: 16,
  },
  couponItem: {
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    padding: 12,
    marginBottom: 12,
  },
  couponTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
  },
  couponBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  couponPoints: {
    fontSize: 14,
    color: "#555",
  },
  couponButton: {
    backgroundColor: "#57C2FE",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  couponButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
});

export default RewardsScreen;
