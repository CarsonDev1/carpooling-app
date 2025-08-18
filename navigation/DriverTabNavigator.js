import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from '@rneui/themed';

// Import driver screens
import DriverHomeScreen from '../screens/DriverHomeScreen';
import DriverProfileScreen from '../screens/DriverProfileScreen';
import DriverEarningsScreen from '../screens/DriverEarningsScreen';
import DriverHistoryScreen from '../screens/DriverHistoryScreen';

const Tab = createBottomTabNavigator();

const DriverTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'DriverHome') {
            iconName = focused ? 'home' : 'home-outline';
          }
          return <Icon name={iconName} type="ionicon" size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4285F4',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="DriverHome"
        component={DriverHomeScreen}
        options={{
          title: 'Trang chủ',
          tabBarLabel: 'Trang chủ',
        }}
      />
    </Tab.Navigator>
  );
};

export default DriverTabNavigator;
