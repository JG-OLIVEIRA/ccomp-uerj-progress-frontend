
"use client";

import { createContext, useState, useCallback, ReactNode, useEffect } from "react";
import { getStudent, updateStudentCourseStatus } from "@/lib/student";
import type { Student, CurrentDiscipline } from "@/lib/student";
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
    updateCourseStatus: (course: Course, newStatus: CourseStatus, oldStatus: CourseStatus, classNumber?: number) => Promise<void>;
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
            // This will re-fetch and re-evaluate statuses if the courses list or mapping changes.
            fetchStudentData(student.studentId, true); // Pass a flag to indicate it's a re-fetch
        }
    }, [allCourses, courseIdMapping]);


    const fetchStudentData = useCallback(async (studentId: string, isReFetch: boolean = false) => {
        if (Object.keys(courseIdMapping).length === 0 || allCourses.length === 0) {
            console.warn("Course data not ready. Deferring fetchStudentData.");
            return;
        }

        setIsLoading(true);
        try {
            const { student: studentData, isNew } = await getStudent(studentId);

            if(isNew) {
                toast({
                    title: 'Usuário criado com sucesso!',
                    description: 'A página será recarregada. Por favor, faça o login novamente.',
                });
                // Force a reload to ensure a clean state after user creation
                setTimeout(() => window.location.reload(), 2000);
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

            // Handle Elective Group Status Logic
            const electiveGroups = allCourses.filter(c => c.isElectiveGroup);
            const basicElectiveGroup = electiveGroups.find(g => g.id === 'ELETIVABASICA');
            const groupIIElectiveSlots = ['ELETIVAI', 'ELETIVAII', 'ELETIVAIII', 'ELETIVAIV']
                .map(id => allCourses.find(c => c.id === id))
                .filter((c): c is Course => !!c);

            // Handle Basic Electives
            if (basicElectiveGroup && basicElectiveGroup.electives) {
                const hasCurrent = basicElectiveGroup.electives.some(e => statuses[e.id] === 'CURRENT');
                const hasCompleted = basicElectiveGroup.electives.some(e => statuses[e.id] === 'COMPLETED');
                if (hasCurrent) {
                    statuses[basicElectiveGroup.id] = 'CURRENT';
                } else if (hasCompleted) {
                    statuses[basicElectiveGroup.id] = 'COMPLETED';
                }
            }
            
            // Handle Group II Electives Sequentially
            const allGroupIIElectives = groupIIElectiveSlots[0]?.electives || [];
            
            const completedGroupII = allGroupIIElectives.filter(e => statuses[e.id] === 'COMPLETED');
            const currentGroupII = allGroupIIElectives.filter(e => statuses[e.id] === 'CURRENT');
            
            // Clone the arrays to avoid mutation issues during the loop
            const availableCompleted = [...completedGroupII];
            const availableCurrent = [...currentGroupII];

            for (const slot of groupIIElectiveSlots) {
                if (availableCompleted.length > 0) {
                    statuses[slot.id] = 'COMPLETED';
                    availableCompleted.shift(); // Consume one completed elective
                } else if (availableCurrent.length > 0) {
                    statuses[slot.id] = 'CURRENT';
                    availableCurrent.shift(); // Consume one current elective
                } else {
                    statuses[slot.id] = 'NOT_TAKEN';
                }
            }


            setCourseStatuses(statuses);
            
            if (!isReFetch) {
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
    }, [toast, courseIdMapping, allCourses]);

    const updateCourseStatus = async (course: Course, newStatus: CourseStatus, oldStatus: CourseStatus, classNumber?: number) => {
        if (!student) throw new Error("Estudante não está logado.");
        if (newStatus === oldStatus) return;

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
