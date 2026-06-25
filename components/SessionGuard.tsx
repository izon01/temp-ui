'use client';

import { useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';

/**
 * 로그인 상태 유지를 선택하지 않은 경우,
 * 브라우저를 껐다 켜면(sessionStorage 초기화) 자동으로 로그아웃 처리.
 */
export default function SessionGuard() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== 'authenticated') return;

    const remembered  = localStorage.getItem('remember_me') === '1';
    const sessionOnly = sessionStorage.getItem('session_active') === '1';

    // 세션 쿠키는 살아있지만 어떤 스토리지에도 표식이 없으면
    // 브라우저가 닫혔다 열린 것 → 강제 로그아웃
    if (!remembered && !sessionOnly) {
      localStorage.removeItem('remember_me');
      signOut({ callbackUrl: '/login' });
    }
  }, [status, session]);

  return null;
}
