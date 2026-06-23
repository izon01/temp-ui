'use client';

import { useEffect, useState, useTransition } from 'react';
import { useModal } from './ModalContext';
import SlideOverBase from './SlideOverBase';
import { getParticipantStats } from '@/actions/participants';

const statusConfig = {
  '정상': { label: '🟢 정상', bg: 'bg-[#d1fae5]', text: 'text-[#065f46]', bar: 'bg-[#2A9D8F]' },
  '주의': { label: '🟡 주의', bg: 'bg-[#fef9c3]', text: 'text-[#713f12]', bar: 'bg-[#FFB703]' },
  '위험': { label: '🔴 위험', bg: 'bg-[#fee2e2]', text: 'text-[#991b1b]', bar: 'bg-[#E63946]' },
} as const;

export default function ParticipantProfileSlideOver() {
  const { openModal, closeModal, selectedParticipant } = useModal();
  const [stats, setStats] = useState<{ totalAssignments: number; submittedCount: number } | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!selectedParticipant) { setStats(null); return; }
    startTransition(async () => {
      const s = await getParticipantStats(selectedParticipant.id);
      setStats(s);
    });
  }, [selectedParticipant?.id]);

  if (!selectedParticipant) return null;

  const status = statusConfig[selectedParticipant.status as keyof typeof statusConfig] ?? statusConfig['정상'];

  return (
    <SlideOverBase isOpen={openModal === 'participantProfile'} onClose={closeModal} title="참여자 프로필">
      <div className="flex flex-col gap-6 px-6 py-6">

        {/* 아바타 + 기본 정보 */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#dae2ff] flex items-center justify-center text-[#00327d] text-2xl font-bold flex-shrink-0">
            {selectedParticipant.name[0]}
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#191c1d]" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>
              {selectedParticipant.name}
            </h2>
            <p className="text-sm text-[#434653]">{selectedParticipant.team} · {selectedParticipant.track}</p>
            <span className={`mt-1 inline-block text-xs font-bold px-2 py-0.5 rounded-full ${status.bg} ${status.text}`}>
              {status.label}
            </span>
          </div>
        </div>

        <hr className="border-[#e1e3e4]" />

        {/* 출석률 */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-[#434653] flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px] text-[#0047ab]">calendar_month</span>
              출석률
            </span>
            <span className="font-bold text-[#191c1d]">{selectedParticipant.attendance}%</span>
          </div>
          <div className="w-full bg-[#edeeef] h-3 rounded-full overflow-hidden">
            <div
              className={`${status.bar} h-full rounded-full transition-all duration-700`}
              style={{ width: `${selectedParticipant.attendance}%` }}
            />
          </div>
        </div>

        {/* 과제 제출 현황 */}
        <div className="bg-[#f3f4f5] rounded-xl p-4 space-y-1">
          <p className="text-sm font-semibold text-[#434653] flex items-center gap-1 mb-2">
            <span className="material-symbols-outlined text-[18px] text-[#0047ab]">assignment_turned_in</span>
            과제 제출 현황
          </p>
          {stats ? (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-[#737784]">제출 완료</span>
                <span className="font-bold text-[#2A9D8F]">{stats.submittedCount}개</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#737784]">전체 과제</span>
                <span className="font-bold text-[#191c1d]">{stats.totalAssignments}개</span>
              </div>
              {stats.totalAssignments > 0 && (
                <div className="mt-2">
                  <div className="w-full bg-[#e1e3e4] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#0047ab] h-full rounded-full"
                      style={{ width: `${Math.round((stats.submittedCount / stats.totalAssignments) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-[#737784] mt-1 text-right">
                    {Math.round((stats.submittedCount / stats.totalAssignments) * 100)}% 제출 완료
                  </p>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-[#737784] animate-pulse">데이터 로딩 중...</p>
          )}
        </div>

        {/* 최근 접속 */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#434653] flex items-center gap-1">
            <span className="material-symbols-outlined text-[18px] text-[#0047ab]">schedule</span>
            최근 접속
          </span>
          <span className="font-semibold text-[#191c1d]">{selectedParticipant.lastAccess}</span>
        </div>

        {/* 닫기 버튼 */}
        <button
          onClick={closeModal}
          className="w-full mt-4 border border-[#c3c6d5] rounded-xl py-3 font-semibold text-[#434653] hover:bg-[#f3f4f5] active:scale-95 transition-all"
        >
          닫기
        </button>
      </div>
    </SlideOverBase>
  );
}
