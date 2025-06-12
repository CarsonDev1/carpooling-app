import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

const passengerData = [
  {
    from: '129 Phạm Ngọc Thạch, Đống Đa',
    to: '77 Hào Nam, Ô Chợ Dừa, Đống Đa,...',
    time: '14:50',
    date: '21/2/2025',
    price: '20.000',
  },
  {
    from: 'Ngõ 38, Đan Phượng, Phượng Trì,...',
    to: 'Số 6 Đào Duy Anh, Hà Nội',
    time: '14:50',
    date: '21/2/2025',
    price: '35.000',
  },
  {
    from: '10 Võ Văn Kiệt, TP. Hồ Chí Minh',
    to: 'Đại học FPT Khu Công Nghệ Cao',
    time: '14:50',
    date: '21/2/2025',
    price: '120.000',
  },
  {
    from: '8 Trần Hưng Đạo, Đà Lạt',
    to: '55 Hoàng Hoa Thám, Đà Lạt',
    time: '14:50',
    date: '21/2/2025',
    price: '97.000',
  },
  {
    from: '15 Lý Tự Trọng, Nha Trang',
    to: '77 Nguyễn Văn Cừ, Nha Trang',
    time: '14:50',
    date: '21/2/2025',
    price: '89.000',
  },
  {
    from: 'Số 26 Quang Trung, Hoàn Kiếm',
    to: 'Số 17 Lý Nam Đế, Hoàn Kiếm',
    time: '14:50',
    date: '21/2/2025',
    price: '78.000',
  },
  {
    from: 'Số 10 Cầu Gỗ, Hoàn Kiếm',
    to: 'Số 29 Lý Thường Kiệt, Hoàn Kiếm',
    time: '14:50',
    date: '21/2/2025',
    price: '65.000',
  },
  {
    from: 'Số 15 Trần Quang Khải, Hoàn Kiếm',
    to: 'Số 31 Nguyễn Thái Học, Ba Đình',
    time: '14:50',
    date: '21/2/2025',
    price: '87.000',
  },
  {
    from: 'Số 88 Tràng Tiền, Hoàn Kiếm',
    to: 'Số 88 Tràng Tiền, Hoàn Kiếm',
    time: '14:50',
    date: '21/2/2025',
    price: '35.000',
  },
];

const driverData = [
  {
    from: '129 Phạm Ngọc Thạch, Đống Đa',
    to: '77 Hào Nam, Ô Chợ Dừa, Đống Đa,...',
    time: '14:50',
    date: '21/2/2025',
    price: '12.000',
  },
  {
    from: 'Ngõ 38, Đan Phượng, Phượng Trì,...',
    to: 'Số 6 Đào Duy Anh, Hà Nội',
    time: '14:50',
    date: '21/2/2025',
    price: '29.000',
  },
  {
    from: '10 Võ Văn Kiệt, TP. Hồ Chí Minh',
    to: 'Đại học FPT Khu Công Nghệ Cao',
    time: '14:50',
    date: '21/2/2025',
    price: '98.000',
  },
  {
    from: '8 Trần Hưng Đạo, Đà Lạt',
    to: '55 Hoàng Hoa Thám, Đà Lạt',
    time: '14:50',
    date: '21/2/2025',
    price: '75.000',
  },
  {
    from: '15 Lý Tự Trọng, Nha Trang',
    to: '77 Nguyễn Văn Cừ, Nha Trang',
    time: '14:50',
    date: '21/2/2025',
    price: '77.000',
  },
  {
    from: 'Số 26 Quang Trung, Hoàn Kiếm',
    to: 'Số 17 Lý Nam Đế, Hoàn Kiếm',
    time: '14:50',
    date: '21/2/2025',
    price: '76.000',
  },
  {
    from: 'Số 10 Cầu Gỗ, Hoàn Kiếm',
    to: 'Số 29 Lý Thường Kiệt, Hoàn Kiếm',
    time: '14:50',
    date: '21/2/2025',
    price: '54.000',
  },
  {
    from: 'Số 15 Trần Quang Khải, Hoàn Kiếm',
    to: 'Số 31 Nguyễn Thái Học, Ba Đình',
    time: '14:50',
    date: '21/2/2025',
    price: '64.000',
  },
  {
    from: 'Số 88 Tràng Tiền, Hoàn Kiếm',
    to: 'Số 88 Tràng Tiền, Hoàn Kiếm',
    time: '14:50',
    date: '21/2/2025',
    price: '23.000',
  },
];

const HistoryScreen = () => {
    const [tab, setTab] = useState('hanhkhach'); 

    const renderList = (dataList) => (
    <ScrollView style={styles.list}>
      {dataList.map((item, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.place}>{item.from}</Text>
          <View style={styles.row}>
            <Text style={styles.arrow}>↓</Text>
            <Text style={styles.place}>{item.to}</Text>
          </View>
          <View style={styles.footerRow}>
            <View>
              <Text style={styles.subInfo}>{item.time}</Text>
              <Text style={styles.subInfo}>{item.date}</Text>
            </View>
            <View style={styles.rightActions}>
              <Text style={styles.price}>{item.price}</Text>
              <TouchableOpacity>
                <Text style={styles.reorder}>Đặt lại →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'hanhkhach' && styles.activeTab]}
          onPress={() => setTab('hanhkhach')}>
          <Text
            style={[styles.tabText, tab === 'hanhkhach' && styles.activeTabText]}>
            Hành khách
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'taixe' && styles.activeTab]}
          onPress={() => setTab('taixe')}>
          <Text style={[styles.tabText, tab === 'taixe' && styles.activeTabText]}>
            Tài xế
          </Text>
        </TouchableOpacity>
      </View>

      {tab === 'hanhkhach' ? renderList(passengerData) : renderList(driverData)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F2',
    margin: 16,
    borderRadius: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: '#fff',
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    color: '#777',
  },
  activeTabText: {
    color: '#000',
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 18,
    marginRight: 4,
    color: '#888',
  },
  place: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  footerRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subInfo: {
    fontSize: 12,
    color: '#777',
  },
  rightActions: {
    alignItems: 'flex-end',
  },
  price: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#000',
  },
  reorder: {
    fontSize: 12,
    color: '#007BFF',
    marginTop: 4,
  },
});

export default HistoryScreen;
