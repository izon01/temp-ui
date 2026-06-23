'use client';

import { useState, useTransition } from 'react';
import { useModal } from './ModalContext';
import { useApp } from '@/contexts/AppContext';
import SlideOverBase from './SlideOverBase';
import { createNotice } from '@/actions/notices';

const categories = ['공지', '필독', '프로그램'];
const iconMap: Record<string, string> = {
  '공지': 'campaign', '필독': 'notification_important', '프로그램': 'school',
};

export default function NoticeWriteSlideOver() {
  const { openModal, closeModal } = useModal();
  const { addNotice, showToast } = useApp();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('공지');
  const [isPinned, setIsPinned] = useState(false);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const reset = () => { setTitle(''); setContent(''); setCategory('공지'); setIsPinned(false); setError(''); };

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) {
      setError('제목과 내용을 모두 입력해주세요.');
      return;
    }
    setError('');
    startTransition(async () => {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('category', category);
      formData.append('isPinned', String(isPinned));

      const result = await createNotice(formData);
      if (result.success) {
        // 즉시 UI 반영 (옵티미스틱 업데이트)
        addNotice({ title, content, category, isPinned, icon: iconMap[category] ?? 'campaign' });
        showToast('공지가 등록되었습니다 ✓');
        reset();
        closeModal();
      } else {
        setError(result.error ?? '오류가 발생했습니다.');
      }
    });
  };

  return (
    <SlideOverBase isOpen={openModal === 'writeNotice'} onClose={() => { reset(); closeModal(); }} title="공지 등록">
      <div className="flex flex-col min-h-[70vh] md:min-h-0 md:h-full">
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 pb-28">

          {error && (
            <div className="bg-[#ffdad6] text-[#93000a] text-sm px-4 py-3 rounded-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}

          {/* 카테고리 */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#434653]">카테고리</label>
            <div className="flex gap-2 flex-wrap">
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                    category === cat
                      ? 'bg-[#00327d] text-white border-[#00327d]'
                      : 'bg-[#f3f4f5] border-[#c3c6d5] text-[#434653] hover:border-[#00327d] hover:text-[#00327d]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* 제목 */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#434653]">제목</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="공지 제목을 입력해 주세요"
              className="w-full bg-[#f3f4f5] border border-[#c3c6d5] rounded-xl px-4 py-4 text-lg focus:border-[#00327d] focus:ring-1 focus:ring-[#00327d] outline-none transition-all"
            />
          </div>

          {/* 내용 */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#434653]">내용</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="공지 내용을 입력해 주세요."
              rows={8}
              className="w-full bg-[#f3f4f5] border border-[#c3c6d5] rounded-xl px-4 py-3 focus:border-[#00327d] focus:ring-1 focus:ring-[#00327d] outline-none transition-all resize-none"
            />
          </div>

          {/* 필독 고정 */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              onClick={() => setIsPinned(p => !p)}
              className={`w-12 h-6 rounded-full transition-colors relative ${isPinned ? 'bg-[#b7102a]' : 'bg-[#c3c6d5]'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${isPinned ? 'translate-x-7' : 'translate-x-1'}`} />
            </div>
            <span className="text-sm font-semibold text-[#434653]">필독 공지로 상단 고정</span>
          </label>
        </div>

        {/* 등록 버튼 */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-md border-t border-[#e1e3e4]">
          <button
            onClick={handleSubmit}
            disabled={isPending || !title.trim() || !content.trim()}
            className="w-full bg-[#0047ab] text-white h-14 rounded-xl font-bold text-lg flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg disabled:opacity-50"
          >
            {isPending ? (
              <><span className="material-symbols-outlined animate-spin">progress_activity</span> 등록 중...</>
            ) : (
              <><span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span> 등록 완료</>
            )}
          </button>
        </div>
      </div>
    </SlideOverBase>
  );
}
