'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

const tabs = [
  { href: '/home',      label: '홈',      icon: 'home',        adminOnly: false },
  { href: '/notices',   label: '공지사항', icon: 'campaign',    adminOnly: false },
  { href: '/education', label: '교육관리', icon: 'school',      adminOnly: false },
  { href: '/community', label: '커뮤니티',  icon: 'chat_bubble',    adminOnly: false },
  { href: '/support',   label: '지원금관리', icon: 'attach_money',  adminOnly: false },
  { href: '/schedule',  label: '일정',      icon: 'calendar_month', adminOnly: true  },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'admin';
  const visible = tabs.filter(t => !t.adminOnly || isAdmin);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-[#c3c6d5] flex items-center h-16 z-50">
      {visible.map(tab => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link key={tab.href} href={tab.href} className={`flex-1 flex flex-col items-center gap-0.5 py-1 ${active ? 'text-[#00327d]' : 'text-[#434653]'}`}>
            <span
              className="material-symbols-outlined text-[26px]"
              style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
            >
              {tab.icon}
            </span>
            <span className={`text-[10px] font-semibold ${active ? 'text-[#00327d]' : 'text-[#434653]'}`}>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
