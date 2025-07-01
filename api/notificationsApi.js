import api from './config';

// Get user notifications
export const getNotifications = async (options = {}) => {
  try {
    const { page = 1, limit = 20, type } = options;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(type && { type })
    });

    const response = await api.get(`/notifications?${queryParams}`);
    
    return { success: true, data: response.data.data, pagination: response.data.pagination };
  } catch (error) {
    console.error('Get notifications error:', error);
    throw error;
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    
    return { success: true, data: response.data.data };
  } catch (error) {
    console.error('Mark notification as read error:', error);
    throw error;
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  try {
    const response = await api.patch('/notifications/read-all');
    
    return { success: true, data: response.data.data };
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    throw error;
  }
};

// Get user chats
export const getChats = async (options = {}) => {
  try {
    const { page = 1, limit = 20 } = options;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    const response = await api.get(`/chats?${queryParams}`);
    
    return { success: true, data: response.data.data, pagination: response.data.pagination };
  } catch (error) {
    console.error('Get chats error:', error);
    throw error;
  }
};

// Send message
export const sendMessage = async (chatId, message) => {
  try {
    const response = await api.post(`/chats/${chatId}/messages`, { message });
    
    return { success: true, data: response.data.data };
  } catch (error) {
    console.error('Send message error:', error);
    throw error;
  }
}; 