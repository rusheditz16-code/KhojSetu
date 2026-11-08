import { NextResponse } from 'next/server';
import { serverStore } from '../../../../lib/server-store';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { searchParams } = new URL(request.url);
  const minScore = parseInt(searchParams.get('minScore') || '30', 10);
  const matches = serverStore.getMatches(params.id, minScore);
  return NextResponse.json({ matches });
}
