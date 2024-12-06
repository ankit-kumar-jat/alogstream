import { getToken } from '~/lib/broker/angleone.server'
import { db } from '~/lib/db.server'
import { getLTPData, placeOrder } from './order.server'
import type { OrderType, TxnType } from '~/types/angleone'
import type { Exchange, TargetStopLossType } from '@prisma/client'
import { getPositions } from './portfolio.server'

interface ProcessOrderOptions {
  brokerAccountId: string
  userId: string
  clientId: string
  signalId: string
  txnType: TxnType
  exchange: Exchange
  qty: number
  lotSize: number
  symbol: string
  symbolToken: string
}

export async function processOrder({
  brokerAccountId,
  userId,
  clientId,
  signalId,
  txnType,
  exchange,
  qty,
  lotSize,
  symbol,
  symbolToken,
}: ProcessOrderOptions) {
  const { data: tokens, error } = await getToken({ brokerAccountId, userId })
  if (error || !tokens) {
    throw new Error('Unable to fetch token.')
  }

  const positions = await getPositions({ authToken: tokens.authToken })

  const isPendingTrade = positions?.find(position => {
    return (
      position.symboltoken === symbolToken &&
      position.sellqty !== position.buyqty
    )
  })
  console.log('🚀 ~ isPendingTrade ~ isPendingTrade:', Boolean(isPendingTrade))

  if (isPendingTrade) {
    return null
  }

  const orderRes = await placeOrder({
    authToken: tokens.authToken,
    variety: 'NORMAL',
    ordertype: 'MARKET',
    producttype: 'INTRADAY',
    duration: 'DAY',
    exchange: exchange,
    tradingsymbol: symbol,
    symboltoken: symbolToken,
    transactiontype: txnType,
    quantity: qty,
    price: '0',
    triggerprice: '0',
    squareoff: '0',
    stoploss: '0',
  })

  console.log('🚀 ~ orderRes:', orderRes)

  if (!orderRes) {
    throw new Error('Unable to create order.')
  }

  return await db.orderHistory.create({
    data: {
      brokerOrderId: orderRes.orderid,
      brokerUniqueOrderId: orderRes.uniqueorderid,
      clientId,

      price: 0,
      qty,
      lotSize,
      filledShares: 0,
      unfilledShares: qty * lotSize,
      txnType,
      status: 'PENDING',
      variety: 'NORMAL',
      orderType: 'MARKET',
      productType: 'INTRADAY',

      exchange,
      symbol,
      symbolToken,

      userId,
      signalId,
      brokerAccountId,
    },
  })
}

export function calculateTargetAndStoplossPrice({
  price,
  target,
  stopLoss,
  targetStopLossType,
  txnType,
}: {
  price: number
  target: number
  stopLoss: number
  targetStopLossType: TargetStopLossType
  txnType: TxnType
}) {
  console.log(
    `🚀 ~ calculating TGPrice&SLPrice ~ price: ${price} ~ TG: ${target} ~ SL: ${stopLoss} `,
  )
  let targetPrice = 0
  let stopLossPrice = 0
  if (targetStopLossType === 'PERCENTAGE') {
    targetPrice = roundOff((price * target) / 100)
    stopLossPrice = roundOff((price * stopLoss) / 100)
  } else {
    targetPrice = roundOff(target)
    stopLossPrice = roundOff(stopLoss)
  }

  if (txnType === 'BUY') {
    return {
      targetPrice: price + targetPrice,
      stopLossPrice: price - stopLossPrice,
    }
  } else {
    return {
      targetPrice: price - targetPrice,
      stopLossPrice: price + stopLossPrice,
    }
  }
}

function roundOff(value: number) {
  return Math.round(value / 0.05) * 0.05
}
