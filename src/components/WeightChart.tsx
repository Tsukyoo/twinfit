import type { BodyLog } from '../types';
import { TrendingUp } from 'lucide-react';

interface WeightChartProps {
  logs: BodyLog[];
  initialWeightKg: number;
  goalWeightKg: number;
  accentColor: string;      // CSS color value e.g. '#34c759'
  gradientId: string;       // unique SVG gradient id
}

const W = 340;
const H = 140;
const PAD = { top: 16, right: 12, bottom: 28, left: 36 };

export function WeightChart({
  logs,
  initialWeightKg,
  goalWeightKg,
  accentColor,
  gradientId,
}: WeightChartProps) {
  if (logs.length < 2) {
    return (
      <div className="w-full h-36 flex flex-col items-center justify-center gap-2">
        <TrendingUp className="w-8 h-8 text-text-muted" />
        <p className="text-sm text-text-secondary">
          {logs.length === 0
            ? 'Ajoute ta première pesée pour voir le graphique'
            : 'Ajoute une 2ème pesée pour voir la courbe'}
        </p>
      </div>
    );
  }

  // Data range
  const weights = logs.map((l) => l.weightKg);
  const allValues = [...weights, initialWeightKg, goalWeightKg];
  const minW = Math.min(...allValues) - 1;
  const maxW = Math.max(...allValues) + 1;

  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const toX = (i: number) => PAD.left + (i / (logs.length - 1)) * chartW;
  const toY = (w: number) => PAD.top + ((maxW - w) / (maxW - minW)) * chartH;

  // Build SVG path
  const points = logs.map((l, i) => `${toX(i)},${toY(l.weightKg)}`);
  const linePath = `M ${points.join(' L ')}`;

  // Area path (filled under the line)
  const areaPath = `M ${toX(0)},${toY(logs[0].weightKg)} L ${points.join(' L ')} L ${toX(logs.length - 1)},${H - PAD.bottom} L ${toX(0)},${H - PAD.bottom} Z`;

  // Goal line Y
  const goalY = toY(goalWeightKg);

  // Y-axis labels: min, mid, max
  const midW = ((minW + maxW) / 2);
  const yLabels = [
    { value: maxW, y: PAD.top },
    { value: midW, y: PAD.top + chartH / 2 },
    { value: minW, y: PAD.top + chartH },
  ];

  // X-axis: first and last date labels
  const fmtDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  // Last dot
  const lastX = toX(logs.length - 1);
  const lastY = toY(logs[logs.length - 1].weightKg);
  const lastWeight = logs[logs.length - 1].weightKg;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      style={{ height: H }}
      role="img"
      aria-label="Courbe de poids"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accentColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Goal line (dashed) */}
      <line
        x1={PAD.left}
        y1={goalY}
        x2={W - PAD.right}
        y2={goalY}
        stroke="#9ca3af"
        strokeWidth="1"
        strokeDasharray="4 3"
        opacity="0.6"
      />
      <text
        x={W - PAD.right + 2}
        y={goalY + 4}
        fontSize="8"
        fill="#9ca3af"
        opacity="0.8"
      >
        obj.
      </text>

      {/* Area fill */}
      <path d={areaPath} fill={`url(#${gradientId})`} />

      {/* Main line */}
      <path
        d={linePath}
        fill="none"
        stroke={accentColor}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Last point dot */}
      <circle cx={lastX} cy={lastY} r="4" fill={accentColor} />
      <circle cx={lastX} cy={lastY} r="7" fill={accentColor} opacity="0.2" />

      {/* Last weight label */}
      <text
        x={Math.min(lastX + 8, W - 24)}
        y={lastY - 6}
        fontSize="10"
        fontWeight="bold"
        fill={accentColor}
        textAnchor="start"
      >
        {lastWeight} kg
      </text>

      {/* Y-axis labels */}
      {yLabels.map(({ value, y }) => (
        <text
          key={value}
          x={PAD.left - 4}
          y={y + 4}
          fontSize="9"
          fill="#9ca3af"
          textAnchor="end"
        >
          {value % 1 === 0 ? value : value.toFixed(1)}
        </text>
      ))}

      {/* X-axis: first and last date */}
      <text
        x={PAD.left}
        y={H - 4}
        fontSize="9"
        fill="#9ca3af"
        textAnchor="start"
      >
        {fmtDate(logs[0].date)}
      </text>
      <text
        x={W - PAD.right}
        y={H - 4}
        fontSize="9"
        fill="#9ca3af"
        textAnchor="end"
      >
        {fmtDate(logs[logs.length - 1].date)}
      </text>
    </svg>
  );
}
