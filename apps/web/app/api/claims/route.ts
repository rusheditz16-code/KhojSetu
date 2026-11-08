import { NextResponse } from 'next/server';
import { serverStore } from '../../../lib/server-store';

export async function POST(request: Request) {
  try {
    const userId = request.headers.get('x-user-id') || 'usr-priya-01';
    const body = await request.json();

    if (!body.itemId || !body.privateProofDetail) {
      return NextResponse.json({ message: 'itemId and privateProofDetail are required' }, { status: 400 });
    }

    const claim = serverStore.createClaim({
      itemId: body.itemId,
      claimantId: userId,
      privateProofDetail: body.privateProofDetail,
      privateProofPhotoUrl: body.privateProofPhotoUrl,
    });

    return NextResponse.json({
      claim,
      message: 'Private ownership claim submitted securely.',
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 400 });
  }
}
