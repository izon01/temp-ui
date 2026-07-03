import { getCommunityPosts } from '@/actions/community';
import CommunityClient from './CommunityClient';

export const revalidate = false; // 시간 기반 ISR 제거 — mutation 시 revalidateTag로 즉시 갱신
export const maxDuration = 60;

export default async function CommunityPage() {
  const posts = await getCommunityPosts();
  return <CommunityClient initialPosts={posts} />;
}
