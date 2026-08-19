/** Status indicator dot with optional label */
type Status = 'online' | 'offline' | 'degraded' | 'unknown';

const STATUS_STYLES: Record<Status, { dot: string; label: string }> = {
  online:   { dot: 'bg-emerald-400 shadow-[0_0_6px_2px_rgba(52,211,153,0.4)]', label: 'text-emerald-400' },
  offline:  { dot: 'bg-red-500     shadow-[0_0_6px_2px_rgba(239,68,68,0.4)]',  label: 'text-red-400' },
  degraded: { dot: 'bg-amber-400   shadow-[0_0_6px_2px_rgba(251,191,36,0.4)]', label: 'text-amber-400' },
  unknown:  { dot: 'bg-gray-500',                                                label: 'text-gray-400' },
};

interface Props {
  status: Status;
  label?: string;
  pulse?: boolean;
}

const StatusIndicator = ({ status, label, pulse = true }: Props) => {
  const s = STATUS_STYLES[status];
  return (
    <span className="inline-flex items-center gap-2">
      <span className="relative flex h-2.5 w-2.5">
        {pulse && status === 'online' && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${s.dot} opacity-50`} />
        )}
        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${s.dot}`} />
      </span>
      {label && <span className={`text-xs font-medium ${s.label}`}>{label}</span>}
    </span>
  );
};

export default StatusIndicator;
export type { Status };
