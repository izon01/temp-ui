'use client';

import { useState, useTransition, useRef } from 'react';
import { useModal } from './ModalContext';
import { useApp } from '@/contexts/AppContext';
import SlideOverBase from './SlideOverBase';
import { createNotice } from '@/actions/notices';

const CATEGORIES = ['필독', '공지사항', '취업정보', '취업활동양식', '기타'];
const MAX = 1000;
const MAX_FILE_BYTES = 4 * 1024 * 1024; // 4MB (Vercel 서버리스 body 한도 내)

const ACCEPT = 'image/jpeg,image/png,image/gif,image/webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.hwp,.hwpx';

function NoticeDropZone({ onFile }: { onFile: (f: File) => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div>
      <div
        onClick={() => ref.current?.click()}
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={e => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) onFile(f); }}
        className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer active:scale-[0.98] ${isDragging ? 'border-[#00327d] bg-[#eef2ff]' : 'border-[#c3c6d5] bg-[#f3f4f5]/50 hover:bg-[#f3f4f5]'}`}
      >
        <span className={`material-symbols-outlined text-[36px] ${isDragging ? 'text-[#0047ab]' : 'text-[#00327d]'}`}>attach_file</span>
        <p className="text-sm text-[#434653] font-semibold">{isDragging ? '파일을 여기에 놓으세요' : '클릭하거나 파일을 드래그하세요'}</p>
        <p className="text-xs text-[#737784]">이미지 (JPG·PNG·GIF) · PDF · Word (DOC·DOCX) · 최대 4MB</p>
      </div>
      <input ref={ref} type="file" accept={ACCEPT} className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
    </div>
  );
}

function fileTypeIcon(mime: string) {
  if (mime.startsWith('image/'))       return 'image';
  if (mime === 'application/pdf')      return 'picture_as_pdf';
  return 'description';
}

function fileTypeLabel(mime: string) {
  if (mime.startsWith('image/'))       return '이미지';
  if (mime === 'application/pdf')      return 'PDF';
  if (mime.includes('word'))           return 'Word';
  return '파일';
}

export default function NoticeWriteSlideOver() {
  const { openModal, closeModal } = useModal();
  const { showToast } = useApp();
  const [title, setTitle]           = useState('');
  const [content, setContent]       = useState('');
  const [categories, setCategories] = useState<string[]>(['공지사항']);
  const [isPinned, setIsPinned]     = useState(false);
  const [fileData, setFileData]     = useState('');        // base64 dataURL
  const [fileName, setFileName]     = useState('');
  const [fileMime, setFileMime]     = useState('');
  const [fileLoading, setFileLoading] = useState(false);
  const [error, setError]           = useState('');
  const [isPending, startTransition] = useTransition();

  const toggleCategory = (cat: string) =>
    setCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);

  const reset = () => {
    setTitle(''); setContent(''); setCategories(['공지사항']);
    setIsPinned(false); setFileData(''); setFileName(''); setFileMime('');
    setFileLoading(false); setError('');
  };

  const handleFileChange = (file: File) => {
    if (file.size > MAX_FILE_BYTES) {
      setError(`파일 크기가 너무 큽니다. 최대 4MB까지 업로드 가능합니다.`);
      return;
    }

    setError('');
    setFileLoading(true);
    setFileName(file.name);
    setFileMime(file.type);

    const reader = new FileReader();
    reader.onload  = () => { setFileData(reader.result as string); setFileLoading(false); };
    reader.onerror = () => { setError('파일 읽기 오류가 발생했습니다.'); setFileLoading(false); };
    reader.readAsDataURL(file);
  };

  const removeFile = () => {
    setFileData(''); setFileName(''); setFileMime('');
  };

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) { setError('제목과 내용을 모두 입력해주세요.'); return; }
    if (content.length > MAX)             { setError(`내용은 ${MAX}자를 초과할 수 없습니다.`); return; }
    if (categories.length === 0)          { setError('카테고리를 하나 이상 선택해주세요.'); return; }
    setError('');

    startTransition(async () => {
      const formData = new FormData();
      formData.append('title',    title);
      formData.append('content',  content);
      formData.append('category', categories.join(','));
      formData.append('isPinned', String(isPinned));
      if (fileData)  formData.append('imageUrl', fileData);
      if (fileName)  formData.append('fileName', fileName);

      const result = await createNotice(formData);
      if (result.success) {
        showToast('공지가 등록되었습니다 ✓');
        reset();
        closeModal();
      } else {
        setError(result.error ?? '오류가 발생했습니다.');
      }
    });
  };

  const isImage = fileMime.startsWith('image/');

  return (
    <SlideOverBase isOpen={openModal === 'writeNotice'} onClose={() => { reset(); closeModal(); }} title="공지 등록">
      <div className="flex flex-col min-h-[70vh] md:min-h-0 md:h-full">
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 pb-28">

          {error && (
            <div className="bg-[#ffdad6] text-[#93000a] text-sm px-4 py-3 rounded-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}

          {/* 카테고리 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-[#434653]">카테고리 <span className="text-[#737784] font-normal">(복수 선택 가능)</span></label>
              {categories.length > 0 && (
                <span className="text-xs text-[#00327d] font-bold">{categories.length}개 선택됨</span>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(cat => {
                const checked = categories.includes(cat);
                return (
                  <button key={cat} type="button" onClick={() => toggleCategory(cat)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                      checked
                        ? 'bg-[#00327d] text-white border-[#00327d] shadow-sm'
                        : 'bg-[#f3f4f5] border-[#c3c6d5] text-[#434653] hover:border-[#00327d] hover:text-[#00327d]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: checked ? "'FILL' 1" : "'FILL' 0" }}>
                      {checked ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 제목 */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#434653]">제목</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="공지 제목을 입력해 주세요"
              className="w-full bg-[#f3f4f5] border border-[#c3c6d5] rounded-xl px-4 py-4 text-lg focus:border-[#00327d] focus:ring-1 focus:ring-[#00327d] outline-none transition-all"
            />
          </div>

          {/* 내용 */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-[#434653]">내용</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} maxLength={MAX}
              placeholder="공지 내용을 입력해 주세요."
              rows={8}
              className="w-full bg-[#f3f4f5] border border-[#c3c6d5] rounded-xl px-4 py-3 focus:border-[#00327d] focus:ring-1 focus:ring-[#00327d] outline-none transition-all resize-none"
            />
            <div className={`flex justify-end text-xs ${content.length >= MAX ? 'text-[#b7102a] font-bold' : 'text-[#737784]'}`}>
              {content.length}/{MAX}
            </div>
          </div>

          {/* 파일 첨부 */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#434653]">파일 첨부 <span className="text-[#737784] font-normal">(선택)</span></label>

            {fileLoading ? (
              <div className="border-2 border-dashed border-[#c3c6d5] rounded-xl p-6 flex flex-col items-center gap-2 bg-[#f3f4f5]/50">
                <span className="material-symbols-outlined text-[#00327d] text-[36px] animate-spin">progress_activity</span>
                <p className="text-sm text-[#434653] font-semibold">업로드 중...</p>
                <p className="text-xs text-[#737784]">{fileName}</p>
              </div>
            ) : fileData ? (
              <div className="border border-[#c3c6d5] rounded-xl overflow-hidden">
                {isImage ? (
                  <div className="relative">
                    <img src={fileData} alt="미리보기" className="w-full object-cover max-h-48" />
                    <button type="button" onClick={removeFile}
                      className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-black/80 transition-colors">
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 bg-[#f3f4f5]">
                    <span className="material-symbols-outlined text-[#0047ab] text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {fileTypeIcon(fileMime)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#191c1d] truncate">{fileName}</p>
                      <p className="text-xs text-[#737784]">{fileTypeLabel(fileMime)} 파일 첨부됨</p>
                    </div>
                    <button type="button" onClick={removeFile}
                      className="text-[#737784] hover:text-[#191c1d] transition-colors">
                      <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <NoticeDropZone onFile={handleFileChange} />
            )}
          </div>

          {/* 필독 고정 */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div onClick={() => setIsPinned(p => !p)}
              className={`w-12 h-6 rounded-full transition-colors relative ${isPinned ? 'bg-[#b7102a]' : 'bg-[#c3c6d5]'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${isPinned ? 'translate-x-7' : 'translate-x-1'}`} />
            </div>
            <span className="text-sm font-semibold text-[#434653]">필독 공지로 상단 고정</span>
          </label>
        </div>

        {/* 등록 버튼 */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-md border-t border-[#e1e3e4]">
          <button onClick={handleSubmit} disabled={isPending || fileLoading || !title.trim() || !content.trim()}
            className="w-full bg-[#0047ab] text-white h-14 rounded-xl font-bold text-lg flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg disabled:opacity-50"
          >
            {isPending
              ? <><span className="material-symbols-outlined animate-spin">progress_activity</span> 등록 중...</>
              : <><span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span> 등록 완료</>
            }
          </button>
        </div>
      </div>
    </SlideOverBase>
  );
}
