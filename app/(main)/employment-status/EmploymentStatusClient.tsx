'use client';

import { useState, useRef, useEffect } from 'react';
import { useModal } from '@/components/Modals/ModalContext';
import type { EmploymentRecord } from '@/actions/employment';

interface Props {
  initialRecords: EmploymentRecord[];
  isAdmin: boolean;
}

export default function EmploymentStatusClient({ initialRecords, isAdmin }: Props) {
  const { openEmploymentDetail, openEmploymentWrite } = useModal();

  const [search, setSearch] = useState('');
  const [filterCohort, setFilterCohort] = useState('전체');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownSearch, setDropdownSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const cohorts = ['전체', ...Array.from(new Set(initialRecords.map(r => r.cohort))).sort((a, b) => b.localeCompare(a, 'ko'))];
  const filteredDropdown = cohorts.filter(c => c === '전체' || c.includes(dropdownSearch));

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
        setDropdownSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = initialRecords
    .filter(r => !search || r.name.includes(search) || r.company.includes(search))
    .filter(r => filterCohort === '전체' || r.cohort === filterCohort);

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-10">

      {/* ── 페이지 헤더 ── */}
      <header className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#191c1d]" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>취업현황</h1>
          <p className="text-[#434653] mt-1">경북청년인재스쿨 수료생들의 취업 현황을 확인하세요.</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => openEmploymentWrite(null)}
            className="hidden md:flex items-center gap-2 bg-[#00327d] text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg hover:bg-[#0047ab] transition-all active:scale-95"
          >
            <span className="material-symbols-outlined">add</span>
            새 항목 등록
          </button>
        )}
      </header>

      {/* ── 히어로 배너 ── */}
      <section className="bg-gradient-to-br from-[#eef2ff] to-[#f0f9ff] rounded-2xl px-8 py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-sm border border-[#dae2ff] mb-6">
        <div className="flex flex-col justify-center gap-4">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#191c1d] leading-tight" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>
            함께 성장한 동료들의<br />새로운 출발을 응원합니다.
          </h2>
          <p className="text-[#434653] text-base md:text-lg leading-relaxed">
            인재스쿨 수료 후 취업한 동료들의 현황을 확인하고<br className="hidden md:block" /> 취업 성공의 동기를 얻어보세요!
          </p>
        </div>
        <div className="flex-shrink-0 flex justify-center md:justify-end">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img4.png" alt="취업현황 일러스트" className="w-56 h-56 md:w-72 md:h-72 object-contain opacity-90" />
        </div>
      </section>

      {/* ── 검색 & 필터 ── */}
      <div className="flex flex-col md:flex-row gap-3 mb-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#737784]">search</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="이름 또는 기업명으로 검색"
            className="w-full bg-white border border-[#c3c6d5] focus:border-[#00327d] rounded-lg pl-12 pr-10 py-3 outline-none transition-all text-sm"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#737784] hover:text-[#191c1d]">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>

        {/* 기수 드롭다운 */}
        <div className="relative flex-shrink-0" ref={dropdownRef}>
          <button
            onClick={() => { setDropdownOpen(o => !o); setDropdownSearch(''); }}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-semibold transition-colors whitespace-nowrap ${
              filterCohort !== '전체'
                ? 'bg-[#00327d] text-white border-[#00327d]'
                : 'bg-white text-[#434653] border-[#c3c6d5] hover:border-[#00327d]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">filter_list</span>
            {filterCohort === '전체' ? '전체 기수' : filterCohort}
            <span className="material-symbols-outlined text-[18px]">
              {dropdownOpen ? 'expand_less' : 'expand_more'}
            </span>
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-[#e1e3e4] rounded-2xl shadow-xl z-50 overflow-hidden">
              <div className="p-3 border-b border-[#e1e3e4]">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#737784] text-[16px]">search</span>
                  <input
                    autoFocus
                    value={dropdownSearch}
                    onChange={e => setDropdownSearch(e.target.value)}
                    placeholder="기수 검색"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-[#f3f4f5] rounded-lg outline-none focus:bg-white focus:ring-1 focus:ring-[#00327d] transition-all"
                  />
                </div>
              </div>
              <ul className="max-h-56 overflow-y-auto py-1">
                {filteredDropdown.length === 0 ? (
                  <li className="px-4 py-3 text-sm text-[#737784] text-center">검색 결과 없음</li>
                ) : filteredDropdown.map(c => (
                  <li key={c}>
                    <button
                      onClick={() => { setFilterCohort(c); setDropdownOpen(false); setDropdownSearch(''); }}
                      className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors flex items-center justify-between ${
                        filterCohort === c ? 'bg-[#dae2ff] text-[#001946]' : 'text-[#434653] hover:bg-[#f3f4f5]'
                      }`}
                    >
                      {c === '전체' ? '전체 기수' : c}
                      {filterCohort === c && <span className="material-symbols-outlined text-[16px] text-[#00327d]">check</span>}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-[#737784] mb-4">
        총 <span className="font-semibold text-[#434653]">{filtered.length}명</span>의 취업현황이 등록되어 있습니다.
      </p>

      {/* ── 모바일: 새 항목 등록 버튼 ── */}
      {isAdmin && (
        <button
          onClick={() => openEmploymentWrite(null)}
          className="md:hidden w-full mb-4 flex items-center justify-center gap-2 bg-[#00327d] text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg hover:bg-[#0047ab] transition-all active:scale-95"
        >
          <span className="material-symbols-outlined">add</span>
          새 항목 등록
        </button>
      )}

      {/* ── 목록 ── */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-[#737784] bg-white rounded-xl border border-[#e1e3e4]">
          <span className="material-symbols-outlined text-[48px] block mb-2">search_off</span>
          <p className="font-semibold text-[#191c1d]">
            {search || filterCohort !== '전체' ? '검색 조건에 맞는 결과가 없습니다.' : '등록된 취업 현황이 없습니다.'}
          </p>
          {(search || filterCohort !== '전체') && (
            <button
              onClick={() => { setSearch(''); setFilterCohort('전체'); }}
              className="mt-4 inline-flex items-center gap-2 bg-[#0047ab] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">filter_alt_off</span>
              필터 초기화
            </button>
          )}
        </div>
      ) : (
        <div>
          {/* 머리글 행 */}
          <div className="hidden md:grid grid-cols-[100px_1fr_1.4fr_1.4fr_44px] gap-4 px-5 py-2.5 mb-2 bg-[#f8f9fa] rounded-lg border border-[#e1e3e4]">
            <span className="text-xs font-medium text-[#737784]">기수</span>
            <span className="text-xs font-medium text-[#737784]">이름</span>
            <span className="text-xs font-medium text-[#737784]">취업기업</span>
            <span className="text-xs font-medium text-[#737784]">취업부서</span>
            <span />
          </div>

          {/* 데이터 행 */}
          <div className="flex flex-col gap-2">
            {filtered.map(r => (
              <div
                key={r.id}
                onClick={() => openEmploymentDetail(r)}
                className="bg-white border border-[#f0f0f0] rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-[#dae2ff] transition-all cursor-pointer active:scale-[0.99]"
              >
                {/* 데스크톱: 그리드 열 정렬 */}
                <div className="hidden md:grid grid-cols-[100px_1fr_1.4fr_1.4fr_44px] gap-4 items-center px-5 py-4">
                  {/* 기수 뱃지 */}
                  <span className="inline-flex">
                    <span className="bg-[#dae2ff] text-[#001946] text-xs px-2.5 py-1 rounded-full font-bold whitespace-nowrap">
                      {r.cohort}
                    </span>
                  </span>

                  {/* 이름 + 아바타 */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-[#dae2ff] flex items-center justify-center text-[#00327d] font-bold text-sm flex-shrink-0">
                      {r.name[0]}
                    </div>
                    <span className="font-bold text-[#191c1d] truncate">{r.name}</span>
                  </div>

                  {/* 취업기업 */}
                  <span className="text-sm text-[#434653] truncate">{r.company}</span>

                  {/* 취업부서 */}
                  <span className="text-sm text-[#737784] truncate">{r.department || '—'}</span>

                  {/* 꺾쇠 */}
                  <span className="material-symbols-outlined text-[#c3c6d5] text-[20px] justify-self-center">
                    chevron_right
                  </span>
                </div>

                {/* 모바일: 카드형 */}
                <div className="md:hidden flex items-center gap-3 px-4 py-4">
                  <div className="w-11 h-11 rounded-full bg-[#dae2ff] flex items-center justify-center text-[#00327d] font-bold flex-shrink-0">
                    {r.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-[#191c1d]">{r.name}</span>
                      <span className="bg-[#dae2ff] text-[#001946] text-[10px] px-2 py-0.5 rounded-full font-bold flex-shrink-0">
                        {r.cohort}
                      </span>
                    </div>
                    <p className="text-xs text-[#737784] truncate">
                      {r.company}{r.department ? ` | ${r.department}` : ''}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-[#c3c6d5] flex-shrink-0">chevron_right</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
