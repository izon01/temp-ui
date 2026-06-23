import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

async function migrate() {
  console.log('🚀 DB 마이그레이션 시작...');

  // participants (사용자) 테이블
  await sql`
    CREATE TABLE IF NOT EXISTS participants (
      id        SERIAL PRIMARY KEY,
      email     TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name      TEXT NOT NULL,
      role      TEXT NOT NULL DEFAULT 'participant',
      team      TEXT,
      track     TEXT,
      attendance INT DEFAULT 0,
      status    TEXT DEFAULT '정상',
      last_access TEXT DEFAULT '오늘',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log('✅ participants 테이블 생성');

  // notices 테이블
  await sql`
    CREATE TABLE IF NOT EXISTS notices (
      id         SERIAL PRIMARY KEY,
      title      TEXT NOT NULL,
      content    TEXT NOT NULL,
      category   TEXT NOT NULL DEFAULT '공지',
      is_pinned  BOOLEAN DEFAULT FALSE,
      icon       TEXT DEFAULT 'campaign',
      author_id  INT REFERENCES participants(id),
      views      INT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log('✅ notices 테이블 생성');

  // assignment_submissions 테이블
  await sql`
    CREATE TABLE IF NOT EXISTS assignment_submissions (
      id             SERIAL PRIMARY KEY,
      assignment_id  INT NOT NULL,
      participant_id INT REFERENCES participants(id),
      link           TEXT,
      file_name      TEXT,
      status         TEXT DEFAULT 'pending',
      submitted_at   TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(assignment_id, participant_id)
    )
  `;
  console.log('✅ assignment_submissions 테이블 생성');

  // 시드 데이터 — 관리자 + 참여자 계정
  const adminHash       = await bcrypt.hash('admin1234', 10);
  const participantHash = await bcrypt.hash('pass1234', 10);

  const seedUsers = [
    { email: 'admin@gyeongbuk.kr',       hash: adminHash,       name: '관리자 김청년', role: 'admin',       team: null,  track: null },
    { email: 'kimjisoo@gyeongbuk.kr',    hash: participantHash, name: '김지수',        role: 'participant', team: 'A팀', track: 'AI 솔루션 트랙' },
    { email: 'leeminho@gyeongbuk.kr',    hash: participantHash, name: '이민호',        role: 'participant', team: 'B팀', track: '플랫폼 개발 트랙' },
    { email: 'parkseoyeon@gyeongbuk.kr', hash: participantHash, name: '박서연',        role: 'participant', team: 'A팀', track: 'UI/UX 디자인 트랙' },
  ];

  for (const u of seedUsers) {
    await sql`
      INSERT INTO participants (email, password_hash, name, role, team, track)
      VALUES (${u.email}, ${u.hash}, ${u.name}, ${u.role}, ${u.team}, ${u.track})
      ON CONFLICT (email) DO NOTHING
    `;
  }
  console.log('✅ 시드 사용자 4명 등록');

  console.log('🎉 마이그레이션 완료!');
}

migrate().catch(err => { console.error('❌ 오류:', err); process.exit(1); });
