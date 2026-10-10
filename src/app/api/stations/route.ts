import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://api.meteo.lt/v1/stations');
    if (!response.ok) {
      throw new Error(`LHMT API responded with status: ${response.status}`);
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching stations:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch station data' }, { status: 500 });
  }
}
