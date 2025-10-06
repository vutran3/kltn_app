import React, {useState} from 'react';
import {View, Text, Pressable, StyleSheet, Platform} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {Filter, RotateCcw} from 'lucide-react-native';

export default function TimeFilter({onFilter, onReset}) {
  const [from, setFrom] = useState(new Date());
  const [to, setTo] = useState(null);

  // iOS: dùng 1 picker 'datetime'
  const [showFromIOS, setShowFromIOS] = useState(false);
  const [showToIOS, setShowToIOS] = useState(false);

  // Android: tách thành 2 bước (date -> time) vì 'datetime' không support
  const [showFromDate, setShowFromDate] = useState(false);
  const [showFromTime, setShowFromTime] = useState(false);
  const [tempFrom, setTempFrom] = useState(new Date());

  const [showToDate, setShowToDate] = useState(false);
  const [showToTime, setShowToTime] = useState(false);
  const [tempTo, setTempTo] = useState(new Date());

  const fmt = d =>
    d ? new Date(d).toLocaleString('vi-VN', {hour12: false}) : '—';

  const openFrom = () => {
    if (Platform.OS === 'android') setShowFromDate(true);
    else setShowFromIOS(true);
  };
  const openTo = () => {
    if (Platform.OS === 'android') setShowToDate(true);
    else setShowToIOS(true);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>BỘ LỌC THỜI GIAN</Text>

      <View style={styles.grid}>
        <View style={styles.col}>
          <Text style={styles.label}>Từ ngày</Text>
          <Pressable style={styles.input} onPress={openFrom}>
            <Text style={styles.inputText}>{fmt(from)}</Text>
          </Pressable>

          {/* iOS: 1 picker datetime */}
          {Platform.OS === 'ios' && showFromIOS && (
            <DateTimePicker
              value={from || new Date()}
              mode="datetime"
              display="default"
              is24Hour
              onChange={(e, d) => {
                setShowFromIOS(false);
                if (e?.type === 'dismissed') return;
                if (d) setFrom(d);
              }}
            />
          )}

          {/* Android: step 1 -> date */}
          {Platform.OS === 'android' && showFromDate && (
            <DateTimePicker
              value={from || new Date()}
              mode="date"
              display="default"
              onChange={(e, d) => {
                setShowFromDate(false);
                if (e?.type === 'dismissed') return;
                const base = d || new Date();
                setTempFrom(base);
                setShowFromTime(true);
              }}
            />
          )}
          {/* Android: step 2 -> time */}
          {Platform.OS === 'android' && showFromTime && (
            <DateTimePicker
              value={tempFrom}
              mode="time"
              is24Hour
              display="default"
              onChange={(e, d) => {
                setShowFromTime(false);
                if (e?.type === 'dismissed') return;
                const t = d || tempFrom;
                const merged = new Date(
                  tempFrom.getFullYear(),
                  tempFrom.getMonth(),
                  tempFrom.getDate(),
                  t.getHours(),
                  t.getMinutes(),
                  0,
                  0,
                );
                setFrom(merged);
              }}
            />
          )}
        </View>

        <View style={styles.col}>
          <Text style={styles.label}>Đến ngày</Text>
          <Pressable style={styles.input} onPress={openTo}>
            <Text style={styles.inputText}>{fmt(to)}</Text>
          </Pressable>

          {/* iOS: 1 picker datetime */}
          {Platform.OS === 'ios' && showToIOS && (
            <DateTimePicker
              value={to || new Date()}
              mode="datetime"
              display="default"
              is24Hour
              onChange={(e, d) => {
                setShowToIOS(false);
                if (e?.type === 'dismissed') return;
                setTo(d || null);
              }}
            />
          )}

          {/* Android: step 1 -> date */}
          {Platform.OS === 'android' && showToDate && (
            <DateTimePicker
              value={to || new Date()}
              mode="date"
              display="default"
              onChange={(e, d) => {
                setShowToDate(false);
                if (e?.type === 'dismissed') return;
                const base = d || new Date();
                setTempTo(base);
                setShowToTime(true);
              }}
            />
          )}
          {/* Android: step 2 -> time */}
          {Platform.OS === 'android' && showToTime && (
            <DateTimePicker
              value={tempTo}
              mode="time"
              is24Hour
              display="default"
              onChange={(e, d) => {
                setShowToTime(false);
                if (e?.type === 'dismissed') return;
                const t = d || tempTo;
                const merged = new Date(
                  tempTo.getFullYear(),
                  tempTo.getMonth(),
                  tempTo.getDate(),
                  t.getHours(),
                  t.getMinutes(),
                  0,
                  0,
                );
                setTo(merged);
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
