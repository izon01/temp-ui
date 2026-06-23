'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Assignment, CommunityPost, Notice } from '@/data/mockData';

type ModalType = 'forgotPassword' | 'postDetail' | 'noticeDetail' | 'profile' | 'write' | 'writeNotice' | 'submitAssignment' | 'writeAssignment' | null;

interface ModalContextValue {
  openModal: ModalType;
  selectedPost: CommunityPost | null;
  selectedNotice: Notice | null;
  selectedAssignment: Assignment | null;
  openForgotPassword: () => void;
  openPostDetail: (post: CommunityPost) => void;
  openNoticeDetail: (notice: Notice) => void;
  openProfile: () => void;
  openWrite: () => void;
  openWriteNotice: () => void;
  openSubmitAssignment: (assignment: Assignment) => void;
  openWriteAssignment: () => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [openModal, setOpenModal] = useState<ModalType>(null);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  const closeModal = () => setOpenModal(null);

  return (
    <ModalContext.Provider value={{
      openModal, selectedPost, selectedNotice, selectedAssignment,
      openForgotPassword: () => setOpenModal('forgotPassword'),
      openPostDetail: (post) => { setSelectedPost(post); setOpenModal('postDetail'); },
      openNoticeDetail: (notice) => { setSelectedNotice(notice); setOpenModal('noticeDetail'); },
      openProfile: () => setOpenModal('profile'),
      openWrite: () => setOpenModal('write'),
      openWriteNotice: () => setOpenModal('writeNotice'),
      openSubmitAssignment: (assignment) => { setSelectedAssignment(assignment); setOpenModal('submitAssignment'); },
      openWriteAssignment: () => setOpenModal('writeAssignment'),
      closeModal,
    }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used within ModalProvider');
  return ctx;
}
