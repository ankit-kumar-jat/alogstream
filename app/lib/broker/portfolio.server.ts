import { AngleonePosition, AngleoneTrade } from '~/types/angleone'
import { fetchClient } from './fetch-client.server'

export async function getAllHoldings({ authToken }: { authToken: string }) {
  const orderBookData = await fetchClient<AngleoneTrade[]>({
    endpoint: '/rest/secure/angelbroking/order/v1/getAllHolding',
    authToken,
  })

  return orderBookData.data
}

export async function getPositions({ authToken }: { authToken: string }) {
  const orderBookData = await fetchClient<AngleonePosition[]>({
    endpoint: '/rest/secure/angelbroking/order/v1/getPosition',
    authToken,
  })

  return orderBookData.data
}

export async function get({ authToken }: { authToken: string }) {
  const orderBookData = await fetchClient<AngleoneTrade[]>({
    endpoint: '/rest/secure/angelbroking/order/v1/getPosition',
    authToken,
  })

  return orderBookData.data
}
