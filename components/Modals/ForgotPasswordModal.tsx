'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useModal } from './ModalContext';

export default function ForgotPasswordModal() {
  const { openModal, closeModal } = useModal();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const isOpen = openModal === 'forgotPassword';

  const handleSubmit = () => {
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
      setTimeout(() => { setSent(false); closeModal(); }, 1500);
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 backdrop-blur-sm bg-[rgba(25,28,29,0.6)]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={closeModal}
          />
          <motion.div
            className="relative bg-white w-full max-w-[480px] rounded-xl shadow-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-6 pt-6 pb-2 flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-[#191c1d]" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>비밀번호 재설정</h2>
              <button onClick={closeModal} className="p-2 rounded-full hover:bg-[#edeeef] transition-colors text-[#737784]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="px-6 py-4">
              <p className="text-[#434653] mb-6">
                가입하신 이메일 주소를 입력하시면,<br />임시 비밀번호를 이메일로 보내드립니다.
              </p>
              <div className="space-y-2 mb-6">
                <label className="text-sm font-semibold text-[#434653]">가입한 이메일</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#737784]">mail</span>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="example@domain.com"
                    className="w-full pl-12 pr-4 py-3 bg-[#f3f4f5] border border-[#c3c6d5] rounded-lg focus:ring-2 focus:ring-[#00327d] focus:border-[#00327d] outline-none transition-all"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleSubmit}
                  disabled={loading || sent}
                  className="w-full bg-[#0047ab] text-white font-bold py-4 rounded-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-70"
                >
                  {sent ? (
                    <><span className="material-symbols-outlined">check_circle</span> 발송 완료!</>
                  ) : loading ? (
                    <><span className="material-symbols-outlined animate-spin">progress_activity</span> 처리 중...</>
                  ) : (
                    <><span className="material-symbols-outlined">send</span> 임시 비밀번호 발송</>
                  )}
                </button>
                <button onClick={closeModal} className="w-full bg-[#e7e8e9] text-[#434653] font-bold py-4 rounded-lg hover:bg-[#e1e3e4] transition-colors">
                  취소
                </button>
              </div>
            </div>

            <div className="px-6 py-4 bg-[#f3f4f5] border-t border-[#e1e3e4] flex items-start gap-3">
              <span className="material-symbols-outlined text-[#00327d] text-[20px] mt-0.5">info</span>
              <p className="text-xs leading-relaxed text-[#434653]">
                이메일이 도착하지 않았을 경우 스팸 메일함을 확인해 주세요.<br />
                도움이 필요하시면 고객센터로 문의 바랍니다.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
