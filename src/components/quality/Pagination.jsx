import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';


export default function Pagination({ page, totalPages, onPrev, onNext }) {
    const canPrev = page > 1, canNext = page < totalPages;
    return (
        <View className="flex-row items-center justify-between px-3 py-3">
            <Text className="text-slate-600 text-sm">Trang {page} / {totalPages}</Text>
            <View className="flex-row gap-2">
                <TouchableOpacity disabled={!canPrev} onPress={onPrev} className={`h-9 px-3 rounded-lg border ${canPrev ? 'bg-white' : 'bg-slate-100'}`}>
                    <Text className={`text-sm ${canPrev ? 'text-slate-800' : 'text-slate-400'}`}>Trước</Text>
                </TouchableOpacity>
                <TouchableOpacity disabled={!canNext} onPress={onNext} className={`h-9 px-3 rounded-lg border ${canNext ? 'bg-white' : 'bg-slate-100'}`}>
                    <Text className={`text-sm ${canNext ? 'text-slate-800' : 'text-slate-400'}`}>Sau</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}