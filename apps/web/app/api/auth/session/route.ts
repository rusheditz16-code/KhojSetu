import { NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { serverStore } from '@/lib/server-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!auth0) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }

    const session = await auth0.getSession();
    const claims = session?.user;
    if (!claims?.email) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }

    const syncedUser = serverStore.upsertGoogleUser({
      email: claims.email,
      name: claims.name || claims.nickname || claims.email.split('@')[0],
      avatarUrl: typeof claims.picture === 'string' ? claims.picture : undefined,
    });

    return NextResponse.json(
      {
        authenticated: true,
        user: {
          ...syncedUser,
          avatarUrl: syncedUser.avatarUrl || (typeof claims.picture === 'string' ? claims.picture : undefined),
          authProvider: 'auth0',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Auth0 session sync error:', error);
    return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
  }
}
