import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, ScrollView } from 'react-native';
import { fmtTs } from '../utils/time';
import { getDataApi } from '../utils/fetch';
import { DEFAULT_DEVICE_ID, POLL_MS } from '../constants/index';
import { useDispatch } from 'react-redux';
import MetricCard from '../components/home/MetricCard';
import Notification from '../components/home/Notification';
import CalendarWeather from '../components/home/CalendarWeather';
import HistoryTable from '../components/home/HistoryTable';
import { getProductByDeviceId } from '../redux/thunks/productThunk';

// ========= TẬP LUẬT (giống web) =========
const RULES = {
  'Cải Thìa':       { temperature: [15, 25], rh: [75, 85], soil: [60, 80], ph: [5.5, 6.5], n: [80, 150], p: [30, 60], k: [100, 180], soilT: [10, 30] },
  'Bắp Cải':        { temperature: [15, 20], rh: [80, 90], soil: [70, 85], ph: [5.6, 6.5], n: [80, 150], p: [30, 60], k: [100, 180], soilT: [10, 30] },
  'Bông cải xanh':  { temperature: [11, 24], rh: [70, 80], soil: [60, 80], ph: [5.5, 7.0], n: [80, 150], p: [30, 60], k: [100, 180], soilT: [10, 29] },
  'Bông cải trắng': { temperature: [11, 24], rh: [70, 80], soil: [75, 85], ph: [6.0, 7.0], n: [80, 150], p: [30, 60], k: [100, 180], soilT: [10, 29] },
  'Cải bẹ xanh':    { temperature: [18, 25], rh: [75, 85], soil: [70, 80], ph: [6.0, 6.8], n: [80, 150], p: [30, 60], k: [100, 180], soilT: [10, 30] },
  'Cải Thảo':       { temperature: [18, 22], rh: [85, 90], soil: [70, 80], ph: [6.0, 6.8], n: [80, 150], p: [30, 60], k: [100, 180], soilT: [10, 30] },
  'Cải cúc':        { temperature: [15, 25], rh: [70, 80], soil: [60, 70], ph: [6.0, 6.8], n: [80, 150], p: [30, 60], k: [100, 180], soilT: [10, 25] },
};

const inRange = (val, [min, max]) =>
  typeof val === 'number' && Number.isFinite(val) && min != null && max != null
    ? val >= min && val <= max
    : true;

async function fetchLast(deviceId) {
  const res = await getDataApi(`/readings/last`, { deviceId }, { cache: 'no-store' });
  return res?.data?.data?.last ?? null;
}

