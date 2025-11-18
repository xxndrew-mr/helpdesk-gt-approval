// Lokasi File: app/api/auth/[...nextauth]/route.js

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials.email || !credentials.password) {
          throw new Error('Email dan password wajib diisi.');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            role: true,
            division: true,
          },
        });

        if (!user) {
          throw new Error('Email tidak terdaftar.');
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordCorrect) {
          throw new Error('Password salah.');
        }
        
        // --- PERUBAHAN DI SINI ---
        // Cek apakah user 'Active'
        if (user.status !== 'Active') {
          throw new Error('Akun Anda telah dinonaktifkan.');
        }
        // -------------------------

        return user;
      },
    }),
  ],

  session: {
    strategy: 'jwt',
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.user_id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role?.role_name || null;
        token.divisionName = user.division?.division_name || null; 
        token.divisionId = user.division_id || null;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.divisionName = token.divisionName;
        session.user.divisionId = token.divisionId;
      }
      return session;
    },
  },

  pages: {
    signIn: '/login',
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };