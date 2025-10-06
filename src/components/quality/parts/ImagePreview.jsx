import React from 'react';
import {View, Image, StyleSheet} from 'react-native';

export default function ImagePreview({src, alt, height = 100}) {
  if (!src) return <View style={[styles.ph, {height}]} />;

  const isBase64 = src?.startsWith('data:image');
  const source = isBase64 ? {uri: src} : {uri: src};

  return (
    <View style={[styles.wrap, {height}]}>
      <Image
        source={source}
        style={styles.img}
        resizeMode="cover"
        accessible
        accessibilityLabel={alt || 'image'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
  },
  img: {width: '100%', height: '100%'},
  ph: {
    width: '100%',
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
});
