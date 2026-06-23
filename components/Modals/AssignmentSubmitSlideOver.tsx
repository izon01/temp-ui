'use client';

import { useState, useRef, useTransition } from 'react';
import { useModal } from './ModalContext';
import { useApp } from '@/contexts/AppContext';
import SlideOverBase from './SlideOverBase';
import { submitAssignmentAction } from '@/actions/assignments';

export default function AssignmentSubmitSlideOver() {
  const { openModal, closeModal, selectedAssignment } = useModal();
  const { submitAssignment, showToast } = useApp();
  const [link, setLink] = useState('');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFileName(e.target.files[0].name);
  };

  const reset = () => { setLink(''); setFileName(''); setError(''); };

  const handleSubmit = () => {
    if (!selectedAssignment || (!link && !fileName)) return;
    setError('');

    startTransition(async () => {
      const formData = new FormData();
      formData.append('assignmentId', String(selectedAssignment.id));
      formData.append('link', link);
      formData.append('fileName', fileName);

      const result = await submitAssignmentAction(formData);
      if (result.success) {
        // 옵티미스틱 업데이트: 즉시 UI에서 제출완료로 변경
        submitAssignment(selectedAssignment.id, { link, fileName });
        showToast('제출되었습니다 ✓');
        reset();
        closeModal();
      } else {
        setError(result.error ?? '제출 중 오류가 발생했습니다.');
      }
    });
  };

  return (
    <SlideOverBase isOpen={openModal === 'submitAssignment'} onClose={() => { reset(); closeModal(); }} title="과제 제출">
      {selectedAssignment && (
        <div className="flex flex-col min-h-[70vh] md:min-h-0 md:h-full">
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 pb-28">

            {error && (
              <div className="bg-[#ffdad6] text-[#93000a] text-sm px-4 py-3 rounded-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                {error}
              </div>
            )}

            {/* 과제 정보 */}
            <div className="bg-[#f3f4f5] rounded-xl p-4 space-y-2 border border-[#e1e3e4]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold bg-[#dae2ff] text-[#001946] px-2 py-0.5 rounded">
                  {selectedAssignment.week}주차
                </span>
                {selectedAssignment.daysLeft !== null && (
                  <span className="text-xs font-bold bg-[#ffdad8] text-[#410007] px-2 py-0.5 rounded">
                    D-{selectedAssignment.daysLeft}
                  </span>
                )}
              </div>
              <h3 className="font-bold text-[#191c1d]" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>
                {selectedAssignment.title}
              </h3>
              <p className="text-sm text-[#434653]">{selectedAssignment.description}</p>
              <p className="text-xs text-[#737784]">마감일: {selectedAssignment.deadline}</p>
            </div>

            {/* 파일 업로드 */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#434653]">파일 업로드</label>
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-[#c3c6d5] rounded-xl p-8 flex flex-col items-center justify-center gap-2 bg-[#f3f4f5]/50 hover:bg-[#f3f4f5] transition-colors cursor-pointer active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[#00327d] text-[40px]">upload_file</span>
                {fileName ? (
                  <p className="font-bold text-[#00327d] text-center break-all">{fileName}</p>
                ) : (
                  <div className="text-center">
                    <p className="font-bold text-[#191c1d]">클릭하여 파일 선택</p>
                    <p className="text-sm text-[#434653]">PDF, DOCX, PPTX, ZIP (최대 50MB)</p>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.docx,.pptx,.zip,.hwp" />
            </div>

            <div className="flex items-center gap-3 text-[#737784] text-sm">
              <div className="flex-1 h-px bg-[#e1e3e4]" /><span>또는</span><div className="flex-1 h-px bg-[#e1e3e4]" />
            </div>

            {/* 링크 입력 */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#434653]">링크로 제출</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#737784] text-[20px]">link</span>
                <input
                  type="url"
                  value={link}
                  onChange={e => setLink(e.target.value)}
                  placeholder="https://docs.google.com/..."
                  className="w-full bg-[#f3f4f5] border border-[#c3c6d5] rounded-xl pl-12 pr-4 py-3 focus:border-[#00327d] focus:ring-1 focus:ring-[#00327d] outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* 제출 버튼 */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-md border-t border-[#e1e3e4]">
            <button
              onClick={handleSubmit}
              disabled={isPending || (!link && !fileName)}
              className="w-full bg-[#0047ab] text-white h-14 rounded-xl font-bold text-lg flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg disabled:opacity-50"
            >
              {isPending ? (
                <><span className="material-symbols-outlined animate-spin">progress_activity</span> 제출 중...</>
              ) : (
                <><span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span> 제출하기</>
              )}
            </button>
          </div>
        </div>
      )}
    </SlideOverBase>
  );
}
