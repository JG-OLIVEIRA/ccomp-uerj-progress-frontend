
import { NextResponse } from 'next/server';

const EXTERNAL_API_BASE_URL = 'https://ccomp-uerj-progress-backend.onrender.com';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; classNumber: string } }
) {
  const { id, classNumber } = params;
  
  if (!id || !classNumber) {
    return NextResponse.json({ error: 'Discipline ID and Class Number are required' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { whatsappGroup } = body;

    if (typeof whatsappGroup !== 'string') {
        return NextResponse.json({ error: 'whatsappGroup link must be a string' }, { status: 400 });
    }

    const apiResponse = await fetch(`${EXTERNAL_API_BASE_URL}/disciplines/${id}/classes/${classNumber}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ whatsappGroup })
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
