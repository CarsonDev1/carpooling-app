import api from './config';

// Driver Profile APIs
export const getDriverProfile = async () => {
  try {
    const response = await api.get('/drivers/profile');
    return response.data;
  } catch (error) {
    console.error('❌ Get driver profile error:', error);
    throw error.response?.data || { message: 'Không thể tải hồ sơ tài xế' };
  }
};

export const updateDriverProfile = async (profileData) => {
  try {
    const response = await api.put('/drivers/profile', profileData);
    return response.data;
  } catch (error) {
    console.error('❌ Update driver profile error:', error);
    throw error.response?.data || { message: 'Không thể cập nhật hồ sơ' };
  }
};

export const updateDriverStatus = async (statusData) => {
  try {
    const response = await api.put('/drivers/status', statusData);
    return response.data;
  } catch (error) {
    console.error('❌ Update driver status error:', error);
    throw error.response?.data || { message: 'Không thể cập nhật trạng thái' };
  }
};

// Driver Trips APIs
export const getDriverTrips = async (status = 'all', period = 'month') => {
  try {
    const params = {};
    if (status && status !== 'all') params.status = status;
    const response = await api.get('/drivers/trips', { params });
    return response.data;
  } catch (error) {
    console.error('❌ Get driver trips error:', error);
    throw error.response?.data || { message: 'Không thể tải chuyến đi' };
  }
};

export const getAvailableTrips = async (filters = {}) => {
  try {
    const response = await api.get('/trips', {
      params: { role: 'driver', ...filters }
    });
    return response.data;
  } catch (error) {
    console.error('❌ Get available trips error:', error);
    throw error.response?.data || { message: 'Không thể tải chuyến đi có sẵn' };
  }
};

export const acceptTrip = async (tripId, tripData) => {
  try {
    const response = await api.post(`/trips/${tripId}/accept`, tripData);
    return response.data;
  } catch (error) {
    console.error('❌ Accept trip error:', error);
    throw error.response?.data || { message: 'Không thể chấp nhận chuyến đi' };
  }
};

// Derive basic driver stats from profile endpoint
export const getDriverStats = async () => {
  try {
    const response = await api.get('/drivers/profile');
    if (response.data?.success) {
      const profile = response.data.data;
      const rating = Number(profile?.rating?.asDriver?.average ?? profile?.rating?.average ?? profile?.rating ?? 0) || 0;
      return {
        success: true,
        data: {
          totalTrips: profile?.statistics?.totalTrips || 0,
          completedTrips: profile?.statistics?.completedTrips || 0,
          rating,
          totalEarnings: 0,
        },
      };
    }
    return response.data;
  } catch (error) {
    console.error('❌ Get driver stats error:', error);
    throw error.response?.data || { message: 'Không thể tải thống kê tài xế' };
  }
};

export const rejectTrip = async (tripId, reason) => {
  try {
    const response = await api.post(`/drivers/trips/${tripId}/reject`, { reason });
    return response.data;
  } catch (error) {
    console.error('❌ Reject trip error:', error);
    throw error.response?.data || { message: 'Không thể từ chối chuyến đi' };
  }
};

export const startTrip = async (tripId) => {
  try {
    const response = await api.post(`/drivers/trips/${tripId}/start`);
    return response.data;
  } catch (error) {
    console.error('❌ Start trip error:', error);
    throw error.response?.data || { message: 'Không thể bắt đầu chuyến đi' };
  }
};

export const completeTrip = async (tripId, tripData) => {
  try {
    const response = await api.post(`/drivers/trips/${tripId}/complete`, tripData);
    return response.data;
  } catch (error) {
    console.error('❌ Complete trip error:', error);
    throw error.response?.data || { message: 'Không thể hoàn thành chuyến đi' };
  }
};

export const cancelTrip = async (tripId, reason) => {
  try {
    const response = await api.post(`/drivers/trips/${tripId}/cancel`, { reason });
    return response.data;
  } catch (error) {
    console.error('❌ Cancel trip error:', error);
    throw error.response?.data || { message: 'Không thể hủy chuyến đi' };
  }
};

