import Link from 'next/link';

export default function PendingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa]">
      {/* Header */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="flex justify-between items-center w-full px-4 md:px-6 h-16 max-w-[1200px] mx-auto">
          <span className="font-bold text-xl text-[#00327d]" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>경북청년인재스쿨</span>
        </div>
      </nav>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg bg-white rounded-xl shadow-sm p-6 md:p-10 flex flex-col items-center text-center">
          {/* Illustration */}
          <div className="relative w-40 h-40 mb-6">
            <div className="absolute inset-0 bg-[#00327d]/5 rounded-full scale-110" />
            <div className="relative w-full h-full bg-[#edeeef] rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-[#00327d] text-[80px]" style={{ fontVariationSettings: "'FILL' 0" }}>hourglass_top</span>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-[#b7102a] text-white px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg animate-bounce">
              <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
              <span className="text-[11px] font-bold">확인 중</span>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-[#191c1d] mb-3" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>
            가입 승인 대기 중입니다
          </h1>
          <p className="text-[#434653] mb-8 max-w-[320px] leading-relaxed">
            경북청년인재스쿨에 지원해 주셔서 감사합니다. 운영진의 승인 후 서비스를 정상적으로 이용하실 수 있습니다.
          </p>

          {/* Status */}
          <div className="w-full bg-[#f3f4f5] rounded-lg p-4 mb-8 flex items-start gap-3 text-left">
            <span className="material-symbols-outlined text-[#00327d] mt-0.5">info</span>
            <div>
              <span className="font-bold text-sm text-[#191c1d]">현재 상태</span>
              <p className="text-sm text-[#434653] mt-0.5">서류 검토 및 승인 프로세스가 진행 중입니다. (영업일 기준 1-3일 소요)</p>
            </div>
          </div>

          <Link href="/login" className="w-full">
            <button className="w-full bg-[#0047ab] text-white py-4 px-6 rounded-lg font-bold hover:brightness-110 active:scale-[0.98] transition-all shadow-lg">
              로그인 화면으로 돌아가기
            </button>
          </Link>

          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-[#737784]">도움이 필요하신가요?</span>
            <a href="#" className="text-sm text-[#00327d] font-bold hover:underline">고객센터 문의하기</a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#f3f4f5]">
        <div className="w-full py-6 px-4 flex flex-col md:flex-row justify-between items-center gap-3 max-w-[1200px] mx-auto">
          <span className="font-bold text-lg text-[#191c1d]" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>경북청년인재스쿨</span>
          <div className="flex gap-4">
            <a href="#" className="text-sm text-[#434653] hover:text-[#00327d]">이용약관</a>
            <a href="#" className="text-sm text-[#434653] hover:text-[#00327d]">개인정보처리방침</a>
            <a href="#" className="text-sm text-[#434653] hover:text-[#00327d]">고객센터</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
