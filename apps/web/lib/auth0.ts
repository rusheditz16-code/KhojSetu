import { Auth0Client } from '@auth0/nextjs-auth0/server';

const hasAuth0Env = Boolean(
  process.env.AUTH0_DOMAIN &&
    process.env.AUTH0_CLIENT_ID &&
    process.env.AUTH0_CLIENT_SECRET &&
    process.env.AUTH0_SECRET
);

export const auth0 = hasAuth0Env
  ? new Auth0Client({
      signInReturnToPath: '/',
      noContentProfileResponseWhenUnauthenticated: true,
    })
  : null;
