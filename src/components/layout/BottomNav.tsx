'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { QrCode, History, LayoutGrid, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/AppProviders';

const navItems = [
  { href: '/', icon: QrCode, labelKey: 'navScan' },
  { href: '/history', icon: History, labelKey: 'navHistory' },
  { href: '/dashboard', icon: LayoutGrid, labelKey: 'navDashboard' },
  { href: '/profile', icon: User, labelKey: 'navProfile' },
] as const;

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <nav className="fixed bottom-4 inset-x-6 z-50 h-16 bg-card/80 backdrop-blur-xl border-2 rounded-full shadow-2xl animate-in slide-in-from-bottom-8 duration-300 ease-in-out">
      <div className="flex justify-around items-center h-full max-w-lg mx-auto p-1.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const label = t(item.labelKey);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={label}
              className={cn(
                'flex items-center justify-center p-2 rounded-full transition-all duration-300 ease-in-out h-12',
                 isActive 
                  ? 'bg-primary text-primary-foreground shadow-lg gap-2 px-4 scale-105' 
                  : 'text-muted-foreground w-12 hover:bg-muted/50 active:scale-90'
              )}
            >
              <item.icon className={cn("shrink-0", isActive ? "h-5 w-5" : "h-6 w-6")} />
              {isActive && <span className="text-sm font-bold whitespace-nowrap" aria-hidden="true">{label}</span>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}