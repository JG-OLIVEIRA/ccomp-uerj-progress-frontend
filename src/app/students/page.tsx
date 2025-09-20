
import { StudentsList } from '@/components/students-list';
import { Skeleton } from '@/components/ui/skeleton';
import { Suspense } from 'react';
import type { Student } from '@/lib/student';

async function fetchAllStudents(): Promise<Student[]> {
  try {
    const res = await fetch('https://ccomp-uerj-progress-backend.onrender.com/students', {
      next: { revalidate: 3600 } // Revalidate every hour
    });
    if (!res.ok) {
      console.error("Failed to fetch students");
      return [];
    }
    return res.json();
  } catch (error) {
    console.error("Error fetching students:", error);
    return [];
  }
}

async function StudentsPageLoader() {
    const students = await fetchAllStudents();
    return <StudentsList initialStudents={students} />;
}

function PageSkeleton() {
  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8 space-y-8">
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-5 w-2/3" />
      </div>
      <Skeleton className="h-12 w-full" />
      <div className="space-y-2">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  );
}

export default function StudentsPage() {
  return (
    <main className="flex-1 container mx-auto p-4 sm:p-6 md:p-8 space-y-8">
      <Suspense fallback={<PageSkeleton />}>
        <StudentsPageLoader />
      </Suspense>
    </main>
  );
}
