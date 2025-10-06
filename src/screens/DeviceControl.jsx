// DeviceControl.js
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Share,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  Power,
  Clock,
  Calendar as CalendarIcon,
  RefreshCcw,
  Timer as TimerIcon,
  X,
  Trash2,
  Download,
  AlarmClock,
} from 'lucide-react-native';

// ---------- CONSTS ----------
const DEFAULT_SCHEDULE = {
  enabled: false,
  onTime: '06:00',
  offTime: '06:10',
  days: [1, 2, 3, 4, 5], // Mon-Fri (0=CN,1=T2,...,6=T7)
};

const STORAGE_KEY = 'device_schedules_v1';
const TIMER_STORAGE_KEY = 'device_timers_v1';
const HISTORY_STORAGE_KEY = 'device_history_v1';

const WEEK_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

// ---------- Helpers ----------
function parseHHMM(time) {
  const [h, m] = (time || '00:00').split(':').map(n => Number(n));
  return {h: h || 0, m: m || 0};
}

function nextOccurrence(time, days, from = new Date()) {
  const {h, m} = parseHHMM(time);
  const start = new Date(from.getTime());
  start.setSeconds(0, 0);
  for (let i = 0; i < 8; i++) {
    const d = new Date(start.getTime());
    d.setDate(start.getDate() + i);
    d.setHours(h, m, 0, 0);
    if (days.includes(d.getDay())) {
      if (d.getTime() >= from.getTime()) return d;
    }
  }
  const far = new Date(from.getTime());
  far.setFullYear(far.getFullYear() + 10);
  return far;
}

