'use client';

import { useState, useRef, useTransition, useEffect } from 'react';
import { useModal } from './ModalContext';
import { useApp } from '@/contexts/AppContext';
import SlideOverBase from './SlideOverBase';
import { submitAssignmentAction, getMySubmission } from '@/actions/assignments';

export default function AssignmentSubmitSlideOver() {
  const { openModal, closeModal, selectedAssignment } = useModal();
  const { submitAssignment, showToast } = useApp();

  const [link, setLink]         = useState('');
  const [fileName, setFileName] = useState('');
  const [fileData, setFileData] = useState('');   // base64
  const [content, setContent]   = useState('');
  const [error, setError]       = useState('');
  const [isPending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  // 기존 제출물 (submitted=true일 때 로드)
  const [existing, setExisting] = useState<{
    link: string; fileName: string; fileData: string; content: string; submittedAt: string;
  } | null>(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (openModal !== 'submitAssignment' || !selectedAssignment) return;
    setExisting(null); setEditMode(false); setError('');
    setLink(''); setFileName(''); setFileData(''); setContent('');

    if (selectedAssignment.submitted) {
      startTransition(async () => {
        const data = await getMySubmission(selectedAssignment.id);
        setExisting(data);
        if (data) { setLink(data.link); setFileName(data.fileName); setFileData(data.fileData ?? ''); setContent(data.content); }
      });
    }
  }, [openModal, selectedAssignment?.id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('파일 크기는 5MB 이하만 가능합니다.'); return; }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setFileData(reader.result as string);
    reader.readAsDataURL(file);
  };

  const reset = () => { setLink(''); setFileName(''); setFileData(''); setContent(''); setError(''); setExisting(null); setEditMode(false); };
  const hasInput = !!(link || fileName || content.trim());

  const handleSubmit = () => {
    if (!selectedAssignment || !hasInput) return;
    setError('');
    startTransition(async () => {
      const formData = new FormData();
      formData.append('assignmentId', String(selectedAssignment.id));
      formData.append('link', link);
      formData.append('fileName', fileName);
      formData.append('fileData', fileData);
      formData.append('content', content);

      const result = await submitAssignmentAction(formData);
      if (result.success) {
        submitAssignment(selectedAssignment.id, { link, fileName });
        showToast(existing ? '과제가 수정되었습니다 ✓' : '제출되었습니다 ✓');
        reset(); closeModal();
      } else {
        setError(result.error ?? '제출 중 오류가 발생했습니다.');
      }
    });
  };

  // 읽기 전용 모드 (제출 완료 + 수정 미시작)
  const isReadOnly = selectedAssignment?.submitted && !editMode;

  return (
    <SlideOverBase
      isOpen={openModal === 'submitAssignment'}
      onClose={() => { reset(); closeModal(); }}
      title={isReadOnly ? '제출 내역 확인' : existing ? '과제 수정' : '과제 제출'}
    >
      {selectedAssignment && (
        <div className="flex flex-col min-h-[70vh] md:min-h-0 md:h-full">
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 pb-28">

            {error && (
              <div className="bg-[#ffdad6] text-[#93000a] text-sm px-4 py-3 rounded-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>{error}
              </div>
            )}

            {/* 과제 정보 */}
            <div className="bg-[#f3f4f5] rounded-xl p-4 space-y-2 border border-[#e1e3e4]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold bg-[#dae2ff] text-[#001946] px-2 py-0.5 rounded">{selectedAssignment.week}주차</span>
                {selectedAssignment.daysLeft !== null && (
                  <span className="text-xs font-bold bg-[#ffdad8] text-[#410007] px-2 py-0.5 rounded">D-{selectedAssignment.daysLeft}</span>
                )}
                {existing && (
                  <span className="text-xs font-bold bg-[#8cf5e4] text-[#00201c] px-2 py-0.5 rounded">
                    제출완료 · {existing.submittedAt}
                  </span>
                )}
              </div>
              <h3 className="font-bold text-[#191c1d]" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>{selectedAssignment.title}</h3>
              <p className="text-sm text-[#434653]">{selectedAssignment.description}</p>
              <p className="text-xs text-[#737784]">마감일: {selectedAssignment.deadline}</p>
            </div>

            {/* 로딩 중 */}
            {selectedAssignment.submitted && !existing && isPending && (
              <div className="flex items-center justify-center py-10 text-[#737784]">
                <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span> 불러오는 중...
              </div>
            )}

            {/* ──────────── 읽기 전용 모드 ──────────── */}
            {isReadOnly && existing && (
              <div className="space-y-4">
                {existing.content && (
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-[#434653]">제출 본문</p>
                    <div className="bg-[#f3f4f5] rounded-xl px-4 py-3 text-sm text-[#191c1d] whitespace-pre-line min-h-[100px]">
                      {existing.content}
                    </div>
                  </div>
                )}
                {existing.fileName && (
                  existing.fileData ? (
                    <a href={existing.fileData} download={existing.fileName}
                      className="flex items-center gap-3 bg-[#dae2ff] rounded-xl px-4 py-3 hover:bg-[#b8c5f2] transition-colors">
                      <span className="material-symbols-outlined text-[#00327d]">download</span>
                      <span className="text-sm font-semibold text-[#00327d] truncate">{existing.fileName}</span>
                      <span className="text-xs text-[#434653] ml-auto">다운로드</span>
                    </a>
                  ) : (
                    <div className="flex items-center gap-3 bg-[#dae2ff] rounded-xl px-4 py-3">
                      <span className="material-symbols-outlined text-[#00327d]">attach_file</span>
                      <span className="text-sm font-semibold text-[#191c1d] truncate">{existing.fileName}</span>
                    </div>
                  )
                )}
                {existing.link && (
                  <div className="flex items-center gap-3 bg-[#dae2ff] rounded-xl px-4 py-3">
                    <span className="material-symbols-outlined text-[#00327d]">link</span>
                    <a href={existing.link} target="_blank" rel="noreferrer"
                      className="text-sm font-semibold text-[#00327d] underline truncate">{existing.link}</a>
                  </div>
                )}
                {!existing.content && !existing.fileName && !existing.link && (
                  <p className="text-center text-[#737784] py-6">제출 내역이 없습니다.</p>
                )}
              </div>
            )}

            {/* ──────────── 입력 모드 ──────────── */}
            {!isReadOnly && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#434653]">본문 작성</label>
                  <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    maxLength={2000}
                    rows={6}
                    placeholder="과제 내용을 직접 작성하세요..."
                    className="w-full bg-[#f3f4f5] border border-[#c3c6d5] rounded-xl px-4 py-3 focus:border-[#00327d] focus:ring-1 focus:ring-[#00327d] outline-none transition-all resize-none text-sm"
                  />
                  <p className="text-xs text-[#737784] text-right">{content.length}/2000</p>
                </div>

                <div className="flex items-center gap-3 text-[#737784] text-sm">
                  <div className="flex-1 h-px bg-[#e1e3e4]" /><span>또는 첨부</span><div className="flex-1 h-px bg-[#e1e3e4]" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#434653]">파일 업로드</label>
                  <div onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed border-[#c3c6d5] rounded-xl p-8 flex flex-col items-center justify-center gap-2 bg-[#f3f4f5]/50 hover:bg-[#f3f4f5] transition-colors cursor-pointer active:scale-[0.98]">
                    <span className="material-symbols-outlined text-[#00327d] text-[40px]">upload_file</span>
                    {fileName
                      ? <p className="font-bold text-[#00327d] text-center break-all">{fileName}</p>
                      : <><p className="font-bold text-[#191c1d]">클릭하여 파일 선택</p><p className="text-sm text-[#434653]">PDF, DOCX, PPTX, ZIP (최대 50MB)</p></>
                    }
                  </div>
                  <input ref={fileRef} type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.docx,.pptx,.zip,.hwp" />
                </div>

                <div className="flex items-center gap-3 text-[#737784] text-sm">
                  <div className="flex-1 h-px bg-[#e1e3e4]" /><span>또는</span><div className="flex-1 h-px bg-[#e1e3e4]" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#434653]">링크로 제출</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#737784] text-[20px]">link</span>
                    <input type="url" value={link} onChange={e => setLink(e.target.value)}
                      placeholder="https://docs.google.com/..."
                      className="w-full bg-[#f3f4f5] border border-[#c3c6d5] rounded-xl pl-12 pr-4 py-3 focus:border-[#00327d] focus:ring-1 focus:ring-[#00327d] outline-none transition-all" />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 하단 버튼 */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-md border-t border-[#e1e3e4]">
            {isReadOnly ? (
              <button onClick={() => setEditMode(true)}
                className="w-full bg-[#00327d] text-white h-14 rounded-xl font-bold text-lg flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg">
                <span className="material-symbols-outlined">edit</span> 수정하기
              </button>
            ) : (
              <div className="flex gap-3">
                {existing && (
                  <button onClick={() => setEditMode(false)}
                    className="h-14 px-5 bg-[#e7e8e9] text-[#434653] rounded-xl font-bold active:scale-95 transition-all">
                    취소
                  </button>
                )}
                <button onClick={handleSubmit} disabled={isPending || !hasInput}
                  className="flex-1 bg-[#0047ab] text-white h-14 rounded-xl font-bold text-lg flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg disabled:opacity-50">
                  {isPending
                    ? <><span className="material-symbols-outlined animate-spin">progress_activity</span> 처리 중...</>
                    : <><span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        {existing ? '수정 완료' : '제출하기'}</>
                  }
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </SlideOverBase>
  );
}
