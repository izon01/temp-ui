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
        email:    { label: '이메일',   type: 'email'    },
        password: { label: '비밀번호', type: 'password' },
      },
      async authorize(credentials) {
        const email    = String(credentials?.email    ?? '').trim();
        const password = String(credentials?.password ?? '').trim();
        if (!email || !password) return null;

        try {
          const { sql } = await import('@/lib/db');
          const rows = await sql`
            SELECT id, email, name, role, password_hash
            FROM participants
            WHERE email = ${email}
            LIMIT 1
          `;
          const user = rows[0];
          if (!user) return null;

          const valid = await bcrypt.compare(password, user.password_hash as string);
          if (!valid) return null;

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
