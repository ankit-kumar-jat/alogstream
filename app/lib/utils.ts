import { clsx, type ClassValue } from 'clsx'
import { jwtDecode } from 'jwt-decode'
import { twMerge } from 'tailwind-merge'
import { string } from 'zod'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isIn<T>(values: readonly T[], x: any): x is T {
  return values.includes(x)
}

/**
 * waits for provided time
 * @param ms time in millisecond
 * @returns Promise
 */
export function sleep(ms: number = 1000) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Simple debounce implementation
 */
export function debounce<
  Callback extends (...args: Parameters<Callback>) => void,
>(fn: Callback, delay: number) {
  let timer: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<Callback>) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn(...args)
    }, delay)
  }
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
    const currentTime = Math.round(Date.now() / 1000) + 30 // NOTE +30 will mark token expired 30 secounds early
    if (!decodedToken.exp) {
      return false // there is no expiry set
    }
    return decodedToken.exp < currentTime
  } catch (error) {
    console.error('Error decoding token:', error)
    return true
  }
}

export function isCurrentTimeInWindow({
  startHour,
  startMinute,
  endHour,
  endMinute,
  timeZone = 'Asia/Kolkata',
}: {
  startHour: number
  startMinute: number
  endHour: number
  endMinute: number
  timeZone?: string
}) {
  const now = new Date()

  // Convert current time to IST
  const currentIST = new Date(now.toLocaleString('en-US', { timeZone }))

  // Extract hours and minutes
  const currentHours = currentIST.getHours()
  const currentMinutes = currentIST.getMinutes()

  // Calculate time in minutes from midnight
  const startTime = startHour * 60 + startMinute
  const endTime = endHour * 60 + endMinute
  const currentTime = currentHours * 60 + currentMinutes

  // Handle ranges spanning midnight
  if (startTime <= endTime) {
    return currentTime >= startTime && currentTime <= endTime
  } else {
    return currentTime >= startTime || currentTime <= endTime
  }
}
