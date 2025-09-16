
import { NextResponse } from 'next/server';

const EXTERNAL_API_BASE_URL = 'https://ccomp-uerj-progress-backend.onrender.com';

export async function GET(
  request: Request,
  { params }: { params: { studentId: string } }
) {
  const { studentId } = params;
  
  if (!studentId) {
    return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
  }

  try {
    // 1. Try to fetch the student
    const apiResponse = await fetch(`${EXTERNAL_API_BASE_URL}/students/${studentId}`);

    if (apiResponse.ok) {
      // Student found, return their data
      const data = await apiResponse.json();
      return NextResponse.json(data);
    }

    if (apiResponse.status === 404) {
      // 2. Student not found, so create a new one
      const creationResponse = await fetch(`${EXTERNAL_API_BASE_URL}/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId,
          name: 'Novo',
          lastName: 'Aluno',
          completedDisciplines: [],
          currentDisciplines: [],
        }),
      });

      if (!creationResponse.ok) {
        const errorText = await creationResponse.text();
        // This could happen if there's a race condition or other server error
        return NextResponse.json({ error: `Falha ao criar novo aluno após não encontrá-lo: ${errorText}` }, { status: creationResponse.status });
      }

      const newUser = await creationResponse.json();
      return NextResponse.json(newUser, { status: 201 }); // Return the newly created user
    }
    
    // Handle other non-404 errors from the initial fetch
    const errorText = await apiResponse.text();
    return NextResponse.json({ error: `Failed to fetch from external API: ${errorText}` }, { status: apiResponse.status });

  } catch (error) {
    console.error('Proxy fetching/creating error for student:', error);
    return NextResponse.json({ error: 'Internal Server Error during proxy operation' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { studentId: string } }
) {
    const { studentId } = params;

    if (!studentId) {
        return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
    }

    try {
        const body = await request.json();
        const { name, lastName } = body;

        if (!name && !lastName) {
            return NextResponse.json({ error: 'Name or lastName must be provided' }, { status: 400 });
        }

        const apiResponse = await fetch(`${EXTERNAL_API_BASE_URL}/students/${studentId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, lastName }),
        });

        if (!apiResponse.ok) {
            const errorText = await apiResponse.text();
            return NextResponse.json({ error: `Failed to update on external API: ${errorText}` }, { status: apiResponse.status });
        }

        const data = await apiResponse.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Proxy updating error for student:', error);
        return NextResponse.json({ error: 'Internal Server Error while updating via proxy' }, { status: 500 });
    }
}
