import { NextResponse } from 'next/server';
import { serverStore } from '../../../../../lib/server-store';

export async function GET() {
  const highlights = serverStore.getHighlights();
  return NextResponse.json({ highlights });
}
