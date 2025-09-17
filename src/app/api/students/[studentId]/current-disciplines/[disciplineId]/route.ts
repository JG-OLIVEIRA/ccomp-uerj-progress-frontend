
import { NextResponse } from 'next/server';

const EXTERNAL_API_BASE_URL = 'https://ccomp-uerj-progress-backend.onrender.com';

async function handlePutRequest(
  request: Request,
  { params }: { params: { studentId: string; disciplineId: string } }
) {
  const { studentId, disciplineId } = params;
  
  if (!studentId || !disciplineId) {
    return NextResponse.json({ error: 'Student ID and Discipline ID are required' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { classNumber } = body;

    if (typeof classNumber !== 'number') {
        return NextResponse.json({ error: 'classNumber must be a number' }, { status: 400 });
    }

    const apiResponse = await fetch(`${EXTERNAL_API_BASE_URL}/students/${studentId}/current-disciplines/${disciplineId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ classNumber })
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

async function handleDeleteRequest(
  request: Request,
  { params }: { params: { studentId: string; disciplineId: string } }
) {
    const { studentId, disciplineId } = params;
    
    if (!studentId || !disciplineId) {
      return NextResponse.json({ error: 'Student ID and Discipline ID are required' }, { status: 400 });
    }
  
    try {
      const apiResponse = await fetch(`${EXTERNAL_API_BASE_URL}/students/${studentId}/current-disciplines/${disciplineId}`, {
          method: 'DELETE',
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

export { handlePutRequest as PUT, handleDeleteRequest as DELETE };
