import {
  AngleoneOrder,
  AngleonePlaceOrderRes,
  AngleoneScrip,
  AngleoneTrade,
} from '~/types/angleone'
import { fetchClient } from './fetch-client.server'

type OrderVariety = 'NORMAL' | 'STOPLOSS' | 'AMO' | 'ROBO'
type TxnType = 'BUY' | 'SELL'
type exchange = 'NSE' | 'BSE'
type orderType = 'MARKET' | 'LIMIT' | 'STOPLOSS_LIMIT' | 'STOPLOSS_MARKET'
type productType = 'DELIVERY' | 'INTRADAY' | 'CARRYFORWARD' | 'MARGIN' | 'BO'
type orderDuration = 'DAY' | 'IOC'

interface PlaceOrderReq {
  variety: OrderVariety
  tradingsymbol: string
  symboltoken: string
  transactiontype: TxnType
  exchange: exchange
  ordertype: orderType
  producttype: productType
  duration: orderDuration
  price?: string
  squareoff?: string
  stoploss?: string
  quantity: string
}

export async function placeOrder({
  authToken,
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
