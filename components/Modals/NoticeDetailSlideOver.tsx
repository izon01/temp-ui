'use client';

import { useState, useTransition } from 'react';
import { useSession } from 'next-auth/react';
import { useModal } from './ModalContext';
import SlideOverBase from './SlideOverBase';
import { deleteNotice, updateNotice } from '@/actions/notices';
import { useApp } from '@/contexts/AppContext';
import { useRouter } from 'next/navigation';

const NOTICE_CATEGORIES = ['필독', '공지사항', '취업정보', '취업활동양식', '기타'];

export default function NoticeDetailSlideOver() {
  const { openModal, closeModal, selectedNotice } = useModal();
  const { data: session } = useSession();
  const { showToast } = useApp();
  const router = useRouter();
  const isAdmin = session?.user?.role === 'admin';
  const [isPending, startTransition] = useTransition();

  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCategories, setEditCategories] = useState<string[]>([]);
  const [editIsPinned, setEditIsPinned] = useState(false);

  const enterEditMode = () => {
    if (!selectedNotice) return;
    setEditTitle(selectedNotice.title);
    setEditContent(selectedNotice.content ?? '');
    setEditCategories(selectedNotice.category.split(',').map(c => c.trim()).filter(Boolean));
    setEditIsPinned(selectedNotice.isPinned);
    setEditMode(true);
  };

  const toggleCat = (cat: string) =>
    setEditCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);

  const handleSaveEdit = () => {
    if (!selectedNotice || !editTitle.trim() || !editContent.trim()) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.append('title', editTitle.trim());
      fd.append('content', editContent.trim());
      fd.append('category', editCategories.join(',') || '공지사항');
      fd.append('isPinned', String(editIsPinned));
      const result = await updateNotice(selectedNotice.id, fd);
      if (result.success) {
        showToast('공지사항이 수정되었습니다 ✓');
        setEditMode(false);
        closeModal();
        router.refresh();
      } else {
        showToast(result.error ?? '오류가 발생했습니다.');
      }
    });
  };

  const handleDelete = () => {
    if (!selectedNotice) return;
    if (!window.confirm('이 공지사항을 삭제하시겠습니까?')) return;
    startTransition(async () => {
      await deleteNotice(selectedNotice.id);
      closeModal();
      router.refresh();
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
                {!editMode ? (
                  <>
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
                  </>
                ) : (
                  <p className="font-bold text-[#191c1d]">공지사항 수정</p>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {isAdmin && !editMode && (
                  <>
                    <button
                      onClick={enterEditMode}
                      disabled={isPending}
                      className="flex items-center gap-1 bg-[#dae2ff] text-[#00327d] hover:bg-[#0047ab] hover:text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                      수정하기
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={isPending}
                      className="flex items-center gap-1 bg-[#ffdad6] text-[#93000a] hover:bg-[#ba1a1a] hover:text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                      {isPending ? '삭제 중...' : '삭제'}
                    </button>
                  </>
                )}
                <button onClick={closeModal} className="p-2 rounded-full hover:bg-[#edeeef] transition-colors text-[#737784]">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
          </div>

          {/* Content / Edit Form */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {!editMode ? (
              <>
                {selectedNotice.imageUrl && (
                  <div className="mb-6 rounded-xl overflow-hidden border border-[#e1e3e4]">
                    <img src={selectedNotice.imageUrl} alt="첨부 이미지" className="w-full object-cover max-h-80" />
                  </div>
                )}
                <div className="text-[#434653] leading-relaxed whitespace-pre-wrap text-[15px]">
                  {selectedNotice.content ?? '내용이 없습니다.'}
                </div>
              </>
            ) : (
              <div className="space-y-5">
                {/* 카테고리 */}
                <div>
                  <p className="text-sm font-bold text-[#191c1d] mb-2">카테고리 (복수 선택 가능)</p>
                  <div className="flex flex-wrap gap-2">
                    {NOTICE_CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        onClick={() => toggleCat(cat)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold border transition-colors ${
                          editCategories.includes(cat)
                            ? 'bg-[#0047ab] text-white border-[#0047ab]'
                            : 'bg-white text-[#434653] border-[#e1e3e4] hover:border-[#0047ab]'
                        }`}
                      >
                        {editCategories.includes(cat) && (
                          <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        )}
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                {/* 필독 토글 */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setEditIsPinned(p => !p)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold transition-colors ${
                      editIsPinned
                        ? 'bg-[#ffdad8] text-[#b7102a] border-[#ffdad8]'
                        : 'bg-white text-[#434653] border-[#e1e3e4]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">push_pin</span>
                    {editIsPinned ? '필독 설정됨' : '필독 설정'}
                  </button>
                </div>
                {/* 제목 */}
                <div>
                  <p className="text-sm font-bold text-[#191c1d] mb-1">제목</p>
                  <input
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    className="w-full border border-[#e1e3e4] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0047ab]"
                  />
                </div>
                {/* 내용 */}
                <div>
                  <p className="text-sm font-bold text-[#191c1d] mb-1">내용</p>
                  <textarea
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    rows={8}
                    className="w-full border border-[#e1e3e4] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0047ab] resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setEditMode(false)}
                    className="flex-1 py-3 rounded-xl border border-[#e1e3e4] text-sm font-bold text-[#434653] hover:bg-[#f3f4f5] transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={isPending || !editTitle.trim() || !editContent.trim()}
                    className="flex-1 py-3 rounded-xl bg-[#0047ab] text-white text-sm font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isPending ? '저장 중...' : '저장하기'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </SlideOverBase>
  );
}
