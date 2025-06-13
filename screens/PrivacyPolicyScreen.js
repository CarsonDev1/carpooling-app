import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import HeaderProfile from "../components/Header";

const PrivacyPolicyScreen = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
        <HeaderProfile />
      {/* Breadcrumb */}
      <View style={styles.breadcrumb}>
        <Text style={styles.breadcrumbText} onPress={() => navigation.navigate("ProfileMain")}>Tài khoản</Text>
        <Text style={styles.breadcrumbDivider}>›</Text>
        <Text style={styles.breadcrumbCurrent}>Quyền riêng tư</Text>
      </View>

      {/* Policy Content */}
      <View style={styles.content}>
        <Text style={styles.paragraph}>
          Tại 2gether, một trong những ưu tiên chính của chúng tôi là quyền riêng tư của khách truy cập. Tài liệu Chính sách quyền riêng tư này chứa các loại thông tin được 2gether thu thập và ghi lại cũng như cách chúng tôi sử dụng thông tin đó.
        </Text>
        <Text style={styles.paragraph}>
          Nếu bạn có thêm câu hỏi hoặc yêu cầu thêm thông tin về Chính sách quyền riêng tư của chúng tôi, đừng ngần ngại liên hệ với chúng tôi.
        </Text>
        <Text style={styles.paragraph}>
          Chính sách quyền riêng tư này chỉ áp dụng cho các hoạt động trực tuyến của chúng tôi và có hiệu lực đối với khách truy cập trang web của chúng tôi liên quan đến thông tin mà họ chia sẻ và/hoặc thu thập trong dịch vụ di chuyển xe.
        </Text>
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
  content: {
    padding: 16,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    color: "#333",
    marginBottom: 16,
  },
});

export default PrivacyPolicyScreen;
