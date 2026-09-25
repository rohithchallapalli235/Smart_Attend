export function StatusPill({ value }: { value: number }) {
  const status = getAttendanceStatus(value);

  const toneMap = {
    green: 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30',
    blue: 'bg-blue-500/15 text-blue-300 ring-1 ring-blue-400/30',
    red: 'bg-red-500/15 text-red-300 ring-1 ring-red-400/30',
  } as const;

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${toneMap[status.tone]}`}>
      {status.label}
    </span>
  );
}

export function getAttendanceStatus(percentage: number) {
  if (percentage >= 75) {
    return { label: 'Safe', tone: 'green' as const };
  }

  if (percentage >= 60) {
    return { label: 'Alert', tone: 'blue' as const };
  }

  return { label: 'Warning', tone: 'red' as const };
}
