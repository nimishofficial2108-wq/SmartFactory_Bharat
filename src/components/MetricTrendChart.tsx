import React, { useState } from 'react';
import { useFactory } from '../context/FactoryContext';

interface MetricTrendChartProps {
  data: {
    time: string;
    current: number;
    temp: number;
    vibration: number;
    normalMin: number;
    normalMax: number;
  }[];
  activeMetric: 'current' | 'temp' | 'vibration';
}

export const MetricTrendChart: React.FC<MetricTrendChartProps> = ({
  data,
  activeMetric,
}) => {
  const { t } = useFactory();
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Generate data points depending on metric and timeframe
  const multiplier = timeframe === 'daily' ? 1 : timeframe === 'weekly' ? 1.05 : 0.98;

  const points = data.map((d, i) => {
    let val = d[activeMetric] * multiplier;
    if (timeframe === 'weekly') {
      const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      return { ...d, time: dayNames[i % 7], value: +val.toFixed(1) };
    }
    if (timeframe === 'monthly') {
      return { ...d, time: `W${i + 1}`, value: +val.toFixed(1) };
    }
    return { ...d, value: +val.toFixed(1) };
  });

  const values = points.map((p) => p.value);
  const minVal = Math.min(...values, 0);
  const maxVal = Math.max(...values, ...points.map((p) => p.normalMax)) * 1.15;
  const range = maxVal - minVal || 1;

  const width = 640;
  const height = 240;
  const paddingX = 45;
  const paddingY = 30;
  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  const getX = (index: number) => paddingX + (index / (points.length - 1)) * chartW;
  const getY = (val: number) => height - paddingY - ((val - minVal) / range) * chartH;

  // Path coordinates for live line
  const linePath = points
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(p.value)}`)
    .join(' ');

  // Normal safe band polygon coordinates
  const bandTop = points.map((p, idx) => `${getX(idx)} ${getY(p.normalMax)}`).join(' L ');
  const bandBottom = points
    .slice()
    .reverse()
    .map((p, idx) => `${getX(points.length - 1 - idx)} ${getY(p.normalMin)}`)
    .join(' L ');
  const bandPolygon = `M ${bandTop} L ${bandBottom} Z`;

  const metricConfig = {
    current: { label: 'Current Draw (Amps)', unit: 'A', stroke: '#10b981' },
    temp: { label: 'Temperature (°C)', unit: '°C', stroke: '#f59e0b' },
    vibration: { label: 'Vibration RMS (mm/s)', unit: 'mm/s', stroke: '#38bdf8' },
  }[activeMetric];

  const activePoint = hoverIndex !== null ? points[hoverIndex] : points[points.length - 1];

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs transition-colors">
      {/* Header with Timeframe toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>{metricConfig.label}</span>
            <span className="text-[11px] font-mono-num font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20">
              {activePoint.value} {metricConfig.unit}
            </span>
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t.normalBand}
          </p>
        </div>

        {/* Timeframe Buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-full border border-slate-200/80 dark:border-slate-800">
          <button
            onClick={() => setTimeframe('daily')}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
              timeframe === 'daily'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {t.dailyView}
          </button>
          <button
            onClick={() => setTimeframe('weekly')}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
              timeframe === 'weekly'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {t.weeklyView}
          </button>
          <button
            onClick={() => setTimeframe('monthly')}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
              timeframe === 'monthly'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {t.monthlyView}
          </button>
        </div>
      </div>

      {/* SVG Chart Area */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-56 select-none overflow-visible"
          onMouseLeave={() => setHoverIndex(null)}
        >
          {/* Subtle Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const val = minVal + pct * range;
            const y = getY(val);
            return (
              <g key={idx}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.06)"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-slate-500 text-[10px] font-mono-num"
                >
                  {val.toFixed(0)}
                </text>
              </g>
            );
          })}

          {/* Safe Normal Baseline Band (Shaded) */}
          <path
            d={bandPolygon}
            fill="rgba(16, 185, 129, 0.08)"
            stroke="rgba(16, 185, 129, 0.25)"
            strokeDasharray="3 3"
          />

          {/* Main Data Line */}
          <path
            d={linePath}
            fill="none"
            stroke={metricConfig.stroke}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points & Interactive Scrubbing */}
          {points.map((p, idx) => {
            const cx = getX(idx);
            const cy = getY(p.value);
            const isHovered = hoverIndex === idx;

            return (
              <g
                key={idx}
                className="cursor-pointer"
                onMouseEnter={() => setHoverIndex(idx)}
              >
                {/* Invisible hover hotspot */}
                <rect
                  x={cx - 18}
                  y={0}
                  width={36}
                  height={height}
                  fill="transparent"
                />

                {isHovered && (
                  <line
                    x1={cx}
                    y1={paddingY}
                    x2={cx}
                    y2={height - paddingY}
                    stroke="rgba(255, 255, 255, 0.4)"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                )}

                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 5.5 : 3.5}
                  fill={isHovered ? '#ffffff' : metricConfig.stroke}
                  stroke="#0f172a"
                  strokeWidth="2"
                />

                {/* X Axis Time Labels */}
                <text
                  x={cx}
                  y={height - paddingY + 18}
                  textAnchor="middle"
                  className="fill-slate-400 text-[10px] font-mono-num"
                >
                  {p.time}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-800">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span
              className="w-3 h-0.5 rounded-full"
              style={{ backgroundColor: metricConfig.stroke }}
            />
            <span className="text-slate-300">Live Reading</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-2 rounded bg-emerald-500/20 border border-emerald-500/30" />
            <span className="text-slate-300">{t.normalBand}</span>
          </div>
        </div>

        <span className="font-mono-num text-slate-500">
          Scrub points to view historical timestamps
        </span>
      </div>
    </div>
  );
};
