import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';
config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL);

console.log('🗑️  게시글 데이터 초기화 시작 (participants 유지)...');
await sql`TRUNCATE TABLE assignment_submissions RESTART IDENTITY CASCADE`;
await sql`TRUNCATE TABLE notices              RESTART IDENTITY CASCADE`;
await sql`TRUNCATE TABLE assignments          RESTART IDENTITY CASCADE`;
// community_posts 는 아래 migrate에서 생성됨 — 있으면 함께 초기화
try { await sql`TRUNCATE TABLE community_posts RESTART IDENTITY CASCADE`; } catch {}
console.log('✅ notices / assignments / assignment_submissions / community_posts 초기화 완료');

const users = await sql`SELECT id, email, role FROM participants ORDER BY id`;
console.log(`✅ participants ${users.length}명 유지:`);
users.forEach(u => console.log(`   [${u.id}] ${u.email} (${u.role})`));
