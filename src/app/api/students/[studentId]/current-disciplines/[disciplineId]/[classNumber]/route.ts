
import { NextResponse } from 'next/server';

const EXTERNAL_API_BASE_URL = 'https://ccomp-uerj-progress-backend.onrender.com';

async function handleRequest(
  request: Request,
  { params }: { params: { studentId: string; disciplineId: string, classNumber: string } }
) {
  const { studentId, disciplineId, classNumber } = params;
  
  if (!studentId || !disciplineId || !classNumber) {
    return NextResponse.json({ error: 'Student ID, Discipline ID and Class Number are required' }, { status: 400 });
  }

  try {
    const apiResponse = await fetch(`${EXTERNAL_API_BASE_URL}/students/${studentId}/current-disciplines/${disciplineId}/${classNumber}`, {
        method: request.method, // Handles PUT and DELETE
        headers: {
            'Content-Type': 'application/json',
        }
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      return NextResponse.json({ error: `Failed to update on external API: ${errorText}` }, { status: apiResponse.status });
    }

    const data = await apiResponse.json().catch(() => ({}));
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy updating error:', error);
    return NextResponse.json({ error: 'Internal Server Error while updating via proxy' }, { status: 500 });
  }
}

export { handleRequest as PUT, handleRequest as DELETE };
