'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { QrCode, History, LayoutGrid, Settings as SettingsIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettings } from '@/contexts/SettingsContext';

const navItems = [
  { href: '/', icon: QrCode, labelKey: 'navScan' },
  { href: '/history', icon: History, labelKey: 'navHistory' },
  { href: '/dashboard', icon: LayoutGrid, labelKey: 'navDashboard' },
  { href: '/settings', icon: SettingsIcon, labelKey: 'navSettings' },
] as const;

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useSettings();

  return (
    <nav className="fixed bottom-4 inset-x-4 z-50 h-20 bg-card/80 backdrop-blur-xl border rounded-full shadow-2xl animate-in slide-in-from-bottom-4 duration-500 ease-in-out">
      <div className="flex justify-around items-center h-full max-w-lg mx-auto p-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-center p-3 rounded-full transition-all duration-300 ease-in-out h-14',
                 isActive ? 'bg-primary text-primary-foreground shadow-lg gap-2 px-4' : 'text-muted-foreground w-14 hover:bg-muted/50'
              )}
            >
              <item.icon className="h-6 w-6 shrink-0" />
              {isActive && <span className="text-sm font-medium whitespace-nowrap">{t(item.labelKey)}</span>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
