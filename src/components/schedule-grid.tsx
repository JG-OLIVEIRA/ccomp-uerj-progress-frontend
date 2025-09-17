
"use client";

import { useEffect, useState, useContext } from 'react';
import { StudentContext } from '@/contexts/student-context';
import type { Course } from '@/lib/courses';
import { Skeleton } from './ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import type { CurrentDiscipline } from '@/lib/student';

const timeSlots = [
    'M1', 'M2', 'M3', 'M4', 'M5',
    'T1', 'T2', 'T3', 'T4', 'T5',
    'N1', 'N2', 'N3', 'N4', 'N5'
];

const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];
const dayMapping: Record<string, string> = { 'SEG': 'Seg', 'TER': 'Ter', 'QUA': 'Qua', 'QUI': 'Qui', 'SEX': 'Sex' };

type ScheduleCell = {
    courseName: string;
    courseCode: string;
};

type ScheduleData = Record<string, Record<string, ScheduleCell>>;

const fetchDisciplineDetails = async (disciplineId: string) => {
    const res = await fetch(`/api/disciplines/${disciplineId}`);
    if (!res.ok) {
        console.error(`Failed to fetch details for discipline ${disciplineId}`);
        return null;
    }
    return res.json();
};

export function ScheduleGrid({ allCourses }: { allCourses: Course[] }) {
    const { student } = useContext(StudentContext)!;
    const [schedule, setSchedule] = useState<ScheduleData>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSchedules = async () => {
            if (!student || !student.currentDisciplines || student.currentDisciplines.length === 0) {
                setIsLoading(false);
                setSchedule({});
                return;
            }

            setIsLoading(true);
            
            const currentDisciplines = student.currentDisciplines.filter(
                (d): d is CurrentDiscipline => typeof d === 'object' && d !== null && 'disciplineId' in d && 'classNumber' in d
            );

            const detailsPromises = currentDisciplines.map(d => fetchDisciplineDetails(d.disciplineId));
            const detailsResults = await Promise.all(detailsPromises);

            const newSchedule: ScheduleData = {};

            detailsResults.forEach((detail, index) => {
                if (!detail) return;
                
                const currentDiscipline = currentDisciplines[index];
                const classInfo = detail.classes?.find((c: any) => c.number === currentDiscipline.classNumber);
                
                if (!classInfo || !classInfo.times) return;

                const courseInfo = allCourses.find(c => c.disciplineId === currentDiscipline.disciplineId);
                const courseName = courseInfo?.name || detail.name;
                const courseCode = courseInfo?.code || '';

                const timeParts = classInfo.times.trim().split(/\s+/);
                let currentDay: string | null = null;

                for(const part of timeParts) {
                    if(dayMapping[part.toUpperCase()]) {
                        currentDay = dayMapping[part.toUpperCase()];
                    } else if (currentDay) {
                        if(!newSchedule[currentDay]) {
                            newSchedule[currentDay] = {};
                        }
                        newSchedule[currentDay][part] = { courseName, courseCode };
                    }
                }
            });

            setSchedule(newSchedule);
            setIsLoading(false);
        };

        fetchSchedules();
    }, [student, allCourses]);

    if (!student) {
        return null; // Don't show anything if not logged in
    }

    if(isLoading) {
        return <ScheduleSkeleton />;
    }
    
    if (Object.keys(schedule).length === 0) {
        return (
            <Card className="w-full mx-auto mt-8">
                <CardHeader>
                    <CardTitle className="text-lg text-center">Grade Horária</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground">
                    Você não está cursando nenhuma disciplina no momento.
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="w-full mx-auto mt-8 overflow-x-auto">
            <CardHeader>
                <CardTitle className="text-lg text-center">Grade Horária</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-[auto,repeat(5,1fr)] gap-px bg-border">
                    {/* Header Row */}
                    <div className="p-2 bg-card font-semibold text-center">Horário</div>
                    {days.map(day => (
                        <div key={day} className="p-2 bg-card font-semibold text-center">{day}</div>
                    ))}

                    {/* Time Slot Rows */}
                    {timeSlots.map(slot => (
                        <>
                            <div key={`${slot}-label`} className="p-2 bg-card font-semibold text-center">{slot}</div>
                            {days.map(day => (
                                <div key={`${day}-${slot}`} className="p-2 bg-card min-h-[60px] text-xs">
                                    {schedule[day]?.[slot] && (
                                        <div className="bg-primary/20 text-primary-foreground p-1 rounded-md h-full flex flex-col justify-center">
                                            <p className="font-bold text-foreground text-[10px] leading-tight">{schedule[day][slot].courseCode}</p>
                                            <p className="text-muted-foreground text-[10px] leading-tight">{schedule[day][slot].courseName}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function ScheduleSkeleton() {
    return (
        <Card className="w-full mx-auto mt-8">
            <CardHeader>
                <Skeleton className="h-6 w-1/3 mx-auto" />
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-[auto,repeat(5,1fr)] gap-1">
                    <Skeleton className="h-10" />
                    {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
                    {Array.from({ length: 15 * 6 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
                </div>
            </CardContent>
        </Card>
    )
}
