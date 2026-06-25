import { getCommunityPosts } from '@/actions/community';
import CommunityClient from './CommunityClient';

export const revalidate = 30;

export default async function CommunityPage() {
  const posts = await getCommunityPosts();
  return <CommunityClient initialPosts={posts} />;
}
