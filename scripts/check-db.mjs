import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';

config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

const tables = await sql`SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename`;
console.log('📋 테이블:', tables.map(t => t.tablename).join(', '));

const users = await sql`SELECT id, email, name, role FROM participants ORDER BY id`;
console.log('👤 사용자:');
users.forEach(u => console.log(`  [${u.id}] ${u.email} / ${u.name} / ${u.role}`));

const notices = await sql`SELECT id, title, category FROM notices ORDER BY id`;
console.log('📢 공지:', notices.length === 0 ? '(없음)' : notices.map(n => n.title).join(', '));
