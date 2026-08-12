'use client';

import { useModal } from './ModalContext';
import SlideOverBase from './SlideOverBase';
import { useSession } from 'next-auth/react';
import { deleteEmploymentRecord } from '@/actions/employment';
import { useApp } from '@/contexts/AppContext';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

export default function EmploymentStatusDetailSlideOver() {
  const { openModal, closeModal, selectedEmployment, openEmploymentWrite } = useModal();
  const { data: session } = useSession();
  const { showToast } = useApp();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isAdmin = session?.user?.role === 'admin';
  const r = selectedEmployment;

  const handleDelete = () => {
    if (!r) return;
    if (!confirm(`"${r.name}" 항목을 삭제하시겠습니까?`)) return;
    startTransition(async () => {
      const result = await deleteEmploymentRecord(r.id);
      if (result.success) {
        showToast('항목이 삭제되었습니다.');
        closeModal();
        router.refresh();
      } else {
        showToast(result.error ?? '삭제 실패');
      }
    });
  };

  if (!r) return null;

  return (
    <SlideOverBase isOpen={openModal === 'employmentDetail'} onClose={closeModal} title="취업 현황 상세">
      <div className="flex flex-col gap-6 px-6 py-6">

        {/* 프로필 영역 */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#dae2ff] flex items-center justify-center text-[#00327d] text-2xl font-bold flex-shrink-0">
            {r.name[0]}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-[#191c1d]" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>
                {r.name}
              </h2>
              <span className="bg-[#dae2ff] text-[#001946] text-xs px-2 py-0.5 rounded-full font-bold">{r.cohort}</span>
            </div>
            <p className="text-sm text-[#434653] mt-0.5">
              {r.company}{r.department ? ` | ${r.department}` : ''}
            </p>
          </div>
        </div>

        <hr className="border-[#e1e3e4]" />

        {/* 취업 정보 카드 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#f3f4f5] rounded-xl p-4">
            <p className="text-xs text-[#737784] flex items-center gap-1 mb-1">
              <span className="material-symbols-outlined text-[16px] text-[#0047ab]">apartment</span>
              기업명
            </p>
            <p className="font-bold text-[#191c1d] text-sm">{r.company}</p>
          </div>
          <div className="bg-[#f3f4f5] rounded-xl p-4">
            <p className="text-xs text-[#737784] flex items-center gap-1 mb-1">
              <span className="material-symbols-outlined text-[16px] text-[#0047ab]">meeting_room</span>
              부서명
            </p>
            <p className="font-bold text-[#191c1d] text-sm">{r.department || '-'}</p>
          </div>
        </div>

        {/* 상세 내용 */}
        {r.content && (
          <div className="bg-[#f3f4f5] rounded-xl p-4 space-y-2">
            <p className="text-sm font-semibold text-[#434653] flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px] text-[#0047ab]">description</span>
              상세 내용
            </p>
            <p className="text-sm text-[#191c1d] leading-relaxed whitespace-pre-wrap">{r.content}</p>
          </div>
        )}

        {/* 등록일 */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#434653] flex items-center gap-1">
            <span className="material-symbols-outlined text-[18px] text-[#0047ab]">calendar_today</span>
            등록일
          </span>
          <span className="font-semibold text-[#191c1d]">{r.createdAt}</span>
        </div>

        {/* 버튼 영역 */}
        <div className="flex flex-col gap-2 mt-2">
          {isAdmin && (
            <div className="flex gap-2">
              <button
                onClick={() => openEmploymentWrite(r)}
                className="flex-1 bg-[#f3f4f5] border border-[#c3c6d5] rounded-xl py-3 font-semibold text-[#434653] hover:bg-[#e1e3e4] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
                수정
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 bg-[#ffdad6] border border-[#f2b8b5] rounded-xl py-3 font-semibold text-[#93000a] hover:bg-[#ffb4ab] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
                삭제
              </button>
            </div>
          )}
          <button
            onClick={closeModal}
            className="w-full border border-[#c3c6d5] rounded-xl py-3 font-semibold text-[#434653] hover:bg-[#f3f4f5] active:scale-95 transition-all"
          >
            닫기
          </button>
        </div>
      </div>
    </SlideOverBase>
  );
}
