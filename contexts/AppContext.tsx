'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  assignments as initialAssignments,
  communityPosts as initialPosts,
  notices as initialNotices,
  Assignment, CommunityPost, Notice,
} from '@/data/mockData';

interface AppContextValue {
  assignments: Assignment[];
  posts: CommunityPost[];
  notices: Notice[];
  attendanceChecked: boolean;
  attendanceRate: number;
  toast: string | null;
  submitAssignment: (id: number, data: { link?: string; fileName?: string }) => void;
  checkAttendance: () => void;
  addPost: (post: Omit<CommunityPost, 'id' | 'timeAgo' | 'comments'>) => void;
  showToast: (message: string) => void;
  dismissToast: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);
  const [posts, setPosts] = useState<CommunityPost[]>(initialPosts);
  const [notices] = useState<Notice[]>(initialNotices);
  const [attendanceChecked, setAttendanceChecked] = useState(false);
  const [attendanceRate, setAttendanceRate] = useState(92);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  const submitAssignment = useCallback((id: number, _data: { link?: string; fileName?: string }) => {
    setAssignments(prev => prev.map(a => a.id === id ? { ...a, submitted: true, daysLeft: null } : a));
    showToast('제출되었습니다 ✓');
  }, [showToast]);

  const checkAttendance = useCallback(() => {
    setAttendanceChecked(true);
    setAttendanceRate(prev => Math.min(100, prev + 1));
    showToast('출석이 완료되었습니다 ✓');
  }, [showToast]);

  const addPost = useCallback((post: Omit<CommunityPost, 'id' | 'timeAgo' | 'comments'>) => {
    const newPost: CommunityPost = { ...post, id: Date.now(), timeAgo: '방금 전', comments: 0 };
    setPosts(prev => [newPost, ...prev]);
    showToast('게시글이 등록되었습니다 ✓');
  }, [showToast]);

  return (
    <AppContext.Provider value={{
      assignments, posts, notices,
      attendanceChecked, attendanceRate,
      toast, showToast, dismissToast,
      submitAssignment, checkAttendance, addPost,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
