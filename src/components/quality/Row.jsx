// src/components/quality/Row.jsx
import React from 'react';
import { View, Text } from 'react-native';
import { CalendarDays } from 'lucide-react-native';
import ImagePreview from './ImagePreview';
import AnnotatedImage from './AnnotatedImage';

export default function Row({ row }) {
    return (
        <View className="px-3 py-3 border-t border-slate-100">
            {/* Hàng nội dung chính */}
            <View className="flex-row gap-3">
                {/* STT */}
                <View className="items-center justify-center w-10">
                    <Text className="text-slate-700">{row.no}</Text>
                </View>

                {/* Ảnh gốc */}
                <ImagePreview src={row.originalUrl} />

                {/* Khoảng trống nhỏ / hoặc thêm meta khác nếu cần */}
                <View className="justify-center">
                    {/* Giữ nguyên nếu bạn muốn text ngắn ở cạnh ảnh */}
                    {/* <Text className="text-slate-800">{row.capturedAt}</Text> */}
                </View>

                {/* Ảnh annotated (có zoom & boxes) */}
                <View className="flex-1 items-end">
                    {row.boxes?.length && row.originalSize?.width ? (
                        <AnnotatedImage
                            src={row.detectedUrl || row.originalUrl}
                            boxes={row.boxes}
                            originalSize={row.originalSize}
                        />
                    ) : (
                        <ImagePreview src={row.detectedUrl || row.originalUrl} />
                    )}
                </View>
            </View>

            {/* Dòng meta: NGÀY KIỂM TRA */}
            <View className="mt-3 flex-row items-center gap-2">
                <CalendarDays size={16} color="#0f172a" />
                <Text className="text-sm text-slate-800">
                    <Text className="font-semibold">Ngày kiểm tra: </Text>
                    {row.capturedAt || '—'}
                </Text>
            </View>

            {/* Thông điệp AI */}
            <View className="mt-3 rounded-xl border border-slate-200 bg-white px-3 py-2">
                <Text className="text-slate-700">{row.aiMessage || '—'}</Text>
            </View>
        </View>
    );
}
