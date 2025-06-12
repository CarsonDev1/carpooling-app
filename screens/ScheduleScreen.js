import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';

const trips = {
  '24/6': [
    {
      from: 'Nhà',
      to: '77 Hào Nam, Ô Chợ Dừa, Đống Đa,...',
      time: '14:50',
      status: 'Đã ghép',
      dotColor: 'yellow',
    },
    {
      from: 'Nhà',
      to: 'Tôn Đức Thắng, Quốc Tử Giám,...',
      time: '08:00',
      status: 'Đã ghép',
      dotColor: 'blue',
    },
  ],
  '25/6': [
    {
      from: 'Nhà',
      to: 'Kim Mã, Ba Đình,...',
      time: '13:20',
      status: 'Đã ghép',
      dotColor: 'yellow',
    },
    {
      from: 'Nhà',
      to: 'Đại Cồ Việt, Hai Bà Trưng,...',
      time: '09:30',
      status: 'Đã ghép',
      dotColor: 'blue',
    },
    {
      from: 'Nhà',
      to: 'Nguyễn Trãi, Thanh Xuân,...',
      time: '17:45',
      status: 'Đã ghép',
      dotColor: 'yellow',
    },
  ],
  '26/6': [
    {
      from: 'Nhà',
      to: 'Láng Hạ, Đống Đa,...',
      time: '10:00',
      status: 'Đã ghép',
      dotColor: 'blue',
    },
    {
      from: 'Nhà',
      to: 'Xã Đàn, Đống Đa,...',
      time: '15:30',
      status: 'Đã ghép',
      dotColor: 'yellow',
    },
  ],
};

const ScheduleScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.header}></Text>
        {Object.entries(trips).map(([date, tripList]) => (
          <View key={date} style={styles.section}>
            <View style={styles.dateRow}>
              <Text style={styles.date}>{date}</Text>
              <View style={styles.separator} />
            </View>

            {tripList.map((trip, index) => (
              <View key={index} style={styles.card}>
                <View style={styles.tripInfo}>
                  <Text style={styles.place}>{trip.from}</Text>
                  <View style={styles.row}>
                    <View
                      style={[
                        styles.dot,
                        trip.dotColor === 'blue'
                          ? { backgroundColor: '#2196F3' }
                          : { backgroundColor: '#FFC107' },
                      ]}
                    />
                    <Text style={styles.address}>{trip.to}</Text>
                  </View>
                  <View style={styles.row}>
                    <View
                      style={[
                        styles.dot,
                        trip.dotColor === 'blue'
                          ? { backgroundColor: '#2196F3' }
                          : { backgroundColor: '#FFC107' },
                      ]}
                    />
                    <Text style={styles.time}>Khởi hành: {trip.time}</Text>
                  </View>
                </View>
                <View style={styles.rightSection}>
                  <Text style={styles.status}>{trip.status}</Text>
                  <TouchableOpacity>
                    <Text style={styles.link}>Kết nối →</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    marginVertical: 0,
  },
  section: {
    marginBottom: 16,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  date: {
    fontWeight: '700',
    fontSize: 22,
    marginRight: 8,
  },
  separator: {
    flex: 1,
    height: 1,
    backgroundColor: '#DADADA',
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  tripInfo: {
    flex: 1,
    paddingRight: 10,
  },
  place: {
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  address: {
    fontSize: 14,
    color: '#555',
    flexShrink: 1,
  },
  time: {
    fontSize: 13,
    color: '#777',
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  status: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1BC5BD',
  },
  link: {
    fontSize: 13,
    color: '#007BFF',
    marginTop: 8,
  },
});

export default ScheduleScreen;
