'use server';

import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { sql } from '@/lib/db';

export async function registerUser(formData: FormData) {
  const loginId        = String(formData.get('loginId')        ?? '').trim();
  const password       = String(formData.get('password')       ?? '').trim();
  const passwordConfirm = String(formData.get('passwordConfirm') ?? '').trim();
  const name           = String(formData.get('name')           ?? '').trim();
  const phone          = String(formData.get('phone')          ?? '').trim();

  if (!loginId || !password || !name) {
    return { success: false, error: '모든 항목을 입력해 주세요.' };
  }
  if (loginId.length < 3 || loginId.length > 20) {
    return { success: false, error: '아이디는 3~20자 사이여야 합니다.' };
  }
  if (!/^[a-z0-9_]+$/.test(loginId)) {
    return { success: false, error: '아이디는 영소문자, 숫자, 밑줄(_)만 사용 가능합니다.' };
  }
  if (password.length < 6) {
    return { success: false, error: '비밀번호는 6자 이상이어야 합니다.' };
  }
  if (password !== passwordConfirm) {
    return { success: false, error: '비밀번호가 일치하지 않습니다.' };
  }
  if (name.length < 2) {
    return { success: false, error: '이름은 2자 이상이어야 합니다.' };
  }

  try {
    // login_id 컬럼 자동 추가 (미마이그레이션 환경 대비)
    await sql`ALTER TABLE participants ADD COLUMN IF NOT EXISTS login_id TEXT`;
    try {
      await sql`ALTER TABLE participants ADD CONSTRAINT participants_login_id_unique UNIQUE (login_id)`;
    } catch { /* 이미 존재 */ }

    // 기존 계정 login_id 세팅 (최초 1회)
    await sql`
      UPDATE participants
      SET login_id = split_part(email, '@', 1)
      WHERE login_id IS NULL OR login_id = ''
    `;

    // 아이디 중복 확인
    const existing = await sql`
      SELECT id FROM participants WHERE login_id = ${loginId} LIMIT 1
    `;
    if (existing.length > 0) {
      return { success: false, error: '이미 사용 중인 아이디입니다.' };
    }

    // phone 컬럼 자동 추가
    await sql`ALTER TABLE participants ADD COLUMN IF NOT EXISTS phone TEXT`;

    const passwordHash = await bcrypt.hash(password, 10);
    const email = `${loginId}@gyeongbuk.kr`; // 내부 식별용 이메일

    await sql`
      INSERT INTO participants (login_id, email, password_hash, name, role, phone)
      VALUES (${loginId}, ${email}, ${passwordHash}, ${name}, 'participant', ${phone || null})
    `;
  } catch (err: unknown) {
    console.error('[registerUser]', err);
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('unique') || msg.includes('duplicate')) {
      return { success: false, error: '이미 사용 중인 아이디입니다.' };
    }
    return { success: false, error: '회원가입 중 오류가 발생했습니다.' };
  }

  redirect('/login?registered=1');
}
