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
    <nav className="fixed bottom-0 inset-x-0 z-50 h-20 bg-background/80 backdrop-blur-xl border-t border-border/40 pb-safe-area-inset-bottom animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-around items-center h-full max-w-lg mx-auto px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const label = t(item.labelKey);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={label}
              className={cn(
                'flex flex-col items-center justify-center w-16 gap-1 transition-all duration-200 ios-active',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <div className={cn(
                "p-1.5 rounded-full transition-all duration-300",
                isActive && "bg-primary/10"
              )}>
                <item.icon className={cn("h-6 w-6", isActive ? "stroke-[2.5]" : "stroke-[1.5]")} />
              </div>
              <span className="text-[10px] font-bold tracking-tight uppercase leading-none">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}