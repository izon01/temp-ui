'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useModal } from '@/components/Modals/ModalContext';
import { deleteNotice } from '@/actions/notices';
import { useApp } from '@/contexts/AppContext';

interface Notice {
  id: number; title: string; category: string;
  isPinned: boolean; icon: string; views: number; date: string;
}

interface Props {
  initialNotices: Notice[];
}

const FILTERS = ['전체', '필독', '공지사항', '취업정보', '취업활동양식', '기타'];
const ITEMS_PER_PAGE = 10;

const categoryColor: Record<string, { bg: string; icon: string }> = {
  '필독':      { bg: 'bg-[#db313f]',  icon: 'text-white' },
  '공지사항':  { bg: 'bg-[#0047ab]',  icon: 'text-white' },
  '취업정보':  { bg: 'bg-[#2A9D8F]',  icon: 'text-white' },
  '취업활동양식': { bg: 'bg-[#e76f51]', icon: 'text-white' },
  '기타':      { bg: 'bg-[#6c757d]',  icon: 'text-white' },
};

function getNoticeColor(category: string, isPinned: boolean) {
  if (isPinned) return { bg: 'bg-[#db313f]', icon: 'text-white' };
  const first = category.split(',')[0].trim();
  return categoryColor[first] ?? { bg: 'bg-[#edeeef]', icon: 'text-[#434653]' };
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} 기준`;
}

export default function NoticesClient({ initialNotices }: Props) {
  const [activeFilter, setActiveFilter] = useState('전체');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPending, startTransition] = useTransition();
  const { openNoticeDetail, openWriteNotice } = useModal();
  const { data: session } = useSession();
  const { showToast } = useApp();
  const isAdmin = session?.user?.role === 'admin';
  const router = useRouter();
  const today = todayStr();

  const handleDeleteNotice = (e: React.MouseEvent, notice: Notice) => {
    e.stopPropagation();
    if (!confirm(`"${notice.title}" 공지를 삭제하시겠습니까?`)) return;
    startTransition(async () => {
      const result = await deleteNotice(notice.id);
      if (result.success) {
        showToast('공지가 삭제되었습니다.');
        router.refresh();
      } else {
        showToast(result.error ?? '삭제 중 오류가 발생했습니다.');
      }
    });
  };

  const handleFilterChange = (f: string) => {
    setActiveFilter(f);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const filtered = initialNotices
    .filter(n => activeFilter === '전체' || n.category.split(',').map(c => c.trim()).includes(activeFilter))
    .filter(n => !searchQuery || n.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  // 최대 5개 페이지 번호 표시 (현재 페이지 중심)
  const pageNums: number[] = [];
  const half = 2;
  let start = Math.max(1, safePage - half);
  let end   = Math.min(totalPages, start + 4);
  start = Math.max(1, end - 4);
  for (let i = start; i <= end; i++) pageNums.push(i);

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-10">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-[#191c1d]" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>공지사항</h1>
          <p className="text-[#434653] mt-1">경북청년인재스쿨의 새로운 소식과 안내사항을 확인하세요.</p>
        </div>
        {isAdmin && (
          <button
            onClick={openWriteNotice}
            className="flex items-center gap-2 bg-[#0047ab] text-white px-6 py-3 rounded-lg text-sm font-semibold hover:opacity-90 transition-all active:scale-95 shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px]">edit</span>
            공지 등록
          </button>
        )}
      </section>

      {/* Bento top */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-2 bg-[#f3f4f5] rounded-xl p-6 flex flex-col justify-between overflow-hidden relative group min-h-[120px]">
          <div className="z-10">
            <span className="bg-[#00327d] text-white text-xs font-bold px-2 py-1 rounded-full mb-3 inline-block">
              {searchQuery ? `검색: "${searchQuery}"` : activeFilter !== '전체' ? activeFilter : 'HOT NEWS'}
            </span>
            <h3 className="font-bold text-lg text-[#191c1d] mb-1" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>
              {filtered[0]?.title ?? '등록된 공지가 없습니다'}
            </h3>
            <p className="text-[#434653] text-sm">지금 바로 지원하고 경북의 미래를 함께 만들어갈 기회를 잡으세요!</p>
          </div>
          <div className="absolute right-[-20px] bottom-[-20px] opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-[120px]" style={{ fontVariationSettings: "'FILL' 1" }}>campaign</span>
          </div>
        </div>
        <div className="bg-[#e7e8e9] rounded-xl p-6 flex flex-col justify-center items-center text-center">
          <span className="text-[#434653] text-xs uppercase tracking-wider mb-1">
            {searchQuery ? '검색 결과' : '전체 게시글'}
          </span>
          <span className="text-[40px] font-bold text-[#00327d]" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>{filtered.length}</span>
          <span className="text-[#737784] text-xs">{today}</span>
        </div>
      </section>

      {/* Search & filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[280px]">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#737784]">search</span>
          <input
            value={searchQuery}
            onChange={e => handleSearchChange(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-[#c3c6d5] rounded-xl focus:ring-2 focus:ring-[#00327d] focus:border-transparent outline-none transition-all"
            placeholder="제목으로 검색"
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
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => handleFilterChange(f)}
              className={`px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                activeFilter === f ? 'bg-[#00327d] text-white' : 'bg-white border border-[#c3c6d5] text-[#434653] hover:bg-[#f3f4f5]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Notice list */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-[#c3c6d5]">
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-[#737784]">
            <span className="material-symbols-outlined text-[48px] block mb-2">
              {searchQuery ? 'search_off' : 'inbox'}
            </span>
            {searchQuery
              ? <><p className="font-semibold">&ldquo;{searchQuery}&rdquo; 검색 결과가 없습니다.</p><p className="text-sm mt-1">다른 검색어를 입력해보세요.</p></>
              : <p>등록된 공지사항이 없습니다.</p>
            }
          </div>
        ) : (
          paginated.map((n, idx) => (
            <div
              key={n.id}
              onClick={() => openNoticeDetail(n as any)}
              className={`cursor-pointer flex items-center gap-4 p-5 hover:bg-[#f3f4f5] transition-colors ${idx < paginated.length - 1 ? 'border-b border-[#e1e3e4]' : ''} ${n.isPinned ? 'bg-[#ffdad8]/10' : ''}`}
            >
              {(() => { const c = getNoticeColor(n.category, n.isPinned); return (
              <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${c.bg}`}>
                <span className={`material-symbols-outlined ${c.icon}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                  {n.icon}
                </span>
              </div>
              ); })()}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  {n.isPinned && <span className="text-[#b7102a] font-bold text-xs px-2 py-0.5 bg-[#ffdad8] rounded-full">[필독]</span>}
                  {n.category.split(',').map(c => c.trim()).filter(Boolean).map(cat => (
                    <span key={cat} className="text-xs px-2 py-0.5 bg-[#e7e8e9] text-[#434653] rounded-full">{cat}</span>
                  ))}
                  <span className="font-semibold text-[#191c1d] truncate">{n.title}</span>
                </div>
                <div className="flex items-center gap-3 text-[#434653] text-xs">
                  <span>{n.date}</span>
                  <span className="w-px h-3 bg-[#c3c6d5]" />
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">visibility</span>
                    {n.views.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-auto md:ml-0">
                {isAdmin && (
                  <button
                    onClick={(e) => handleDeleteNotice(e, n)}
                    disabled={isPending}
                    className="bg-[#E63946] text-white text-xs px-3 py-1 rounded-lg font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                  >
                    삭제
                  </button>
                )}
                <span className="material-symbols-outlined text-[#737784] hidden md:block">chevron_right</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="w-10 h-10 rounded-lg border border-[#c3c6d5] flex items-center justify-center hover:bg-[#f3f4f5] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          {pageNums.map(n => (
            <button
              key={n}
              onClick={() => setCurrentPage(n)}
              className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold transition-colors ${
                n === safePage ? 'bg-[#00327d] text-white' : 'border border-[#c3c6d5] hover:bg-[#f3f4f5] text-[#434653]'
              }`}
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="w-10 h-10 rounded-lg border border-[#c3c6d5] flex items-center justify-center hover:bg-[#f3f4f5] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      )}
    </div>
  );
}
