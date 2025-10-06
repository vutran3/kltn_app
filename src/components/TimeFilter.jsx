import React, {useState} from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {Filter, RotateCcw} from 'lucide-react-native';

export default function TimeFilter({onFilter, onReset}) {
  const [from, setFrom] = useState(new Date());
  const [to, setTo] = useState(null);

  const [showFrom, setShowFrom] = useState(false);
  const [showTo, setShowTo] = useState(false);

  const fmt = d =>
    d ? new Date(d).toLocaleString('vi-VN', {hour12: false}) : '—';

  return (
    <View style={styles.card}>
      <Text style={styles.title}>BỘ LỌC THỜI GIAN</Text>

      <View style={styles.grid}>
        <View style={styles.col}>
          <Text style={styles.label}>Từ ngày</Text>
          <Pressable style={styles.input} onPress={() => setShowFrom(true)}>
            <Text style={styles.inputText}>{fmt(from)}</Text>
          </Pressable>
          {showFrom && (
            <DateTimePicker
              value={from || new Date()}
              mode="datetime"
              is24Hour
              onChange={(e, d) => {
                setShowFrom(false);
                if (d) setFrom(d);
              }}
            />
          )}
        </View>

        <View style={styles.col}>
          <Text style={styles.label}>Đến ngày</Text>
          <Pressable style={styles.input} onPress={() => setShowTo(true)}>
            <Text style={styles.inputText}>{fmt(to)}</Text>
          </Pressable>
          {showTo && (
            <DateTimePicker
              value={to || new Date()}
              mode="datetime"
              is24Hour
              onChange={(e, d) => {
                setShowTo(false);
                setTo(d || null);
              }}
            />
          )}
        </View>

        <View style={styles.actions}>
          <Pressable
            style={[styles.btn, styles.btnPrimary]}
            onPress={() => onFilter?.(from, to)}>
            <Filter size={18} color="#fff" style={{marginRight: 6}} />
            <Text style={styles.btnPrimaryText}>Lọc</Text>
          </Pressable>

          <Pressable
            style={[styles.btn, styles.btnGhost]}
            onPress={() => {
              setTo(null);
              const f = new Date();
              setFrom(f);
              onReset && onReset();
            }}>
            <RotateCcw size={18} color="#334155" style={{marginRight: 6}} />
            <Text style={styles.btnGhostText}>Reset</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  title: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
  },
  grid: {marginTop: 12, gap: 12},
  col: {gap: 6},
  label: {fontSize: 13, fontWeight: '500', color: '#334155'},
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  inputText: {color: '#0f172a'},
  actions: {flexDirection: 'row', gap: 8, marginTop: 4},
  btn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: {backgroundColor: '#0284c7'},
  btnPrimaryText: {color: '#fff', fontWeight: '600'},
  btnGhost: {backgroundColor: '#fff', borderWidth: 1, borderColor: '#cbd5e1'},
  btnGhostText: {color: '#334155', fontWeight: '600'},
});
