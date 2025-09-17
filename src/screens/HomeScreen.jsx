import React, {useEffect, useState} from 'react';
import {View, Text, TextInput, ScrollView} from 'react-native';
import {fmtTs} from '../utils/time';
import {getDataApi} from '../utils/fetch';
import {DEFAULT_DEVICE_ID, POLL_MS} from '../constants/index';
import MetricCard from '../components/MetricCard';
import Notification from '../components/Notification';
import CalendarWeather from '../components/CalendarWeather';
import HistoryTable from '../components/HistoryTable';

async function fetchLast(deviceId) {
  const res = await getDataApi(
    `/readings/last`,
    {deviceId},
    {cache: 'no-store'},
  );
  return res?.data?.data?.last ?? null;
}

export default function HomeScreen() {
  const [deviceId, setDeviceId] = useState(DEFAULT_DEVICE_ID);
  const [last, setLast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const loadData = async did => {
    setErr(null);
    setLoading(true);
    try {
      const lastRow = await fetchLast(did);
      setLast(lastRow);
    } catch (e) {
      setErr(e?.message || 'Fetch error');
    } finally {
      setLoading(false);
    }
  };

  const notifications = [];

  const warnSoilHumidity =
    typeof last?.soilHumidity === 'number' ? last.soilHumidity < 30 : false;
  const warnAirTemp =
    typeof last?.airTemperature === 'number' ? last.airTemperature > 35 : false;
  const warnPH =
    typeof last?.ph === 'number' ? last.ph < 5.5 || last.ph > 7.5 : false;

  useEffect(() => {
    loadData(deviceId);
    const id = setInterval(() => loadData(deviceId), POLL_MS);
    return () => clearInterval(id);
  }, [deviceId]);

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
      </View>

      {/* Metrics */}
      <View className="bg-white rounded-xl p-4 mb-3">
        {/* Row 1 */}
        <View className="flex-row flex-wrap -mx-1 mb-3">
          <View className="w-1/2 px-1 mb-2">
            <MetricCard
              title="NHIỆT ĐỘ KHÔNG KHÍ"
              value={
                last?.airTemperature != null
                  ? last.airTemperature.toFixed(1)
                  : '—'
              }
              unit="°C"
              warning={warnAirTemp}
            />
          </View>
          <View className="w-1/2 px-1 mb-2">
            <MetricCard
              title="ĐỘ ẨM KHÔNG KHÍ"
              value={
                last?.airHumidity != null ? last.airHumidity.toFixed(1) : '—'
              }
              unit="%"
            />
          </View>
          <View className="w-full px-1">
            <MetricCard
              title="ÁNH SÁNG (RAW)"
              value={last?.lightRaw ?? '—'}
              unit=""
            />
          </View>
        </View>

        {/* Row 2 */}
        <View className="flex-row flex-wrap -mx-1 mb-3">
          <View className="w-1/2 px-1 mb-2">
            <MetricCard
              title="NHIỆT ĐỘ ĐẤT"
              value={
                last?.soilTemperature != null
                  ? last.soilTemperature.toFixed(1)
                  : '—'
              }
              unit="°C"
            />
          </View>
          <View className="w-1/2 px-1 mb-2">
            <MetricCard
              title="ĐỘ ẨM ĐẤT"
              value={
                last?.soilHumidity != null ? last.soilHumidity.toFixed(1) : '—'
              }
              unit="%"
              warning={warnSoilHumidity}
            />
          </View>
          <View className="w-full px-1">
            <MetricCard
              title="pH"
              value={last?.ph != null ? Number(last.ph).toFixed(2) : '—'}
              unit=""
              warning={warnPH}
            />
          </View>
        </View>

        {/* Row 3 */}
        <View className="flex-row flex-wrap -mx-1">
          <View className="w-1/3 px-1 mb-2">
            <MetricCard
              title="NITƠ (N)"
              value={
                last?.nitrogen != null ? Number(last.nitrogen).toFixed(2) : '—'
              }
              unit="ppm"
            />
          </View>
          <View className="w-1/3 px-1 mb-2">
            <MetricCard
              title="LÂN (P)"
              value={
                last?.phosphorus != null
                  ? Number(last.phosphorus).toFixed(2)
                  : '—'
              }
              unit="ppm"
            />
          </View>
          <View className="w-1/3 px-1 mb-2">
            <MetricCard
              title="KALI (K)"
              value={
                last?.potassium != null
                  ? Number(last.potassium).toFixed(2)
                  : '—'
              }
              unit="ppm"
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
