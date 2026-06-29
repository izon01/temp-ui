'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export interface SelectedPost {
  id: number; category: string; title: string; content: string;
  author: string; timeAgo: string; comments: number; hasImage: boolean;
  imageUrl?: string | null;
}

export interface SelectedAssignment {
  id: number; week: number; category: string; title: string; description: string;
  deadline: string; daysLeft: number | null; submitted: boolean;
}

export interface SelectedParticipant {
  id: number; name: string; team: string; track: string;
  attendance: number; status: string; lastAccess: string;
}

export interface NoticeDetail {
  id: number; title: string; date: string; views: number;
  isPinned: boolean; category: string; icon: string;
  content?: string; imageUrl?: string; fileName?: string;
}

type ModalType =
  | 'forgotPassword' | 'postDetail' | 'noticeDetail' | 'profile'
  | 'write' | 'writeNotice' | 'submitAssignment' | 'writeAssignment'
  | 'editAssignment' | 'assignmentSubmissions'
  | 'participantProfile' | null;

interface ModalContextValue {
  openModal: ModalType;
  selectedPost: SelectedPost | null;
  selectedNotice: NoticeDetail | null;
  selectedAssignment: SelectedAssignment | null;
  selectedParticipant: SelectedParticipant | null;
  openForgotPassword: () => void;
  openPostDetail: (post: SelectedPost) => void;
  openNoticeDetail: (notice: NoticeDetail) => void;
  openProfile: () => void;
  openWrite: () => void;
  openWriteNotice: () => void;
  openSubmitAssignment: (assignment: SelectedAssignment) => void;
  openWriteAssignment: () => void;
  openEditAssignment: (assignment: SelectedAssignment) => void;
  openAssignmentSubmissions: (assignment: SelectedAssignment) => void;
  openParticipantProfile: (participant: SelectedParticipant) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [openModal, setOpenModal] = useState<ModalType>(null);
  const [selectedPost, setSelectedPost] = useState<SelectedPost | null>(null);
  const [selectedNotice, setSelectedNotice] = useState<NoticeDetail | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<SelectedAssignment | null>(null);
  const [selectedParticipant, setSelectedParticipant] = useState<SelectedParticipant | null>(null);

  const closeModal = () => setOpenModal(null);

  return (
    <ModalContext.Provider value={{
      openModal, selectedPost, selectedNotice, selectedAssignment, selectedParticipant,
      openForgotPassword: () => setOpenModal('forgotPassword'),
      openPostDetail: (post) => { setSelectedPost(post); setOpenModal('postDetail'); },
      openNoticeDetail: (notice) => { setSelectedNotice(notice); setOpenModal('noticeDetail'); },
      openProfile: () => setOpenModal('profile'),
      openWrite: () => setOpenModal('write'),
      openWriteNotice: () => setOpenModal('writeNotice'),
      openSubmitAssignment: (a) => { setSelectedAssignment(a); setOpenModal('submitAssignment'); },
      openWriteAssignment: () => setOpenModal('writeAssignment'),
      openEditAssignment: (a) => { setSelectedAssignment(a); setOpenModal('editAssignment'); },
      openAssignmentSubmissions: (a) => { setSelectedAssignment(a); setOpenModal('assignmentSubmissions'); },
      openParticipantProfile: (p) => { setSelectedParticipant(p); setOpenModal('participantProfile'); },
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
