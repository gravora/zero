'use client';

import { SessionProvider } from 'next-auth/react';
import { useEffect, useState, ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F1225]">
        <div className="animate-pulse text-cyan-400">Loading...</div>
      </div>
    );
  }

  return <SessionProvider>{children}</SessionProvider>;
}
