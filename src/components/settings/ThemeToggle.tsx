'use client';

import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Theme } from '@/lib/types';

interface ThemeToggleProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export function ThemeToggle({ theme, onThemeChange }: ThemeToggleProps) {
  const isDark = theme === 'dark';

  return (
    <div 
      className="relative w-full h-16 bg-muted rounded-2xl p-1.5 flex cursor-pointer transition-all duration-300 shadow-inner"
      onClick={() => onThemeChange(isDark ? 'light' : 'dark')}
    >
      {/* Light Side */}
      <div className="flex-1 flex items-center justify-center z-10">
        <div className={cn(
          "flex items-center gap-2 transition-all duration-300",
          !isDark ? "opacity-100 scale-100" : "opacity-30 scale-90"
        )}>
          <Sun className={cn("h-5 w-5", !isDark ? "text-orange-500 fill-orange-500" : "text-muted-foreground")} />
          <span className={cn("font-bold text-sm", !isDark ? "text-foreground" : "text-muted-foreground")}>Light</span>
        </div>
      </div>

      {/* Dark Side */}
      <div className="flex-1 flex items-center justify-center z-10">
        <div className={cn(
          "flex items-center gap-2 transition-all duration-300",
          isDark ? "opacity-100 scale-100" : "opacity-30 scale-90"
        )}>
          <Moon className={cn("h-5 w-5", isDark ? "text-blue-400 fill-blue-400" : "text-muted-foreground")} />
          <span className={cn("font-bold text-sm", isDark ? "text-foreground" : "text-muted-foreground")}>Dark</span>
        </div>
      </div>

      {/* 3D Slider */}
      <div 
        className={cn(
          "absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-xl transition-all duration-300 ease-in-out shadow-xl border border-white/10",
          isDark ? "translate-x-full bg-[#1F2937]" : "translate-x-0 bg-white"
        )}
      />
    </div>
  );
}