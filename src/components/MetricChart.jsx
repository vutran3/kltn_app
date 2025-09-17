import React, {useMemo} from 'react';
import {View, StyleSheet, Text, Dimensions, ScrollView} from 'react-native';
import Card from './Card';
import {LineChart} from 'react-native-chart-kit';

export default function MetricChart({
  title,
  type = 'line',
  data = [],
  series = [],
  yUnit = '',
  height = 280,
  pxPerPoint = 40,
}) {
  const {width} = Dimensions.get('window');
  // chiều rộng khả dụng của thẻ Card (trừ padding khoảng 32px)
  const containerWidth = Math.max(280, width - 32);

  const palette = [
    '#2563eb',
    '#16a34a',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#06b6d4',
    '#a16207',
  ];
  const hexToRgba = (hex, opacity = 1) => {
    const h = hex.replace('#', '');
    const bigint = parseInt(h, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const shorten = s => {
    if (!s) return '';
    const str = String(s).replace(',', ' ').trim();
    const parts = str.split(' ');
    const last = parts[parts.length - 1];
    if (last && last.includes(':')) return last.slice(0, 5);
    return str.slice(0, 10);
  };

  const chartData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) {
      return {labels: [], datasets: [], legend: []};
    }
    const rawLabels = data.map(d => d.time);
    const maxLabels = 8;
    const step = Math.max(1, Math.ceil(rawLabels.length / maxLabels));
    const labels = rawLabels.map((l, i) =>
      i % step === 0 ? shorten(String(l)) : '',
    );

    const datasets = series.map((s, idx) => ({
      data: data.map(d => {
        const v =
          d && Object.prototype.hasOwnProperty.call(d, s.key) ? d[s.key] : null;
        const n = typeof v === 'string' ? Number(v) : v;
        return Number.isFinite(n) ? n : 0;
      }),
      color: (opacity = 1) => hexToRgba(palette[idx % palette.length], opacity),
      strokeWidth: 2,
      withDots: true,
    }));

    return {labels, datasets, legend: series.map(s => s.name)};
  }, [data, series]);

  // Tính chiều rộng nội dung cho scroll ngang: mỗi điểm có tối thiểu pxPerPoint px
  const pointsCount = useMemo(
    () => chartData.datasets.reduce((m, ds) => Math.max(m, ds.data.length), 0),
    [chartData],
  );
  const contentWidth = Math.max(
    containerWidth,
    Math.max(320, pointsCount * pxPerPoint),
  );

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(51, 65, 85, ${opacity})`, // slate-700
    labelColor: (opacity = 1) => `rgba(71, 85, 105, ${opacity})`, // slate-600
    propsForDots: {r: '3'},
    propsForBackgroundLines: {strokeDasharray: '3 3'},
  };

  return (
    <Card title={title}>
      <View style={{height}}>
        {data && data.length ? (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator
              contentContainerStyle={{paddingBottom: 8}}>
              <LineChart
                data={chartData}
                width={contentWidth}
                height={height}
                yAxisSuffix={yUnit ? ` ${yUnit}` : ''}
                chartConfig={chartConfig}
                bezier
                fromZero
                withShadow={false}
                segments={4}
                yLabelsOffset={6}
                xLabelsOffset={-2}
              />
            </ScrollView>
            <View style={styles.legendRow}>
              {series.map((s, idx) => (
                <View key={s.key} style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      {backgroundColor: palette[idx % palette.length]},
                    ]}
                  />
                  <Text style={styles.legendText}>{s.name}</Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <Text style={styles.empty}>Không có dữ liệu để hiển thị</Text>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  empty: {textAlign: 'center', color: '#6b7280', marginTop: 8},
  legendRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8},
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  legendDot: {width: 10, height: 10, borderRadius: 5, marginRight: 6},
  legendText: {fontSize: 12, color: '#334155'},
});
