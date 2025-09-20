
"use client";

import { createContext, useState, useCallback, ReactNode, useEffect } from "react";
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
    fetchStudentData: (studentId: string) => Promise<void>;
    updateCourseStatus: (course: Course, newStatus: CourseStatus, oldStatus: CourseStatus, allCourses: Course[], classNumber?: number) => Promise<void>;
    logout: () => void;
    setCourseIdMapping: (mapping: CourseIdMapping) => void;
    allCourses: Course[];
    setAllCourses: (courses: Course[]) => void;
}

export const StudentContext = createContext<StudentContextType | null>(null);

export function StudentProvider({ children }: { children: ReactNode }) {
    const [student, setStudent] = useState<Student | null>(null);
    const [courseStatuses, setCourseStatuses] = useState<Record<string, CourseStatus>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [courseIdMapping, setCourseIdMapping] = useState<CourseIdMapping>({});
    const [allCourses, setAllCourses] = useState<Course[]>([]);
    const { toast } = useToast();
    
    useEffect(() => {
        if (student && allCourses.length > 0 && Object.keys(courseIdMapping).length > 0) {
            fetchStudentData(student.studentId, true);
        }
    }, [allCourses, courseIdMapping]);


    const fetchStudentData = useCallback(async (studentId: string, isReFetch: boolean = false) => {
        if (Object.keys(courseIdMapping).length === 0) {
            console.warn("Course data not ready. Deferring fetchStudentData.");
            return;
        }

        setIsLoading(true);
        try {
            const { student: studentData, isNew } = await getStudent(studentId);

            if(isNew) {
                toast({
                    title: 'Bem-vindo(a)!',
                    description: 'Sua conta foi criada. A página será recarregada para você fazer o login.',
                });
                setTimeout(() => window.location.reload(), 3000);
                return;
            }

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

            (studentData.currentDisciplines || []).forEach(currentDiscipline => {
                const disciplineId = typeof currentDiscipline === 'string' ? currentDiscipline : currentDiscipline.disciplineId;
                const courseId = disciplineIdToCourseId[disciplineId];
                if (courseId) {
                    statuses[courseId] = 'CURRENT';
                }
            });

            const allElectiveCourses = allCourses.flatMap(c => c.electives || []);
            
            const completedElectives = allElectiveCourses.filter(e => statuses[e.id] === 'COMPLETED');
            const currentElectives = allElectiveCourses.filter(e => statuses[e.id] === 'CURRENT');
            
            const electiveSlots = allCourses
                .filter(c => c.isElectiveGroup && c.id.startsWith('ELETIVA') && c.id !== 'ELETIVABASICA')
                .sort((a, b) => a.name.localeCompare(b.name));
            
            const availableCompleted = [...completedElectives];
            const availableCurrent = [...currentElectives];

            for (const slot of electiveSlots) {
                if (availableCompleted.length > 0) {
                    statuses[slot.id] = 'COMPLETED';
                    availableCompleted.shift(); 
                } else if (availableCurrent.length > 0) {
                    statuses[slot.id] = 'CURRENT';
                    availableCurrent.shift(); 
                } else {
                    statuses[slot.id] = 'NOT_TAKEN';
                }
            }
            
            const basicElectiveGroup = allCourses.find(g => g.id === 'ELETIVABASICA');
            if (basicElectiveGroup && basicElectiveGroup.electives) {
                const hasCurrent = basicElectiveGroup.electives.some(e => statuses[e.id] === 'CURRENT');
                const hasCompleted = basicElectiveGroup.electives.some(e => statuses[e.id] === 'COMPLETED');
                if (hasCurrent) {
                    statuses[basicElectiveGroup.id] = 'CURRENT';
                } else if (hasCompleted) {
                    statuses[basicElectiveGroup.id] = 'COMPLETED';
                }
            }


            setCourseStatuses(statuses);
            
            if (!isReFetch && !student) {
                toast({
                    title: 'Bem-vindo(a)!',
                    description: `Olá, ${studentData.name}. Seu progresso foi carregado.`,
                });
            }

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

    const updateCourseStatus = async (course: Course, newStatus: CourseStatus, oldStatus: CourseStatus, allCourses: Course[], classNumber?: number) => {
        if (!student) throw new Error("Estudante não está logado.");
        if (newStatus === oldStatus && newStatus !== 'CURRENT') return;

        await updateStudentCourseStatus(student.studentId, course.disciplineId, newStatus, classNumber);
        
        await fetchStudentData(student.studentId, true);
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

    const handleSetAllCourses = (courses: Course[]) => {
        setAllCourses(prev => {
            if (prev.length === 0) {
                return courses;
            }
            return prev;
        });
    }

    return (
        <StudentContext.Provider value={{ student, courseStatuses, isLoading, fetchStudentData, updateCourseStatus, logout, setCourseIdMapping: handleSetCourseIdMapping, allCourses, setAllCourses: handleSetAllCourses }}>
            {children}
        </StudentContext.Provider>
    );
}
