// navigation/AppNavigator.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Icon } from "@rneui/themed";
import { useAuth } from "../context/AuthContext";

// Import screens
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import ForgotPasswordScreen from "../screens/auth/ForgotPasswordScreen";
import ProfileScreen from "../screens/ProfileScreen";
import LoadingScreen from "../screens/LoadingScreen"; // Main loading screen
import HomeScreen from "../screens/HomeScreen";
import OTPScreen from "../screens/auth/OTPScreen";
import SetPasswordScreen from "../screens/auth/SetPasswordScreen";
import RegisterSuccessScreen from "../screens/auth/RegisterSuccessScreen";
import OTPPassWordScreen from "../screens/auth/OTPPassWordScreen";
import LoadingAuthScreen from "../screens/auth/LoadingAuthScreen"; // Auth loading screen
import ScheduleScreen from "../screens/ScheduleScreen";
import HistoryScreen from "../screens/HistoryScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import SettingsScreen from "../screens/SettingScreen";
import LanguageScreen from "../screens/LanguageScreen";
import NotificationSettings from "../screens/NotificationSettings";
import PrivacySettings from "../screens/PrivacySettings";
import ChangePasswordScreen from "../screens/ChangePasswordScreen";
import RewardsScreen from "../screens/RewardsScreen";
import HelpCenterScreen from "../screens/HelpCenterScreen";
import PrivacyPolicyScreen from "../screens/PrivacyPolicyScreen";
import DeleteAccountScreen from "../screens/DeleteAccountScreen";
import PaymentScreen from "../screens/PaymentScreen";
import ProfileDetailScreen from "../screens/ProfileDetailScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import SimilarTripsScreen from "../screens/SimilarTripsScreen";
import WaitingMatchScreen from "../screens/WaitingMatchScreen";
import TripDetailScreen from "../screens/TripDetailScreen";
import TripInProgressScreen from "../screens/TripInProgressScreen";
import CreateTripScreen from "../screens/CreateTripScreen";
import WaitingForDriverScreen from "../screens/WaitingForDriverScreen";
import DriverRegistrationScreen from "../screens/DriverRegistrationScreen";
import DriverRequestsScreen from "../screens/DriverRequestsScreen";
import DriverHomeScreen from "../screens/DriverHomeScreen";
// Removed driver-specific tabs/screens per request
import PaymentSuccessScreen from "../screens/PaymentSuccessScreen";
import NavigationScreen from '../screens/NavigationScreen';
import WalletScreen from "../screens/WalletScreen";
import FavoritesScreen from "../screens/FavoritesScreen";
import CarpoolBrowseScreen from "../screens/CarpoolBrowseScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Root Stack Navigator
const RootStack = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        // Authenticated Stack
        <Stack.Screen name="MainApp" component={MainTabs} />
      ) : (
        // Auth Stack
        <>
          <Stack.Screen name="AuthLoading" component={LoadingAuthScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
          />
          <Stack.Screen
            name="OTP"
            component={OTPScreen}
            options={{ title: "Xác minh OTP" }}
          />
          <Stack.Screen name="SetPassword" component={SetPasswordScreen} />
          <Stack.Screen
            name="RegisterSuccess"
            component={RegisterSuccessScreen}
          />
          <Stack.Screen name="OTPPassWord" component={OTPPassWordScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

// Home Stack Navigator
const HomeStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#4285F4",
        },
        headerTintColor: "white",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ title: "2GETHER" }}
      />
      <Stack.Screen
        name="Schedule"
        component={ScheduleScreen}
        options={{ title: "Lịch trình" }}
      />
      <Stack.Screen
        name="Loading"
        component={LoadingScreen}
        options={{
          headerShown: false,
          title: "Đang tải...",
        }}
      />
      <Stack.Screen
        name="CreateTrip"
        component={CreateTripScreen}
        options={{ title: "Tạo chuyến đi", headerShown: false }}
      />
      <Stack.Screen
        name="SimilarTrips"
        component={SimilarTripsScreen}
        options={{ title: "Lộ trình tương tự", headerShown: false }}
      />
      <Stack.Screen
        name="WaitingMatch"
        component={WaitingMatchScreen}
        options={{ title: "Đang chờ", headerShown: false }}
      />
      <Stack.Screen
        name="CarpoolBrowse"
        component={CarpoolBrowseScreen}
        options={{ title: "Đi nhờ chuyến", headerShown: false }}
      />
      <Stack.Screen
        name="TripDetail"
        component={TripDetailScreen}
        options={{ title: "Chi tiết lộ trình", headerShown: false }}
      />
      <Stack.Screen
        name="TripInProgress"
        component={TripInProgressScreen}
        options={{ title: "Đang di chuyển", headerShown: false }}
      />

      <Stack.Screen
        name="WaitingForDriver"
        component={WaitingForDriverScreen}
        options={{ title: "Chờ tài xế", headerShown: false }}
      />
      <Stack.Screen
        name="DriverRegistration"
        component={DriverRegistrationScreen}
        options={{ title: "Đăng ký tài xế", headerShown: false }}
      />
      <Stack.Screen
        name="DriverRequests"
        component={DriverRequestsScreen}
        options={{ title: "Yêu cầu chuyến đi", headerShown: false }}
      />
      <Stack.Screen
        name="DriverHome"
        component={DriverHomeScreen}
        options={{ title: "Tài xế", headerShown: false }}
      />
      {/* Driver profile/earnings/history screens removed */}
      <Stack.Screen
        name="PaymentSuccess"
        component={PaymentSuccessScreen}
        options={{ title: "Thanh toán thành công", headerShown: false }}
      />
      <Stack.Screen
        name="Navigation"
        component={NavigationScreen}
        options={{
          title: "Điều hướng",
          headerShown: false
        }}
      />
      <Stack.Screen
        name="Wallet"
        component={WalletScreen}
        options={{ title: "Ví điện tử", headerShown: false }}
      />
    </Stack.Navigator>
  );
};

