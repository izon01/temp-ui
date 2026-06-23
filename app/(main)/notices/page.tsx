'use client';

import { useState } from 'react';
import { notices } from '@/data/mockData';
import { useModal } from '@/components/Modals/ModalContext';

export default function NoticesPage() {
  const [activeFilter, setActiveFilter] = useState('전체');
  const { openPostDetail } = useModal();
  const filters = ['전체', '필독', '프로그램'];

  const filtered = activeFilter === '전체' ? notices : notices.filter(n => n.category === activeFilter);

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-10">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-[#191c1d]" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>공지사항</h1>
          <p className="text-[#434653] mt-1">경북청년인재스쿨의 새로운 소식과 안내사항을 확인하세요.</p>
        </div>
        <button className="flex items-center gap-2 bg-[#0047ab] text-white px-6 py-3 rounded-lg text-sm font-semibold hover:opacity-90 transition-all active:scale-95 shadow-sm">
          <span className="material-symbols-outlined text-[20px]">edit</span>
          공지 등록
        </button>
      </section>

      {/* Bento top */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-2 bg-[#f3f4f5] rounded-xl p-6 flex flex-col justify-between overflow-hidden relative group min-h-[120px]">
          <div className="z-10">
            <span className="bg-[#00327d] text-white text-xs font-bold px-2 py-1 rounded-full mb-3 inline-block">HOT NEWS</span>
            <h3 className="font-bold text-lg text-[#191c1d] mb-1" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>2026 하반기 인재 양성 프로그램 선발 안내</h3>
            <p className="text-[#434653] text-sm">지금 바로 지원하고 경북의 미래를 함께 만들어갈 기회를 잡으세요!</p>
          </div>
          <div className="absolute right-[-20px] bottom-[-20px] opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-[120px]" style={{ fontVariationSettings: "'FILL' 1" }}>campaign</span>
          </div>
        </div>
        <div className="bg-[#e7e8e9] rounded-xl p-6 flex flex-col justify-center items-center text-center">
          <span className="text-[#434653] text-xs uppercase tracking-wider mb-1">전체 게시글</span>
          <span className="text-[40px] font-bold text-[#00327d]" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>1,248</span>
          <span className="text-[#737784] text-xs">Updated 2 mins ago</span>
        </div>
      </section>

      {/* Search & filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[280px]">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#737784]">search</span>
          <input
            className="w-full pl-12 pr-4 py-3 bg-white border border-[#c3c6d5] rounded-xl focus:ring-2 focus:ring-[#00327d] focus:border-transparent outline-none transition-all"
            placeholder="제목 또는 내용으로 검색"
            type="text"
          />
        </div>
        <div className="flex gap-2">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
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
        {filtered.map((n, idx) => (
          <div
            key={n.id}
            onClick={openPostDetail}
            className={`cursor-pointer flex items-center gap-4 p-5 hover:bg-[#f3f4f5] transition-colors ${idx < filtered.length - 1 ? 'border-b border-[#e1e3e4]' : ''} ${n.isPinned ? 'bg-[#ffdad8]/10' : ''}`}
          >
            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white ${n.isPinned ? 'bg-[#db313f]' : 'bg-[#edeeef]'}`}>
              <span className={`material-symbols-outlined ${n.isPinned ? 'text-white' : 'text-[#434653]'}`} style={{ fontVariationSettings: n.isPinned ? "'FILL' 1" : "'FILL' 0" }}>
                {n.icon}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {n.isPinned && (
                  <span className="text-[#b7102a] font-bold text-xs px-2 py-0.5 bg-[#ffdad8] rounded-full">[필독]</span>
                )}
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
            <span className="material-symbols-outlined text-[#737784] hidden md:block">chevron_right</span>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-center gap-2">
        <button className="w-10 h-10 rounded-lg border border-[#c3c6d5] flex items-center justify-center hover:bg-[#f3f4f5] transition-colors">
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        {[1,2,3,4,5].map(n => (
          <button key={n} className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold transition-colors ${n === 1 ? 'bg-[#00327d] text-white' : 'border border-[#c3c6d5] hover:bg-[#f3f4f5] text-[#434653]'}`}>
            {n}
          </button>
        ))}
        <button className="w-10 h-10 rounded-lg border border-[#c3c6d5] flex items-center justify-center hover:bg-[#f3f4f5] transition-colors">
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>
    </div>
  );
}
