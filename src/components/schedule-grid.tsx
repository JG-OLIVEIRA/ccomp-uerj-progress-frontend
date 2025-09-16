
"use client";

import { useEffect, useState, useContext, useMemo } from 'react';
import { StudentContext } from '@/contexts/student-context';
import type { Course } from '@/lib/courses';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Skeleton } from './ui/skeleton';

type ScheduleGridProps = {
  allCourses: Course[];
};

type ClassInfo = {
  courseCode: string;
  courseName: string;
  classNumber: number;
};

const timeSlots = [
  { id: 'M1', label: 'M1 (07:00 - 07:50)' }, { id: 'M2', label: 'M2 (07:50 - 08:40)' },
  { id: 'M3', label: 'M3 (08:50 - 09:40)' }, { id: 'M4', label: 'M4 (09:40 - 10:30)' },
  { id: 'M5', label: 'M5 (10:40 - 11:30)' }, { id: 'M6', label: 'M6 (11:30 - 12:20)' },
  { id: 'T1', label: 'T1 (12:30 - 13:20)' }, { id: 'T2', label: 'T2 (13:20 - 14:10)' },
  { id: 'T3', label: 'T3 (14:20 - 15:10)' }, { id: 'T4', label: 'T4 (15:10 - 16:00)' },
  { id: 'T5', label: 'T5 (16:10 - 17:00)' }, { id: 'T6', label: 'T6 (17:00 - 17:50)' },
  { id: 'N1', label: 'N1 (18:00 - 18:50)' }, { id: 'N2', label: 'N2 (18:50 - 19:40)' },
  { id: 'N3', label: 'N3 (19:40 - 20:30)' }, { id: 'N4', label: 'N4 (20:30 - 21:20)' },
  { id: 'N5', label: 'N5 (21:20 - 22:10)' },
];

const daysOfWeek = [
  { id: 'SEG', label: 'Segunda' }, { id: 'TER', label: 'Terça' },
  { id: 'QUA', label: 'Quarta' },  { id: 'QUI', label: 'Quinta' },
  { id: 'SEX', label: 'Sexta' },   { id: 'SAB', label: 'Sábado' },
];

const dayMapping: { [key: string]: string } = {
  'SEG': 'Segunda', 'TER': 'Terça', 'QUA': 'Quarta', 'QUI': 'Quinta', 'SEX': 'Sexta', 'SAB': 'Sábado'
};

export function ScheduleGrid({ allCourses }: ScheduleGridProps) {
  const { student, courseStatuses } = useContext(StudentContext)!;
  const [schedule, setSchedule] = useState<Record<string, Record<string, ClassInfo | null>>>({});
  const [isLoading, setIsLoading] = useState(true);

  const currentCourses = useMemo(() => {
    return allCourses.filter(course => 
      courseStatuses[course.id] === 'CURRENT' && !course.isElectiveGroup
    );
  }, [allCourses, courseStatuses]);

  useEffect(() => {
    if (!student || currentCourses.length === 0) {
      setIsLoading(false);
      setSchedule({});
      return;
    }

    const fetchSchedules = async () => {
      setIsLoading(true);
      const newSchedule: Record<string, Record<string, ClassInfo | null>> = {};
      
      // Initialize schedule
      timeSlots.forEach(ts => {
        newSchedule[ts.id] = {};
        daysOfWeek.forEach(day => {
          newSchedule[ts.id][day.label] = null;
        });
      });

      const studentDisciplinesResponse = await fetch(`/api/students/${student.studentId}/disciplines`);
      const studentDisciplines = await studentDisciplinesResponse.json();
      
      const currentDisciplineIds = new Set(studentDisciplines.current.map((d: any) => d.disciplineId));
      
      const coursePromises = allCourses
        .filter(c => currentDisciplineIds.has(c.disciplineId) && !c.isElectiveGroup)
        .map(async course => {
          const res = await fetch(`/api/disciplines/${course.disciplineId}`);
          if (!res.ok) return null;
          const disciplineDetails = await res.json();
          
          const studentClass = studentDisciplines.current.find((d: any) => d.disciplineId === course.disciplineId);

          if (!disciplineDetails.classes || !studentClass) return null;

          const chosenClass = disciplineDetails.classes.find((c: any) => c.number === studentClass.classNumber);
          
          if (!chosenClass || !chosenClass.times) return;
          
          const timeParts = chosenClass.times.split(' ').filter(Boolean);

          let currentDay: string | null = null;
          for (const part of timeParts) {
            if (dayMapping[part]) {
              currentDay = dayMapping[part];
            } else if (currentDay) {
              if (newSchedule[part]) {
                newSchedule[part][currentDay] = {
                  courseCode: course.code,
                  courseName: course.name,
                  classNumber: chosenClass.number,
                };
              }
            }
          }
        });

      await Promise.all(coursePromises);
      setSchedule(newSchedule);
      setIsLoading(false);
    };

    fetchSchedules();
  }, [student, currentCourses, allCourses]);

  if (!student) {
    return (
      <Card className="w-full max-w-7xl mx-auto">
        <CardHeader>
          <CardTitle className="text-lg text-center">Grade Horária</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          Faça login para ver sua grade horária.
        </CardContent>
      </Card>
    );
  }

  if (currentCourses.length === 0 && !isLoading) {
    return (
      <Card className="w-full max-w-7xl mx-auto">
        <CardHeader>
          <CardTitle className="text-lg text-center">Grade Horária</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          Você não está cursando nenhuma disciplina no momento.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-7xl mx-auto overflow-x-auto">
      <CardHeader>
        <CardTitle className="text-lg text-center">Grade Horária</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : (
          <table className="w-full border-collapse text-center text-xs sm:text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="p-2 border font-semibold">Tempo</th>
                {daysOfWeek.map(day => (
                  <th key={day.id} className="p-2 border font-semibold min-w-[100px]">{day.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map(ts => (
                <tr key={ts.id}>
                  <td className="p-2 border font-medium bg-muted">{ts.label}</td>
                  {daysOfWeek.map(day => {
                    const classInfo = schedule[ts.id]?.[day.label];
                    return (
                      <td key={`${ts.id}-${day.id}`} className="p-2 border h-12">
                        {classInfo && (
                          <div className="bg-primary/10 p-1 rounded-md">
                            <p className="font-bold text-primary text-xs">{classInfo.courseCode}</p>
                            <p className="text-muted-foreground text-[10px] hidden sm:block">{classInfo.courseName}</p>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}
