import React from 'react';
import {View, Text} from 'react-native';

export default function Notification({notifications}) {
  return (
    <View>
      <Text className="text-lg font-bold text-gray-800 mb-3 text-center">
        THÔNG BÁO
      </Text>
      <View className="space-y-2">
        {!notifications || notifications.length === 0 ? (
          <Text className="text-sm text-gray-600 text-center">
            Không có thông báo
          </Text>
        ) : (
          notifications.map(n => (
            <View
              key={n.id}
              className={`p-3 rounded-lg border-l-4 ${
                n.type === 'warning'
                  ? 'bg-red-100 border-red-500'
                  : 'bg-blue-100 border-blue-500'
              }`}>
              <Text className="font-medium">{n.message}</Text>
              <Text className="text-gray-600 text-xs mt-1">{n.time}</Text>
            </View>
          ))
        )}
      </View>
    </View>
  );
}
