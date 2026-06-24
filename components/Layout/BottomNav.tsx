'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/home',      label: '홈',      icon: 'home' },
  { href: '/education', label: '교육관리', icon: 'school' },
  { href: '/notices',   label: '공지사항', icon: 'campaign' },
  { href: '/community', label: '커뮤니티', icon: 'chat_bubble' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-[#c3c6d5] flex items-center h-16 z-50">
      {tabs.map(tab => {
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
