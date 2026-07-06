'use server';

import { sql } from '@/lib/db';
import { Resend } from 'resend';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(email: string): Promise<{ success: boolean; error?: string }> {
  if (!email?.trim()) return { success: false, error: '이메일을 입력해주세요.' };

  try {
    // 이메일로 사용자 확인
    const users = await sql`SELECT id, name FROM participants WHERE email = ${email.trim()} LIMIT 1`;
    // 사용자가 없어도 성공 응답 (보안상 이메일 존재 여부 노출 방지)
    if (users.length === 0) return { success: true };

    const user = users[0];

    // 기존 토큰 삭제 후 새 토큰 생성
    await sql`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id         SERIAL PRIMARY KEY,
        user_id    INTEGER NOT NULL,
        token      TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMPTZ NOT NULL,
        used       BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`DELETE FROM password_reset_tokens WHERE user_id = ${user.id}`;

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30분

    await sql`
      INSERT INTO password_reset_tokens (user_id, token, expires_at)
      VALUES (${user.id}, ${token}, ${expiresAt.toISOString()})
    `;

    const resetUrl = `${process.env.NEXTAUTH_URL ?? 'https://www.gytschool.co.kr'}/reset-password?token=${token}`;

    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email.trim(),
      subject: '[경북청년인재스쿨] 비밀번호 재설정 안내',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
          <h2 style="color: #00327d; margin-bottom: 8px;">비밀번호 재설정</h2>
          <p style="color: #434653; margin-bottom: 24px;">
            안녕하세요, <strong>${user.name}</strong>님.<br/>
            비밀번호 재설정 요청이 접수되었습니다.
          </p>
          <a href="${resetUrl}"
            style="display: inline-block; background: #0047ab; color: white; font-weight: bold;
                   padding: 14px 28px; border-radius: 8px; text-decoration: none; margin-bottom: 24px;">
            비밀번호 재설정하기
          </a>
          <p style="color: #737784; font-size: 13px;">
            이 링크는 <strong>30분</strong> 후 만료됩니다.<br/>
            본인이 요청하지 않으셨다면 이 이메일을 무시하셔도 됩니다.
          </p>
        </div>
      `,
    });

    return { success: true };
  } catch (e) {
    console.error('[sendPasswordResetEmail]', e);
    return { success: false, error: '이메일 발송 중 오류가 발생했습니다.' };
  }
}

export async function resetPassword(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  if (!token || !newPassword) return { success: false, error: '잘못된 요청입니다.' };
  if (newPassword.length < 6) return { success: false, error: '비밀번호는 6자 이상이어야 합니다.' };

  try {
    const rows = await sql`
      SELECT user_id FROM password_reset_tokens
      WHERE token = ${token} AND used = false AND expires_at > NOW()
      LIMIT 1
    `;
    if (rows.length === 0) return { success: false, error: '링크가 만료되었거나 이미 사용된 링크입니다.' };

    const userId = rows[0].user_id;
    const hash = await bcrypt.hash(newPassword, 10);

    await sql`UPDATE participants SET password_hash = ${hash} WHERE id = ${userId}`;
    await sql`UPDATE password_reset_tokens SET used = true WHERE token = ${token}`;

    return { success: true };
  } catch (e) {
    console.error('[resetPassword]', e);
    return { success: false, error: '비밀번호 재설정 중 오류가 발생했습니다.' };
  }
}
