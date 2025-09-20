
import { NextResponse } from 'next/server';

const EXTERNAL_API_BASE_URL = 'https://ccomp-uerj-progress-backend.onrender.com';

// This route is a proxy to get all teachers for the ranking
export async function GET(request: Request) {
  try {
    const apiResponse = await fetch(`${EXTERNAL_API_BASE_URL}/teachers`);

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      return NextResponse.json({ error: `Failed to fetch from external API: ${errorText}` }, { status: apiResponse.status });
    }

    const data = await apiResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy fetching error for all teachers:', error);
    return NextResponse.json({ error: 'Internal Server Error during proxy operation for teachers' }, { status: 500 });
  }
}
