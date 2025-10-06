import React from 'react';
import {Pressable, Text, StyleSheet} from 'react-native';

export default function AppButton({
  label,
  onPress,
  icon,
  variant = 'secondary', // primary | outline | secondary | disabled
  height = 44,
  paddingH = 14,
  disabled = false,
}) {
  const v = disabled ? 'disabled' : variant;

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({pressed}) => [
        styles.base,
        styles[v],
        {
          height,
          paddingHorizontal: paddingH,
          opacity: pressed ? 0.8 : 1,
        },
      ]}>
      {icon}
      <Text style={[styles.text, styles[`text_${v}`]]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  // variants
  primary: {backgroundColor: '#0284C7', borderColor: '#0284C7'},
  outline: {backgroundColor: '#fff', borderColor: '#CBD5E1'},
  secondary: {backgroundColor: '#F8FAFC', borderColor: '#E2E8F0'},
  disabled: {backgroundColor: '#F1F5F9', borderColor: '#E2E8F0'},

  // text colors
  text_primary: {color: '#fff', fontWeight: '600'},
  text_outline: {color: '#0F172A', fontWeight: '600'},
  text_secondary: {color: '#0F172A', fontWeight: '600'},
  text_disabled: {color: '#94A3B8', fontWeight: '600'},
  text: {fontSize: 14},
});
