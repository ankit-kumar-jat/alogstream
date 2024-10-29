import { useRouteLoaderData } from '@remix-run/react'
import { type loader as rootLoader } from '~/root'

function isUser(user: any) {
  return user && typeof user === 'object' && typeof user.id === 'number'
}

export function useOptionalUser() {
  const data = useRouteLoaderData<typeof rootLoader>('root')
  console.log('🚀 ~ useOptionalUser ~ data:', data)
  if (!data || !isUser(data.user)) {
    return undefined
  }
  return data.user
}

export function useUser() {
  const maybeUser = useOptionalUser()
  if (!maybeUser) {
    throw new Error(
      'No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead.',
    )
  }
  return maybeUser
}
