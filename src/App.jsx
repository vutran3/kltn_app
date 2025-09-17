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

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const CustomHeader = ({route}) => {
  return (
    <SafeAreaView className="flex-row items-center bg-blue-500 px-4 py-2"></SafeAreaView>
  );
};

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        header: () => <CustomHeader route={route} />,
        tabBarIcon: ({focused, color, size}) => {
          let iconName;

          if (route.name === 'Messages') {
            iconName = focused ? 'chatbubble' : 'chatbubble-outline';
          } else if (route.name === 'Contacts') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Groups') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Discover') {
            iconName = focused ? 'compass' : 'compass-outline';
          } else if (route.name === 'Me') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0084ff',
        tabBarInactiveTintColor: 'gray',
      })}>
      <Tab.Screen
        name="Messages"
        component={HomeScreen}
        options={{tabBarLabel: 'Tổng quan'}}
      />
      <Tab.Screen
        name="Contacts"
        component={MetricVisualizer}
        options={{tabBarLabel: 'Biểu đồ'}}
      />
      <Tab.Screen
        name="Groups"
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
