import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../api/authApi';

const FavoritesScreen = () => {
  const navigation = useNavigation();
  const { user, updateUser } = useAuth();
  const [favorites, setFavorites] = useState(Array.isArray(user?.addresses) ? user.addresses : []);
  const [modalVisible, setModalVisible] = useState(false);
  const [label, setLabel] = useState('');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);

  const resetForm = () => {
    setLabel('');
    setAddress('');
    setLat('');
    setLng('');
    setEditingIndex(-1);
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (index) => {
    const item = favorites[index];
    setLabel(item.label || '');
    setAddress(item.address || '');
    setLat(String(item.coordinates?.lat ?? ''));
    setLng(String(item.coordinates?.lng ?? ''));
    setEditingIndex(index);
    setModalVisible(true);
  };

  const validate = () => {
    if (!label.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập nhãn (ví dụ: Nhà, Công ty)');
      return false;
    }
    if (!address.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ');
      return false;
    }
    const latNum = Number(lat);
    const lngNum = Number(lng);
    if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) {
      Alert.alert('Lỗi', 'Vĩ độ/kinh độ không hợp lệ');
      return false;
    }
    if (latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
      Alert.alert('Lỗi', 'Vĩ độ phải trong [-90,90], kinh độ trong [-180,180]');
      return false;
    }
    return true;
  };

  const persistFavorites = async (newFavorites) => {
    try {
      setSaving(true);
      const res = await updateProfile({ addresses: newFavorites });
      if (res?.status === 'success' && res?.data?.user) {
        updateUser(res.data.user);
        setFavorites(Array.isArray(res.data.user.addresses) ? res.data.user.addresses : []);
        setModalVisible(false);
        resetForm();
      } else {
        Alert.alert('Lỗi', res?.message || 'Không thể lưu địa điểm yêu thích');
      }
    } catch (e) {
      Alert.alert('Lỗi', e?.message || 'Không thể lưu địa điểm yêu thích');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!validate()) return;
    const item = {
      label: label.trim(),
      address: address.trim(),
      coordinates: { lat: Number(lat), lng: Number(lng) },
    };
    const newFavorites = [...favorites];
    if (editingIndex >= 0) newFavorites[editingIndex] = item;
    else newFavorites.push(item);
    await persistFavorites(newFavorites);
  };

  const handleDelete = async (index) => {
    Alert.alert('Xác nhận', 'Xóa địa điểm này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa', style: 'destructive', onPress: async () => {
          const newFavorites = favorites.filter((_, i) => i !== index);
          await persistFavorites(newFavorites);
        }
      },
    ]);
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.item}>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemLabel}>{item.label}</Text>
        <Text style={styles.itemAddress} numberOfLines={2}>{item.address}</Text>
        <Text style={styles.itemCoords}>({item.coordinates?.lat}, {item.coordinates?.lng})</Text>
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => openEditModal(index)}>
          <Ionicons name="create-outline" size={18} color="#4285F4" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(index)}>
          <Ionicons name="trash-outline" size={18} color="#F44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Địa điểm yêu thích</Text>
        <TouchableOpacity style={styles.headerBtn} onPress={openAddModal}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={favorites}
        keyExtractor={(item, idx) => `${item.label}-${idx}`}
        contentContainerStyle={styles.list}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="bookmark-outline" size={48} color="#CCC" />
            <Text style={styles.emptyText}>Chưa có địa điểm nào. Nhấn "+" để thêm.</Text>
          </View>
        }
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editingIndex >= 0 ? 'Sửa địa điểm' : 'Thêm địa điểm'}</Text>

            <Text style={styles.label}>Nhãn</Text>
            <TextInput style={styles.input} placeholder="Nhà, Công ty..." value={label} onChangeText={setLabel} />

            <Text style={styles.label}>Địa chỉ</Text>
            <TextInput style={styles.input} placeholder="Số nhà, đường, phường..." value={address} onChangeText={setAddress} />

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Vĩ độ (lat)</Text>
                <TextInput style={styles.input} placeholder="10.7626" value={lat} onChangeText={setLat} keyboardType="numeric" />
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Kinh độ (lng)</Text>
                <TextInput style={styles.input} placeholder="106.6602" value={lng} onChangeText={setLng} keyboardType="numeric" />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => { setModalVisible(false); resetForm(); }}>
                <Text style={styles.cancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={handleSave} disabled={saving}>
                <Text style={styles.saveText}>{saving ? 'Đang lưu...' : 'Lưu'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: {
    backgroundColor: '#4285F4',
    paddingTop: StatusBar.currentHeight || 44,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerBtn: { padding: 8 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '600' },
  list: { padding: 16 },
  item: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
  },
  itemLabel: { fontSize: 16, fontWeight: '700', color: '#333' },
  itemAddress: { marginTop: 4, color: '#555' },
  itemCoords: { marginTop: 4, color: '#999', fontSize: 12 },
  itemActions: { justifyContent: 'center', alignItems: 'center' },
  iconBtn: { padding: 8 },
  empty: { alignItems: 'center', padding: 40 },
  emptyText: { marginTop: 8, color: '#888' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 16 },
  modalCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16 },
  modalTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  label: { fontSize: 12, color: '#666', marginBottom: 6, marginTop: 6 },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10, backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16, gap: 12 },
  modalBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  cancelBtn: { backgroundColor: '#F5F5F5' },
  saveBtn: { backgroundColor: '#4285F4' },
  cancelText: { color: '#666', fontWeight: '600' },
  saveText: { color: '#fff', fontWeight: '700' },
});

export default FavoritesScreen;


