'use client';

import { useState, useEffect, useTransition } from 'react';
import { useModal } from './ModalContext';
import SlideOverBase from './SlideOverBase';
import { getAssignmentSubmissions } from '@/actions/assignments';

type Submission = {
  id: number; participantName: string; team: string; track: string;
  link: string | null; fileName: string | null; fileData: string | null; content: string | null;
  submittedAt: string;
};

export default function AssignmentSubmissionsSlideOver() {
  const { openModal, closeModal, selectedAssignment } = useModal();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isPending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    if (openModal !== 'assignmentSubmissions' || !selectedAssignment) return;
    setSubmissions([]); setExpanded(null);
    startTransition(async () => {
      const data = await getAssignmentSubmissions(selectedAssignment.id);
      setSubmissions(data as Submission[]);
    });
  }, [openModal, selectedAssignment?.id]);

  return (
    <SlideOverBase
      isOpen={openModal === 'assignmentSubmissions'}
      onClose={closeModal}
      title="제출 현황"
    >
      {selectedAssignment && (
        <div className="flex flex-col h-full">
          {/* 과제 요약 */}
          <div className="px-6 pt-4 pb-3 border-b border-[#e1e3e4] bg-[#f3f4f5]">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold bg-[#dae2ff] text-[#001946] px-2 py-0.5 rounded">{selectedAssignment.week}회차</span>
              <span className="text-xs font-bold bg-[#8cf5e4] text-[#00201c] px-2 py-0.5 rounded">{submissions.length}명 제출</span>
            </div>
            <p className="font-bold text-[#191c1d]">{selectedAssignment.title}</p>
            <p className="text-xs text-[#737784]">마감일: {selectedAssignment.deadline}</p>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
            {isPending && (
              <div className="flex items-center justify-center py-16 text-[#737784]">
                <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span> 불러오는 중...
              </div>
            )}

            {!isPending && submissions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-[#737784] gap-3">
                <span className="material-symbols-outlined text-[48px]">inbox</span>
                <p className="font-semibold">아직 제출된 과제가 없습니다.</p>
              </div>
            )}

            {submissions.map(s => (
              <div key={s.id} className="bg-white border border-[#e1e3e4] rounded-xl overflow-hidden shadow-sm">
                {/* 헤더 행 */}
                <button
                  onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#f3f4f5] transition-colors text-left"
                >
                  <div className="w-9 h-9 rounded-full bg-[#dae2ff] text-[#00327d] font-bold flex items-center justify-center flex-shrink-0">
                    {s.participantName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#191c1d]">{s.participantName}</p>
                    <p className="text-xs text-[#737784] truncate">
                      {s.team || '직무 미설정'} · {s.track || '지원분야 미설정'}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-[#737784]">{s.submittedAt}</p>
                    <div className="flex items-center gap-1 justify-end mt-0.5">
                      {s.content  && <span className="material-symbols-outlined text-[14px] text-[#434653]">description</span>}
                      {s.fileName && <span className="material-symbols-outlined text-[14px] text-[#434653]">attach_file</span>}
                      {s.link     && <span className="material-symbols-outlined text-[14px] text-[#434653]">link</span>}
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[#737784] text-[20px] flex-shrink-0 transition-transform" style={{ transform: expanded === s.id ? 'rotate(180deg)' : '' }}>
                    expand_more
                  </span>
                </button>

                {/* 펼친 내용 */}
                {expanded === s.id && (
                  <div className="border-t border-[#e1e3e4] px-4 py-4 space-y-3 bg-[#f9fafb]">
                    {s.content && (
                      <div>
                        <p className="text-xs font-semibold text-[#737784] mb-1">제출 본문</p>
                        <p className="text-sm text-[#191c1d] whitespace-pre-line bg-white rounded-lg px-3 py-2 border border-[#e1e3e4]">{s.content}</p>
                      </div>
                    )}
                    {s.fileName && (
                      s.fileData ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // base64 data URL → Blob → 실제 다운로드
                            try {
                              const [meta, b64] = s.fileData!.split(',');
                              const mime = meta.match(/:(.*?);/)?.[1] ?? 'application/octet-stream';
                              const bytes = atob(b64);
                              const arr = new Uint8Array(bytes.length);
                              for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
                              const blob = new Blob([arr], { type: mime });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = s.fileName!;
                              document.body.appendChild(a);
                              a.click();
                              a.remove();
                              URL.revokeObjectURL(url);
                            } catch {
                              // 변환 실패 시 data URL 직접 열기
                              window.open(s.fileData!, '_blank');
                            }
                          }}
                          className="flex items-center gap-2 bg-[#dae2ff] rounded-lg px-3 py-2 hover:bg-[#b8c5f2] transition-colors w-full text-left"
                        >
                          <span className="material-symbols-outlined text-[#00327d] text-[18px]">download</span>
                          <span className="text-sm text-[#00327d] font-semibold truncate">{s.fileName}</span>
                          <span className="text-xs text-[#434653] ml-auto flex-shrink-0">다운로드</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 bg-[#e7e8e9] rounded-lg px-3 py-2">
                          <span className="material-symbols-outlined text-[#737784] text-[18px]">attach_file</span>
                          <span className="text-sm text-[#434653] font-semibold truncate">{s.fileName}</span>
                          <span className="text-xs text-[#737784] ml-auto flex-shrink-0">파일 데이터 없음</span>
                        </div>
                      )
                    )}
                    {s.link && (
                      <div className="flex items-center gap-2 bg-[#dae2ff] rounded-lg px-3 py-2">
                        <span className="material-symbols-outlined text-[#00327d] text-[18px]">link</span>
                        <a
                          href={s.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-sm text-[#00327d] underline truncate font-semibold"
                        >
                          {s.link}
                        </a>
                      </div>
                    )}
                    {!s.content && !s.fileName && !s.link && (
                      <p className="text-sm text-[#737784] text-center py-2">제출 내용 없음</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </SlideOverBase>
  );
}
