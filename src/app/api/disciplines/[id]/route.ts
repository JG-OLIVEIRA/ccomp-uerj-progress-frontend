
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params: { id } }: { params: { id: string } }
) {
  
  if (!id) {
    return NextResponse.json({ error: 'Discipline ID is required' }, { status: 400 });
  }

  try {
    const apiResponse = await fetch(`https://ccomp-uerj-progress-backend.onrender.com/disciplines/${id}`);

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      // Forward the status and error from the external API
      return NextResponse.json({ error: `Failed to fetch from external API: ${errorText}` }, { status: apiResponse.status });
    }

    const data = await apiResponse.json();
    // Forward the successful response from the external API
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy fetching error:', error);
    return NextResponse.json({ error: 'Internal Server Error while fetching from proxy' }, { status: 500 });
  }
}
