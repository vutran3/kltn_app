import React from 'react';
import {NavigationContainer, useNavigation} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {AppProvider} from './redux/store';
import Ionicons from 'react-native-vector-icons/Ionicons';
import './global.css';
import HomeScreen from './screens/HomeScreen';
import MetricVisualizer from './screens/MetricVisualizer';
import AgriManagerScreen from './screens/AgriManagerRN';
import {SafeAreaView} from 'react-native';
import QualityCheckScreen from './screens/QualityCheckScreen';
import DeviceControl from './screens/DeviceControl';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const CustomHeader = ({route}) => {
  return (
    <SafeAreaView className="flex-row items-center bg-blue-500 p-4"></SafeAreaView>
  );
};

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        header: () => <CustomHeader route={route} />,
        tabBarIcon: ({focused, color, size}) => {
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
        options={{tabBarLabel: 'Tổng quan'}}
      />
      <Tab.Screen
        name="Charts"
        component={MetricVisualizer}
        options={{tabBarLabel: 'Biểu đồ'}}
      />
      <Tab.Screen
        name="Devices"
        component={DeviceControl}
        options={{tabBarLabel: 'Thiết bị'}}
      />
      <Tab.Screen
        name="Quanlitys"
        component={QualityCheckScreen}
        options={{tabBarLabel: 'Nông sản'}}
      />
      <Tab.Screen
        name="Managements"
        component={AgriManagerScreen}
        options={{tabBarLabel: 'Quản lý nông sản'}}
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
            options={{headerShown: false}}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}

export default App;
