import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View, ScrollView, StyleSheet, SafeAreaView} from 'react-native';
import {RefreshCcw} from 'lucide-react-native';
import Card from '../components/quality/Card';
import TimeFilter from '../components/shared/TimeFilter';
import QualityList from '../components/quality/QualityList';
import instance from '../config/axios.config';
import AppButton from '../components/quality/primitives/AppButton';

const fmtVN = iso => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

function mapResults(results, page, limit) {
  return results.map((item, idx) => {
    const ai = item?.ai_prediction || {};
    const originalUrl = item?.image_predetect?.image_url || '';
    const annotatedB64 = item?.ai_prediction?.annotated_image_base64;
    const detectedUrl = annotatedB64
      ? `data:image/png;base64,${annotatedB64}`
      : originalUrl;

    const aiMessage =
      item?.predicting_description ||
      item?.ai_prediction?.prediction_text ||
      '';

    return {
      id: item?._id || `${page}-${idx}`,
      no: (page - 1) * (limit || 0) + idx + 1,
      originalUrl,
      detectedUrl,
      capturedAt: fmtVN(item?.inspection_date),
      aiMessage,
      boxes: ai?.boxes || [],
      originalSize: {
        width: ai?.image_width || item?.image_predetect?.width || 0,
        height: ai?.image_height || item?.image_predetect?.height || 0,
      },
    };
  });
}

export default function QualityCheckScreen() {
  const [range, setRange] = useState({from: null, to: null});
  const [loading, setLoading] = useState(false);

  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPage = useCallback(
    async (p = 1, from = null, to = null) => {
      setLoading(true);
      const controller = new AbortController();
      const deviceId = 'esp32s3-01';
      try {
        const params = {page: p};
        // nếu backend có hỗ trợ lọc thời gian, truyền kèm ISO
        if (from) params.from = new Date(from).toISOString();
        if (to) params.to = new Date(to).toISOString();
        if (deviceId) params.deviceId = deviceId;
        const {data} = await instance.get('/health-check/results', {
          params,
          signal: controller.signal,
          timeout: 30000,
          headers: {Accept: 'application/json'},
        });

        const meta = data?.metadata || {};
        const results = meta?.results || [];
        const pag = meta?.pagination || {};
        const mapped = mapResults(results, pag.page || p, pag.limit || limit);
        setRows(mapped);
        setPage(pag.page || p);
        setLimit(pag.limit || limit);
        setTotalPages(pag.totalPages || 1);
      } catch (err) {
        // if (instance.isCancel(err)) {
        // } else {
        //     console.error("Fetch results failed:", err?.message || err);
        //     setRows([]);
        //     setTotalPages(1);
        // }
      } finally {
        setLoading(false);
      }

      // return cleanup để hủy nếu component unmount
      return () => controller.abort();
    },
    [limit],
  );

  useEffect(() => {
    const cleanup = fetchPage(1);
    return () => {
      if (typeof cleanup === 'function') cleanup();
    };
  }, [fetchPage]);

  const handleFilter = async (from, to) => {
    setRange({from, to});
    await fetchPage(1, from, to);
  };

  const handlePage = async p => {
    setPage(p);
    await fetchPage(p, range.from, range.to);
  };

  const actions = (
    <AppButton
      variant="outline"
      onPress={() => fetchPage(page, range.from, range.to)}
      icon={<RefreshCcw size={18} style={{marginRight: 8}} />}
      label="Làm mới"
      height={40}
      paddingH={12}
    />
  );

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#F8FAFC'}}>
      <View style={styles.container}>
        <Card title="Kiểm tra chất lượng nông sản" actions={actions}>
          <QualityList
            data={rows}
            loading={loading}
            page={page}
            totalPages={totalPages}
            onPage={handlePage}
            headerComponent={
              <TimeFilter
                onFilter={handleFilter}
                onReset={() => {
                  setRange({from: null, to: null});
                  fetchPage(1);
                }}
              />
            }
          />
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {padding: 16, gap: 16},
});
