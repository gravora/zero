'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Registration is handled through login (auto-creates user)
// Redirect to login page
export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/auth/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F1225]">
      <div className="animate-pulse text-cyan-400">Перенаправление...</div>
    </div>
  );
}
