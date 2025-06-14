// api/config.js
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Auto-detect API URL based on platform
const getApiBaseUrl = () => {
  if (__DEV__) {
    if (Platform.OS === "android") {
      // Android Emulator sử dụng 10.0.2.2 để truy cập localhost của host machine
      return `http://192.168.1.7:5000/api`;
    } else {
      // iOS Simulator hoặc Physical Device - sử dụng IP thật của máy bạn
      return "http://192.168.1.91:5000/api";
    }
  } else {
    // Production
    return "https://your-production-api.com/api";
  }
};

const API_BASE_URL = getApiBaseUrl();

console.log("🌐 API Base URL:", API_BASE_URL);

// Tạo axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor để thêm token vào headers
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error getting token:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor để xử lý lỗi chung
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    console.error("API Error:", error.response?.data || error.message);

    if (error.response?.status === 401) {
      // Token expired hoặc invalid, xóa token và chuyển về login
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
    }
    return Promise.reject(error);
  }
);

export default api;
