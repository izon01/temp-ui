'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { sql } from '@/lib/db';

export async function getCommunityPosts(q?: string) {
  const query = q?.trim() ?? '';
  const rows = query
    ? await sql`
        SELECT id, category, title, content, author_name AS "authorName",
               has_image AS "hasImage", comments,
               TO_CHAR(created_at, 'YYYY-MM-DD') AS date
        FROM community_posts
        WHERE title ILIKE ${'%' + query + '%'}
           OR content ILIKE ${'%' + query + '%'}
        ORDER BY created_at DESC
      `
    : await sql`
        SELECT id, category, title, content, author_name AS "authorName",
               has_image AS "hasImage", comments,
               TO_CHAR(created_at, 'YYYY-MM-DD') AS date
        FROM community_posts
        ORDER BY created_at DESC
      `;
  return rows as Array<{
    id: number; category: string; title: string; content: string;
    authorName: string; hasImage: boolean; comments: number;
    date: string; age: unknown;
  }>;
}

export async function createCommunityPost(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { success: false, error: '로그인이 필요합니다.' };

  const category = String(formData.get('category') ?? '자유게시판').trim();
  const title    = String(formData.get('title')    ?? '').trim();
  const content  = String(formData.get('content')  ?? '').trim();

  if (!title || !content) return { success: false, error: '제목과 내용을 입력해주세요.' };

  try {
    await sql`
      INSERT INTO community_posts (category, title, content, author_id, author_name)
      VALUES (${category}, ${title}, ${content}, ${session.user.id}, ${session.user.name ?? '익명'})
    `;
    revalidatePath('/community');
    return { success: true };
  } catch (error) {
    console.error('[createCommunityPost]', error);
    return { success: false, error: '등록 중 오류가 발생했습니다.' };
  }
}
