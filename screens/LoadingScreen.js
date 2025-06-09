// screens/LoadingScreen.js
import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

const LoadingScreen = () => {
	return (
		<View style={styles.container}>
			<ActivityIndicator size='large' color='#4285F4' />
			<Text style={styles.loadingText}>Đang tải...</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#FFFFFF',
	},
	loadingText: {
		marginTop: 16,
		fontSize: 16,
		color: '#757575',
	},
});

export default LoadingScreen;
