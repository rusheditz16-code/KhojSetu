import { NextResponse } from 'next/server';
import { serverStore } from '../../../lib/server-store';

export async function POST(request: Request) {
  try {
    const userId = request.headers.get('x-user-id') || 'usr-anonymous';
    const contentType = request.headers.get('content-type') || '';

    let itemId = '';
    let privateProofDetail = '';
    let privateProofPhotoUrl: string | undefined = undefined;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      itemId = (formData.get('itemId') as string) || '';
      privateProofDetail = (formData.get('privateProofDetail') as string) || '';
      privateProofPhotoUrl = (formData.get('privateProofPhotoUrl') as string) || undefined;
      const proofPhoto = formData.get('proof_photo') as File | null;
      if (proofPhoto && proofPhoto.size > 0 && !privateProofPhotoUrl) {
        try {
          const buf = Buffer.from(await proofPhoto.arrayBuffer()).toString('base64');
          privateProofPhotoUrl = `data:${proofPhoto.type || 'image/jpeg'};base64,${buf}`;
        } catch {}
      }
    } else {
      const body = await request.json();
      itemId = body.itemId || '';
      privateProofDetail = body.privateProofDetail || '';
      privateProofPhotoUrl = body.privateProofPhotoUrl || undefined;
    }

    if (!itemId || !privateProofDetail) {
      return NextResponse.json({ message: 'itemId and privateProofDetail are required' }, { status: 400 });
    }

    const claim = serverStore.createClaim({
      itemId,
      claimantId: userId,
      privateProofDetail,
      privateProofPhotoUrl,
    });

    return NextResponse.json(
      {
        claim,
        message: 'Private ownership claim submitted securely.',
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to create claim' }, { status: 400 });
  }
}
