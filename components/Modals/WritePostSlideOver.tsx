'use client';

import { useState, useTransition } from 'react';
import { useSession } from 'next-auth/react';
import { useModal } from './ModalContext';
import { useApp } from '@/contexts/AppContext';
import SlideOverBase from './SlideOverBase';
import { createCommunityPost } from '@/actions/community';

const CATEGORIES = ['자유게시판', '취업/진로', '스터디모집'] as const;
type Category = typeof CATEGORIES[number];

export default function WritePostSlideOver() {
  const { openModal, closeModal } = useModal();
  const { showToast } = useApp();
  const { data: session } = useSession();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Category>('자유게시판');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const reset = () => { setTitle(''); setContent(''); setCategory('자유게시판'); setError(''); };

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) { setError('제목과 내용을 입력해주세요.'); return; }
    setError('');
    startTransition(async () => {
      const formData = new FormData();
      formData.append('category', category);
      formData.append('title', title);
      formData.append('content', content);

      const result = await createCommunityPost(formData);
      if (result.success) {
        showToast('게시글이 등록되었습니다 ✓');
        reset();
        closeModal();
      } else {
        setError(result.error ?? '오류가 발생했습니다.');
      }
    });
  };

  return (
    <SlideOverBase isOpen={openModal === 'write'} onClose={() => { reset(); closeModal(); }} title="새 글 작성">
      <div className="flex flex-col min-h-[70vh] md:min-h-0 md:h-full">
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 pb-28">

          {error && (
            <div className="bg-[#ffdad6] text-[#93000a] text-sm px-4 py-3 rounded-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#434653]">카테고리</label>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(cat => (
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

          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#434653]">제목</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="제목을 입력해 주세요"
              className="w-full bg-[#f3f4f5] border border-[#c3c6d5] rounded-xl px-4 py-4 text-lg focus:border-[#00327d] focus:ring-1 focus:ring-[#00327d] outline-none transition-all"
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#434653]">내용</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="경북의 청년들과 공유하고 싶은 이야기를 들려주세요."
              rows={8}
              className="w-full bg-[#f3f4f5] border border-[#c3c6d5] rounded-xl px-4 py-3 focus:border-[#00327d] focus:ring-1 focus:ring-[#00327d] outline-none transition-all resize-none"
            />
          </div>

          {/* File upload (UI only) */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#434653]">파일 첨부 (선택)</label>
            <div className="border-2 border-dashed border-[#c3c6d5] rounded-xl p-8 flex flex-col items-center justify-center gap-2 bg-[#f3f4f5]/50 hover:bg-[#f3f4f5] transition-colors cursor-pointer active:scale-[0.98]">
              <span className="material-symbols-outlined text-[#00327d] text-[40px]">upload_file</span>
              <div className="text-center">
                <p className="font-bold text-[#191c1d]">클릭하여 파일 선택</p>
                <p className="text-sm text-[#434653]">JPG, PNG, PDF (최대 10MB)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Submit button */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md border-t border-[#e1e3e4]">
          <button
            onClick={handleSubmit}
            disabled={isPending || !title.trim() || !content.trim()}
            className="w-full bg-[#0047ab] text-white h-14 rounded-xl font-bold text-lg flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg disabled:opacity-50"
          >
            {isPending ? (
              <><span className="material-symbols-outlined animate-spin">progress_activity</span>등록 중...</>
            ) : (
              <><span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>등록 완료</>
            )}
          </button>
        </div>
      </div>
    </SlideOverBase>
  );
}
