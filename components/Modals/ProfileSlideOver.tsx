'use client';

import { useState } from 'react';
import { useModal } from './ModalContext';
import SlideOverBase from './SlideOverBase';

export default function ProfileSlideOver() {
  const { openModal, closeModal } = useModal();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => { setSaved(false); closeModal(); }, 1200);
    }, 1200);
  };

  return (
    <SlideOverBase isOpen={openModal === 'profile'} onClose={closeModal} title="프로필 설정">
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-[#dae2ff] shadow-lg bg-[#0047ab] flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[64px]">person</span>
              </div>
              <button className="absolute bottom-1 right-1 w-10 h-10 bg-[#00327d] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#0047ab] transition-colors">
                <span className="material-symbols-outlined text-[20px]">photo_camera</span>
              </button>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-[#191c1d]" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>김경북</h3>
              <p className="text-[#434653]">gyeongbuk_youth@edu.kr</p>
            </div>
          </div>

          {/* Account info */}
          <div className="space-y-3">
            <h4 className="text-xs text-[#737784] uppercase tracking-wider font-semibold">계정 정보 관리</h4>
            {[
              { label: '연락처', value: '010-1234-5678', icon: 'call' },
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

            <div className="mt-4 p-3 bg-[#ffdad8]/30 rounded-lg flex items-center gap-3">
              <span className="bg-[#b7102a] text-white px-2 py-0.5 text-[10px] font-bold rounded-full uppercase">Alert</span>
              <p className="text-sm text-[#92001c]">마지막 정보 수정일: 2023.11.15</p>
            </div>
          </div>

          {/* Notification settings */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs text-[#737784] uppercase tracking-wider font-semibold">알림 설정</h4>
            <div className="flex items-center justify-between p-3 hover:bg-[#f3f4f5] rounded-lg transition-colors cursor-pointer">
              <div className="flex flex-col">
                <span className="font-semibold text-[#191c1d]">프로그램 공지 알림</span>
                <span className="text-xs text-[#434653]">중요한 학사 일정 및 프로그램 소식을 받습니다.</span>
              </div>
              <div className="w-12 h-6 bg-[#00327d] rounded-full relative p-1 cursor-pointer flex-shrink-0">
                <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1" />
              </div>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="p-6 border-t border-[#e1e3e4] bg-white/80 backdrop-blur-md">
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className={`w-full py-4 font-bold text-lg rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md disabled:opacity-80 ${saved ? 'bg-[#00574e] text-white' : 'bg-[#0047ab] text-white hover:bg-[#00327d]'}`}
          >
            {saved ? (
              <><span className="material-symbols-outlined">check_circle</span> 저장 완료!</>
            ) : saving ? (
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
