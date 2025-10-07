import React, { useEffect } from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppProvider } from './redux/store';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native'
import { useDispatch, useSelector } from 'react-redux';
import { registerFcmToken } from './services/fcm';
import { SafeAreaView, Pressable, View, Text, TouchableOpacity } from 'react-native';
import { fetchNotification } from './redux/thunks/notificationThunk';
import { pushRealTime } from './redux/slices/notificationSlice';
import { selectUnread } from './redux/selector'
import './global.css';
import HomeScreen from './screens/HomeScreen';
import MetricVisualizer from './screens/MetricVisualizer';
import AgriManagerScreen from './screens/AgriManagerRN';
import QualityCheckScreen from './screens/QualityCheckScreen';
import DeviceControl from './screens/DeviceControl';
import NotificationsScreen from './screens/NotificationsScreen';
import { ensureNotificationPermission } from './services/notification-permission';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function NotificationBell({ navigation }) {
  const unread = useSelector(selectUnread);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchNotification({ page: 1, limit: 5, read: 'all', sort: '-ctime' }));
    return () => { }
  }, [dispatch]);
  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('NotificationsScreen')}
      style={{ padding: 6, marginRight: 8 }}>
      <View>
        <Ionicons name="notifications-outline" size={22} color="#fff" />
        {unread > 0 && (
          <View style={{
            position: 'absolute', top: -4, right: -4, backgroundColor: '#ef4444',
            borderRadius: 10, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3
          }}>
            <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>{unread > 99 ? '99' : unread}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>)
}
function NotifBootstrap({ navigation }) {
  const dispatch = useDispatch();
  useEffect(() => {
    const ok = ensureNotificationPermission();
    const userId = 'user001';
    registerFcmToken(userId).catch((err) => {
      console.error('[FCM] registerFcmToken failed', err);
    });
    (async () => {
      try {
        await notifee.createChannel({
          id: 'high-priority',
          name: 'High Priority',
          importance: AndroidImportance.HIGH,
        })
      } catch (_) {

      }
    })()
    const unsubMsg = messaging().onMessage(async remoteMessage => {
      console.log('remoteMessage', remoteMessage);
      const notif = {
        _id: remoteMessage?.data?.notificationId || remoteMessage?.data?._id || Date.now().toString(),
        title: remoteMessage?.notification?.title || remoteMessage?.data?.title,
        body: remoteMessage?.notification?.body || remoteMessage?.data?.body,
        data: remoteMessage?.data || {},
        createdAt: new Date().toISOString(),
        read: false
      };
      dispatch(pushRealTime(notif));

      await notifee.displayNotification({
        title: notif.title || 'Thông báo',
        body: notif.body || '',
        android: { channelId: 'high-priority', pressAction: { id: 'default' } },
        data: notif.data
      });

    });
    const unsubNotifeeFG = notifee.onForegroundEvent(async ({ type, detail }) => {
      if (type === EventType.PRESS) {
        const hcid = detail?.notification?.data?.healthCheckId || detail?.notification?.data?.hcid;
        if (hcid) navigation.navigate('Quanlitys', { hcid });
      }
    });

    (async () => {
      const initialFirebase = await messaging().getInitialNotification();
      const hcidFromFirebase = initialFirebase?.data?.healthCheckId || initialFirebase?.data?.hcid;
      if (hcidFromFirebase) {
        navigation.navigate('Quanlitys', { hcid: hcidFromFirebase });
      }
    })();

    return () => { unsubMsg(); unsubNotifeeFG(); };
  }, [dispatch, navigation]);
  return null;
}

const CustomHeader = ({ route, navigation }) => {
  return (
    <SafeAreaView className="flex-row items-center bg-blue-500 p-4 justify-end mt-6">
      <NotificationBell navigation={navigation} />
    </SafeAreaView>
  );
};
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        header: ({ navigation }) => <CustomHeader route={route} navigation={navigation} />,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Overviews') {
            iconName = focused ? 'apps' : 'apps-outline';
          } else if (route.name === 'Charts') {
            iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          } else if (route.name === 'Quanlitys') {
            iconName = focused
              ? 'checkmark-circle'
              : 'checkmark-circle-outline';
          } else if (route.name === 'Managements') {
            iconName = focused ? 'server' : 'server-outline';
          } else if (route.name === 'Devices') {
            iconName = focused ? 'game-controller' : 'game-controller-outline';
          } else {
            iconName = focused ? 'nav-icon-grid-a' : 'nav-icon-grid-a';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0084ff',
        tabBarInactiveTintColor: 'gray',
      })}>
      <Tab.Screen
        name="Overviews"
        component={HomeScreen}
        options={{ tabBarLabel: 'Tổng quan' }}
      />
      <Tab.Screen
        name="Charts"
        component={MetricVisualizer}
        options={{ tabBarLabel: 'Biểu đồ' }}
      />
      <Tab.Screen
        name="Devices"
        component={DeviceControl}
        options={{ tabBarLabel: 'Thiết bị' }}
      />
      <Tab.Screen
        name="Quanlitys"
        component={QualityCheckScreen}
        options={{ tabBarLabel: 'Nông sản' }}
      />
      <Tab.Screen
        name="Managements"
        component={AgriManagerScreen}
        options={{ tabBarLabel: 'Quản lý nông sản' }}
      />
    </Tab.Navigator>
  );
};

function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="MainTabs"
            component={MainTabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="NotificationsScreen"
            component={NotificationsScreen}
            options={{ title: 'Thông báo' }}
          />
        </Stack.Navigator>
        <RootBootstrap />
      </NavigationContainer>
      <Toast />
    </AppProvider>
  );
}
function RootBootstrap() {
  const navigation = useNavigation();
  return <NotifBootstrap navigation={navigation} />
}
export default App;
