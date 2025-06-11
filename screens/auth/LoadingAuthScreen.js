import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
const onboardingData = [
  {
    title: "Di chuyển an toàn",
    description:
      "Với tính năng AI theo dõi lộ trình, cập nhật vị trí, nút SOS khẩn cấp - 2gether sẽ đồng hành và bảo vệ bạn trên mọi hành trình.",
  },
  {
    title: "Tối ưu chi phí",
    description:
      "Đi chung tuyến, chia sẻ chi phí, 2gether giúp bạn di chuyển linh hoạt và giá hợp lý.",
  },
  {
    title: "Tính năng đặt lịch",
    description:
      "Đặt trước chuyến đi, đảm bảo thời gian của bạn! 2gether luôn sẵn sàng khi bạn cần.",
  },
];

export default function LoadingAuthScreen({ navigation }) {
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < onboardingData.length) {
      setStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    setStep(onboardingData.length);
  };

  if (step >= onboardingData.length) {
    return (
      <View style={styles["2g-container"]}>
        <View style={styles["2g-contentContainer"]}>
          <Image
            source={require("../../assets/chibi.png")}
            style={styles["2g-imageChibi"]}
          />
          <Text style={styles["2g-welcomeTitle"]}>Chào mừng đến với</Text>
          <Text style={styles["2g-welcomeTitle"]}>2gether</Text>
          <Text style={styles["2g-welcomeDescription"]}>
            Đi ké xe đi cho đỡ tốn tiền nè bạn ơi!
          </Text>
        </View>

        <View style={styles["2g-buttonContainer"]}>
          <TouchableOpacity
            style={styles["2g-loginButton"]}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles["2g-loginText"]}>Đăng nhập</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles["2g-registerButton"]}
            onPress={() => navigation.navigate("Register")}
          >
            <Text style={styles["2g-registerText"]}>Đăng ký</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header: chỉ còn nút Bỏ qua */}
      <View style={styles.header}>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
          <Text style={styles.skipText}>Bỏ qua</Text>
        </TouchableOpacity>
      </View>
      {/* Content */}
      <View style={styles.content}>
        {/* Logo 2GETHER nằm trên title */}
        <View style={styles.logoRow}>
          <Image
            source={require("../../assets/logo.png")}
            style={styles.imageLogo}
          />
        </View>
        <Text style={styles.title}>{onboardingData[step].title}</Text>
        <Text style={styles.description}>
          {onboardingData[step].description}
        </Text>
      </View>
      {/* Navigation arrows */}
      <View style={styles.navigationAbsolute}>
        {step > 0 ? (
          <TouchableOpacity onPress={handlePrev}>
            <Text style={styles.navText}>←</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 44 }} />
        )}
        <View style={styles.dotsRow}>
          {onboardingData.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                step === idx ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>
        <TouchableOpacity onPress={handleNext}>
          <Text style={styles.navText}>→</Text>
        </TouchableOpacity>
      </View>
      {/* Illustration at absolute bottom */}
      <Image
        source={require("../../assets/LoadingAuth.png")}
        style={styles.illustrationAbsolute}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 0,
    paddingTop: 40,
    alignItems: "center",
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  imageLogo: {
    width: 160,
    height: 160,
    resizeMode: "contain",
  },
  logo2: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#3CB6FF",
    marginRight: 2,
  },
  logoGether: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6DD6FF",
    marginBottom: 3,
  },
  skipBtn: {
    padding: 4,
  },
  skipText: {
    color: "#888",
    fontSize: 14,
  },
  content: {
    marginTop: 0,
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 15,
    color: "#555",
    textAlign: "center",
    marginBottom: 10,
  },
  illustrationWrapper: {
    width: "100%",
    alignItems: "center",
    marginBottom: 0,
  },
  illustration: {
    width: 220,
    height: 180,
    resizeMode: "contain",
    marginBottom: 0,
  },
  illustrationAbsolute: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    height: 400,
    resizeMode: "stretch",
    zIndex: 1,
  },
  navigationAbsolute: {
    position: "absolute",
    bottom: 40,
    left: 0,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 32,
    zIndex: 10,
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 3,
  },
  dotActive: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  dotInactive: {
    backgroundColor: "#B3E0FF",
  },
  navText: {
    fontSize: 28,
    color: "#fff",
    padding: 10,
    fontWeight: "bold",
    textShadowColor: "#007AFF",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: "500",
    marginBottom: 4,
    textAlign: "center",
  },
  appName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 8,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  "2g-container": {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 24,
  },
  "2g-contentContainer": {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  "2g-buttonContainer": {
    width: "100%",
    paddingBottom: 50,
    margin: "auto",
    alignItems: "center",
  },
  "2g-imageChibi": {
    width: 160,
    height: 160,
    resizeMode: "contain",
    marginBottom: 20,
  },
  "2g-welcomeTitle": {
    fontSize: 24,
    color: "#000",
    fontWeight: "bold",
    textAlign: "center",
  },
  "2g-welcomeDescription": {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginBottom: 24,
  },
  "2g-loginButton": {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
    marginBottom: 12,
  },
  "2g-loginText": {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  "2g-registerButton": {
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  "2g-registerText": {
    color: "#007AFF",
    fontWeight: "600",
    fontSize: 16,
  },
});
