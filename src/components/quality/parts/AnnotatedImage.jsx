import React, {useMemo} from 'react';
import {View, Image, StyleSheet} from 'react-native';
import Svg, {Rect, Text as SvgText} from 'react-native-svg';

export default function AnnotatedImage({
  src,
  boxes = [],
  originalSize = {width: 0, height: 0},
  thumbHeight = 100,
  showLabels = true,
  color = '#0ea5e9',
}) {
  const {vw, vh, scaleX, scaleY} = useMemo(() => {
    const {width, height} = originalSize || {width: 0, height: 0};
    if (!width || !height) return {vw: 0, vh: 0, scaleX: 1, scaleY: 1};
    const vh = thumbHeight;
    const vw = (width / height) * vh;
    return {vw, vh, scaleX: vw / width, scaleY: vh / height};
  }, [originalSize, thumbHeight]);

  if (!src || !originalSize?.width || !originalSize?.height) {
    return <View style={[styles.ph, {height: thumbHeight}]} />;
  }

  const source = {uri: src};

  return (
    <View
      style={{
        width: vw,
        height: vh,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#F8FAFC',
      }}>
      <Image
        source={source}
        style={{width: vw, height: vh, position: 'absolute'}}
        resizeMode="cover"
      />
      <Svg width={vw} height={vh} style={{position: 'absolute'}}>
        {boxes.map((b, i) => {
          const x = (b.x || b.left || 0) * scaleX;
          const y = (b.y || b.top || 0) * scaleY;
          const w = (b.w || b.width || 0) * scaleX;
          const h = (b.h || b.height || 0) * scaleY;
          const label = b.label || b.class || '';
          return (
            <React.Fragment key={i}>
              <Rect
                x={x}
                y={y}
                width={w}
                height={h}
                stroke={color}
                strokeWidth={2}
                fill="none"
                rx={4}
              />
              {showLabels && label ? (
                <SvgText
                  x={x + 4}
                  y={Math.max(y - 4, 12)}
                  fontSize="10"
                  fill={color}>
                  {label}
                  {typeof b.score === 'number'
                    ? ` (${(b.score * 100).toFixed(0)}%)`
                    : ''}
                </SvgText>
              ) : null}
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  ph: {width: '100%', borderRadius: 8, backgroundColor: '#F1F5F9'},
});
