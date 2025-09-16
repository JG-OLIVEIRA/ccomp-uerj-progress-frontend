"use client";

import { useContext } from 'react';
import { BookOpenCheck } from 'lucide-react';
import { StudentLogin } from '../student-login';
import { StudentContext } from '@/contexts/student-context';

export function Header({ allCourses }: { allCourses: any[] }) {
  const { student } = useContext(StudentContext)!;

  return (
    <header className="sticky top-0 z-20 w-full bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <BookOpenCheck className="h-7 w-7 text-primary" />
          <h1 className="text-xl font-bold text-foreground tracking-tight">
            Ccomp uerj progress
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <StudentLogin allCourses={allCourses} />
        </div>
      </div>
    </header>
  );
}
