'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { sql } from '@/lib/db';

const MAX_CONTENT = 2000;

async function ensureTables() {
  await sql`
    CREATE TABLE IF NOT EXISTS support_requests (
      id          SERIAL PRIMARY KEY,
      title       TEXT NOT NULL,
      content     TEXT NOT NULL,
      author_id   TEXT NOT NULL,
      author_name TEXT NOT NULL,
      status      TEXT NOT NULL DEFAULT '검토중',
      file_url    TEXT,
      file_name   TEXT,
      comments    INTEGER NOT NULL DEFAULT 0,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS support_comments (
      id          SERIAL PRIMARY KEY,
      request_id  INTEGER NOT NULL,
      author_id   TEXT NOT NULL,
      author_name TEXT NOT NULL,
      content     TEXT NOT NULL,
      file_url    TEXT,
      file_name   TEXT,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  // FK with CASCADE
  try {
    await sql`
      ALTER TABLE support_requests
        ADD CONSTRAINT support_requests_author_id_fkey
        FOREIGN KEY (author_id) REFERENCES participants(id) ON DELETE CASCADE
    `;
  } catch { /* already exists */ }
  try {
    await sql`
      ALTER TABLE support_comments
        ADD CONSTRAINT support_comments_request_id_fkey
        FOREIGN KEY (request_id) REFERENCES support_requests(id) ON DELETE CASCADE
    `;
  } catch { /* already exists */ }
}

export async function getSupportRequests() {
  const session = await auth();
  if (!session?.user) return [];
  try {
    await ensureTables();
    const isAdmin = session.user.role === 'admin';
    const rows = isAdmin
      ? await sql`
          SELECT id, title, content, author_id AS "authorId", author_name AS "authorName",
                 status, file_url AS "fileUrl", file_name AS "fileName", comments,
                 TO_CHAR(created_at, 'YYYY-MM-DD') AS date
          FROM support_requests
          ORDER BY created_at DESC
        `
      : await sql`
          SELECT id, title, content, author_id AS "authorId", author_name AS "authorName",
                 status, file_url AS "fileUrl", file_name AS "fileName", comments,
                 TO_CHAR(created_at, 'YYYY-MM-DD') AS date
          FROM support_requests
          WHERE author_id = ${session.user.id}
          ORDER BY created_at DESC
        `;
    return rows as Array<{
      id: number; title: string; content: string;
      authorId: string; authorName: string; status: string;
      fileUrl: string | null; fileName: string | null;
      comments: number; date: string;
    }>;
  } catch (e) {
    console.error('[getSupportRequests]', e);
    return [];
  }
}

export async function createSupportRequest(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { success: false, error: '로그인이 필요합니다.' };

  const title   = String(formData.get('title')   ?? '').trim();
  const content = String(formData.get('content') ?? '').trim();
  const fileUrl  = formData.get('fileUrl')  ? String(formData.get('fileUrl'))  : null;
  const fileName = formData.get('fileName') ? String(formData.get('fileName')) : null;

  if (!title || !content) return { success: false, error: '제목과 내용을 입력해주세요.' };
  if (content.length > MAX_CONTENT) return { success: false, error: `내용은 ${MAX_CONTENT}자를 초과할 수 없습니다.` };

  try {
    await ensureTables();
    await sql`
      INSERT INTO support_requests (title, content, author_id, author_name, file_url, file_name)
      VALUES (${title}, ${content}, ${session.user.id}, ${session.user.name ?? '익명'}, ${fileUrl}, ${fileName})
    `;
    revalidatePath('/support');
    return { success: true };
  } catch (e) {
    console.error('[createSupportRequest]', e);
    return { success: false, error: '등록 중 오류가 발생했습니다.' };
  }
}

export async function deleteSupportRequest(id: number) {
  const session = await auth();
  if (!session?.user) return { success: false };
  try {
    const isAdmin = session.user.role === 'admin';
    if (isAdmin) {
      await sql`DELETE FROM support_requests WHERE id = ${id}`;
    } else {
      await sql`DELETE FROM support_requests WHERE id = ${id} AND author_id = ${session.user.id}`;
    }
    revalidatePath('/support');
    return { success: true };
  } catch (e) {
    console.error('[deleteSupportRequest]', e);
    return { success: false, error: '삭제 중 오류가 발생했습니다.' };
  }
}

export async function updateSupportRequest(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { success: false, error: '로그인이 필요합니다.' };

  const id      = parseInt(String(formData.get('id') ?? '0'), 10);
  const title   = String(formData.get('title')   ?? '').trim();
  const content = String(formData.get('content') ?? '').trim();
  const fileUrl  = formData.get('fileUrl')  ? String(formData.get('fileUrl'))  : null;
  const fileName = formData.get('fileName') ? String(formData.get('fileName')) : null;
  const clearFile = formData.get('clearFile') === 'true';

  if (!id || !title || !content) return { success: false, error: '제목과 내용을 입력해주세요.' };

  try {
    const isAdmin = session.user.role === 'admin';
    if (isAdmin) {
      if (clearFile || fileUrl) {
        await sql`UPDATE support_requests SET title=${title}, content=${content}, file_url=${fileUrl}, file_name=${fileName} WHERE id=${id}`;
      } else {
        await sql`UPDATE support_requests SET title=${title}, content=${content} WHERE id=${id}`;
      }
    } else {
      if (clearFile || fileUrl) {
        await sql`UPDATE support_requests SET title=${title}, content=${content}, file_url=${fileUrl}, file_name=${fileName} WHERE id=${id} AND author_id=${session.user.id}`;
      } else {
        await sql`UPDATE support_requests SET title=${title}, content=${content} WHERE id=${id} AND author_id=${session.user.id}`;
      }
    }
    revalidatePath('/support');
    return { success: true };
  } catch (e) {
    console.error('[updateSupportRequest]', e);
    return { success: false, error: '수정 중 오류가 발생했습니다.' };
  }
}

export async function updateSupportStatus(id: number, status: string) {
  const session = await auth();
  if (session?.user?.role !== 'admin') return { success: false, error: '권한이 없습니다.' };
  try {
    await sql`UPDATE support_requests SET status = ${status} WHERE id = ${id}`;
    revalidatePath('/support');
    return { success: true };
  } catch (e) {
    console.error('[updateSupportStatus]', e);
    return { success: false, error: '상태 변경 중 오류가 발생했습니다.' };
  }
}

export async function getSupportComments(requestId: number) {
  try {
    const rows = await sql`
      SELECT id, author_name AS "authorName", author_id AS "authorId", content,
             file_url AS "fileUrl", file_name AS "fileName",
             TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI') AS "createdAt"
      FROM support_comments
      WHERE request_id = ${requestId}
      ORDER BY created_at ASC
    `;
    return rows as Array<{
      id: number; authorName: string; authorId: string; content: string;
      fileUrl: string | null; fileName: string | null; createdAt: string;
    }>;
  } catch (e) {
    console.error('[getSupportComments]', e);
    return [];
  }
}

export async function addSupportComment(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { success: false, error: '로그인이 필요합니다.' };

  const requestId = parseInt(String(formData.get('requestId') ?? '0'), 10);
  const content   = String(formData.get('content') ?? '').trim();
  const fileUrl   = formData.get('fileUrl')  ? String(formData.get('fileUrl'))  : null;
  const fileName  = formData.get('fileName') ? String(formData.get('fileName')) : null;

  if (!requestId || !content) return { success: false, error: '내용을 입력해주세요.' };

  try {
    await sql`
      INSERT INTO support_comments (request_id, author_id, author_name, content, file_url, file_name)
      VALUES (${requestId}, ${session.user.id}, ${session.user.name ?? '익명'}, ${content}, ${fileUrl}, ${fileName})
    `;
    await sql`UPDATE support_requests SET comments = comments + 1 WHERE id = ${requestId}`;
    revalidatePath('/support');
    return { success: true };
  } catch (e) {
    console.error('[addSupportComment]', e);
    return { success: false, error: '댓글 등록 중 오류가 발생했습니다.' };
  }
}

export async function deleteSupportComment(id: number, requestId: number) {
  const session = await auth();
  if (!session?.user) return { success: false };
  const isAdmin = session.user.role === 'admin';
  try {
    if (isAdmin) {
      await sql`DELETE FROM support_comments WHERE id = ${id}`;
    } else {
      await sql`DELETE FROM support_comments WHERE id = ${id} AND author_id = ${session.user.id}`;
    }
    await sql`UPDATE support_requests SET comments = GREATEST(0, comments - 1) WHERE id = ${requestId}`;
    revalidatePath('/support');
    return { success: true };
  } catch (e) {
    console.error('[deleteSupportComment]', e);
    return { success: false };
  }
}
