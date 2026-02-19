'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { SettingsProvider } from '@/contexts/SettingsContext';
import BottomNav from './BottomNav';

const pathsWithNav = ['/', '/history', '/dashboard', '/settings'];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const showNav = pathsWithNav.includes(pathname);

  return (
    <SettingsProvider>
      <div className="flex flex-col h-svh">
        <main className={`flex-1 overflow-y-auto ${showNav ? 'pb-16' : ''}`}>
            {children}
        </main>
        {showNav && <BottomNav />}
      </div>
    </SettingsProvider>
  );
}
