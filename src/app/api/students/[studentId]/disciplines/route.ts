
import { NextResponse } from 'next/server';

const EXTERNAL_API_BASE_URL = 'https://ccomp-uerj-progress-backend.onrender.com';

export async function GET(
  request: Request,
  { params }: { params: { studentId: string } }
) {
  const studentId = params.studentId;
  
  if (!studentId) {
    return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
  }

  try {
    const apiResponse = await fetch(`${EXTERNAL_API_BASE_URL}/students/${studentId}/disciplines`);

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      return NextResponse.json({ error: `Failed to fetch from external API: ${errorText}` }, { status: apiResponse.status });
    }

    const data = await apiResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy fetching error for student disciplines:', error);
    return NextResponse.json({ error: 'Internal Server Error while fetching from proxy' }, { status: 500 });
  }
}
