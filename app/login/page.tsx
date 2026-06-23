'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useModal } from '@/components/Modals/ModalContext';

export default function LoginPage() {
  const [showPwd, setShowPwd] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { openForgotPassword } = useModal();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해 주세요.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      } else {
        router.push('/home');
        router.refresh();
      }
    } catch {
      setError('로그인 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-tr from-[#00327d] via-[#00327d] to-[#0047ab]" />

      <div className="w-full max-w-[440px] flex flex-col items-center gap-10">
        {/* Branding */}
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>
            경북청년인재스쿨
          </h1>
          <p className="text-[#a5bdff] max-w-[280px] mx-auto leading-relaxed text-sm">
            경상북도의 미래를 이끄는 청년 인재들의 성장을 지원합니다.
          </p>
        </div>

        {/* Card */}
        <div className="w-full bg-white rounded-xl shadow-2xl p-6 flex flex-col gap-6">
          <div>
            <h2 className="text-2xl font-semibold text-[#191c1d]" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>로그인</h2>
            <p className="text-sm text-[#434653] mt-1">인재스쿨 서비스를 위해 로그인해 주세요.</p>
          </div>

          {/* 테스트 계정 안내 */}
          <div className="bg-[#dae2ff] rounded-lg p-3 text-xs text-[#001946] space-y-0.5">
            <p className="font-bold mb-1">테스트 계정</p>
            <p>관리자: admin@gyeongbuk.kr / admin1234</p>
            <p>참여자: kimjisoo@gyeongbuk.kr / pass1234</p>
          </div>

          <form className="flex flex-col gap-4" onSubmit={handleLogin}>
            {/* Error */}
            {error && (
              <div className="bg-[#ffdad6] text-[#93000a] text-sm px-4 py-3 rounded-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                {error}
              </div>
            )}

            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-[#434653] flex items-center gap-1">
                <span className="material-symbols-outlined text-[18px]">mail</span>
                이메일
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full h-14 px-4 bg-[#f8f9fa] border border-[#c3c6d5] rounded-lg text-[#191c1d] placeholder:text-[#737784] focus:outline-none focus:border-[#0047ab] focus:ring-2 focus:ring-[#0047ab]/20 transition-all"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-[#434653] flex items-center gap-1">
                <span className="material-symbols-outlined text-[18px]">lock</span>
                비밀번호
              </label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  className="w-full h-14 px-4 bg-[#f8f9fa] border border-[#c3c6d5] rounded-lg text-[#191c1d] placeholder:text-[#737784] focus:outline-none focus:border-[#0047ab] focus:ring-2 focus:ring-[#0047ab]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#737784] hover:text-[#00327d] transition-colors"
                >
                  <span className="material-symbols-outlined">{showPwd ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-4 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-[#c3c6d5] text-[#00327d] focus:ring-[#00327d]/20" />
                <span className="text-sm text-[#434653]">로그인 상태 유지</span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-[#0047ab] text-white font-bold rounded-lg hover:brightness-110 active:scale-[0.98] transition-all shadow-sm disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><span className="material-symbols-outlined animate-spin">progress_activity</span> 로그인 중...</>
                ) : '로그인'}
              </button>
            </div>
          </form>

          <div className="flex items-center justify-center divide-x divide-[#c3c6d5] py-2">
            <Link href="/pending" className="px-4 text-sm text-[#434653] hover:text-[#00327d] transition-colors">회원가입</Link>
            <button onClick={openForgotPassword} className="px-4 text-sm text-[#434653] hover:text-[#00327d] transition-colors">비밀번호 찾기</button>
          </div>
        </div>
      </div>
    </div>
  );
}
