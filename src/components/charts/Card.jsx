import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

export default function Card({title, children}) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <View style={{marginTop: 8}}>{children}</View>
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
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
});
