
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
  { id: 'M1', label: '07:00 - 07:50' }, { id: 'M2', label: '07:50 - 08:40' },
  { id: 'M3', label: '08:50 - 09:40' }, { id: 'M4', label: '09:40 - 10:30' },
  { id: 'M5', label: '10:40 - 11:30' }, { id: 'M6', label: '11:30 - 12:20' },
  { id: 'T1', label: '12:30 - 13:20' }, { id: 'T2', label: '13:20 - 14:10' },
  { id: 'T3', label: '14:20 - 15:10' }, { id: 'T4', label: '15:10 - 16:00' },
  { id: 'T5', label: '16:10 - 17:00' }, { id: 'T6', label: '17:00 - 17:50' },
  { id: 'N1', label: '18:00 - 18:50' }, { id: 'N2', label: '18:50 - 19:40' },
  { id: 'N3', label: '19:40 - 20:30' }, { id: 'N4', label: '20:30 - 21:20' },
  { id: 'N5', label: '21:20 - 22:10' },
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
    if (!student) {
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

      // This API returns an object with `{ current: [{ disciplineId, classNumber }] }`
      const studentDisciplinesResponse = await fetch(`/api/students/${student.studentId}/disciplines`);
      
      if (!studentDisciplinesResponse.ok) {
          setSchedule(newSchedule);
          setIsLoading(false);
          console.error("Failed to fetch student disciplines for schedule");
          return;
      }
      
      const studentDisciplines = await studentDisciplinesResponse.json();
      
      if (!studentDisciplines.current || !Array.isArray(studentDisciplines.current) || studentDisciplines.current.length === 0) {
          setSchedule(newSchedule);
          setIsLoading(false);
          return;
      }

      const currentDisciplineDetails = studentDisciplines.current as { disciplineId: string; classNumber: number }[];
      
      const coursePromises = currentDisciplineDetails.map(async (studentClass) => {
        // Find the course in our allCourses list that matches the disciplineId
        const course = allCourses.find(c => c.disciplineId === studentClass.disciplineId && !c.isElectiveGroup);
        if(!course) return;

          // Fetch details for that specific discipline to get class times
          const res = await fetch(`/api/disciplines/${course.disciplineId}`);
          if (!res.ok) return null;
          const disciplineDetails = await res.json();
          
          if (!disciplineDetails.classes) return null;

          // Find the specific class the student is enrolled in
          const chosenClass = disciplineDetails.classes.find((c: any) => c.number === studentClass.classNumber);
          
          if (!chosenClass || !chosenClass.times) return;
          
          // Parse the time string: "SEG N1 N2 QUA N1 N2"
          const timeParts = chosenClass.times.trim().split(/\s+/);

          let currentDay: string | null = null;
          for (const part of timeParts) {
            if (dayMapping[part]) {
              currentDay = dayMapping[part];
            } else if (currentDay && timeSlots.some(ts => ts.id === part)) { // part is a time slot like N1, N2
                if (!newSchedule[part]) newSchedule[part] = {};
                newSchedule[part][currentDay] = {
                  courseCode: course.code,
                  courseName: course.name,
                  classNumber: chosenClass.number,
                };
            }
          }
        });

      await Promise.all(coursePromises);
      setSchedule(newSchedule);
      setIsLoading(false);
    };

    fetchSchedules();
  }, [student, courseStatuses, allCourses]); // Rerun when statuses change, and allCourses is available.

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
                <th className="p-2 border font-semibold">Horário</th>
                {daysOfWeek.map(day => (
                  <th key={day.id} className="p-2 border font-semibold min-w-[100px]">{day.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map(ts => (
                <tr key={ts.id}>
                  <td className="p-2 border font-medium bg-muted whitespace-nowrap">{ts.label}</td>
                  {daysOfWeek.map(day => {
                    const classInfo = schedule[ts.id]?.[day.label];
                    return (
                      <td key={`${ts.id}-${day.id}`} className="p-1 border h-14">
                        {classInfo && (
                          <div className="bg-primary/10 p-1 rounded-md h-full flex flex-col justify-center">
                            <p className="font-bold text-primary text-[10px] sm:text-xs">{classInfo.courseCode}</p>
                            <p className="text-muted-foreground text-[9px] hidden sm:block leading-tight">{classInfo.courseName}</p>
                             <p className="text-muted-foreground text-[9px] sm:text-xs">T.{classInfo.classNumber}</p>
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
