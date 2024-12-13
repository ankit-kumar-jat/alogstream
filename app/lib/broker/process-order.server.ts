import { getToken } from '~/lib/broker/angleone.server'
import { db } from '~/lib/db.server'
import { placeOrder } from './order.server'
import type { TxnType } from '~/types/angleone'
import type { Exchange, TargetStopLossType } from '@prisma/client'
import { getPositions } from './portfolio.server'
import { remember } from '@epic-web/remember'
import { retryAsync } from 'ts-retry'

interface QueueItem {
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

class OrderQueue {
  activeWorkers: number
  queue: QueueItem[]
  stockLocks: Set<string>
  concurrency: number

  constructor(concurrency: number) {
    this.queue = []
    this.stockLocks = new Set() // Tracks stocks currently being processed
    this.activeWorkers = 0 // Tracks active workers
    this.concurrency = concurrency // Maximum concurrent stocks
  }

  public enqueue(order: QueueItem) {
    this.queue.push(order)
    this.process()
  }

  protected async process() {
    // If too many workers are active or no orders left, do nothing
    if (this.activeWorkers >= this.concurrency || this.queue.length === 0)
      return

    // Find an order for a stock that isn't locked
    const order = this.queue.find(o => !this.stockLocks.has(o.symbolToken))

    if (!order) return // No unlocked orders available yet

    this.activeWorkers++ // Increment active workers
    this.stockLocks.add(order.symbolToken) // Lock the stock
    this.queue = this.queue.filter(o => o !== order) // Remove from queue

    try {
      await this.executeOrder(order) // Process the order
    } catch (error) {
      console.error(
        `Failed to execute order: ${order.txnType}_${order.symbol}`,
        error,
      )
      // Optionally re-enqueue the order or log the failure
    } finally {
      this.stockLocks.delete(order.symbolToken) // Unlock the stock
      this.activeWorkers-- // Decrement active workers
      this.process() // Trigger the next order processing
    }

    // Process additional orders if workers are available
    this.process()
  }

  protected async executeOrder(order: QueueItem) {
    console.log(
      `Executing order: ${order.txnType}_${order.symbol}, Quantity: ${order.qty}`,
    )
    await retryAsync(
      async () => {
        await processOrder(order)
      },
      { delay: 1000, maxTry: 2 },
    )
  }
}

export const orderQueue = remember('order-queue', () => new OrderQueue(10))

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
  console.log(`🚀 ~ isPendingTrade ~ ${symbol}: ${Boolean(isPendingTrade)}`)

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

  await db.orderHistory.create({
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
