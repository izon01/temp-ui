'use client';

import { useModal } from './ModalContext';
import SlideOverBase from './SlideOverBase';

export default function NoticeDetailSlideOver() {
  const { openModal, closeModal, selectedNotice } = useModal();

  return (
    <SlideOverBase isOpen={openModal === 'noticeDetail'} onClose={closeModal} title="">
      {selectedNotice && (
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-6 pt-4 pb-4 border-b border-[#e1e3e4] flex items-start justify-between">
            <div className="flex-1 pr-4">
              <div className="flex items-center gap-2 mb-2">
                {selectedNotice.isPinned && (
                  <span className="bg-[#ffdad8] text-[#b7102a] text-xs px-2 py-0.5 rounded font-bold">[필독]</span>
                )}
                <span className="bg-[#e7e8e9] text-[#434653] text-xs px-2 py-0.5 rounded font-bold">
                  {selectedNotice.category}
                </span>
              </div>
              <h2
                className="text-xl font-bold text-[#191c1d] leading-tight"
                style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}
              >
                {selectedNotice.title}
              </h2>
              <div className="flex items-center gap-4 mt-3 text-sm text-[#737784]">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                  {selectedNotice.date}
                </div>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">visibility</span>
                  {selectedNotice.views.toLocaleString()}
                </div>
              </div>
            </div>
            <button
              onClick={closeModal}
              className="p-2 rounded-full hover:bg-[#edeeef] transition-colors text-[#737784] flex-shrink-0"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            <div className="text-[#434653] leading-relaxed space-y-4">
              <p>
                안녕하십니까, 경북청년인재스쿨 운영국입니다.<br /><br />
                <strong className="text-[#191c1d]">{selectedNotice.title}</strong>에 관한 안내사항을 전달드립니다.
              </p>
              <div className="bg-[#edeeef] p-4 rounded-xl border border-[#e1e3e4] italic text-[#434653]">
                &quot;경북의 미래는 청년들의 꿈에서 시작됩니다. 우리는 당신의 도전이 현실이 될 수 있도록 가장 든든한 조력자가 되겠습니다.&quot;
              </div>
              <p>
                자세한 사항은 아래 첨부파일을 내려받아 확인해 주시기 바라며,
                관련 문의는 고객센터(054-000-0000)를 통해 접수해 주시기 바랍니다.
              </p>
            </div>

            {/* Attachments */}
            <div>
              <h4 className="text-sm text-[#737784] uppercase tracking-wider mb-3">첨부파일 (1)</h4>
              <div
                className="flex items-center justify-between p-3 bg-white border border-[#c3c6d5] rounded-xl hover:border-[#00327d] cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#ffdad6] flex items-center justify-center text-[#93000a]">
                    <span className="material-symbols-outlined">picture_as_pdf</span>
                  </div>
                  <div>
                    <p className="font-bold text-[#191c1d] text-sm">공지사항_상세내용.pdf</p>
                    <p className="text-xs text-[#737784]">1.2 MB</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[#737784] group-hover:text-[#00327d] transition-colors">
                  download
                </span>
              </div>
            </div>

            <button className="w-full py-3 bg-[#00327d] text-white font-bold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all">
              <span className="material-symbols-outlined">download</span>
              첨부파일 다운로드
            </button>
          </div>

          {/* Comment footer */}
          <div className="p-4 border-t border-[#e1e3e4] bg-white">
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-[#edeeef] rounded-xl px-4 py-2">
                <textarea
                  className="w-full bg-transparent border-none focus:ring-0 resize-none text-sm py-1 outline-none"
                  placeholder="궁금한 점이나 의견을 남겨주세요..."
                  rows={1}
                />
              </div>
              <button className="bg-[#0047ab] text-white px-4 py-2 rounded-xl font-bold text-sm active:scale-95 transition-all">
                등록
              </button>
            </div>
          </div>
        </div>
      )}
    </SlideOverBase>
  );
}
