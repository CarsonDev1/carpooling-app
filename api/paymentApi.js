import api from "./config";

// Create payment for trip
export const createPayment = async (paymentData) => {
  try {
    const response = await api.post("/payments/create", paymentData);
    return response.data;
  } catch (error) {
    console.error("Create payment error:", error);
    throw error.response?.data || { message: "Tạo thanh toán thất bại" };
  }
};

// Get payment details
export const getPayment = async (paymentId) => {
  try {
    const response = await api.get(`/payments/${paymentId}`);
    return response.data;
  } catch (error) {
    console.error("Get payment error:", error);
    throw error.response?.data || { message: "Lấy thông tin thanh toán thất bại" };
  }
};

// Get payment history
export const getPaymentHistory = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        queryParams.append(key, filters[key]);
      }
    });

    const response = await api.get(`/payments?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Get payment history error:", error);
    throw error.response?.data || { message: "Lấy lịch sử thanh toán thất bại" };
  }
};

// Cancel pending payment
export const cancelPayment = async (paymentId) => {
  try {
    const response = await api.patch(`/payments/${paymentId}/cancel`);
    return response.data;
  } catch (error) {
    console.error("Cancel payment error:", error);
    throw error.response?.data || { message: "Hủy thanh toán thất bại" };
  }
}; 