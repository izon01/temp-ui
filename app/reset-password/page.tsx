'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { resetPassword } from '@/actions/password';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError('비밀번호가 일치하지 않습니다.'); return; }
    if (password.length < 6) { setError('비밀번호는 6자 이상이어야 합니다.'); return; }
    setError(''); setLoading(true);
    const result = await resetPassword(token, password);
    setLoading(false);
    if (result.success) {
      setDone(true);
      setTimeout(() => router.push('/login'), 2000);
    } else {
      setError(result.error ?? '오류가 발생했습니다.');
    }
  };

  if (!token) {
    return (
      <div className="text-center text-white">
        <p className="text-lg font-semibold">잘못된 접근입니다.</p>
        <button onClick={() => router.push('/login')} className="mt-4 text-[#a5bdff] underline">로그인으로 돌아가기</button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[440px]">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>경북청년인재스쿨</h1>
      </div>
      <div className="bg-white rounded-xl shadow-2xl p-6 flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-semibold text-[#191c1d]" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>새 비밀번호 설정</h2>
          <p className="text-sm text-[#434653] mt-1">새로운 비밀번호를 입력해주세요.</p>
        </div>

        {done ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <span className="material-symbols-outlined text-[48px] text-[#16a34a]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            <p className="font-bold text-[#191c1d]">비밀번호가 변경되었습니다!</p>
            <p className="text-sm text-[#737784]">잠시 후 로그인 페이지로 이동합니다.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="bg-[#ffdad6] text-[#93000a] text-sm px-4 py-3 rounded-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>{error}
              </div>
            )}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-[#434653]">새 비밀번호</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="6자 이상 입력"
                  className="w-full h-14 px-4 bg-[#f8f9fa] border border-[#c3c6d5] rounded-lg focus:outline-none focus:border-[#0047ab] focus:ring-2 focus:ring-[#0047ab]/20 transition-all"
                />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#737784]">
                  <span className="material-symbols-outlined">{showPwd ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-[#434653]">비밀번호 확인</label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="비밀번호를 다시 입력"
                className="w-full h-14 px-4 bg-[#f8f9fa] border border-[#c3c6d5] rounded-lg focus:outline-none focus:border-[#0047ab] focus:ring-2 focus:ring-[#0047ab]/20 transition-all"
              />
            </div>
            <button type="submit" disabled={loading || !password || !confirm}
              className="w-full h-14 bg-[#0047ab] text-white font-bold rounded-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {loading
                ? <><span className="material-symbols-outlined animate-spin">progress_activity</span> 변경 중...</>
                : '비밀번호 변경'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="fixed inset-0 -z-10 bg-gradient-to-tr from-[#00327d] via-[#00327d] to-[#0047ab]" />
      <Suspense fallback={<div className="text-white">로딩 중...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
