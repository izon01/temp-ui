import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProvider } from '@/contexts/AppContext';
import { ModalProvider } from '@/components/Modals/ModalContext';
import ForgotPasswordModal from '@/components/Modals/ForgotPasswordModal';
import PostDetailSlideOver from '@/components/Modals/PostDetailSlideOver';
import NoticeDetailSlideOver from '@/components/Modals/NoticeDetailSlideOver';
import ProfileSlideOver from '@/components/Modals/ProfileSlideOver';
import WritePostSlideOver from '@/components/Modals/WritePostSlideOver';
import AssignmentSubmitSlideOver from '@/components/Modals/AssignmentSubmitSlideOver';
import Toast from '@/components/UI/Toast';

export const metadata: Metadata = {
  title: '경북청년인재스쿨',
  description: '경상북도 청년 인재 육성 플랫폼',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-[#f8f9fa]">
        <AppProvider>
          <ModalProvider>
            {children}
            <ForgotPasswordModal />
            <PostDetailSlideOver />
            <NoticeDetailSlideOver />
            <ProfileSlideOver />
            <WritePostSlideOver />
            <AssignmentSubmitSlideOver />
            <Toast />
          </ModalProvider>
        </AppProvider>
      </body>
    </html>
  );
}
