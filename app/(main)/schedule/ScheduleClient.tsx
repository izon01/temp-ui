'use client';

import { useState, useCallback, useRef } from 'react';
import { upsertScheduleEvent } from '@/actions/schedule';

interface Event { date: string; text: string; }

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

interface Props {
  year: number;
  month: number;
  events: Event[];
}

export default function ScheduleClient({ year: initYear, month: initMonth, events: initEvents }: Props) {
  const [year, setYear]   = useState(initYear);
  const [month, setMonth] = useState(initMonth);
  const [events, setEvents] = useState<Record<string, string>>(() => {
    const m: Record<string, string> = {};
    for (const e of initEvents) m[e.date] = e.text;
    return m;
  });
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft]     = useState('');
  const [saving, setSaving]   = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const goMonth = (delta: number) => {
    let m = month + delta;
    let y = year;
    if (m > 12) { m = 1; y++; }
    if (m < 1)  { m = 12; y--; }
    setMonth(m); setYear(y);
    setEditing(null);
  };

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDow    = new Date(year, month - 1, 1).getDay();

  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const toDateStr = (d: number) =>
    `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const openEdit = (d: number) => {
    const key = toDateStr(d);
    setEditing(key);
    setDraft(events[key] ?? '');
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const save = useCallback(async (key: string, text: string) => {
    setSaving(true);
    setEvents(prev => ({ ...prev, [key]: text }));
    await upsertScheduleEvent(key, text);
    setSaving(false);
    setEditing(null);
  }, []);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-10">
      {/* Header */}
      <section className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#191c1d]" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>일정</h1>
          <p className="text-[#434653] mt-1">월간 운영 일정을 관리하세요. 날짜를 클릭하면 일정을 입력할 수 있습니다.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => goMonth(-1)}
            className="w-9 h-9 rounded-full border border-[#c3c6d5] flex items-center justify-center hover:bg-[#f3f4f5] transition-colors">
            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
          </button>
          <span className="text-lg font-bold text-[#191c1d] min-w-[100px] text-center" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>
            {year}년 {month}월
          </span>
          <button onClick={() => goMonth(1)}
            className="w-9 h-9 rounded-full border border-[#c3c6d5] flex items-center justify-center hover:bg-[#f3f4f5] transition-colors">
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>
          <button onClick={() => { setYear(initYear); setMonth(initMonth); setEditing(null); }}
            className="ml-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#c3c6d5] hover:bg-[#f3f4f5] transition-colors text-[#434653]">
            오늘
          </button>
        </div>
      </section>

      {/* Saving indicator */}
      {saving && (
        <div className="fixed top-20 right-6 z-50 bg-[#00327d] text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
          <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
          저장 중...
        </div>
      )}

      {/* Calendar */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#e1e3e4] overflow-hidden">
        {/* Weekday header */}
        <div className="grid grid-cols-7 border-b border-[#e1e3e4]">
          {WEEKDAYS.map((d, i) => (
            <div key={d} className={`py-3 text-center text-xs font-bold ${i === 0 ? 'text-[#E63946]' : i === 6 ? 'text-[#0047ab]' : 'text-[#434653]'}`}>
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 divide-x divide-[#e1e3e4]">
          {Array.from({ length: cells.length / 7 }, (_, row) => (
            cells.slice(row * 7, row * 7 + 7).map((day, col) => {
              const key = day ? toDateStr(day) : null;
              const isToday = key === todayStr;
              const isEditing = editing === key;
              const dow = col;

              return (
                <div
                  key={`${row}-${col}`}
                  onClick={() => day && !isEditing && openEdit(day)}
                  className={`min-h-[120px] p-2 flex flex-col border-b border-[#e1e3e4] group
                    ${day ? 'cursor-pointer hover:bg-[#f8f9ff] transition-colors' : 'bg-[#fafafa]'}
                    ${isEditing ? 'bg-[#f0f4ff] ring-2 ring-inset ring-[#00327d]' : ''}
                  `}
                >
                  {day && (
                    <>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full
                          ${isToday ? 'bg-[#00327d] text-white' : dow === 0 ? 'text-[#E63946]' : dow === 6 ? 'text-[#0047ab]' : 'text-[#191c1d]'}
                        `}>
                          {day}
                        </span>
                        {events[key!] && !isEditing && (
                          <span className="material-symbols-outlined text-[14px] text-[#00327d] opacity-0 group-hover:opacity-100 transition-opacity">edit</span>
                        )}
                      </div>

                      {isEditing ? (
                        <div className="flex-1 flex flex-col gap-1" onClick={e => e.stopPropagation()}>
                          <textarea
                            ref={textareaRef}
                            value={draft}
                            onChange={e => setDraft(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Escape') setEditing(null);
                              if (e.key === 'Enter' && e.ctrlKey) save(key!, draft);
                            }}
                            placeholder="일정을 입력하세요&#10;(Ctrl+Enter 저장)"
                            className="flex-1 w-full text-xs text-[#191c1d] bg-transparent resize-none outline-none placeholder:text-[#9ea3ae] leading-relaxed"
                            rows={5}
                          />
                          <div className="flex gap-1 justify-end">
                            <button onClick={() => setEditing(null)}
                              className="text-[10px] px-2 py-0.5 rounded border border-[#c3c6d5] text-[#434653] hover:bg-[#e7e8e9] transition-colors">
                              취소
                            </button>
                            <button onClick={() => save(key!, draft)}
                              className="text-[10px] px-2 py-0.5 rounded bg-[#00327d] text-white hover:bg-[#0047ab] transition-colors">
                              저장
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] text-[#434653] leading-relaxed whitespace-pre-wrap line-clamp-5 flex-1">
                          {events[key!]}
                        </p>
                      )}
                    </>
                  )}
                </div>
              );
            })
          ))}
        </div>
      </div>

      <p className="mt-4 text-xs text-[#737784] text-center">날짜 칸을 클릭해 일정을 입력하세요. Ctrl+Enter로 빠르게 저장할 수 있습니다.</p>
    </div>
  );
}
