'use client';

import { useEffect, useState, useTransition } from 'react';
import { useSession } from 'next-auth/react';
import { useModal } from './ModalContext';
import SlideOverBase from './SlideOverBase';
import { getPostComments, addComment, deleteCommunityPost, updateCommunityPost } from '@/actions/community';
import { useApp } from '@/contexts/AppContext';
import { useRouter } from 'next/navigation';

const COMMUNITY_CATEGORIES = ['스터디모집', '취업/진로', '자유게시판'];

const categoryStyle: Record<string, { bg: string; text: string }> = {
  '스터디모집': { bg: 'bg-[#8cf5e4]', text: 'text-[#00201c]' },
  '취업/진로':  { bg: 'bg-[#ffdad8]', text: 'text-[#410007]' },
  '자유게시판': { bg: 'bg-[#dae2ff]', text: 'text-[#001946]' },
};

interface Comment {
  id: number; authorName: string; content: string; createdAt: string;
}

export default function PostDetailSlideOver() {
  const { openModal, closeModal, selectedPost } = useModal();
  const { data: session } = useSession();
  const { showToast } = useApp();
  const router = useRouter();
  const isAdmin = session?.user?.role === 'admin';

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isPending, startTransition] = useTransition();

  const [editMode, setEditMode] = useState(false);
  const [editCategory, setEditCategory] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    if (!selectedPost?.id) { setComments([]); setEditMode(false); return; }
    setEditMode(false);
    startTransition(async () => {
      const rows = await getPostComments(selectedPost.id);
      setComments(rows);
    });
  }, [selectedPost?.id]);

  const enterEditMode = () => {
    if (!selectedPost) return;
    setEditCategory(selectedPost.category);
    setEditTitle(selectedPost.title);
    setEditContent(selectedPost.content);
    setEditMode(true);
  };

  const handleSaveEdit = () => {
    if (!selectedPost || !editTitle.trim() || !editContent.trim()) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.append('category', editCategory);
      fd.append('title', editTitle.trim());
      fd.append('content', editContent.trim());
      const result = await updateCommunityPost(selectedPost.id, fd);
      if (result.success) {
        showToast('게시글이 수정되었습니다 ✓');
        setEditMode(false);
        closeModal();
        router.refresh();
      } else {
        showToast(result.error ?? '오류가 발생했습니다.');
      }
    });
  };

  const handleAddComment = () => {
    if (!commentText.trim() || !selectedPost) return;
    const text = commentText.trim();
    setCommentText('');
    startTransition(async () => {
      const fd = new FormData();
      fd.append('postId', String(selectedPost.id));
      fd.append('content', text);
      const result = await addComment(fd);
      if (result.success) {
        const rows = await getPostComments(selectedPost.id);
        setComments(rows);
        showToast('댓글이 등록되었습니다 ✓');
      } else {
        showToast(result.error ?? '오류가 발생했습니다.');
      }
    });
  };

  const handleDeletePost = () => {
    if (!selectedPost) return;
    if (!confirm(`"${selectedPost.title}" 게시글을 삭제하시겠습니까?`)) return;
    startTransition(async () => {
      const result = await deleteCommunityPost(selectedPost.id);
      if (result.success) {
        showToast('게시글이 삭제되었습니다.');
        closeModal();
        router.refresh();
      } else {
        showToast(result.error ?? '삭제 중 오류가 발생했습니다.');
      }
    });
  };

  return (
    <SlideOverBase isOpen={openModal === 'postDetail'} onClose={closeModal} title="">
      {selectedPost && (
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-6 pt-4 pb-4 border-b border-[#e1e3e4] flex items-start justify-between">
            <div className="flex-1 pr-4">
              {!editMode ? (
                <>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {(() => {
                      const s = categoryStyle[selectedPost.category] ?? { bg: 'bg-[#e7e8e9]', text: 'text-[#434653]' };
                      return (
                        <span className={`${s.bg} ${s.text} text-xs px-2 py-0.5 rounded font-bold`}>
                          {selectedPost.category}
                        </span>
                      );
                    })()}
                    <span className="text-[#737784] text-sm">{selectedPost.timeAgo}</span>
                    {isAdmin && (
                      <div className="ml-auto flex gap-2">
                        <button
                          onClick={enterEditMode}
                          disabled={isPending}
                          className="bg-[#0047ab] text-white text-xs px-3 py-1 rounded-lg font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                        >
                          수정하기
                        </button>
                        <button
                          onClick={handleDeletePost}
                          disabled={isPending}
                          className="bg-[#E63946] text-white text-xs px-3 py-1 rounded-lg font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                        >
                          삭제
                        </button>
                      </div>
                    )}
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
                </>
              ) : (
                <p className="font-bold text-[#191c1d]">게시글 수정</p>
              )}
            </div>
            <button
              onClick={closeModal}
              className="p-2 rounded-full hover:bg-[#edeeef] transition-colors text-[#737784] flex-shrink-0"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Content / Edit Form */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
            {!editMode ? (
              <>
                {selectedPost.hasImage && (
                  selectedPost.imageUrl
                    ? <img src={selectedPost.imageUrl} alt="첨부 이미지" className="w-full rounded-xl object-cover max-h-64" />
                    : <div className="w-full h-48 bg-[#e1e3e4] rounded-xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#737784] text-[60px]">image</span>
                      </div>
                )}
                <p className="text-[#434653] leading-relaxed whitespace-pre-line">{selectedPost.content}</p>

                {comments.length > 0 && (
                  <div className="pt-4 border-t border-[#e1e3e4] space-y-3">
                    <p className="text-sm font-bold text-[#434653]">댓글 {comments.length}개</p>
                    {comments.map(c => (
                      <div key={c.id} className="bg-[#f3f4f5] rounded-xl p-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-[#191c1d]">{c.authorName}</span>
                          <span className="text-xs text-[#737784]">{c.createdAt}</span>
                        </div>
                        <p className="text-sm text-[#434653]">{c.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-bold text-[#191c1d] mb-2">카테고리</p>
                  <div className="flex gap-2 flex-wrap">
                    {COMMUNITY_CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setEditCategory(cat)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-bold border transition-colors ${
                          editCategory === cat
                            ? 'bg-[#0047ab] text-white border-[#0047ab]'
                            : 'bg-white text-[#434653] border-[#e1e3e4] hover:border-[#0047ab]'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#191c1d] mb-1">제목</p>
                  <input
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    className="w-full border border-[#e1e3e4] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0047ab]"
                  />
                </div>
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

          {/* Comment footer (뷰 모드만) */}
          {!editMode && (
            <div className="p-4 border-t border-[#e1e3e4] bg-white">
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-[#edeeef] rounded-xl px-4 py-2">
                  <textarea
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment(); } }}
                    className="w-full bg-transparent border-none focus:ring-0 resize-none text-sm py-1 outline-none"
                    placeholder="댓글을 남겨주세요..."
                    rows={1}
                  />
                </div>
                <button
                  onClick={handleAddComment}
                  disabled={isPending || !commentText.trim()}
                  className="bg-[#0047ab] text-white px-4 py-2 rounded-xl font-bold text-sm active:scale-95 transition-all disabled:opacity-50"
                >
                  {isPending ? '...' : '등록'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </SlideOverBase>
  );
}
