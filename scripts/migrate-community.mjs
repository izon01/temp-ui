import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';
config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL);

console.log('🚀 community_posts 테이블 생성...');
await sql`
  CREATE TABLE IF NOT EXISTS community_posts (
    id          SERIAL PRIMARY KEY,
    category    TEXT NOT NULL DEFAULT '자유게시판',
    title       TEXT NOT NULL,
    content     TEXT NOT NULL,
    author_id   INT REFERENCES participants(id),
    author_name TEXT NOT NULL DEFAULT '익명',
    has_image   BOOLEAN DEFAULT FALSE,
    comments    INT DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW()
  )
`;
console.log('✅ community_posts 테이블 생성 완료');
console.log('🎉 완료! (데이터는 reset 후 사용자가 직접 등록)');
