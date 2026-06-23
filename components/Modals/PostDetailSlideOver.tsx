'use client';

import { useModal } from './ModalContext';
import SlideOverBase from './SlideOverBase';

const categoryStyle: Record<string, { bg: string; text: string }> = {
  '스터디모집': { bg: 'bg-[#8cf5e4]', text: 'text-[#00201c]' },
  '취업/진로': { bg: 'bg-[#ffdad8]', text: 'text-[#410007]' },
  '자유게시판': { bg: 'bg-[#dae2ff]', text: 'text-[#001946]' },
};

export default function PostDetailSlideOver() {
  const { openModal, closeModal, selectedPost } = useModal();

  return (
    <SlideOverBase isOpen={openModal === 'postDetail'} onClose={closeModal} title="">
      {selectedPost && (
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-6 pt-4 pb-4 border-b border-[#e1e3e4] flex items-start justify-between">
            <div className="flex-1 pr-4">
              <div className="flex items-center gap-2 mb-2">
                {(() => {
                  const s = categoryStyle[selectedPost.category] ?? { bg: 'bg-[#e7e8e9]', text: 'text-[#434653]' };
                  return (
                    <span className={`${s.bg} ${s.text} text-xs px-2 py-0.5 rounded font-bold`}>
                      {selectedPost.category}
                    </span>
                  );
                })()}
                <span className="text-[#737784] text-sm">{selectedPost.timeAgo}</span>
              </div>
              <h2
                className="text-xl font-bold text-[#191c1d] leading-tight"
                style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}
              >
                {selectedPost.title}
              </h2>
              <div className="flex items-center gap-2 mt-3">
                <div className="w-8 h-8 rounded-full bg-[#dae2ff] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#00327d] text-[18px]">person</span>
                </div>
                <span className="text-sm font-bold text-[#191c1d]">{selectedPost.author}</span>
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
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
            {selectedPost.hasImage && (
              <div className="w-full h-48 bg-[#e1e3e4] rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-[#737784] text-[60px]">image</span>
              </div>
            )}
            <p className="text-[#434653] leading-relaxed whitespace-pre-line">{selectedPost.content}</p>

            <div className="flex items-center gap-4 pt-4 border-t border-[#e1e3e4]">
              <button className="flex items-center gap-2 text-[#737784] hover:text-[#00327d] transition-colors">
                <span className="material-symbols-outlined text-[20px]">thumb_up</span>
                <span className="text-sm">좋아요</span>
              </button>
              <button className="flex items-center gap-2 text-[#737784] hover:text-[#00327d] transition-colors">
                <span className="material-symbols-outlined text-[20px]">share</span>
                <span className="text-sm">공유</span>
              </button>
            </div>
          </div>

          {/* Comment footer */}
          <div className="p-4 border-t border-[#e1e3e4] bg-white">
            <div className="flex items-center gap-3 mb-3">
              <span className="font-bold text-[#434653]">
                댓글 <span className="text-[#00327d]">{selectedPost.comments}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-[#edeeef] rounded-xl px-4 py-2">
                <textarea
                  className="w-full bg-transparent border-none focus:ring-0 resize-none text-sm py-1 outline-none"
                  placeholder="댓글을 남겨주세요..."
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
