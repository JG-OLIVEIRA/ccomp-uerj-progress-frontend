
"use client";

import { useContext, useEffect } from 'react';
import { BookOpenCheck } from 'lucide-react';
import { StudentLogin } from '../student-login';
import { StudentContext } from '@/contexts/student-context';
import type { Course } from '@/lib/courses';

export function Header({ allCourses }: { allCourses: Course[] }) {
  const { student, setAllCourses } = useContext(StudentContext)!;

  useEffect(() => {
    // Load courses into the context once they are fetched.
    if (allCourses.length > 0) {
      setAllCourses(allCourses);
    }
  }, [allCourses, setAllCourses]);

  return (
    <header className="sticky top-0 z-20 w-full bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <BookOpenCheck className="h-7 w-7 text-primary" />
          <h1 className="text-xl font-bold text-foreground tracking-tight">
            CCOMP UERJ PROGRESS
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <StudentLogin />
        </div>
      </div>
    </header>
  );
}
