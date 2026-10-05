export function Logo({ className }: { className?: string }) {
  return (
    <div className={`flex w-fit items-center gap-2 ${className ?? ''}`}>
      <img src="/favicon.svg" alt="" className="size-8" />
      <span className="text-lg font-semibold tracking-tight text-slate-900">FlowHub</span>
    </div>
  );
}
