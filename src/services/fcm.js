import messaging from '@react-native-firebase/messaging';
import instance from '../config/axios.config';

export async function registerFcmToken(userId) {
    try {
        await messaging().registerDeviceForRemoteMessages();
        const authStatus = await messaging().requestPermission();
        console.log('[FCM] permission status =', authStatus);

        const token = await messaging().getToken();
        console.log('[FCM] getToken =', token);

        if (!token) {
            console.warn('[FCM] No token returned!');
            return;
        }
        const res = await instance.post('/users/fcm-token', { token, userId });
        console.log('[FCM] POST /users/fcm-token status =', res?.status);

        // Refresh token lifecycle
        messaging().onTokenRefresh(async (newToken) => {
            try {
                console.log('[FCM] onTokenRefresh =', newToken);
                const r = await instance.post('/users/fcm-token', { token: newToken, userId });
                console.log('[FCM] POST /users/fcm-token (refresh) status =', r?.status);
            } catch (e) {
                console.error('[FCM] onTokenRefresh error =', e?.response?.status, e?.message);
            }
        });
    } catch (e) {
        console.error('[FCM] registerFcmToken error =', e?.response?.status, e?.message);
    }
}
