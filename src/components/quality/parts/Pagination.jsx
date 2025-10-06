import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import AppButton from '../primitives/AppButton';

export default function Pagination({page, totalPages, onPage}) {
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <View style={styles.wrap}>
      <Text style={styles.text}>
        Trang {page} / {totalPages}
      </Text>
      <View style={{flexDirection: 'row', gap: 8}}>
        <AppButton
          label="Trước"
          onPress={() => canPrev && onPage(page - 1)}
          disabled={!canPrev}
          variant={canPrev ? 'outline' : 'disabled'}
          height={36}
        />
        <AppButton
          label="Sau"
          onPress={() => canNext && onPage(page + 1)}
          disabled={!canNext}
          variant={canNext ? 'outline' : 'disabled'}
          height={36}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: 8,
    paddingBottom: 12,
    marginVertical: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  text: {fontSize: 13, color: '#475569'},
});
