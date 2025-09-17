// AgriManagerRN.jsx
// React Native conversion of your ReactJS Produce Manager + tabs (Products, Fields, Devices)
// Requirements:
// 1) NativeWind for Tailwind-like classes in RN (https://www.nativewind.dev/)
// 2) @react-native-picker/picker for dropdowns
// 3) Your existing Redux store, selectors, and thunks (import paths preserved)

import React, {useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  FlatList,
  Switch,
  Alert,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {useDispatch, useSelector} from 'react-redux';
import {
  getDataApi,
  postDataApi,
  patchDataApi,
  deleteDataApi,
} from '../utils/fetch';
import {
  selectProductData,
  selectFieldData,
  selectDeviceData,
} from '../redux/selector';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct as deleteProductThunk,
} from '../redux/thunks/productThunk';
import {getFields} from '../redux/thunks/fieldThunk';
import {getDevices} from '../redux/thunks/deviceThunk';

// Shared UI
function SectionCard({title, subtitle, actions, children}) {
  return (
    <View className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-6">
      {(title || subtitle || actions) && (
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1 pr-3">
            {title ? (
              <Text className="text-lg font-semibold text-gray-900">
                {title}
              </Text>
            ) : null}
            {subtitle ? (
              <Text className="text-gray-500 mt-0.5">{subtitle}</Text>
            ) : null}
          </View>
          {actions ? <View className="ml-2">{actions}</View> : null}
        </View>
      )}
      {children}
    </View>
  );
}