// Driver Earnings APIs
export const getDriverEarnings = async (period = 'month') => {
  try {
    const response = await api.get('/drivers/earnings', {
      params: { period }
    });
    return response.data;
  } catch (error) {
    console.error('❌ Get driver earnings error:', error);
    throw error.response?.data || { message: 'Không thể tải thông tin thu nhập' };
  }
};

export const getDriverEarningsHistory = async (filters = {}) => {
  try {
    const response = await api.get('/drivers/earnings/history', {
      params: filters
    });
    return response.data;
  } catch (error) {
    console.error('❌ Get earnings history error:', error);
    throw error.response?.data || { message: 'Không thể tải lịch sử thu nhập' };
  }
};

export const getDriverEarningsStats = async (period = 'month') => {
  try {
    const response = await api.get('/drivers/earnings/stats', {
      params: { period }
    });
    return response.data;
  } catch (error) {
    console.error('❌ Get earnings stats error:', error);
    throw error.response?.data || { message: 'Không thể tải thống kê thu nhập' };
  }
};

// Driver Vehicle APIs
export const updateVehicleInfo = async (vehicleData) => {
  try {
    const response = await api.put('/drivers/vehicle', vehicleData);
    return response.data;
  } catch (error) {
    console.error('❌ Update vehicle info error:', error);
    throw error.response?.data || { message: 'Không thể cập nhật thông tin xe' };
  }
};

export const getVehicleInfo = async () => {
  try {
    const response = await api.get('/drivers/vehicle');
    return response.data;
  } catch (error) {
    console.error('❌ Get vehicle info error:', error);
    throw error.response?.data || { message: 'Không thể tải thông tin xe' };
  }
};

// Driver Settings APIs
export const getDriverSettings = async () => {
  try {
    const response = await api.get('/drivers/settings');
    return response.data;
  } catch (error) {
    console.error('❌ Get driver settings error:', error);
    throw error.response?.data || { message: 'Không thể tải cài đặt' };
  }
};

export const updateDriverSettings = async (settings) => {
  try {
    const response = await api.put('/drivers/settings', settings);
    return response.data;
  } catch (error) {
    console.error('❌ Update driver settings error:', error);
    throw error.response?.data || { message: 'Không thể cập nhật cài đặt' };
  }
};

