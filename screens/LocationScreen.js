import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Pressable,
  Animated,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";

const recentTrips = [
  [
    "24 Chùa Láng, P. Láng Thượng, Đống Đa, Hà Nội",
    "46 Nguyễn Trường Tộ, Trúc Bạch, Ba Đình, Hà Nội",
  ],
  [
    "53 Hào Nam, Ô Chợ Dừa, Đống Đa, Hà Nội",
    "168 Lương Định Của, Kim Liên, Đống Đa, Hà Nội",
  ],
  [
    "168 Lương Định Của, Kim Liên, Đống Đa, Hà Nội",
    "53 Hào Nam, Ô Chợ Dừa, Đống Đa, Hà Nội",
  ],
  [
    "24 Chùa Láng, P. Láng Thượng, Đống Đa, Hà Nội",
    "46 Nguyễn Trường Tộ, Trúc Bạch, Ba Đình, Hà Nội",
  ],
  [
    "53 Hào Nam, Ô Chợ Dừa, Đống Đa, Hà Nội",
    "168 Lương Định Của, Kim Liên, Đống Đa, Hà Nội",
  ],
  [
    "168 Lương Định Của, Kim Liên, Đống Đa, Hà Nội",
    "53 Hào Nam, Ô Chợ Dừa, Đống Đa, Hà Nội",
  ],
];
export default function LocationScreen() {
  const [showPopup, setShowPopup] = useState(false);
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [timePeriod, setTimePeriod] = useState("AM");
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dailyChecked, setDailyChecked] = useState(false);
  const [swapped, setSwapped] = useState(false);
  const animValue = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();
  const input1Translate = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 56],
  });
  const input2Translate = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -56],
  });

  useEffect(() => {
    setTimeout(() => {
      setShowPopup(true);
    }, 300);
  }, []);

  const toggleTimePeriod = () => {
    setTimePeriod((prev) => (prev === "AM" ? "PM" : "AM"));
  };

  const onTimeChange = (event, selected) => {
    setShowTimePicker(false);
    if (selected) setSelectedTime(selected);
  };

  const onDateChange = (event, selected) => {
    setShowDatePicker(false);
    if (selected) setSelectedDate(selected);
  };

  const handleSwapLocations = () => {
    setSwapped((prev) => !prev);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : null}
      style={styles.container}
    >
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="black" />
          </TouchableOpacity>

          <View style={styles.inputGroupFixed}>
            {/* Input trên */}
            {swapped ? (
              <View style={styles.inputRowWithBorder}>
                <Ionicons
                  name="location-outline"
                  size={18}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.inputText}
                  placeholder="Nhập điểm đến"
                  value={toLocation}
                  onChangeText={setToLocation}
                />
              </View>
            ) : (
              <View style={styles.inputRowWithBorder}>
                <Ionicons name="person" size={18} style={styles.inputIcon} />
                <TextInput
                  style={styles.inputText}
                  placeholder="Nhập điểm khởi hành"
                  value={fromLocation}
                  onChangeText={setFromLocation}
                />
              </View>
            )}

            {/* Nút swap */}
            <TouchableOpacity
              onPress={handleSwapLocations}
              style={styles.swapInlineButton}
            >
              <MaterialCommunityIcons
                name="swap-vertical"
                size={20}
                color="black"
              />
            </TouchableOpacity>

            {/* Input dưới */}
            {swapped ? (
              <View style={styles.inputRow}>
                <Ionicons name="person" size={18} style={styles.inputIcon} />
                <TextInput
                  style={styles.inputText}
                  placeholder="Nhập điểm khởi hành"
                  value={fromLocation}
                  onChangeText={setFromLocation}
                />
              </View>
            ) : (
              <View style={styles.inputRow}>
                <Ionicons
                  name="location-outline"
                  size={18}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.inputText}
                  placeholder="Nhập điểm đến"
                  value={toLocation}
                  onChangeText={setToLocation}
                />
              </View>
            )}
          </View>

          {/* Quick Tags horizontal scroll */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 12, marginBottom: 12 }}
            contentContainerStyle={{ gap: 8 }}
          >
            {[
              "Nhà",
              "Công ty",
              "Trường học",
              "Thêm địa chỉ",
              "Thêm địa chỉ 1",
              "Thêm địa chỉ 2",
              "Thêm địa chỉ 3",
            ].map((label) => (
              <TouchableOpacity
                key={label}
                style={styles.tag}
                onPress={() => {
                  navigation.navigate("SimilarTrips");
                }}
              >
                <Text>{label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* <View style={styles.timeRowAligned}>
            <Text style={styles.timeLabel}>Giờ khởi hành</Text>
            <View style={styles.timeSection}>
              <TouchableOpacity
                style={styles.timeBox}
                onPress={toggleTimePeriod}
              >
                <Text>{timePeriod}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.timeBox}
                onPress={() => setShowTimePicker(true)}
              >
                <Text>
                  {selectedTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.timeBox}
                onPress={() => setShowDatePicker(true)}
              >
                <Text>{selectedDate.toLocaleDateString("vi-VN")}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.dailyRow}>
            <TouchableOpacity
              onPress={() => setDailyChecked(!dailyChecked)}
              style={styles.checkboxWhite}
            >
              <Ionicons
                name={dailyChecked ? "checkbox" : "square-outline"}
                size={18}
                color="black"
              />
            </TouchableOpacity>
            <Text style={styles.dailyText}>Đặt làm lộ trình hàng ngày</Text>
          </View> */}
        </View>
        <View style={styles.recentSection}>
          <Text style={styles.recentTitle}>Gần đây</Text>
          {recentTrips.map((trip, index) => (
            <View key={index} style={styles.recentCard}>
              <Image
                source={require("../assets/ic-doc.png")}
                style={styles.dotIcon}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.recentText}>{trip[0]}</Text>
                <Text style={styles.recentText}>{trip[1]}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      {showTimePicker && (
        <DateTimePicker
          value={selectedTime}
          mode="time"
          display="default"
          onChange={onTimeChange}
        />
      )}

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      <Modal transparent visible={showPopup} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.popup}>
            <Ionicons name="location-outline" size={40} color="#2aa4ff" />
            <Text style={styles.popupTitle}>Bật vị trí của bạn</Text>
            <Text style={styles.popupDesc}>
              Chọn vị trí của bạn để bắt đầu tìm kiếm yêu cầu xung quanh bạn
            </Text>
            <TouchableOpacity
              style={styles.enableBtn}
              onPress={() => setShowPopup(false)}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>
                Bật định vị
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowPopup(false)}
              style={{ marginTop: 10 }}
            >
              <Text style={{ color: "#777" }}>Bỏ qua</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f4f8" },
  header: { paddingTop: 60, paddingHorizontal: 16, backgroundColor: "#6cd2ff" },
  backButton: { position: "absolute", top: 20, left: 16, zIndex: 10 },
  inputGroupFixed: {
    position: "relative",
    backgroundColor: "white",
    borderRadius: 16,
    marginTop: 40,
    paddingBottom: 4,
    paddingTop: 4,
    paddingHorizontal: 12,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  inputRowWithBorder: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  swapInlineButton: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: [{ translateY: -10 }],
    zIndex: 2,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 4,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  inputText: { flex: 1, marginLeft: 8 },
  inputIcon: { marginLeft: 4 },
  quickTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
    gap: 8,
  },
  tag: {
    backgroundColor: "white",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  timeLabel: { fontWeight: "bold" },
  timeRowAligned: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  timeSection: {
    flexDirection: "row",
    gap: 10,
  },
  timeBox: {
    backgroundColor: "white",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  dailyRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 12,
  },
  checkboxWhite: {
    borderRadius: 4,
    marginBottom: 10,
  },
  dailyText: { marginLeft: 6, marginBottom: 10 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "#00000055",
    justifyContent: "center",
    alignItems: "center",
  },
  popup: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    width: "80%",
    alignItems: "center",
  },
  popupTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginTop: 10,
  },
  popupDesc: {
    marginTop: 8,
    textAlign: "center",
    color: "#444",
  },
  enableBtn: {
    backgroundColor: "#2aa4ff",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 20,
  },
  recentSection: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  recentTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 12,
  },
  recentCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dotIcon: {
    width: 20,
    height: 40,
    resizeMode: "contain",
    marginRight: 10,
    alignSelf: "center",
  },
  recentText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
});
