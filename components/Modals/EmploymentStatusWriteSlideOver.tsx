'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useModal } from './ModalContext';
import SlideOverBase from './SlideOverBase';
import { createEmploymentRecord, updateEmploymentRecord } from '@/actions/employment';
import { useApp } from '@/contexts/AppContext';

export default function EmploymentStatusWriteSlideOver() {
  const { openModal, closeModal, selectedEmploymentEdit } = useModal();
  const { showToast } = useApp();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const [cohort, setCohort] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [department, setDepartment] = useState('');
  const [content, setContent] = useState('');

  const isEdit = !!selectedEmploymentEdit;

  useEffect(() => {
    if (openModal !== 'employmentWrite') return;
    if (selectedEmploymentEdit) {
      setCohort(selectedEmploymentEdit.cohort);
      setName(selectedEmploymentEdit.name);
      setCompany(selectedEmploymentEdit.company);
      setDepartment(selectedEmploymentEdit.department);
      setContent(selectedEmploymentEdit.content);
    } else {
      setCohort(''); setName(''); setCompany(''); setDepartment(''); setContent('');
    }
    setError('');
  }, [openModal, selectedEmploymentEdit?.id]);

  const handleSubmit = () => {
    const formData = new FormData();
    formData.append('cohort', cohort);
    formData.append('name', name);
    formData.append('company', company);
    formData.append('department', department);
    formData.append('content', content);

    startTransition(async () => {
      const result = isEdit
        ? await updateEmploymentRecord(selectedEmploymentEdit!.id, formData)
        : await createEmploymentRecord(formData);

      if (result.success) {
        showToast(isEdit ? '항목이 수정되었습니다 ✓' : '항목이 등록되었습니다 ✓');
        closeModal();
        router.refresh();
      } else {
        setError(result.error ?? '오류가 발생했습니다.');
      }
    });
  };

  return (
    <SlideOverBase
      isOpen={openModal === 'employmentWrite'}
      onClose={closeModal}
      title={isEdit ? '취업 현황 수정' : '새 항목 등록'}
    >
      <div className="flex flex-col min-h-[70vh] md:min-h-0 md:h-full">
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 pb-28">

          {error && (
            <div className="bg-[#ffdad6] text-[#93000a] text-sm px-4 py-3 rounded-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}

          {/* 기수 */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#434653]">
              기수 <span className="text-[#b7102a]">*</span>
            </label>
            <input
              type="text"
              value={cohort}
              onChange={e => setCohort(e.target.value)}
              placeholder="예: 9기"
              className="w-full bg-[#f3f4f5] border border-[#c3c6d5] rounded-xl px-4 py-3 focus:border-[#00327d] focus:ring-1 focus:ring-[#00327d] outline-none transition-all"
            />
          </div>

          {/* 이름 */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#434653]">
              이름 <span className="text-[#b7102a]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="이름을 입력하세요"
              className="w-full bg-[#f3f4f5] border border-[#c3c6d5] rounded-xl px-4 py-3 focus:border-[#00327d] focus:ring-1 focus:ring-[#00327d] outline-none transition-all"
            />
          </div>

          {/* 기업명 */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#434653]">
              기업명 <span className="text-[#b7102a]">*</span>
            </label>
            <input
              type="text"
              value={company}
              onChange={e => setCompany(e.target.value)}
              placeholder="취업한 기업명을 입력하세요"
              className="w-full bg-[#f3f4f5] border border-[#c3c6d5] rounded-xl px-4 py-3 focus:border-[#00327d] focus:ring-1 focus:ring-[#00327d] outline-none transition-all"
            />
          </div>

          {/* 부서명 */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#434653]">부서명</label>
            <input
              type="text"
              value={department}
              onChange={e => setDepartment(e.target.value)}
              placeholder="부서명을 입력하세요 (선택)"
              className="w-full bg-[#f3f4f5] border border-[#c3c6d5] rounded-xl px-4 py-3 focus:border-[#00327d] focus:ring-1 focus:ring-[#00327d] outline-none transition-all"
            />
          </div>

          {/* 상세 내용 */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#434653]">상세 내용</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="취업 관련 상세 내용을 자유롭게 입력하세요."
              rows={6}
              className="w-full bg-[#f3f4f5] border border-[#c3c6d5] rounded-xl px-4 py-3 focus:border-[#00327d] focus:ring-1 focus:ring-[#00327d] outline-none transition-all resize-none"
            />
          </div>
        </div>

        {/* 등록 버튼 */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md border-t border-[#e1e3e4]">
          <button
            onClick={handleSubmit}
            disabled={isPending || !cohort.trim() || !name.trim() || !company.trim()}
            className="w-full bg-[#0047ab] text-white h-14 rounded-xl font-bold text-lg flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg disabled:opacity-50"
          >
            {isPending
              ? <><span className="material-symbols-outlined animate-spin">progress_activity</span>{isEdit ? '수정 중...' : '등록 중...'}</>
              : <><span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>{isEdit ? '수정 완료' : '등록 완료'}</>
            }
          </button>
        </div>
      </div>
    </SlideOverBase>
  );
}
