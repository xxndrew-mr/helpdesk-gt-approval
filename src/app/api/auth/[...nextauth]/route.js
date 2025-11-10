import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from '@/lib/prisma'; // Gunakan jembatan Prisma kita
import bcrypt from 'bcryptjs';

export const authOptions = {
  // Konfigurasi provider (kita pakai 'credentials' / email-password)
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      // Fungsi 'authorize' inilah yang akan dijalankan saat kita memanggil signIn()
      async authorize(credentials) {
        // Cek jika email atau password tidak ada
        if (!credentials.email || !credentials.password) {
          throw new Error('Email dan password wajib diisi.');
        }

        // 1. Cari user di database
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          // PENTING: Ambil data Role dan Division terkait
          include: {
            role: true,
            division: true,
          },
        });

        // 2. Jika user tidak ditemukan
        if (!user) {
          throw new Error('Email tidak terdaftar.');
        }

        // 3. Cek password
        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        );

        // Jika password salah
        if (!isPasswordCorrect) {
          throw new Error('Password salah.');
        }

        // 4. Jika semua berhasil, kembalikan data user
        // Data ini akan diteruskan ke callback JWT
        return user;
      },
    }),
  ],

  // Konfigurasi session (kita pakai JWT)
  session: {
    strategy: 'jwt',
  },

  // Callbacks untuk memodifikasi token dan session
  callbacks: {
    // Callback 'jwt' dipanggil SETELAH 'authorize'
    // 'user' adalah data yang kita 'return' dari authorize
    async jwt({ token, user }) {
      if (user) {
        // Saat login, tambahkan data penting ke token
        token.id = user.user_id;
        token.email = user.email;
        token.name = user.name;
        // Ambil nama role dan divisi (jika ada)
        token.role = user.role?.role_name || null;
        token.division = user.division?.division_name || null;
      }
      return token;
    },

    // Callback 'session' dipanggil SETELAH 'jwt'
    // 'token' adalah data yang kita proses di callback 'jwt'
    async session({ session, token }) {
      if (token) {
        // Tambahkan data dari token ke 'session.user'
        // Ini adalah data yang akan bisa diakses di frontend
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.division = token.division;
      }
      return session;
    },
  },

  // Tentukan halaman login kustom kita
  pages: {
    signIn: '/login',
  },

  // Gunakan NEXTAUTH_SECRET yang kita buat di .env
  secret: process.env.NEXTAUTH_SECRET,
};

// Ekspor handler Next-Auth
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };