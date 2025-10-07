import { Alert, Platform } from 'react-native';
import notifee, { AuthorizationStatus } from '@notifee/react-native';

/**
 * Kiểm tra quyền thông báo. Nếu chưa có, hiển thị prompt xin quyền.
 * Trả về true nếu đã có quyền (AUTHORIZED hoặc PROVISIONAL), ngược lại false.
 */
export async function ensureNotificationPermission() {

    let settings = await notifee.getNotificationSettings();

    if (
        settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
        settings.authorizationStatus === AuthorizationStatus.PROVISIONAL
    ) {
        return true;
    }


    await notifee.requestPermission();
    settings = await notifee.getNotificationSettings();

    const granted =
        settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
        settings.authorizationStatus === AuthorizationStatus.PROVISIONAL;

    if (!granted) {
        Alert.alert(
            'Bật thông báo',
            'Ứng dụng cần quyền thông báo để gửi cảnh báo kịp thời.',
            [
                { text: 'Để sau', style: 'cancel' },
                {
                    text: 'Mở cài đặt',
                    onPress: async () => {
                        try {
                            await notifee.openSettings();
                        } catch {
                            await notifee.openSettings();
                        }
                    },
                },
            ]
        );
    }

    return granted;
}
