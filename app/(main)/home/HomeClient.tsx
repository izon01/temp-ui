'use client';

import { useState, useRef, useEffect } from 'react';
import { parseCategoryBadges } from '@/lib/categoryColors';
import { useModal } from '@/components/Modals/ModalContext';

const statusConfig = {
  '정상':   { label: '🟢정상',   bg: 'bg-[#2A9D8F]', text: 'text-white',      bar: 'bg-[#00327d]' },
  '주의':   { label: '🟡주의',   bg: 'bg-[#FFB703]', text: 'text-[#410007]',  bar: 'bg-[#FFB703]' },
  '위험':   { label: '🔴위험',   bg: 'bg-[#E63946]', text: 'text-white',      bar: 'bg-[#ba1a1a]' },
  '미참여': { label: '⚫미참여', bg: 'bg-[#9E9E9E]', text: 'text-white',      bar: 'bg-[#9E9E9E]' },
} as const;

// 활동지수 기반으로 상태 결정 (DB status 값보다 우선)
// 0% → 미참여, 1~39% → 위험, 40~69% → 주의, 70%+ → 정상
function deriveStatus(participationRate: number): keyof typeof statusConfig {
  if (participationRate === 0)  return '미참여';
  if (participationRate < 40)   return '위험';
  if (participationRate < 70)   return '주의';
  return '정상';
}

type SortKey = 'name' | 'participation_desc' | 'participation_asc';
const SORT_LABELS: Record<SortKey, string> = {
  name: '이름순',
  participation_desc: '참여율 높은순',
  participation_asc: '참여율 낮은순',
};

interface Participant {
  id: number; name: string; team: string; track: string;
  attendance: number; status: string; lastAccess: string;
  participationRate: number;
}

interface PinnedNotice {
  id: number; title: string; date: string; views: number;
  isPinned: boolean; category: string; icon: string; content?: string;
}

interface Props {
  participants: Participant[];
  participantCount: number;
  avgParticipationRate: number;
  submissionRate: number;
  pinnedNotices: PinnedNotice[];
}

function formatLastAccess(dateStr: string): string {
  if (!dateStr) return '기록 없음';
  // 날짜 형식(YYYY-MM-DD)이면 상대 표현으로 변환
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diffDays = Math.round((today.getTime() - target.getTime()) / 86400000);
    if (diffDays === 0) return '오늘';
    if (diffDays === 1) return '어제';
    const yy = String(d.getFullYear()).slice(2);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yy}.${mm}.${dd}`;
  }
  // 이미 한글 텍스트("오늘", "2일 전" 등)면 그대로 표시
  return dateStr;
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} 기준`;
}

