'use client'; // Ini adalah Komponen Klien

import { SessionProvider } from 'next-auth/react';

// Ini adalah komponen pembungkus
export default function AuthProvider({ children }) {
  // SessionProvider menyediakan data session (status login)
  // ke semua komponen di dalamnya
  return <SessionProvider>{children}</SessionProvider>;
}