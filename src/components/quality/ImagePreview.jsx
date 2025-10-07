import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Image } from 'react-native';
import { ZoomIn } from 'lucide-react-native';


export default function ImagePreview({ src, thumbHeight = 100 }) {
    const [open, setOpen] = useState(false);
    return (
        <>
            <TouchableOpacity
                onPress={() => setOpen(true)}
                activeOpacity={0.9}
                className="rounded-xl border border-slate-200 overflow-hidden"
                style={{ height: thumbHeight, width: 140 }}
            >
                {!!src ? (
                    <Image source={{ uri: src }} resizeMode="cover" style={{ height: '100%', width: '100%' }} />
                ) : (
                    <View className="h-full w-full bg-slate-200" />
                )}
                <View className="absolute bottom-1 right-1 bg-black/60 px-2 py-0.5 rounded-md flex-row items-center">
                    <ZoomIn size={12} color="#fff" />
                    <Text className="text-[11px] text-white ml-1">Zoom</Text>
                </View>
            </TouchableOpacity>


            <Modal visible={open} transparent onRequestClose={() => setOpen(false)}>
                <TouchableOpacity activeOpacity={1} onPress={() => setOpen(false)} className="flex-1 bg-black/80 items-center justify-center p-4">
                    {!!src && <Image source={{ uri: src }} resizeMode="contain" style={{ width: '100%', height: '90%' }} />}
                </TouchableOpacity>
            </Modal>
        </>
    );
}