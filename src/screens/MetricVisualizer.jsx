import React, {useEffect, useState, useCallback} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Alert,
} from 'react-native';
import TimeFilter from '../components/TimeFilter';
import MetricChart from '../components/MetricChart';
import Card from '../components/Card';
import {getDataApi} from '../utils/fetch';
import {mapApiRowsToSeries} from '../utils/map';

const DEVICE_ID = 'esp32s3-01';

export default function MetricVisualizer() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLatest = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getDataApi('/readings', {
        deviceId: DEVICE_ID,
        limit: '100',
        sort: '-1',
      });
      const rows = res?.data?.data?.rows || res?.data?.rows || res?.rows || [];
      setData(mapApiRowsToSeries(rows));
    } catch (e) {
      const msg = e?.message || 'Lỗi tải dữ liệu';
      setError(msg);
      Alert.alert('Lỗi', msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLatest();
  }, [fetchLatest]);

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await fetchLatest();
    } finally {
      setRefreshing(false);
    }
  }, [fetchLatest]);

  const handleFilter = async (fromDate, toDate) => {
    try {
      setLoading(true);
      setError(null);

      if (fromDate) {
        const from = new Date(fromDate);
        const to = toDate ? new Date(toDate) : new Date();
        const res = await getDataApi('/readings', {
          deviceId: DEVICE_ID,
          from: String(from.getTime()),
          to: String(to.getTime()),
          sort: '1',
        });
        const rows =
          res?.data?.data?.rows || res?.data?.rows || res?.rows || [];
        setData(mapApiRowsToSeries(rows));
      } else {
        await fetchLatest();
      }
    } catch (e) {
      const msg = e?.message || 'Lọc dữ liệu thất bại';
      setError(msg);
      Alert.alert('Lỗi', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    await fetchLatest();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <TimeFilter onFilter={handleFilter} onReset={handleReset} />

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>Lỗi: {error}</Text>
          </View>
        ) : null}

        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" />
            <Text style={styles.loadingText}> Đang tải dữ liệu…</Text>
          </View>
        ) : null}

        <MetricChart
          title="BIỂU ĐỒ NHIỆT ĐỘ"
          type="line"
          data={data}
          series={[{key: 'temp', name: 'Nhiệt độ (°C)'}]}
          yUnit="°C"
          height={288}
        />

        <MetricChart
          title="BIỂU ĐỒ LƯỢNG MƯA"
          type="line"
          data={data}
          series={[{key: 'rain', name: 'Mưa (0/1)'}]}
          yUnit=""
          height={288}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#F3FCE7'},
  container: {padding: 16, gap: 16},
  errorBox: {
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fff1f2',
    padding: 12,
    borderRadius: 12,
  },
  errorText: {color: '#b91c1c'},
  loadingRow: {flexDirection: 'row', alignItems: 'center', paddingVertical: 4},
  loadingText: {color: '#4b5563', marginLeft: 8},
  debugText: {fontFamily: 'monospace', fontSize: 12, color: '#334155'},
});
