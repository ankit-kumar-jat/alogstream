import { ActionFunctionArgs, data, redirect } from '@remix-run/node'
import { API_URL_LOGIN } from '~/config/angleone'
import { requireUserId } from '~/lib/auth.server'
import { buildURL } from '~/lib/utils'

import type { LoaderFunctionArgs } from '@remix-run/node'
import { login } from '~/lib/broker/angleone.server'
export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request)

  const url = new URL(request.url)
  const state = url.searchParams.get('state')
  const authToken = url.searchParams.get('auth_token')
  const feedToken = url.searchParams.get('feed_token')
  const refreshToken = url.searchParams.get('refresh_token')

  // TODO: validate state value
  // userId !== state
  if (!authToken || !feedToken || !refreshToken) {
    return data({
      success: false,
      errorMessage: 'Invalid login session value.',
    })
  }

  const { data: res, error } = await login({
    authToken,
    feedToken,
    refreshToken,
    userId,
  })

  return redirect('/dashboard/broker-accounts')
}

export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request)

  const redirectUrl = buildURL(API_URL_LOGIN, '/publisher-login', {
    api_key: process.env.API_KEY,
    state: userId,
  })
  console.log('🚀 ~ action ~ redirectUrl:', redirectUrl)

  return redirect(redirectUrl)
}
