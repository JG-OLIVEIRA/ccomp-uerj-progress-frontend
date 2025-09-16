import type { Course, CourseCategory } from '@/lib/courses';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Book, List, HelpCircle, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CourseStatus } from '@/contexts/student-context';

const categoryIcons: Record<CourseCategory, React.ReactNode> = {
  Obrigatória: <Book className="h-4 w-4 text-muted-foreground" />,
  Eletiva: <List className="h-4 w-4 text-muted-foreground" />,
  Unknown: <HelpCircle className="h-4 w-4 text-muted-foreground" />,
};

type CourseNodeProps = {
  course: Course;
  onClick?: () => void;
  status?: CourseStatus;
  isLocked?: boolean;
};

export function CourseNode({ course, onClick, status, isLocked }: CourseNodeProps) {
  return (
    <Card 
      id={`node-${course.id}`} 
      className={cn(
        "w-full min-w-[120px] max-w-[150px] m-1 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer relative",
        status === 'COMPLETED' && 'bg-green-100 dark:bg-green-900',
        status === 'CURRENT' && 'bg-yellow-100 dark:bg-yellow-800',
        isLocked && 'opacity-60'
        )}
      onClick={onClick}
    >
      {isLocked && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-lg z-10">
          <Lock className="h-6 w-6 text-white" />
        </div>
      )}
      <CardHeader className="p-2 pb-1">
        <div className="flex justify-between items-start">
          <CardTitle className="text-primary text-xs font-bold leading-tight">{course.code}</CardTitle>
          <div className="flex-shrink-0" title={course.category}>
            {categoryIcons[course.category]}
          </div>
        </div>
        <CardDescription className="text-xs pt-1 h-12 overflow-hidden text-ellipsis">{course.name}</CardDescription>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        <p className="text-xs text-muted-foreground">{course.credits} Créditos</p>
      </CardContent>
    </Card>
  );
}
