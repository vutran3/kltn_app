export function fmtTime(ts) {
  try {
    const d = new Date(typeof ts === 'number' ? ts : Number(ts || 0));
    // Return HH:mm or date-time when spanning days
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
      temp:
        typeof r.airTemperature === 'number'
          ? Number(r.airTemperature.toFixed(1))
          : null,
      air: typeof r.airHumidity === 'number' ? r.airHumidity : null,
      ph: typeof r.ph === 'number' ? r.airHumidity : null,
      photpho: typeof r.phosphorus === 'number' ? r.phosphorus : null,
      nitro: typeof r.nitrogen === 'number' ? r.nitrogen : null,
      kali: typeof r.potassium === 'number' ? r.potassium : null,
      soilHum: typeof r.soilHumidity === 'number' ? r.soilHumidity : null,
    };
  });
}
