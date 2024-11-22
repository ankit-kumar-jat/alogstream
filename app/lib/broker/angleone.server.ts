import { db } from '~/lib/db.server'
import { fetchClient } from './fetch-client.server'
import {
  AngleoneGenerateToken,
  AngleoneScrip,
  AngleoneUserProfile,
} from '~/types/angleone'
import { isTokenExpired } from '~/lib/utils'

export async function getToken({
  userId,
  brokerAccountId,
}: {
  userId: string
  brokerAccountId: string
}) {
  const tokens = await db.brokerAccount.findUnique({
    where: {
      userId,
      id: brokerAccountId,
    },
    select: {
      clientId: true,
      authToken: true,
      feedToken: true,
      refreshToken: true,
      isLoginRequired: true,
    },
  })

  if (!tokens) {
    return { error: 'Token not found' }
  }

  if (tokens.isLoginRequired) {
    return { error: 'Login required' }
  }

  const isExpired = isTokenExpired(tokens.authToken)

  if (!isExpired) {
    return { data: tokens }
  }

  const newTokens = await generateToken({
    authToken: tokens.authToken,
    refreshToken: tokens.refreshToken,
  })

  if (!newTokens) {
    await db.brokerAccount.update({
      where: { id: brokerAccountId },
      data: { isLoginRequired: true },
    })
    return { error: 'Login required' }
  }

  await db.brokerAccount.update({
    where: { id: brokerAccountId },
    data: {
      isLoginRequired: false,
      authToken: newTokens.jwtToken,
      feedToken: newTokens.feedToken,
      refreshToken: newTokens.refreshToken,
    },
  })
  return {
    data: {
      clientId: tokens.clientId,
      authToken: newTokens.jwtToken,
      feedToken: newTokens.feedToken,
      refreshToken: newTokens.refreshToken,
      isLoginRequired: false,
    },
  }
}

export async function login({
  userId,
  authToken,
  refreshToken,
  feedToken,
}: {
  userId: string
  authToken: string
  refreshToken: string
  feedToken: string
}) {
  const profile = await getProfile({ authToken })

  if (!profile) {
    return {
      error: 'Unable to get user profile data.',
    }
  }

  const existingAccount = await db.brokerAccount.findUnique({
    where: {
      brokerAccountIdentifier: { userId: userId, clientId: profile.clientcode },
    },
    select: { id: true },
  })

  if (existingAccount) {
    const brokerAccount = await db.brokerAccount.update({
      where: {
        brokerAccountIdentifier: { userId, clientId: profile.clientcode },
      },
      data: {
        broker: 'ANGLEONE',
        clientName: profile.name,
        authToken,
        feedToken,
        refreshToken,
        isLoginRequired: false,
      },
      select: { id: true, clientId: true },
    })

    return { data: brokerAccount }
  }

  const brokerAccount = await db.brokerAccount.create({
    data: {
      broker: 'ANGLEONE',
      clientName: profile.name,
      clientId: profile.clientcode,
      authToken,
      feedToken,
      refreshToken,
      userId,
      isLoginRequired: false,
    },
    select: { id: true, clientId: true },
  })

  return { data: brokerAccount }
}

export async function getProfile({ authToken }: { authToken: string }) {
  const profileData = await fetchClient<AngleoneUserProfile>({
    endpoint: '/rest/secure/angelbroking/user/v1/getProfile',
    authToken,
  })

  return profileData.data
}

export async function generateToken({
  authToken,
  refreshToken,
}: {
  authToken: string
  refreshToken: string
}) {
  const tokensData = await fetchClient<AngleoneGenerateToken>(
    {
      endpoint: '/rest/auth/angelbroking/jwt/v1/generateTokens',
      authToken,
    },
    { body: JSON.stringify({ refreshToken }) },
  )

  return tokensData.data
}
