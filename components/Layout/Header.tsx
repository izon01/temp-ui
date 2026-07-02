'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useModal } from '../Modals/ModalContext';

const navLinks = [
  { href: '/home',      label: '홈',       adminOnly: false },
  { href: '/notices',   label: '공지사항',  adminOnly: false },
  { href: '/education', label: '교육관리',  adminOnly: false },
  { href: '/community', label: '커뮤니티',  adminOnly: false },
  { href: '/support',   label: '수당신청',   adminOnly: false },
  { href: '/schedule',  label: '일정',      adminOnly: true  },
];

export default function Header() {
  const pathname = usePathname();
  const { openProfile } = useModal();
  const { data: session } = useSession();

  const handleSignOut = async () => {
    localStorage.removeItem('remember_me');
    sessionStorage.removeItem('session_active');
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="flex justify-between items-center w-full px-4 md:px-6 h-16 max-w-[1200px] mx-auto">
        <div className="flex items-center gap-8">
          <Link href="/home">
            <Image
              src="/logo.png"
              alt="경북청년인재스쿨"
              width={160}
              height={40}
              className="h-10 w-auto object-contain"
              priority
              unoptimized
            />
          </Link>
          <nav className="hidden md:flex items-center gap-6 h-full">
            {navLinks.filter(l => !l.adminOnly || session?.user?.role === 'admin').map(link => (
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

        <div className="flex items-center gap-1 md:gap-2">
          {session?.user && (
            <>
              {/* 모바일: 배지 + 이름 컴팩트 */}
              <div className="flex md:hidden items-center gap-1 mr-1 max-w-[110px]">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                  session.user.role === 'admin'
                    ? 'bg-[#ffdad8] text-[#b7102a]'
                    : 'bg-[#dae2ff] text-[#001946]'
                }`}>
                  {session.user.role === 'admin' ? '관리자' : '참여자'}
                </span>
                <span className="text-xs font-bold text-[#191c1d] truncate">{session.user.name}</span>
              </div>
              {/* 데스크톱: 배지 + 이름 풀사이즈 */}
              <div className="hidden md:flex items-center gap-2 mr-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  session.user.role === 'admin'
                    ? 'bg-[#ffdad8] text-[#b7102a]'
                    : 'bg-[#dae2ff] text-[#001946]'
                }`}>
                  {session.user.role === 'admin' ? '관리자' : '참여자'}
                </span>
                <span className="text-sm font-semibold text-[#191c1d]">{session.user.name}</span>
              </div>
            </>
          )}
          <button
            onClick={openProfile}
            className="material-symbols-outlined text-[#434653] hover:bg-[#f3f4f5] p-2 rounded-full transition-colors active:scale-95"
          >
            account_circle
          </button>
          <button
            onClick={handleSignOut}
            title="로그아웃"
            className="material-symbols-outlined text-[#737784] hover:bg-[#f3f4f5] hover:text-[#b7102a] p-2 rounded-full transition-colors active:scale-95"
          >
            logout
          </button>
        </div>
      </div>
    </header>
  );
}
