import React from 'react';
import {View, Text} from 'react-native';
import {AlertTriangle} from 'lucide-react-native';

export default function MetricCard({
  title,
  value,
  unit,
  warning = false,
  large = false,
}) {
  return (
    <View
      className={`rounded-lg p-4 border ${
        warning ? 'border-yellow-400' : 'border-gray-200'
      } bg-white`}>
      <View className="items-center">
        <Text className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wider">
          {title}
        </Text>
        <View className="flex-row items-center">
          <Text
            className={`text-2xl font-bold ${
              warning ? 'text-red-600' : 'text-gray-800'
            }`}>
            {value} {unit}
          </Text>
          {warning && (
            <AlertTriangle size={18} color="#eab308" style={{marginLeft: 6}} />
          )}
        </View>
      </View>
    </View>
  );
}
