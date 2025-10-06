export function fmtTs(ts) {
  if (ts == null) return '—';
  const d = new Date(ts);
  return d.toLocaleString('vi-VN', {
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function toMs(dateStr) {
  if (!dateStr) return undefined;
  const d = new Date(`${dateStr}T00:00:00`);
  return isNaN(d.getTime()) ? undefined : d.getTime();
}
