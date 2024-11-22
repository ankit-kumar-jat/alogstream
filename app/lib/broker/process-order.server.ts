import { getToken } from '~/lib/broker/angleone.server'
import { db } from '~/lib/db.server'
import { getLTPData, placeOrder } from './order.server'
import type { TxnType } from '~/types/angleone'
import type { Exchange, TargetStopLossType } from '@prisma/client'

interface ProcessOrderOptions {
  brokerAccountId: string
  userId: string
  signalId: string
  txnType: TxnType
  exchange: Exchange
  qty: number
  stopLoss: number
  target: number
  symbol: string
  symbolToken: string
  targetStopLossType: TargetStopLossType
}

export async function processOrder({
  brokerAccountId,
  userId,
  signalId,
  txnType,
  exchange,
  qty,
  stopLoss,
  target,
  symbol,
  symbolToken,
  targetStopLossType,
}: ProcessOrderOptions) {
  const { data: tokens, error } = await getToken({ brokerAccountId, userId })
  if (error || !tokens) {
    throw new Error('Unable to fetch token.')
  }

  const ltpData = await getLTPData({
    authToken: tokens.authToken,
    exchange,
    symbol,
    symbolToken,
  })

  if (!ltpData) {
    throw new Error('Unable to fetch created order.')
  }

  const price = parseFloat(ltpData.close)

  const { targetPrice, stopLossPrice } = calculateTargetAndStoplossPrice({
    price,
    target,
    stopLoss,
    targetStopLossType,
  })

  const orderRes = await placeOrder({
    authToken: tokens.authToken,
    variety: 'ROBO',
    ordertype: 'LIMIT',
    producttype: 'INTRADAY',
    duration: 'DAY',
    exchange: exchange,
    tradingsymbol: symbol,
    symboltoken: symbolToken,
    transactiontype: txnType,
    quantity: qty,
    squareoff: targetPrice,
    stoploss: stopLossPrice,
    triggerprice: 0,
    price: price,
    ordertag: 'ALS',
  })

  if (!orderRes) {
    throw new Error('Unable to create order.')
  }

  return await db.order.create({
    data: {
      brokerOrderId: orderRes.orderid,
      brokerUniqueOrderId: orderRes.uniqueorderid,
      qty,
      pendingQty: qty,
      status: 'PENDING',
      type: txnType,
      price: 0,
      profitLoss: 0,
      brokrage: 0,
      userId,
      signalId,
      brokerAccountId,
    },
  })
}

function calculateTargetAndStoplossPrice({
  price,
  target,
  stopLoss,
  targetStopLossType,
}: {
  price: number
  target: number
  stopLoss: number
  targetStopLossType: TargetStopLossType
}) {
  if (targetStopLossType === 'PERCENTAGE') {
    const targetPrice = Math.round((price * target) / 100)
    const stopLossPrice = Math.round((price * stopLoss) / 100)

    return { targetPrice, stopLossPrice }
  }

  return { targetPrice: price + target, stopLossPrice: price + stopLoss }
}
