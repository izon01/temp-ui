import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
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

// 임시 유저 데이터 — Vercel Postgres 연결 시 아래 TODO 부분을 DB 쿼리로 교체
const mockUsers = [
  { id: '0', email: 'admin@gyeongbuk.kr',      password: 'admin1234', name: '관리자 김청년', role: 'admin' as const },
  { id: '1', email: 'kimjisoo@gyeongbuk.kr',   password: 'pass1234',  name: '김지수',      role: 'participant' as const },
  { id: '2', email: 'leeminho@gyeongbuk.kr',   password: 'pass1234',  name: '이민호',      role: 'participant' as const },
  { id: '3', email: 'parkseoyeon@gyeongbuk.kr',password: 'pass1234',  name: '박서연',      role: 'participant' as const },
];

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email:    { label: '이메일',   type: 'email'    },
        password: { label: '비밀번호', type: 'password' },
      },
      async authorize(credentials) {
        const email    = String(credentials?.email    ?? '').trim();
        const password = String(credentials?.password ?? '').trim();
        if (!email || !password) return null;

        // TODO: Vercel Postgres 연결 후 아래 코드로 교체
        // import { sql } from '@vercel/postgres';
        // const { rows } = await sql`
        //   SELECT id, email, name, role, password_hash
        //   FROM participants WHERE email = ${email}
        // `;
        // const user = rows[0];
        // if (!user) return null;
        // const valid = await bcrypt.compare(password, user.password_hash);
        // if (!valid) return null;
        // return { id: String(user.id), email: user.email, name: user.name, role: user.role };

        const user = mockUsers.find(
          u => u.email === email && u.password === password
        );
        if (!user) return null;
        return { id: user.id, email: user.email, name: user.name, role: user.role };
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
