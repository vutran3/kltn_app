import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Filter, RotateCcw, Calendar } from 'lucide-react-native';

function fmtLocal(dt) {
  if (!dt) return '—';
  try {
    return new Date(dt).toLocaleString('vi-VN', {
      hour: '2-digit', minute: '2-digit',
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  } catch { return '—'; }
}

export default function TimeFilter({ onFilter, onReset, disabled }) {
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [show, setShow] = useState({ which: null }); // 'from' | 'to' | null

  const minTo = useMemo(() => (from ? new Date(from) : undefined), [from]);

  return (
    <View className="rounded-2xl bg-white/90 shadow p-4 border border-slate-200">
      <Text className="text-center text-xl font-semibold text-slate-800">BỘ LỌC THỜI GIAN</Text>

      <View className="mt-4 gap-3">
        {/* FROM */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setShow({ which: 'from' })}
          className="rounded-xl border border-slate-300 px-3 h-11 justify-center"
        >
          <View className="flex-row items-center">
            <Calendar size={16} color="#0f172a" />
            <Text className="ml-2 text-slate-700">Từ: {fmtLocal(from)}</Text>
          </View>
        </TouchableOpacity>

        {/* TO */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setShow({ which: 'to' })}
          className="rounded-xl border border-slate-300 px-3 h-11 justify-center"
        >
          <View className="flex-row items-center">
            <Calendar size={16} color="#0f172a" />
            <Text className="ml-2 text-slate-700">Đến: {fmtLocal(to)}</Text>
          </View>
        </TouchableOpacity>

        {/* Actions */}
        <View className="flex-row gap-8 justify-end">
          <TouchableOpacity
            disabled={disabled}
            onPress={() => onFilter && onFilter(from, to)}
            className={`h-11 px-4 rounded-xl ${disabled ? 'bg-slate-200' : 'bg-sky-600'} items-center justify-center`}
          >
            <View className="flex-row items-center">
              <Filter color="#fff" size={18} />
              <Text className="text-white font-medium ml-2">Lọc</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setFrom(null); setTo(null);
              onReset && onReset();
            }}
            className="h-11 px-4 rounded-xl bg-white border border-slate-300 items-center justify-center"
          >
            <View className="flex-row items-center">
              <RotateCcw color="#0f172a" size={18} />
              <Text className="text-slate-800 font-medium ml-2">Reset</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* PICKERS */}
      <DateTimePickerModal
        isVisible={show.which === 'from'}
        mode="datetime"
        onConfirm={(date) => { setFrom(date); setShow({ which: null }); }}
        onCancel={() => setShow({ which: null })}
      />
      <DateTimePickerModal
        isVisible={show.which === 'to'}
        mode="datetime"
        minimumDate={minTo}
        onConfirm={(date) => { setTo(date); setShow({ which: null }); }}
        onCancel={() => setShow({ which: null })}
      />
    </View>
  );
}
