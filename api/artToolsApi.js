import axios from 'axios';

// Thay đổi URL này thành URL của mockapi của bạn sau khi tạo
const API_URL = 'https://67d1ba3990e0670699bb5276.mockapi.io/api/v1/artTools';

// Lấy tất cả công cụ nghệ thuật
export const fetchAllArtTools = async () => {
	try {
		const response = await axios.get(API_URL);
		return response.data;
	} catch (error) {
		console.error('Error fetching art tools:', error);
		throw error;
	}
};

// Lấy thông tin chi tiết của một công cụ nghệ thuật dựa trên ID
export const fetchArtToolById = async (id) => {
	try {
		const response = await axios.get(`${API_URL}/${id}`);
		return response.data;
	} catch (error) {
		console.error(`Error fetching art tool with id ${id}:`, error);
		throw error;
	}
};

// Lấy công cụ nghệ thuật theo thương hiệu
export const fetchArtToolsByBrand = async (brand) => {
	try {
		const response = await axios.get(`${API_URL}?brand=${brand}`);
		return response.data;
	} catch (error) {
		console.error(`Error fetching art tools by brand ${brand}:`, error);
		throw error;
	}
};

// Tìm kiếm công cụ nghệ thuật theo tên
export const searchArtTools = async (query) => {
	try {
		// Sử dụng filter của mockAPI để tìm kiếm theo tên
		const response = await axios.get(`${API_URL}?artName_like=${query}`);
		return response.data;
	} catch (error) {
		console.error(`Error searching art tools with query ${query}:`, error);
		throw error;
	}
};

// Lấy danh sách các thương hiệu duy nhất từ dữ liệu
export const fetchBrands = async () => {
	try {
		const response = await axios.get(API_URL);
		const allArtTools = response.data;
		const uniqueBrands = [...new Set(allArtTools.map((tool) => tool.brand))];
		return uniqueBrands;
	} catch (error) {
		console.error('Error fetching brands:', error);
		throw error;
	}
};
