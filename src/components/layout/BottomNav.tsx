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
    <nav className="fixed bottom-4 inset-x-6 z-50 h-16 bg-card/85 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.6)] animate-in slide-in-from-bottom-8 duration-300 ease-in-out">
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
                'flex items-center justify-center p-2 rounded-2xl transition-all duration-200 ease-out h-12 select-none active:scale-90',
                 isActive 
                  ? 'bg-primary text-primary-foreground shadow-[0_4px_12px_rgba(22,163,74,0.3)] gap-2 px-5' 
                  : 'text-muted-foreground w-12 hover:bg-muted/50'
              )}
            >
              <item.icon className={cn("shrink-0", isActive ? "h-5 w-5" : "h-6 w-6")} />
              {isActive && <span className="text-xs font-black uppercase tracking-widest whitespace-nowrap" aria-hidden="true">{label}</span>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}