import { redirect } from '@remix-run/node'
import { and, eq, gt } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { safeRedirect } from 'remix-utils/safe-redirect'
import { authSessionStorage } from '~/lib/session.server'
import { combineHeaders } from '~/lib/utils'
import { db } from '~/lib/db.server'
import { passwords, sessions, users } from '~/drizzle/schema.server'

export const SESSION_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 30
export const getSessionExpirationDate = () =>
  new Date(Date.now() + SESSION_EXPIRATION_TIME)

export const sessionKey = 'sessionId'

export async function getUserId(request: Request) {
  const authSession = await authSessionStorage.getSession(
    request.headers.get('cookie'),
  )
  const sessionId = authSession.get(sessionKey)
  if (!sessionId) return null
  const session = await db.query.sessions.findFirst({
    where: (sessions, { eq, gt }) =>
      and(eq(sessions.id, sessionId), gt(sessions.expirationDate, new Date())),
  })

  if (!session?.userId) {
    throw redirect('/', {
      headers: {
        'set-cookie': await authSessionStorage.destroySession(authSession),
      },
    })
  }
  return session.userId
}

export async function requireUserId(
  request: Request,
  { redirectTo }: { redirectTo?: string | null } = {},
) {
  const userId = await getUserId(request)
  if (!userId) {
    const requestUrl = new URL(request.url)
    redirectTo =
      redirectTo === null
        ? null
        : (redirectTo ?? `${requestUrl.pathname}${requestUrl.search}`)
    const loginParams = redirectTo ? new URLSearchParams({ redirectTo }) : null
    const loginRedirect = ['/login', loginParams?.toString()]
      .filter(Boolean)
      .join('?')
    throw redirect(loginRedirect)
  }
  return userId
}

export async function requireAnonymous(request: Request) {
  const userId = await getUserId(request)
  if (userId) {
    throw redirect('/')
  }
}

export async function login({
  email,
  password,
}: {
  email: string
  password: string
}) {
  const user = await verifyUserPassword({ email, password })
  if (!user) return null
  const session = await db
    .insert(sessions)
    .values({
      expirationDate: getSessionExpirationDate(),
      userId: user.id,
    })
    .returning()

  return session[0]
}

export async function resetUserPassword({
  userId,
  password,
}: {
  userId: number
  password: string
}) {
  const hashedPassword = await getPasswordHash(password)
  const updated = await db
    .update(passwords)
    .set({ hash: hashedPassword })
    .where(eq(passwords.userId, userId))
    .returning({ userId: passwords.userId })

  return updated[0]
}

export async function signup({
  email,
  password,
  name,
}: {
  email: string
  name: string
  password: string
}) {
  const hashedPassword = await getPasswordHash(password)

  const session = await db.transaction(async txn => {
    const user = await txn
      .insert(users)
      .values({ email: email.toLowerCase(), name })
      .returning()

    await txn
      .insert(passwords)
      .values({ hash: hashedPassword, userId: user[0].id })

    const session = await txn
      .insert(sessions)
      .values({
        expirationDate: getSessionExpirationDate(),
        userId: user[0].id,
      })
      .returning({
        id: sessions.id,
        userId: sessions.userId,
        expirationDate: sessions.expirationDate,
      })
    return session[0]
  })

  return session
}

export async function logout(
  {
    request,
    redirectTo = '/',
  }: {
    request: Request
    redirectTo?: string
  },
  responseInit?: ResponseInit,
) {
  const authSession = await authSessionStorage.getSession(
    request.headers.get('cookie'),
  )
  const sessionId = authSession.get(sessionKey)
  // if this fails, we still need to delete the session from the user's browser
  // and it doesn't do any harm staying in the db anyway.
  if (sessionId) {
    // the .catch is important because that's what triggers the query.
    void db
      .delete(sessions)
      .where(eq(sessions.id, sessionId))
      .catch(() => {})
  }
  throw redirect(safeRedirect(redirectTo), {
    ...responseInit,
    headers: combineHeaders(
      { 'set-cookie': await authSessionStorage.destroySession(authSession) },
      responseInit?.headers,
    ),
  })
}

export async function getPasswordHash(password: string) {
  const hash = await bcrypt.hash(password, 10)
  return hash
}

export async function verifyUserPassword({
  email,
  password,
}: {
  email: string
  password: string
}) {
  const userWithPassword = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, email),
    with: { password: true },
  })

  if (!userWithPassword || !userWithPassword.password) {
    return null
  }

  const isValid = await bcrypt.compare(password, userWithPassword.password.hash)

  if (!isValid) {
    return null
  }

  return { id: userWithPassword.id }
}
