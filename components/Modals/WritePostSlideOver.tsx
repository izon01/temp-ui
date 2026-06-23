'use client';

import { useState } from 'react';
import { useModal } from './ModalContext';
import SlideOverBase from './SlideOverBase';

export default function WritePostSlideOver() {
  const { openModal, closeModal } = useModal();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setTitle('');
      setContent('');
      closeModal();
    }, 1000);
  };

  return (
    <SlideOverBase isOpen={openModal === 'write'} onClose={closeModal} title="새 글 작성">
      <div className="flex flex-col h-full min-h-[70vh] md:min-h-0 md:h-full">
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 pb-28">
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

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#434653]">카테고리</label>
            <div className="flex gap-2 flex-wrap">
              {['자유게시판', '취업/진로', '스터디모집'].map(cat => (
                <button key={cat} className="px-3 py-1.5 bg-[#f3f4f5] border border-[#c3c6d5] rounded-full text-sm font-semibold text-[#434653] hover:border-[#00327d] hover:text-[#00327d] transition-all">
                  {cat}
                </button>
              ))}
            </div>
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

          {/* File upload */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#434653]">파일 업로드</label>
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
            disabled={submitting}
            className="w-full bg-[#0047ab] text-white h-14 rounded-xl font-bold text-lg flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg disabled:opacity-70"
          >
            {submitting ? (
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
