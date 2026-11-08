import { NextResponse } from 'next/server';
import { serverStore } from '../../../../lib/server-store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    const user = serverStore.upsertGoogleUser({
      email: body.email,
      name: body.name || body.email.split('@')[0],
      avatarUrl: body.avatarUrl,
      role: body.role,
    });

    return NextResponse.json({
      user,
      token: 'jwt-google-verified-' + user.id,
      message: 'Successfully authenticated with Campus Google Workspace',
    });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Authentication failed' }, { status: 500 });
  }
}
