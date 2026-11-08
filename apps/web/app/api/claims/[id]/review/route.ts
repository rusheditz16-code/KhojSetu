import { NextResponse } from 'next/server';
import { serverStore } from '../../../../../lib/server-store';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const claim = serverStore.reviewClaim(
      params.id,
      body.status,
      body.reviewerNotes,
      body.pickupInstructions
    );
    return NextResponse.json({ claim });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 400 });
  }
}
