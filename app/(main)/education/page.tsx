'use client';

import { useApp } from '@/contexts/AppContext';
import { useModal } from '@/components/Modals/ModalContext';

export default function EducationPage() {
  const { assignments, attendanceChecked, checkAttendance } = useApp();
  const { openSubmitAssignment } = useModal();

  const today = new Date();
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일 (${days[today.getDay()]})`;

  const submittedCount = assignments.filter(a => a.submitted).length;

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-6 space-y-6">
      {/* Welcome */}
      <section className="space-y-1">
        <p className="text-sm font-semibold text-[#00327d] uppercase tracking-wider">Education Management</p>
        <h2 className="text-2xl font-bold text-[#191c1d]" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>김지수 학생, 안녕하세요!</h2>
        <p className="text-[#434653]">오늘도 꿈을 향한 한 걸음을 응원합니다.</p>
      </section>

      {/* Attendance Card */}
      <section className="w-full">
        <button
          onClick={() => !attendanceChecked && checkAttendance()}
          disabled={attendanceChecked}
          className={`group relative w-full aspect-[2/1.1] md:aspect-[3/1] rounded-xl overflow-hidden active:scale-[0.98] transition-all duration-300 text-left shadow-lg ${
            attendanceChecked ? 'bg-[#003e37] cursor-default' : 'bg-[#0047ab]'
          }`}
        >
          <div className="relative z-10 h-full p-6 flex flex-col justify-between">
            <div>
              <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full inline-flex items-center gap-2">
                <span className="material-symbols-outlined text-white text-[18px]">fingerprint</span>
                <span className="text-white text-sm font-semibold">{dateStr}</span>
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>
                  {attendanceChecked ? '출석 완료!' : '오늘 출석 체크하기'}
                </h3>
                <p className="text-[#a5bdff] mt-1">
                  {attendanceChecked ? `${today.getHours()}:${String(today.getMinutes()).padStart(2, '0')} 출석 기록 완료` : '버튼을 눌러 출석을 확인하세요'}
                </p>
              </div>
              <div className={`px-6 py-3 rounded-xl font-bold shadow-sm flex items-center gap-2 w-fit transition-colors ${
                attendanceChecked
                  ? 'bg-white/20 text-white'
                  : 'bg-white text-[#00327d] group-hover:bg-[#dae2ff]'
              }`}>
                <span>{attendanceChecked ? '출석 완료' : '출석 체크하기'}</span>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: attendanceChecked ? "'FILL' 1" : "'FILL' 0" }}>
                  {attendanceChecked ? 'check_circle' : 'check_circle'}
                </span>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
        </button>
      </section>

      {/* Stats mini */}
      <section className="grid grid-cols-2 gap-4">
        <div className="bg-white/80 backdrop-blur-md border border-white/30 shadow-sm p-4 rounded-xl flex flex-col gap-1">
          <span className="material-symbols-outlined text-[#00327d] mb-1">school</span>
          <span className="text-sm text-[#434653]">전체 수료율</span>
          <span className="text-2xl font-bold text-[#00327d]" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>78%</span>
        </div>
        <div className="bg-white/80 backdrop-blur-md border border-white/30 shadow-sm p-4 rounded-xl flex flex-col gap-1">
          <span className="material-symbols-outlined text-[#003e37] mb-1">assignment_turned_in</span>
          <span className="text-sm text-[#434653]">제출 과제</span>
          <span className="text-2xl font-bold text-[#003e37]" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>
            {submittedCount}/{assignments.length}
          </span>
        </div>
      </section>

      {/* Assignments */}
      <section className="space-y-4">
        <div className="flex justify-between items-end">
          <h3 className="text-xl font-bold text-[#191c1d]" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>주차별 과제 게시판</h3>
          <a href="#" className="text-[#00327d] text-sm font-semibold flex items-center gap-1">
            전체보기 <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </a>
        </div>

        <div className="space-y-4">
          {assignments.map(a => (
            <div key={a.id} className={`bg-white shadow-sm rounded-xl p-6 border border-[#edeeef] ${!a.submitted ? 'group' : 'opacity-90'}`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${a.submitted ? 'bg-[#e7e8e9] text-[#434653]' : 'bg-[#dae2ff] text-[#001946]'}`}>
                      {a.week}주차
                    </span>
                    {!a.submitted && a.daysLeft !== null && (
                      <span className="bg-[#ffdad8] text-[#410007] text-xs font-bold px-2 py-1 rounded">D-{a.daysLeft}</span>
                    )}
                  </div>
                  <h4
                    className={`text-lg font-semibold ${a.submitted ? 'text-[#434653]' : 'text-[#191c1d] group-hover:text-[#00327d] transition-colors'}`}
                    style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}
                  >
                    {a.title}
                  </h4>
                  <p className="text-[#434653] text-sm">{a.description}</p>
                </div>

                <div className="flex items-center gap-3">
                  {a.submitted ? (
                    <>
                      <span className="bg-[#8cf5e4] text-[#00201c] px-4 py-2 rounded-full text-sm font-semibold">제출완료</span>
                      <button className="bg-[#e7e8e9] text-[#434653] px-4 py-2 rounded-lg text-sm">상세보기</button>
                    </>
                  ) : (
                    <>
                      <span className="bg-[#ffdad6] text-[#93000a] px-4 py-2 rounded-full text-sm font-semibold">미제출</span>
                      <button
                        onClick={() => openSubmitAssignment(a)}
                        className="bg-[#00327d] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#0047ab] active:scale-95 transition-all shadow-sm"
                      >
                        과제 제출하기
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
