/**
 * 추가 마이그레이션: assignment_submissions.content 컬럼 + post_comments 테이블
 * 실행: node scripts/migrate-additions.mjs
 */
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  console.log('🚀 추가 마이그레이션 시작...');

  // assignment_submissions 에 content 컬럼 추가
  await sql`ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS content TEXT`;
  console.log('✅ assignment_submissions.content 컬럼 추가');

  // post_comments 테이블 생성
  await sql`
    CREATE TABLE IF NOT EXISTS post_comments (
      id          SERIAL PRIMARY KEY,
      post_id     INT NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
      author_id   INT REFERENCES participants(id),
      author_name TEXT NOT NULL,
      content     TEXT NOT NULL,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log('✅ post_comments 테이블 생성');

  console.log('🎉 추가 마이그레이션 완료!');
}

migrate().catch(err => { console.error('❌ 오류:', err); process.exit(1); });
