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
  content?: string; imageUrl?: string | null; fileName?: string | null;
}

interface Props {
  initialNotices: Notice[];
}

const FILTERS = ['전체', '필독', '공지사항', '취업정보', '취업활동양식', '기타'];
const ITEMS_PER_PAGE = 10;

import { parseCategoryBadges, getIconBg } from '@/lib/categoryColors';

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

      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-[#eef2ff] to-[#f0f9ff] rounded-2xl px-8 py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-sm border border-[#dae2ff] mb-6">
        <div className="flex flex-col justify-center gap-4">
          <h1
            className="text-3xl md:text-4xl font-extrabold text-[#191c1d] leading-tight"
            style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}
          >
            당신의 성장을 위한<br />새로운 소식!
          </h1>
          <p className="text-[#434653] text-base md:text-lg leading-relaxed">
            공지사항부터 취업정보, 취업활동 양식까지<br className="hidden md:block" />
            청년인재스쿨의 다양한 소식을 이곳에서 가장 먼저 만나보세요.
          </p>
        </div>
        <div className="flex-shrink-0 flex justify-center md:justify-end">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/img2.png"
            alt="공지사항 배너 이미지"
            style={{ height: '200px', width: 'auto', maxWidth: '260px' }}
            className="object-contain drop-shadow-md"
          />
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
              <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${getIconBg(n.category, n.isPinned)}`}>
                <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {n.icon}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  {parseCategoryBadges(n.isPinned ? `필독,${n.category}` : n.category).map(b => (
                    <span key={b.label} className={`text-xs font-semibold px-2 py-0.5 rounded-full ${b.bg} ${b.text}`}>{b.label}</span>
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
