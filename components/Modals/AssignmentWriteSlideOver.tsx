'use client';

import { useState, useEffect, useTransition } from 'react';
import { useModal } from './ModalContext';
import { useApp } from '@/contexts/AppContext';
import SlideOverBase from './SlideOverBase';
import { createAssignment, updateAssignment } from '@/actions/assignments';

const ROUNDS = Array.from({ length: 16 }, (_, i) => i + 1);

const CATEGORIES = [
  { value: '캠프',   icon: 'camping',          color: 'bg-[#dae2ff] text-[#001946]' },
  { value: '과제',   icon: 'assignment',        color: 'bg-[#ffdad8] text-[#410007]' },
  { value: '멘토링', icon: 'supervisor_account', color: 'bg-[#d0f5e8] text-[#003822]' },
];

export default function AssignmentWriteSlideOver() {
  const { openModal, closeModal, selectedAssignment } = useModal();
  const { showToast } = useApp();
  const [week, setWeek]               = useState<number>(1);
  const [category, setCategory]       = useState('과제');
  const [title, setTitle]             = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline]       = useState('');
  const [error, setError]             = useState('');
  const [isPending, startTransition]  = useTransition();

  const isEdit = openModal === 'editAssignment';

  useEffect(() => {
    if (!isEdit || !selectedAssignment) return;
    setWeek(selectedAssignment.week);
    setCategory(selectedAssignment.category ?? '과제');
    setTitle(selectedAssignment.title);
    setDescription(selectedAssignment.description ?? '');
    setDeadline(selectedAssignment.deadline);
    setError('');
  }, [openModal, selectedAssignment?.id]);

  const reset = () => { setWeek(1); setCategory('과제'); setTitle(''); setDescription(''); setDeadline(''); setError(''); };
  const handleClose = () => { reset(); closeModal(); };

  const handleSubmit = () => {
    if (!title.trim() || !deadline) { setError('과제명과 제출 기한은 필수입니다.'); return; }
    setError('');
    startTransition(async () => {
      const formData = new FormData();
      formData.append('week', String(week));
      formData.append('category', category);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('deadline', deadline);

      const result = isEdit && selectedAssignment
        ? await updateAssignment(selectedAssignment.id, formData)
        : await createAssignment(formData);

      if (result.success) {
        showToast(isEdit ? '과제가 수정되었습니다 ✓' : `${week}회차 ${category}가 등록되었습니다 ✓`);
        reset(); closeModal();
      } else {
        setError(result.error ?? '오류가 발생했습니다.');
      }
    });
  };

  const today = new Date().toISOString().split('T')[0];
  const catInfo = CATEGORIES.find(c => c.value === category) ?? CATEGORIES[1];

  return (
    <SlideOverBase
      isOpen={openModal === 'writeAssignment' || openModal === 'editAssignment'}
      onClose={handleClose}
      title={isEdit ? '항목 수정하기' : '새 항목 등록'}
    >
      <div className="flex flex-col min-h-[70vh] md:min-h-0 md:h-full">
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 pb-28">

          {error && (
            <div className="bg-[#ffdad6] text-[#93000a] text-sm px-4 py-3 rounded-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>{error}
            </div>
          )}

          {/* 카테고리 */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#434653]">카테고리 <span className="text-[#b7102a]">*</span></label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(cat => (
                <button key={cat.value} type="button" onClick={() => setCategory(cat.value)}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 text-sm font-bold transition-all ${
                    category === cat.value
                      ? 'border-[#00327d] bg-[#dae2ff] text-[#00327d] shadow-sm'
                      : 'border-[#e1e3e4] bg-[#f3f4f5] text-[#434653] hover:border-[#00327d]/40'
                  }`}>
                  <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: category === cat.value ? "'FILL' 1" : "'FILL' 0" }}>
                    {cat.icon}
                  </span>
                  {cat.value}
                </button>
              ))}
            </div>
          </div>

          {/* 회차 선택 */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#434653]">회차 선택</label>
            <div className="grid grid-cols-4 gap-2">
              {ROUNDS.map(w => (
                <button key={w} type="button" onClick={() => setWeek(w)}
                  className={`py-2 rounded-xl text-sm font-bold border transition-all ${
                    week === w
                      ? 'bg-[#00327d] text-white border-[#00327d] shadow-sm'
                      : 'bg-[#f3f4f5] border-[#c3c6d5] text-[#434653] hover:border-[#00327d] hover:text-[#00327d]'
                  }`}>
                  {w}회차
                </button>
              ))}
            </div>
          </div>

          {/* 제목 */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#434653]">
              제목 <span className="text-[#b7102a]">*</span>
            </label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder={`예) ${category === '캠프' ? '1박 2일 팀빌딩 캠프' : category === '멘토링' ? '현직자 멘토링 세션' : '스타트업 비즈니스 모델 캔버스'}`}
              className="w-full bg-[#f3f4f5] border border-[#c3c6d5] rounded-xl px-4 py-3 focus:border-[#00327d] focus:ring-1 focus:ring-[#00327d] outline-none transition-all" />
          </div>

          {/* 제출 기한 */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#434653]">
              기한 <span className="text-[#b7102a]">*</span>
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#737784] text-[20px]">calendar_today</span>
              <input type="date" value={deadline} min={isEdit ? undefined : today}
                onChange={e => setDeadline(e.target.value)}
                className="w-full bg-[#f3f4f5] border border-[#c3c6d5] rounded-xl pl-12 pr-4 py-3 focus:border-[#00327d] focus:ring-1 focus:ring-[#00327d] outline-none transition-all" />
            </div>
          </div>

          {/* 상세 내용 */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#434653]">상세 내용</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="내용, 제출 방법, 평가 기준 등을 입력해주세요."
              rows={4}
              className="w-full bg-[#f3f4f5] border border-[#c3c6d5] rounded-xl px-4 py-3 focus:border-[#00327d] focus:ring-1 focus:ring-[#00327d] outline-none transition-all resize-none" />
          </div>

          {/* 미리보기 */}
          {(title || deadline) && (
            <div className="bg-[#eef2ff] border border-[#c7d2fe] rounded-xl p-4 space-y-1">
              <p className="text-xs font-bold text-[#4338ca] uppercase tracking-wider">미리보기</p>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${catInfo.color}`}>{category}</span>
                <span className="text-xs font-bold bg-[#dae2ff] text-[#001946] px-2 py-0.5 rounded">{week}회차</span>
              </div>
              <p className="font-semibold text-[#191c1d]">{title || '제목을 입력하세요'}</p>
              {deadline && <p className="text-xs text-[#737784]">기한: {deadline}</p>}
            </div>
          )}
        </div>

        {/* 버튼 */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-md border-t border-[#e1e3e4]">
          <button onClick={handleSubmit} disabled={isPending || !title.trim() || !deadline}
            className="w-full bg-[#0047ab] text-white h-14 rounded-xl font-bold text-lg flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg disabled:opacity-50">
            {isPending
              ? <><span className="material-symbols-outlined animate-spin">progress_activity</span> 처리 중...</>
              : isEdit
                ? <><span className="material-symbols-outlined">edit</span> 수정 완료</>
                : <><span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span> 등록하기</>
            }
          </button>
        </div>
      </div>
    </SlideOverBase>
  );
}
