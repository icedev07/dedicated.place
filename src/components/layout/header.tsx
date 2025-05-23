"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, ShieldCheck, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/layout/ThemeToggle/theme-toggle';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="w-full bg-background border-b border-border shadow-sm">
      <div className="container mx-auto flex items-center justify-between py-3 px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="DedicateIt Logo" className="h-8 w-8" />
          <span className="font-bold text-xl text-primary">dedicate.place</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-6">
          <Link href="/home" className={`flex items-center gap-1 ${pathname === '/' ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
            <Home className="w-5 h-5" /> Home
          </Link>
          <Link href="/providers" className={`flex items-center gap-1 ${pathname.startsWith('/providers') ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
            <Users className="w-5 h-5" /> Provider
          </Link>
          <Link href="/guardians" className={`flex items-center gap-1 ${pathname.startsWith('/guardians') ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
            <ShieldCheck className="w-5 h-5" /> Guardian
          </Link>
        </nav>

        {/* Right side: Theme toggle & user */}
        <div className="flex items-center gap-4">
          <ModeToggle />
          <Button variant="ghost" size="icon" aria-label="User Profile">
            <UserCircle className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </header>
  );
}
