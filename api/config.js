// api/config.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Auto-detect API URL based on platform
const getApiBaseUrl = () => {
	if (__DEV__) {
		// Use same IP for both Android and iOS in development
		const LOCAL_IP = '192.168.55.7'; // Current machine IP

		if (Platform.OS === 'android') {
			// Android Emulator or Physical Device
			return `http://${LOCAL_IP}:5000/api`;
		} else if (Platform.OS === 'ios') {
			// iOS Simulator hoặc Physical Device
			return `http://${LOCAL_IP}:5000/api`;
		}
	}
	if (Platform.OS === 'web') {
		return 'http://localhost:5000/api';
	} else {
		// Production
		return 'https://your-production-api.com/api';
	}
};

const API_BASE_URL = getApiBaseUrl();

console.log('🌐 API Base URL:', API_BASE_URL);

// Tạo axios instance
const api = axios.create({
	baseURL: API_BASE_URL,
	timeout: 10000,
	headers: {
		'Content-Type': 'application/json',
	},
});

// Request interceptor để thêm token vào headers
api.interceptors.request.use(
	async (config) => {
		try {
			const token = await AsyncStorage.getItem('token');
			if (token) {
				config.headers.Authorization = `Bearer ${token}`;
			} else {
				// Ensure old Authorization header is removed when no token
				if (config.headers && config.headers.Authorization) {
					delete config.headers.Authorization;
				}
			}
		} catch (error) {
			console.error('Error getting token:', error);
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
		// Better error logging
		console.error('🚨 API Error Details:', {
			message: error.message,
			status: error.response?.status,
			data: error.response?.data,
			config: {
				url: error.config?.url,
				method: error.config?.method,
				baseURL: error.config?.baseURL
			}
		});

		// Handle specific error cases
		if (error.response?.status === 401) {
			console.log('🔒 Unauthorized - clearing auth data');
			await AsyncStorage.removeItem('token');
			await AsyncStorage.removeItem('user');
			// Remove default Authorization header to avoid stale tokens
			if (api?.defaults?.headers?.common?.Authorization) {
				delete api.defaults.headers.common.Authorization;
			}
		}

		// Network errors
		if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
			error.message = 'Kết nối timeout. Vui lòng thử lại.';
		} else if (error.code === 'NETWORK_ERROR' || !error.response) {
			error.message = 'Không thể kết nối đến server. Kiểm tra kết nối mạng.';
		} else if (error.response?.status >= 500) {
			error.message = 'Server đang gặp sự cố. Vui lòng thử lại sau.';
		} else if (error.response?.status === 429) {
			error.message = 'Quá nhiều yêu cầu. Vui lòng đợi một chút.';
		}

		// Ensure error has proper message
		if (!error.message || error.message === 'undefined') {
			error.message = 'Đã xảy ra lỗi không xác định';
		}

		return Promise.reject(error);
	}
);

export default api;
