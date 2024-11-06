import { clsx, type ClassValue } from 'clsx'
import { jwtDecode } from 'jwt-decode'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Merge multiple headers objects into one (uses set so headers are overridden)
 */
export function mergeHeaders(
  ...headers: Array<ResponseInit['headers'] | null | undefined>
) {
  const merged = new Headers()
  for (const header of headers) {
    if (!header) continue
    for (const [key, value] of new Headers(header).entries()) {
      merged.set(key, value)
    }
  }
  return merged
}

/**
 * Combine multiple header objects into one (uses append so headers are not overridden)
 */
export function combineHeaders(
  ...headers: Array<ResponseInit['headers'] | null | undefined>
) {
  const combined = new Headers()
  for (const header of headers) {
    if (!header) continue
    for (const [key, value] of new Headers(header).entries()) {
      combined.append(key, value)
    }
  }
  return combined
}

/**
 * construct full url from base, pathname and params object
 */
export function buildURL(
  baseUrl: string,
  endpoint: string,
  params?: string[][] | Record<string, string> | string | URLSearchParams,
) {
  const searchParams = new URLSearchParams(params)

  if (endpoint.startsWith('/')) {
    endpoint = endpoint.substring(1)
  }
  const url = new URL(endpoint, baseUrl)
  url.search = searchParams.toString()

  return url.toString()
}

export function isTokenExpired(token: string) {
  if (!token) return true
  try {
    const decodedToken = jwtDecode(token)
    const currentTime = Date.now() / 1000 + 30 // NOTE +30 will mark token expired 30 secounds early
    if (!decodedToken.exp) {
      return false // there is no expiry set
    }
    return decodedToken.exp < currentTime
  } catch (error) {
    console.error('Error decoding token:', error)
    return true
  }
}
