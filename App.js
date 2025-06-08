import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';

export default function App() {
	return (
		<SafeAreaProvider>
			<SafeAreaView style={{ flex: 1, backgroundColor: '#4285F4' }}>
				<StatusBar style='light' backgroundColor='#4285F4' />
				<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
					<Text style={{ color: '#fff', textAlign: 'center' }}>Welcome to My App! 1s</Text>
				</View>
			</SafeAreaView>
		</SafeAreaProvider>
	);
}
