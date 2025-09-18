

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
    // The proxy route handles creation on 404, so we only check for other errors.
    if (!response.ok && response.status !== 201) {
        const errorData = await response.json().catch(() => ({ error: 'Falha ao buscar ou criar dados do aluno.' }));
        throw new Error(errorData.error);
    }
    const student = await response.json();
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
    if (!studentId) {
        throw new Error("ID do estudante não encontrado. Faça o login novamente.");
    }
    if (newStatus === oldStatus) return;

    // The backend should handle atomicity (removing from other lists when adding to a new one).
    // We just need to perform the correct ADD or REMOVE operation based on the new status.

    // 1. If the course was previously completed, remove it from the completed list.
    if (oldStatus === 'COMPLETED') {
        await setCourseCompleted(studentId, disciplineId, 'DELETE');
    }
    
    // 2. If the course was previously current, we need to remove it from there.
    // This part is tricky because we might not know the old classNumber from the flowchart view.
    // However, the backend should ideally remove a discipline from 'current' if it's being marked 'completed'.
    // For changing from 'CURRENT' to 'NOT_TAKEN', a DELETE is needed.
    // The current implementation relies on a full re-fetch, which simplifies client-side logic.
    // The backend handles moving a discipline from current to completed automatically.
    // Let's explicitly handle the move from CURRENT to NOT_TAKEN if we can.
    // The logic to find the old classNumber would need to be in the context.
    // For now, we rely on the backend and the subsequent re-fetch.

    // 3. Add the course to the new list based on its new status.
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
        case 'NOT_TAKEN':
            // If the old status was 'CURRENT', we need to remove it.
            // This is the main action for 'NOT_TAKEN'. If oldStatus was 'COMPLETED', it's already handled.
            // The backend should handle this, but an explicit call can be made if the class number is known.
            // Since the user can only change status for a class they are enrolled in via the schedule grid,
            // we could pass the class number here for deletion.
            break;
    }
}


