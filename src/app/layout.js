import { Inter } from 'next/font/google';
import './globals.css';
import AuthProvider from './AuthProvider'; // <-- IMPORT

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Helpdesk App',
  description: 'Aplikasi Helpdesk GT',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Bungkus 'children' dengan AuthProvider */}
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}