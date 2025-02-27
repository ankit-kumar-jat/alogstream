import { createCookieSessionStorage } from '@remix-run/node'

export const authSessionStorage = createCookieSessionStorage({
  cookie: {
    name: 'en_session',
    sameSite: 'lax', // CSRF protection is advised if changing to 'none'
    path: '/',
    httpOnly: true,
    secrets: [process.env.SESSION_SECRET],
    secure: import.meta.env.PROD,
  },
})

// we have to do this because every time you commit the session you overwrite it
// so we store the expiration time in the cookie and reset it every time we commit
const originalCommitSession = authSessionStorage.commitSession

Object.defineProperty(authSessionStorage, 'commitSession', {
  value: async function commitSession(
    ...args: Parameters<typeof originalCommitSession>
  ) {
    const [session, options] = args
    if (options?.expires) {
      session.set('expires', options.expires)
    }
    if (options?.maxAge) {
      session.set('expires', new Date(Date.now() + options.maxAge * 1000))
    }
    const expires = session.has('expires')
      ? new Date(session.get('expires'))
      : undefined
    const setCookieHeader = await originalCommitSession(session, {
      ...options,
      expires,
    })
    return setCookieHeader
  },
})
