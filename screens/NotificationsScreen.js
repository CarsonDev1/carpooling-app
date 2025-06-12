import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";

const messages = [
  {
    name: "Trần Tiến Đạt",
    message: "Bạn ơi mình đến rồi nhé",
    time: "Th3 14:25",
    unread: true,
    avatar: "https://i.pravatar.cc/50?img=1",
  },
  {
    name: "Phạm Hoàng Minh Khôi",
    message: "Cảm ơn bạn nhiều nhé",
    time: "Th3 14:25",
    unread: false,
    avatar: "https://i.pravatar.cc/50?img=2",
  },
  {
    name: "Hứa Quang Hán",
    message: "Bạn: Okeee",
    time: "Th3 14:25",
    unread: false,
    avatar: "https://i.pravatar.cc/50?img=3",
  },
  {
    name: "Bạch Kính Đình",
    message: "ok nha",
    time: "Th3 14:25",
    unread: false,
    avatar: "https://i.pravatar.cc/50?img=4",
  },
];

const notifications = [
  "Đã tìm thấy đối tác cho chuyến đi từ 129 Phạm Ngọc Thạch vào 14:50 21/2/2025",
  "Đã tìm thấy đối tác cho chuyến đi từ 100 Nguyễn Kiệm vào 5:45 24/1/2025",
  "Đã tìm thấy đối tác cho chuyến đi từ 23 Lương Định Của vào 6:20 24/1/2025",
  "Đã tìm thấy đối tác cho chuyến đi từ 55 Trần Hưng Đạo vào 6:50 24/1/2025",
  "Đã tìm thấy đối tác cho chuyến đi từ 32 Trương Định 7:20 24/1/2025",
  "Đã tìm thấy đối tác cho chuyến đi từ 23 Hoàng Hoa Thám vào 7:40 24/1/2025",
  "Đã tìm thấy đối tác cho chuyến đi từ Số 8 Nguyễn Xiển vào 8:12 24/1/2025",
  "Đã tìm thấy đối tác cho chuyến đi từ 98 Lê Quang Định vào 9:20 24/1/2025",
  "Đã tìm thấy đối tác cho chuyến đi từ 99 Phạm Ngũ Lão vào 17:20 24/1/2025",
  "Đã tìm thấy đối tác cho chuyến đi từ Số 1 Phạm Văn Đồng vào 21:20 24/1/2025",
  "Đã tìm thấy đối tác cho chuyến đi từ 100/5 Nguyễn Kiệm vào 22:20 24/1/2025",
];

const NotificationsScreen = () => {
  const [tab, setTab] = useState("messages"); // 'messages' or 'notifications'

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thông báo</Text>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === "messages" && styles.activeTab]}
          onPress={() => setTab("messages")}
        >
          <Text
            style={[styles.tabText, tab === "messages" && styles.activeTabText]}
          >
            Tin nhắn
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === "notifications" && styles.activeTab]}
          onPress={() => setTab("notifications")}
        >
          <Text
            style={[
              styles.tabText,
              tab === "notifications" && styles.activeTabText,
            ]}
          >
            Thông báo
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.contentBox}>
        {tab === "messages" &&
          messages.map((item, index) => (
            <View key={index} style={styles.messageItem}>
              <Image source={{ uri: item.avatar }} style={styles.avatar} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.message}>{item.message}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.time}>{item.time}</Text>
                {item.unread && <View style={styles.dot} />}
              </View>
            </View>
          ))}

        {tab === "notifications" &&
          notifications.map((text, index) => (
            <View key={index} style={styles.notificationItem}>
              <Text style={styles.notificationText}>{text}</Text>
              <View style={styles.dotOverlay} />
            </View>
          ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginVertical: 16,
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: "#fff",
    elevation: 3,
  },
  tabText: {
    fontSize: 14,
    color: "#777",
  },
  activeTabText: {
    color: "#000",
    fontWeight: "600",
  },
  contentBox: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    borderRadius: 16,
    padding: 12,
  },
  messageItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 0.8,
    borderColor: "#ddd",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  name: {
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 4,
  },
  message: {
    color: "#444",
    fontSize: 13,
  },
  time: {
    fontSize: 12,
    color: "#888",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "red",
    marginTop: 4,
    alignSelf: "flex-end",
  },
  notificationItem: {
    marginBottom: 18,
    position: "relative",
    paddingRight: 16,
  },
  notificationText: {
    fontSize: 13,
    color: "#333",
    lineHeight: 18,
  },
  dotOverlay: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "red",
    position: "absolute",
    top: "50%",
    right: 0,
    marginTop: -4,
  },
});

export default NotificationsScreen;
