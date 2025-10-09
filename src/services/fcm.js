import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import instance from '../config/axios.config';
import { Platform } from 'react-native';
async function getInstallationId() {
    const KEY = 'INSTALLATION_ID';
    let id = await AsyncStorage.getItem(KEY);
    if (!id) {
        id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
        await AsyncStorage.setItem(KEY, id);
    }
    return id;
}
export async function registerFcmToken(userId) {
    try {
        const platform =
            Platform.OS === 'ios' ? 'ios' :
                Platform.OS === 'android' ? 'android' : 'web';
        await messaging().registerDeviceForRemoteMessages();
        await messaging().requestPermission();
        const [token, installationId] = await Promise.all([
            messaging().getToken(),
            getInstallationId()
        ])
        console.log('[FCM] getToken =', token);

        if (!token) {
            console.warn('[FCM] No token returned!');
            return;
        }
        const res = await instance.post('/users/fcm-token', { token, installationId, userId, platform });
        console.log('[FCM] POST /users/fcm-token status =', res?.status);

        // Refresh token lifecycle
        messaging().onTokenRefresh(async (newToken) => {
            try {
                console.log('[FCM] onTokenRefresh =', newToken);
                const instId = await getInstallationId();
                await instance.post('/users/fcm-token', { token: newToken, userId, installationId: instId, platform });
            } catch (e) {
                console.error('[FCM] onTokenRefresh error =', e?.response?.status, e?.message);
            }
        });
    } catch (e) {
        console.error('[FCM] registerFcmToken error =', e?.response?.status, e?.message);
    }
}
