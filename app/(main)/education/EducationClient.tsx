'use client';

import { useState, useTransition } from 'react';
import { useModal } from '@/components/Modals/ModalContext';
import { useApp } from '@/contexts/AppContext';
import { deleteAssignment } from '@/actions/assignments';
import { checkAttendanceAction } from '@/actions/attendance';
import { useRouter } from 'next/navigation';

interface Assignment {
  id: number; week: number; category: string; title: string; description: string;
  deadline: string; days_left: number | null; submitted: boolean;
}

interface ActivityStats {
  overallRate: number;
  camp:      { total: number; submitted: number };
  task:      { total: number; submitted: number };
  mentoring: { total: number; submitted: number };
  level: number; levelProgress: number; nextLevelNeeds: number;
  totalAll: number; submittedAll: number;
}

interface AdminStats {
  avgAttendance: number;
  todayCount: number;
  totalParticipants: number;
  categories: Array<{ category: string; total: number; submitted: number; rate: number }>;
}

interface Props {
  initialAssignments: Assignment[];
  userName: string;
  isAdmin: boolean;
  stats: ActivityStats;
  initialAttendanceChecked: boolean;
  adminStats: AdminStats | null;
}

const CAT_CONFIG: Record<string, { label: string; icon: string; chip: string }> = {
  '캠프':   { label: '캠프',   icon: 'camping',           chip: 'bg-[#dae2ff] text-[#001946]' },
  '과제':   { label: '과제',   icon: 'assignment',         chip: 'bg-[#ffdad8] text-[#410007]' },
  '멘토링': { label: '멘토링', icon: 'supervisor_account', chip: 'bg-[#d0f5e8] text-[#003822]' },
};

const CAT_BAR_COLOR: Record<string, string> = {
  '캠프': 'bg-[#0047ab]', '과제': 'bg-[#b7102a]', '멘토링': 'bg-[#003e37]',
};

const LEVEL_COLORS = [
  '',
  'from-[#6b7280] to-[#9ca3af]',
  'from-[#3b82f6] to-[#60a5fa]',
  'from-[#10b981] to-[#34d399]',
  'from-[#8b5cf6] to-[#a78bfa]',
  'from-[#f59e0b] to-[#fbbf24]',
  'from-[#ef4444] to-[#f87171]',
  'from-[#ec4899] to-[#f472b6]',
  'from-[#06b6d4] to-[#22d3ee]',
  'from-[#f97316] to-[#fb923c]',
  'from-[#eab308] to-[#fde047]',
];

