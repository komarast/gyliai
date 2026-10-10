import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const today = new Date().toISOString().split('T')[0];
    
    // Try fetching today's observations first
    let res = await fetch(
      `https://api.meteo.lt/v1/hydro-stations/${code}/observations/measured/${today}`,
      { next: { revalidate: 600 } }
    );

    // If today is empty or fails, try yesterday
    if (!res.ok) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      res = await fetch(
        `https://api.meteo.lt/v1/hydro-stations/${code}/observations/measured/${yesterday}`,
        { next: { revalidate: 600 } }
      );
    }

    if (!res.ok) {
      return NextResponse.json({ observations: [] });
    }

    const data = await responseJsonSafe(res);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function responseJsonSafe(res: Response) {
  try {
    return await res.json();
  } catch {
    return { observations: [] };
  }
}
