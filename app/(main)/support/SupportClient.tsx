'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import SlideOverBase from '@/components/Modals/SlideOverBase';
import {
  createSupportRequest, deleteSupportRequest, updateSupportRequest,
  updateSupportStatus, getSupportComments, addSupportComment, deleteSupportComment,
} from '@/actions/support';

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_CONTENT = 2000;
const ACCEPTED = '.jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.hwp,.hwpx';

const STATUS_CONFIG: Record<string, { bg: string; text: string; icon: string }> = {
  '검토중':   { bg: 'bg-[#dae2ff]', text: 'text-[#001946]', icon: 'hourglass_empty' },
  '수정요청': { bg: 'bg-[#FFE0B2]', text: 'text-[#E65100]', icon: 'edit_note' },
  '승인완료': { bg: 'bg-[#DCFCE7]', text: 'text-[#16A34A]', icon: 'check_circle' },
};
const STATUS_LIST = ['검토중', '수정요청', '승인완료'];

interface Request {
  id: number; title: string; content: string;
  authorId: string; authorName: string; status: string;
  fileUrl: string | null; fileName: string | null;
  comments: number; date: string;
}
interface Comment {
  id: number; authorName: string; authorId: string; content: string;
  fileUrl: string | null; fileName: string | null; createdAt: string;
}
interface Props {
  initialRequests: Request[];
  isAdmin: boolean;
  currentUserId: string;
}

function FileAttachment({ url, name }: { url: string; name: string | null }) {
  const isImage = url.startsWith('data:image');
  if (isImage) {
    return (
      <div className="mt-3 rounded-xl overflow-hidden border border-[#e1e3e4] max-h-60">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt="첨부 이미지" className="w-full object-cover" />
      </div>
    );
  }
  return (
    <a href={url} download={name ?? '첨부파일'}
      className="mt-3 flex items-center gap-3 px-4 py-3 bg-[#f3f4f5] border border-[#c3c6d5] rounded-xl hover:bg-[#e7e8e9] transition-colors group"
      onClick={e => e.stopPropagation()}
    >
      <span className="material-symbols-outlined text-[#0047ab] text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
        {name?.endsWith('.pdf') ? 'picture_as_pdf' : 'description'}
      </span>
      <span className="flex-1 text-sm font-semibold text-[#191c1d] truncate">{name ?? '첨부파일'}</span>
      <span className="material-symbols-outlined text-[#737784] group-hover:text-[#0047ab] transition-colors text-[18px]">download</span>
    </a>
  );
}

function FileUploadInput({ onFile, onClear, fileName, compact }: {
  onFile: (url: string, name: string) => void;
  onClear: () => void;
  fileName: string | null;
  compact?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) { alert('파일 크기는 최대 5MB입니다.'); return; }
    setLoading(true);
    const reader = new FileReader();
    reader.onload = () => { onFile(reader.result as string, file.name); setLoading(false); };
    reader.readAsDataURL(file);
  };
  return (
    <div>
      {fileName ? (
        <div className="flex items-center gap-2 px-4 py-2 bg-[#dae2ff] border border-[#00327d]/20 rounded-xl text-sm">
          <span className="material-symbols-outlined text-[#00327d] text-[18px]">attach_file</span>
          <span className="flex-1 truncate text-[#191c1d] font-semibold">{fileName}</span>
          <button onClick={onClear} className="text-[#737784] hover:text-[#E63946] transition-colors">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      ) : compact ? (
        <button onClick={() => ref.current?.click()}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-dashed border-[#c3c6d5] rounded-xl text-sm text-[#737784] hover:border-[#00327d] hover:text-[#00327d] transition-colors"
          disabled={loading}
        >
          <span className="material-symbols-outlined text-[18px]">{loading ? 'hourglass_empty' : 'attach_file'}</span>
          {loading ? '파일 로딩 중...' : '파일 첨부 (최대 5MB)'}
        </button>
      ) : (
        <div onClick={() => ref.current?.click()}
          className="border-2 border-dashed border-[#c3c6d5] rounded-xl p-8 flex flex-col items-center justify-center gap-2 bg-[#f3f4f5]/50 hover:bg-[#f3f4f5] transition-colors cursor-pointer active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-[#00327d] text-[40px]">upload_file</span>
          <p className="font-bold text-[#191c1d]">클릭하여 파일 선택</p>
          <p className="text-sm text-[#434653]">JPG·PNG·GIF·PDF·DOC·HWP·HWPX (최대 5MB)</p>
        </div>
      )}
      <input ref={ref} type="file" accept={ACCEPTED} className="hidden" onChange={handleChange} />
    </div>
  );
}

