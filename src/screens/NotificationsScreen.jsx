import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Alert, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { fetchNotification, markRead, deleteNotifi } from '../redux/thunks/notificationThunk';
import { selectList, selectUnread, selectNotif } from '../redux/selector';

function timeAgo(iso) {
  if (!iso) return '';
  const t = new Date(iso).getTime();
  const diff = Date.now() - t;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'vừa xong';
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  const d = Math.floor(h / 24);
  return `${d} ngày trước`;
}

function isNew(iso) {
  if (!iso) return false;
  return Date.now() - new Date(iso).getTime() < 60 * 60 * 1000; // < 1h
}

function Pill({ active, label, onPress, badge }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className={`px-3 py-1.5 rounded-full ${active ? 'bg-sky-500' : 'bg-white/5'}`}
    >
      <View className="flex-row items-center">
        <Text className={`text-xs font-semibold ${active ? 'text-white' : 'text-zinc-300'}`}>{label}</Text>
        {typeof badge === 'number' && badge > 0 && (
          <View className={`ml-1 px-1.5 rounded-full ${active ? 'bg-white/20' : 'bg-white/10'}`}>
            <Text className={`text-[10px] ${active ? 'text-white' : 'text-zinc-300'}`}>{badge}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

function Card({ it, onPress, onLongPress }) {
  return (
    <TouchableOpacity
      onPress={() => onPress(it)}
      onLongPress={() => onLongPress(it)}
      activeOpacity={0.9}
      className="mx-4 mb-3"
      style={{ elevation: 2 }}
    >
      <View className="flex-row rounded-xl bg-[#0f141b] border border-white/5">
        <View className={`w-1.5 rounded-l-xl ${it.read ? 'bg-transparent' : 'bg-sky-400'}`} />
        <View className="flex-1 px-4 py-3">
          <View className="flex-row items-center justify-between">
            <Text numberOfLines={1} className={`text-base font-semibold ${it.read ? 'text-zinc-200' : 'text-white'}`}>
              {it.title || 'Thông báo'}
            </Text>
            {isNew(it.createdAt) && (
              <View className="ml-2 px-2 py-0.5 rounded-full bg-emerald-500/15">
                <Text className="text-[10px] font-semibold text-emerald-300">New</Text>
              </View>
            )}
          </View>

          {!!it.body && <Text numberOfLines={2} className="text-sm text-zinc-400 mt-1">{it.body}</Text>}

          <View className="mt-2 flex-row items-center justify-between">
            <Text className="text-xs text-zinc-500">{timeAgo(it.createdAt)}</Text>
            {!it.read && (
              <View className="flex-row items-center">
                <View className="w-2.5 h-2.5 rounded-full bg-sky-400 mr-1.5" />
                <Text className="text-[11px] text-sky-300">Chưa đọc</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function NotificationsScreen({ navigation }) {
  const dispatch = useDispatch();
  const list = useSelector(selectList);
  const unread = useSelector(selectUnread);
  const notifState = useSelector(selectNotif);

  const { pagination = {}, status, filters } = notifState || {};
  const { page = 1, hasNext = false } = pagination || {};
  const loading = status === 'loading';
  const [refreshing, setRefreshing] = useState(false);

  // 'all' | 'unread'
  const [tab, setTab] = useState('all');

  // Header actions
  useEffect(() => {
    navigation.setOptions({
      title: 'Thông báo',
      headerRight: () => (
        <View className="flex-row gap-2 pr-2">
          <TouchableOpacity onPress={handleMarkAllRead} className="px-3 py-1.5 rounded-full bg-white/5">
            <Text className="text-sky-300 text-xs font-semibold">Đọc hết</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDeleteAll} className="px-3 py-1.5 rounded-full bg-white/5">
            <Text className="text-rose-300 text-xs font-semibold">Xoá hết</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, list?.length]);

  // --- FETCH CORE ---
  const doFetch = useCallback(
    async (pageNum = 1) => {
      const readFilter = tab === 'unread' ? 'false' : 'all';
      const res =  await dispatch(
        fetchNotification({
          page: pageNum,
          limit: 15,
          read: readFilter,
          sort: filters?.sort ?? '-ctime',
        })
      ).unwrap();
      return res;
    },
    [dispatch, tab, filters?.sort]
  );

  useFocusEffect(useCallback(() => { doFetch(1); }, [doFetch]));

  useEffect(() => {
    doFetch(1);
  }, [tab, doFetch]);

  const handlePressItem = useCallback(
    (it) => {
      if (!it.read) dispatch(markRead([it._id]));
      navigation.navigate('MainTabs', { screen:'Quanlitys' ,params:{ hcid: it?.data?.healthCheckId || null }});
    },
    [dispatch, navigation]
  );

  const handleLongPressItem = useCallback(
    (it) => {
      Alert.alert('Tác vụ', it.title || 'Thông báo', [
        { text: 'Đánh dấu đã đọc', onPress: () => dispatch(markRead([it._id])) },
        { text: 'Xoá', style: 'destructive', onPress: () => dispatch(deleteNotifi({ option: 'one', id: it._id })) },
        { text: 'Đóng', style: 'cancel' },
      ]);
    },
    [dispatch]
  );

  const handleMarkAllRead = useCallback(() => {
    if (!list?.length) return;
    Alert.alert('Xác nhận', 'Đánh dấu tất cả thông báo đã đọc?', [
      { text: 'Huỷ', style: 'cancel' },
      { text: 'Đồng ý', onPress: () => dispatch(markRead([])) },
    ]);
  }, [dispatch, list?.length]);

  const handleDeleteAll = useCallback(() => {
    if (!list?.length) return;
    Alert.alert('Xác nhận', 'Xoá TẤT CẢ thông báo?', [
      { text: 'Huỷ', style: 'cancel' },
      { text: 'Xoá hết', style: 'destructive', onPress: () => dispatch(deleteNotifi({ option: 'all' })) },
    ]);
  }, [dispatch, list?.length]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await doFetch(1).unwrap?.(); } catch {}
    setRefreshing(false);
  }, [doFetch]);

  const loadMore = useCallback(() => {
    if (loading || !hasNext) return;
    doFetch((page || 1) + 1);
  }, [loading, hasNext, page, doFetch]);

  const renderItem = useCallback(
    ({ item }) => <Card it={item} onPress={handlePressItem} onLongPress={handleLongPressItem} />,
    [handlePressItem, handleLongPressItem]
  );

  const keyExtractor = useCallback((it, idx) => String(it?._id ?? idx), []);

  const ListEmpty = useMemo(
    () => (
      <View className="items-center mt-14 px-6">
        <Text className="text-zinc-200 text-base font-semibold">Chưa có thông báo</Text>
        <Text className="text-zinc-400 mt-2 text-center">Khi có thông báo mới, chúng sẽ hiển thị tại đây.</Text>
      </View>
    ),
    []
  );

  const ListHeader = useMemo(
    () => (
      <View className="px-4 pt-3 pb-2 bg-[#0b0f14]">
        <View className="flex-row items-center justify-between">
          <View className="flex-row gap-2">
            <Pill label="Tất cả" active={tab === 'all'} onPress={() => setTab('all')} />
            <Pill label="Chưa đọc" active={tab === 'unread'} onPress={() => setTab('unread')} badge={unread} />
          </View>
          <View className="px-2 py-1 rounded-md bg-white/5">
            <Text className="text-[11px] text-zinc-300">Tổng: {list?.length || 0}</Text>
          </View>
        </View>
      </View>
    ),
    [tab, unread, list?.length]
  );

  return (
    <View className="flex-1 bg-[#0b0f14]">
      <FlatList
        data={list || []}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeader}
        stickyHeaderIndices={[0]}
        onEndReachedThreshold={0.25}
        onEndReached={loadMore}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#60a5fa" />}
        ListEmptyComponent={!loading && ListEmpty}
        ListFooterComponent={loading && hasNext ? <ActivityIndicator className="py-4" /> : null}
        contentContainerStyle={{ paddingBottom: 16 }}
      />
    </View>
  );
}
