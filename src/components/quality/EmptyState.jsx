import React from 'react';
import { View, Text } from 'react-native';


export default function EmptyState({ title = 'Chưa có dữ liệu', subtitle = 'Khi có bản ghi, chúng sẽ hiển thị tại đây.' }) {
    return (
        <View className="rounded-2xl border border-dashed border-slate-300 p-8 items-center justify-center bg-white/60">
            <Text className="text-lg font-semibold text-slate-800">{title}</Text>
            <Text className="text-sm text-slate-600 mt-1">{subtitle}</Text>
        </View>
    );
}