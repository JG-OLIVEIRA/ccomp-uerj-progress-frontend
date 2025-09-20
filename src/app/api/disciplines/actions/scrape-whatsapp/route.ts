
import { NextResponse } from 'next/server';

const EXTERNAL_API_BASE_URL = 'https://ccomp-uerj-progress-backend.onrender.com';

export async function POST(request: Request) {
  try {
    const apiResponse = await fetch(`${EXTERNAL_API_BASE_URL}/disciplines/actions/scrape-whatsapp`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    });

    if (apiResponse.status !== 202) {
      const errorText = await apiResponse.text();
      return NextResponse.json({ error: `External API call failed: ${errorText}` }, { status: apiResponse.status });
    }
    
    // The external API returns 202 Accepted with no body, so we forward that.
    return new NextResponse(null, { status: 202 });

  } catch (error) {
    console.error('Proxy scraping error:', error);
    return NextResponse.json({ error: 'Internal Server Error while proxying scrape action' }, { status: 500 });
  }
}