function formatDate(dt) {
  if (!dt) return '—';
  try {
    return dt.toLocaleString('vi-VN');
  } catch {
    const pad = n => String(n).padStart(2, '0');
    return `${pad(dt.getDate())}/${pad(
      dt.getMonth() + 1,
    )}/${dt.getFullYear()} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
  }
}

function cn(...xs) {
  return xs.filter(Boolean).join(' ');
}

// Simulate device command (replace by MQTT/HTTP)
async function sendDeviceCommand(_device, _on) {
  await new Promise(res => setTimeout(res, 350));
}

// optional server sync
async function syncScheduleToServer(_device, _schedule) {
  return;
}

// ---------- Hook ----------
function useTimeLeft(endAt) {
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!endAt) return;
    const iv = setInterval(() => setTick(x => x + 1), 1000);
    return () => clearInterval(iv);
  }, [endAt]);
  if (!endAt) return '—';
  const left = Math.max(0, endAt - Date.now());
  const s = Math.floor(left / 1000);
  const mm = Math.floor(s / 60)
    .toString()
    .padStart(2, '0');
  const ss = (s % 60).toString().padStart(2, '0');
  return `${mm}:${ss}`;
}

// ---------- Component ----------
export default function DeviceControl() {
  const [devices, setDevices] = useState([
    {id: 'pump', name: 'Máy bơm', isOn: false, isBusy: false},
    {id: 'light', name: 'Đèn', isOn: false, isBusy: false},
  ]);

  const [schedules, setSchedules] = useState({
    pump: {...DEFAULT_SCHEDULE},
    light: {...DEFAULT_SCHEDULE},
  });

  const [timers, setTimers] = useState({
    pump: null,
    light: null,
  });

  const [history, setHistory] = useState({
    pump: [],
    light: [],
  });

  const [nextOnOff, setNextOnOff] = useState({
    pump: {onAt: null, offAt: null},
    light: {onAt: null, offAt: null},
  });

  // Load persisted on mount
  useEffect(() => {
    (async () => {
      try {
        const [schRaw, tmrRaw, hisRaw] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(TIMER_STORAGE_KEY),
          AsyncStorage.getItem(HISTORY_STORAGE_KEY),
        ]);
        if (schRaw) setSchedules(prev => ({...prev, ...JSON.parse(schRaw)}));
        if (tmrRaw) setTimers(prev => ({...prev, ...JSON.parse(tmrRaw)}));
        if (hisRaw) setHistory(prev => ({...prev, ...JSON.parse(hisRaw)}));
      } catch {}
    })();
  }, []);

  // Persist
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(schedules)).catch(
      () => {},
    );
  }, [schedules]);
  useEffect(() => {
    AsyncStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(timers)).catch(
      () => {},
    );
  }, [timers]);
  useEffect(() => {
    AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history)).catch(
      () => {},
    );
  }, [history]);

  // Add history entry
  function addHistory(device, action, source, extra = {}) {
    setHistory(prev => {
      const entry = {at: Date.now(), action, source, ...extra};
      const arr = [entry, ...(prev[device] || [])].slice(0, 200);
      return {...prev, [device]: arr};
    });
  }

  // compute next on/off when schedule changes
  useEffect(() => {
    const now = new Date();
    const calc = device => {
      const s = schedules[device];
      if (!s || !s.enabled || s.days.length === 0)
        return {onAt: null, offAt: null};
      const onDt = nextOccurrence(s.onTime, s.days, now);
      const offDt = nextOccurrence(s.offTime, s.days, now);
      return {onAt: onDt.getTime(), offAt: offDt.getTime()};
    };
    setNextOnOff({pump: calc('pump'), light: calc('light')});
  }, [schedules]);

  // Interval: timers & schedules
  useEffect(() => {
    const iv = setInterval(() => {
      const now = Date.now();

      // quick timers — auto OFF
      setTimers(prev => {
        const next = {...prev};
        Object.keys(prev).forEach(d => {
          const t = prev[d];
          if (t && now >= t.endAt) {
            setDevices(old =>
              old.map(x => (x.id === d ? {...x, isOn: false} : x)),
            );
            addHistory(d, 'OFF', 'timer-auto');
            next[d] = null;
          }
        });
        return next;
      });

      // schedule triggers
      setNextOnOff(prev => {
        const copy = JSON.parse(JSON.stringify(prev));
        Object.keys(prev).forEach(d => {
          const sch = schedules[d];
          if (!sch?.enabled) return;
          const item = prev[d];
          const tol = 1000 * 30; // 30s

          if (item.onAt && Math.abs(now - item.onAt) <= tol) {
            setDevices(old =>
              old.map(x => (x.id === d ? {...x, isOn: true} : x)),
            );
            addHistory(d, 'ON', 'schedule');
            const nxt = nextOccurrence(
              sch.onTime,
              sch.days,
              new Date(item.onAt + 60000),
            );
            copy[d].onAt = nxt.getTime();
          }

          if (item.offAt && Math.abs(now - item.offAt) <= tol) {
            setDevices(old =>
              old.map(x => (x.id === d ? {...x, isOn: false} : x)),
            );
            addHistory(d, 'OFF', 'schedule');
            const nxt = nextOccurrence(
              sch.offTime,
              sch.days,
              new Date(item.offAt + 60000),
            );
            copy[d].offAt = nxt.getTime();
          }
        });
        return copy;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [schedules]);

  // toggle
  const handleToggle = async (device, source = 'manual') => {
    setDevices(prev =>
      prev.map(x => (x.id === device ? {...x, isBusy: true} : x)),
    );
    const current = devices.find(d => d.id === device);
    const nextState = !current?.isOn;
    try {
      await sendDeviceCommand(device, !!nextState);
      setDevices(prev =>
        prev.map(x =>
          x.id === device
            ? {...x, isOn: !!nextState, isBusy: false, lastUpdated: Date.now()}
            : x,
        ),
      );
      addHistory(device, nextState ? 'ON' : 'OFF', source);
    } catch (e) {
      setDevices(prev =>
        prev.map(x => (x.id === device ? {...x, isBusy: false} : x)),
      );
      Alert.alert('Lỗi', 'Không thể gửi lệnh. Vui lòng thử lại.');
    }
  };

  const handleEnsureOn = async device => {
    const d = devices.find(x => x.id === device);
    if (!d) return;
    if (!d.isOn) await handleToggle(device, 'timer');
  };

  const handleTimerStart = async (device, minutes) => {
    if (!Number.isFinite(minutes) || minutes <= 0)
      return Alert.alert('Lỗi', 'Số phút không hợp lệ');
    const endAt = Date.now() + minutes * 60 * 1000;
    await handleEnsureOn(device);
    setTimers(prev => ({...prev, [device]: {endAt}}));
  };

  const handleTimerCancel = device => {
    setTimers(prev => ({...prev, [device]: null}));
  };

  const saveSchedule = async (device, schedule) => {
    setSchedules(prev => ({...prev, [device]: schedule}));
    try {
      await syncScheduleToServer(device, schedule);
    } catch {}
  };

  const clearHistory = device => {
    Alert.alert('Xác nhận', 'Xoá toàn bộ lịch sử của thiết bị này?', [
      {text: 'Hủy', style: 'cancel'},
      {
        text: 'Xoá',
        style: 'destructive',
        onPress: () => setHistory(prev => ({...prev, [device]: []})),
      },
    ]);
  };

  const exportHistory = async device => {
    try {
      const data = history[device] || [];
      await Share.share({
        message: JSON.stringify(data, null, 2),
        title: `${device}_history.json`,
      });
    } catch {}
  };

  return (
    <View className="min-h-screen w-full bg-slate-50">
      {/* Header */}
      <View className="bg-white/90 border-b border-slate-200">
        <View className="px-4 py-4 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <AlarmBadge />
            <Text className="text-xl font-semibold ml-2">
              Điều khiển thiết bị
            </Text>
          </View>
        </View>
      </View>

      {/* Body */}
      <ScrollView contentContainerStyle={{padding: 16}}>
        {devices.map(dev => (
          <DeviceCard
            key={dev.id}
            device={dev}
            schedule={schedules[dev.id]}
            nextOnAt={nextOnOff[dev.id]?.onAt ?? null}
            nextOffAt={nextOnOff[dev.id]?.offAt ?? null}
            timer={timers[dev.id]}
            historyItems={(history[dev.id] || []).slice(0, 20)}
            onToggle={() => handleToggle(dev.id)}
            onTimerStart={mins => handleTimerStart(dev.id, mins)}
            onTimerCancel={() => handleTimerCancel(dev.id)}
            onScheduleChange={sch => saveSchedule(dev.id, sch)}
            onHistoryClear={() => clearHistory(dev.id)}
            onHistoryExport={() => exportHistory(dev.id)}
          />
        ))}

        <View className="h-10" />
      </ScrollView>
    </View>
  );
}

// ---------- Subcomponents ----------
function AlarmBadge() {
  return (
    <View className="w-6 h-6 rounded-full items-center justify-center bg-emerald-50">
      <AlarmClock size={16} color="#059669" />
    </View>
  );
}

function DeviceCard({
  device,
  schedule,
  nextOnAt,
  nextOffAt,
  timer,
  historyItems,
  onToggle,
  onTimerStart,
  onTimerCancel,
  onScheduleChange,
  onHistoryClear,
  onHistoryExport,
}) {
  const [minutes, setMinutes] = useState('10');
  const [local, setLocal] = useState(schedule ?? {...DEFAULT_SCHEDULE});

  useEffect(() => {
    if (schedule) setLocal(schedule);
  }, [schedule]);

  const timeLeft = useTimeLeft(timer ? timer.endAt : null);
  const statusColorClass = device.isOn ? 'bg-emerald-500' : 'bg-slate-300';
  const statusText = device.isOn ? 'Đang bật' : 'Đang tắt';

  return (
    <View className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden mb-4">
      {/* Header */}
      <View className="p-5 border-b border-slate-100 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View
            className={cn('w-2.5 h-2.5 rounded-full mr-2', statusColorClass)}
          />
          <Text className="text-lg font-semibold mr-8">{device.name}</Text>
          <View className="px-2 py-0.5 rounded-full bg-slate-100">
            <Text className="text-xs text-slate-600">{statusText}</Text>
          </View>
        </View>

        <Pressable
          onPress={onToggle}
          disabled={device.isBusy}
          className={cn(
            'rounded-full px-4 py-2 flex-row items-center',
            device.isOn ? 'bg-emerald-600' : 'bg-white border border-slate-200',
          )}
          android_ripple={{color: '#d1fae5'}}>
          <Power size={18} color={device.isOn ? '#fff' : '#0f172a'} />
          <Text
            className={cn(
              'text-sm font-medium ml-2',
              device.isOn ? 'text-white' : 'text-slate-900',
            )}>
            {device.isBusy ? 'Đang gửi...' : device.isOn ? 'Tắt' : 'Bật'}
          </Text>
        </Pressable>
      </View>

      {/* Quick Timer */}
      <View className="p-5 border-b border-slate-100">
        <View className="flex-row items-center mb-3">
          <TimerIcon size={16} color="#334155" />
          <Text className="ml-2 font-medium text-slate-700">Hẹn giờ nhanh</Text>
        </View>

        <View className="flex-row flex-wrap items-center">
          <Text className="text-sm text-slate-600 mr-3">Thời lượng (phút)</Text>
          <TextInput
            value={minutes}
            onChangeText={t => setMinutes(String(Math.max(1, Number(t) || 1)))}
            keyboardType="numeric"
            className="w-24 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <Pressable
            onPress={() => onTimerStart(Number(minutes))}
            className="rounded-lg bg-emerald-600 px-3 py-2 ml-3"
            android_ripple={{color: '#065f46'}}>
            <Text className="text-white text-sm font-medium">
              Bật trong {minutes}′
            </Text>
          </Pressable>

          {timer && (
            <View className="ml-auto flex-row items-center">
              <View className="rounded-full bg-slate-100 px-2 py-1 flex-row items-center mr-2">
                <Clock size={14} color="#334155" />
                <Text className="ml-1 text-sm text-slate-700">
                  Còn lại: {timeLeft}
                </Text>
              </View>
              <Pressable
                onPress={onTimerCancel}
                className="border border-slate-300 rounded-lg px-2 py-1 flex-row items-center">
                <X size={14} color="#334155" />
                <Text className="ml-1 text-slate-700 text-sm">Hủy</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>

      {/* Scheduler */}
      <View className="p-5 border-b border-slate-100">
        <View className="flex-row items-center mb-3">
          <CalendarIcon size={16} color="#334155" />
          <Text className="ml-2 font-medium text-slate-700">Lịch hẹn giờ</Text>
        </View>

        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <SwitchLike
              value={local.enabled}
              onChange={v => setLocal(s => ({...s, enabled: v}))}
            />
            <Text className="ml-2 text-sm">Bật lịch cho thiết bị này</Text>
          </View>

          <Pressable
            onPress={() => onScheduleChange(local)}
            className="border rounded-lg border-slate-300 bg-white px-3 py-2 flex-row items-center">
            <RefreshCcw size={14} color="#334155" />
            <Text className="ml-2 text-sm">Lưu/Cập nhật lịch</Text>
          </Pressable>
        </View>

        <View className="flex-row">
          <View className="flex-1 mr-2">
            <TimeField
              label="Giờ bật"
              value={local.onTime}
              onChange={v => setLocal(s => ({...s, onTime: v}))}
            />
          </View>
          <View className="flex-1 ml-2">
            <TimeField
              label="Giờ tắt"
              value={local.offTime}
              onChange={v => setLocal(s => ({...s, offTime: v}))}
            />
          </View>
        </View>

        <WeekdayPicker
          value={local.days}
          onChange={days => setLocal(s => ({...s, days}))}
        />

        <NextRunRow onAt={nextOnAt} offAt={nextOffAt} />
      </View>

      {/* History */}
      <View className="p-5">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <Clock size={16} color="#334155" />
            <Text className="ml-2 font-medium text-slate-700">
              Lịch sử bật/tắt
            </Text>
          </View>
        </View>

        <View className="flex-row mb-3">
          <Pressable
            onPress={onHistoryExport}
            className="border rounded-lg px-2 py-1 flex-row items-center mr-2">
            <Download size={16} color="#334155" />
            <Text className="ml-1 text-sm">Xuất</Text>
          </Pressable>
          <Pressable
            onPress={onHistoryClear}
            className="border rounded-lg px-2 py-1 flex-row items-center border-rose-300">
            <Trash2 size={16} color="#e11d48" />
            <Text className="ml-1 text-sm text-rose-600">Xoá</Text>
          </Pressable>
        </View>

        <HistoryList items={historyItems} />
      </View>
    </View>
  );
}

function SwitchLike({value, onChange}) {
  return (
    <Pressable
      onPress={() => onChange(!value)}
      className={cn(
        'w-10 h-6 rounded-full px-0.5 justify-center',
        value ? 'bg-emerald-600' : 'bg-slate-300',
      )}>
      <View
        className={cn(
          'w-5 h-5 rounded-full bg-white',
          value ? 'self-end' : 'self-start',
        )}
      />
    </Pressable>
  );
}

function TimeField({label, value, onChange}) {
  const [show, setShow] = useState(false);
  const [tmpDate, setTmpDate] = useState(() => {
    const {h, m} = parseHHMM(value || '00:00');
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d;
  });

  useEffect(() => {
    const {h, m} = parseHHMM(value || '00:00');
    const d = new Date();
    d.setHours(h, m, 0, 0);
    setTmpDate(d);
  }, [value]);

  const onChangeTime = (_event, date) => {
    if (!date) {
      setShow(false);
      return;
    }
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    onChange(`${hh}:${mm}`);
    setShow(false);
  };

  return (
    <View>
      <Text className="text-sm text-slate-600 mb-1">{label}</Text>
      <Pressable
        onPress={() => setShow(true)}
        className="rounded-lg border border-slate-300 px-3 py-2">
        <Text className="text-base">{value || '00:00'}</Text>
      </Pressable>
      {show && (
        <DateTimePicker
          value={tmpDate}
          mode="time"
          is24Hour
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onChangeTime}
        />
      )}
    </View>
  );
}

function WeekdayPicker({value, onChange}) {
  const toggle = d => {
    const set = new Set(value || []);
    if (set.has(d)) set.delete(d);
    else set.add(d);
    onChange([...set].sort((a, b) => a - b));
  };

  return (
    <View className="mt-4">
      <Text className="text-sm text-slate-600 mb-2">Lặp lại vào các ngày</Text>
      <View className="flex-row flex-wrap">
        {WEEK_LABELS.map((label, idx) => {
          const active = (value || []).includes(idx);
          return (
            <Pressable
              key={idx}
              onPress={() => toggle(idx)}
              className={cn(
                'min-w-[40px] rounded-full border px-3 py-1 mr-2 mb-2',
                active
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-slate-300 bg-white',
              )}>
              <Text
                className={cn(
                  'text-sm',
                  active ? 'text-emerald-700' : 'text-slate-700',
                )}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function NextRunRow({onAt, offAt}) {
  const onDt = onAt ? new Date(onAt) : null;
  const offDt = offAt ? new Date(offAt) : null;
  return (
    <View className="mt-3">
      <Text className="text-sm text-slate-600">
        🟢 Lần bật kế tiếp:{' '}
        <Text className="font-medium">{formatDate(onDt)}</Text>
      </Text>
      <Text className="text-sm text-slate-600">
        🔴 Lần tắt kế tiếp:{' '}
        <Text className="font-medium">{formatDate(offDt)}</Text>
      </Text>
    </View>
  );
}

function HistoryList({items}) {
  const sourceLabel = s =>
    s === 'manual'
      ? 'Thao tác tay'
      : s === 'schedule'
      ? 'Theo lịch'
      : s === 'timer'
      ? 'Bắt đầu hẹn giờ'
      : s === 'timer-auto'
      ? 'Tự tắt khi hết giờ'
      : String(s);

  if (!items || items.length === 0) {
    return <Text className="text-sm text-slate-500">Chưa có lịch sử.</Text>;
  }

  return (
    <View className="rounded-lg border border-slate-200 max-h-80">
      <View className="bg-slate-50 border-b border-slate-200 px-3 py-2">
        <View className="flex-row">
          <Text className="flex-1 text-slate-600">Thời gian</Text>
          <Text className="w-24 text-slate-600">Hành động</Text>
          <Text className="w-32 text-slate-600">Nguồn</Text>
        </View>
      </View>

      <ScrollView>
        {items.map((it, idx) => (
          <View key={idx} className="px-3 py-2 border-b border-slate-100">
            <View className="flex-row items-center">
              <Text className="flex-1">{formatDate(new Date(it.at))}</Text>
              <Text
                className={cn(
                  'w-24 font-medium',
                  it.action === 'ON' ? 'text-emerald-700' : 'text-rose-700',
                )}>
                {it.action === 'ON' ? 'Bật' : 'Tắt'}
              </Text>
              <Text className="w-32">{sourceLabel(it.source)}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
