'use server';

import { revalidatePath, unstable_cache } from 'next/cache';
import { auth } from '@/auth';
import { sql } from '@/lib/db';

const MAX_CONTENT = 1000;
const iconMap: Record<string, string> = {
  '필독': 'notification_important', '공지사항': 'campaign',
  '취업정보': 'work', '취업활동양식': 'description', '기타': 'info',
};

export async function createNotice(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== 'admin') return { success: false, error: '관리자만 공지를 등록할 수 있습니다.' };

  const title    = String(formData.get('title')    ?? '').trim();
  const content  = String(formData.get('content')  ?? '').trim();
  const category = String(formData.get('category') ?? '공지사항').trim(); // 쉼표 구분 다중값
  const isPinned = formData.get('isPinned') === 'true';
  // imageUrl = 이미지 base64, fileData = 비이미지 파일 base64 (둘 다 image_url 컬럼에 저장)
  const imageUrl = (formData.get('imageUrl') || formData.get('fileData'))
    ? String(formData.get('imageUrl') ?? formData.get('fileData'))
    : null;
  const fileName = formData.get('fileName') ? String(formData.get('fileName')) : null;
  const firstCat = category.split(',')[0].trim();
  const icon     = iconMap[firstCat] ?? 'campaign';

  if (!title || !content) return { success: false, error: '제목과 내용을 입력해주세요.' };
  if (content.length > MAX_CONTENT) return { success: false, error: `내용은 ${MAX_CONTENT}자를 초과할 수 없습니다.` };

  try {
    await ensureNoticesTable();
    await sql`
      INSERT INTO notices (title, content, category, is_pinned, icon, image_url, file_name, author_id)
      VALUES (${title}, ${content}, ${category}, ${isPinned}, ${icon}, ${imageUrl}, ${fileName}, ${session.user.id})
    `;

    revalidatePath('/notices');
    return { success: true };
  } catch (error) {
    console.error('[createNotice]', error);
    return { success: false, error: '등록 중 오류가 발생했습니다.' };
  }
}

export async function updateNotice(id: number, formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== 'admin') return { success: false, error: '권한이 없습니다.' };

  const title    = String(formData.get('title')    ?? '').trim();
  const content  = String(formData.get('content')  ?? '').trim();
  const category = String(formData.get('category') ?? '공지사항').trim();
  const isPinned = formData.get('isPinned') === 'true';
  const firstCat = category.split(',')[0].trim();
  const icon     = iconMap[firstCat] ?? 'campaign';

  if (!title || !content) return { success: false, error: '제목과 내용을 입력해주세요.' };

  try {
    await sql`UPDATE notices SET title=${title}, content=${content}, category=${category}, is_pinned=${isPinned}, icon=${icon} WHERE id=${id}`;

    revalidatePath('/notices');
    return { success: true };
  } catch (error) {
    console.error('[updateNotice]', error);
    return { success: false, error: '수정 중 오류가 발생했습니다.' };
  }
}

export async function deleteNotice(id: number) {
  const session = await auth();
  if (session?.user?.role !== 'admin') return { success: false, error: '권한이 없습니다.' };
  try {
    await sql`DELETE FROM notices WHERE id = ${id}`;

    revalidatePath('/notices');
    return { success: true };
  } catch (error) {
    console.error('[deleteNotice]', error);
    return { success: false, error: '삭제 중 오류가 발생했습니다.' };
  }
}

async function ensureNoticesTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS notices (
      id         SERIAL PRIMARY KEY,
      title      TEXT NOT NULL,
      content    TEXT,
      category   TEXT NOT NULL DEFAULT '공지',
      is_pinned  BOOLEAN NOT NULL DEFAULT false,
      icon       TEXT NOT NULL DEFAULT 'campaign',
      views      INTEGER NOT NULL DEFAULT 0,
      image_url  TEXT,
      file_name  TEXT,
      author_id  TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE notices ADD COLUMN IF NOT EXISTS file_name TEXT`;
}

const fetchNotices = unstable_cache(
  async (query: string) => {
    const rows = query
      ? await sql`
          SELECT id, title, content, category, is_pinned AS "isPinned", icon, views,
                 image_url AS "imageUrl", file_name AS "fileName", TO_CHAR(created_at AT TIME ZONE 'Asia/Seoul', 'YYYY.MM.DD') AS date
          FROM notices
          WHERE title ILIKE ${'%' + query + '%'} OR content ILIKE ${'%' + query + '%'}
          ORDER BY is_pinned DESC, created_at DESC
        `
      : await sql`
          SELECT id, title, content, category, is_pinned AS "isPinned", icon, views,
                 image_url AS "imageUrl", file_name AS "fileName", TO_CHAR(created_at AT TIME ZONE 'Asia/Seoul', 'YYYY.MM.DD') AS date
          FROM notices
          ORDER BY is_pinned DESC, created_at DESC
        `;
    return rows as Array<{
      id: number; title: string; content: string; category: string;
      isPinned: boolean; icon: string; views: number; imageUrl: string | null; fileName: string | null; date: string;
    }>;
  },
  ['notices'],
  { tags: ['notices'], revalidate: 60 }
);

const fetchNoticesCompat = unstable_cache(
  async (query: string) => {
    const rows = query
      ? await sql`
          SELECT id, title, content, category, is_pinned AS "isPinned", icon, views,
                 image_url AS "imageUrl", NULL::text AS "fileName", TO_CHAR(created_at AT TIME ZONE 'Asia/Seoul', 'YYYY.MM.DD') AS date
          FROM notices
          WHERE title ILIKE ${'%' + query + '%'} OR content ILIKE ${'%' + query + '%'}
          ORDER BY is_pinned DESC, created_at DESC
        `
      : await sql`
          SELECT id, title, content, category, is_pinned AS "isPinned", icon, views,
                 image_url AS "imageUrl", NULL::text AS "fileName", TO_CHAR(created_at AT TIME ZONE 'Asia/Seoul', 'YYYY.MM.DD') AS date
          FROM notices
          ORDER BY is_pinned DESC, created_at DESC
        `;
    return rows as Array<{
      id: number; title: string; content: string; category: string;
      isPinned: boolean; icon: string; views: number; imageUrl: string | null; fileName: string | null; date: string;
    }>;
  },
  ['notices-compat'],
  { tags: ['notices'], revalidate: 60 }
);

export async function getNotices(q?: string) {
  const query = q?.trim() ?? '';
  // Run migration before fetch so the column exists
  try { await sql`ALTER TABLE notices ADD COLUMN IF NOT EXISTS file_name TEXT`; } catch { /* ignore */ }
  try {
    return await fetchNotices(query);
  } catch {
    // Fallback: column may not exist in cache context; retry without file_name
    try {
      return await fetchNoticesCompat(query);
    } catch (error) {
      console.error('[getNotices]', error);
      return null;
    }
  }
}
