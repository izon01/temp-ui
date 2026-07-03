import { getNotices } from '@/actions/notices';
import NoticesClient from './NoticesClient';

export const revalidate = false; // 시간 기반 ISR 제거 — mutation 시 revalidateTag로 즉시 갱신
export const maxDuration = 60;

export default async function NoticesPage() {
  const dbNotices = await getNotices() ?? [];
  return <NoticesClient initialNotices={dbNotices} />;
}
