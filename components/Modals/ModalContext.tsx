'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import type { EmploymentRecord } from '@/actions/employment';

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
  content?: string; imageUrl?: string | null; fileName?: string | null;
}

type ModalType =
  | 'forgotPassword' | 'postDetail' | 'noticeDetail' | 'profile'
  | 'write' | 'writeNotice' | 'submitAssignment' | 'writeAssignment'
  | 'editAssignment' | 'assignmentSubmissions'
  | 'participantProfile'
  | 'employmentDetail' | 'employmentWrite'
  | null;

interface ModalContextValue {
  openModal: ModalType;
  selectedPost: SelectedPost | null;
  selectedNotice: NoticeDetail | null;
  selectedAssignment: SelectedAssignment | null;
  selectedParticipant: SelectedParticipant | null;
  selectedEmployment: EmploymentRecord | null;
  selectedEmploymentEdit: EmploymentRecord | null;
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
  openEmploymentDetail: (record: EmploymentRecord) => void;
  openEmploymentWrite: (record: EmploymentRecord | null) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [openModal, setOpenModal] = useState<ModalType>(null);
  const [selectedPost, setSelectedPost] = useState<SelectedPost | null>(null);
  const [selectedNotice, setSelectedNotice] = useState<NoticeDetail | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<SelectedAssignment | null>(null);
  const [selectedParticipant, setSelectedParticipant] = useState<SelectedParticipant | null>(null);
  const [selectedEmployment, setSelectedEmployment] = useState<EmploymentRecord | null>(null);
  const [selectedEmploymentEdit, setSelectedEmploymentEdit] = useState<EmploymentRecord | null>(null);

  const closeModal = () => setOpenModal(null);

  return (
    <ModalContext.Provider value={{
      openModal, selectedPost, selectedNotice, selectedAssignment, selectedParticipant,
      selectedEmployment, selectedEmploymentEdit,
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
      openEmploymentDetail: (r) => { setSelectedEmployment(r); setOpenModal('employmentDetail'); },
      openEmploymentWrite: (r) => { setSelectedEmploymentEdit(r); setOpenModal('employmentWrite'); },
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
