import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';

config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

console.log('🚀 assignments 테이블 마이그레이션...');

await sql`
  CREATE TABLE IF NOT EXISTS assignments (
    id          SERIAL PRIMARY KEY,
    week        INT NOT NULL,
    title       TEXT NOT NULL,
    description TEXT DEFAULT '',
    deadline    DATE NOT NULL,
    created_by  INT REFERENCES participants(id),
    created_at  TIMESTAMPTZ DEFAULT NOW()
  )
`;
console.log('✅ assignments 테이블 생성');

// 기존 목 데이터를 시드로 삽입 (관리자 id=1)
const seeds = [
  { week: 10, title: '스타트업 비즈니스 모델 캔버스 작성', description: '제시된 템플릿에 따라 본인의 사업 아이템을 9가지 영역으로 분석하여 제출하세요.', deadline: '2026-06-26' },
  { week: 9,  title: '경북 특화 산업 동향 분석 리포트',    description: '로컬 크리에이터로서 바라본 경상북도 산업의 현재와 미래에 대한 분석 보고서.', deadline: '2026-06-16' },
  { week: 8,  title: '퍼스널 브랜딩 전략 기획안',          description: '전문 인재로서 자신의 강점을 분석하고 차별화된 시장 가치를 창출하는 전략 수립.', deadline: '2026-06-09' },
];

for (const s of seeds) {
  await sql`
    INSERT INTO assignments (week, title, description, deadline, created_by)
    VALUES (${s.week}, ${s.title}, ${s.description}, ${s.deadline}, 1)
    ON CONFLICT DO NOTHING
  `;
}
console.log('✅ 시드 과제 3건 삽입');
console.log('🎉 완료!');
