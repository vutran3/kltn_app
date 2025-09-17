function fmtTime(ts) {
  try {
    const d = new Date(typeof ts === 'number' ? ts : Number(ts || 0));
    return d.toLocaleString('vi-VN', {hour12: false});
  } catch {
    return String(ts);
  }
}

export function mapApiRowsToSeries(rows = []) {
  return rows.map(r => {
    const ts = r?.ts ?? r?.timestamp ?? r?._ts ?? r?.createdAt ?? Date.now();
    return {
      time: r?.time || fmtTime(ts),
      temp: r?.temp ?? r?.airTemperatureC ?? r?.airTemp ?? null,
      rain: r?.rain ?? r?.rainRaw ?? r?.rain_mm ?? null,
    };
  });
}
