import {
  AngleoneLTPRes,
  AngleoneOrder,
  AngleonePlaceOrderRes,
  AngleoneScrip,
  AngleoneTrade,
  Exchange,
  OrderDuration,
  OrderType,
  OrderVariety,
  ProductType,
  TxnType,
} from '~/types/angleone'
import { fetchClient } from './fetch-client.server'

export interface PlaceOrderReq {
  variety: OrderVariety
  tradingsymbol: string
  symboltoken: string
  transactiontype: TxnType
  exchange: Exchange
  ordertype: OrderType
  producttype: ProductType
  duration: OrderDuration
  price: number | string
  squareoff: number | string
  stoploss: number | string
  triggerprice: number | string
  quantity: number
  ordertag?: string
}

export async function placeOrder({
  authToken,
  ordertag = 'ALS',
  ...body
}: {
  authToken: string
} & PlaceOrderReq) {
  const orderData = await fetchClient<AngleonePlaceOrderRes>(
    { endpoint: '/rest/secure/angelbroking/order/v1/placeOrder', authToken },
    { body: JSON.stringify(body) },
  )

  return orderData.data
}

export async function cancelOrder({
  authToken,
  ...body
}: {
  authToken: string
  variety: OrderVariety
  orderid: string | number
}) {
  const orderData = await fetchClient<AngleonePlaceOrderRes>(
    { endpoint: '/rest/secure/angelbroking/order/v1/cancelOrder', authToken },
    { body: JSON.stringify(body) },
  )

  return orderData.data
}

export async function getOrderBook({ authToken }: { authToken: string }) {
  const orderBookData = await fetchClient<AngleoneOrder[]>({
    endpoint: '/rest/secure/angelbroking/order/v1/getOrderBook',
    authToken,
  })

  return orderBookData.data
}

export async function getTradeBook({ authToken }: { authToken: string }) {
  const orderBookData = await fetchClient<AngleoneTrade[]>({
    endpoint: '/rest/secure/angelbroking/order/v1/getTradeBook',
    authToken,
  })

  return orderBookData.data
}

export async function getLTPData({
  authToken,
  exchange,
  symbol,
  symbolToken,
}: {
  authToken: string
  exchange: Exchange
  symbol: string
  symbolToken: string
}) {
  const orderBookData = await fetchClient<AngleoneLTPRes>(
    {
      endpoint: '/rest/secure/angelbroking/order/v1/getLtpData',
      authToken,
    },
    {
      body: JSON.stringify({
        exchange,
        tradingsymbol: symbol,
        symboltoken: symbolToken,
      }),
    },
  )

  return orderBookData.data
}

export async function searchScrip({
  authToken,
  symbol,
  exchange,
}: {
  authToken: string
  symbol: string
  exchange: 'BSE' | 'NSE'
}) {
  const symbolData = await fetchClient<AngleoneScrip[]>(
    {
      endpoint: '/rest/secure/angelbroking/order/v1/searchScrip',
      authToken,
    },
    { body: JSON.stringify({ exchange, searchscrip: symbol }) },
  )

  return symbolData.data
}

export async function getSymbolToken({
  authToken,
  symbol,
  exchange,
}: {
  authToken: string
  symbol: string
  exchange: 'BSE' | 'NSE'
}) {
  const symbolData = await searchScrip({ authToken, symbol, exchange })

  return symbolData?.find(
    ({ tradingsymbol }) =>
      tradingsymbol === `${symbol}-EQ` || tradingsymbol === symbol,
  )
}
