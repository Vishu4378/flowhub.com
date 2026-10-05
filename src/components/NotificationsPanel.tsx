'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Spinner } from '@/components/ui';
import { timeAgo } from '@/lib/format';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadCount,
} from '@/lib/queries';

/** Bell button with an unread badge; opens a panel listing recent notifications. */
export function NotificationsBell({ light }: { light?: boolean }) {
  const [open, setOpen] = useState(false);
  const unread = useUnreadCount();
  const count = unread.data?.count ?? 0;
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={count ? `Notifications, ${count} unread` : 'Notifications'}
        aria-expanded={open}
        className={`relative rounded-md p-1.5 ${
          light ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-900' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }`}
      >
        <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" strokeLinecap="round" />
        </svg>
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] leading-4 font-semibold text-white">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>
      {open && <Panel onNavigate={() => setOpen(false)} />}
    </div>
  );
}

function Panel({ onNavigate }: { onNavigate: () => void }) {
  const notifications = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const list = notifications.data ?? [];

  return (
    <div className="absolute top-full left-0 z-50 mt-2 w-80 overflow-hidden rounded-lg bg-white text-slate-900 shadow-xl ring-1 ring-slate-200 max-lg:fixed max-lg:inset-x-4 max-lg:top-16 max-lg:w-auto">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <h2 className="text-sm font-semibold">Notifications</h2>
        <button
          onClick={() => markAll.mutate()}
          disabled={!list.some((n) => !n.readAt)}
          className="text-xs font-medium text-indigo-600 hover:text-indigo-500 disabled:text-slate-300"
        >
          Mark all read
        </button>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.isPending ? (
          <div className="flex justify-center py-8 text-slate-400">
            <Spinner />
          </div>
        ) : list.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-slate-500">You’re all caught up.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {list.map((n) => {
              const content = (
                <>
                  <div className="flex items-start gap-2">
                    {!n.readAt && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-indigo-500" aria-label="Unread" />}
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{n.title}</p>
                      {n.body && <p className="mt-0.5 text-sm text-slate-500">{n.body}</p>}
                      <p className="mt-1 text-xs text-slate-400">{timeAgo(n.createdAt)}</p>
                    </div>
                  </div>
                </>
              );
              const onClick = () => {
                if (!n.readAt) markRead.mutate(n.id);
                onNavigate();
              };
              return (
                <li key={n.id} className={n.readAt ? '' : 'bg-indigo-50/40'}>
                  {n.link ? (
                    <Link href={n.link} onClick={onClick} className="block px-4 py-3 hover:bg-slate-50">
                      {content}
                    </Link>
                  ) : (
                    <button onClick={onClick} className="block w-full px-4 py-3 text-left hover:bg-slate-50">
                      {content}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