// Profile Stack Navigator
const ProfileStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#4285F4",
        },
        headerTintColor: "white",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{ title: "Cá nhân", headerShown: false }}
      />
      <Stack.Screen
        name="Setting"
        component={SettingsScreen}
        options={{ title: "Cài đặt", headerShown: false }}
      />
      <Stack.Screen
        name="Language"
        component={LanguageScreen}
        options={{ title: "Ngôn ngữ", headerShown: false }}
      />
      <Stack.Screen
        name="NotificationSettings"
        component={NotificationSettings}
        options={{ title: "Thông báo", headerShown: false }}
      />
      <Stack.Screen
        name="PrivacySettings"
        component={PrivacySettings}
        options={{ title: "Riêng tư", headerShown: false }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ title: "Đổi mật khẩu", headerShown: false }}
      />
      <Stack.Screen
        name="Rewards"
        component={RewardsScreen}
        options={{ title: "Thưởng", headerShown: false }}
      />
      <Stack.Screen
        name="HelpCenter"
        component={HelpCenterScreen}
        options={{ title: "Trung tâm hỗ trợ", headerShown: false }}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{ title: "Quyền riêng tư", headerShown: false }}
      />
      <Stack.Screen
        name="DeleteAccount"
        component={DeleteAccountScreen}
        options={{ title: "Xóa tài khoản", headerShown: false }}
      />
      <Stack.Screen
        name="Payment"
        component={PaymentScreen}
        options={{ title: "Thanh toán", headerShown: false }}
      />
      <Stack.Screen
        name="ProfileDetail"
        component={ProfileDetailScreen}
        options={{ title: "Chi tiết", headerShown: false }}
      />
      <Stack.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{ title: "Địa điểm yêu thích", headerShown: false }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: "Cập nhật hồ sơ", headerShown: false }}
      />
    </Stack.Navigator>
  );
};

// History Stack Navigator
const HistoryStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#4285F4",
        },
        headerTintColor: "white",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen
        name="HistoryMain"
        component={HistoryScreen}
        options={{ title: "Lịch sử" }}
      />
    </Stack.Navigator>
  );
};

// Notifications Stack Navigator
const NotificationsStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#4285F4",
        },
        headerTintColor: "white",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen
        name="NotificationsMain"
        component={NotificationsScreen}
        options={{ title: "Thông báo" }}
      />
    </Stack.Navigator>
  );
};

// Wallet Stack Navigator
const WalletStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#4285F4",
        },
        headerTintColor: "white",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen
        name="WalletMain"
        component={WalletScreen}
        options={{ title: "Ví điện tử" }}
      />
    </Stack.Navigator>
  );
};

// Main Tab Navigator
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          let iconType = "material";

          if (route.name === "Home") {
            iconName = "home";
          } else if (route.name === "History") {
            iconName = "history";
          } else if (route.name === "Wallet") {
            iconName = "account-balance-wallet";
          } else if (route.name === "Notifications") {
            iconName = "notifications";
          } else if (route.name === "Profile") {
            iconName = "person";
          }

          return (
            <Icon name={iconName} type={iconType} size={size} color={color} />
          );
        },
        tabBarActiveTintColor: "#4285F4",
        tabBarInactiveTintColor: "#757575",
        tabBarStyle: {
          backgroundColor: "white",
          borderTopWidth: 1,
          borderTopColor: "#E0E0E0",
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{ tabBarLabel: "Trang chủ" }}
      />
      <Tab.Screen
        name="History"
        component={HistoryStack}
        options={{ tabBarLabel: "Lịch sử" }}
      />
      <Tab.Screen
        name="Wallet"
        component={WalletStack}
        options={{ tabBarLabel: "Ví" }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsStack}
        options={{ tabBarLabel: "Thông báo" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{ tabBarLabel: "Cá nhân" }}
        listeners={({ navigation }) => ({
          tabPress: () => {
            navigation.navigate('Profile', { screen: 'ProfileMain' });
          },
        })}
      />
    </Tab.Navigator>
  );
};

// Main App Navigator
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <RootStack />
    </NavigationContainer>
  );
};

export default AppNavigator;
