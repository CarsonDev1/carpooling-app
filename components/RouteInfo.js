import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function RouteInfo({ 
	estimatedTime, 
	distance, 
	startLocation, 
	endLocation,
	showDetails = false 
}) {
	const formatTime = (minutes) => {
		if (minutes < 60) {
			return `${minutes} phút`;
		} else {
			const hours = Math.floor(minutes / 60);
			const mins = minutes % 60;
			return `${hours} giờ ${mins} phút`;
		}
	};

	return (
		<View style={styles.container}>
			{/* Time and Distance */}
			<View style={styles.summaryRow}>
				<View style={styles.infoItem}>
					<Ionicons name="time" size={16} color="#34A853" />
					<Text style={styles.infoText}>
						{estimatedTime ? formatTime(estimatedTime) : 'Đang tính...'}
					</Text>
				</View>
				
				<View style={styles.infoItem}>
					<Ionicons name="map" size={16} color="#4285F4" />
					<Text style={styles.infoText}>
						{distance ? `${distance} km` : 'Đang tính...'}
					</Text>
				</View>
			</View>

			{/* Route Details */}
			{showDetails && (
				<View style={styles.routeDetails}>
					<View style={styles.routePoint}>
						<View style={styles.startDot} />
						<Text style={styles.routeText} numberOfLines={2}>
							{startLocation || 'Điểm khởi hành'}
						</Text>
					</View>
					
					<View style={styles.routeLine} />
					
					<View style={styles.routePoint}>
						<View style={styles.endDot} />
						<Text style={styles.routeText} numberOfLines={2}>
							{endLocation || 'Điểm đến'}
						</Text>
					</View>
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: 'white',
		borderRadius: 12,
		padding: 16,
		marginBottom: 16,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 3.84,
		elevation: 5,
	},
	summaryRow: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		marginBottom: 12,
	},
	infoItem: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	infoText: {
		fontSize: 14,
		fontWeight: '600',
		color: '#333',
	},
	routeDetails: {
		borderTopWidth: 1,
		borderTopColor: '#F0F0F0',
		paddingTop: 12,
	},
	routePoint: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: 12,
		marginBottom: 8,
	},
	startDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: '#34A853',
		marginTop: 6,
	},
	endDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: '#FF6B35',
		marginTop: 6,
	},
	routeLine: {
		width: 2,
		height: 20,
		backgroundColor: '#E0E0E0',
		marginLeft: 3,
		marginVertical: 4,
	},
	routeText: {
		fontSize: 14,
		color: '#666',
		flex: 1,
	},
}); 