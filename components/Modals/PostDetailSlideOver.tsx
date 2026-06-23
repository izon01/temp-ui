'use client';

import { useModal } from './ModalContext';
import SlideOverBase from './SlideOverBase';

export default function PostDetailSlideOver() {
  const { openModal, closeModal } = useModal();

  return (
    <SlideOverBase isOpen={openModal === 'postDetail'} onClose={closeModal} title="">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-6 pt-4 pb-4 border-b border-[#e1e3e4] flex items-start justify-between">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-[#dae2ff] text-[#001946] text-xs px-2 py-0.5 rounded font-bold">Global Talent</span>
              <span className="text-[#737784] text-sm">No. 2024-082</span>
            </div>
            <h2 className="text-xl font-bold text-[#191c1d] leading-tight" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>
              2024년 하반기 경북 인재 스쿨 장학생 선발 기준 개편 안내
            </h2>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#db313f] flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-[18px]">person</span>
                </div>
                <span className="text-sm font-bold">운영관리자 김청년</span>
              </div>
              <div className="flex items-center gap-1 text-[#737784]">
                <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                <span className="text-sm">2026년 6월 23일</span>
              </div>
            </div>
          </div>
          <button onClick={closeModal} className="p-2 rounded-full hover:bg-[#edeeef] transition-colors text-[#737784] flex-shrink-0">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <div className="text-[#434653] leading-relaxed space-y-4">
            <p>
              안녕하십니까, 경북청년인재스쿨 운영국입니다.<br /><br />
              오는 하반기부터 적용되는 <strong className="text-[#191c1d]">&apos;경북 인재 육성 프로젝트&apos;</strong> 장학생 선발 기준에 대한 대규모 개편 사항을 안내드립니다.
            </p>
            <h4 className="font-bold text-[#191c1d] text-lg" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>핵심 변경 사항</h4>
            <ul className="space-y-2 list-disc pl-5">
              <li>서류 평가 내 &apos;지역 프로젝트 수행 실적&apos; 가점 20% 상향</li>
              <li>비대면 면접 시스템 도입을 통한 편의성 개선</li>
              <li>소득 분위별 맞춤형 주거 지원 패키지 신설</li>
            </ul>
            <div className="bg-[#edeeef] p-4 rounded-xl border border-[#e1e3e4] italic text-[#434653]">
              &quot;경북의 미래는 청년들의 꿈에서 시작됩니다. 우리는 당신의 도전이 현실이 될 수 있도록 가장 든든한 조력자가 되겠습니다.&quot;
            </div>
            <p>자세한 사항은 하단의 첨부파일을 내려받아 확인해 주시기 바라며, 관련 문의는 고객센터(054-000-0000)를 통해 접수해 주시기 바랍니다.</p>
          </div>

          {/* Attachments */}
          <div>
            <h4 className="text-sm text-[#737784] uppercase tracking-wider mb-3">첨부파일 (2)</h4>
            <div className="space-y-2">
              {[
                { name: '2024_하반기_선발_가이드라인.pdf', size: '2.4 MB', icon: 'picture_as_pdf', bg: 'bg-[#ffdad6]', color: 'text-[#93000a]' },
                { name: '장학금_신청_서식_모음.zip', size: '15.8 MB', icon: 'description', bg: 'bg-[#dae2ff]', color: 'text-[#001946]' },
              ].map(f => (
                <div key={f.name} className="flex items-center justify-between p-3 bg-white border border-[#c3c6d5] rounded-xl hover:border-[#00327d] cursor-pointer transition-all group">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${f.bg} flex items-center justify-center ${f.color}`}>
                      <span className="material-symbols-outlined">{f.icon}</span>
                    </div>
                    <div>
                      <p className="font-bold text-[#191c1d] text-sm">{f.name}</p>
                      <p className="text-xs text-[#737784]">{f.size}</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[#737784] group-hover:text-[#00327d] transition-colors">download</span>
                </div>
              ))}
            </div>
          </div>

          <button className="w-full py-3 bg-[#00327d] text-white font-bold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all">
            <span className="material-symbols-outlined">download</span>
            첨부파일 전체 다운로드
          </button>
        </div>

        {/* Comment footer */}
        <div className="p-4 border-t border-[#e1e3e4] bg-white">
          <div className="flex items-center gap-3 mb-3">
            <span className="font-bold text-[#434653]">댓글 <span className="text-[#00327d]">12</span></span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-[#edeeef] rounded-xl px-4 py-2">
              <textarea className="w-full bg-transparent border-none focus:ring-0 resize-none text-sm py-1 outline-none" placeholder="궁금한 점이나 의견을 남겨주세요..." rows={1} />
            </div>
            <button className="bg-[#0047ab] text-white px-4 py-2 rounded-xl font-bold text-sm active:scale-95 transition-all">
              등록
            </button>
          </div>
        </div>
      </div>
    </SlideOverBase>
  );
}
