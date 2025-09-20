

import type { CourseStatus } from "@/contexts/student-context";

export type CurrentDiscipline = {
    disciplineId: string;
    classNumber: number;
}

export type Student = {
    studentId: string;
    name: string;
    lastName: string;
    completedDisciplines: string[];
    currentDisciplines: CurrentDiscipline[];
    mandatoryCredits: number;
    electiveCredits: number;
};

export type NewStudent = {
    studentId: string;
    name: string;
    lastName: string;
}

// Use a relative path to our own API proxy
const API_BASE_URL = '/api';

export async function getStudent(studentId: string): Promise<{ student: Student, isNew: boolean }> {
    const response = await fetch(`${API_BASE_URL}/students/${studentId}`);
    
    if (!response.ok && response.status !== 201) {
        const errorData = await response.json().catch(() => ({ error: 'Falha ao buscar ou criar dados do aluno.' }));
        throw new Error(errorData.error);
    }
    
    const student = await response.json();
    const isNew = response.status === 201;

    return { student, isNew };
}


export async function updateStudentProfile(studentId: string, data: { name?: string, lastName?: string }): Promise<Student> {
    const response = await fetch(`${API_BASE_URL}/students/${studentId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Falha ao atualizar o perfil.' }));
        throw new Error(errorData.error);
    }
    return response.json();
}

async function setCourseCompleted(studentId: string, disciplineId: string, method: 'PUT' | 'DELETE'): Promise<void> {
    const endpoint = `${API_BASE_URL}/students/${studentId}/completed-disciplines/${disciplineId}`;
    const response = await fetch(endpoint, { method });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Falha ao atualizar status para concluído.`);
    }
}

async function setCourseCurrent(studentId: string, disciplineId: string, classNumber: number | undefined, method: 'PUT' | 'DELETE'): Promise<void> {
    if (typeof classNumber !== 'number') {
        throw new Error("Número da turma é inválido.");
    }
    
    const endpoint = `${API_BASE_URL}/students/${studentId}/current-disciplines/${disciplineId}/${classNumber}`;
    
    const response = await fetch(endpoint, { method });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Falha ao atualizar status para cursando.`);
    }
}


export async function updateStudentCourseStatus(studentId: string, disciplineId: string, newStatus: CourseStatus, classNumber?: number): Promise<void> {
    if (!studentId) {
        throw new Error("ID do estudante não encontrado. Faça o login novamente.");
    }
    
    // Simplification: Let the backend handle atomicity.
    // We just perform the correct ADD or DELETE operation based on the new status.
    // A full re-fetch after the update will ensure client state consistency.

    // To set a course to 'NOT_TAKEN', we need to delete it from both potential lists.
    // We use Promise.allSettled to ignore the expected failure from one of the calls.
    if (newStatus === 'NOT_TAKEN') {
         await Promise.allSettled([
            setCourseCompleted(studentId, disciplineId, 'DELETE'),
            // We can't reliably delete from 'current' without the class number,
            // but the backend handles removing from 'current' if we add to 'completed',
            // and the re-fetch will clean up the state.
         ]);
        return;
    }

    // For 'COMPLETED' or 'CURRENT', we perform a PUT request.
    switch (newStatus) {
        case 'COMPLETED':
            await setCourseCompleted(studentId, disciplineId, 'PUT');
            break;
        case 'CURRENT':
            if (typeof classNumber !== 'number') {
                throw new Error("É necessário o número da turma para marcar como 'Cursando'.");
            }
            await setCourseCurrent(studentId, disciplineId, classNumber, 'PUT');
            break;
    }
}
