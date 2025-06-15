import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function WaitingMatchScreen() {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <Image source={require("../assets/chibi.png")} style={styles.image} />

      <Text style={styles.title}>Bạn chờ một chút nhé!</Text>

      <Text style={styles.description}>
        2gether đang giúp bạn tìm kiếm đối tác đi chung thuận tiện nhất, và sẽ
        thông báo lại cho bạn sau nhé!
      </Text>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate("HomeMain")}
        >
          <Text style={styles.primaryText}>Về trang chủ</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.outlineButton}
          onPress={() => navigation.navigate("TripDetail")}
        >
          <Text style={styles.outlineText}>Thay đổi lộ trình</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  image: {
    width: 160,
    height: 160,
    resizeMode: "contain",
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
    color: "#000",
  },
  description: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 20,
  },
  buttons: {
    width: "100%",
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#58C2F0",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  primaryText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: "#58C2F0",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  outlineText: {
    color: "#58C2F0",
    fontWeight: "bold",
    fontSize: 15,
  },
});
