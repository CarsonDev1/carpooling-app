import React, { useState, useEffect } from "react";1
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getNotifications, markNotificationAsRead, getChats } from "../api/notificationsApi";
import { Ionicons } from "@expo/vector-icons";

const NotificationsScreen = () => {
  const navigation = useNavigation();
  const [tab, setTab] = useState("notifications"); // 'messages' or 'notifications'
  const [notifications, setNotifications] = useState([]);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, [tab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (tab === "notifications") {
        await loadNotifications();
      } else {
        await loadChats();
      }
    } catch (error) {
      console.error("Load data error:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await getNotifications({ limit: 30 });
      if (response.success) {
        setNotifications(response.data || []);
      }
    } catch (error) {
      console.error("Load notifications error:", error);
      // Fallback to empty array on error
      setNotifications([]);
    }
  };

  const loadChats = async () => {
    try {
      const response = await getChats({ limit: 20 });
      if (response.success) {
        setChats(response.data || []);
      }
    } catch (error) {
      console.error("Load chats error:", error);
      // Fallback to empty array on error
      setChats([]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification) => {
    try {
      if (!notification.isRead) {
        await markNotificationAsRead(notification._id);
        // Update local state
        setNotifications(prev => 
          prev.map(n => 
            n._id === notification._id ? { ...n, isRead: true } : n
          )
        );
      }

      // Navigate based on notification type
      if (notification.relatedTrip) {
        navigation.navigate("TripDetail", { tripId: notification.relatedTrip });
      }
    } catch (error) {
      console.error("Handle notification error:", error);
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (days === 1) {
      return "Hôm qua";
    } else if (days < 7) {
      return `${days} ngày trước`;
    } else {
      return date.toLocaleDateString('vi-VN');
    }
  };

  const renderEmptyState = (type) => (
    <View style={styles.emptyContainer}>
      <Ionicons 
        name={type === "notifications" ? "notifications-outline" : "chatbubble-outline"} 
        size={48} 
        color="#ccc" 
      />
      <Text style={styles.emptyText}>
        {type === "notifications" ? "Chưa có thông báo nào" : "Chưa có tin nhắn nào"}
      </Text>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#4285F4" />
      <Text style={styles.loadingText}>Đang tải...</Text>
    </View>
  );

  return (
    <View style={styles.container}>
   

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
      <ScrollView 
        style={styles.contentBox} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? renderLoadingState() : (
          <>
            {tab === "messages" && (
              <>
                {chats.length === 0 ? renderEmptyState("messages") : (
                  chats.map((chat, index) => (
                    <TouchableOpacity 
                      key={chat._id || index} 
                      style={styles.messageItem}
                      onPress={() => navigation.navigate("Chat", { chatId: chat._id })}
                    >
                      <View style={styles.avatar}>
                        {chat.otherUser?.avatar ? (
                          <Image source={{ uri: chat.otherUser.avatar }} style={styles.avatarImage} />
                        ) : (
                          <Ionicons name="person" size={20} color="#666" />
                        )}
                      </View>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.name}>
                          {chat.otherUser?.fullName || "Người dùng"}
                        </Text>
                        <Text style={styles.message} numberOfLines={1}>
                          {chat.lastMessage?.message || "Chưa có tin nhắn"}
                        </Text>
                      </View>
                      <View style={{ alignItems: "flex-end" }}>
                        <Text style={styles.time}>
                          {chat.lastMessage?.createdAt ? formatDateTime(chat.lastMessage.createdAt) : ""}
                        </Text>
                        {chat.unreadCount > 0 && (
                          <View style={styles.unreadBadge}>
                            <Text style={styles.unreadCount}>{chat.unreadCount}</Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </>
            )}

            {tab === "notifications" && (
              <>
                {notifications.length === 0 ? renderEmptyState("notifications") : (
                  notifications.map((notification, index) => (
                    <TouchableOpacity
                      key={notification._id || index}
                      style={[
                        styles.notificationItem,
                        !notification.isRead && styles.unreadNotification,
                        index < notifications.length - 1 && styles.notificationItemBorder,
                      ]}
                      onPress={() => handleNotificationPress(notification)}
                    >
                      <View style={styles.notificationContent}>
                        <Text style={[
                          styles.notificationText,
                          !notification.isRead && styles.unreadText
                        ]}>
                          {notification.message || notification.title}
                        </Text>
                        <Text style={styles.notificationTime}>
                          {formatDateTime(notification.createdAt)}
                        </Text>
                      </View>
                      {!notification.isRead && <View style={styles.dotOverlay} />}
                    </TouchableOpacity>
                  ))
                )}
              </>
            )}
          </>
        )}
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
    marginTop: 20,
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  avatarImage: {
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
    position: 'relative',
    paddingVertical: 12,
    paddingRight: 16,
  },
  notificationItemBorder: {
    borderBottomWidth: 0.8,
    borderColor: '#ddd',
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
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  unreadBadge: {
    backgroundColor: "red",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  unreadCount: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  unreadNotification: {
    backgroundColor: "#f0f8ff",
  },
  unreadText: {
    fontWeight: "600",
  },
  notificationContent: {
    flex: 1,
    paddingRight: 16,
  },
  notificationTime: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },
});

export default NotificationsScreen;
