
"use client";

import React, { useEffect, useState, useContext } from 'react';
import { StudentContext } from '@/contexts/student-context';
import type { Course } from '@/lib/courses';
import { Skeleton } from './ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import type { CurrentDiscipline } from '@/lib/student';
import { CourseDetailModal } from './course-detail-modal';
import { cn } from '@/lib/utils';


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

const colorClasses = [
    "bg-chart-1/20 hover:bg-chart-1/30 text-chart-1",
    "bg-chart-2/20 hover:bg-chart-2/30 text-chart-2",
    "bg-chart-3/20 hover:bg-chart-3/30 text-chart-3",
    "bg-chart-4/20 hover:bg-chart-4/30 text-chart-4",
    "bg-chart-5/20 hover:bg-chart-5/30 text-chart-5",
    "bg-blue-500/20 hover:bg-blue-500/30 text-blue-500",
    "bg-purple-500/20 hover:bg-purple-500/30 text-purple-500",
    "bg-pink-500/20 hover:bg-pink-500/30 text-pink-500",
];

// Simple hash function to get a consistent color for a course
const getColorForCourse = (courseId: string) => {
    let hash = 0;
    for (let i = 0; i < courseId.length; i++) {
        const char = courseId.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0; // Convert to 32bit integer
    }
    const index = Math.abs(hash) % colorClasses.length;
    return colorClasses[index];
};

const findCourseByDisciplineId = (allCourses: Course[], disciplineId: string): Course | undefined => {
    // First, search in the main course list for a non-elective
    const mainCourse = allCourses.find(c => !c.isElectiveGroup && c.disciplineId === disciplineId);
    if (mainCourse) {
        return mainCourse;
    }

    // If not found, search within all elective groups
    for (const course of allCourses) {
        if (course.isElectiveGroup && course.electives) {
            const electiveCourse = course.electives.find(e => e.disciplineId === disciplineId);
            if (electiveCourse) {
                return electiveCourse;
            }
        }
    }

    console.warn(`Course with disciplineId ${disciplineId} not found.`);
    return undefined;
};


export function ScheduleGrid({ allCourses }: { allCourses: Course[] }) {
    const { student } = useContext(StudentContext)!;
    const [schedule, setSchedule] = useState<ScheduleData>({});
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [selectedClassNumber, setSelectedClassNumber] = useState<number | undefined>(undefined);
    
    const totalCredits = student ? student.mandatoryCredits + student.electiveCredits : 0;

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

                const courseInfo = findCourseByDisciplineId(allCourses, currentDiscipline.disciplineId);


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
                                                className={cn(
                                                    "p-1 rounded-md h-full flex flex-col justify-center text-center cursor-pointer transition-colors",
                                                    getColorForCourse(schedule[day][slot].course.id)
                                                )}
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
