import { getNotices } from '@/actions/notices';
import NoticesClient from './NoticesClient';

export default async function NoticesPage() {
  const dbNotices = await getNotices() ?? [];
  return <NoticesClient initialNotices={dbNotices} />;
}