function TabNav({tabs, active, onChange}) {
  return (
    <View className="border-b border-gray-200 mb-4">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="-mb-px">
        <View className="flex-row gap-4">
          {tabs.map(t => {
            const isActive = active === t.value;
            return (
              <Pressable
                key={t.value}
                onPress={() => onChange(t.value)}
                className="px-3 py-2">
                <Text
                  className={`text-sm font-medium ${
                    isActive ? 'text-indigo-600' : 'text-gray-500'
                  }`}>
                  {t.label}
                </Text>
                <View
                  className={`h-0.5 mt-1 ${
                    isActive ? 'bg-indigo-500' : 'bg-transparent'
                  }`}
                />
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

// Simple button
function Btn({title, onPress, variant = 'primary', disabled}) {
  const base = 'px-4 py-2.5 rounded-xl';
  const styles =
    variant === 'primary'
      ? `${base} bg-indigo-600 ${disabled ? 'opacity-50' : ''}`
      : variant === 'danger'
      ? `${base} bg-red-600`
      : variant === 'outline'
      ? `${base} border border-gray-300`
      : base;
  const text =
    variant === 'primary' || variant === 'danger'
      ? 'text-white'
      : 'text-gray-700';
  return (
    <Pressable onPress={onPress} disabled={disabled} className={styles}>
      <Text className={`text-sm font-semibold ${text}`}>{title}</Text>
    </Pressable>
  );
}

function Input({
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
  secureTextEntry,
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      keyboardType={keyboardType}
      secureTextEntry={secureTextEntry}
      multiline={multiline}
      className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900"
    />
  );
}

// Products Tab
const productInitial = {
  field: '',
  name: '',
  type: '',
  planting_date: '',
  expected_harvest_date: '',
  actual_harvest_date: '',
  weight_unit: '',
  price_per_unit: '',
  status: 'growing',
  images: '',
};

const STATUS = [
  {value: 'growing', label: 'Đang trồng'},
  {value: 'harvesting', label: 'Thu hoạch'},
  {value: 'processing', label: 'Sơ chế'},
];

function ProductsTab() {
  const dispatch = useDispatch();
  const {items: productList = []} = useSelector(selectProductData);
  const {items: fieldList = []} = useSelector(selectFieldData);

  const [form, setForm] = useState(productInitial);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return productList;
    const s = search.toLowerCase();
    return productList.filter(
      it =>
        it.name?.toLowerCase().includes(s) ||
        it.type?.toLowerCase().includes(s),
    );
  }, [productList, search]);

  useEffect(() => {
    dispatch(getProducts());
    dispatch(getFields());
  }, [dispatch]);

  const onSubmit = async () => {
    const payload = {
      ...form,
      price_per_unit: form.price_per_unit
        ? Number(form.price_per_unit)
        : undefined,
      images: form.images
        ? form.images
            .split(',')
            .map(s => s.trim())
            .filter(Boolean)
        : [],
    };

    try {
      setLoading(true);
      if (editingId) {
        await dispatch(updateProduct({productId: editingId, data: payload}));
      } else {
        await dispatch(createProduct(payload));
      }
      setForm(productInitial);
      setEditingId(null);
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  };

  const onEdit = it => {
    setEditingId(it._id);
    setForm({
      field: typeof it.field === 'string' ? it.field : it.field?._id || '',
      name: it.name || '',
      type: it.type || '',
      planting_date: it.planting_date ? it.planting_date.substring(0, 10) : '',
      expected_harvest_date: it.expected_harvest_date
        ? it.expected_harvest_date.substring(0, 10)
        : '',
      actual_harvest_date: it.actual_harvest_date
        ? it.actual_harvest_date.substring(0, 10)
        : '',
      weight_unit: it.weight_unit || '',
      price_per_unit: it.price_per_unit ?? '',
      status: it.status || 'growing',
      images: Array.isArray(it.images) ? it.images.join(', ') : '',
    });
  };

  const onDelete = async id => {
    Alert.alert('Xóa nông sản', 'Bạn có chắc muốn xóa?', [
      {text: 'Hủy', style: 'cancel'},
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await dispatch(deleteProductThunk(id));
          } catch (e) {
            console.warn(e);
          }
        },
      },
    ]);
  };

  const Header = () => (
    <View>
      <SectionCard
        title={editingId ? 'Cập nhật nông sản' : 'Thêm nông sản'}
        subtitle="Nhập thông tin cơ bản và lịch thu hoạch"
        actions={
          <View className="flex-row gap-2">
            {editingId ? (
              <Btn
                title="Hủy"
                variant="outline"
                onPress={() => {
                  setEditingId(null);
                  setForm(productInitial);
                }}
              />
            ) : null}
            <Btn
              title={editingId ? 'Lưu thay đổi' : 'Tạo mới'}
              onPress={onSubmit}
              disabled={loading}
            />
          </View>
        }>
        <View className="gap-4">
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1">
              Nơi trồng
            </Text>
            <View className="rounded-xl border border-gray-300 overflow-hidden">
              <Picker
                selectedValue={form.field}
                onValueChange={v => setForm({...form, field: v})}>
                <Picker.Item label="-- Chọn nơi trồng --" value="" />
                {fieldList.map(f => (
                  <Picker.Item key={f._id} label={f.name} value={f._id} />
                ))}
              </Picker>
            </View>
          </View>

          <View className="flex-row gap-4">
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Tên nông sản
              </Text>
              <Input
                value={form.name}
                onChangeText={v => setForm({...form, name: v})}
                placeholder="Dâu tây, xà lách…"
              />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Loại nông sản
              </Text>
              <Input
                value={form.type}
                onChangeText={v => setForm({...form, type: v})}
                placeholder="rau/củ/quả…"
              />
            </View>
          </View>

          <View className="flex-row gap-4">
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Ngày gieo trồng
              </Text>
              <Input
                value={form.planting_date}
                onChangeText={v => setForm({...form, planting_date: v})}
                placeholder="YYYY-MM-DD"
              />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Thu hoạch dự kiến
              </Text>
              <Input
                value={form.expected_harvest_date}
                onChangeText={v => setForm({...form, expected_harvest_date: v})}
                placeholder="YYYY-MM-DD"
              />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Thu hoạch thực tế
              </Text>
              <Input
                value={form.actual_harvest_date}
                onChangeText={v => setForm({...form, actual_harvest_date: v})}
                placeholder="YYYY-MM-DD"
              />
            </View>
          </View>

          <View className="flex-row gap-4">
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Đơn vị cân nặng
              </Text>
              <Input
                value={form.weight_unit}
                onChangeText={v => setForm({...form, weight_unit: v})}
                placeholder="kg, g…"
              />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Giá/đơn vị
              </Text>
              <Input
                value={String(form.price_per_unit)}
                keyboardType="numeric"
                onChangeText={v => setForm({...form, price_per_unit: v})}
                placeholder="vd: 25000"
              />
            </View>
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1">
              Ảnh (URL, phân tách dấu phẩy)
            </Text>
            <Input
              value={form.images}
              onChangeText={v => setForm({...form, images: v})}
              placeholder="https://..., https://..."
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Trạng thái
            </Text>
            <View className="flex-row gap-2 rounded-lg border border-gray-200 p-1 bg-gray-50">
              {STATUS.map(item => {
                const active = form.status === item.value;
                return (
                  <Pressable
                    key={item.value}
                    onPress={() => setForm({...form, status: item.value})}
                    className={`flex-1 px-3.5 py-2 rounded-lg border ${
                      active
                        ? 'bg-indigo-600 border-indigo-600'
                        : 'bg-white border-gray-300'
                    }`}>
                    <Text
                      className={`text-center text-sm ${
                        active ? 'text-white' : 'text-gray-700'
                      }`}>
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </SectionCard>

      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-sm text-gray-500 mr-4">
          {loading ? 'Đang tải...' : `Tổng: ${productList.length} nông sản`}
        </Text>
        <View className="flex-1 items-end">
          <View className="w-72">
            <Input
              value={search}
              onChangeText={setSearch}
              placeholder="Tìm theo tên/loại…"
            />
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <FlatList
      className="flex-1"
      data={filtered}
      keyExtractor={item => item._id}
      renderItem={({item: it}) => (
        <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
          <Text className="flex-[2] text-gray-900">{it.name}</Text>
          <Text className="flex-[2] text-gray-700">
            {typeof it.field === 'string' ? it.field : it.field?.name || '-'}
          </Text>
          <View className="flex-[1]">
            <View
              className={`self-start rounded-full px-2.5 py-0.5 ${
                it.status === 'growing'
                  ? 'bg-green-100'
                  : it.status === 'harvesting'
                  ? 'bg-yellow-100'
                  : 'bg-indigo-100'
              }`}>
              <Text
                className={`${
                  it.status === 'growing'
                    ? 'text-green-700'
                    : it.status === 'harvesting'
                    ? 'text-yellow-800'
                    : 'text-indigo-700'
                } text-xs font-medium`}>
                {it.status || '-'}
              </Text>
            </View>
          </View>
          <Text className="flex-[1]">{it.price_per_unit ?? '-'}</Text>
          <Text className="flex-[1]">{it.weight_unit ?? '-'}</Text>
          <View className="flex-row gap-2 ml-auto">
            <Btn title="Sửa" variant="outline" onPress={() => onEdit(it)} />
            <Btn
              title="Xóa"
              variant="danger"
              onPress={() => onDelete(it._id)}
            />
          </View>
        </View>
      )}
      ListHeaderComponent={Header}
      ListEmptyComponent={
        <Text className="p-4 text-center text-gray-500">Không có dữ liệu</Text>
      }
      contentContainerStyle={{paddingBottom: 24}}
    />
  );
}

// Fields Tab
const fieldInitial = {
  name: '',
  established_date: '',
  description: '',
  total_area: '',
  field_type: '',
  is_active: true,
  devices: [],
};

function FieldsTab() {
  const dispatch = useDispatch();
  const {items: fieldList = []} = useSelector(selectFieldData);
  const {items: deviceList = []} = useSelector(selectDeviceData);
  const [form, setForm] = useState(fieldInitial);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return fieldList;
    const s = search.toLowerCase();
    return fieldList.filter(
      it =>
        it.name?.toLowerCase().includes(s) ||
        it.field_type?.toLowerCase().includes(s),
    );
  }, [fieldList, search]);

  useEffect(() => {
    dispatch(getFields());
    dispatch(getDevices());
  }, [dispatch]);

  const onSubmit = async () => {
    const payload = {
      ...form,
      total_area: form.total_area ? Number(form.total_area) : undefined,
      established_date: form.established_date || undefined,
    };
    try {
      setLoading(true);
      if (editingId) {
        await patchDataApi(`/fields/${editingId}`, payload);
      } else {
        await postDataApi('/fields', payload);
      }
      setForm(fieldInitial);
      setEditingId(null);
      dispatch(getFields());
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  };

  const onEdit = it => {
    setEditingId(it._id);
    setForm({
      name: it.name || '',
      established_date: it.established_date
        ? it.established_date.substring(0, 10)
        : '',
      description: it.description || '',
      total_area: it.total_area ?? '',
      field_type: it.field_type || '',
      is_active: !!it.is_active,
      devices: (it.devices || []).map(d =>
        typeof d === 'string' ? d : d?._id,
      ),
    });
  };

  const onDelete = async id => {
    Alert.alert('Xóa nơi trồng', 'Bạn có chắc muốn xóa?', [
      {text: 'Hủy', style: 'cancel'},
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          await deleteDataApi(`/fields/${id}`);
          dispatch(getFields());
        },
      },
    ]);
  };

  const toggleDevice = id => {
    setForm(f => {
      const set = new Set(f.devices);
      set.has(id) ? set.delete(id) : set.add(id);
      return {...f, devices: Array.from(set)};
    });
  };

  const Header = () => (
    <View>
      <SectionCard
        title={editingId ? 'Cập nhật nơi trồng' : 'Thêm nơi trồng'}
        subtitle="Mô tả chung, thiết bị gắn kèm và trạng thái hoạt động"
        actions={
          <View className="flex-row gap-2">
            {editingId ? (
              <Btn
                title="Hủy"
                variant="outline"
                onPress={() => {
                  setEditingId(null);
                  setForm(fieldInitial);
                }}
              />
            ) : null}
            <Btn
              title={editingId ? 'Lưu thay đổi' : 'Tạo mới'}
              onPress={onSubmit}
              disabled={loading}
            />
          </View>
        }>
        <View className="gap-4">
          <View className="flex-row gap-4">
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Tên nơi trồng
              </Text>
              <Input
                value={form.name}
                onChangeText={v => setForm({...form, name: v})}
              />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Ngày thành lập
              </Text>
              <Input
                value={form.established_date}
                onChangeText={v => setForm({...form, established_date: v})}
                placeholder="YYYY-MM-DD"
              />
            </View>
          </View>

          <View className="flex-row gap-4">
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Tổng diện tích (m²)
              </Text>
              <Input
                value={String(form.total_area)}
                keyboardType="numeric"
                onChangeText={v => setForm({...form, total_area: v})}
                placeholder="vd: 1200"
              />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Loại
              </Text>
              <Input
                value={form.field_type}
                onChangeText={v => setForm({...form, field_type: v})}
                placeholder="nhà kính / ruộng / vườn…"
              />
            </View>
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1">
              Mô tả
            </Text>
            <Input
              value={form.description}
              onChangeText={v => setForm({...form, description: v})}
              multiline
              placeholder="Ghi chú khí hậu, hệ thống tưới, giống cây…"
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Thiết bị
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {deviceList.map(d => {
                const checked = form.devices.includes(d._id);
                return (
                  <Pressable
                    key={d._id}
                    onPress={() => toggleDevice(d._id)}
                    className={`flex-row items-center gap-2 px-3 py-1.5 rounded-full border ${
                      checked
                        ? 'bg-indigo-50 border-indigo-400'
                        : 'bg-white border-gray-200'
                    }`}>
                    <View
                      className={`h-2 w-2 rounded-full ${
                        checked ? 'bg-indigo-600' : 'bg-gray-300'
                      }`}
                    />
                    <Text
                      className={`text-sm ${
                        checked ? 'text-indigo-700' : 'text-gray-700'
                      }`}>
                      {d.device_name}
                    </Text>
                  </Pressable>
                );
              })}
              {deviceList.length === 0 ? (
                <Text className="text-sm text-gray-500">Chưa có thiết bị</Text>
              ) : null}
            </View>
          </View>

          <View className="flex-row items-center gap-3">
            <Switch
              value={form.is_active}
              onValueChange={v => setForm({...form, is_active: v})}
            />
            <Text className="text-sm">Hoạt động</Text>
          </View>
        </View>
      </SectionCard>

      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-sm text-gray-500 mr-4">
          {loading ? 'Đang tải...' : `Tổng: ${fieldList.length} nơi trồng`}
        </Text>
        <View className="flex-1 items-end">
          <View className="w-72">
            <Input
              value={search}
              onChangeText={setSearch}
              placeholder="Tìm theo tên/loại…"
            />
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <FlatList
      className="flex-1"
      data={filtered}
      keyExtractor={item => item._id}
      renderItem={({item: it}) => (
        <View className="px-4 py-3 border-b border-gray-100">
          <View className="flex-row items-center">
            <Text className="flex-[2] text-gray-900">{it.name}</Text>
            <Text className="flex-[1] text-gray-700">
              {it.field_type || '-'}
            </Text>
            <Text className="flex-[2] text-gray-700" numberOfLines={1}>
              {Array.isArray(it.devices) && it.devices.length
                ? it.devices
                    .map(d =>
                      typeof d === 'string'
                        ? d
                        : d?.device_name || d?.device_id,
                    )
                    .join(', ')
                : '-'}
            </Text>
            <View className="flex-[1] items-start">
              <View
                className={`rounded-full px-2.5 py-0.5 ${
                  it.is_active ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                <Text
                  className={`text-xs font-medium ${
                    it.is_active ? 'text-green-700' : 'text-gray-600'
                  }`}>
                  {it.is_active ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>
            <View className="flex-row gap-2 ml-auto">
              <Btn title="Sửa" variant="outline" onPress={() => onEdit(it)} />
              <Btn
                title="Xóa"
                variant="danger"
                onPress={() => onDelete(it._id)}
              />
            </View>
          </View>
        </View>
      )}
      ListHeaderComponent={Header}
      ListEmptyComponent={
        <Text className="p-4 text-center text-gray-500">Không có dữ liệu</Text>
      }
      contentContainerStyle={{paddingBottom: 24}}
    />
  );
}

// Devices Tab
const deviceInitial = {
  device_id: '',
  device_name: '',
  apiKey: '',
  is_active: true,
};

function DevicesTab() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(deviceInitial);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return items;
    const s = search.toLowerCase();
    return items.filter(
      it =>
        it.device_id?.toLowerCase().includes(s) ||
        it.device_name?.toLowerCase().includes(s),
    );
  }, [items, search]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getDataApi('/devices', {limit: 100, page: 1});
      setItems(res.data?.items || res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async () => {
    try {
      setLoading(true);
      if (editingId) {
        await patchDataApi(`/devices/${editingId}`, form);
      } else {
        await postDataApi('/devices', form);
      }
      setForm(deviceInitial);
      setEditingId(null);
      await load();
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  };

  const onEdit = it => {
    setEditingId(it._id);
    setForm({
      device_id: it.device_id ?? '',
      device_name: it.device_name ?? '',
      apiKey: it.apiKey ?? '',
      is_active: !!it.is_active,
    });
  };

  const onDelete = id => {
    Alert.alert('Xóa thiết bị', 'Bạn có chắc muốn xóa?', [
      {text: 'Hủy', style: 'cancel'},
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          await deleteDataApi(`/devices/${id}`);
          await load();
        },
      },
    ]);
  };

  const Header = () => (
    <View>
      <View className="bg-white shadow-sm rounded-xl p-4 mb-4">
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-700 mb-1">
              Mã thiết bị
            </Text>
            <Input
              value={form.device_id}
              onChangeText={v => setForm({...form, device_id: v})}
              placeholder="esp32-01"
            />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-700 mb-1">
              Tên thiết bị
            </Text>
            <Input
              value={form.device_name}
              onChangeText={v => setForm({...form, device_name: v})}
              placeholder="Node Nhà kính"
            />
          </View>
        </View>
        <View className="flex-row gap-3 mt-3 items-end">
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-700 mb-1">
              API Key
            </Text>
            <Input
              value={form.apiKey}
              onChangeText={v => setForm({...form, apiKey: v})}
              placeholder="abc123"
            />
          </View>
          <View className="flex-row items-center gap-3">
            <Switch
              value={form.is_active}
              onValueChange={v => setForm({...form, is_active: v})}
            />
            <Text>Hoạt động</Text>
          </View>
          <View className="flex-row gap-2 ml-auto">
            <Btn
              title={editingId ? 'Cập nhật' : 'Tạo mới'}
              onPress={onSubmit}
              disabled={loading}
            />
            {editingId ? (
              <Btn
                title="Hủy"
                variant="outline"
                onPress={() => {
                  setEditingId(null);
                  setForm(deviceInitial);
                }}
              />
            ) : null}
          </View>
        </View>
      </View>

      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-sm text-gray-500 mr-4">
          {loading ? 'Đang tải...' : `Tổng: ${items.length} thiết bị`}
        </Text>
        <View className="flex-1 items-end">
          <View className="w-64">
            <Input
              value={search}
              onChangeText={setSearch}
              placeholder="Tìm kiếm..."
            />
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <FlatList
      className="flex-1"
      data={filtered}
      keyExtractor={item => item._id}
      renderItem={({item: it}) => (
        <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
          <Text className="flex-[1.2]">{it.device_id}</Text>
          <Text className="flex-[1.2]">{it.device_name}</Text>
          <Text className="flex-1" numberOfLines={1}>
            {it.apiKey || '-'}
          </Text>
          <View className="flex-[0.8] items-start">
            <View
              className={`rounded-full px-2.5 py-0.5 ${
                it.is_active ? 'bg-green-100' : 'bg-gray-100'
              }`}>
              <Text
                className={`text-xs font-medium ${
                  it.is_active ? 'text-green-700' : 'text-gray-600'
                }`}>
                {it.is_active ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
          <View className="flex-row gap-2 ml-auto">
            <Btn title="Sửa" variant="outline" onPress={() => onEdit(it)} />
            <Btn
              title="Xóa"
              variant="danger"
              onPress={() => onDelete(it._id)}
            />
          </View>
        </View>
      )}
      ListHeaderComponent={Header}
      ListEmptyComponent={
        <Text className="p-4 text-center text-gray-500">Không có dữ liệu</Text>
      }
      contentContainerStyle={{paddingBottom: 24}}
    />
  );
}

// Screen Wrapper
const TABS = [
  {label: 'Nông sản', value: 'products'},
  {label: 'Nơi trồng', value: 'fields'},
  {label: 'Thiết bị', value: 'devices'},
];

export default function AgriManagerScreen() {
  const [active, setActive] = useState('products');

  return (
    <View className="flex-1 bg-gray-50 px-4 pt-4">
      <Text className="text-2xl font-semibold mb-3">Quản lý Nông Sản</Text>
      <TabNav tabs={TABS} active={active} onChange={setActive} />
      <View className="flex-1">
        {active === 'products' && <ProductsTab />}
        {active === 'fields' && <FieldsTab />}
        {active === 'devices' && <DevicesTab />}
      </View>
    </View>
  );
}
