'use client';

import { useState, useEffect, useTransition } from 'react';
import { useSession } from 'next-auth/react';
import { useModal } from './ModalContext';
import { useApp } from '@/contexts/AppContext';
import SlideOverBase from './SlideOverBase';
import { getParticipantProfile, updateParticipantProfile } from '@/actions/participants';

const TEAMS = ['A팀', 'B팀', 'C팀', 'D팀', 'E팀', '기타'];
const TRACKS = ['AI 솔루션 트랙', '플랫폼 개발 트랙', 'UI/UX 디자인 트랙', '데이터 분석 트랙', '기타'];

export default function ProfileSlideOver() {
  const { openModal, closeModal } = useModal();
  const { showToast } = useApp();
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [team, setTeam] = useState('');
  const [track, setTrack] = useState('');

  useEffect(() => {
    if (openModal !== 'profile' || !session?.user?.id) return;
    getParticipantProfile(Number(session.user.id)).then(p => {
      if (!p) return;
      setName(p.name);
      setEmail(p.email);
      setTeam(p.team || '');
      setTrack(p.track || '');
    });
  }, [openModal, session?.user?.id]);

  const handleSave = () => {
    if (!session?.user?.id) return;
    startTransition(async () => {
      const result = await updateParticipantProfile(Number(session.user.id), { team, track });
      if (result.success) {
        setSaved(true);
        showToast('프로필이 저장되었습니다 ✓');
        setTimeout(() => { setSaved(false); closeModal(); }, 1200);
      } else {
        showToast(result.error ?? '저장 중 오류가 발생했습니다.');
      }
    });
  };

  return (
    <SlideOverBase isOpen={openModal === 'profile'} onClose={closeModal} title="프로필 설정">
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">

          {/* Avatar */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-[#dae2ff] shadow-lg bg-[#0047ab] flex items-center justify-center">
                <span className="text-white text-5xl font-bold">{name?.[0] ?? '?'}</span>
              </div>
              <button className="absolute bottom-1 right-1 w-10 h-10 bg-[#00327d] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#0047ab] transition-colors">
                <span className="material-symbols-outlined text-[20px]">photo_camera</span>
              </button>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-[#191c1d]" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>{name || '—'}</h3>
              <p className="text-[#434653] text-sm">{email}</p>
            </div>
          </div>

          {/* 소속 정보 */}
          <div className="space-y-4">
            <h4 className="text-xs text-[#737784] uppercase tracking-wider font-semibold">소속 정보</h4>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-[#191c1d] ml-1">소속 팀</label>
              <select
                value={team}
                onChange={e => setTeam(e.target.value)}
                className="w-full px-4 py-3 bg-[#f3f4f5] border border-[#c3c6d5] rounded-xl text-[#191c1d] focus:outline-none focus:border-[#00327d] focus:ring-1 focus:ring-[#00327d] transition-all"
              >
                <option value="">팀 선택</option>
                {TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-[#191c1d] ml-1">트랙</label>
              <select
                value={track}
                onChange={e => setTrack(e.target.value)}
                className="w-full px-4 py-3 bg-[#f3f4f5] border border-[#c3c6d5] rounded-xl text-[#191c1d] focus:outline-none focus:border-[#00327d] focus:ring-1 focus:ring-[#00327d] transition-all"
              >
                <option value="">트랙 선택</option>
                {TRACKS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* 계정 정보 */}
          <div className="space-y-3">
            <h4 className="text-xs text-[#737784] uppercase tracking-wider font-semibold">계정 정보 관리</h4>
            {[
              { label: '비밀번호', value: '••••••••••••', icon: 'lock' },
            ].map(item => (
              <div key={item.label} className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[#191c1d] ml-1">{item.label}</label>
                <button className="w-full flex items-center justify-between p-4 bg-[#f3f4f5] rounded-xl border border-transparent hover:border-[#00327d]/30 transition-all text-left active:scale-[0.99]">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#00327d]">{item.icon}</span>
                    <span className="text-[#191c1d]">{item.value}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#00327d] font-bold text-sm">변경</span>
                    <span className="material-symbols-outlined text-[#737784]">chevron_right</span>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Save button */}
        <div className="p-6 border-t border-[#e1e3e4] bg-white/80 backdrop-blur-md">
          <button
            onClick={handleSave}
            disabled={isPending || saved}
            className={`w-full py-4 font-bold text-lg rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md disabled:opacity-80 ${saved ? 'bg-[#00574e] text-white' : 'bg-[#0047ab] text-white hover:bg-[#00327d]'}`}
          >
            {saved ? (
              <><span className="material-symbols-outlined">check_circle</span> 저장 완료!</>
            ) : isPending ? (
              <><span className="material-symbols-outlined animate-spin">refresh</span> 저장 중...</>
            ) : (
              <><span className="material-symbols-outlined">save</span> 변경사항 저장</>
            )}
          </button>
        </div>
      </div>
    </SlideOverBase>
  );
}
