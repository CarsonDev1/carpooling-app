import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Icon } from '@rneui/themed';
import { fetchArtToolById } from '../api/artToolsApi';
import RatingStars from '../components/RatingStars';
import { addToFavorites, removeFromFavorites, isArtToolFavorite } from '../utils/asyncStorageUtils';

const DetailScreen = ({ route, navigation }) => {
	const { artToolId } = route.params;
	const [artTool, setArtTool] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [isFavorite, setIsFavorite] = useState(false);

	// Lấy dữ liệu chi tiết công cụ nghệ thuật
	useEffect(() => {
		const loadArtToolDetails = async () => {
			try {
				setLoading(true);
				const data = await fetchArtToolById(artToolId);
				setArtTool(data);

				// Kiểm tra trạng thái yêu thích
				const favoriteStatus = await isArtToolFavorite(artToolId);
				setIsFavorite(favoriteStatus);
			} catch (err) {
				setError('Không thể tải thông tin chi tiết. Vui lòng thử lại sau.');
				Alert.alert('Lỗi', 'Không thể tải thông tin chi tiết. Vui lòng thử lại sau.');
			} finally {
				setLoading(false);
			}
		};

		loadArtToolDetails();
	}, [artToolId]);

	const handleFavoriteToggle = async () => {
		try {
			if (isFavorite) {
				await removeFromFavorites(artToolId);
				setIsFavorite(false);
				Alert.alert('Thành công', 'Đã xóa khỏi danh sách yêu thích');
			} else {
				await addToFavorites(artTool);
				setIsFavorite(true);
				Alert.alert('Thành công', 'Đã thêm vào danh sách yêu thích');
			}
		} catch (err) {
			Alert.alert('Lỗi', 'Không thể cập nhật danh sách yêu thích');
		}
	};

	// Tính toán đánh giá trung bình từ feedbacks
	const calculateAverageRating = (feedbacks) => {
		if (!feedbacks || feedbacks.length === 0) {
			return 0;
		}

		const sum = feedbacks.reduce((total, feedback) => total + feedback.rating, 0);
		return sum / feedbacks.length;
	};

	// Nhóm đánh giá theo số sao
	const getRatingGroups = (feedbacks) => {
		if (!feedbacks || feedbacks.length === 0) {
			return { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
		}

		const ratingGroups = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

		feedbacks.forEach((feedback) => {
			if (feedback.rating >= 1 && feedback.rating <= 5) {
				ratingGroups[Math.floor(feedback.rating)] += 1;
			}
		});

		return ratingGroups;
	};

	if (loading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size='large' color='#4285F4' />
			</View>
		);
	}

	if (error || !artTool) {
		return (
			<View style={styles.errorContainer}>
				<Text style={styles.errorText}>{error || 'Không tìm thấy thông tin'}</Text>
			</View>
		);
	}

	const averageRating = calculateAverageRating(artTool.feedbacks);
	const ratingGroups = getRatingGroups(artTool.feedbacks);
	const totalRatings = artTool.feedbacks ? artTool.feedbacks.length : 0;

	return (
		<ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
			{/* Hình ảnh sản phẩm */}
			<View style={styles.imageContainer}>
				<Image source={{ uri: artTool.image }} style={styles.image} />
				<TouchableOpacity style={styles.favoriteButton} onPress={handleFavoriteToggle}>
					<Icon
						name={isFavorite ? 'heart' : 'heart-outline'}
						type='material-community'
						color={isFavorite ? '#FF6B6B' : '#757575'}
						size={28}
					/>
				</TouchableOpacity>
			</View>

			{/* Thông tin cơ bản */}
			<View style={styles.infoContainer}>
				<Text style={styles.brand}>{artTool.brand}</Text>
				<Text style={styles.name}>{artTool.artName}</Text>

				<View style={styles.priceContainer}>
					<Text style={styles.price}>${artTool.price}</Text>
					{artTool.limitedTimeDeal > 0 && (
						<View style={styles.dealBadge}>
							<Text style={styles.dealText}>-{Math.round(artTool.limitedTimeDeal * 100)}% OFF</Text>
						</View>
					)}
				</View>

				{/* Đặc điểm sản phẩm */}
				<View style={styles.featuresContainer}>
					<Text style={styles.featuresTitle}>Đặc điểm</Text>
					<View style={styles.featureRow}>
						<Icon name='water' type='material-community' size={20} color='#4285F4' />
						<Text style={styles.featureText}>
							{artTool.glassSurface ? 'Phù hợp với bề mặt kính' : 'Không phù hợp với bề mặt kính'}
						</Text>
					</View>
				</View>

				{/* Mô tả sản phẩm */}
				<View style={styles.descriptionContainer}>
					<Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
					<Text style={styles.description}>{artTool.description}</Text>
				</View>
			</View>

			{/* Phần đánh giá */}
			<View style={styles.ratingsContainer}>
				<Text style={styles.sectionTitle}>Đánh giá & Nhận xét</Text>

				<View style={styles.ratingSummary}>
					<View style={styles.averageRatingContainer}>
						<Text style={styles.averageRatingValue}>{averageRating.toFixed(1)}</Text>
						<RatingStars rating={averageRating} size={24} />
						<Text style={styles.totalRatingsText}>{totalRatings} đánh giá</Text>
					</View>

					<View style={styles.ratingBarsContainer}>
						{[5, 4, 3, 2, 1].map((star) => (
							<View key={star} style={styles.ratingBarRow}>
								<Text style={styles.ratingBarLabel}>{star}</Text>
								<View style={styles.ratingBarBackground}>
									<View
										style={[
											styles.ratingBarFill,
											{
												width: `${
													totalRatings > 0 ? (ratingGroups[star] / totalRatings) * 100 : 0
												}%`,
												backgroundColor:
													star >= 4 ? '#4CAF50' : star >= 3 ? '#FFC107' : '#F44336',
											},
										]}
									/>
								</View>
								<Text style={styles.ratingBarCount}>{ratingGroups[star]}</Text>
							</View>
						))}
					</View>
				</View>

				{/* Danh sách đánh giá */}
				{artTool.feedbacks && artTool.feedbacks.length > 0 ? (
					<View style={styles.reviewsContainer}>
						<Text style={styles.reviewsTitle}>Nhận xét từ người dùng</Text>

						{artTool.feedbacks.map((feedback, index) => (
							<View key={index} style={styles.reviewItem}>
								<View style={styles.reviewHeader}>
									<Text style={styles.reviewAuthor}>{feedback.author}</Text>
									<Text style={styles.reviewDate}>
										{new Date(feedback.date).toLocaleDateString()}
									</Text>
								</View>
								<RatingStars rating={feedback.rating} size={16} style={styles.reviewRating} />
								<Text style={styles.reviewComment}>{feedback.comment}</Text>
							</View>
						))}
					</View>
				) : (
					<Text style={styles.noReviewsText}>Chưa có đánh giá nào</Text>
				)}
			</View>
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#FFFFFF',
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	errorContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
	},
	errorText: {
		fontSize: 16,
		color: 'red',
		textAlign: 'center',
	},
	imageContainer: {
		position: 'relative',
		width: '100%',
		height: 300,
		backgroundColor: '#F5F5F5',
	},
	image: {
		width: '100%',
		height: '100%',
		resizeMode: 'contain',
	},
	favoriteButton: {
		position: 'absolute',
		top: 15,
		right: 15,
		backgroundColor: 'rgba(255, 255, 255, 0.8)',
		borderRadius: 20,
		padding: 8,
	},
	infoContainer: {
		padding: 15,
	},
	brand: {
		fontSize: 16,
		color: '#757575',
		marginBottom: 5,
	},
	name: {
		fontSize: 22,
		fontWeight: 'bold',
		color: '#212121',
		marginBottom: 10,
	},
	priceContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 15,
	},
	price: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#212121',
	},
	dealBadge: {
		backgroundColor: '#FF6B6B',
		paddingHorizontal: 10,
		paddingVertical: 5,
		borderRadius: 5,
		marginLeft: 10,
	},
	dealText: {
		color: 'white',
		fontWeight: 'bold',
		fontSize: 14,
	},
	featuresContainer: {
		marginVertical: 15,
		padding: 15,
		backgroundColor: '#F5F5F5',
		borderRadius: 10,
	},
	featuresTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 10,
	},
	featureRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 8,
	},
	featureText: {
		marginLeft: 10,
		fontSize: 16,
		color: '#424242',
	},
	descriptionContainer: {
		marginVertical: 15,
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		marginBottom: 10,
		color: '#212121',
	},
	description: {
		fontSize: 16,
		lineHeight: 24,
		color: '#424242',
	},
	ratingsContainer: {
		padding: 15,
		backgroundColor: '#F9F9F9',
	},
	ratingSummary: {
		flexDirection: 'row',
		marginBottom: 20,
		backgroundColor: '#FFFFFF',
		padding: 15,
		borderRadius: 10,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
		elevation: 2,
	},
	averageRatingContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		paddingRight: 15,
		borderRightWidth: 1,
		borderRightColor: '#EEEEEE',
		width: 100,
	},
	averageRatingValue: {
		fontSize: 36,
		fontWeight: 'bold',
		color: '#212121',
		marginBottom: 5,
	},
	totalRatingsText: {
		fontSize: 12,
		color: '#757575',
		marginTop: 5,
	},
	ratingBarsContainer: {
		flex: 1,
		paddingLeft: 15,
		justifyContent: 'center',
	},
	ratingBarRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 8,
	},
	ratingBarLabel: {
		fontSize: 14,
		fontWeight: 'bold',
		width: 20,
		textAlign: 'center',
	},
	ratingBarBackground: {
		flex: 1,
		height: 8,
		backgroundColor: '#EEEEEE',
		borderRadius: 4,
		marginHorizontal: 8,
	},
	ratingBarFill: {
		height: '100%',
		borderRadius: 4,
	},
	ratingBarCount: {
		fontSize: 14,
		color: '#757575',
		width: 30,
		textAlign: 'right',
	},
	reviewsContainer: {
		marginTop: 10,
	},
	reviewsTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 15,
	},
	reviewItem: {
		padding: 15,
		backgroundColor: '#FFFFFF',
		borderRadius: 10,
		marginBottom: 10,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
		elevation: 2,
	},
	reviewHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 5,
	},
	reviewAuthor: {
		fontSize: 16,
		fontWeight: 'bold',
	},
	reviewDate: {
		fontSize: 14,
		color: '#757575',
	},
	reviewRating: {
		marginBottom: 8,
	},
	reviewComment: {
		fontSize: 16,
		lineHeight: 22,
	},
	noReviewsText: {
		fontSize: 16,
		color: '#757575',
		textAlign: 'center',
		marginTop: 10,
	},
});

export default DetailScreen;
