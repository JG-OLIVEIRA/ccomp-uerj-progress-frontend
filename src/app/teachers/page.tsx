
import { TeachersList } from '@/components/teachers-list';
import { Skeleton } from '@/components/ui/skeleton';
import { Suspense } from 'react';
import { getCourses } from '@/lib/courses';

export type Teacher = {
  teacherId: string;
  name: string;
  disciplines: string[];
};

async function fetchAllTeachers(): Promise<Teacher[]> {
  try {
    const res = await fetch('https://ccomp-uerj-progress-backend.onrender.com/teachers', {
      next: { revalidate: 3600 } // Revalidate every hour
    });
    if (!res.ok) {
      console.error("Failed to fetch teachers");
      return [];
    }
    return res.json();
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return [];
  }
}

async function TeachersPageLoader() {
    const [teachers, { courses, idMapping }] = await Promise.all([
        fetchAllTeachers(),
        getCourses()
    ]);
    
    const disciplineNames: Record<string, string> = {};
    courses.forEach(course => {
        if(course.disciplineId) {
            disciplineNames[course.disciplineId] = course.name;
        }
        if(course.electives) {
            course.electives.forEach(elective => {
                if(elective.disciplineId) {
                    disciplineNames[elective.disciplineId] = elective.name;
                }
            });
        }
    });

    return <TeachersList initialTeachers={teachers} disciplineNames={disciplineNames} />;
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


export default function TeachersPage() {
  return (
    <main className="flex-1 container mx-auto p-4 sm:p-6 md:p-8 space-y-8">
       <Suspense fallback={<PageSkeleton />}>
          <TeachersPageLoader />
       </Suspense>
    </main>
  );
}
