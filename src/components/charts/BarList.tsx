/**
 * Ranked horizontal bars for a short list of categories (one hue, magnitude
 * only). Labels and values sit in text colours; the bar carries the amount.
 */
export function BarList({ items }: { items: { label: string; value: number }[] }) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item.label}>
          <div className="mb-1 flex justify-between text-sm">
            <span className="text-slate-700">{item.label}</span>
            <span className="font-medium text-slate-900 tabular-nums">{item.value}</span>
          </div>
          <div className="h-2 rounded-full bg-indigo-50">
            <div
              className="h-2 rounded-full bg-indigo-600"
              style={{ width: `${(item.value / max) * 100}%` }}
              role="presentation"
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
