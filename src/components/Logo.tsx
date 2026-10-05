import Image from 'next/image';
import Link from 'next/link';

export function Logo({ className, dark }: { className?: string; dark?: boolean }) {
  return (
    <Link href="/" className={`flex w-fit items-center gap-2 ${className ?? ''}`}>
      <Image src="/logo.svg" alt="" width={32} height={32} className="size-8" unoptimized />
      <span className={`text-lg font-semibold tracking-tight ${dark ? 'text-white' : 'text-slate-900'}`}>FlowHub</span>
    </Link>
  );
}
