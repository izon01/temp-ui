'use server';

import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache';
import { auth } from '@/auth';
import { sql } from '@/lib/db';

const MAX_CONTENT = 1000;

const fetchCommunityPosts = unstable_cache(
  async (query: string) => {
    const rows = query
      ? await sql`
          SELECT id, category, title, content, author_name AS "authorName",
                 has_image AS "hasImage", image_url AS "imageUrl", comments,
                 TO_CHAR(created_at, 'YYYY-MM-DD') AS date
          FROM community_posts
          WHERE title ILIKE ${'%' + query + '%'} OR content ILIKE ${'%' + query + '%'}
          ORDER BY created_at DESC
        `
      : await sql`
          SELECT id, category, title, content, author_name AS "authorName",
                 has_image AS "hasImage", image_url AS "imageUrl", comments,
                 TO_CHAR(created_at, 'YYYY-MM-DD') AS date
          FROM community_posts
          ORDER BY created_at DESC
        `;
    return rows as Array<{
      id: number; category: string; title: string; content: string;
      authorName: string; hasImage: boolean; imageUrl: string | null;
      comments: number; date: string;
    }>;
  },
  ['community-posts'],
  { tags: ['community-posts'], revalidate: 60 }
);

export async function getCommunityPosts(q?: string) {
  try {
    return await fetchCommunityPosts(q?.trim() ?? '');
  } catch (error) {
    console.error('[getCommunityPosts]', error);
    return [];
  }
}

export async function createCommunityPost(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { success: false, error: '로그인이 필요합니다.' };

  const category = String(formData.get('category') ?? '자유게시판').trim();
  const title    = String(formData.get('title')    ?? '').trim();
  const content  = String(formData.get('content')  ?? '').trim();
  const imageUrl = formData.get('imageUrl') ? String(formData.get('imageUrl')) : null;

  if (!title || !content) return { success: false, error: '제목과 내용을 입력해주세요.' };
  if (content.length > MAX_CONTENT) return { success: false, error: `내용은 ${MAX_CONTENT}자를 초과할 수 없습니다.` };

  try {
    await sql`
      INSERT INTO community_posts (category, title, content, author_id, author_name, has_image, image_url)
      VALUES (${category}, ${title}, ${content}, ${session.user.id}, ${session.user.name ?? '익명'}, ${!!imageUrl}, ${imageUrl})
    `;
    revalidateTag('community-posts');
    revalidatePath('/community');
    return { success: true };
  } catch (error) {
    console.error('[createCommunityPost]', error);
    return { success: false, error: '등록 중 오류가 발생했습니다.' };
  }
}

export async function updateCommunityPost(id: number, formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== 'admin') return { success: false, error: '권한이 없습니다.' };

  const category = String(formData.get('category') ?? '자유게시판').trim();
  const title    = String(formData.get('title')    ?? '').trim();
  const content  = String(formData.get('content')  ?? '').trim();

  if (!title || !content) return { success: false, error: '제목과 내용을 입력해주세요.' };
  if (content.length > MAX_CONTENT) return { success: false, error: `내용은 ${MAX_CONTENT}자를 초과할 수 없습니다.` };

  try {
    await sql`UPDATE community_posts SET category=${category}, title=${title}, content=${content} WHERE id=${id}`;
    revalidateTag('community-posts');
    revalidatePath('/community');
    return { success: true };
  } catch (error) {
    console.error('[updateCommunityPost]', error);
    return { success: false, error: '수정 중 오류가 발생했습니다.' };
  }
}

export async function deleteCommunityPost(id: number) {
  const session = await auth();
  if (session?.user?.role !== 'admin') return { success: false, error: '권한이 없습니다.' };
  try {
    await sql`DELETE FROM community_posts WHERE id = ${id}`;
    revalidateTag('community-posts');
    revalidatePath('/community');
    return { success: true };
  } catch (error) {
    console.error('[deleteCommunityPost]', error);
    return { success: false, error: '삭제 중 오류가 발생했습니다.' };
  }
}

export async function getPostComments(postId: number) {
  try {
    const rows = await sql`
      SELECT id, author_name AS "authorName", content,
             TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI') AS "createdAt"
      FROM post_comments
      WHERE post_id = ${postId}
      ORDER BY created_at ASC
    `;
    return rows as Array<{ id: number; authorName: string; content: string; createdAt: string }>;
  } catch (error) {
    console.error('[getPostComments]', error);
    return [];
  }
}

export async function addComment(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { success: false, error: '로그인이 필요합니다.' };

  const postId  = parseInt(String(formData.get('postId') ?? '0'), 10);
  const content = String(formData.get('content') ?? '').trim();

  if (!postId || !content) return { success: false, error: '내용을 입력해주세요.' };
  if (content.length > MAX_CONTENT) return { success: false, error: `댓글은 ${MAX_CONTENT}자를 초과할 수 없습니다.` };

  try {
    await sql`
      INSERT INTO post_comments (post_id, author_id, author_name, content)
      VALUES (${postId}, ${session.user.id}, ${session.user.name ?? '익명'}, ${content})
    `;
    await sql`UPDATE community_posts SET comments = comments + 1 WHERE id = ${postId}`;
    revalidateTag('community-posts');
    revalidatePath('/community');
    return { success: true };
  } catch (error) {
    console.error('[addComment]', error);
    return { success: false, error: '댓글 등록 중 오류가 발생했습니다.' };
  }
}

export async function deleteComment(id: number, postId: number) {
  const session = await auth();
  if (session?.user?.role !== 'admin') return { success: false, error: '권한이 없습니다.' };
  try {
    await sql`DELETE FROM post_comments WHERE id = ${id}`;
    await sql`UPDATE community_posts SET comments = GREATEST(0, comments - 1) WHERE id = ${postId}`;
    revalidateTag('community-posts');
    revalidatePath('/community');
    return { success: true };
  } catch (error) {
    console.error('[deleteComment]', error);
    return { success: false, error: '삭제 중 오류가 발생했습니다.' };
  }
}
