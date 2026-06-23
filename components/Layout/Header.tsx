'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useModal } from '../Modals/ModalContext';

const navLinks = [
  { href: '/home', label: '홈' },
  { href: '/education', label: '교육관리' },
  { href: '/notices', label: '공지사항' },
  { href: '/community', label: '커뮤니티' },
];

export default function Header() {
  const pathname = usePathname();
  const { openProfile } = useModal();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="flex justify-between items-center w-full px-4 md:px-6 h-16 max-w-[1200px] mx-auto">
        <div className="flex items-center gap-8">
          <Link href="/home" className="font-bold text-xl text-[#00327d]" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>
            경북청년인재스쿨
          </Link>
          <nav className="hidden md:flex items-center gap-6 h-full">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-semibold py-1 transition-colors ${
                  pathname.startsWith(link.href)
                    ? 'text-[#00327d] border-b-2 border-[#00327d]'
                    : 'text-[#434653] hover:text-[#00327d]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openProfile}
            className="material-symbols-outlined text-[#434653] hover:bg-[#f3f4f5] p-2 rounded-full transition-colors active:scale-95"
          >
            account_circle
          </button>
        </div>
      </div>
    </header>
  );
}
