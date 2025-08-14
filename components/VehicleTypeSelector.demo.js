import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import VehicleTypeSelector from './VehicleTypeSelector';

// Demo data
const demoVehicleTypes = [
  {
    key: 'motorcycle',
    name: 'Xe máy',
    baseRate: 5000,
    description: 'Phù hợp cho 1-2 người, chi phí thấp',
    maxPassengers: 2
  },
  {
    key: 'car',
    name: 'Ô tô',
    baseRate: 10000,
    description: 'Phù hợp cho gia đình nhỏ hoặc nhóm 3-4 người',
    maxPassengers: 4
  },
  {
    key: 'suv',
    name: 'SUV/MPV',
    baseRate: 12000,
    description: 'Phù hợp cho nhóm 5-7 người và khoảng trống cho hành lý',
    maxPassengers: 7
  },
  {
    key: 'luxury',
    name: 'Xe sang',
    baseRate: 15000,
    description: 'Trải nghiệm cao cấp với xe hiện đại và thoải mái',
    maxPassengers: 4
  }
];

const demoEstimatedPrice = {
  estimatedPrice: 95000,
  estimatedDistance: 8.5,
  baseRate: 10000,
  vehicleType: 'car'
};

export default function VehicleTypeSelectorDemo() {
  const [selectedVehicleType, setSelectedVehicleType] = useState('car');
  const [estimatedPrice, setEstimatedPrice] = useState(demoEstimatedPrice);

  const handleVehicleTypeChange = (newVehicleType) => {
    setSelectedVehicleType(newVehicleType);
    console.log('Selected vehicle type:', newVehicleType);
  };

  const handlePriceUpdate = (newPriceData) => {
    setEstimatedPrice(newPriceData);
    console.log('Price updated:', newPriceData);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🚗 VehicleTypeSelector Demo</Text>
        <Text style={styles.subtitle}>Test component với dữ liệu demo</Text>
      </View>

      <View style={styles.content}>
        <VehicleTypeSelector
          vehicleTypes={demoVehicleTypes}
          selectedVehicleType={selectedVehicleType}
          onVehicleTypeChange={handleVehicleTypeChange}
          estimatedPrice={estimatedPrice}
          onPriceUpdate={handlePriceUpdate}
        />

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>📊 Thông tin hiện tại:</Text>
          <Text style={styles.infoText}>
            Loại xe: {selectedVehicleType}
          </Text>
          <Text style={styles.infoText}>
            Giá ước tính: {estimatedPrice.estimatedPrice?.toLocaleString('vi-VN')} VNĐ
          </Text>
          <Text style={styles.infoText}>
            Khoảng cách: {estimatedPrice.estimatedDistance}km
          </Text>
          <Text style={styles.infoText}>
            Base rate: {estimatedPrice.baseRate?.toLocaleString('vi-VN')} VNĐ/km
          </Text>
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
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoSection: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
});
