
import { DisciplinesList } from '@/components/disciplines-list';
import { Skeleton } from '@/components/ui/skeleton';
import { Suspense } from 'react';
import { getCourses } from '@/lib/courses';
import type { Course } from '@/lib/courses';

async function DisciplinesPageLoader() {
    const { courses } = await getCourses();
    
    // Flatten the courses and their electives into a single list for display
    const allDisciplines = courses.reduce((acc: Course[], course) => {
        if (course.isElectiveGroup && course.electives) {
            // Add electives from the group
            return [...acc, ...course.electives];
        }
        // Add the main course if it's not just a container
        if (!course.isElectiveGroup) {
            acc.push(course);
        }
        return acc;
    }, []);

    // Remove duplicates that might appear (e.g. if an elective is listed somewhere else)
    const uniqueDisciplines = Array.from(new Map(allDisciplines.map(item => [item.id, item])).values());

    return <DisciplinesList initialDisciplines={uniqueDisciplines} />;
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

export default function DisciplinesPage() {
  return (
    <main className="flex-1 container mx-auto p-4 sm:p-6 md:p-8 space-y-8">
       <Suspense fallback={<PageSkeleton />}>
          <DisciplinesPageLoader />
       </Suspense>
    </main>
  );
}
