'use client';

import { useEffect, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface SlideOverBaseProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

export default function SlideOverBase({ isOpen, onClose, children, title }: SlideOverBaseProps) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-stretch md:justify-end overflow-hidden">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-[rgba(25,28,29,0.5)] backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel — bottom sheet on mobile, slide-over on desktop */}
          <motion.div
            className="relative bg-white w-full md:w-[560px] rounded-t-3xl md:rounded-t-none md:rounded-l-3xl shadow-2xl flex flex-col max-h-[90vh] md:max-h-full md:h-full"
            initial={{ y: '100%', x: 0 }}
            animate={{ y: 0, x: 0 }}
            exit={{ y: '100%', x: 0 }}
            // on md+ screens animate from right instead
            style={{}}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Mobile drag handle */}
            <div className="w-12 h-1.5 bg-[#c3c6d5] rounded-full mx-auto mt-3 mb-1 md:hidden" />

            {/* Header */}
            {title && (
              <div className="px-6 py-4 border-b border-[#e1e3e4] flex items-center justify-between flex-shrink-0">
                <h2 className="text-xl font-bold text-[#191c1d]" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>{title}</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-[#edeeef] transition-colors text-[#737784]"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            )}

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
