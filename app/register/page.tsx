'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { registerUser } from '@/actions/register';

export default function RegisterPage() {
  const [showPwd, setShowPwd]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError]             = useState('');
  const [isPending, startTransition]  = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await registerUser(formData);
      // redirect가 throw하므로 result는 에러일 때만 돌아옴
      if (result && !result.success) {
        setError(result.error ?? '오류가 발생했습니다.');
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="fixed inset-0 -z-10 bg-gradient-to-tr from-[#00327d] via-[#00327d] to-[#0047ab]" />

      <div className="w-full max-w-[440px] flex flex-col items-center gap-10">
        {/* Branding */}
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>
            경북청년인재스쿨
          </h1>
          <p className="text-[#a5bdff] max-w-[280px] mx-auto leading-relaxed text-sm">
            아이디를 만들고 서비스를 이용해 보세요.
          </p>
        </div>

        {/* Card */}
        <div className="w-full bg-white rounded-xl shadow-2xl p-6 flex flex-col gap-6">
          <div>
            <h2 className="text-2xl font-semibold text-[#191c1d]" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>회원가입</h2>
            <p className="text-sm text-[#434653] mt-1">아래 정보를 입력하여 계정을 만들어 주세요.</p>
          </div>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-[#ffdad6] text-[#93000a] text-sm px-4 py-3 rounded-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                {error}
              </div>
            )}

            {/* 아이디 */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-[#434653] flex items-center gap-1">
                <span className="material-symbols-outlined text-[18px]">person</span>
                아이디
              </label>
              <input
                name="loginId"
                type="text"
                placeholder="영소문자·숫자·밑줄 3~20자"
                autoComplete="username"
                required
                className="w-full h-14 px-4 bg-[#f8f9fa] border border-[#c3c6d5] rounded-lg text-[#191c1d] placeholder:text-[#737784] focus:outline-none focus:border-[#0047ab] focus:ring-2 focus:ring-[#0047ab]/20 transition-all"
              />
            </div>

            {/* 이름 */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-[#434653] flex items-center gap-1">
                <span className="material-symbols-outlined text-[18px]">badge</span>
                이름
              </label>
              <input
                name="name"
                type="text"
                placeholder="실명을 입력하세요"
                required
                className="w-full h-14 px-4 bg-[#f8f9fa] border border-[#c3c6d5] rounded-lg text-[#191c1d] placeholder:text-[#737784] focus:outline-none focus:border-[#0047ab] focus:ring-2 focus:ring-[#0047ab]/20 transition-all"
              />
            </div>

            {/* 연락처 */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-[#434653] flex items-center gap-1">
                <span className="material-symbols-outlined text-[18px]">call</span>
                연락처 <span className="text-[#737784] font-normal">(선택)</span>
              </label>
              <input
                name="phone"
                type="tel"
                placeholder="010-0000-0000"
                className="w-full h-14 px-4 bg-[#f8f9fa] border border-[#c3c6d5] rounded-lg text-[#191c1d] placeholder:text-[#737784] focus:outline-none focus:border-[#0047ab] focus:ring-2 focus:ring-[#0047ab]/20 transition-all"
              />
            </div>

            {/* 비밀번호 */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-[#434653] flex items-center gap-1">
                <span className="material-symbols-outlined text-[18px]">lock</span>
                비밀번호
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPwd ? 'text' : 'password'}
                  placeholder="6자 이상"
                  autoComplete="new-password"
                  required
                  className="w-full h-14 px-4 bg-[#f8f9fa] border border-[#c3c6d5] rounded-lg text-[#191c1d] placeholder:text-[#737784] focus:outline-none focus:border-[#0047ab] focus:ring-2 focus:ring-[#0047ab]/20 transition-all"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#737784] hover:text-[#00327d] transition-colors">
                  <span className="material-symbols-outlined">{showPwd ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {/* 비밀번호 확인 */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-[#434653] flex items-center gap-1">
                <span className="material-symbols-outlined text-[18px]">lock_reset</span>
                비밀번호 확인
              </label>
              <div className="relative">
                <input
                  name="passwordConfirm"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="비밀번호를 다시 입력하세요"
                  autoComplete="new-password"
                  required
                  className="w-full h-14 px-4 bg-[#f8f9fa] border border-[#c3c6d5] rounded-lg text-[#191c1d] placeholder:text-[#737784] focus:outline-none focus:border-[#0047ab] focus:ring-2 focus:ring-[#0047ab]/20 transition-all"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#737784] hover:text-[#00327d] transition-colors">
                  <span className="material-symbols-outlined">{showConfirm ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full h-14 bg-[#0047ab] text-white font-bold rounded-lg hover:brightness-110 active:scale-[0.98] transition-all shadow-sm disabled:opacity-70 flex items-center justify-center gap-2 mt-2"
            >
              {isPending ? (
                <><span className="material-symbols-outlined animate-spin">progress_activity</span> 가입 중...</>
              ) : (
                <><span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>how_to_reg</span> 가입하기</>
              )}
            </button>
          </form>

          <div className="flex items-center justify-center py-2">
            <Link href="/login" className="text-sm text-[#434653] hover:text-[#00327d] transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              이미 계정이 있으신가요? 로그인
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
