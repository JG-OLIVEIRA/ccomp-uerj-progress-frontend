
import { CourseFlowchart } from "@/components/course-flowchart";
import { getCourses } from "@/lib/courses";
import type { Course, CourseIdMapping } from "@/lib/courses";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import { RequirementsSummary } from "@/components/requirements-summary";
import { ScheduleGrid } from "@/components/schedule-grid";

type FlowchartData = {
  courses: Course[];
  semesters: number[];
  idMapping: CourseIdMapping;
};

async function FlowchartLoader() {
  const { courses, semesters, idMapping }: FlowchartData = await getCourses();
  return (
    <main className="flex-1 container mx-auto p-4 sm:p-6 md:p-8 space-y-8">
      <CourseFlowchart initialCourses={courses} initialSemesters={semesters} idMapping={idMapping} />
      <RequirementsSummary />
      <ScheduleGrid allCourses={courses} />
    </main>
  );
}

function PageSkeleton() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-20 w-full bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto p-4 sm:p-6 md:p-8">
        <div className="p-8">
            <div className="space-y-4">
                <Skeleton className="h-8 w-1/2 mx-auto" />
                <Skeleton className="h-4 w-3/4 mx-auto" />
            </div>
            <div className="grid grid-cols-8 gap-4 mt-8">
                {Array.from({ length: 8 * 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-28 w-full" />
                ))}
            </div>
        </div>
      </main>
    </div>
  );
}


export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
       <Suspense fallback={<PageSkeleton />}>
          <FlowchartLoader />
       </Suspense>
    </div>
  );
}
