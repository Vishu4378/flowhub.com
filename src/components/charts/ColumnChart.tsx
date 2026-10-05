'use client';

import { useId, useState } from 'react';

export interface ColumnDatum {
  key: string;
  /** Short axis label, e.g. "Sep 1". */
  label: string;
  /** Tooltip heading, e.g. "Week of Sep 1, 2026". */
  title: string;
  value: number;
}

const HEIGHT = 180;
const PAD = { top: 20, right: 8, bottom: 28, left: 32 };
const MAX_COL = 24;

/** "Nice" upper bound and ticks so the y-axis reads 0 / 2 / 4 / 6. */
function niceTicks(max: number): number[] {
  if (max <= 0) return [0, 1];
  const rough = max / 4;
  const pow = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 5, 10].map((m) => m * pow).find((s) => s >= rough) ?? pow * 10;
  const ticks: number[] = [];
  for (let v = 0; v <= max + step * 0.001 || ticks.length < 2; v += step) ticks.push(Math.round(v * 100) / 100);
  if (ticks[ticks.length - 1]! < max) ticks.push(ticks[ticks.length - 1]! + step);
  return ticks;
}

/**
 * Single-series column chart: thin columns with rounded caps on a hairline grid,
 * a hover tooltip per column (hit target is the full band), selective value
 * labels (latest and peak), and a table view for screen readers and exact values.
 */
export function ColumnChart({
  data,
  valueLabel,
  width = 640,
}: {
  data: ColumnDatum[];
  /** Noun for the value, used in tooltips and the table header. */
  valueLabel: string;
  width?: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const [asTable, setAsTable] = useState(false);
  const titleId = useId();

  const ticks = niceTicks(Math.max(...data.map((d) => d.value), 0));
  const top = ticks[ticks.length - 1]!;
  const plotW = width - PAD.left - PAD.right;
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const band = plotW / data.length;
  const colW = Math.min(MAX_COL, band * 0.6);
  const y = (v: number) => PAD.top + plotH - (v / top) * plotH;
  const peak = data.reduce((best, d, i) => (d.value > data[best]!.value ? i : best), 0);
  const labelled = new Set([data.length - 1, peak]);
  const everyOther = band < 44;

  if (asTable) {
    return (
      <div>
        <ToggleView asTable onToggle={() => setAsTable(false)} />
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="py-2 font-medium">Week</th>
              <th className="py-2 text-right font-medium">{valueLabel}</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {data.map((d) => (
              <tr key={d.key} className="border-b border-slate-100">
                <td className="py-1.5 text-slate-700">{d.title}</td>
                <td className="py-1.5 text-right text-slate-900">{d.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const active = hover === null ? null : data[hover]!;
  return (
    <div>
      <ToggleView asTable={false} onToggle={() => setAsTable(true)} />
      <div className="relative">
        <svg
          viewBox={`0 0 ${width} ${HEIGHT}`}
          className="h-auto w-full overflow-visible"
          role="img"
          aria-labelledby={titleId}
          onMouseLeave={() => setHover(null)}
        >
          <title id={titleId}>
            {valueLabel} per week: {data.map((d) => `${d.label} ${d.value}`).join(', ')}
          </title>

          {/* Hairline grid and y ticks */}
          {ticks.map((t) => (
            <g key={t}>
              <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} stroke="#e2e8f0" strokeWidth={1} />
              <text x={PAD.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-slate-400 text-[11px] tabular-nums">
                {t}
              </text>
            </g>
          ))}

          {data.map((d, i) => {
            const cx = PAD.left + band * i + band / 2;
            const h = Math.max(0, y(0) - y(d.value));
            const r = Math.min(4, colW / 2, h);
            const x0 = cx - colW / 2;
            const yTop = y(d.value);
            // Rounded data-end (top), square at the baseline.
            const path =
              h > 0
                ? `M${x0},${y(0)} V${yTop + r} Q${x0},${yTop} ${x0 + r},${yTop} H${x0 + colW - r} Q${x0 + colW},${yTop} ${x0 + colW},${yTop + r} V${y(0)} Z`
                : '';
            const dim = hover !== null && hover !== i;
            return (
              <g key={d.key}>
                {path && <path d={path} fill="#4f46e5" opacity={dim ? 0.35 : 1} />}
                {labelled.has(i) && d.value > 0 && (
                  <text x={cx} y={yTop - 6} textAnchor="middle" className="fill-slate-700 text-[11px] font-medium tabular-nums">
                    {d.value}
                  </text>
                )}
                {(!everyOther || i % 2 === data.length % 2 || i === data.length - 1) && (
                  <text x={cx} y={HEIGHT - 8} textAnchor="middle" className="fill-slate-400 text-[11px]">
                    {d.label}
                  </text>
                )}
                {/* Hit target: the whole band, taller than the mark. */}
                <rect
                  x={PAD.left + band * i}
                  y={PAD.top}
                  width={band}
                  height={plotH}
                  fill="transparent"
                  onMouseEnter={() => setHover(i)}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover(null)}
                  tabIndex={0}
                  aria-label={`${d.title}: ${d.value} ${valueLabel.toLowerCase()}`}
                  className="outline-none"
                />
              </g>
            );
          })}
          <line x1={PAD.left} x2={width - PAD.right} y1={y(0)} y2={y(0)} stroke="#cbd5e1" strokeWidth={1} />
        </svg>

        {active && hover !== null && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-md bg-slate-900 px-2.5 py-1.5 text-xs text-white shadow-lg"
            style={{
              left: `${((PAD.left + band * hover + band / 2) / width) * 100}%`,
              top: `${(y(active.value) / HEIGHT) * 100}%`,
              marginTop: -10,
            }}
          >
            <p className="font-medium whitespace-nowrap">{active.title}</p>
            <p className="text-slate-300 whitespace-nowrap">
              {active.value} {valueLabel.toLowerCase()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ToggleView({ asTable, onToggle }: { asTable: boolean; onToggle: () => void }) {
  return (
    <div className="-mt-1 mb-2 flex justify-end">
      <button onClick={onToggle} className="text-xs font-medium text-slate-500 hover:text-slate-900">
        {asTable ? 'View as chart' : 'View as table'}
      </button>
    </div>
  );
}
