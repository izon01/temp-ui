'use client';

import { useModal } from '@/components/Modals/ModalContext';

const statusConfig = {
  '정상': { label: '🟢정상', bg: 'bg-[#2A9D8F]', text: 'text-white', bar: 'bg-[#00327d]' },
  '주의': { label: '🟡주의', bg: 'bg-[#FFB703]', text: 'text-[#410007]', bar: 'bg-[#FFB703]' },
  '위험': { label: '🔴위험', bg: 'bg-[#E63946]', text: 'text-white', bar: 'bg-[#ba1a1a]' },
} as const;

interface Participant {
  id: number; name: string; team: string; track: string;
  attendance: number; status: string; lastAccess: string;
}

interface Props {
  participants: Participant[];
  participantCount: number;
  initialAttendanceRate: number;
}

export default function HomeClient({ participants, participantCount, initialAttendanceRate }: Props) {
  const { openParticipantProfile } = useModal();

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-6 space-y-6">
      {/* Summary Dashboard */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 출석률 (DB 실데이터) */}
        <div className="bg-[#0047ab] text-white rounded-xl p-6 shadow-sm flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <span className="text-sm font-semibold opacity-80">전체 출석률</span>
            <span className="material-symbols-outlined">analytics</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>{initialAttendanceRate}%</span>
            <span className="text-sm text-[#8cf5e4]">실시간 DB</span>
          </div>
          <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
            <div className="bg-white h-full transition-all duration-500" style={{ width: `${initialAttendanceRate}%` }} />
          </div>
        </div>

        {/* 과제 제출률 */}
        <div className="bg-white border border-[#e1e3e4] rounded-xl p-6 shadow-sm flex flex-col justify-between h-40 hover:scale-[1.02] transition-transform cursor-pointer">
          <div className="flex justify-between items-start">
            <span className="text-sm text-[#434653]">과제 제출률</span>
            <span className="material-symbols-outlined text-[#b7102a]">assignment_turned_in</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-[#191c1d]" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>88.5%</span>
            <span className="text-sm text-[#ba1a1a]">▼ 0.8%</span>
          </div>
          <p className="text-sm text-[#434653]">이번 주 미제출: 4명</p>
        </div>

        {/* 현재 인원 (DB 연동) */}
        <div className="bg-white border border-[#e1e3e4] rounded-xl p-6 shadow-sm flex flex-col justify-between h-40 hover:scale-[1.02] transition-transform cursor-pointer">
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
          <h2 className="text-xl font-bold text-[#191c1d]" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>참여자 모니터링</h2>
          <div className="flex gap-2">
            <button className="bg-[#f3f4f5] px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-1 hover:bg-[#e7e8e9] transition-colors">
              <span className="material-symbols-outlined text-[18px]">filter_list</span>필터
            </button>
            <button className="bg-[#f3f4f5] px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-1 hover:bg-[#e7e8e9] transition-colors">
              <span className="material-symbols-outlined text-[18px]">sort</span>정렬
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {participants.map(p => {
            const status = statusConfig[p.status as keyof typeof statusConfig] ?? statusConfig['정상'];
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
                    <span>출석률</span><span>{p.attendance}%</span>
                  </div>
                  <div className="w-full bg-[#edeeef] h-2 rounded-full overflow-hidden">
                    <div className={`${status.bar} h-full`} style={{ width: `${p.attendance}%` }} />
                  </div>
                </div>
                <div className="flex items-center gap-4 md:justify-end">
                  <div className="text-right hidden md:block">
                    <p className="text-xs text-[#434653]">최근 접속</p>
                    <p className="text-sm font-semibold">{p.lastAccess}</p>
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
