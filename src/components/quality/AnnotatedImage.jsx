import React, { useMemo, useState } from 'react';
import { View, Text, Image, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { ZoomIn } from 'lucide-react-native';

// boxes: [{x1,y1,x2,y2, cls, conf}]
export default function AnnotatedImage({
  src,
  boxes = [],
  originalSize,
  thumbHeight = 100,
  color = '#0ea5e9',
  showLabels = true,
}) {
  const [open, setOpen] = useState(false);

  // ===== thumbnail =====
  const W = 180;
  const H = thumbHeight;

  if (!originalSize?.width || !originalSize?.height) {
    // nếu thiếu size gốc, fallback sang ảnh thường
    return (
      <>
        <TouchableOpacity activeOpacity={0.9} onPress={() => setOpen(true)} className="rounded-xl border border-slate-200 overflow-hidden" style={{ width: W, height: H }}>
          {!!src ? (
            <Image source={{ uri: src }} resizeMode="cover" style={{ width: W, height: H, position: 'absolute' }} />
          ) : (
            <View className="w-full h-full bg-slate-200" />
          )}
          <View className="absolute bottom-1 right-1 bg-black/60 px-2 py-0.5 rounded-md flex-row items-center">
            <ZoomIn size={12} color="#fff" />
            <Text className="text-[11px] text-white ml-1">Zoom</Text>
          </View>
        </TouchableOpacity>
        <Modal visible={open} transparent onRequestClose={() => setOpen(false)}>
          <TouchableOpacity activeOpacity={1} onPress={() => setOpen(false)} className="flex-1 bg-black/85 items-center justify-center p-4">
            {!!src && <Image source={{ uri: src }} resizeMode="contain" style={{ width: '100%', height: '90%' }} />}
          </TouchableOpacity>
        </Modal>
      </>
    );
  }

  const sx = W / originalSize.width;
  const sy = H / originalSize.height;

  // ===== full-screen size for modal =====
  const { width: sw, height: sh } = Dimensions.get('window');
  const aspect = originalSize.width / originalSize.height;
  const modalW = Math.min(sw - 24, sh * 0.85 * aspect);
  const modalH = modalW / aspect;
  const msx = modalW / originalSize.width;
  const msy = modalH / originalSize.height;

  return (
    <>
      {/* thumb annotated */}
      <TouchableOpacity activeOpacity={0.9} onPress={() => setOpen(true)} className="rounded-xl border border-slate-200 overflow-hidden" style={{ width: W, height: H }}>
        {!!src ? (
          <Image source={{ uri: src }} resizeMode="cover" style={{ width: W, height: H, position: 'absolute' }} />
        ) : (
          <View className="w-full h-full bg-slate-200" />
        )}
        <View style={{ position: 'absolute', left: 0, top: 0, width: W, height: H }}>
          {(boxes || []).map((b, i) => {
            const x = Math.round(b.x1 * sx);
            const y = Math.round(b.y1 * sy);
            const w = Math.round((b.x2 - b.x1) * sx);
            const h = Math.round((b.y2 - b.y1) * sy);
            return (
              <View key={i} style={{ position: 'absolute', left: x, top: y, width: w, height: h, borderWidth: 2, borderColor: color, backgroundColor: 'rgba(14,165,233,0.18)' }}>
                {showLabels && (
                  <View style={{ position: 'absolute', left: 0, top: -18, backgroundColor: color, paddingHorizontal: 6, height: 18, justifyContent: 'center' }}>
                    <Text className="text-white text-[10px]">{`${b.cls ?? 'obj'} ${(b.conf ?? 0).toFixed(2)}`}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
        <View className="absolute bottom-1 right-1 bg-black/60 px-2 py-0.5 rounded-md flex-row items-center">
          <ZoomIn size={12} color="#fff" />
          <Text className="text-[11px] text-white ml-1">Zoom</Text>
        </View>
      </TouchableOpacity>

      {/* modal annotated */}
      <Modal visible={open} transparent onRequestClose={() => setOpen(false)}>
        <TouchableOpacity activeOpacity={1} onPress={() => setOpen(false)} className="flex-1 bg-black/85 items-center justify-center p-4">
          <View style={{ width: modalW, height: modalH }}>
            {!!src ? (
              <Image source={{ uri: src }} resizeMode="contain" style={{ width: modalW, height: modalH, position: 'absolute' }} />
            ) : (
              <View className="w-full h-full bg-slate-200" />
            )}
            <View style={{ position: 'absolute', left: 0, top: 0, width: modalW, height: modalH }}>
              {(boxes || []).map((b, i) => {
                const x = Math.round(b.x1 * msx);
                const y = Math.round(b.y1 * msy);
                const w = Math.round((b.x2 - b.x1) * msx);
                const h = Math.round((b.y2 - b.y1) * msy);
                return (
                  <View key={i} style={{ position: 'absolute', left: x, top: y, width: w, height: h, borderWidth: 2, borderColor: color, backgroundColor: 'rgba(14,165,233,0.18)' }}>
                    {showLabels && (
                      <View style={{ position: 'absolute', left: 0, top: -22, backgroundColor: color, paddingHorizontal: 8, height: 22, justifyContent: 'center' }}>
                        <Text className="text-white text-xs">{`${b.cls ?? 'obj'} ${(b.conf ?? 0).toFixed(2)}`}</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}
