import { getNotices } from '@/actions/notices';
import NoticesClient from './NoticesClient';

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function NoticesPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const dbNotices = await getNotices(q) ?? [];
  return <NoticesClient initialNotices={dbNotices} searchQuery={q ?? ''} />;
}
