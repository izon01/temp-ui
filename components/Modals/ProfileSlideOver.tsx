'use client';

import { useState, useEffect, useTransition, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useModal } from './ModalContext';
import { useApp } from '@/contexts/AppContext';
import SlideOverBase from './SlideOverBase';
import {
  getParticipantProfile,
  updateParticipantProfile,
  changePassword,
} from '@/actions/participants';

export default function ProfileSlideOver() {
  const { openModal, closeModal } = useModal();
  const { showToast } = useApp();
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  // 기본 프로필 정보
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [team, setTeam] = useState('');   // → 직무
  const [track, setTrack] = useState(''); // → 지원분야
  const [profileImage, setProfileImage] = useState('');

  // 비밀번호 변경
  const [showPwdForm, setShowPwdForm] = useState(false);
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwdError, setPwdError] = useState('');

  // 프로필 사진 업로드
  const photoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (openModal !== 'profile' || !session?.user?.id) return;
    getParticipantProfile(Number(session.user.id)).then(p => {
      if (!p) return;
      setName(p.name);
      setEmail(p.email);
      setPhone(p.phone || '');
      setTeam(p.team || '');
      setTrack(p.track || '');
      setProfileImage(p.profileImage || '');
    });
    // 모달 닫힐 때 비밀번호 폼 초기화
    return () => { setShowPwdForm(false); setCurrentPwd(''); setNewPwd(''); setPwdError(''); };
  }, [openModal, session?.user?.id]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProfileImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!session?.user?.id) return;
    startTransition(async () => {
      const result = await updateParticipantProfile(Number(session.user.id), {
        team, track, phone, profileImage,
      });
      if (result.success) {
        setSaved(true);
        showToast('프로필이 저장되었습니다 ✓');
        setTimeout(() => { setSaved(false); closeModal(); }, 1200);
      } else {
        showToast(result.error ?? '저장 중 오류가 발생했습니다.');
      }
    });
  };

  const handleChangePassword = () => {
    if (!currentPwd || !newPwd) { setPwdError('모든 항목을 입력해 주세요.'); return; }
    setPwdError('');
    startTransition(async () => {
      const result = await changePassword(Number(session?.user?.id), currentPwd, newPwd);
      if (result.success) {
        showToast('비밀번호가 변경되었습니다 ✓');
        setShowPwdForm(false);
        setCurrentPwd(''); setNewPwd('');
      } else {
        setPwdError(result.error ?? '오류가 발생했습니다.');
      }
    });
  };

  return (
    <SlideOverBase isOpen={openModal === 'profile'} onClose={closeModal} title="프로필 설정">
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 pb-28">

          {/* 프로필 사진 */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-[#dae2ff] shadow-lg bg-[#0047ab] flex items-center justify-center">
                {profileImage
                  ? <img src={profileImage} alt="프로필" className="w-full h-full object-cover" />
                  : <span className="text-white text-5xl font-bold">{name?.[0] ?? '?'}</span>
                }
              </div>
              <button
                type="button"
                onClick={() => photoRef.current?.click()}
                className="absolute bottom-1 right-1 w-10 h-10 bg-[#00327d] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#0047ab] transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">photo_camera</span>
              </button>
              <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-[#191c1d]" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>{name || '—'}</h3>
              <p className="text-[#434653] text-sm">{email}</p>
            </div>
          </div>

          {/* 직무 / 지원분야 */}
          <div className="space-y-4">
            <h4 className="text-xs text-[#737784] uppercase tracking-wider font-semibold">소속 정보</h4>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-[#191c1d] ml-1">직무</label>
              <input
                type="text"
                value={team}
                onChange={e => setTeam(e.target.value)}
                placeholder="예) 기획, 개발, 디자인..."
                className="w-full px-4 py-3 bg-[#f3f4f5] border border-[#c3c6d5] rounded-xl text-[#191c1d] placeholder:text-[#737784] focus:outline-none focus:border-[#00327d] focus:ring-1 focus:ring-[#00327d] transition-all"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-[#191c1d] ml-1">지원분야</label>
              <input
                type="text"
                value={track}
                onChange={e => setTrack(e.target.value)}
                placeholder="예) AI 솔루션, 플랫폼 개발..."
                className="w-full px-4 py-3 bg-[#f3f4f5] border border-[#c3c6d5] rounded-xl text-[#191c1d] placeholder:text-[#737784] focus:outline-none focus:border-[#00327d] focus:ring-1 focus:ring-[#00327d] transition-all"
              />
            </div>
          </div>

          {/* 계정 정보 */}
          <div className="space-y-4">
            <h4 className="text-xs text-[#737784] uppercase tracking-wider font-semibold">계정 정보 관리</h4>

            {/* 연락처 */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-[#191c1d] ml-1">연락처</label>
              <div className="flex items-center gap-2 px-4 py-3 bg-[#f3f4f5] border border-[#c3c6d5] rounded-xl focus-within:border-[#00327d] focus-within:ring-1 focus-within:ring-[#00327d] transition-all">
                <span className="material-symbols-outlined text-[#00327d] text-[20px]">call</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="010-0000-0000"
                  className="flex-1 bg-transparent border-none outline-none text-[#191c1d] placeholder:text-[#737784]"
                />
              </div>
            </div>

            {/* 비밀번호 변경 */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-[#191c1d] ml-1">비밀번호</label>
              {!showPwdForm ? (
                <button
                  type="button"
                  onClick={() => setShowPwdForm(true)}
                  className="w-full flex items-center justify-between p-4 bg-[#f3f4f5] rounded-xl border border-transparent hover:border-[#00327d]/30 transition-all text-left active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#00327d]">lock</span>
                    <span className="text-[#191c1d]">••••••••••••</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#00327d] font-bold text-sm">변경</span>
                    <span className="material-symbols-outlined text-[#737784]">chevron_right</span>
                  </div>
                </button>
              ) : (
                <div className="space-y-3 bg-[#f3f4f5] rounded-xl p-4 border border-[#c3c6d5]">
                  {pwdError && (
                    <p className="text-xs text-[#b7102a] font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">error</span>{pwdError}
                    </p>
                  )}
                  {/* 기존 비밀번호 */}
                  <div className="relative">
                    <input
                      type={showCurrent ? 'text' : 'password'}
                      value={currentPwd}
                      onChange={e => setCurrentPwd(e.target.value)}
                      placeholder="기존 비밀번호"
                      className="w-full px-4 py-2.5 bg-white border border-[#c3c6d5] rounded-lg text-sm text-[#191c1d] placeholder:text-[#737784] focus:outline-none focus:border-[#00327d] transition-all"
                    />
                    <button type="button" onClick={() => setShowCurrent(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737784]">
                      <span className="material-symbols-outlined text-[18px]">{showCurrent ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                  {/* 새 비밀번호 */}
                  <div className="relative">
                    <input
                      type={showNew ? 'text' : 'password'}
                      value={newPwd}
                      onChange={e => setNewPwd(e.target.value)}
                      placeholder="새 비밀번호 (6자 이상)"
                      className="w-full px-4 py-2.5 bg-white border border-[#c3c6d5] rounded-lg text-sm text-[#191c1d] placeholder:text-[#737784] focus:outline-none focus:border-[#00327d] transition-all"
                    />
                    <button type="button" onClick={() => setShowNew(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737784]">
                      <span className="material-symbols-outlined text-[18px]">{showNew ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleChangePassword}
                      disabled={isPending}
                      className="flex-1 bg-[#0047ab] text-white py-2 rounded-lg text-sm font-bold disabled:opacity-60 active:scale-95 transition-all"
                    >
                      {isPending ? '변경 중...' : '변경하기'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowPwdForm(false); setCurrentPwd(''); setNewPwd(''); setPwdError(''); }}
                      className="px-4 bg-[#e7e8e9] text-[#434653] py-2 rounded-lg text-sm font-bold active:scale-95 transition-all"
                    >
                      취소
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 저장 버튼 */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-md border-t border-[#e1e3e4]">
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
