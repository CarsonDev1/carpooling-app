// api/authApi.js
import api from "./config";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Đăng ký người dùng mới - Updated for OTP flow
export const registerUser = async (userData) => {
  try {
    const response = await api.post("/auth/register", userData);

    // Register endpoint now returns OTP info instead of token
    if (response.data.status === "success") {
      // Don't save token here since it's OTP flow
      // Token will be saved after OTP verification
      console.log("Registration successful, OTP sent");
    }

    return response.data;
  } catch (error) {
    console.error("Register error:", error);
    throw error.response?.data || { message: "Đăng ký thất bại" };
  }
};

// Verify OTP - New function for OTP verification
export const verifyOtp = async (otpData) => {
  try {
    const response = await api.post("/auth/verify-otp", otpData);

    if (response.data.status === "success") {
      // Chỉ lưu token nếu có trong response (sau khi hoàn tất đăng ký)
      if (response.data.data.token) {
        await AsyncStorage.setItem("token", response.data.data.token);
        await AsyncStorage.setItem(
          "user",
          JSON.stringify(response.data.data.user)
        );
      }
    }

    return response.data;
  } catch (error) {
    console.error("OTP verification error:", error);
    throw error.response?.data || { message: "Xác thực OTP thất bại" };
  }
};

// Resend OTP - New function to resend OTP
export const resendOtp = async (userId) => {
  try {
    const response = await api.post("/auth/resend-otp", { userId });
    return response.data;
  } catch (error) {
    console.error("Resend OTP error:", error);
    throw error.response?.data || { message: "Gửi lại OTP thất bại" };
  }
};

// Đăng nhập
export const loginUser = async (credentials) => {
  try {
    const response = await api.post("/auth/login", credentials);

    if (response.data.status === "success") {
      // Lưu token và thông tin user vào AsyncStorage
      await AsyncStorage.setItem("token", response.data.data.token);
      await AsyncStorage.setItem(
        "user",
        JSON.stringify(response.data.data.user)
      );

      // Cập nhật token cho các request tiếp theo
      api.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.data.data.token}`;
    }

    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error.response?.data || { message: "Đăng nhập thất bại" };
  }
};

// Đăng xuất
export const logoutUser = async () => {
  try {
    // Gọi API logout nếu cần
    await api.post("/auth/logout");
  } catch (error) {
    console.error("Logout API error:", error);
  } finally {
    // Luôn xóa dữ liệu local
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
  }
};

// Lấy thông tin user hiện tại
export const getCurrentUser = async () => {
  try {
    // Lấy token từ AsyncStorage
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      throw new Error("Không tìm thấy token");
    }

    // Cập nhật token cho request
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    const response = await api.get("/auth/me");
    return response.data;
  } catch (error) {
    console.error("Get current user error:", error);
    throw (
      error.response?.data || { message: "Không thể lấy thông tin người dùng" }
    );
  }
};

// Cập nhật profile
export const updateProfile = async (profileData) => {
  try {
    const response = await api.put("/auth/profile", profileData);

    if (response.data.status === "success") {
      // Cập nhật thông tin user trong AsyncStorage
      await AsyncStorage.setItem(
        "user",
        JSON.stringify(response.data.data.user)
      );
    }

    return response.data;
  } catch (error) {
    console.error("Update profile error:", error);
    throw error.response?.data || { message: "Cập nhật profile thất bại" };
  }
};

// Đổi mật khẩu
export const changePassword = async (passwordData) => {
  try {
    const response = await api.put("/auth/change-password", passwordData);
    return response.data;
  } catch (error) {
    console.error("Change password error:", error);
    throw error.response?.data || { message: "Đổi mật khẩu thất bại" };
  }
};

// Quên mật khẩu
export const forgotPassword = async (phone) => {
  try {
    const response = await api.post("/auth/forgot-password", { phone });
    return response.data;
  } catch (error) {
    console.error("Forgot password error:", error);
    throw (
      error.response?.data || { message: "Gửi email đặt lại mật khẩu thất bại" }
    );
  }
};

// Upload avatar
export const uploadAvatar = async (imageUri) => {
  try {
    const formData = new FormData();
    formData.append("avatar", {
      uri: imageUri,
      type: "image/jpeg",
      name: "avatar.jpg",
    });

    const response = await api.post("/auth/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.data.status === "success") {
      // Cập nhật thông tin user trong AsyncStorage
      await AsyncStorage.setItem(
        "user",
        JSON.stringify(response.data.data.user)
      );
    }

    return response.data;
  } catch (error) {
    console.error("Upload avatar error:", error);
    throw error.response?.data || { message: "Upload avatar thất bại" };
  }
};

// Xóa avatar
export const deleteAvatar = async () => {
  try {
    const response = await api.delete("/auth/avatar");

    if (response.data.status === "success") {
      // Cập nhật thông tin user trong AsyncStorage
      await AsyncStorage.setItem(
        "user",
        JSON.stringify(response.data.data.user)
      );
    }

    return response.data;
  } catch (error) {
    console.error("Delete avatar error:", error);
    throw error.response?.data || { message: "Xóa avatar thất bại" };
  }
};

// Kiểm tra trạng thái đăng nhập
export const checkAuthStatus = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    const userString = await AsyncStorage.getItem("user");

    if (token && userString) {
      const user = JSON.parse(userString);
      return { isAuthenticated: true, user, token };
    }

    return { isAuthenticated: false, user: null, token: null };
  } catch (error) {
    console.error("Check auth status error:", error);
    return { isAuthenticated: false, user: null, token: null };
  }
};
// Set Password - Đặt mật khẩu và hoàn tất đăng ký
export const setPassword = async (passwordData) => {
  try {
    const response = await api.post("/auth/set-password", passwordData);

    if (response.data.status === "success") {
      // Lưu token và thông tin user sau khi hoàn tất đăng ký
      await AsyncStorage.setItem("token", response.data.data.token);
      await AsyncStorage.setItem(
        "user",
        JSON.stringify(response.data.data.user)
      );
    }

    return response.data;
  } catch (error) {
    console.error("Set password error:", error);
    throw error.response?.data || { message: "Đặt mật khẩu thất bại" };
  }
};

// Reset password with OTP
export const resetPassword = async (resetData) => {
  try {
    const response = await api.post("/auth/reset-password", resetData);
    return response.data;
  } catch (error) {
    console.error("Reset password error:", error);
    throw error.response?.data || { message: "Đặt lại mật khẩu thất bại" };
  }
};
