
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
    currentDisciplines: (string | CurrentDiscipline)[]; // Supporting both for backward compatibility if needed
};

export type NewStudent = {
    studentId: string;
    name: string;
    lastName: string;
}

// Use a relative path to our own API proxy
const API_BASE_URL = '/api';

export async function getStudent(studentId: string): Promise<Student> {
    const response = await fetch(`${API_BASE_URL}/students/${studentId}`);
    if (!response.ok) {
        // The API route now handles creation, so this error is less likely for 404s,
        // but we keep it for other potential errors.
        const errorData = await response.json().catch(() => ({ error: 'Falha ao buscar ou criar dados do aluno.' }));
        throw new Error(errorData.error);
    }
    const student = await response.json();
    if(response.status === 201) {
        // You might want to show a different toast or handle the "new user" case here
        // For now, we just proceed.
    }
    return student;
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
    const endpoint = `${API_BASE_URL}/students/${studentId}/current-disciplines/${disciplineId}`;
    const body = method === 'PUT' ? JSON.stringify({ classNumber }) : undefined;
    const headers = method === 'PUT' ? { 'Content-Type': 'application/json' } : undefined;
    
    const response = await fetch(endpoint, { method, headers, body });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Falha ao atualizar status para cursando.`);
    }
}


export async function updateStudentCourseStatus(studentId: string, disciplineId: string, newStatus: CourseStatus, oldStatus: CourseStatus, classNumber?: number): Promise<void> {
    
    // Determine which lists to remove the course from
    if (oldStatus === 'COMPLETED') {
        await setCourseCompleted(studentId, disciplineId, 'DELETE');
    }
    if (oldStatus === 'CURRENT') {
        await setCourseCurrent(studentId, disciplineId, undefined, 'DELETE');
    }

    // Determine which list to add the course to
    if (newStatus === 'COMPLETED') {
        await setCourseCompleted(studentId, disciplineId, 'PUT');
    }
    if (newStatus === 'CURRENT') {
        if (typeof classNumber !== 'number') {
            throw new Error("É necessário o número da turma para marcar como 'Cursando'.");
        }
        await setCourseCurrent(studentId, disciplineId, classNumber, 'PUT');
    }
    // If newStatus is 'NOT_TAKEN', we've already removed it from other lists.
}
