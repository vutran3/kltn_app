import React from 'react';
import { View, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function Notification({ notifications = [], title = 'THÔNG BÁO' }) {
  const count = notifications?.length || 0;

  return (
    <View>
      <View className="flex-row items-center justify-center mb-3">
        <Text className="text-lg font-bold text-gray-800 mr-2">{title}</Text>
        <View className="px-2 py-0.5 rounded-full bg-gray-800">
          <Text className="text-white text-xs font-semibold">{count}</Text>
        </View>
      </View>

      <View className="space-y-2 mb-4">
        {!count ? (
          <Text className="text-sm text-gray-600 text-center">Không có thông báo</Text>
        ) : (
          notifications.map((n) => {
            const isWarn = n.type === 'warning';
            const container =
              isWarn
                ? 'bg-red-50 border-red-500'
                : 'bg-blue-50 border-blue-500';

            return (
              <View
                key={n.id}
                className={`flex-row items-start p-3 rounded-xl border ${container} shadow-sm`}
              >
                <View className="mr-2 mt-0.5">
                  <Ionicons
                    name={isWarn ? 'warning' : 'information-circle'}
                    size={18}
                    color={isWarn ? '#b91c1c' : '#1d4ed8'}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-[13px] leading-5 font-medium text-gray-900">
                    {n.message}
                  </Text>
                  {!!n.time && (
                    <Text className="text-[11px] text-gray-600 mt-1">
                      {n.time}
                    </Text>
                  )}
                </View>
              </View>
            );
          })
        )}
      </View>
    </View>
  );
}
