import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      role: 'admin' | 'participant';
      id: string;
    } & DefaultSession['user'];
  }
  interface User {
    role: 'admin' | 'participant';
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        loginId:  { label: '아이디',   type: 'text'     },
        password: { label: '비밀번호', type: 'password' },
      },
      async authorize(credentials) {
        const loginId  = String(credentials?.loginId  ?? '').trim();
        const password = String(credentials?.password ?? '').trim();
        if (!loginId || !password) return null;

        try {
          const { sql } = await import('@/lib/db');

          // login_id 컬럼으로 조회 (없으면 email fallback)
          let rows;
          try {
            rows = await sql`
              SELECT id, email, login_id, name, role, password_hash
              FROM participants
              WHERE login_id = ${loginId}
              LIMIT 1
            `;
          } catch {
            // login_id 컬럼이 아직 없을 경우 email 앞부분으로 fallback
            rows = await sql`
              SELECT id, email, name, role, password_hash
              FROM participants
              WHERE split_part(email, '@', 1) = ${loginId}
              LIMIT 1
            `;
          }

          const user = rows[0];
          if (!user) return null;

          const valid = await bcrypt.compare(password, user.password_hash as string);
          if (!valid) return null;

          // 로그인 성공 시 마지막 접속 시간 갱신
          await sql`UPDATE participants SET last_access = CURRENT_DATE WHERE id = ${user.id}`;

          return {
            id:    String(user.id),
            email: user.email as string,
            name:  user.name as string,
            role:  user.role as 'admin' | 'participant',
          };
        } catch (err) {
          console.error('[auth] DB 조회 오류:', err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id   = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id   = token.id as string;
      session.user.role = token.role as 'admin' | 'participant';
      return session;
    },
  },
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
});
