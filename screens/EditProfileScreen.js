import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../api/authApi';

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const { user, updateUser } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth || '');
  const [gender, setGender] = useState(user?.gender || '');
  const [saving, setSaving] = useState(false);

  const validate = () => {
    if (!fullName.trim()) {
      Alert.alert('Lỗi', 'Họ và tên không được để trống');
      return false;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert('Lỗi', 'Email không hợp lệ');
      return false;
    }
    if (dateOfBirth && !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
      Alert.alert('Lỗi', 'Ngày sinh phải có dạng YYYY-MM-DD');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      setSaving(true);
      const payload = {
        fullName: fullName.trim(),
        email: email.trim(),
        dateOfBirth: dateOfBirth.trim(),
        gender: gender.trim(),
      };
      // remove empty fields
      Object.keys(payload).forEach((k) => {
        if (!payload[k]) delete payload[k];
      });
      const res = await updateProfile(payload);
      if (res?.status === 'success') {
        if (res?.data?.user) updateUser(res.data.user);
        Alert.alert('Thành công', 'Cập nhật hồ sơ thành công', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Lỗi', res?.message || 'Cập nhật hồ sơ thất bại');
      }
    } catch (err) {
      Alert.alert('Lỗi', err?.message || 'Cập nhật hồ sơ thất bại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cập nhật hồ sơ</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.formGroup}>
          <Text style={styles.label}>Họ và tên</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập họ và tên"
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="email@domain.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.label}>Ngày sinh (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              placeholder="1990-01-01"
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Giới tính</Text>
          <View style={styles.genderRow}>
            {[
              { key: 'male', label: 'Nam' },
              { key: 'female', label: 'Nữ' },
              { key: 'other', label: 'Khác' },
            ].map((g) => (
              <TouchableOpacity
                key={g.key}
                style={[
                  styles.genderBtn,
                  gender === g.key && styles.genderBtnActive,
                ]}
                onPress={() => setGender(g.key)}
              >
                <Text style={[styles.genderText, gender === g.key && styles.genderTextActive]}>
                  {g.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>Lưu thay đổi</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
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
  headerBtn: { padding: 8, width: 32 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '600' },
  content: { padding: 16 },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 12, color: '#666', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  row: { flexDirection: 'row', gap: 12 },
  genderRow: { flexDirection: 'row', gap: 8 },
  genderBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#EEF2F7',
  },
  genderBtnActive: { backgroundColor: '#4285F4' },
  genderText: { color: '#333', fontSize: 13, fontWeight: '600' },
  genderTextActive: { color: '#fff' },
  saveBtn: {
    marginTop: 8,
    backgroundColor: '#4285F4',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default EditProfileScreen;


