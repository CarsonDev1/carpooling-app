import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITE_ART_TOOLS_KEY = 'favorite_art_tools';

// Lấy danh sách yêu thích
export const getFavorites = async () => {
	try {
		const jsonValue = await AsyncStorage.getItem(FAVORITE_ART_TOOLS_KEY);
		return jsonValue != null ? JSON.parse(jsonValue) : [];
	} catch (error) {
		console.error('Error getting favorites:', error);
		return [];
	}
};

// Thêm một công cụ nghệ thuật vào danh sách yêu thích
export const addToFavorites = async (artTool) => {
	try {
		const favorites = await getFavorites();
		// Kiểm tra xem công cụ nghệ thuật đã tồn tại trong danh sách yêu thích chưa
		const artToolExists = favorites.some((item) => item.id === artTool.id);

		if (!artToolExists) {
			const updatedFavorites = [...favorites, artTool];
			await AsyncStorage.setItem(FAVORITE_ART_TOOLS_KEY, JSON.stringify(updatedFavorites));
			return { success: true, message: 'Đã thêm vào danh sách yêu thích' };
		} else {
			return { success: false, message: 'Đã tồn tại trong danh sách yêu thích' };
		}
	} catch (error) {
		console.error('Error adding to favorites:', error);
		return { success: false, message: 'Có lỗi xảy ra khi thêm vào danh sách yêu thích' };
	}
};

// Xóa một công cụ nghệ thuật khỏi danh sách yêu thích
export const removeFromFavorites = async (artToolId) => {
	try {
		const favorites = await getFavorites();
		const updatedFavorites = favorites.filter((item) => item.id !== artToolId);
		await AsyncStorage.setItem(FAVORITE_ART_TOOLS_KEY, JSON.stringify(updatedFavorites));
		return { success: true, message: 'Đã xóa khỏi danh sách yêu thích' };
	} catch (error) {
		console.error('Error removing from favorites:', error);
		return { success: false, message: 'Có lỗi xảy ra khi xóa khỏi danh sách yêu thích' };
	}
};

// Xóa tất cả công cụ nghệ thuật khỏi danh sách yêu thích
export const clearAllFavorites = async () => {
	try {
		await AsyncStorage.setItem(FAVORITE_ART_TOOLS_KEY, JSON.stringify([]));
		return { success: true, message: 'Đã xóa tất cả khỏi danh sách yêu thích' };
	} catch (error) {
		console.error('Error clearing favorites:', error);
		return { success: false, message: 'Có lỗi xảy ra khi xóa tất cả yêu thích' };
	}
};

// Kiểm tra một công cụ nghệ thuật có nằm trong danh sách yêu thích hay không
export const isArtToolFavorite = async (artToolId) => {
	try {
		const favorites = await getFavorites();
		return favorites.some((item) => item.id === artToolId);
	} catch (error) {
		console.error('Error checking favorite status:', error);
		return false;
	}
};
