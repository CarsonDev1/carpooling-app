import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import HeaderProfile from "../components/Header";

const linkedBanks = [
  { name: "MBBank", account: "6905112003" },
  { name: "BIDV", account: "125 158 601" },
];

const transactions = [
  {
    type: "Nhận tiền",
    content: "Nhận tiền từ chuyến đi đến 178 Nguyễn Trãi, Thanh Xuân, Hà Nội",
    time: "14:25 · 29/02/2025",
    amount: "+38.000đ",
  },
  {
    type: "Thanh toán",
    content: "Thanh toán cho chuyến đi đến 37 Nguyễn Thị Minh Khai, Hai Bà Trưng, Hà Nội",
    time: "14:25 · 29/02/2025",
    amount: "-63.000đ",
  },
  {
    type: "Nhận tiền",
    content: "Nhận tiền từ chuyến đi đến 178 Nguyễn Trãi, Thanh Xuân, Hà Nội",
    time: "14:25 · 29/02/2025",
    amount: "+38.000đ",
  },
];

const PaymentScreen = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      <HeaderProfile />

      {/* Breadcrumb */}
      <View style={styles.breadcrumb}>
        <Text style={styles.breadcrumbText} onPress={() => navigation.navigate("ProfileMain")}>
          Tài khoản
        </Text>
        <Text style={styles.breadcrumbDivider}>›</Text>
        <Text style={styles.breadcrumbCurrent}>Thanh toán</Text>
      </View>

      {/* Wallet Balance */}
      <TouchableOpacity style={styles.walletBox}>
        <Text style={styles.walletLabel}>Số dư ví:</Text>
        <Text style={styles.walletAmount}>853.000đ</Text>
      </TouchableOpacity>

      {/* Linked Banks */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thẻ liên kết</Text>
        {linkedBanks.map((bank, index) => (
          <View key={index} style={styles.bankItem}>
            <Text style={styles.bankName}>{bank.name}</Text>
            <Text style={styles.bankAccount}>{bank.account}</Text>
          </View>
        ))}
      </View>

      {/* Transaction History */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lịch sử</Text>
        {transactions.map((tx, index) => (
          <View key={index} style={styles.transactionItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.transactionText}>{tx.content}</Text>
              <Text style={styles.transactionTime}>{tx.time}</Text>
            </View>
            <Text
              style={[
                styles.transactionAmount,
                tx.amount.includes("-") ? styles.negative : styles.positive,
              ]}
            >
              {tx.amount}
            </Text>
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
  breadcrumb: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    paddingHorizontal: 16,
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
  walletBox: {
    backgroundColor: "#F2F9FF",
    borderRadius: 10,
    padding: 16,
    margin: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D6EFFF",
  },
  walletLabel: {
    fontSize: 14,
    color: "#333",
  },
  walletAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
  section: {
    marginTop: 10,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 12,
  },
  bankItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F9F9F9",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  bankName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  bankAccount: {
    fontSize: 14,
    color: "#666",
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  transactionText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  transactionTime: {
    fontSize: 12,
    color: "#888",
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: "600",
  },
  positive: {
    color: "#3AB54A",
  },
  negative: {
    color: "#F44336",
  },
});

export default PaymentScreen;
