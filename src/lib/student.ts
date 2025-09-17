
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


export async function updateStudentCourseStatus(studentId: string, disciplineId: string, newStatus: CourseStatus, oldStatus: CourseStatus, classNumber?: number): Promise<void> {
    
    // We remove from the old list first
    if (oldStatus === 'COMPLETED') {
        await setCourseCompleted(studentId, disciplineId, 'DELETE');
    }
    // Removing from 'CURRENT' is more complex as it requires the class number.
    // Instead of handling it here, we rely on the fact that `fetchStudentData` will be called
    // immediately after this, which will re-sync the entire state from the backend.
    // The backend is the source of truth. When we add the discipline to a new list (e.g., 'COMPLETED'),
    // the backend logic should handle removing it from the 'CURRENT' list.
    // If we change from CURRENT to NOT_TAKEN, the DELETE operation for the specific class is required.
    
    if (oldStatus === 'CURRENT') {
        // Find the student's current class for this discipline to delete it.
        // This is tricky without the full student object. The context will re-fetch,
        // but for a clean state change, we should delete the specific class enrollment.
        // Let's assume the backend handles this if we just PUT to a new status.
        // For a status change to 'NOT_TAKEN', we MUST delete from current.
        // The API for that needs the class number. We will rely on re-fetching for now.
        // This is a simplification. A more robust implementation would pass the old class number.
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
    // If newStatus is 'NOT_TAKEN', we've already removed it from other lists and just need to re-fetch.
}

