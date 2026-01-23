// Lokasi: src/app/api/auth/[...nextauth]/route.js

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        // Ubah label form login default NextAuth (walau kita pakai custom UI)
        username: { label: 'Username', type: 'text' }, // <-- GANTI EMAIL JADI USERNAME
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Cek input
        if (!credentials.username || !credentials.password) {
          throw new Error('Username dan password wajib diisi.');
        }

        // --- PERUBAHAN: Cari user berdasarkan USERNAME ---
        const user = await prisma.user.findUnique({
          where: { username: credentials.username }, // <-- Look up by username
          include: {
            role: true,
            division: true,
          },
        });

        if (!user) {
          throw new Error('Username tidak ditemukan.');
        }
        // ------------------------------------------------

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordCorrect) {
          throw new Error('Password salah.');
        }
        
        if (user.status !== 'Active') {
          throw new Error('Akun Anda telah dinonaktifkan.');
        }

        return user;
      },
    }),
  ],

  session: { strategy: 'jwt' },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.user_id;
        token.username = user.username; // Simpan username di token
        token.name = user.name;
        token.role = user.role?.role_name || null;
        token.divisionName = user.division?.division_name || null; 
        token.divisionId = user.division_id || null;
        token.phone = user.phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username; // Kirim ke session
        session.user.role = token.role;
        session.user.divisionName = token.divisionName;
        session.user.divisionId = token.divisionId;
        session.user.phone = token.phone;
      }
      return session;
    },
  },
  pages: { signIn: '/login' },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };