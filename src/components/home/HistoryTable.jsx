import React, {useEffect, useMemo, useState} from 'react';
import {View, Text, ScrollView, Pressable, Platform} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {fmtTs, toMs} from '../../utils/time';
import {getDataApi} from '../../utils/fetch';

const HISTORY_LIMIT = 100;

async function fetchHistory({deviceId, limit, fromMs, toMs, sort = -1}) {
  let params;
  if (fromMs && toMs) {
    params = {from: String(fromMs), to: String(toMs), sort: '1'};
  } else {
    params = {limit: String(limit ?? HISTORY_LIMIT), sort: String(sort)};
  }
  const res = await getDataApi(
    `/readings`,
    {deviceId, ...params},
    {cache: 'no-store'},
  );
  return res?.data?.data?.rows ?? [];
}

export default function HistoryTable({deviceId}) {
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [history, setHistory] = useState([]);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  const [showFrom, setShowFrom] = useState(false);
  const [showTo, setShowTo] = useState(false);

  const cols = useMemo(
    () => [
      {key: 't', label: 'Thời gian', width: 160},
      {key: 'airTemperature', label: 'Nhiệt độ', width: 100},
      {key: 'airHumidity', label: 'Độ ẩm', width: 90},
      {key: 'lightRaw', label: 'Ánh sáng', width: 100},
      {key: 'soilTemperature', label: 'Nhiệt độ đất', width: 120},
      {key: 'soilHumidity', label: 'Độ ẩm đất', width: 110},
      {key: 'nitrogen', label: 'Nito', width: 100},
      {key: 'phosphorus', label: 'Photpho', width: 110},
      {key: 'potassium', label: 'Kali', width: 100},
      {key: 'ph', label: 'PH', width: 90},
    ],
    [],
  );

  const loadData = async (did, {useFilter = false} = {}) => {
    setErr(null);
    setLoading(true);
    try {
      let rows = [];
      if (filterFrom && filterTo && useFilter) {
        rows = await fetchHistory({
          deviceId: did,
          fromMs: toMs(filterFrom) ?? Date.now() - 24 * 3600 * 1000,
          toMs: toMs(filterTo) ?? Date.now(),
          sort: 1,
        });
      } else if (!filterFrom && !filterTo) {
        rows = await fetchHistory({
          deviceId: did,
          limit: HISTORY_LIMIT,
          sort: -1,
        });
      }
      setHistory(rows);
    } catch (e) {
      setErr(e?.message || 'Fetch error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(deviceId);
  }, [deviceId]);

  const resetFilter = () => {
    setFilterFrom('');
    setFilterTo('');
    loadData(deviceId);
  };

  const onPick = (which, e, date) => {
    if (which === 'from') setShowFrom(false);
    else setShowTo(false);
    if (date) {
      const iso = date.toISOString().slice(0, 10); // YYYY-MM-DD
      which === 'from' ? setFilterFrom(iso) : setFilterTo(iso);
    }
  };

  const exportCsv = () => {
    const header = cols.map(c => c.label).join(',');
    const lines = history.map(r =>
      [
        fmtTs(r.t),
        r.airTemperature != null ? Number(r.airTemperature).toFixed(1) : '—',
        r.airHumidity != null ? Number(r.airHumidity).toFixed(1) : '—',
        r.lightRaw ?? '—',
        r.soilTemperature != null ? Number(r.soilTemperature).toFixed(1) : '—',
        r.soilHumidity != null ? Number(r.soilHumidity).toFixed(1) : '—',
        r.nitrogen != null ? Number(r.nitrogen).toFixed(2) : '—',
        r.phosphorus != null ? Number(r.phosphorus).toFixed(2) : '—',
        r.potassium != null ? Number(r.potassium).toFixed(2) : '—',
        r.ph != null ? Number(r.ph).toFixed(2) : '—',
      ].join(','),
    );
    const csv = [header, ...lines].join('\n');
    import('react-native').then(({Share}) => Share.Share.share({message: csv}));
  };

  return (
    <View>
      <Text className="text-xl font-bold text-blue-800 mb-3 text-center">
        LỊCH SỬ THU THẬP
      </Text>

      {/* Filter */}
      <View className="flex-row flex-wrap items-center gap-2 mb-3">
        <Pressable
          onPress={() => setShowFrom(true)}
          className="border border-gray-300 rounded px-3 py-2 mr-2">
          <Text>{filterFrom ? `Từ: ${filterFrom}` : 'Chọn từ ngày'}</Text>
        </Pressable>
        <Pressable
          onPress={() => setShowTo(true)}
          className="border border-gray-300 rounded px-3 py-2 mr-2">
          <Text>{filterTo ? `Đến: ${filterTo}` : 'Chọn đến ngày'}</Text>
        </Pressable>
        <Pressable
          onPress={() => loadData(deviceId, {useFilter: true})}
          className="bg-blue-600 rounded px-4 py-2 mr-2">
          <Text className="text-white">LỌC DỮ LIỆU</Text>
        </Pressable>
        <Pressable
          onPress={exportCsv}
          className="bg-green-600 rounded px-4 py-2 mr-2">
          <Text className="text-white">XUẤT CSV</Text>
        </Pressable>
        <Pressable
          onPress={resetFilter}
          className="bg-gray-500 rounded px-4 py-2">
          <Text className="text-white">RESET</Text>
        </Pressable>
      </View>

      {/* Date pickers */}
      {showFrom && (
        <DateTimePicker
          value={filterFrom ? new Date(filterFrom) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(e, d) => onPick('from', e, d || undefined)}
        />
      )}
      {showTo && (
        <DateTimePicker
          value={filterTo ? new Date(filterTo) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(e, d) => onPick('to', e, d || undefined)}
        />
      )}

      {/* Table */}
      <View className="border border-gray-300 rounded overflow-hidden">
        <ScrollView horizontal showsHorizontalScrollIndicator>
          <View>
            {/* Header */}
            <View className="bg-blue-600 h-10 flex-row items-center">
              {cols.map(c => (
                <View key={c.key} style={{width: c.width}} className="px-2">
                  <Text className="text-white font-semibold">{c.label}</Text>
                </View>
              ))}
            </View>
            {/* Rows */}
            <ScrollView style={{maxHeight: 480}}>
              {loading && (
                <View className="p-4">
                  <Text>Đang tải...</Text>
                </View>
              )}
              {err && (
                <View className="p-4">
                  <Text className="text-red-600">{err}</Text>
                </View>
              )}
              {!loading && !err && history.length === 0 && (
                <View className="p-6">
                  <Text className="text-gray-500">Không có dữ liệu</Text>
                </View>
              )}
              {history.map((row, idx) => (
                <View key={idx} className="flex-row border-b border-gray-200">
                  <Cell w={cols[0].width} text={fmtTs(row.t)} />
                  <Cell
                    w={cols[1].width}
                    text={
                      row.airTemperature != null
                        ? Number(row.airTemperature).toFixed(1)
                        : '—'
                    }
                  />
                  <Cell
                    w={cols[2].width}
                    text={
                      row.airHumidity != null
                        ? Number(row.airHumidity).toFixed(1)
                        : '—'
                    }
                  />
                  <Cell w={cols[3].width} text={row.lightRaw ?? '—'} />
                  <Cell
                    w={cols[4].width}
                    text={
                      row.soilTemperature != null
                        ? Number(row.soilTemperature).toFixed(1)
                        : '—'
                    }
                  />
                  <Cell
                    w={cols[5].width}
                    text={
                      row.soilHumidity != null
                        ? Number(row.soilHumidity).toFixed(1)
                        : '—'
                    }
                  />
                  <Cell
                    w={cols[6].width}
                    text={
                      row.nitrogen != null
                        ? Number(row.nitrogen).toFixed(2)
                        : '—'
                    }
                  />
                  <Cell
                    w={cols[7].width}
                    text={
                      row.phosphorus != null
                        ? Number(row.phosphorus).toFixed(2)
                        : '—'
                    }
                  />
                  <Cell
                    w={cols[8].width}
                    text={
                      row.potassium != null
                        ? Number(row.potassium).toFixed(2)
                        : '—'
                    }
                  />
                  <Cell
                    w={cols[9].width}
                    text={row.ph != null ? Number(row.ph).toFixed(2) : '—'}
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

function Cell({w, text}) {
  return (
    <View style={{width: w}} className="px-2 py-2 justify-center">
      <Text className="text-center text-[13px]">{text}</Text>
    </View>
  );
}
