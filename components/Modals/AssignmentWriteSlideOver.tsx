'use client';

import { useState, useTransition } from 'react';
import { useModal } from './ModalContext';
import { useApp } from '@/contexts/AppContext';
import SlideOverBase from './SlideOverBase';
import { createAssignment } from '@/actions/assignments';

const WEEKS = Array.from({ length: 16 }, (_, i) => i + 1);

export default function AssignmentWriteSlideOver() {
  const { openModal, closeModal } = useModal();
  const { showToast } = useApp();
  const [week, setWeek] = useState<number>(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const reset = () => {
    setWeek(1); setTitle(''); setDescription(''); setDeadline(''); setError('');
  };

  const handleClose = () => { reset(); closeModal(); };

  const handleSubmit = () => {
    if (!title.trim() || !deadline) {
      setError('과제명과 제출 기한은 필수입니다.');
      return;
    }
    setError('');
    startTransition(async () => {
      const formData = new FormData();
      formData.append('week', String(week));
      formData.append('title', title);
      formData.append('description', description);
      formData.append('deadline', deadline);

      const result = await createAssignment(formData);
      if (result.success) {
        showToast(`${week}주차 과제가 등록되었습니다 ✓`);
        reset();
        closeModal();
      } else {
        setError(result.error ?? '오류가 발생했습니다.');
      }
    });
  };

  // 오늘 날짜를 deadline input의 min 값으로
  const today = new Date().toISOString().split('T')[0];

  return (
    <SlideOverBase isOpen={openModal === 'writeAssignment'} onClose={handleClose} title="새 과제 등록">
      <div className="flex flex-col min-h-[70vh] md:min-h-0 md:h-full">
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 pb-28">

          {error && (
            <div className="bg-[#ffdad6] text-[#93000a] text-sm px-4 py-3 rounded-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}

          {/* 주차 선택 */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#434653]">주차 선택</label>
            <div className="grid grid-cols-4 gap-2">
              {WEEKS.map(w => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setWeek(w)}
                  className={`py-2 rounded-xl text-sm font-bold border transition-all ${
                    week === w
                      ? 'bg-[#00327d] text-white border-[#00327d] shadow-sm'
                      : 'bg-[#f3f4f5] border-[#c3c6d5] text-[#434653] hover:border-[#00327d] hover:text-[#00327d]'
                  }`}
                >
                  {w}주차
                </button>
              ))}
            </div>
          </div>

          {/* 과제명 */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#434653]">
              과제명 <span className="text-[#b7102a]">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="예) 스타트업 비즈니스 모델 캔버스 작성"
              className="w-full bg-[#f3f4f5] border border-[#c3c6d5] rounded-xl px-4 py-3 focus:border-[#00327d] focus:ring-1 focus:ring-[#00327d] outline-none transition-all"
            />
          </div>

          {/* 제출 기한 */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#434653]">
              제출 기한 <span className="text-[#b7102a]">*</span>
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#737784] text-[20px]">calendar_today</span>
              <input
                type="date"
                value={deadline}
                min={today}
                onChange={e => setDeadline(e.target.value)}
                className="w-full bg-[#f3f4f5] border border-[#c3c6d5] rounded-xl pl-12 pr-4 py-3 focus:border-[#00327d] focus:ring-1 focus:ring-[#00327d] outline-none transition-all"
              />
            </div>
          </div>

          {/* 상세 내용 */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#434653]">상세 내용</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="과제에 대한 설명, 제출 방법, 평가 기준 등을 입력해주세요."
              rows={5}
              className="w-full bg-[#f3f4f5] border border-[#c3c6d5] rounded-xl px-4 py-3 focus:border-[#00327d] focus:ring-1 focus:ring-[#00327d] outline-none transition-all resize-none"
            />
          </div>

          {/* 미리보기 */}
          {(title || deadline) && (
            <div className="bg-[#eef2ff] border border-[#c7d2fe] rounded-xl p-4 space-y-1">
              <p className="text-xs font-bold text-[#4338ca] uppercase tracking-wider">미리보기</p>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold bg-[#dae2ff] text-[#001946] px-2 py-0.5 rounded">{week}주차</span>
              </div>
              <p className="font-semibold text-[#191c1d]">{title || '과제명을 입력하세요'}</p>
              {deadline && <p className="text-xs text-[#737784]">마감일: {deadline}</p>}
            </div>
          )}
        </div>

        {/* 등록 버튼 */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-md border-t border-[#e1e3e4]">
          <button
            onClick={handleSubmit}
            disabled={isPending || !title.trim() || !deadline}
            className="w-full bg-[#0047ab] text-white h-14 rounded-xl font-bold text-lg flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg disabled:opacity-50"
          >
            {isPending ? (
              <><span className="material-symbols-outlined animate-spin">progress_activity</span> 등록 중...</>
            ) : (
              <><span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span> 과제 등록하기</>
            )}
          </button>
        </div>
      </div>
    </SlideOverBase>
  );
}
