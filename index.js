/**
 * @format
 */
import messaging from '@react-native-firebase/messaging';
import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';
import notifee, { AndroidImportance } from '@notifee/react-native'
messaging().setBackgroundMessageHandler(async remoteMessage => {
    const title = remoteMessage?.notification?.title || remoteMessage?.data?.title || 'Thông báo';
    const body = remoteMessage?.notification?.body || remoteMessage?.data?.body || '';
    const channelId = await notifee.createChannel({
        id: 'high-priority',
        name: 'High Priority',
        importance: AndroidImportance.HIGH
    });
    await notifee.displayNotification({
        title,
        body,
        android: { channelId, pressAction: { id: 'default' } },
        data: remoteMessage?.data || {}
    });
    notifee.onBackgroundEvent(async ({ type, detail }) => {
        if (type === EventType.PRESS) {
            // Ví dụ log:
            // console.log('[Notifee BG PRESS]', detail?.notification?.data);
            // Điều hướng sẽ làm ở App.jsx bằng getInitialNotification()
        }
    })
});

AppRegistry.registerComponent(appName, () => App);
