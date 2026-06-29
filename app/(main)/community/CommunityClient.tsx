'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useModal } from '@/components/Modals/ModalContext';
import { deleteCommunityPost } from '@/actions/community';
import { useApp } from '@/contexts/AppContext';

interface Post {
  id: number; category: string; title: string; content: string;
  authorName: string; hasImage: boolean; imageUrl?: string | null;
  comments: number; date: string;
}

interface Props {
  initialPosts: Post[];
}

const categoryStyle: Record<string, { bg: string; text: string }> = {
  '스터디모집': { bg: 'bg-[#8cf5e4]', text: 'text-[#00201c]' },
  '취업/진로':  { bg: 'bg-[#ffdad8]', text: 'text-[#410007]' },
  '자유게시판': { bg: 'bg-[#dae2ff]', text: 'text-[#001946]' },
};

const TABS = ['전체', '자유게시판', '취업/진로', '스터디모집'];
const ITEMS_PER_PAGE = 9;

function timeAgo(date: string) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60)    return '방금 전';
  if (diff < 3600)  return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} 기준`;
}

export default function CommunityClient({ initialPosts }: Props) {
  const [activeTab, setActiveTab] = useState('전체');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPending, startTransition] = useTransition();
  const { openWrite, openPostDetail } = useModal();
  const { showToast } = useApp();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'admin';
  const router = useRouter();
  const today = todayStr();

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleDeletePost = (e: React.MouseEvent, post: Post) => {
    e.stopPropagation();
    if (!confirm(`"${post.title}" 게시글을 삭제하시겠습니까?`)) return;
    startTransition(async () => {
      const result = await deleteCommunityPost(post.id);
      if (result.success) {
        showToast('게시글이 삭제되었습니다.');
        router.refresh();
      } else {
        showToast(result.error ?? '삭제 중 오류가 발생했습니다.');
      }
    });
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const filtered = initialPosts
    .filter(p => activeTab === '전체' || p.category === activeTab)
    .filter(p => !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.content.toLowerCase().includes(searchQuery.toLowerCase()));

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const half = 2;
  let start = Math.max(1, safePage - half);
  let end   = Math.min(totalPages, start + 4);
  start = Math.max(1, end - 4);
  const pageNums: number[] = [];
  for (let i = start; i <= end; i++) pageNums.push(i);

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-10">
      {/* Header */}
      <header className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#191c1d]" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>커뮤니티</h1>
          <p className="text-[#434653] mt-1">인재스쿨 청년들과 자유롭게 이야기를 나눠보세요.</p>
        </div>
        <button
          onClick={openWrite}
          className="hidden md:flex items-center gap-2 bg-[#00327d] text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg hover:bg-[#0047ab] transition-all active:scale-95"
        >
          <span className="material-symbols-outlined">edit</span>
          글쓰기
        </button>
      </header>

      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-[#eef2ff] to-[#f0f9ff] rounded-2xl px-8 py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-sm border border-[#dae2ff] mb-6">
        <div className="flex flex-col justify-center gap-4">
          <h2
            className="text-3xl md:text-4xl font-extrabold text-[#191c1d] leading-tight"
            style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}
          >
            혼자보다 함께 가면<br />더 멀리 성장합니다.
          </h2>
          <p className="text-[#434653] text-base md:text-lg leading-relaxed">
            취업 준비 이야기부터 궁금한 점, 응원의 한마디까지<br className="hidden md:block" />
            청년인재스쿨 참여자들과 자유롭게 소통해 보세요.
          </p>
        </div>
        <div className="flex-shrink-0 flex justify-center md:justify-end">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/img3.png"
            alt="커뮤니티 배너 이미지"
            style={{ width: '220px', height: 'auto' }}
            className="object-contain drop-shadow-md"
          />
        </div>
      </section>

      {/* 전체 게시글 수 위젯 */}
      <div className="bg-[#e7e8e9] rounded-xl p-5 mb-6 flex items-center justify-between">
        <div>
          <p className="text-[#434653] text-xs uppercase tracking-wider mb-0.5">전체 게시글</p>
          <p className="text-3xl font-bold text-[#00327d]" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>
            {filtered.length}<span className="text-base font-normal text-[#737784] ml-2">{today}</span>
          </p>
        </div>
        <span className="material-symbols-outlined text-[40px] text-[#c3c6d5]" style={{ fontVariationSettings: "'FILL' 1" }}>forum</span>
      </div>

      {/* Search & filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-grow relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#737784]">search</span>
          <input
            value={searchQuery}
            onChange={e => handleSearchChange(e.target.value)}
            className="w-full bg-white border border-[#c3c6d5] focus:border-[#00327d] focus:ring-1 focus:ring-[#00327d] rounded-lg pl-12 pr-10 py-3 outline-none transition-all"
            placeholder="제목 또는 내용으로 검색"
            type="text"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#737784] hover:text-[#191c1d]"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                activeTab === tab ? 'bg-[#00327d] text-white' : 'bg-[#e7e8e9] text-[#434653] hover:bg-[#edeeef]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Post grid */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center text-[#737784]">
          <span className="material-symbols-outlined text-[48px] block mb-2">
            {searchQuery ? 'search_off' : 'forum'}
          </span>
          {searchQuery
            ? <><p className="font-semibold">&ldquo;{searchQuery}&rdquo; 검색 결과가 없습니다.</p><p className="text-sm mt-1">다른 키워드로 검색해보세요.</p></>
            : <><p className="font-semibold">아직 게시글이 없습니다.</p><p className="text-sm mt-1">첫 번째 글을 작성해보세요!</p></>
          }
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginated.map(post => {
            const catStyle = categoryStyle[post.category] ?? { bg: 'bg-[#e7e8e9]', text: 'text-[#434653]' };
            return (
              <article
                key={post.id}
                onClick={() => openPostDetail({
                  id: post.id,
                  category: post.category,
                  title: post.title,
                  content: post.content,
                  author: post.authorName,
                  timeAgo: timeAgo(post.date),
                  comments: post.comments,
                  hasImage: post.hasImage,
                  imageUrl: post.imageUrl,
                })}
                className="bg-white rounded-xl shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 border border-transparent cursor-pointer flex flex-col overflow-hidden relative"
              >
                {isAdmin && (
                  <button
                    onClick={(e) => handleDeletePost(e, post)}
                    disabled={isPending}
                    className="absolute top-3 right-3 z-10 bg-[#E63946] text-white text-xs px-2 py-1 rounded-lg font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                  >
                    삭제
                  </button>
                )}
                {post.hasImage && (
                  <div className="h-40 bg-[#e1e3e4] overflow-hidden">
                    {post.imageUrl
                      ? <img src={post.imageUrl} alt="첨부 이미지" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-[#737784] text-[60px]">image</span></div>
                    }
                  </div>
                )}
                <div className="p-6 flex flex-col justify-between flex-1">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`${catStyle.bg} ${catStyle.text} text-xs px-2 py-1 rounded font-semibold`}>{post.category}</span>
                      <span className="text-[#737784] text-xs">{timeAgo(post.date)}</span>
                    </div>
                    <h3 className="font-bold text-lg text-[#191c1d] mb-2 line-clamp-2" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>{post.title}</h3>
                    <p className="text-[#434653] text-sm mb-4 line-clamp-3">{post.content}</p>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-[#f3f4f5] mt-auto">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#dae2ff] flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#00327d] text-xl">person</span>
                      </div>
                      <span className="text-sm font-semibold text-[#191c1d]">{post.authorName}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[#434653]">
                      <span className="material-symbols-outlined text-[18px]">comment</span>
                      <span className="text-sm">{post.comments}</span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-10 flex justify-center items-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="w-9 h-9 rounded-lg border border-[#c3c6d5] flex items-center justify-center hover:bg-[#f3f4f5] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
          </button>
          <div className="flex gap-2">
            {pageNums.map(n => (
              <button
                key={n}
                onClick={() => setCurrentPage(n)}
                className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
                  n === safePage ? 'bg-[#00327d] text-white' : 'border border-[#c3c6d5] hover:bg-[#f3f4f5] text-[#434653]'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="w-9 h-9 rounded-lg border border-[#c3c6d5] flex items-center justify-center hover:bg-[#f3f4f5] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>
        </div>
      )}

      {/* Mobile FAB */}
      <button
        onClick={openWrite}
        className="md:hidden fixed bottom-20 right-4 bg-[#00327d] text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center z-40 active:scale-90 transition-transform duration-150"
      >
        <span className="material-symbols-outlined text-[28px]">edit</span>
      </button>
    </div>
  );
}
