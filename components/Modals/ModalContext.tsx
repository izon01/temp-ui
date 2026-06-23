'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type ModalType = 'forgotPassword' | 'postDetail' | 'profile' | 'write' | null;

interface ModalContextValue {
  openModal: ModalType;
  openForgotPassword: () => void;
  openPostDetail: () => void;
  openProfile: () => void;
  openWrite: () => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [openModal, setOpenModal] = useState<ModalType>(null);

  return (
    <ModalContext.Provider
      value={{
        openModal,
        openForgotPassword: () => setOpenModal('forgotPassword'),
        openPostDetail: () => setOpenModal('postDetail'),
        openProfile: () => setOpenModal('profile'),
        openWrite: () => setOpenModal('write'),
        closeModal: () => setOpenModal(null),
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used within ModalProvider');
  return ctx;
}
