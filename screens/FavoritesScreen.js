import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Icon } from '@rneui/themed';
import { useFocusEffect } from '@react-navigation/native';
import ArtToolCard from '../components/ArtToolCard';
import SearchBar from '../components/SearchBar';
import { getFavorites, clearAllFavorites } from '../utils/asyncStorageUtils';

const FavoritesScreen = ({ navigation }) => {
	const [favorites, setFavorites] = useState([]);
	const [filteredFavorites, setFilteredFavorites] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState('');

	// Lấy danh sách yêu thích
	const loadFavorites = async () => {
		try {
			setLoading(true);
			const favoritesData = await getFavorites();
			setFavorites(favoritesData);
			setFilteredFavorites(favoritesData);
		} catch (error) {
			console.error('Error loading favorites:', error);
			Alert.alert('Lỗi', 'Không thể tải danh sách yêu thích');
		} finally {
			setLoading(false);
		}
	};

	// Tải dữ liệu khi màn hình được focus
	useFocusEffect(
		useCallback(() => {
			loadFavorites();
		}, [])
	);

	// Xử lý khi thay đổi trạng thái yêu thích
	const handleFavoriteToggle = async (artToolId, isFavorite) => {
		if (!isFavorite) {
			// Nếu đã xóa khỏi yêu thích, cập nhật lại danh sách
			await loadFavorites();
		}
	};

	// Xử lý tìm kiếm
	const handleSearch = () => {
		if (!searchQuery.trim()) {
			setFilteredFavorites(favorites);
			return;
		}

		const filtered = favorites.filter(
			(item) =>
				item.artName.toLowerCase().includes(searchQuery.toLowerCase()) ||
				item.brand.toLowerCase().includes(searchQuery.toLowerCase())
		);
		setFilteredFavorites(filtered);
	};

	// Xử lý xóa tìm kiếm
	const handleClearSearch = () => {
		setSearchQuery('');
		setFilteredFavorites(favorites);
	};

	// Xử lý xóa tất cả yêu thích
	const handleClearAllFavorites = () => {
		Alert.alert('Xóa tất cả', 'Bạn có chắc chắn muốn xóa tất cả công cụ nghệ thuật khỏi danh sách yêu thích?', [
			{
				text: 'Hủy',
				style: 'cancel',
			},
			{
				text: 'Xóa',
				style: 'destructive',
				onPress: async () => {
					try {
						await clearAllFavorites();
						setFavorites([]);
						setFilteredFavorites([]);
						Alert.alert('Thành công', 'Đã xóa tất cả khỏi danh sách yêu thích');
					} catch (error) {
						Alert.alert('Lỗi', 'Không thể xóa danh sách yêu thích');
					}
				},
			},
		]);
	};

	// Render item cho FlatList
	const renderItem = ({ item }) => (
		<ArtToolCard
			artTool={item}
			onPress={() => navigation.navigate('Detail', { artToolId: item.id })}
			onFavoriteToggle={handleFavoriteToggle}
		/>
	);

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<SearchBar
					value={searchQuery}
					onChangeText={setSearchQuery}
					onSubmit={handleSearch}
					onClear={handleClearSearch}
				/>

				{favorites.length > 0 && (
					<TouchableOpacity style={styles.clearAllButton} onPress={handleClearAllFavorites}>
						<Icon name='delete' type='material' color='#FF6B6B' size={22} />
						<Text style={styles.clearAllText}>Xóa tất cả</Text>
					</TouchableOpacity>
				)}
			</View>

			{loading ? (
				<View style={styles.loadingContainer}>
					<ActivityIndicator size='large' color='#4285F4' />
				</View>
			) : (
				<FlatList
					data={filteredFavorites}
					renderItem={renderItem}
					keyExtractor={(item) => item.id}
					contentContainerStyle={styles.listContainer}
					showsVerticalScrollIndicator={false}
					ListEmptyComponent={
						<View style={styles.emptyContainer}>
							<Icon name='heart-broken' type='material-community' size={60} color='#CCCCCC' />
							<Text style={styles.emptyText}>Danh sách yêu thích trống</Text>
							<Text style={styles.emptySubText}>Thêm công cụ nghệ thuật yêu thích từ trang chủ</Text>
							<TouchableOpacity style={styles.browseButton} onPress={() => navigation.navigate('Home')}>
								<Text style={styles.browseButtonText}>Khám phá ngay</Text>
							</TouchableOpacity>
						</View>
					}
				/>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#F9F9F9',
	},
	header: {
		paddingBottom: 5,
	},
	clearAllButton: {
		flexDirection: 'row',
		alignItems: 'center',
		alignSelf: 'flex-end',
		paddingHorizontal: 15,
		paddingVertical: 8,
		marginRight: 15,
		marginBottom: 10,
	},
	clearAllText: {
		color: '#FF6B6B',
		fontWeight: 'bold',
		marginLeft: 5,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	listContainer: {
		padding: 15,
		paddingTop: 5,
	},
	emptyContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 30,
		paddingVertical: 60,
	},
	emptyText: {
		fontSize: 18,
		fontWeight: 'bold',
		color: '#424242',
		marginTop: 20,
		marginBottom: 8,
	},
	emptySubText: {
		fontSize: 16,
		color: '#757575',
		textAlign: 'center',
		marginBottom: 25,
	},
	browseButton: {
		backgroundColor: '#4285F4',
		paddingHorizontal: 20,
		paddingVertical: 10,
		borderRadius: 25,
	},
	browseButtonText: {
		color: 'white',
		fontWeight: 'bold',
		fontSize: 16,
	},
});

export default FavoritesScreen;
