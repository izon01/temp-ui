'use client';

import { useTransition } from 'react';
import { useSession } from 'next-auth/react';
import { useModal } from './ModalContext';
import SlideOverBase from './SlideOverBase';
import { deleteNotice } from '@/actions/notices';

export default function NoticeDetailSlideOver() {
  const { openModal, closeModal, selectedNotice } = useModal();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'admin';
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!selectedNotice) return;
    if (!window.confirm('이 공지사항을 삭제하시겠습니까?')) return;
    startTransition(async () => {
      await deleteNotice(selectedNotice.id);
      closeModal();
    });
  };

  return (
    <SlideOverBase isOpen={openModal === 'noticeDetail'} onClose={closeModal} title="">
      {selectedNotice && (
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-6 pt-4 pb-4 border-b border-[#e1e3e4]">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {selectedNotice.isPinned && (
                    <span className="bg-[#ffdad8] text-[#b7102a] text-xs px-2 py-0.5 rounded font-bold">[필독]</span>
                  )}
                  {selectedNotice.category.split(',').map(cat => cat.trim()).filter(Boolean).map(cat => (
                    <span key={cat} className="bg-[#e7e8e9] text-[#434653] text-xs px-2 py-0.5 rounded font-bold">
                      {cat}
                    </span>
                  ))}
                </div>
                <h2 className="text-xl font-bold text-[#191c1d] leading-tight" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>
                  {selectedNotice.title}
                </h2>
                <div className="flex items-center gap-4 mt-3 text-sm text-[#737784]">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                    {selectedNotice.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                    {selectedNotice.views?.toLocaleString() ?? 0}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {isAdmin && (
                  <button
                    onClick={handleDelete}
                    disabled={isPending}
                    className="flex items-center gap-1 bg-[#ffdad6] text-[#93000a] hover:bg-[#ba1a1a] hover:text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                    {isPending ? '삭제 중...' : '삭제'}
                  </button>
                )}
                <button onClick={closeModal} className="p-2 rounded-full hover:bg-[#edeeef] transition-colors text-[#737784]">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {/* 첨부 이미지 */}
            {selectedNotice.imageUrl && (
              <div className="mb-6 rounded-xl overflow-hidden border border-[#e1e3e4]">
                <img
                  src={selectedNotice.imageUrl}
                  alt="첨부 이미지"
                  className="w-full object-cover max-h-80"
                />
              </div>
            )}

            {/* 본문 */}
            <div className="text-[#434653] leading-relaxed whitespace-pre-wrap text-[15px]">
              {selectedNotice.content ?? '내용이 없습니다.'}
            </div>
          </div>

        </div>
      )}
    </SlideOverBase>
  );
}
