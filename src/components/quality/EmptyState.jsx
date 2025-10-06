import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Bot, Image as ImageIcon} from 'lucide-react-native';

export default function EmptyState({
  title = 'Chưa có dữ liệu',
  subtitle = 'Kết quả kiểm tra sẽ hiển thị tại đây.',
}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconRow}>
        <ImageIcon size={22} color="#64748B" />
        <Bot size={22} color="#64748B" />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.sub}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 24,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  iconRow: {flexDirection: 'row', gap: 8, marginBottom: 8},
  title: {fontSize: 16, fontWeight: '600', color: '#0F172A'},
  sub: {marginTop: 4, fontSize: 13, color: '#475569', textAlign: 'center'},
});
