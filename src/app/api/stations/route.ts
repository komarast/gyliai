import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://api.meteo.lt/v1/hydro-stations', {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    if (!response.ok) {
      throw new Error(`LHMT hydro API responded with status: ${response.status}`);
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching hydro stations:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch stations' }, { status: 500 });
  }
}
