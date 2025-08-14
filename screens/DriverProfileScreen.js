import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Image,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { getDriverProfile, updateDriverProfile, updateDriverStatus } from '../api/driverApi';

const DriverProfileScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [autoAccept, setAutoAccept] = useState(false);

  // Load driver profile
  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getDriverProfile();
      if (response.success) {
        setProfile(response.data);
        setIsOnline(response.data.isOnline || false);
        setAutoAccept(response.data.autoAccept || false);
      }
    } catch (error) {
      console.error('❌ Load profile error:', error);
      Alert.alert('Lỗi', 'Không thể tải hồ sơ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Update online status
  const handleOnlineToggle = async (value) => {
    try {
      setUpdating(true);
      const response = await updateDriverStatus({ isOnline: value });
      if (response.success) {
        setIsOnline(value);
        Alert.alert(
          value ? 'Đã bật chế độ nhận chuyến' : 'Đã tắt chế độ nhận chuyến',
          value 
            ? 'Bạn đang online và có thể nhận chuyến đi mới!' 
            : 'Bạn đang offline và sẽ không nhận chuyến đi mới.'
        );
      }
    } catch (error) {
      console.error('❌ Update status error:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái. Vui lòng thử lại.');
    } finally {
      setUpdating(false);
    }
  };

  // Update auto accept setting
  const handleAutoAcceptToggle = async (value) => {
    try {
      setUpdating(true);
      const response = await updateDriverProfile({ autoAccept: value });
      if (response.success) {
        setAutoAccept(value);
        Alert.alert(
          value ? 'Đã bật tự động nhận chuyến' : 'Đã tắt tự động nhận chuyến',
          value 
            ? 'Hệ thống sẽ tự động nhận chuyến đi phù hợp cho bạn.' 
            : 'Bạn sẽ cần xác nhận từng chuyến đi.'
        );
      }
    } catch (error) {
      console.error('❌ Update auto accept error:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật cài đặt. Vui lòng thử lại.');
    } finally {
      setUpdating(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: () => {
            logout();
            navigation.navigate('Login');
          },
        },
      ]
    );
  };

  // Load profile on focus
  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4285F4" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4285F4" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hồ sơ tài xế</Text>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate('EditDriverProfile', { profile })}
        >
          <Ionicons name="create-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Image
              source={
                profile?.avatar
                  ? { uri: profile.avatar }
                  : require('../assets/avatar.png')
              }
              style={styles.avatar}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profile?.fullName || user?.fullName}</Text>
              <Text style={styles.profilePhone}>{profile?.phone || user?.phone}</Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.ratingText}>
                  {profile?.rating?.asDriver?.average?.toFixed(1) || 'N/A'}
                </Text>
                <Text style={styles.ratingCount}>
                  ({profile?.rating?.asDriver?.count || 0} đánh giá)
                </Text>
              </View>
            </View>
          </View>

          {/* Status Indicators */}
          <View style={styles.statusContainer}>
            <View style={styles.statusItem}>
              <View style={[styles.statusDot, { backgroundColor: isOnline ? '#4CAF50' : '#FF5722' }]} />
              <Text style={styles.statusText}>
                {isOnline ? 'Đang online' : 'Đang offline'}
              </Text>
            </View>
            <View style={styles.statusItem}>
              <View style={[styles.statusDot, { backgroundColor: autoAccept ? '#4CAF50' : '#FF9800' }]} />
              <Text style={styles.statusText}>
                {autoAccept ? 'Tự động nhận chuyến' : 'Nhận chuyến thủ công'}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="car-outline" size={24} color="#4285F4" />
            <Text style={styles.statNumber}>{profile?.stats?.totalTrips || 0}</Text>
            <Text style={styles.statLabel}>Tổng chuyến</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="cash-outline" size={24} color="#4CAF50" />
            <Text style={styles.statNumber}>{formatCurrency(profile?.stats?.totalEarnings || 0)}</Text>
            <Text style={styles.statLabel}>Tổng thu nhập</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="time-outline" size={24} color="#FF9800" />
            <Text style={styles.statNumber}>{profile?.stats?.totalHours || 0}h</Text>
            <Text style={styles.statLabel}>Tổng giờ lái</Text>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.settingsContainer}>
          <Text style={styles.sectionTitle}>Cài đặt</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="radio-button-on" size={20} color="#4285F4" />
              <Text style={styles.settingText}>Chế độ nhận chuyến</Text>
            </View>
            <Switch
              value={isOnline}
              onValueChange={handleOnlineToggle}
              disabled={updating}
              trackColor={{ false: '#E0E0E0', true: '#4285F4' }}
              thumbColor={isOnline ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="flash" size={20} color="#FF9800" />
              <Text style={styles.settingText}>Tự động nhận chuyến</Text>
            </View>
            <Switch
              value={autoAccept}
              onValueChange={handleAutoAcceptToggle}
              disabled={updating}
              trackColor={{ false: '#E0E0E0', true: '#FF9800' }}
              thumbColor={autoAccept ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>
        </View>

        {/* Vehicle Information */}
        {profile?.vehicle && (
          <View style={styles.vehicleContainer}>
            <Text style={styles.sectionTitle}>Thông tin xe</Text>
            <View style={styles.vehicleCard}>
              <View style={styles.vehicleRow}>
                <Text style={styles.vehicleLabel}>Hãng xe:</Text>
                <Text style={styles.vehicleValue}>{profile.vehicle.brand}</Text>
              </View>
              <View style={styles.vehicleRow}>
                <Text style={styles.vehicleLabel}>Dòng xe:</Text>
                <Text style={styles.vehicleValue}>{profile.vehicle.model}</Text>
              </View>
              <View style={styles.vehicleRow}>
                <Text style={styles.vehicleLabel}>Biển số:</Text>
                <Text style={styles.vehicleValue}>{profile.vehicle.licensePlate}</Text>
              </View>
              <View style={styles.vehicleRow}>
                <Text style={styles.vehicleLabel}>Số chỗ:</Text>
                <Text style={styles.vehicleValue}>{profile.vehicle.seats} chỗ</Text>
              </View>
              <View style={styles.vehicleRow}>
                <Text style={styles.vehicleLabel}>Màu xe:</Text>
                <Text style={styles.vehicleValue}>{profile.vehicle.color}</Text>
              </View>
              <View style={styles.vehicleRow}>
                <Text style={styles.vehicleLabel}>Năm sản xuất:</Text>
                <Text style={styles.vehicleValue}>{profile.vehicle.year}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Recent Activity */}
        <View style={styles.activityContainer}>
          <Text style={styles.sectionTitle}>Hoạt động gần đây</Text>
          {profile?.recentTrips?.length > 0 ? (
            profile.recentTrips.map((trip, index) => (
              <View key={index} style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Ionicons name="car" size={20} color="#4285F4" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>
                    Chuyến đi đến {trip.endLocation?.address || 'N/A'}
                  </Text>
                  <Text style={styles.activitySubtitle}>
                    {formatDate(trip.completedAt)} • {formatCurrency(trip.earnings || 0)}
                  </Text>
                </View>
                <View style={styles.activityRating}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={styles.activityRatingText}>
                    {trip.rating?.toFixed(1) || 'N/A'}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyActivity}>
              <Ionicons name="time-outline" size={48} color="#ccc" />
              <Text style={styles.emptyActivityText}>Chưa có hoạt động</Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('DriverHistory')}
          >
            <Ionicons name="time-outline" size={20} color="#4285F4" />
            <Text style={styles.actionBtnText}>Xem lịch sử</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('DriverEarnings')}
          >
            <Ionicons name="cash-outline" size={20} color="#4CAF50" />
            <Text style={styles.actionBtnText}>Xem thu nhập</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('DriverSettings')}
          >
            <Ionicons name="settings-outline" size={20} color="#FF9800" />
            <Text style={styles.actionBtnText}>Cài đặt nâng cao</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="white" />
          <Text style={styles.logoutBtnText}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#4285F4',
    paddingTop: StatusBar.currentHeight || 44,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  editBtn: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  profilePhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  ratingCount: {
    fontSize: 12,
    color: '#666',
  },
  statusContainer: {
    gap: 12,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  settingsContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 16,
    color: '#333',
  },
  vehicleContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  vehicleCard: {
    gap: 12,
  },
  vehicleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vehicleLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  vehicleValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  activityContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  activitySubtitle: {
    fontSize: 12,
    color: '#666',
  },
  activityRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activityRatingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  emptyActivity: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyActivityText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  actionsContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    gap: 12,
  },
  actionBtnText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  logoutBtn: {
    backgroundColor: '#FF5722',
    margin: 16,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
});

export default DriverProfileScreen;
