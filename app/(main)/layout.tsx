import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import BottomNav from '@/components/Layout/BottomNav';
import SessionGuard from '@/components/SessionGuard';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <SessionGuard />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <BottomNav />
    </div>
  );
}
