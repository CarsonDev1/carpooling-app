import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  Dimensions,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useNavigation, useRoute } from '@react-navigation/native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, UrlTile } from 'react-native-maps';

const { width, height } = Dimensions.get('window');

export default function NavigationScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  // Get route params
  const {
    startLocation,
    endLocation,
    startCoordinates,
    endCoordinates,
    tripId,
    isDriver = false
  } = route.params || {};

  // State
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [distance, setDistance] = useState(null);
  const [showRoute, setShowRoute] = useState(true);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // Map ref
  const mapRef = useRef(null);

  // Default coordinates (Hanoi)
  const defaultStart = {
    latitude: 21.0285,
    longitude: 105.8542,
  };

  const defaultEnd = {
    latitude: 21.0278,
    longitude: 105.8342,
  };

  // Use provided coordinates or defaults
  const origin = startCoordinates ? {
    latitude: startCoordinates.lat,
    longitude: startCoordinates.lng,
  } : defaultStart;

  const destination = endCoordinates ? {
    latitude: endCoordinates.lat,
    longitude: endCoordinates.lng,
  } : defaultEnd;

  // Calculate route using simple distance calculation
  const calculateRoute = async () => {
    if (hasCalculated) return; // Prevent multiple calls

    try {
      setLoading(true);

      // Simple route calculation without external API
      const distanceKm = calculateDistance(origin, destination);
      const estimatedTimeMinutes = Math.round(distanceKm * 2); // Rough estimate: 2 min per km

      // Create a simple route line
      setRouteCoordinates([origin, destination]);
      setDistance(distanceKm.toFixed(1));
      setEstimatedTime(estimatedTimeMinutes);
      setHasCalculated(true);
    } catch (error) {
      console.error('Error calculating route:', error);
      // Fallback: create a simple straight line
      setRouteCoordinates([origin, destination]);
      const distanceKm = calculateDistance(origin, destination);
      setDistance(distanceKm.toFixed(1));
      setEstimatedTime(Math.round(distanceKm * 2));
    } finally {
      setLoading(false);
    }
  };

  // Calculate distance using Haversine formula (fallback)
  const calculateDistance = (start, end) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (end.latitude - start.latitude) * Math.PI / 180;
    const dLon = (end.longitude - start.longitude) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(start.latitude * Math.PI / 180) * Math.cos(end.latitude * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    if (origin && destination && !hasCalculated) {
      // Delay calculation to avoid blocking UI
      setTimeout(() => {
        calculateRoute();
      }, 1000);
    }
  }, [origin, destination, hasCalculated]);

  const handleStartNavigation = async () => {
    try {
      setIsNavigating(true);

      // Option 1: Open in Google Maps
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&travelmode=driving`;

      // Option 2: Open in Apple Maps (iOS)
      const appleMapsUrl = `http://maps.apple.com/?daddr=${destination.latitude},${destination.longitude}&saddr=${origin.latitude},${origin.longitude}&dirflg=d`;

      // Check if device can open URLs
      const canOpenGoogleMaps = await Linking.canOpenURL(googleMapsUrl);
      const canOpenAppleMaps = await Linking.canOpenURL(appleMapsUrl);

      if (Platform.OS === 'ios' && canOpenAppleMaps) {
        // Open Apple Maps on iOS
        await Linking.openURL(appleMapsUrl);
        Alert.alert(
          'Điều hướng đã mở',
          'Đã mở Apple Maps với tuyến đường đến điểm đến của bạn.',
          [{ text: 'OK' }]
        );
      } else if (canOpenGoogleMaps) {
        // Open Google Maps
        await Linking.openURL(googleMapsUrl);
        Alert.alert(
          'Điều hướng đã mở',
          'Đã mở Google Maps với tuyến đường đến điểm đến của bạn.',
          [{ text: 'OK' }]
        );
      } else {
        // Fallback: Show route in app
        Alert.alert(
          'Không thể mở ứng dụng bản đồ',
          'Vui lòng cài đặt Google Maps hoặc Apple Maps để sử dụng tính năng điều hướng.',
          [
            { text: 'Hủy', style: 'cancel' },
            {
              text: 'Xem trong app',
              onPress: () => {
                setIsNavigating(true);
                // Start in-app navigation mode
                Alert.alert(
                  'Chế độ điều hướng',
                  'Đã bật chế độ điều hướng trong app. Bạn sẽ nhận được hướng dẫn từng bước.',
                  [{ text: 'OK' }]
                );
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert(
        'Lỗi',
        'Không thể mở ứng dụng bản đồ. Vui lòng thử lại.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsNavigating(false);
    }
  };

  const handleToggleRoute = () => {
    setShowRoute(!showRoute);
  };

  const handleCenterMap = () => {
    if (mapRef.current && routeCoordinates.length > 0) {
      mapRef.current.fitToCoordinates(routeCoordinates, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    } else if (mapRef.current) {
      const region = {
        latitude: (origin.latitude + destination.latitude) / 2,
        longitude: (origin.longitude + destination.longitude) / 2,
        latitudeDelta: Math.abs(origin.latitude - destination.latitude) * 1.5,
        longitudeDelta: Math.abs(origin.longitude - destination.longitude) * 1.5,
      };
      mapRef.current.animateToRegion(region, 1000);
    }
  };

  const formatTime = (minutes) => {
    if (minutes < 60) {
      return `${minutes} phút`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours} giờ ${mins} phút`;
    }
  };

  // Calculate map region to fit both markers
  const getMapRegion = () => {
    const midLat = (origin.latitude + destination.latitude) / 2;
    const midLng = (origin.longitude + destination.longitude) / 2;
    const deltaLat = Math.abs(origin.latitude - destination.latitude) * 1.5;
    const deltaLng = Math.abs(origin.longitude - destination.longitude) * 1.5;

    return {
      latitude: midLat,
      longitude: midLng,
      latitudeDelta: Math.max(deltaLat, 0.01),
      longitudeDelta: Math.max(deltaLng, 0.01),
    };
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Điều hướng</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Map Container */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={Platform.OS === 'android' && Constants.appOwnership !== 'expo' ? PROVIDER_GOOGLE : undefined}
          initialRegion={getMapRegion()}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsCompass={true}
          showsScale={true}
        >
          {Platform.OS === 'android' && (
            <UrlTile
              urlTemplate="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maximumZ={19}
              flipY={false}
            />
          )}
          {/* Start Marker */}
          <Marker
            coordinate={origin}
            title="Điểm khởi hành"
            description={startLocation || "Điểm bắt đầu"}
          >
            <View style={styles.startMarker}>
              <Ionicons name="location" size={20} color="red" />
            </View>
          </Marker>

          {/* End Marker */}
          <Marker
            coordinate={destination}
            title="Điểm đến"
            description={endLocation || "Điểm kết thúc"}
          >
            <View style={styles.endMarker}>
              <Ionicons name="location" size={20} color="white" />
            </View>
          </Marker>

          {/* Route Polyline */}
          {showRoute && routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeWidth={4}
              strokeColor="#4285F4"
              lineDashPattern={[1]}
            />
          )}
        </MapView>

        {/* Map Controls */}
        <View style={styles.mapControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleCenterMap}
          >
            <Ionicons name="locate" size={20} color="#4285F4" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleToggleRoute}
          >
            <Ionicons
              name={showRoute ? "eye-off" : "eye"}
              size={20}
              color="#4285F4"
            />
          </TouchableOpacity>
        </View>

        {/* Loading Overlay */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingBox}>
              <ActivityIndicator color="#4285F4" size="large" />
              <Text style={styles.loadingText}>Đang tính toán tuyến đường...</Text>
            </View>
          </View>
        )}
      </View>

      {/* Route Info Panel */}
      <View style={styles.routeInfoPanel}>
        {/* Route Summary */}
        <View style={styles.routeSummary}>
          <View style={styles.routeItem}>
            <Ionicons name="time" size={16} color="#666" />
            <Text style={styles.routeText}>
              {estimatedTime ? formatTime(estimatedTime) : 'Đang tính...'}
            </Text>
          </View>

          <View style={styles.routeItem}>
            <Ionicons name="map" size={16} color="#666" />
            <Text style={styles.routeText}>
              {distance ? `${distance} km` : 'Đang tính...'}
            </Text>
          </View>
        </View>

        {/* Route Details */}
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

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.secondaryButtonText}>Quay lại</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryButton, isNavigating && styles.disabledButton]}
            onPress={handleStartNavigation}
            disabled={!estimatedTime || isNavigating}
          >
            {isNavigating ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>
                Bắt đầu điều hướng
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#4285F4',
    paddingTop: Platform.OS === 'ios' ? 44 : 25,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  menuButton: {
    padding: 8,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  mapControls: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'column',
    gap: 10,
  },
  controlButton: {
    width: 44,
    height: 44,
    backgroundColor: 'white',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBox: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  startMarker: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 8,
    borderWidth: 3,
    borderColor: 'red',
  },
  endMarker: {
    backgroundColor: '#4285F4',
    borderRadius: 20,
    padding: 8,
    borderWidth: 3,
    borderColor: 'white',
  },
  routeInfoPanel: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  routeSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  routeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  routeDetails: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
    marginBottom: 20,
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
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: 'white',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  primaryButton: {
    flex: 2,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#4285F4',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
}); 