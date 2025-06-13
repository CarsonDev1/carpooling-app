import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from "react-native";
import HeaderProfile from "../components/Header";

const DeleteAccountScreen = ({ navigation }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [modalVisible, setModalVisible] = useState(false);

  const otpRefs = useRef([...Array(6)].map(() => React.createRef()));

  const handleChangeOtp = (value, index) => {
    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);

    if (value && index < otp.length - 1) {
      otpRefs.current[index + 1].current.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1].current.focus();
    }
  };

  const handleSubmit = () => {
    if (otp.join("").length === 6) {
      setModalVisible(true);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <HeaderProfile />

      {/* Breadcrumb */}
      <View style={styles.breadcrumb}>
        <Text style={styles.breadcrumbText} onPress={() => navigation.navigate("ProfileMain")}>
          Tài khoản
        </Text>
        <Text style={styles.breadcrumbDivider}>›</Text>
        <Text style={styles.breadcrumbCurrent}>Xóa tài khoản</Text>
      </View>

      {/* Instruction */}
      <Text style={styles.instruction}>
        Vui lòng nhập mã OTP được gửi đến điện thoại của bạn:
      </Text>

      {/* OTP Inputs */}
      <View style={styles.otpWrapper}>
        {otp.map((digit, idx) => (
          <TextInput
            key={idx}
            ref={otpRefs.current[idx]}
            style={styles.otpInput}
            maxLength={1}
            keyboardType="numeric"
            value={digit}
            onChangeText={(val) => handleChangeOtp(val, idx)}
            onKeyPress={(e) => handleKeyPress(e, idx)}
          />
        ))}
      </View>

      <Text style={styles.resendText}>
        Không nhận được mã? <Text style={styles.resendLink}>Gửi lại</Text>
      </Text>

      {/* Buttons */}
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[styles.button, styles.cancelBtn]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelText}>Quay lại</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.submitBtn]}
          onPress={handleSubmit}
        >
          <Text style={styles.submitText}>Tiếp theo</Text>
        </TouchableOpacity>
      </View>

      {/* Modal */}
      <Modal transparent visible={modalVisible} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <Text style={styles.modalText}>
              Tài khoản của bạn sẽ được lên lịch xóa sau 3 ngày. Trong vòng 3 ngày, bạn có thể đăng nhập lại để hủy bỏ yêu cầu xóa tài khoản.
            </Text>
            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => {
                setModalVisible(false);
                navigation.navigate("ProfileMain");
              }}
            >
              <Text style={styles.modalBtnText}>Tôi đã hiểu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  instruction: {
    fontSize: 16,
    marginTop: 24,
    marginBottom: 12,
    paddingHorizontal: 16,
    color: "#333",
  },
  otpWrapper: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginHorizontal: 16,
    marginBottom: 10,
  },
  otpInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    width: 45,
    height: 50,
    borderRadius: 8,
    textAlign: "center",
    fontSize: 20,
  },
  resendText: {
    textAlign: "center",
    fontSize: 13,
    color: "#666",
    marginBottom: 20,
  },
  resendLink: {
    color: "#007AFF",
    fontWeight: "500",
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingHorizontal: 16,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: "center",
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: "#57C2FE",
  },
  submitBtn: {
    backgroundColor: "#57C2FE",
  },
  cancelText: {
    color: "#57C2FE",
    fontWeight: "500",
  },
  submitText: {
    color: "#fff",
    fontWeight: "600",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "#00000088",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    elevation: 5,
  },
  modalText: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 20,
  },
  modalBtn: {
    backgroundColor: "#57C2FE",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default DeleteAccountScreen;
