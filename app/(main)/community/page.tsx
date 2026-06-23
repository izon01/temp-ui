import { getCommunityPosts } from '@/actions/community';
import CommunityClient from './CommunityClient';

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function CommunityPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const posts = await getCommunityPosts(q);
  return <CommunityClient initialPosts={posts} searchQuery={q ?? ''} />;
}
