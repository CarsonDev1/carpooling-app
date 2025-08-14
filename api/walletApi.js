import api from "./config";

// Get current wallet balance
export const getWalletBalance = async () => {
  try {
    const response = await api.get("/wallet/balance");
    return response.data;
  } catch (error) {
    console.error("Get wallet balance error:", error);
    throw error.response?.data || { message: "Lấy số dư ví thất bại" };
  }
};

// Check if balance is sufficient for amount
export const checkWalletBalance = async (amount) => {
  try {
    const response = await api.post("/wallet/check-balance", { amount });
    return response.data;
  } catch (error) {
    console.error("Check wallet balance error:", error);
    throw error.response?.data || { message: "Kiểm tra số dư ví thất bại" };
  }
};

// Get transaction history
export const getTransactionHistory = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();

    // Add filter parameters
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        queryParams.append(key, filters[key]);
      }
    });

    const response = await api.get(`/wallet/transactions?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Get transaction history error:", error);
    throw error.response?.data || { message: "Lấy lịch sử giao dịch thất bại" };
  }
};

// Get wallet statistics
export const getWalletStatistics = async (period = 'month') => {
  try {
    const response = await api.get(`/wallet/statistics?period=${period}`);
    return response.data;
  } catch (error) {
    console.error("Get wallet statistics error:", error);
    throw error.response?.data || { message: "Lấy thống kê ví thất bại" };
  }
};

// Recharge wallet
export const rechargeWallet = async (amount, returnUrl, cancelUrl) => {
  try {
    const response = await api.post("/payments/recharge", {
      amount,
      returnUrl,
      cancelUrl
    });
    return response.data;
  } catch (error) {
    console.error("Recharge wallet error:", error);
    throw error.response?.data || { message: "Nạp tiền vào ví thất bại" };
  }
};

// Get payment history
export const getPaymentHistory = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();

    // Add filter parameters
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

// Get payment details
export const getPaymentDetails = async (paymentId) => {
  try {
    const response = await api.get(`/payments/${paymentId}`);
    return response.data;
  } catch (error) {
    console.error("Get payment details error:", error);
    throw error.response?.data || { message: "Lấy chi tiết thanh toán thất bại" };
  }
};

// Cancel payment
export const cancelPayment = async (paymentId) => {
  try {
    const response = await api.post(`/payments/${paymentId}/cancel`);
    return response.data;
  } catch (error) {
    console.error("Cancel payment error:", error);
    throw error.response?.data || { message: "Hủy thanh toán thất bại" };
  }
};

// Mock recharge wallet (for testing)
export const mockRechargeWallet = async (amount) => {
  try {
    const response = await api.post("/payments/mock-recharge", {
      amount
    });
    return response.data;
  } catch (error) {
    console.error("Mock recharge wallet error:", error);
    throw error.response?.data || { message: "Mock nạp tiền thất bại" };
  }
};