export default function EducationClient({
  initialAssignments, userName, isAdmin, stats,
  initialAttendanceChecked, adminStats,
}: Props) {
  const { openSubmitAssignment, openWriteAssignment, openEditAssignment, openAssignmentSubmissions } = useModal();
  const { showToast } = useApp();
  const [attendanceChecked, setAttendanceChecked] = useState(initialAttendanceChecked);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleAttendance = () => {
    if (attendanceChecked) return;
    startTransition(async () => {
      const result = await checkAttendanceAction();
      if (result.success) {
        setAttendanceChecked(true);
        if (result.alreadyChecked) {
          showToast('오늘 이미 출석하셨습니다 ✓');
        } else {
          showToast('출석이 완료되었습니다 ✓');
          router.refresh();
        }
      } else {
        showToast(result.error ?? '출석 처리 중 오류가 발생했습니다.');
      }
    });
  };

  const [localSubmitted] = useState<Set<number>>(new Set());

  const handleDeleteAssignment = (id: number, title: string) => {
    if (!confirm(`"${title}" 항목을 삭제하시겠습니까?`)) return;
    startTransition(async () => {
      const result = await deleteAssignment(id);
      if (result.success) {
        showToast('삭제되었습니다.');
        router.refresh();
      } else {
        showToast(result.error ?? '삭제 중 오류가 발생했습니다.');
      }
    });
  };

  const assignments = initialAssignments.map(a => ({
    ...a,
    submitted: a.submitted || localSubmitted.has(a.id),
    daysLeft: a.days_left !== null && a.days_left >= 0 ? a.days_left : null,
  }));

  const today = new Date();
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일 (${days[today.getDay()]})`;

  const handleSubmitClick = (a: typeof assignments[0]) => {
    openSubmitAssignment({
      id: a.id, week: a.week, category: a.category ?? '과제', title: a.title,
      description: a.description, deadline: a.deadline,
      daysLeft: a.daysLeft, submitted: a.submitted,
    });
  };

  const { level, levelProgress, nextLevelNeeds } = stats;
  const levelGradient = LEVEL_COLORS[Math.min(level, 10)];
  const isMaxLevel = level >= 10;

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-6 space-y-6">

      {/* ── Welcome + Level Badge ── */}
      <section className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-[#00327d] uppercase tracking-wider">Education Management</p>
          <h2 className="text-2xl font-bold text-[#191c1d]" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>
            {userName} 님, 안녕하세요!
          </h2>
          <p className="text-[#434653]">오늘도 꿈을 향한 한 걸음을 응원합니다.</p>
        </div>

        <div className="flex flex-col items-start md:items-end gap-2">
          {!isAdmin && (
            <>
              <div className={`bg-gradient-to-r ${levelGradient} text-white px-5 py-2.5 rounded-2xl shadow-lg flex items-center gap-2`}>
                <span className="text-xl">🏆</span>
                <div>
                  <p className="text-xs font-semibold opacity-80">현재 레벨</p>
                  <p className="text-xl font-black" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>LV.{level}</p>
                </div>
              </div>
              {isMaxLevel ? (
                <div className="flex items-center gap-2 bg-[#fef3c7] border border-[#fbbf24] text-[#92400e] px-4 py-2 rounded-xl text-sm font-bold">
                  <span className="text-lg">⭐</span> MAX 레벨 달성!
                </div>
              ) : (
                <div className="w-full md:w-56 space-y-1">
                  <div className="flex justify-between text-xs text-[#737784] font-semibold">
                    <span>다음 레벨까지</span>
                    <span className="text-[#00327d] font-bold">{nextLevelNeeds}개 남음!</span>
                  </div>
                  <div className="w-full bg-[#e7e8e9] rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`bg-gradient-to-r ${levelGradient} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${(levelProgress / 5) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-[#737784]">{levelProgress}/5 완료</p>
                </div>
              )}
            </>
          )}
          {isAdmin && (
            <button onClick={openWriteAssignment}
              className="flex items-center gap-2 bg-[#0047ab] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-all active:scale-95 shadow-sm">
              <span className="material-symbols-outlined text-[18px]">add_circle</span>새 항목 등록
            </button>
          )}
        </div>
      </section>

      {/* ── 출석 체크 (참여자만) / 모니터링 차트 (관리자) ── */}
      {!isAdmin ? (
        <section className="w-full">
          <button onClick={handleAttendance} disabled={attendanceChecked || isPending}
            className={`group relative w-full aspect-[2/1.1] md:aspect-[3/1] rounded-xl overflow-hidden active:scale-[0.98] transition-all duration-300 text-left shadow-lg ${
              attendanceChecked ? 'bg-[#003e37] cursor-default' : 'bg-[#0047ab]'
            }`}>
            <div className="relative z-10 h-full p-6 flex flex-col justify-between">
              <div>
                <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full inline-flex items-center gap-2">
                  <span className="material-symbols-outlined text-white text-[18px]">fingerprint</span>
                  <span className="text-white text-sm font-semibold">{dateStr}</span>
                </div>
              </div>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>
                    {attendanceChecked ? '오늘 출석 완료 ✅' : '오늘 출석 체크하기'}
                  </h3>
                  <p className="text-[#a5bdff] mt-1">
                    {attendanceChecked
                      ? '오늘 출석이 기록되었습니다'
                      : '버튼을 눌러 출석을 확인하세요'}
                  </p>
                </div>
                <div className={`px-6 py-3 rounded-xl font-bold shadow-sm flex items-center gap-2 w-fit transition-colors ${
                  attendanceChecked ? 'bg-white/20 text-white' : 'bg-white text-[#00327d] group-hover:bg-[#dae2ff]'
                }`}>
                  <span>{attendanceChecked ? '출석 완료' : '출석 체크하기'}</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>
              </div>
            </div>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
          </button>
        </section>
      ) : (
        /* 관리자 모니터링 차트 */
        adminStats && (
          <section className="bg-white border border-[#e1e3e4] rounded-xl p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-[#0047ab]" style={{ fontVariationSettings: "'FILL' 1" }}>monitoring</span>
              <h3 className="font-bold text-[#191c1d] text-lg" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>참여자 모니터링</h3>
            </div>

            {/* 출석 요약 */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="bg-[#f3f4f5] rounded-xl p-4 flex flex-col gap-1">
                <p className="text-xs font-semibold text-[#737784]">오늘 출석</p>
                <p className="text-2xl font-black text-[#0047ab]" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>
                  {adminStats.todayCount}<span className="text-sm font-semibold text-[#737784]">/{adminStats.totalParticipants}명</span>
                </p>
                <div className="w-full bg-[#e7e8e9] rounded-full h-1.5 overflow-hidden">
                  <div className="bg-[#0047ab] h-full rounded-full"
                    style={{ width: adminStats.totalParticipants > 0 ? `${(adminStats.todayCount / adminStats.totalParticipants) * 100}%` : '0%' }} />
                </div>
              </div>
              <div className="bg-[#f3f4f5] rounded-xl p-4 flex flex-col gap-1">
                <p className="text-xs font-semibold text-[#737784]">평균 출석률</p>
                <p className="text-2xl font-black text-[#003e37]" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>
                  {adminStats.avgAttendance}%
                </p>
                <div className="w-full bg-[#e7e8e9] rounded-full h-1.5 overflow-hidden">
                  <div className="bg-[#003e37] h-full rounded-full" style={{ width: `${adminStats.avgAttendance}%` }} />
                </div>
              </div>
              <div className="bg-[#f3f4f5] rounded-xl p-4 flex flex-col gap-1 col-span-2 md:col-span-1">
                <p className="text-xs font-semibold text-[#737784]">전체 참여자</p>
                <p className="text-2xl font-black text-[#191c1d]" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>
                  {adminStats.totalParticipants}명
                </p>
                <p className="text-xs text-[#737784]">등록된 참여자</p>
              </div>
            </div>

            {/* 카테고리별 제출률 바 차트 */}
            {adminStats.categories.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-bold text-[#434653]">카테고리별 제출 현황</p>
                {adminStats.categories.map(cat => (
                  <div key={cat.category} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${CAT_BAR_COLOR[cat.category] ?? 'bg-[#737784]'}`} />
                        <span className="text-sm font-semibold text-[#191c1d]">{cat.category}</span>
                        <span className="text-xs text-[#737784]">({cat.submitted}/{cat.total * adminStats.totalParticipants})</span>
                      </div>
                      <span className="text-sm font-bold text-[#00327d]">{cat.rate}%</span>
                    </div>
                    <div className="w-full bg-[#e7e8e9] rounded-full h-3 overflow-hidden">
                      <div
                        className={`${CAT_BAR_COLOR[cat.category] ?? 'bg-[#737784]'} h-full rounded-full transition-all duration-700`}
                        style={{ width: `${cat.rate}%` }}
                      />
                    </div>
                    <p className="text-xs text-[#737784]">항목 {cat.total}개 × 참여자 {adminStats.totalParticipants}명 기준</p>
                  </div>
                ))}
              </div>
            )}

            {adminStats.categories.length === 0 && (
              <p className="text-sm text-[#737784] text-center py-4">등록된 항목이 없습니다.</p>
            )}
          </section>
        )
      )}

      {/* ── 4가지 지표 대시보드 (참여자만) ── */}
      {!isAdmin && <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#0047ab] text-white rounded-xl p-4 flex flex-col gap-2 shadow-sm col-span-2 md:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold opacity-80">전체 참여율</span>
            <span className="material-symbols-outlined text-[18px] opacity-70">analytics</span>
          </div>
          <p className="text-3xl font-black" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>{stats.overallRate}%</p>
          <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
            <div className="bg-white h-full rounded-full" style={{ width: `${stats.overallRate}%` }} />
          </div>
          <p className="text-xs opacity-70">{stats.submittedAll}/{stats.totalAll} 완료</p>
        </div>

        <div className="bg-white border border-[#e1e3e4] rounded-xl p-4 flex flex-col gap-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#434653]">캠프 참여</span>
            <span className="material-symbols-outlined text-[18px] text-[#00327d]" style={{ fontVariationSettings: "'FILL' 1" }}>camping</span>
          </div>
          <p className="text-2xl font-black text-[#191c1d]" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>
            {stats.camp.submitted}<span className="text-base font-semibold text-[#737784]">/{stats.camp.total}</span>
          </p>
          <div className="w-full bg-[#e7e8e9] rounded-full h-1.5 overflow-hidden">
            <div className="bg-[#00327d] h-full rounded-full transition-all"
              style={{ width: stats.camp.total > 0 ? `${(stats.camp.submitted / stats.camp.total) * 100}%` : '0%' }} />
          </div>
          <p className="text-xs text-[#737784]">캠프 {stats.camp.total}개 중</p>
        </div>

        <div className="bg-white border border-[#e1e3e4] rounded-xl p-4 flex flex-col gap-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#434653]">과제 제출</span>
            <span className="material-symbols-outlined text-[18px] text-[#b7102a]" style={{ fontVariationSettings: "'FILL' 1" }}>assignment_turned_in</span>
          </div>
          <p className="text-2xl font-black text-[#191c1d]" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>
            {stats.task.submitted}<span className="text-base font-semibold text-[#737784]">/{stats.task.total}</span>
          </p>
          <div className="w-full bg-[#e7e8e9] rounded-full h-1.5 overflow-hidden">
            <div className="bg-[#b7102a] h-full rounded-full transition-all"
              style={{ width: stats.task.total > 0 ? `${(stats.task.submitted / stats.task.total) * 100}%` : '0%' }} />
          </div>
          <p className="text-xs text-[#737784]">과제 {stats.task.total}개 중</p>
        </div>

        <div className="bg-white border border-[#e1e3e4] rounded-xl p-4 flex flex-col gap-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#434653]">멘토링 참여</span>
            <span className="material-symbols-outlined text-[18px] text-[#003e37]" style={{ fontVariationSettings: "'FILL' 1" }}>supervisor_account</span>
          </div>
          <p className="text-2xl font-black text-[#191c1d]" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>
            {stats.mentoring.submitted}<span className="text-base font-semibold text-[#737784]">/{stats.mentoring.total}</span>
          </p>
          <div className="w-full bg-[#e7e8e9] rounded-full h-1.5 overflow-hidden">
            <div className="bg-[#003e37] h-full rounded-full transition-all"
              style={{ width: stats.mentoring.total > 0 ? `${(stats.mentoring.submitted / stats.mentoring.total) * 100}%` : '0%' }} />
          </div>
          <p className="text-xs text-[#737784]">멘토링 {stats.mentoring.total}개 중</p>
        </div>
      </section>}

      {/* ── 항목 리스트 ── */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-[#191c1d]" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>
            회차별 활동 게시판
          </h3>
          <span className="text-sm text-[#737784]">총 {assignments.length}개</span>
        </div>

        {assignments.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#e1e3e4] py-20 flex flex-col items-center gap-3 text-[#737784]">
            <span className="material-symbols-outlined text-[48px]">assignment</span>
            <p className="font-semibold">등록된 항목이 없습니다.</p>
            {isAdmin && (
              <button onClick={openWriteAssignment}
                className="mt-2 bg-[#0047ab] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 active:scale-95 transition-all">
                첫 항목 등록하기
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {assignments.map(a => {
              const cat = CAT_CONFIG[a.category] ?? CAT_CONFIG['과제'];
              return (
                <div key={a.id}
                  className={`bg-white shadow-sm rounded-xl p-5 border border-[#edeeef] ${!a.submitted ? 'group' : 'opacity-90'}`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${cat.chip}`}>
                          <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>{cat.icon}</span>
                          {a.category}
                        </span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${a.submitted ? 'bg-[#e7e8e9] text-[#434653]' : 'bg-[#dae2ff] text-[#001946]'}`}>
                          {a.week}회차
                        </span>
                        {!a.submitted && a.daysLeft !== null && (
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${a.daysLeft <= 3 ? 'bg-[#ffdad8] text-[#410007]' : 'bg-[#fff3cd] text-[#664d03]'}`}>
                            D-{a.daysLeft}
                          </span>
                        )}
                        {!a.submitted && a.daysLeft === null && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#e7e8e9] text-[#434653]">기한 종료</span>
                        )}
                      </div>
                      <h4 className={`text-base font-semibold ${a.submitted ? 'text-[#434653]' : 'text-[#191c1d] group-hover:text-[#00327d] transition-colors'}`}
                        style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>
                        {a.title}
                      </h4>
                      {a.description && <p className="text-[#434653] text-sm">{a.description}</p>}
                      <p className="text-xs text-[#737784]">기한: {a.deadline}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                      {isAdmin ? (
                        <>
                          <button onClick={() => openAssignmentSubmissions({
                            id: a.id, week: a.week, category: a.category ?? '과제', title: a.title,
                            description: a.description, deadline: a.deadline,
                            daysLeft: a.daysLeft, submitted: a.submitted,
                          })}
                            className="bg-[#dae2ff] text-[#001946] px-3 py-2 rounded-lg text-sm font-semibold hover:bg-[#b8c5f2] active:scale-95 transition-all">
                            제출 현황
                          </button>
                          <button onClick={() => openEditAssignment({
                            id: a.id, week: a.week, category: a.category ?? '과제', title: a.title,
                            description: a.description, deadline: a.deadline,
                            daysLeft: a.daysLeft, submitted: a.submitted,
                          })}
                            className="bg-[#00327d] text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-[#0047ab] active:scale-95 transition-all shadow-sm">
                            수정
                          </button>
                          <button onClick={() => handleDeleteAssignment(a.id, a.title)} disabled={isPending}
                            className="bg-[#E63946] text-white px-3 py-2 rounded-lg text-sm font-semibold hover:opacity-90 active:scale-95 transition-all disabled:opacity-50">
                            삭제
                          </button>
                        </>
                      ) : (
                        a.submitted ? (
                          <>
                            <span className="bg-[#8cf5e4] text-[#00201c] px-3 py-1.5 rounded-full text-sm font-semibold">완료</span>
                            <button onClick={() => handleSubmitClick(a)}
                              className="bg-[#e7e8e9] text-[#434653] px-3 py-2 rounded-lg text-sm font-semibold hover:bg-[#d5d6d8] active:scale-95 transition-all">
                              상세보기
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="bg-[#ffdad6] text-[#93000a] px-3 py-1.5 rounded-full text-sm font-semibold">미완료</span>
                            <button onClick={() => handleSubmitClick(a)}
                              className="bg-[#00327d] text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-[#0047ab] active:scale-95 transition-all shadow-sm">
                              제출하기
                            </button>
                          </>
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
