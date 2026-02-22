'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { AppProviders } from '@/contexts/AppProviders';
import BottomNav from './BottomNav';
import { cn } from '@/lib/utils';

const pathsWithNav = ['/', '/history', '/dashboard', '/profile', '/settings'];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const showNav = pathsWithNav.includes(pathname);

  return (
    <AppProviders>
      <div className="flex flex-col h-svh bg-background">
        <main key={pathname} className={cn('flex-1 overflow-y-auto animate-in fade-in-0 duration-200 ease-out', showNav ? 'pb-28' : '')}>
            {children}
        </main>
        {showNav && <BottomNav />}
      </div>
    </AppProviders>
  );
}
