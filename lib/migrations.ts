import { sql } from '@/lib/db';

let ran = false;

export async function runMigrations() {
  if (ran) return;
  ran = true;
  try {
    // assignment_submissions.participant_id FK → ON DELETE CASCADE
    await sql`
      DO $$
      DECLARE
        v_constraint text;
      BEGIN
        SELECT conname INTO v_constraint
        FROM pg_constraint
        WHERE conrelid = 'assignment_submissions'::regclass
          AND contype = 'f'
          AND confrelid = 'participants'::regclass
        LIMIT 1;

        IF v_constraint IS NOT NULL THEN
          EXECUTE format('ALTER TABLE assignment_submissions DROP CONSTRAINT %I', v_constraint);
        END IF;

        -- 이미 CASCADE 제약이 없는 경우에만 추가
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint c
          JOIN pg_class cl ON cl.oid = c.conrelid
          WHERE cl.relname = 'assignment_submissions'
            AND c.contype = 'f'
            AND c.confdeltype = 'c'  -- 'c' = CASCADE
        ) THEN
          ALTER TABLE assignment_submissions
            ADD CONSTRAINT assignment_submissions_participant_id_fkey
            FOREIGN KEY (participant_id)
            REFERENCES participants(id)
            ON DELETE CASCADE;
        END IF;
      END
      $$;
    `;

    // notices file_name 컬럼
    await sql`ALTER TABLE notices ADD COLUMN IF NOT EXISTS file_name TEXT`;

  } catch (e) {
    console.error('[migrations]', e);
  }
}
