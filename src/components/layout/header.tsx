
"use client";

import { useContext, useEffect } from 'react';
import { BookOpenCheck } from 'lucide-react';
import { StudentLogin } from '../student-login';
import { StudentContext } from '@/contexts/student-context';
import type { Course } from '@/lib/courses';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function Header() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Fluxograma' },
    { href: '/students', label: 'Estudantes' },
    { href: '/teachers', label: 'Professores' },
  ];

  return (
    <header className="sticky top-0 z-20 w-full bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3">
            <BookOpenCheck className="h-7 w-7 text-primary" />
            <h1 className="text-xl font-bold text-foreground tracking-tight hidden sm:inline-block">
              CCOMP UERJ
            </h1>
          </Link>
          <nav className="flex items-center gap-4">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === link.href ? "text-primary" : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <StudentLogin />
        </div>
      </div>
    </header>
  );
}
