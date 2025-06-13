import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { useAuth } from "../context/AuthContext";

const HeaderProfile = () => {
  const { user } = useAuth();

  const getAvatarSource = () => {
    if (user?.avatar) {
      if (user.avatar.startsWith("http")) {
        return { uri: user.avatar };
      }
      return { uri: `http://192.168.1.91:5000${user.avatar}` };
    }
    return require("../assets/avatar.png");
  };

  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Image source={getAvatarSource()} style={styles.avatar} />
        <View style={styles.headerRight}>
          <Text style={styles.name}>{user?.fullName || "Người dùng"}</Text>
          <Text style={styles.rank}>Hạng vàng</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default HeaderProfile;
