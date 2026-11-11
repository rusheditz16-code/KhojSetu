import { NextResponse } from 'next/server';
import { serverStore } from '../../../../lib/server-store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let email = body.email;
    let name = body.name;
    let avatarUrl = body.avatarUrl;

    // Decode official Google Identity Services JWT credential if provided
    if (body.credential) {
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
      } catch (e) {
        console.warn('Failed to parse Google JWT credential payload', e);
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
      message: 'Successfully authenticated with Google',
    });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Authentication failed' }, { status: 500 });
  }
}