export default function HomeClient({ participants, participantCount, avgParticipationRate, submissionRate, pinnedNotices }: Props) {
  const { openParticipantProfile, openNoticeDetail } = useModal();
  const today = todayStr();

  const [sortBy, setSortBy] = useState<SortKey>('name');
  const [filterTeam, setFilterTeam] = useState('전체');
  const [showSort, setShowSort] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  // 클릭 외부 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setShowSort(false);
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setShowFilter(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // 고유 팀 목록
  const teams = ['전체', ...Array.from(new Set(participants.map(p => p.team).filter(Boolean)))];

  // 필터 → 정렬
  const displayed = [...participants]
    .filter(p => filterTeam === '전체' || p.team === filterTeam)
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name, 'ko');
      if (sortBy === 'participation_desc') return b.participationRate - a.participationRate;
      return a.participationRate - b.participationRate;
    });

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-6 space-y-6">

      {/* ── Hero Banner ── */}
      <section className="bg-gradient-to-br from-[#eef2ff] to-[#f0f9ff] rounded-2xl px-8 py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-sm border border-[#dae2ff]">
        <div className="flex flex-col justify-center gap-4">
          <h1
            className="text-3xl md:text-5xl font-extrabold text-[#191c1d] leading-tight"
            style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}
          >
            당신의<br />꿈꾸는 미래를 향해,<br />한 걸음 더
          </h1>
          <p className="text-[#434653] text-base md:text-xl leading-relaxed">
            청년인재스쿨이 여러분의 성장을 응원합니다.
          </p>
        </div>
        <div className="flex-shrink-0 flex justify-center md:justify-end">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/img1.png"
            alt="경북청년인재스쿨 히어로 이미지"
            style={{ width: '220px', height: 'auto' }}
            className="object-contain drop-shadow-md"
          />
        </div>
      </section>

      {/* ── 필독 공지 ── */}
      {pinnedNotices.length > 0 && (
        <section className="bg-[#fff8f7] border border-[#ffdad6] rounded-2xl px-5 py-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-[#b7102a] text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>campaign</span>
            <span className="text-xs font-bold text-[#b7102a] uppercase tracking-widest">공지사항</span>
          </div>
          {pinnedNotices.map(n => (
            <button
              key={n.id}
              onClick={() => openNoticeDetail(n)}
              className="w-full flex items-center gap-3 text-left hover:bg-[#ffdad6]/40 rounded-xl px-3 py-2 transition-colors group"
            >
              {parseCategoryBadges(n.isPinned ? `필독,${n.category}` : n.category).map(b => (
                <span key={b.label} className={`flex-shrink-0 text-[10px] font-extrabold px-2 py-0.5 rounded-full leading-tight ${b.bg} ${b.text}`}>{b.label}</span>
              ))}
              <span className="flex-1 text-sm font-semibold text-[#191c1d] truncate group-hover:text-[#b7102a] transition-colors">{n.title}</span>
              <span className="flex-shrink-0 text-xs text-[#737784]">{n.date}</span>
              <span className="material-symbols-outlined text-[16px] text-[#737784] flex-shrink-0">chevron_right</span>
            </button>
          ))}
        </section>
      )}

      {/* Summary Dashboard */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 평균 참여율 */}
        <div className="bg-[#0047ab] text-white rounded-xl p-6 shadow-sm flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <span className="text-sm font-semibold opacity-80">전체 활동지수</span>
            <span className="material-symbols-outlined">analytics</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>{avgParticipationRate}%</span>
            <span className="text-sm text-[#8cf5e4]">{today}</span>
          </div>
          <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
            <div className="bg-white h-full transition-all duration-500" style={{ width: `${avgParticipationRate}%` }} />
          </div>
        </div>

        {/* 과제 제출률 */}
        <div className="bg-white border border-[#e1e3e4] rounded-xl p-6 shadow-sm flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <span className="text-sm text-[#434653]">과제 제출률</span>
            <span className="material-symbols-outlined text-[#b7102a]">assignment_turned_in</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-[#191c1d]" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>{submissionRate}%</span>
            <span className="text-sm text-[#434653]">{today}</span>
          </div>
          <div className="w-full bg-[#edeeef] h-2 rounded-full overflow-hidden">
            <div className="bg-[#b7102a] h-full transition-all duration-500" style={{ width: `${submissionRate}%` }} />
          </div>
        </div>

        {/* 현재 인원 */}
        <div className="bg-white border border-[#e1e3e4] rounded-xl p-6 shadow-sm flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <span className="text-sm text-[#434653]">현재 인원</span>
            <span className="material-symbols-outlined text-[#003e37]">groups</span>
          </div>
          <div>
            <span className="text-4xl font-bold text-[#191c1d]" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>{participantCount}명</span>
            <p className="text-sm text-[#434653]">등록된 참여자</p>
          </div>
          <div className="flex -space-x-2">
            {participants.slice(0, 3).map(p => (
              <div key={p.id} className="w-8 h-8 rounded-full border-2 border-white bg-[#0047ab] text-white text-xs flex items-center justify-center font-bold">
                {p.name[0]}
              </div>
            ))}
            {participantCount > 3 && (
              <div className="w-8 h-8 rounded-full border-2 border-white bg-[#434653] text-white text-[10px] flex items-center justify-center font-bold">
                +{participantCount - 3}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Participants */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#191c1d]" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>
            경북청년인재스쿨 9기
            {filterTeam !== '전체' && (
              <span className="ml-2 text-sm font-normal text-[#0047ab]">({filterTeam})</span>
            )}
          </h2>
          <div className="flex gap-2">
            {/* 필터 드롭다운 */}
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => { setShowFilter(p => !p); setShowSort(false); }}
                className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-1 transition-colors ${
                  filterTeam !== '전체' ? 'bg-[#0047ab] text-white' : 'bg-[#f3f4f5] hover:bg-[#e7e8e9]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">filter_list</span>
                필터{filterTeam !== '전체' ? `: ${filterTeam}` : ''}
              </button>
              {showFilter && (
                <div className="absolute right-0 mt-1 w-44 bg-white border border-[#e1e3e4] rounded-xl shadow-lg z-30 overflow-hidden">
                  {teams.map(t => (
                    <button
                      key={t}
                      onClick={() => { setFilterTeam(t); setShowFilter(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
                        filterTeam === t ? 'bg-[#dae2ff] text-[#00327d] font-bold' : 'hover:bg-[#f3f4f5] text-[#434653]'
                      }`}
                    >
                      {t}
                      {filterTeam === t && <span className="material-symbols-outlined text-[16px]">check</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 정렬 드롭다운 */}
            <div className="relative" ref={sortRef}>
              <button
                onClick={() => { setShowSort(p => !p); setShowFilter(false); }}
                className="bg-[#f3f4f5] px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-1 hover:bg-[#e7e8e9] transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">sort</span>
                {SORT_LABELS[sortBy]}
              </button>
              {showSort && (
                <div className="absolute right-0 mt-1 w-44 bg-white border border-[#e1e3e4] rounded-xl shadow-lg z-30 overflow-hidden">
                  {(Object.keys(SORT_LABELS) as SortKey[]).map(key => (
                    <button
                      key={key}
                      onClick={() => { setSortBy(key); setShowSort(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
                        sortBy === key ? 'bg-[#dae2ff] text-[#00327d] font-bold' : 'hover:bg-[#f3f4f5] text-[#434653]'
                      }`}
                    >
                      {SORT_LABELS[key]}
                      {sortBy === key && <span className="material-symbols-outlined text-[16px]">check</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {displayed.length === 0 ? (
            <div className="py-16 text-center text-[#737784] bg-white rounded-xl border border-[#e1e3e4]">
              <span className="material-symbols-outlined text-[48px] block mb-2">person_off</span>
              {participants.length === 0 ? (
                <>
                  <p className="font-semibold text-[#191c1d]">등록된 참여자가 없습니다.</p>
                  <p className="text-sm mt-1">관리자에게 문의하세요.</p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-[#191c1d]">
                    <span className="text-[#0047ab]">{filterTeam}</span> 팀에 해당하는 참여자가 없습니다.
                  </p>
                  <p className="text-sm mt-1">다른 팀을 선택하거나 필터를 초기화하세요.</p>
                  <button
                    onClick={() => { setFilterTeam('전체'); setSortBy('name'); }}
                    className="mt-4 inline-flex items-center gap-2 bg-[#0047ab] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">filter_alt_off</span>
                    필터 초기화
                  </button>
                </>
              )}
            </div>
          ) : displayed.map(p => {
            const status = statusConfig[deriveStatus(p.participationRate)];
            return (
              <div
                key={p.id}
                onClick={() => openParticipantProfile(p)}
                className="bg-white p-4 rounded-xl shadow-sm border border-transparent hover:border-[#00327d]/20 transition-all flex flex-col md:flex-row md:items-center gap-4 cursor-pointer active:scale-[0.99]"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-[#00327d] bg-[#dae2ff]">
                    {p.name[0]}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#191c1d]">{p.name}</span>
                      <span className={`${status.bg} ${status.text} text-[10px] px-2 py-0.5 rounded-full font-bold`}>{status.label}</span>
                    </div>
                    <p className="text-sm text-[#434653]">
                      {p.team || '직무 미설정'} | {p.track || '지원분야 미설정'}
                    </p>
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between text-sm text-[#434653]">
                    <span>활동지수</span><span>{p.participationRate}%</span>
                  </div>
                  <div className="w-full bg-[#edeeef] h-2 rounded-full overflow-hidden">
                    <div className={`${status.bar} h-full`} style={{ width: `${p.participationRate}%` }} />
                  </div>
                </div>
                <div className="flex items-center gap-4 md:justify-end">
                  <div className="text-right hidden md:block">
                    <p className="text-xs text-[#434653]">최근 접속</p>
                    <p className="text-sm font-semibold">{formatLastAccess(p.lastAccess)}</p>
                  </div>
                  <span className="material-symbols-outlined text-[#434653]">chevron_right</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
