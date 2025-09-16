
import type { CourseStatus, CourseWithStatus } from "@/contexts/student-context";

export type Student = {
    studentId: string;
    name: string;
    lastName: string;
    completedDisciplines: string[];
    currentDisciplines: string[];
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

async function setCourseStatus(studentId: string, disciplineId: string, status: 'completed' | 'current', method: 'PUT' | 'DELETE'): Promise<void> {
    const endpoint = `${API_BASE_URL}/students/${studentId}/${status}-disciplines/${disciplineId}`;
    const response = await fetch(endpoint, { method });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Falha ao atualizar status da disciplina para ${status}.`);
    }
}

export async function updateStudentCourseStatus(studentId: string, disciplineId: string, newStatus: CourseStatus, oldStatus: CourseStatus): Promise<void> {
    
    // Determine which lists to remove the course from
    if (oldStatus === 'COMPLETED') {
        await setCourseStatus(studentId, disciplineId, 'completed', 'DELETE');
    }
    if (oldStatus === 'CURRENT') {
        await setCourseStatus(studentId, disciplineId, 'current', 'DELETE');
    }

    // Determine which list to add the course to
    if (newStatus === 'COMPLETED') {
        await setCourseStatus(studentId, disciplineId, 'completed', 'PUT');
    }
    if (newStatus === 'CURRENT') {
        await setCourseStatus(studentId, disciplineId, 'current', 'PUT');
    }
    // If newStatus is 'NOT_TAKEN', we've already removed it from other lists.
}
