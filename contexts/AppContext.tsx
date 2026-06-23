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
  addNotice: (notice: Omit<Notice, 'id' | 'date' | 'views'>) => void;
  showToast: (message: string) => void;
  dismissToast: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);
  const [posts, setPosts] = useState<CommunityPost[]>(initialPosts);
  const [notices, setNotices] = useState<Notice[]>(initialNotices);
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
  }, []);

  const checkAttendance = useCallback(() => {
    setAttendanceChecked(true);
    setAttendanceRate(prev => Math.min(100, prev + 1));
    showToast('출석이 완료되었습니다 ✓');
  }, [showToast]);

  const addPost = useCallback((post: Omit<CommunityPost, 'id' | 'timeAgo' | 'comments'>) => {
    const newPost: CommunityPost = { ...post, id: Date.now(), timeAgo: '방금 전', comments: 0 };
    setPosts(prev => [newPost, ...prev]);
  }, []);

  const addNotice = useCallback((notice: Omit<Notice, 'id' | 'date' | 'views'>) => {
    const today = new Date();
    const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;
    const newNotice: Notice = { ...notice, id: Date.now(), date: dateStr, views: 0 };
    setNotices(prev => [newNotice, ...prev]);
  }, []);

  return (
    <AppContext.Provider value={{
      assignments, posts, notices,
      attendanceChecked, attendanceRate,
      toast, showToast, dismissToast,
      submitAssignment, checkAttendance, addPost, addNotice,
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
