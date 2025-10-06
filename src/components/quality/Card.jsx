import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

export default function Card({title, children, actions}) {
  return (
    <View style={styles.card}>
      {(title || actions) && (
        <View style={styles.header}>
          {title ? <Text style={styles.title}>{title}</Text> : <View />}
          {actions ? (
            <View style={{flexDirection: 'row'}}>{actions}</View>
          ) : null}
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 2},
  },
  header: {
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {fontSize: 18, fontWeight: '600', color: '#0F172A'},
});
