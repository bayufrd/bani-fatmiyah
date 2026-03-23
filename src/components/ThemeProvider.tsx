'use client';

import { ReactNode, useEffect, useState } from 'react';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check localStorage and system preference
    const stored = localStorage.getItem('theme');
    const dark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Apply immediately
    const html = document.documentElement;
    if (dark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, []);

  if (!mounted) return <>{children}</>;

  return <>{children}</>;
}
