
"use client";

import React, { useEffect, useState, useContext } from 'react';
import { StudentContext } from '@/contexts/student-context';
import type { Course } from '@/lib/courses';
import { Skeleton } from './ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import type { CurrentDiscipline } from '@/lib/student';
import { CourseDetailModal } from './course-detail-modal';


const timeSlots = [
    'M1', 'M2', 'M3', 'M4', 'M5', 'M6',
    'T1', 'T2', 'T3', 'T4', 'T5',
    'N1', 'N2', 'N3', 'N4', 'N5'
];

const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];
const dayMapping: Record<string, string> = { 'SEG': 'Seg', 'TER': 'Ter', 'QUA': 'Qua', 'QUI': 'Qui', 'SEX': 'Sex' };

type ScheduleCell = {
    course: Course;
    classNumber: number;
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
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [selectedClassNumber, setSelectedClassNumber] = useState<number | undefined>(undefined);
    const [totalCredits, setTotalCredits] = useState(0);

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
            
            const completedCredits = allCourses.reduce((acc, course) => {
                const isCompleted = student.completedDisciplines.some(completedId => completedId === course.disciplineId);
                if (isCompleted && !course.isElectiveGroup) {
                    return acc + course.credits;
                }
                return acc;
            }, 0);
            setTotalCredits(completedCredits);

            const detailsPromises = currentDisciplines.map(d => fetchDisciplineDetails(d.disciplineId));
            const detailsResults = await Promise.all(detailsPromises);

            const newSchedule: ScheduleData = {};

            detailsResults.forEach((detail, index) => {
                if (!detail) return;
                
                const currentDiscipline = currentDisciplines[index];
                const classInfo = detail.classes?.find((c: any) => c.number === currentDiscipline.classNumber);
                
                if (!classInfo || !classInfo.times) return;

                const courseInfo = allCourses.find(c => c.disciplineId === currentDiscipline.disciplineId);

                if (courseInfo) {
                    const timeParts = classInfo.times.trim().split(/\s+/);
                    let currentDay: string | null = null;

                    for(const part of timeParts) {
                        const upperPart = part.toUpperCase();
                        if(dayMapping[upperPart]) {
                            currentDay = dayMapping[upperPart];
                        } else if (currentDay) {
                            if(!newSchedule[currentDay]) {
                                newSchedule[currentDay] = {};
                            }
                            newSchedule[currentDay][part] = { course: courseInfo, classNumber: currentDiscipline.classNumber };
                        }
                    }
                }
            });

            setSchedule(newSchedule);
            setIsLoading(false);
        };

        fetchSchedules();
    }, [student, allCourses]);

    const handleCellClick = (cell: ScheduleCell) => {
        setSelectedCourse(cell.course);
        setSelectedClassNumber(cell.classNumber);
    };

    const handleCloseModal = () => {
        setSelectedCourse(null);
        setSelectedClassNumber(undefined);
    }

    if (!student) {
        return null; // Don't show anything if not logged in
    }

    if(isLoading) {
        return <ScheduleSkeleton />;
    }
    
    if (Object.keys(schedule).length === 0 && !isLoading) {
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
        <>
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
                            <React.Fragment key={slot}>
                                <div className="p-2 bg-card font-semibold text-center">{slot}</div>
                                {days.map(day => (
                                    <div key={`${day}-${slot}`} className="p-2 bg-card min-h-[60px] text-xs">
                                        {schedule[day]?.[slot] && (
                                            <div 
                                                className="bg-primary/20 text-primary-foreground p-1 rounded-md h-full flex flex-col justify-center text-center cursor-pointer hover:bg-primary/30 transition-colors"
                                                onClick={() => handleCellClick(schedule[day][slot])}
                                            >
                                                <p className="font-semibold text-foreground text-[11px] leading-tight">{schedule[day][slot].course.name}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </React.Fragment>
                        ))}
                    </div>
                </CardContent>
            </Card>
            {selectedCourse && (
                <CourseDetailModal
                    isOpen={!!selectedCourse}
                    onClose={handleCloseModal}
                    course={selectedCourse}
                    allCourses={allCourses}
                    totalCredits={totalCredits}
                    enrolledClassNumber={selectedClassNumber}
                />
            )}
        </>
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
                    {Array.from({ length: 16 * 6 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
                </div>
            </CardContent>
        </Card>
    )
}
