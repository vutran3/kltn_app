import React from 'react';
import { View, Text } from 'react-native';


export default function Card({ title, actions, children, subtitle }) {
    return (
        <View className="rounded-2xl bg-white/90 shadow p-4 border border-slate-200">
            {(title || actions) && (
                <View className="mb-3 flex-row items-center justify-between">
                    <View>
                        <Text className="text-lg font-semibold text-slate-800">{title}</Text>
                        {!!subtitle && <Text className="text-xs text-slate-500 mt-1">{subtitle}</Text>}
                    </View>
                    {actions}
                </View>
            )}
            {children}
        </View>
    );
}