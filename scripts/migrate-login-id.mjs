/**
 * 아이디 기반 로그인 마이그레이션
 * 실행: node scripts/migrate-login-id.mjs
 */
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  console.log('🚀 login_id 마이그레이션 시작...');

  // login_id 컬럼 추가
  await sql`ALTER TABLE participants ADD COLUMN IF NOT EXISTS login_id TEXT`;
  console.log('✅ login_id 컬럼 추가');

  // 기존 계정 login_id 세팅 (이메일 앞부분)
  await sql`
    UPDATE participants
    SET login_id = split_part(email, '@', 1)
    WHERE login_id IS NULL OR login_id = ''
  `;
  console.log('✅ 기존 계정 login_id 업데이트');

  // UNIQUE 제약 추가 (없으면)
  try {
    await sql`ALTER TABLE participants ADD CONSTRAINT participants_login_id_unique UNIQUE (login_id)`;
    console.log('✅ login_id UNIQUE 제약 추가');
  } catch {
    console.log('ℹ️  UNIQUE 제약 이미 존재');
  }

  // 결과 확인
  const rows = await sql`SELECT id, name, login_id, email, role FROM participants ORDER BY id`;
  console.log('\n📋 현재 계정 목록:');
  for (const r of rows) {
    console.log(`  ${r.role === 'admin' ? '👑' : '👤'} ${r.name}  →  login_id: ${r.login_id}  (${r.email})`);
  }

  console.log('\n🎉 마이그레이션 완료!');
}

migrate().catch(err => { console.error('❌ 오류:', err); process.exit(1); });
