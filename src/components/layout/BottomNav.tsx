'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { QrCode, History, LayoutGrid, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/AppProviders';
import { useState, useEffect } from 'react';

const navItems = [
  { href: '/', icon: QrCode, labelKey: 'navScan' },
  { href: '/history', icon: History, labelKey: 'navHistory' },
  { href: '/dashboard', icon: LayoutGrid, labelKey: 'navDashboard' },
  { href: '/profile', icon: User, labelKey: 'navProfile' },
] as const;

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <nav className="fixed bottom-4 inset-x-6 z-50 h-16 bg-card text-card-foreground border shadow-lg rounded-full">
      <div className="flex justify-around items-center h-full px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const label = t(item.labelKey);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={label}
              className={cn(
                'flex items-center justify-center p-2 rounded-full transition-all duration-200 active:scale-90',
                isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
              )}
            >
              <item.icon className={cn("h-6 w-6", isActive ? "stroke-[2.5]" : "stroke-[1.5]")} />
              {isActive && (
                <span className="ml-2 text-xs font-black uppercase tracking-tight overflow-hidden whitespace-nowrap">
                  {label}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}