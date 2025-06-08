import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, Text, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { fetchAllArtTools, fetchBrands, searchArtTools } from '../api/artToolsApi';
import ArtToolCard from '../components/ArtToolCard';
import BrandFilter from '../components/BrandFilter';
import SearchBar from '../components/SearchBar';
import { useFocusEffect } from '@react-navigation/native';

const HomeScreen = ({ navigation }) => {
	const [artTools, setArtTools] = useState([]);
	const [filteredArtTools, setFilteredArtTools] = useState([]);
	const [brands, setBrands] = useState([]);
	const [selectedBrand, setSelectedBrand] = useState(null);
	const [searchQuery, setSearchQuery] = useState('');
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState(null);

	// Hàm để lấy dữ liệu
	const loadData = async () => {
		try {
			setLoading(true);
			setError(null);

			// Lấy tất cả công cụ nghệ thuật
			const toolsData = await fetchAllArtTools();
			setArtTools(toolsData);
			setFilteredArtTools(toolsData);

			// Lấy danh sách thương hiệu
			const brandsData = await fetchBrands();
			setBrands(brandsData);
		} catch (err) {
			setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
			Alert.alert('Lỗi', 'Không thể tải dữ liệu. Vui lòng thử lại sau.');
		} finally {
			setLoading(false);
		}
	};

	// Tải dữ liệu ban đầu
	useEffect(() => {
		loadData();
	}, []);

	// Làm mới dữ liệu khi quay lại màn hình
	useFocusEffect(
		useCallback(() => {
			loadData();
		}, [])
	);

	// Xử lý khi kéo xuống để làm mới
	const onRefresh = async () => {
		setRefreshing(true);
		await loadData();
		setRefreshing(false);
	};

	// Xử lý khi thay đổi thương hiệu được chọn
	useEffect(() => {
		if (searchQuery.trim() !== '') {
			// Nếu có tìm kiếm, áp dụng bộ lọc thương hiệu lên kết quả tìm kiếm
			const filtered = artTools.filter(
				(tool) =>
					tool.artName.toLowerCase().includes(searchQuery.toLowerCase()) &&
					(selectedBrand === null || tool.brand === selectedBrand)
			);
			setFilteredArtTools(filtered);
		} else if (selectedBrand === null) {
			// Nếu không có thương hiệu được chọn, hiển thị tất cả
			setFilteredArtTools(artTools);
		} else {
			// Lọc theo thương hiệu được chọn
			const filtered = artTools.filter((tool) => tool.brand === selectedBrand);
			setFilteredArtTools(filtered);
		}
	}, [selectedBrand, artTools, searchQuery]);

	// Xử lý khi thay đổi trạng thái yêu thích
	const handleFavoriteToggle = (artToolId, isFavorite) => {
		// Cập nhật UI ngay lập tức khi thay đổi
		console.log(`Tool ${artToolId} ${isFavorite ? 'added to' : 'removed from'} favorites`);
	};

	// Xử lý tìm kiếm
	const handleSearch = async () => {
		if (searchQuery.trim() === '') {
			setFilteredArtTools(selectedBrand ? artTools.filter((tool) => tool.brand === selectedBrand) : artTools);
			return;
		}

		try {
			setLoading(true);
			// Tìm kiếm bằng API
			const searchResults = await searchArtTools(searchQuery);
			// Áp dụng bộ lọc thương hiệu nếu có
			const filtered = selectedBrand
				? searchResults.filter((tool) => tool.brand === selectedBrand)
				: searchResults;

			setFilteredArtTools(filtered);
		} catch (err) {
			Alert.alert('Lỗi tìm kiếm', 'Không thể tìm kiếm. Vui lòng thử lại sau.');
		} finally {
			setLoading(false);
		}
	};

	// Xử lý xóa tìm kiếm
	const handleClearSearch = () => {
		setSearchQuery('');
		setFilteredArtTools(selectedBrand ? artTools.filter((tool) => tool.brand === selectedBrand) : artTools);
	};

	// Render item cho FlatList
	const renderItem = ({ item }) => (
		<ArtToolCard
			artTool={item}
			onPress={() => navigation.navigate('Detail', { artToolId: item.id })}
			onFavoriteToggle={handleFavoriteToggle}
		/>
	);

	if (loading && !refreshing) {
		return (
			<View style={styles.centerContainer}>
				<ActivityIndicator size='large' color='#4285F4' />
			</View>
		);
	}

	if (error) {
		return (
			<View style={styles.centerContainer}>
				<Text style={styles.errorText}>{error}</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<SearchBar
				value={searchQuery}
				onChangeText={setSearchQuery}
				onSubmit={handleSearch}
				onClear={handleClearSearch}
			/>

			<BrandFilter brands={brands} selectedBrand={selectedBrand} onSelectBrand={setSelectedBrand} />

			<FlatList
				data={filteredArtTools}
				renderItem={renderItem}
				keyExtractor={(item) => item.id}
				contentContainerStyle={styles.listContainer}
				showsVerticalScrollIndicator={false}
				refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
				ListEmptyComponent={
					<View style={styles.emptyContainer}>
						<Text style={styles.emptyText}>
							{searchQuery
								? 'Không tìm thấy công cụ nghệ thuật phù hợp'
								: 'Không có công cụ nghệ thuật nào'}
						</Text>
					</View>
				}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#F9F9F9',
	},
	listContainer: {
		padding: 15,
	},
	centerContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	errorText: {
		fontSize: 16,
		color: 'red',
		textAlign: 'center',
	},
	emptyContainer: {
		padding: 20,
		alignItems: 'center',
	},
	emptyText: {
		fontSize: 16,
		color: '#757575',
		textAlign: 'center',
	},
});

export default HomeScreen;
