'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';

export default function Toast() {
  const { toast, dismissToast } = useApp();
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 bg-[#191c1d] text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold whitespace-nowrap"
        >
          <span
            className="material-symbols-outlined text-[#8cf5e4]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
          {toast}
          <button
            onClick={dismissToast}
            className="ml-1 text-white/50 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
