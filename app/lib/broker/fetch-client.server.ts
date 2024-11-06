import https from 'node:https'
import { API_URL } from '~/config/angleone-api'

import { buildURL } from '~/lib/utils'

interface ApiRes<T> {
  status: boolean
  message: string
  errorcode: string | null
  data: T | null
}

export async function fetchClient<T>(
  { endpoint, authToken }: { endpoint: string; authToken: string },
  {
    body,
    params,
    ...customConfig
  }: RequestInit & {
    params?: string[][] | Record<string, string> | string | URLSearchParams
  } = {},
) {
  const url = buildURL(API_URL, endpoint, params)

  const headers = {
    'Content-Type': 'application/json',
    ['Accept']: 'application/json',
    // 'User-Agent': 'AlgoStream/1.0',
    'X-PrivateKey': `${process.env.API_KEY}`,
    'X-UserType': 'USER',
    'X-SourceID': 'WEB',
    'X-ClientLocalIP': '192.168.1.11',
    'X-ClientPublicIP': '117.222.214.85',
    'X-MACAddress': 'c0:3c:59:b5:b3:46',
    ['Authorization']: `Bearer ${authToken}`,
  }

  const config: RequestInit = {
    method: body ? 'POST' : 'GET',
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
    body,
  }

  const res = await fetch(url, config)

  if (res.ok) {
    const isJson = res.headers.get('content-type')?.includes('application/json')

    if (!isJson) {
      console.warn(await res.text())
      throw new Error(
        `Expected json from api, got: ${res.headers.get('content-type')}`,
      )
    }
    const data: ApiRes<T> = await res.json()

    return data
  }

  console.warn(await res.text())
  throw new Error(`Fetch for api failed with code: ${res.status}`)
}