// Driver Notifications APIs
export const getDriverNotifications = async (page = 1, limit = 20) => {
  try {
    const response = await api.get('/drivers/notifications', {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('❌ Get driver notifications error:', error);
    throw error.response?.data || { message: 'Không thể tải thông báo' };
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await api.put(`/drivers/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.error('❌ Mark notification as read error:', error);
    throw error.response?.data || { message: 'Không thể đánh dấu đã đọc' };
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    const response = await api.put('/drivers/notifications/read-all');
    return response.data;
  } catch (error) {
    console.error('❌ Mark all notifications as read error:', error);
    throw error.response?.data || { message: 'Không thể đánh dấu tất cả đã đọc' };
  }
};

// Driver Rating APIs
export const getDriverRatings = async (page = 1, limit = 20) => {
  try {
    const response = await api.get('/drivers/ratings', {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('❌ Get driver ratings error:', error);
    throw error.response?.data || { message: 'Không thể tải đánh giá' };
  }
};

export const ratePassenger = async (tripId, ratingData) => {
  try {
    const response = await api.post(`/drivers/trips/${tripId}/rate-passenger`, ratingData);
    return response.data;
  } catch (error) {
    console.error('❌ Rate passenger error:', error);
    throw error.response?.data || { message: 'Không thể đánh giá hành khách' };
  }
};

// Driver Location APIs
export const updateDriverLocation = async (locationData) => {
  try {
    const response = await api.put('/drivers/location', locationData);
    return response.data;
  } catch (error) {
    console.error('❌ Update driver location error:', error);
    throw error.response?.data || { message: 'Không thể cập nhật vị trí' };
  }
};

export const getDriverLocation = async () => {
  try {
    const response = await api.get('/drivers/location');
    return response.data;
  } catch (error) {
    console.error('❌ Get driver location error:', error);
    throw error.response?.data || { message: 'Không thể tải vị trí' };
  }
};

// Driver Schedule APIs
export const getDriverSchedule = async (date) => {
  try {
    const response = await api.get('/drivers/schedule', {
      params: { date }
    });
    return response.data;
  } catch (error) {
    console.error('❌ Get driver schedule error:', error);
    throw error.response?.data || { message: 'Không thể tải lịch trình' };
  }
};

export const updateDriverSchedule = async (scheduleData) => {
  try {
    const response = await api.put('/drivers/schedule', scheduleData);
    return response.data;
  } catch (error) {
    console.error('❌ Update driver schedule error:', error);
    throw error.response?.data || { message: 'Không thể cập nhật lịch trình' };
  }
};

// Driver Support APIs
export const contactSupport = async (supportData) => {
  try {
    const response = await api.post('/drivers/support', supportData);
    return response.data;
  } catch (error) {
    console.error('❌ Contact support error:', error);
    throw error.response?.data || { message: 'Không thể liên hệ hỗ trợ' };
  }
};

export const getDriverSupportTickets = async (page = 1, limit = 20) => {
  try {
    const response = await api.get('/drivers/support', {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('❌ Get support tickets error:', error);
    throw error.response?.data || { message: 'Không thể tải yêu cầu hỗ trợ' };
  }
};

// Driver Analytics APIs
export const getDriverAnalytics = async (period = 'month') => {
  try {
    const response = await api.get('/drivers/analytics', {
      params: { period }
    });
    return response.data;
  } catch (error) {
    console.error('❌ Get driver analytics error:', error);
    throw error.response?.data || { message: 'Không thể tải phân tích' };
  }
};

export const getDriverPerformance = async (period = 'month') => {
  try {
    const response = await api.get('/drivers/performance', {
      params: { period }
    });
    return response.data;
  } catch (error) {
    console.error('❌ Get driver performance error:', error);
    throw error.response?.data || { message: 'Không thể tải hiệu suất' };
  }
};

// Driver Emergency APIs
export const reportEmergency = async (emergencyData) => {
  try {
    const response = await api.post('/drivers/emergency', emergencyData);
    return response.data;
  } catch (error) {
    console.error('❌ Report emergency error:', error);
    throw error.response?.data || { message: 'Không thể báo cáo tình huống khẩn cấp' };
  }
};

export const getEmergencyContacts = async () => {
  try {
    const response = await api.get('/drivers/emergency/contacts');
    return response.data;
  } catch (error) {
    console.error('❌ Get emergency contacts error:', error);
    throw error.response?.data || { message: 'Không thể tải danh bạ khẩn cấp' };
  }
};

// Driver Chat APIs
export const getDriverChats = async (page = 1, limit = 20) => {
  try {
    const response = await api.get('/drivers/chats', {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('❌ Get driver chats error:', error);
    throw error.response?.data || { message: 'Không thể tải tin nhắn' };
  }
};

export const sendDriverMessage = async (chatId, messageData) => {
  try {
    const response = await api.post(`/drivers/chats/${chatId}/messages`, messageData);
    return response.data;
  } catch (error) {
    console.error('❌ Send driver message error:', error);
    throw error.response?.data || { message: 'Không thể gửi tin nhắn' };
  }
};

// Driver Wallet APIs
export const getDriverWallet = async () => {
  try {
    const response = await api.get('/drivers/wallet');
    return response.data;
  } catch (error) {
    console.error('❌ Get driver wallet error:', error);
    throw error.response?.data || { message: 'Không thể tải ví' };
  }
};

export const getDriverTransactions = async (page = 1, limit = 20) => {
  try {
    const response = await api.get('/drivers/wallet/transactions', {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('❌ Get driver transactions error:', error);
    throw error.response?.data || { message: 'Không thể tải giao dịch' };
  }
};

export const withdrawDriverEarnings = async (withdrawalData) => {
  try {
    const response = await api.post('/drivers/wallet/withdraw', withdrawalData);
    return response.data;
  } catch (error) {
    console.error('❌ Withdraw driver earnings error:', error);
    throw error.response?.data || { message: 'Không thể rút tiền' };
  }
};

// Driver Preferences APIs
export const getDriverPreferences = async () => {
  try {
    const response = await api.get('/drivers/preferences');
    return response.data;
  } catch (error) {
    console.error('❌ Get driver preferences error:', error);
    throw error.response?.data || { message: 'Không thể tải tùy chọn' };
  }
};

export const updateDriverPreferences = async (preferences) => {
  try {
    const response = await api.put('/drivers/preferences', preferences);
    return response.data;
  } catch (error) {
    console.error('❌ Update driver preferences error:', error);
    throw error.response?.data || { message: 'Không thể cập nhật tùy chọn' };
  }
};

// Driver Verification APIs
export const verifyDriverIdentity = async (verificationData) => {
  try {
    const response = await api.post('/drivers/verify-identity', verificationData);
    return response.data;
  } catch (error) {
    console.error('❌ Verify driver identity error:', error);
    throw error.response?.data || { message: 'Không thể xác minh danh tính' };
  }
};

export const getDriverVerificationStatus = async () => {
  try {
    const response = await api.get('/drivers/verification-status');
    return response.data;
  } catch (error) {
    console.error('❌ Get verification status error:', error);
    throw error.response?.data || { message: 'Không thể tải trạng thái xác minh' };
  }
};

// Driver Documents APIs
export const uploadDriverDocument = async (documentType, documentData) => {
  try {
    const formData = new FormData();
    formData.append('documentType', documentType);
    formData.append('document', documentData);

    const response = await api.post('/drivers/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('❌ Upload driver document error:', error);
    throw error.response?.data || { message: 'Không thể tải lên tài liệu' };
  }
};

export const getDriverDocuments = async () => {
  try {
    const response = await api.get('/drivers/documents');
    return response.data;
  } catch (error) {
    console.error('❌ Get driver documents error:', error);
    throw error.response?.data || { message: 'Không thể tải tài liệu' };
  }
};

// Driver Training APIs
export const getDriverTrainingModules = async () => {
  try {
    const response = await api.get('/drivers/training');
    return response.data;
  } catch (error) {
    console.error('❌ Get training modules error:', error);
    throw error.response?.data || { message: 'Không thể tải khóa đào tạo' };
  }
};

export const completeTrainingModule = async (moduleId, completionData) => {
  try {
    const response = await api.post(`/drivers/training/${moduleId}/complete`, completionData);
    return response.data;
  } catch (error) {
    console.error('❌ Complete training module error:', error);
    throw error.response?.data || { message: 'Không thể hoàn thành khóa đào tạo' };
  }
};

// Driver Referral APIs
export const getDriverReferralCode = async () => {
  try {
    const response = await api.get('/drivers/referral-code');
    return response.data;
  } catch (error) {
    console.error('❌ Get referral code error:', error);
    throw error.response?.data || { message: 'Không thể tải mã giới thiệu' };
  }
};

export const getDriverReferrals = async () => {
  try {
    const response = await api.get('/drivers/referrals');
    return response.data;
  } catch (error) {
    console.error('❌ Get referrals error:', error);
    throw error.response?.data || { message: 'Không thể tải danh sách giới thiệu' };
  }
};

// Driver Feedback APIs
export const submitDriverFeedback = async (feedbackData) => {
  try {
    const response = await api.post('/drivers/feedback', feedbackData);
    return response.data;
  } catch (error) {
    console.error('❌ Submit feedback error:', error);
    throw error.response?.data || { message: 'Không thể gửi phản hồi' };
  }
};

export const getDriverFeedback = async (page = 1, limit = 20) => {
  try {
    const response = await api.get('/drivers/feedback', {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('❌ Get driver feedback error:', error);
    throw error.response?.data || { message: 'Không thể tải phản hồi' };
  }
};
