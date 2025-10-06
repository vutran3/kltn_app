import React, {useState} from 'react';
import {View, Text, Pressable} from 'react-native';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Sun,
  Cloud,
  CloudRain,
  Droplets,
  Thermometer,
  Wind,
  Eye,
} from 'lucide-react-native';

export default function CalendarWeather() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getCurrentMonth = () => {
    const months = [
      'Tháng 1',
      'Tháng 2',
      'Tháng 3',
      'Tháng 4',
      'Tháng 5',
      'Tháng 6',
      'Tháng 7',
      'Tháng 8',
      'Tháng 9',
      'Tháng 10',
      'Tháng 11',
      'Tháng 12',
    ];
    return `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  };

  const navigateMonth = direction => {
    setCurrentDate(prev => {
      const nd = new Date(prev);
      nd.setMonth(prev.getMonth() + direction);
      return nd;
    });
  };

  const isToday = day => {
    if (!day) return false;
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const weatherForecast = [
    {
      date: 'Hôm nay',
      day: 'Thứ 5',
      temp: {high: 32, low: 24},
      humidity: 72,
      rain: 15,
      wind: 12,
      condition: 'sunny',
      description: 'Nắng đẹp',
    },
    {
      date: 'Mai',
      day: 'Thứ 6',
      temp: {high: 29, low: 22},
      humidity: 78,
      rain: 85,
      wind: 18,
      condition: 'rainy',
      description: 'Mưa rào',
    },
    {
      date: '14/8',
      day: 'Thứ 7',
      temp: {high: 27, low: 21},
      humidity: 82,
      rain: 95,
      wind: 22,
      condition: 'cloudy_rain',
      description: 'Mưa to',
    },
    {
      date: '15/8',
      day: 'Chủ nhật',
      temp: {high: 30, low: 23},
      humidity: 68,
      rain: 25,
      wind: 8,
      condition: 'cloudy',
      description: 'Nhiều mây',
    },
  ];

  const getWeatherIcon = condition => {
    switch (condition) {
      case 'sunny':
        return <Sun size={28} color="#eab308" />;
      case 'cloudy':
        return <Cloud size={28} color="#6b7280" />;
      case 'rainy':
      case 'cloudy_rain':
        return <CloudRain size={28} color="#3b82f6" />;
      default:
        return <Sun size={28} color="#eab308" />;
    }
  };

  const getConditionBg = condition => {
    switch (condition) {
      case 'sunny':
        return 'bg-yellow-400';
      case 'cloudy':
        return 'bg-gray-400';
      case 'rainy':
      case 'cloudy_rain':
        return 'bg-blue-400';
      default:
        return 'bg-yellow-400';
    }
  };

  const days = getDaysInMonth();
  const colStyle = {width: `${100 / 7}%`}; // 7 cột

  return (
    <View className="space-y-4">
      {/* Calendar */}
      <View className="rounded-xl p-4 border border-gray-100">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <CalendarIcon size={20} color="#2563eb" />
            <Text className="ml-2 text-base font-bold text-gray-800">LỊCH</Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between mb-3">
          <Pressable
            onPress={() => navigateMonth(-1)}
            className="p-2 rounded-full">
            <ChevronLeft size={18} color="#475569" />
          </Pressable>
          <Text className="font-semibold text-lg text-gray-800">
            {getCurrentMonth()}
          </Text>
          <Pressable
            onPress={() => navigateMonth(1)}
            className="p-2 rounded-full">
            <ChevronRight size={18} color="#475569" />
          </Pressable>
        </View>

        {/* Week headers */}
        <View className="flex-row mb-1">
          {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((d, idx) => (
            <View key={d} style={colStyle} className="p-2">
              <Text
                className={`text-center text-xs font-semibold ${
                  idx === 0 ? 'text-red-500' : 'text-gray-600'
                }`}>
                {d}
              </Text>
            </View>
          ))}
        </View>

        {/* Days grid */}
        <View className="flex-row flex-wrap">
          {days.map((day, idx) => (
            <View key={idx} style={colStyle} className="p-1">
              <View
                className={`h-10 items-center justify-center rounded-lg ${
                  day ? 'bg-white' : 'bg-transparent'
                }`}>
                <Text
                  className={`${
                    isToday(day)
                      ? 'bg-blue-600 text-white px-2 py-1 rounded'
                      : day
                      ? 'text-gray-800'
                      : 'text-gray-300'
                  }`}>
                  {day || ''}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View className="mt-3 p-3 bg-blue-50 rounded-lg">
          <Text className="text-blue-700 text-sm">
            Hôm nay: {new Date().toLocaleDateString('vi-VN')}
          </Text>
        </View>
      </View>

      {/* Weather forecast */}
      <View className="rounded-xl p-4 border border-gray-100">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <CloudRain size={20} color="#2563eb" />
            <Text className="ml-2 text-base font-bold text-gray-800">
              DỰ BÁO THỜI TIẾT
            </Text>
          </View>
        </View>

        <View className="space-y-3">
          {weatherForecast.map((f, i) => (
            <View
              key={i}
              className={`rounded-xl p-4 mb-4 ${getConditionBg(
                f.condition,
              )} opacity-95`}>
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-3">
                  <View className="flex-row items-center mb-1">
                    <Text className="text-white text-base font-semibold mr-2">
                      {f.date}
                    </Text>
                    <Text className="text-white/90 text-xs">{f.day}</Text>
                  </View>
                  <Text className="text-white/90 text-sm mb-2">
                    {f.description}
                  </Text>
                  <View className="flex-row items-center">
                    <View className="flex-row items-center mr-4">
                      <Thermometer size={16} color="white" />
                      <Text className="text-white ml-1 text-sm">
                        {f.temp.high}°/{f.temp.low}°
                      </Text>
                    </View>
                    <View className="flex-row items-center mr-4">
                      <Droplets size={16} color="white" />
                      <Text className="text-white ml-1 text-sm">
                        {f.humidity}%
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Wind size={16} color="white" />
                      <Text className="text-white ml-1 text-sm">
                        {f.wind}km/h
                      </Text>
                    </View>
                  </View>
                </View>
                <View className="items-center">
                  {getWeatherIcon(f.condition)}
                  <Text className="text-white text-sm mt-1">🌧️ {f.rain}%</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View className="mt-3 p-3 bg-gray-50 rounded-lg">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Eye size={16} color="#4b5563" />
              <Text className="text-gray-600 ml-1 text-sm">Tầm nhìn: 10km</Text>
            </View>
            <Text className="text-gray-600 text-sm">Chỉ số UV: 8 (Cao)</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