export default function HomeScreen() {
  const dispatch = useDispatch();
  const [deviceId, setDeviceId] = useState(DEFAULT_DEVICE_ID);
  const [last, setLast] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const cropType = useMemo(() => product?.name || product?.type, [product]);
  const rule = useMemo(() => (cropType ? RULES[cropType] : undefined), [cropType]);

  const loadData = async (did) => {
    setErr(null);
    setLoading(true);
    try {
      const [lastRow, prod] = await Promise.all([
        fetchLast(did),
        dispatch(getProductByDeviceId(did)).unwrap().catch(() => null),
      ]);
      setLast(lastRow);
      setProduct(prod);
    } catch (e) {
      setErr(e?.message || 'Fetch error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(deviceId);
    const id = setInterval(() => loadData(deviceId), POLL_MS);
    return () => clearInterval(id);
  }, [deviceId, dispatch]);

  // ====== Sinh cảnh báo + set cờ warning cho thẻ MetricCard ======
  const notifications = [];
  const warn = {
    airTemp: false, airHumidity: false, soilHumidity: false,
    soilTemperature: false, ph: false, n: false, p: false, k: false,
  };

  if (last && rule) {
    if (!inRange(last.airTemperature, rule.temperature)) {
      warn.airTemp = true;
      notifications.push({
        id: 'airTemp',
        type: 'warning',
        message: `Nhiệt độ không khí ${last.airTemperature?.toFixed?.(1)}°C vượt ngưỡng (${rule.temperature[0]}–${rule.temperature[1]}°C) cho ${cropType}.`,
        time: fmtTs(last.t),
      });
    }
    if (!inRange(last.airHumidity, rule.rh)) {
      warn.airHumidity = true;
      notifications.push({
        id: 'airHumidity',
        type: 'warning',
        message: `Độ ẩm không khí ${last.airHumidity?.toFixed?.(1)}% vượt ngưỡng (${rule.rh[0]}–${rule.rh[1]}%).`,
        time: fmtTs(last.t),
      });
    }
    if (!inRange(last.soilHumidity, rule.soil)) {
      warn.soilHumidity = true;
      notifications.push({
        id: 'soilHumidity',
        type: 'warning',
        message: `Độ ẩm đất ${last.soilHumidity?.toFixed?.(1)}% vượt ngưỡng (${rule.soil[0]}–${rule.soil[1]}%).`,
        time: fmtTs(last.t),
      });
    }
    if (!inRange(last.soilTemperature, rule.soilT)) {
      warn.soilTemperature = true;
      notifications.push({
        id: 'soilTemperature',
        type: 'warning',
        message: `Nhiệt độ đất ${last.soilTemperature?.toFixed?.(1)}°C vượt ngưỡng (${rule.soilT[0]}–${rule.soilT[1]}°C).`,
        time: fmtTs(last.t),
      });
    }
    if (!inRange(last.ph, rule.ph)) {
      warn.ph = true;
      notifications.push({
        id: 'ph',
        type: 'warning',
        message: `pH ${Number(last.ph).toFixed(2)} vượt ngưỡng (${rule.ph[0]}–${rule.ph[1]}).`,
        time: fmtTs(last.t),
      });
    }
    if (!inRange(last.nitrogen, rule.n)) {
      warn.n = true;
      notifications.push({
        id: 'n',
        type: 'warning',
        message: `N = ${Number(last.nitrogen).toFixed(2)} mg/kg vượt ngưỡng (${rule.n[0]}–${rule.n[1]}).`,
        time: fmtTs(last.t),
      });
    }
    if (!inRange(last.phosphorus, rule.p)) {
      warn.p = true;
      notifications.push({
        id: 'p',
        type: 'warning',
        message: `P = ${Number(last.phosphorus).toFixed(2)} mg/kg vượt ngưỡng (${rule.p[0]}–${rule.p[1]}).`,
        time: fmtTs(last.t),
      });
    }
    if (!inRange(last.potassium, rule.k)) {
      warn.k = true;
      notifications.push({
        id: 'k',
        type: 'warning',
        message: `K = ${Number(last.potassium).toFixed(2)} mg/kg vượt ngưỡng (${rule.k[0]}–${rule.k[1]}).`,
        time: fmtTs(last.t),
      });
    }
  }

  return (
    <ScrollView className="flex-1 bg-[#F5F7FB] p-3">
      {/* Header: Device & Status */}
      <View className="bg-white rounded-xl p-4 mb-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Text className="text-sm font-medium mr-2">Device ID:</Text>
            <TextInput
              value={deviceId}
              onChangeText={setDeviceId}
              placeholder="esp32s3-01"
              className="border border-gray-300 rounded px-3 py-1 text-sm min-w-[140px]"
            />
          </View>
          <View>
            {loading ? (
              <Text className="text-gray-700 text-sm">Đang tải...</Text>
            ) : err ? (
              <Text className="text-red-700 text-sm">Lỗi: {err}</Text>
            ) : last ? (
              <Text className="text-gray-800 text-xs">
                Cập nhật: <Text className="font-bold">{fmtTs(last.t)}</Text>
              </Text>
            ) : (
              <Text className="text-gray-700 text-sm">Chưa có dữ liệu</Text>
            )}
          </View>
        </View>

        {/* Loại cây đang theo dõi */}
        <View className="mt-3">
          <View className="self-start flex-row items-center px-3 py-1 rounded-full bg-green-50 border border-green-200">
            <Text className="text-xs text-gray-600 mr-2">CÂY ĐANG THEO DÕI</Text>
            <Text className="text-sm font-semibold text-green-700">{cropType || '—'}</Text>
          </View>
          {!rule && cropType && (
            <Text className="text-xs text-amber-700 mt-2">
              (Chưa tìm thấy tập luật cho loại cây này — tạm thời không đánh dấu ngưỡng.)
            </Text>
          )}
        </View>
      </View>

      {/* Metrics */}
      <View className="bg-white rounded-xl p-4 mb-3">
        {/* Row 1 */}
        <View className="flex-row flex-wrap -mx-1 mb-3">
          <View className="w-1/2 px-1 mb-2">
            <MetricCard
              title="NHIỆT ĐỘ KHÔNG KHÍ"
              value={last?.airTemperature != null ? last.airTemperature.toFixed(1) : '—'}
              unit="°C"
              warning={warn.airTemp}
            />
          </View>
          <View className="w-1/2 px-1 mb-2">
            <MetricCard
              title="ĐỘ ẨM KHÔNG KHÍ"
              value={last?.airHumidity != null ? last.airHumidity.toFixed(1) : '—'}
              unit="%"
              warning={warn.airHumidity}
            />
          </View>
          <View className="w-full px-1">
            <MetricCard title="ÁNH SÁNG (RAW)" value={last?.lightRaw ?? '—'} unit="" />
          </View>
        </View>

        {/* Row 2 */}
        <View className="flex-row flex-wrap -mx-1 mb-3">
          <View className="w-1/2 px-1 mb-2">
            <MetricCard
              title="NHIỆT ĐỘ ĐẤT"
              value={last?.soilTemperature != null ? last.soilTemperature.toFixed(1) : '—'}
              unit="°C"
              warning={warn.soilTemperature}
            />
          </View>
          <View className="w-1/2 px-1 mb-2">
            <MetricCard
              title="ĐỘ ẨM ĐẤT"
              value={last?.soilHumidity != null ? last.soilHumidity.toFixed(1) : '—'}
              unit="%"
              warning={warn.soilHumidity}
            />
          </View>
          <View className="w-full px-1">
            <MetricCard
              title="pH"
              value={last?.ph != null ? Number(last.ph).toFixed(2) : '—'}
              unit=""
              warning={warn.ph}
            />
          </View>
        </View>

        {/* Row 3 */}
        <View className="flex-row flex-wrap -mx-1">
          <View className="w-1/3 px-1 mb-2">
            <MetricCard
              title="NITƠ (N)"
              value={last?.nitrogen != null ? Number(last.nitrogen).toFixed(2) : '—'}
              unit="ppm"
              warning={warn.n}
            />
          </View>
          <View className="w-1/3 px-1 mb-2">
            <MetricCard
              title="LÂN (P)"
              value={last?.phosphorus != null ? Number(last.phosphorus).toFixed(2) : '—'}
              unit="ppm"
              warning={warn.p}
            />
          </View>
          <View className="w-1/3 px-1 mb-2">
            <MetricCard
              title="KALI (K)"
              value={last?.potassium != null ? Number(last.potassium).toFixed(2) : '—'}
              unit="ppm"
              warning={warn.k}
            />
          </View>
        </View>
      </View>

      {/* History */}
      <View className="bg-white rounded-xl p-4 mb-3">
        <HistoryTable deviceId={deviceId} />
      </View>

      {/* Notifications */}
      <View className="bg-white rounded-xl p-4 mb-3">
        <Notification notifications={notifications} />
      </View>

      {/* Calendar & Weather */}
      <View className="bg-white rounded-xl p-4 mb-6">
        <CalendarWeather />
      </View>
    </ScrollView>
  );
}
