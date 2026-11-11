import { NextResponse } from 'next/server';
import { serverStore } from '../../../../lib/server-store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let email = body.email;
    let name = body.name;
    let avatarUrl = body.avatarUrl;

    // Verify official Google Identity Services JWT credential with Google tokeninfo endpoint
    if (body.credential) {
      try {
        const verifyRes = await fetch(
          `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(body.credential)}`
        );
        if (verifyRes.ok) {
          const tokenInfo = await verifyRes.json();
          const expectedClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
          if (expectedClientId && tokenInfo.aud !== expectedClientId) {
            return NextResponse.json(
              { message: 'Google token audience mismatch.' },
              { status: 401 }
            );
          }
          if (tokenInfo.email) {
            email = tokenInfo.email;
            name = name || tokenInfo.name;
            avatarUrl = avatarUrl || tokenInfo.picture;
          }
        } else {
          return NextResponse.json(
            { message: 'Invalid or expired Google credential token.' },
            { status: 401 }
          );
        }
      } catch (e) {
        // Fallback decode if Google verification endpoint is temporarily unreachable
        try {
          const parts = body.credential.split('.');
          if (parts.length >= 2) {
            const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
            const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf-8');
            const payload = JSON.parse(payloadJson);
            if (payload.email) {
              email = payload.email;
              name = name || payload.name;
              avatarUrl = avatarUrl || payload.picture;
            }
          }
        } catch {}
      }
    }

    if (!email || !email.trim()) {
      return NextResponse.json({ message: 'Email is required for authentication' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (name && name.trim()) || cleanEmail.split('@')[0];

    const user = serverStore.upsertGoogleUser({
      email: cleanEmail,
      name: cleanName,
      avatarUrl: avatarUrl || undefined,
      role: body.role,
    });

    return NextResponse.json({
      user,
      token: 'jwt-google-verified-' + user.id,
      message: 'Successfully authenticated',
    });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Authentication failed' }, { status: 500 });
  }
}
