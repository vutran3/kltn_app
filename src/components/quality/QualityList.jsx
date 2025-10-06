import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import ImagePreview from './parts/ImagePreview';
import AnnotatedImage from './parts/AnnotatedImage';
import Pagination from './parts/Pagination';

export default function QualityList({
  headerComponent,
  data = [],
  loading = false,
  page = 1,
  totalPages = 1,
  onPage,
}) {
  return (
    <View style={styles.wrap}>
      {headerComponent}

      <FlatList
        data={data}
        horizontal={true}
        keyExtractor={(item, idx) => item.id || String(idx)}
        ListHeaderComponent={
          <View>
            {loading && (
              <View style={styles.loadingRow}>
                <ActivityIndicator />
                <Text style={styles.loadingText}>Đang tải...</Text>
              </View>
            )}
            {!loading && data.length === 0 && (
              <View style={styles.emptyRow}>
                <Text style={{color: '#475569'}}>
                  Không có bản ghi nào trong khoảng thời gian đã chọn.
                </Text>
              </View>
            )}
          </View>
        }
        renderItem={({item, index}) => (
          <View style={styles.row}>
            {/* Ảnh thực tế */}
            <View style={[styles.cell, {width: 120}]}>
              <ImagePreview src={item.originalUrl} alt={`original-${index}`} />
            </View>

            {/* Thời gian */}
            {/* <View style={[styles.cell, {width: 140}]}>
              <Text numberOfLines={2} style={styles.timeText}>
                {item.capturedAt}
              </Text>
            </View> */}

            {/* Ảnh sau/chú thích */}
            <View style={[styles.cell, {flex: 1.3}]}>
              {item.boxes?.length && item.originalSize?.width ? (
                <AnnotatedImage
                  src={item.originalUrl}
                  boxes={item.boxes}
                  originalSize={item.originalSize}
                  thumbHeight={100}
                  showLabels
                  color="#0ea5e9"
                />
              ) : (
                <ImagePreview
                  src={item.originalUrl}
                  alt={`detected-${index}`}
                />
              )}
            </View>

            {/* Chuẩn đoán AI */}
            <View style={[styles.cell, {flex: 1.5, height: '100%'}]}>
              <View style={styles.messageBox}>
                <Text style={styles.messageText}>{item.aiMessage || '—'}</Text>
              </View>
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        contentContainerStyle={{paddingBottom: 8}}
      />
      <View style={{paddingHorizontal: 8}}>
        <Pagination page={page} totalPages={totalPages} onPage={onPage} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: 'rgba(255,255,255,0.9)',
    overflow: 'hidden',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
  },
  loadingText: {color: '#334155'},
  emptyRow: {padding: 16, alignItems: 'center'},
  row: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  sep: {height: 1, backgroundColor: '#F1F5F9'},
  cell: {paddingRight: 12},
  timeText: {color: '#0F172A'},
  messageBox: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  messageText: {color: '#334155', lineHeight: 18},
});
