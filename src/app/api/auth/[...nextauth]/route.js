import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials.username || !credentials.password) {
          throw new Error('Username dan password wajib diisi.');
        }

        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
          include: {
            role: true,
            division: true,
          },
        });

        if (!user) throw new Error('Username tidak ditemukan.');

        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) throw new Error('Password salah.');

        if (user.status !== 'Active') {
          throw new Error('Akun Anda telah dinonaktifkan.');
        }

        // === RETURN OBJECT YANG BENAR ===
        return {
          id: user.user_id,
          name: user.name,
          username: user.username,
          role: user.role?.role_name || null,
          divisionName: user.division?.division_name || null,
          divisionId: user.division_id || null,
        };
      },
    }),
  ],

  session: { strategy: 'jwt' },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.name = user.name;
        token.role = user.role;
        token.divisionName = user.divisionName;
        token.divisionId = user.divisionId;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.name = token.name;
        session.user.role = token.role;
        session.user.divisionName = token.divisionName;
        session.user.divisionId = token.divisionId;
      }
      return session;
    },
  },

  pages: { signIn: '/login' },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
