import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { RefreshCcw } from 'lucide-react-native';
import instance from '../config/axios.config';

import Card from '../components/quality/Card';
import EmptyState from '../components/quality/EmptyState';
import TimeFilter from '../components/quality/TimeFilter';
import Row from '../components/quality/Row';
import Pagination from '../components/quality/Pagination';

import { mapResults, mapOne } from '../utils/mapQuality'; // giữ mapper như bạn đang dùng

export default function QualityCheckScreen() {
  const route = useRoute();
  const initialHcid = route?.params?.hcid || route?.params?.healthCheckId || null;

  // mode: 'single' (xem hcid) | 'list' (lọc theo thời gian)
  const [mode, setMode] = useState(initialHcid ? 'single' : 'list');

  const [range, setRange] = useState({ from: null, to: null });
  const [loading, setLoading] = useState(false);

  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  const fetchList = useCallback(async (p = 1, from = null, to = null) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 5, deviceId: 'esp32-01' };
      if (from) params.from = new Date(from).toISOString();
      if (to) params.to = new Date(to).toISOString();

      const { data } = await instance.get('/health-check/results', {
        params, headers: { Accept: 'application/json' }, timeout: 30000
      });

      const meta = data?.metadata || {};
      const results = meta?.results || data?.results || [];
      const pag = meta?.pagination || {};

      const mapped = mapResults(results, pag.page || p, pag.limit || limit);
      setRows(mapped);
      setPage(pag.page || p);
      setLimit(pag.limit || limit);
      setTotalPages(pag.totalPages || 1);
    } catch (e) {
      setRows([]); setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  const fetchOne = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const { data } = await instance.get(`/health-check/get/${id}`, {
        headers: { Accept: 'application/json' }, timeout: 30000
      });
      const record = data?.data || data?.metadata || data?.record || data?.result || data;
      const mapped = mapOne(record);
      setRows(mapped);
      setPage(1); setLimit(1); setTotalPages(1);
    } catch (e) {
      Alert.alert('Lỗi', 'Không tải được bản ghi.');
      setRows([]); setPage(1); setLimit(1); setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, []);

  // mount / khi mode đổi
  useEffect(() => {
    if (mode === 'single' && initialHcid) fetchOne(initialHcid);
    else fetchList(1, range.from, range.to);
  }, [mode, initialHcid, range.from, range.to, fetchOne, fetchList]);

  const actions = (
    <TouchableOpacity
      onPress={() => (mode === 'single' ? fetchOne(initialHcid) : fetchList(page, range.from, range.to))}
      activeOpacity={0.9}
      className="h-10 px-3 rounded-xl border bg-white flex-row items-center"
    >
      <RefreshCcw size={16} color="#0f172a" />
      <Text className="ml-2 text-slate-700">Làm mới</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView className="flex-1 bg-slate-50 p-4">
      <TimeFilter
        disabled={loading}
        onFilter={(from, to) => {
          // chuyển sang list mode để lọc theo thời gian, dù mở từ hcid
          setMode('list');
          setRange({ from, to });
          setPage(1);
          fetchList(1, from, to);
        }}
        onReset={() => {
          setMode('list');
          setRange({ from: null, to: null });
          setPage(1);
          fetchList(1);
        }}
      />

      <View className="mt-4">
        <Card
          title={mode === 'single' ? 'Chi tiết kiểm tra chất lượng' : 'Kiểm tra chất lượng nông sản'}
          subtitle={mode === 'single' ? `HCID: ${initialHcid}` : undefined}
          actions={actions}
        >
          {loading && (
            <View className="py-6 items-center">
              <ActivityIndicator />
              <Text className="text-slate-600 mt-2">Đang tải…</Text>
            </View>
          )}

          {!loading && rows.length === 0 && <EmptyState />}

          {!loading && rows.length > 0 && (
            <View className="rounded-2xl border border-slate-200 bg-white/90">
              {rows.map((r) => <Row key={r.id} row={r} />)}
              {mode === 'list' && (
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onPrev={() => page > 1 && fetchList(page - 1, range.from, range.to)}
                  onNext={() => page < totalPages && fetchList(page + 1, range.from, range.to)}
                />
              )}
            </View>
          )}
        </Card>
      </View>
    </ScrollView>
  );
}
