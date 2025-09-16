
"use client";

import { createContext, useState, useCallback, ReactNode } from "react";
import { getStudent, updateStudentCourseStatus } from "@/lib/student";
import type { Student } from "@/lib/student";
import { useToast } from "@/hooks/use-toast";
import type { CourseIdMapping, Course } from "@/lib/courses";

export type CourseStatus = 'COMPLETED' | 'CURRENT' | 'NOT_TAKEN' | 'CAN_TAKE';

export interface CourseWithStatus {
    id: string; // The normalized course ID used in the frontend (e.g., IME0104827)
    status: CourseStatus;
}

interface StudentContextType {
    student: Student | null;
    courseStatuses: Record<string, CourseStatus>;
    isLoading: boolean;
    fetchStudentData: (studentId: string, allCourses: Course[]) => Promise<void>;
    updateCourseStatus: (course: Course, newStatus: CourseStatus, oldStatus: CourseStatus, allCourses: Course[]) => Promise<void>;
    logout: () => void;
    setCourseIdMapping: (mapping: CourseIdMapping) => void;
}

export const StudentContext = createContext<StudentContextType | null>(null);

export function StudentProvider({ children }: { children: ReactNode }) {
    const [student, setStudent] = useState<Student | null>(null);
    const [courseStatuses, setCourseStatuses] = useState<Record<string, CourseStatus>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [courseIdMapping, setCourseIdMapping] = useState<CourseIdMapping>({});
    const { toast } = useToast();

    const fetchStudentData = useCallback(async (studentId: string, allCourses: Course[]) => {
        if (Object.keys(courseIdMapping).length === 0) {
            console.warn("Course ID mapping not ready. Deferring fetchStudentData.");
            return;
        }

        setIsLoading(true);
        try {
            const studentData = await getStudent(studentId);
            setStudent(studentData);

            const disciplineIdToCourseId: { [key: string]: string } = {};
            for (const key in courseIdMapping) {
                const value = courseIdMapping[key];
                disciplineIdToCourseId[value] = key;
            }
            
            const statuses: Record<string, CourseStatus> = {};
            
            (studentData.completedDisciplines || []).forEach(disciplineId => {
                const courseId = disciplineIdToCourseId[disciplineId];
                if (courseId) {
                    statuses[courseId] = 'COMPLETED';
                }
            });

            (studentData.currentDisciplines || []).forEach(disciplineId => {
                const courseId = disciplineIdToCourseId[disciplineId];
                if (courseId) {
                    statuses[courseId] = 'CURRENT';
                }
            });

            // Determine status of elective groups
            allCourses.forEach(course => {
                if (course.isElectiveGroup && course.electives) {
                    const hasCurrent = course.electives.some(elective => statuses[elective.id] === 'CURRENT');
                    const hasCompleted = course.electives.some(elective => statuses[elective.id] === 'COMPLETED');
                    
                    if (hasCurrent) {
                        statuses[course.id] = 'CURRENT';
                    } else if (hasCompleted) {
                        statuses[course.id] = 'COMPLETED';
                    }
                }
            });

            setCourseStatuses(statuses);
            
            toast({
                title: 'Bem-vindo(a)!',
                description: `Olá, ${studentData.name}. Seu progresso foi carregado.`,
            });

        } catch (error) {
            console.error("Erro ao buscar dados do aluno:", error);
            toast({
                title: 'Erro ao buscar dados do aluno',
                description: error instanceof Error ? error.message : 'Não foi possível encontrar o aluno. Verifique a matrícula e tente novamente.',
                variant: 'destructive',
            });
            setStudent(null);
            setCourseStatuses({});
        } finally {
            setIsLoading(false);
        }
    }, [toast, courseIdMapping]);

    const updateCourseStatus = async (course: Course, newStatus: CourseStatus, oldStatus: CourseStatus, allCourses: Course[]) => {
        if (!student) throw new Error("Estudante não está logado.");
        if (newStatus === oldStatus) return;

        await updateStudentCourseStatus(student.studentId, course.disciplineId, newStatus, oldStatus);
        
        await fetchStudentData(student.studentId, allCourses);
    };

    const logout = () => {
        setStudent(null);
        setCourseStatuses({});
        toast({
            title: 'Logout realizado',
            description: 'Você saiu da sua conta.',
        });
    };

    const handleSetCourseIdMapping = (mapping: CourseIdMapping) => {
        setCourseIdMapping(prev => {
            if (Object.keys(prev).length === 0) {
                return mapping;
            }
            return prev;
        });
    }

    return (
        <StudentContext.Provider value={{ student, courseStatuses, isLoading, fetchStudentData, updateCourseStatus, logout, setCourseIdMapping: handleSetCourseIdMapping }}>
            {children}
        </StudentContext.Provider>
    );
}
