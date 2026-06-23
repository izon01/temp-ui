'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useModal } from '@/components/Modals/ModalContext';

export default function LoginPage() {
  const [showPwd, setShowPwd] = useState(false);
  const { openForgotPassword } = useModal();

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

          <form className="flex flex-col gap-4" onSubmit={e => e.preventDefault()}>
            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-[#434653] flex items-center gap-1">
                <span className="material-symbols-outlined text-[18px]">mail</span>
                이메일
              </label>
              <input
                type="email"
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

              <Link href="/home">
                <button
                  type="button"
                  className="w-full h-14 bg-[#0047ab] text-white font-bold rounded-lg hover:brightness-110 active:scale-[0.98] transition-all shadow-sm"
                >
                  로그인
                </button>
              </Link>
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
