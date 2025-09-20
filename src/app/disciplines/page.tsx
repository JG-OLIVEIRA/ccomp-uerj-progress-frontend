
import { DisciplinesList } from '@/components/disciplines-list';
import { DisciplinesPageClient } from '@/components/disciplines-page-client';
import { Skeleton } from '@/components/ui/skeleton';
import { Suspense } from 'react';
import { getCourses } from '@/lib/courses';
import type { Course } from '@/lib/courses';

async function DisciplinesPageLoader() {
    const { courses } = await getCourses();
    
    const allDisciplines = courses.reduce((acc: Course[], course) => {
        if (course.isElectiveGroup && course.electives) {
            return [...acc, ...course.electives];
        }
        if (!course.isElectiveGroup) {
            acc.push(course);
        }
        return acc;
    }, []);

    const uniqueDisciplines = Array.from(new Map(allDisciplines.map(item => [item.id, item])).values());

    return (
      <DisciplinesPageClient initialDisciplines={uniqueDisciplines} />
    );
}

function PageSkeleton() {
  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8 space-y-8">
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-5 w-2/3" />
      </div>
      <div className="flex justify-end gap-2">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-56" />
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

export default function DisciplinesPage() {
  return (
    <main className="flex-1 container mx-auto p-4 sm:p-6 md:p-8 space-y-8">
       <Suspense fallback={<PageSkeleton />}>
          <DisciplinesPageLoader />
       </Suspense>
    </main>
  );
}
