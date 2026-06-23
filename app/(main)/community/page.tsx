'use client';

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useModal } from '@/components/Modals/ModalContext';
import type { CommunityPost } from '@/data/mockData';

const categoryStyle: Record<CommunityPost['category'], { bg: string; text: string }> = {
  '스터디모집': { bg: 'bg-[#8cf5e4]', text: 'text-[#00201c]' },
  '취업/진로': { bg: 'bg-[#ffdad8]', text: 'text-[#410007]' },
  '자유게시판': { bg: 'bg-[#dae2ff]', text: 'text-[#001946]' },
};

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<string>('전체');
  const { posts } = useApp();
  const { openPostDetail, openWrite } = useModal();
  const tabs = ['전체', '자유게시판', '취업/진로', '스터디모집'];

  const filtered = activeTab === '전체' ? posts : posts.filter(p => p.category === activeTab);

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-10">
      {/* Header */}
      <header className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
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

      {/* Search & filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-grow relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#737784]">search</span>
          <input
            className="w-full bg-white border border-[#c3c6d5] focus:border-[#00327d] focus:ring-1 focus:ring-[#00327d] rounded-lg pl-12 pr-4 py-3 outline-none transition-all"
            placeholder="관심 있는 키워드를 검색해보세요"
            type="text"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(post => {
          const catStyle = categoryStyle[post.category];
          return (
            <article
              key={post.id}
              onClick={() => openPostDetail(post)}
              className="bg-white rounded-xl shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 border border-transparent cursor-pointer flex flex-col overflow-hidden"
            >
              {post.hasImage && (
                <div className="h-40 bg-[#e1e3e4] flex items-center justify-center overflow-hidden">
                  <span className="material-symbols-outlined text-[#737784] text-[60px]">image</span>
                </div>
              )}
              <div className="p-6 flex flex-col justify-between flex-1">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`${catStyle.bg} ${catStyle.text} text-xs px-2 py-1 rounded font-semibold`}>{post.category}</span>
                    <span className="text-[#737784] text-xs">{post.timeAgo}</span>
                  </div>
                  <h3 className="font-bold text-lg text-[#191c1d] mb-2 line-clamp-2" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>{post.title}</h3>
                  <p className="text-[#434653] text-sm mb-4 line-clamp-3">{post.content}</p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[#f3f4f5] mt-auto">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#dae2ff] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[#00327d] text-xl">person</span>
                    </div>
                    <span className="text-sm font-semibold text-[#191c1d]">{post.author}</span>
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

      {/* Pagination */}
      <div className="mt-10 flex justify-center items-center gap-3">
        <button className="material-symbols-outlined p-2 text-[#737784] hover:text-[#00327d] transition-colors">chevron_left</button>
        <div className="flex gap-2">
          {[1,2,3,4,5].map(n => (
            <button key={n} className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${n === 1 ? 'bg-[#00327d] text-white' : 'hover:bg-[#f3f4f5] text-[#434653]'}`}>
              {n}
            </button>
          ))}
        </div>
        <button className="material-symbols-outlined p-2 text-[#737784] hover:text-[#00327d] transition-colors">chevron_right</button>
      </div>

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
