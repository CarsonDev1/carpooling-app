import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getAvailableCarpoolTrips } from '../api/tripsApi';

const CarpoolBrowseScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState([]);
  const [query, setQuery] = useState('');

  const loadTrips = async () => {
    try {
      setLoading(true);
      const res = await getAvailableCarpoolTrips({});
      if (res?.success) setTrips(res.data || []);
    } catch (e) {
      Alert.alert('Lỗi', e?.message || 'Không thể tải danh sách đi nhờ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTrips(); }, []);

  const filtered = trips.filter(t => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      (t.startLocation?.address || '').toLowerCase().includes(q) ||
      (t.endLocation?.address || '').toLowerCase().includes(q)
    );
  });

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('TripDetail', { tripId: item._id })}>
      <View style={styles.row}>
        <Ionicons name="radio-button-on" size={14} color="#4285F4" />
        <Text style={styles.addr} numberOfLines={1}>{item.startLocation?.address}</Text>
      </View>
      <View style={styles.row}>
        <Ionicons name="location" size={14} color="#F44336" />
        <Text style={styles.addr} numberOfLines={1}>{item.endLocation?.address}</Text>
      </View>
      <View style={styles.meta}>
        <Text style={styles.metaText}>Giờ đi: {item.departureTime ? new Date(item.departureTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '—'}</Text>
        <Text style={styles.metaText}>Còn: {item.availableSeats - (item.passengers?.length || 0)} chỗ</Text>
        <Text style={[styles.metaText, { color: '#4CAF50', fontWeight: '700' }]}>
          {item.pricePerSeat?.toLocaleString('vi-VN') || '0'}đ/chỗ
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.hBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Đi nhờ chuyến</Text>
        <View style={styles.hBtn} />
      </View>

      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm theo địa chỉ đi/đến"
          value={query}
          onChangeText={setQuery}
        />
        <TouchableOpacity onPress={loadTrips}>
          <Ionicons name="refresh" size={18} color="#4285F4" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loading}><ActivityIndicator size="large" color="#4285F4" /></View>
      ) : (
        <FlatList data={filtered} keyExtractor={i => i._id} renderItem={renderItem} contentContainerStyle={{ padding: 16 }} />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { backgroundColor: '#4285F4', paddingTop: StatusBar.currentHeight || 44, paddingBottom: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hBtn: { padding: 8, width: 32 },
  title: { color: '#fff', fontSize: 18, fontWeight: '600' },
  searchRow: { flexDirection: 'row', backgroundColor: '#fff', margin: 16, borderRadius: 10, alignItems: 'center', paddingHorizontal: 10, gap: 8, borderWidth: 1, borderColor: '#E0E0E0' },
  searchInput: { flex: 1, paddingVertical: 10 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#E0E0E0', marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  addr: { flex: 1, color: '#333' },
  meta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  metaText: { color: '#666', fontSize: 12 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default CarpoolBrowseScreen;