export default function SupportClient({ initialRequests, isAdmin, currentUserId }: Props) {
  const [requests, setRequests] = useState<Request[]>(initialRequests);

  // Detail slide-over
  const [selected, setSelected]           = useState<Request | null>(null);
  const [comments, setComments]           = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);

  // Write slide-over
  const [showWrite, setShowWrite] = useState(false);
  const [wTitle, setWTitle]       = useState('');
  const [wContent, setWContent]   = useState('');
  const [wFileUrl, setWFileUrl]   = useState<string | null>(null);
  const [wFileName, setWFileName] = useState<string | null>(null);
  const [wError, setWError]       = useState('');

  // Edit mode (inside detail slide-over)
  const [editMode, setEditMode]     = useState(false);
  const [eTitle, setETitle]         = useState('');
  const [eContent, setEContent]     = useState('');
  const [eFileUrl, setEFileUrl]     = useState<string | null>(null);
  const [eFileName, setEFileName]   = useState<string | null>(null);
  const [eClearFile, setEClearFile] = useState(false);
  const [eError, setEError]         = useState('');

  // Comment form (inside detail slide-over)
  const [cContent, setCContent] = useState('');
  const [cFileUrl, setCFileUrl] = useState<string | null>(null);
  const [cFileName, setCFileName] = useState<string | null>(null);

  // List controls
  const [searchQuery, setSearchQuery]     = useState('');
  const [filterAuthor, setFilterAuthor]   = useState('전체');
  const [dropdownOpen, setDropdownOpen]   = useState(false);
  const [dropdownSearch, setDropdownSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isPending, startTransition] = useTransition();
  const { showToast } = useApp();
  const router = useRouter();

  const authorNames = isAdmin
    ? ['전체', ...Array.from(new Set(requests.map(r => r.authorName)))]
    : [];

  const filteredDropdownNames = authorNames.filter(n =>
    n === '전체' || n.toLowerCase().includes(dropdownSearch.toLowerCase())
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
        setDropdownSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = requests
    .filter(r => !searchQuery || r.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(r => !isAdmin || filterAuthor === '전체' || r.authorName === filterAuthor);

  // ── Actions ──

  const openDetail = async (req: Request) => {
    setCContent(''); setCFileUrl(null); setCFileName(null);
    setSelected(req);
    setCommentsLoading(true);
    const data = await getSupportComments(req.id);
    setComments(data);
    setCommentsLoading(false);
  };

  const closeDetail = () => {
    setSelected(null);
    setComments([]);
    setCContent(''); setCFileUrl(null); setCFileName(null);
    setEditMode(false); setETitle(''); setEContent('');
    setEFileUrl(null); setEFileName(null); setEClearFile(false); setEError('');
  };

  const enterEdit = (req: Request) => {
    setETitle(req.title);
    setEContent(req.content);
    setEFileUrl(req.fileUrl);
    setEFileName(req.fileName);
    setEClearFile(false);
    setEError('');
    setEditMode(true);
  };

  const handleSaveEdit = () => {
    if (!selected) return;
    if (!eTitle.trim() || !eContent.trim()) { setEError('제목과 내용을 입력해주세요.'); return; }
    if (eContent.length > MAX_CONTENT) { setEError(`내용은 ${MAX_CONTENT}자를 초과할 수 없습니다.`); return; }
    setEError('');
    startTransition(async () => {
      const fd = new FormData();
      fd.append('id', String(selected.id));
      fd.append('title', eTitle.trim());
      fd.append('content', eContent.trim());
      if (eClearFile) {
        fd.append('clearFile', 'true');
      } else if (eFileUrl && eFileUrl !== selected.fileUrl) {
        fd.append('fileUrl', eFileUrl);
        fd.append('fileName', eFileName ?? '');
      }
      const result = await updateSupportRequest(fd);
      if (result.success) {
        const updated: Request = {
          ...selected,
          title: eTitle.trim(),
          content: eContent.trim(),
          fileUrl: eClearFile ? null : (eFileUrl !== selected.fileUrl ? eFileUrl : selected.fileUrl),
          fileName: eClearFile ? null : (eFileUrl !== selected.fileUrl ? eFileName : selected.fileName),
        };
        setSelected(updated);
        setRequests(prev => prev.map(r => r.id === selected.id ? { ...r, title: updated.title } : r));
        setEditMode(false);
        showToast('수정되었습니다 ✓');
      } else {
        setEError(result.error ?? '오류가 발생했습니다.');
      }
    });
  };

  const resetWrite = () => {
    setWTitle(''); setWContent(''); setWFileUrl(null); setWFileName(null); setWError('');
  };

  const handleSubmitWrite = () => {
    if (!wTitle.trim() || !wContent.trim()) { setWError('제목과 내용을 입력해주세요.'); return; }
    if (wContent.length > MAX_CONTENT) { setWError(`내용은 ${MAX_CONTENT}자를 초과할 수 없습니다.`); return; }
    setWError('');
    startTransition(async () => {
      const fd = new FormData();
      fd.append('title', wTitle.trim());
      fd.append('content', wContent.trim());
      if (wFileUrl)  fd.append('fileUrl', wFileUrl);
      if (wFileName) fd.append('fileName', wFileName);
      const result = await createSupportRequest(fd);
      if (result.success) {
        showToast('서류가 제출되었습니다 ✓');
        resetWrite();
        setShowWrite(false);
        router.refresh();
      } else {
        setWError(result.error ?? '오류가 발생했습니다.');
      }
    });
  };

  const handleDelete = (req: Request) => {
    if (!confirm(`"${req.title}" 게시글을 삭제하시겠습니까?`)) return;
    startTransition(async () => {
      const result = await deleteSupportRequest(req.id);
      if (result.success) {
        showToast('삭제되었습니다.');
        if (selected?.id === req.id) closeDetail();
        router.refresh();
      } else {
        showToast('삭제 중 오류가 발생했습니다.');
      }
    });
  };

  const handleStatusChange = (status: string) => {
    if (!selected) return;
    startTransition(async () => {
      const result = await updateSupportStatus(selected.id, status);
      if (result.success) {
        setSelected(prev => prev ? { ...prev, status } : null);
        setRequests(prev => prev.map(r => r.id === selected.id ? { ...r, status } : r));
        showToast('상태가 변경되었습니다.');
      }
    });
  };

  const handleAddComment = () => {
    if (!cContent.trim() || !selected) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.append('requestId', String(selected.id));
      fd.append('content', cContent.trim());
      if (cFileUrl)  fd.append('fileUrl', cFileUrl);
      if (cFileName) fd.append('fileName', cFileName);
      const result = await addSupportComment(fd);
      if (result.success) {
        setCContent(''); setCFileUrl(null); setCFileName(null);
        const data = await getSupportComments(selected.id);
        setComments(data);
        setRequests(prev => prev.map(r => r.id === selected.id ? { ...r, comments: r.comments + 1 } : r));
      } else {
        showToast(result.error ?? '오류가 발생했습니다.');
      }
    });
  };

  const handleDeleteComment = (c: Comment) => {
    if (!selected) return;
    startTransition(async () => {
      await deleteSupportComment(c.id, selected.id);
      const data = await getSupportComments(selected.id);
      setComments(data);
      setRequests(prev => prev.map(r => r.id === selected.id ? { ...r, comments: Math.max(0, r.comments - 1) } : r));
    });
  };

  const statusCfg = (s: string) => STATUS_CONFIG[s] ?? STATUS_CONFIG['검토중'];

  // ── Render ──
  return (
    <>
      {/* ════════════════════ LIST PAGE ════════════════════ */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-10">

        {/* Header */}
        <header className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#191c1d]" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>지원금관리</h1>
            <p className="text-[#434653] mt-1">서류를 제출하고 검토 현황을 확인하세요.</p>
          </div>
          {!isAdmin && (
            <button onClick={() => setShowWrite(true)}
              className="hidden md:flex items-center gap-2 bg-[#00327d] text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg hover:bg-[#0047ab] transition-all active:scale-95">
              <span className="material-symbols-outlined">upload_file</span>
              서류 제출
            </button>
          )}
        </header>

        {/* Hero Banner */}
        <section className="bg-gradient-to-br from-[#eef2ff] to-[#f0f9ff] rounded-2xl px-8 py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-sm border border-[#dae2ff] mb-6">
          <div className="flex flex-col justify-center gap-4">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#191c1d] leading-tight" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>
              {isAdmin ? '참여자 서류를\n한눈에 관리하세요.' : '서류를 제출하고\n검토 결과를 확인하세요.'}
            </h2>
            <p className="text-[#434653] text-base md:text-lg leading-relaxed">
              {isAdmin
                ? '참여자별 제출 서류를 검토하고 승인 현황을 관리할 수 있습니다.'
                : '지원금 관련 서류를 제출하고 담당자의 피드백을 받아보세요.'}
            </p>
          </div>
          <div className="flex-shrink-0 flex justify-center md:justify-end">
            <span className="material-symbols-outlined text-[#00327d] opacity-20" style={{ fontSize: '160px', fontVariationSettings: "'FILL' 1" }}>
              folder_managed
            </span>
          </div>
        </section>

        {/* Search & filter row */}
        <div className="flex flex-col md:flex-row gap-3 mb-3">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#737784]">search</span>
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="제목으로 검색"
              className="w-full bg-white border border-[#c3c6d5] focus:border-[#00327d] rounded-lg pl-12 pr-10 py-3 outline-none transition-all text-sm"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#737784] hover:text-[#191c1d]">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>

          {isAdmin && (
            <div className="relative flex-shrink-0" ref={dropdownRef}>
              <button
                onClick={() => { setDropdownOpen(o => !o); setDropdownSearch(''); }}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-semibold transition-colors whitespace-nowrap ${
                  filterAuthor !== '전체'
                    ? 'bg-[#00327d] text-white border-[#00327d]'
                    : 'bg-white text-[#434653] border-[#c3c6d5] hover:border-[#00327d]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">person_search</span>
                {filterAuthor === '전체' ? '전체 참여자' : filterAuthor}
                <span className="material-symbols-outlined text-[18px]">
                  {dropdownOpen ? 'expand_less' : 'expand_more'}
                </span>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-60 bg-white border border-[#e1e3e4] rounded-2xl shadow-xl z-50 overflow-hidden">
                  <div className="p-3 border-b border-[#e1e3e4]">
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#737784] text-[16px]">search</span>
                      <input autoFocus value={dropdownSearch} onChange={e => setDropdownSearch(e.target.value)}
                        placeholder="참여자 이름 검색"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-[#f3f4f5] rounded-lg outline-none focus:bg-white focus:ring-1 focus:ring-[#00327d] transition-all"
                      />
                    </div>
                  </div>
                  <ul className="max-h-56 overflow-y-auto py-1">
                    {filteredDropdownNames.length === 0 ? (
                      <li className="px-4 py-3 text-sm text-[#737784] text-center">검색 결과 없음</li>
                    ) : filteredDropdownNames.map(n => (
                      <li key={n}>
                        <button
                          onClick={() => { setFilterAuthor(n); setDropdownOpen(false); setDropdownSearch(''); }}
                          className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors flex items-center justify-between ${
                            filterAuthor === n ? 'bg-[#dae2ff] text-[#001946]' : 'text-[#434653] hover:bg-[#f3f4f5]'
                          }`}
                        >
                          {n === '전체' ? '전체 참여자' : n}
                          {filterAuthor === n && <span className="material-symbols-outlined text-[16px] text-[#00327d]">check</span>}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
        <p className="text-xs text-[#737784] mb-4">
          총 제출 건수: <span className="font-semibold text-[#434653]">{filtered.length}건</span>
        </p>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-[#737784]">
            <span className="material-symbols-outlined text-[48px] block mb-2">folder_open</span>
            <p className="font-semibold">제출된 서류가 없습니다.</p>
            {!isAdmin && <p className="text-sm mt-1">상단의 &apos;서류 제출&apos; 버튼을 눌러 제출해 보세요.</p>}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-[#e1e3e4] overflow-hidden">
            {filtered.map((req, idx) => {
              const cfg = statusCfg(req.status);
              const canDel = isAdmin || req.authorId === currentUserId;
              const isActive = selected?.id === req.id;
              return (
                <div key={req.id}
                  onClick={() => openDetail(req)}
                  className={`cursor-pointer flex items-center gap-4 px-5 py-4 transition-colors ${idx < filtered.length - 1 ? 'border-b border-[#e1e3e4]' : ''} ${
                    isActive ? 'bg-[#eef2ff]' : 'hover:bg-[#f8f9ff]'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    {/* 1행: 상태 배지 — 참여자 이름 — 제목 */}
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`flex items-center gap-0.5 text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${cfg.bg} ${cfg.text}`}>
                        <span className="material-symbols-outlined text-[12px]">{cfg.icon}</span>
                        {req.status}
                      </span>
                      {isAdmin && (
                        <span className="text-[15px] font-extrabold text-[#191c1d] flex-shrink-0">{req.authorName}</span>
                      )}
                      <span className="text-sm text-[#434653] truncate">{req.title}</span>
                      {req.fileUrl && (
                        <span className="text-xs text-[#0047ab] flex items-center gap-0.5 flex-shrink-0">
                          <span className="material-symbols-outlined text-[12px]">attach_file</span>첨부
                        </span>
                      )}
                    </div>
                    {/* 2행: 날짜 + 댓글 수 */}
                    <div className="flex items-center gap-3 text-xs text-[#9ea3ae]">
                      <span>{req.date}</span>
                      <span className="flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[12px]">chat_bubble</span>
                        {req.comments}
                      </span>
                    </div>
                  </div>
                  {canDel && (
                    <button onClick={e => { e.stopPropagation(); handleDelete(req); }} disabled={isPending}
                      className="flex-shrink-0 bg-[#E63946] text-white text-xs px-3 py-1 rounded-lg font-bold hover:opacity-90 transition-all disabled:opacity-50">
                      삭제
                    </button>
                  )}
                  <span className="material-symbols-outlined text-[#737784] hidden md:block">chevron_right</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Mobile FAB */}
        {!isAdmin && (
          <button onClick={() => setShowWrite(true)}
            className="md:hidden fixed bottom-20 right-4 bg-[#00327d] text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center z-40 active:scale-90 transition-transform">
            <span className="material-symbols-outlined text-[28px]">upload_file</span>
          </button>
        )}
      </div>

      {/* ════════════════════ WRITE SLIDE-OVER ════════════════════ */}
      <SlideOverBase isOpen={showWrite} onClose={() => { resetWrite(); setShowWrite(false); }} title="서류 제출">
        <div className="flex flex-col min-h-[70vh] md:min-h-0 md:h-full">
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 pb-28">
            {wError && (
              <div className="bg-[#ffdad6] text-[#93000a] text-sm px-4 py-3 rounded-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                {wError}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#434653]">제목</label>
              <input type="text" value={wTitle} onChange={e => setWTitle(e.target.value)}
                placeholder="제목을 입력해 주세요"
                className="w-full bg-[#f3f4f5] border border-[#c3c6d5] rounded-xl px-4 py-4 text-lg focus:border-[#00327d] focus:ring-1 focus:ring-[#00327d] outline-none transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-[#434653]">내용</label>
              <textarea value={wContent} onChange={e => setWContent(e.target.value)} maxLength={MAX_CONTENT}
                placeholder="내용을 입력해 주세요."
                rows={8}
                className="w-full bg-[#f3f4f5] border border-[#c3c6d5] rounded-xl px-4 py-3 focus:border-[#00327d] focus:ring-1 focus:ring-[#00327d] outline-none transition-all resize-none"
              />
              <div className={`flex justify-end text-xs ${wContent.length >= MAX_CONTENT ? 'text-[#b7102a] font-bold' : 'text-[#737784]'}`}>
                {wContent.length}/{MAX_CONTENT}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#434653]">
                파일 첨부 <span className="font-normal text-[#737784]">(선택)</span>
              </label>
              <FileUploadInput
                onFile={(url, name) => { setWFileUrl(url); setWFileName(name); }}
                onClear={() => { setWFileUrl(null); setWFileName(null); }}
                fileName={wFileName}
              />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md border-t border-[#e1e3e4]">
            <button onClick={handleSubmitWrite} disabled={isPending || !wTitle.trim() || !wContent.trim()}
              className="w-full bg-[#0047ab] text-white h-14 rounded-xl font-bold text-lg flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg disabled:opacity-50">
              {isPending
                ? <><span className="material-symbols-outlined animate-spin">progress_activity</span>제출 중...</>
                : <><span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>제출 완료</>
              }
            </button>
          </div>
        </div>
      </SlideOverBase>

      {/* ════════════════════ DETAIL SLIDE-OVER ════════════════════ */}
      <SlideOverBase isOpen={!!selected} onClose={closeDetail} title={selected?.title ?? ''}>
        {selected && (() => {
          const cfg = statusCfg(selected.status);
          const canDelete = isAdmin || selected.authorId === currentUserId;
          return (
            <div className="flex flex-col min-h-[70vh] md:min-h-0 md:h-full">
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 pb-6">

                {/* 상태 배지 + 수정/삭제 버튼 */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                      <span className="material-symbols-outlined text-[14px]">{cfg.icon}</span>
                      {selected.status}
                    </span>
                    {isAdmin && !editMode && (
                      <div className="flex gap-1 flex-wrap">
                        {STATUS_LIST.filter(s => s !== selected.status).map(s => (
                          <button key={s} onClick={() => handleStatusChange(s)} disabled={isPending}
                            className={`text-xs px-2.5 py-1 rounded-full border font-semibold transition-colors hover:opacity-90 ${statusCfg(s).bg} ${statusCfg(s).text} disabled:opacity-50`}>
                            → {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {/* 수정 버튼 — 참여자 본인 글만 (관리자 제외) */}
                    {!isAdmin && selected.authorId === currentUserId && !editMode && (
                      <button onClick={() => enterEdit(selected)} disabled={isPending}
                        className="flex items-center gap-1 text-xs bg-[#dae2ff] text-[#001946] hover:bg-[#00327d] hover:text-white px-3 py-1.5 rounded-lg font-bold transition-colors disabled:opacity-50">
                        <span className="material-symbols-outlined text-[14px]">edit</span>
                        수정
                      </button>
                    )}
                    {editMode && (
                      <button onClick={() => setEditMode(false)} disabled={isPending}
                        className="flex items-center gap-1 text-xs bg-[#e7e8e9] text-[#434653] hover:bg-[#c3c6d5] px-3 py-1.5 rounded-lg font-bold transition-colors disabled:opacity-50">
                        <span className="material-symbols-outlined text-[14px]">close</span>
                        취소
                      </button>
                    )}
                    {canDelete && !editMode && (
                      <button onClick={() => handleDelete(selected)} disabled={isPending}
                        className="flex items-center gap-1 text-xs bg-[#ffdad6] text-[#93000a] hover:bg-[#ba1a1a] hover:text-white px-3 py-1.5 rounded-lg font-bold transition-colors disabled:opacity-50">
                        <span className="material-symbols-outlined text-[14px]">delete</span>
                        삭제
                      </button>
                    )}
                  </div>
                </div>

                {/* 메타 정보 */}
                <div className="flex items-center gap-3 text-xs text-[#737784] -mt-2">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">person</span>
                    {selected.authorName}
                  </span>
                  <span className="w-px h-3 bg-[#c3c6d5]" />
                  <span>{selected.date}</span>
                </div>

                {/* 편집 모드 */}
                {editMode ? (
                  <div className="space-y-4">
                    {eError && (
                      <div className="bg-[#ffdad6] text-[#93000a] text-sm px-4 py-3 rounded-lg flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">error</span>
                        {eError}
                      </div>
                    )}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#434653]">제목</label>
                      <input type="text" value={eTitle} onChange={e => setETitle(e.target.value)}
                        className="w-full bg-[#f3f4f5] border border-[#c3c6d5] rounded-xl px-4 py-3 text-sm focus:border-[#00327d] focus:ring-1 focus:ring-[#00327d] outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#434653]">내용</label>
                      <textarea value={eContent} onChange={e => setEContent(e.target.value)} maxLength={MAX_CONTENT}
                        rows={7}
                        className="w-full bg-[#f3f4f5] border border-[#c3c6d5] rounded-xl px-4 py-3 text-sm focus:border-[#00327d] focus:ring-1 focus:ring-[#00327d] outline-none transition-all resize-none"
                      />
                      <div className={`flex justify-end text-xs ${eContent.length >= MAX_CONTENT ? 'text-[#b7102a] font-bold' : 'text-[#737784]'}`}>
                        {eContent.length}/{MAX_CONTENT}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-[#434653]">첨부파일</label>
                      {/* 기존 파일 표시 */}
                      {(eFileUrl && !eClearFile) ? (
                        <div className="flex items-center gap-2 px-4 py-2 bg-[#dae2ff] border border-[#00327d]/20 rounded-xl text-sm">
                          <span className="material-symbols-outlined text-[#00327d] text-[18px]">attach_file</span>
                          <span className="flex-1 truncate text-[#191c1d] font-semibold">{eFileName ?? '첨부파일'}</span>
                          <button onClick={() => { setEClearFile(true); setEFileUrl(null); setEFileName(null); }}
                            className="text-[#737784] hover:text-[#E63946] transition-colors">
                            <span className="material-symbols-outlined text-[18px]">close</span>
                          </button>
                        </div>
                      ) : (
                        <FileUploadInput
                          onFile={(url, name) => { setEFileUrl(url); setEFileName(name); setEClearFile(false); }}
                          onClear={() => { setEFileUrl(null); setEFileName(null); }}
                          fileName={eFileName}
                        />
                      )}
                    </div>
                    <button onClick={handleSaveEdit} disabled={isPending || !eTitle.trim() || !eContent.trim()}
                      className="w-full bg-[#0047ab] text-white h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm disabled:opacity-50">
                      {isPending
                        ? <><span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>저장 중...</>
                        : <><span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>수정 완료</>
                      }
                    </button>
                  </div>
                ) : (
                  /* 본문 (읽기 모드) */
                  <div className="bg-[#f8f9fa] rounded-xl p-5">
                    <p className="text-[#434653] leading-relaxed whitespace-pre-wrap text-[15px]">{selected.content}</p>
                    {selected.fileUrl && <FileAttachment url={selected.fileUrl} name={selected.fileName} />}
                  </div>
                )}

                {/* 댓글 — 편집 모드에서는 숨김 */}
                {editMode && <div className="border-t border-[#e1e3e4]" />}
                {!editMode && <div className="border-t border-[#e1e3e4]" />

                {/* 댓글 목록 — 편집 모드에서는 숨김 */}
                <div className={editMode ? 'hidden' : ''}>
                  <h3 className="font-bold text-[#191c1d] mb-4 flex items-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-[#00327d] text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>chat_bubble</span>
                    댓글 {comments.length}개
                  </h3>

                  {commentsLoading ? (
                    <div className="py-8 text-center text-[#737784] text-sm flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                      불러오는 중...
                    </div>
                  ) : comments.length === 0 ? (
                    <div className="py-6 text-center text-[#737784] text-sm">아직 댓글이 없습니다.</div>
                  ) : (
                    <div className="space-y-3">
                      {comments.map(c => {
                        const canDelC = isAdmin || c.authorId === currentUserId;
                        const isAdminComment = c.authorId === 'admin' || c.authorName.includes('관리자');
                        return (
                          <div key={c.id} className={`rounded-xl p-4 ${isAdminComment ? 'bg-[#eef2ff] border border-[#dae2ff]' : 'bg-[#f8f9fa] border border-[#e1e3e4]'}`}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isAdminComment ? 'bg-[#00327d] text-white' : 'bg-[#e7e8e9] text-[#434653]'}`}>
                                  {c.authorName}
                                </span>
                                <span className="text-xs text-[#737784]">{c.createdAt}</span>
                              </div>
                              {canDelC && (
                                <button onClick={() => handleDeleteComment(c)} disabled={isPending}
                                  className="text-[#737784] hover:text-[#E63946] transition-colors">
                                  <span className="material-symbols-outlined text-[16px]">close</span>
                                </button>
                              )}
                            </div>
                            <p className="text-sm text-[#434653] whitespace-pre-wrap">{c.content}</p>
                            {c.fileUrl && <FileAttachment url={c.fileUrl} name={c.fileName} />}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 댓글 입력 — 편집 모드에서는 숨김 */}
                <div className={`border-t border-[#e1e3e4] pt-4${editMode ? ' hidden' : ''}`}>
                  <textarea
                    value={cContent} onChange={e => setCContent(e.target.value)}
                    placeholder="댓글을 입력하세요..."
                    rows={3}
                    className="w-full bg-[#f3f4f5] border border-[#c3c6d5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00327d] focus:ring-1 focus:ring-[#00327d] resize-none mb-3 transition-all"
                  />
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <FileUploadInput compact
                      onFile={(url, name) => { setCFileUrl(url); setCFileName(name); }}
                      onClear={() => { setCFileUrl(null); setCFileName(null); }}
                      fileName={cFileName}
                    />
                    <button onClick={handleAddComment} disabled={isPending || !cContent.trim()}
                      className="flex items-center gap-2 bg-[#00327d] text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-[#0047ab] transition-colors disabled:opacity-50 active:scale-95">
                      {isPending
                        ? <><span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>등록 중</>
                        : <><span className="material-symbols-outlined text-[16px]">send</span>댓글 등록</>
                      }
                    </button>
                  </div>
                </div>

              </div>
            </div>
          );
        })()}
      </SlideOverBase>
    </>
  );
}
