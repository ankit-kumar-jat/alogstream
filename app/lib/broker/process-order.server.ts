import { getToken } from '~/lib/broker/angleone.server'
import { db } from '~/lib/db.server'
import { placeOrder } from './order.server'
import type {
  OrderDuration,
  OrderType,
  OrderVariety,
  ProductType,
  TxnType,
} from '~/types/angleone'
import type { Exchange, TargetStopLossType } from '@prisma/client'
import { getPositions } from './portfolio.server'
import { remember } from '@epic-web/remember'
import { retryAsync } from 'ts-retry'

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
  authToken: string
  variety: OrderVariety
  orderType: OrderType
  productType: ProductType
  duration?: OrderDuration
  price?: number | string
  squareoff?: number | string
  stoploss?: number | string
  triggerprice?: number | string
  parentOrderId?: string
}

type QueueItem = Pick<
  ProcessOrderOptions,
  | 'brokerAccountId'
  | 'userId'
  | 'clientId'
  | 'signalId'
  | 'txnType'
  | 'exchange'
  | 'qty'
  | 'lotSize'
  | 'symbol'
  | 'symbolToken'
>

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
    const order = this.queue.find(
      o => !this.stockLocks.has(`${o.symbolToken}-${o.clientId}`),
    )

    if (!order) return // No unlocked orders available yet

    this.activeWorkers++ // Increment active workers
    this.stockLocks.add(`${order.symbolToken}-${order.clientId}`) // Lock the stock

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
      this.stockLocks.delete(`${order.symbolToken}-${order.clientId}`) // Unlock the stock
      this.activeWorkers-- // Decrement active workers
      this.process() // Trigger the next order processing
    }

    // Process additional orders if workers are available
    this.process()
  }

  protected async executeOrder(order: QueueItem) {
    console.log(
      `Executing order: ${order.txnType}_${order.symbol}_${order.clientId}, Quantity: ${order.qty}`,
    )
    await retryAsync(
      async () => {
        const { data: tokens, error } = await getToken({
          brokerAccountId: order.brokerAccountId,
          userId: order.userId,
        })
        if (error || !tokens) {
          throw new Error(`Unable to fetch token for ${order.clientId}`)
        }

        const positions = await getPositions({ authToken: tokens.authToken })

        const isPendingTrade = positions?.find(position => {
          return (
            position.symboltoken === order.symbolToken &&
            position.sellqty !== position.buyqty
          )
        })
        console.log(
          `🚀 ~ isPendingTrade ~ ${order.symbol}_${order.clientId}: ${Boolean(isPendingTrade)}`,
        )

        if (isPendingTrade) {
          return null
        }

        await placeOrderAndSaveIntoDB({
          ...order,
          variety: 'NORMAL',
          orderType: 'MARKET',
          productType: 'INTRADAY',
          duration: 'DAY',
          authToken: tokens.authToken,
        })
      },
      { delay: 1000, maxTry: 2 },
    )
  }
}

export const orderQueue = remember('order-queue', () => new OrderQueue(10))

class OrderPostbackQueue {
  activeWorkers: number
  queue: ProcessOrderOptions[]
  concurrency: number

  constructor(concurrency: number) {
    this.queue = []
    this.activeWorkers = 0 // Tracks active workers
    this.concurrency = concurrency // Maximum concurrent stocks
  }

  public enqueue(order: ProcessOrderOptions) {
    this.queue.push(order)
    this.process()
  }

  protected async process() {
    // If too many workers are active or no orders left, do nothing
    if (this.activeWorkers >= this.concurrency || this.queue.length === 0)
      return

    const order = this.queue.shift()
    if (!order) return // No unlocked orders available yet

    this.activeWorkers++ // Increment active workers

    try {
      await this.executeOrder(order) // Process the order
    } catch (error) {
      console.error(
        `Failed to execute postback order: ${order.txnType}_${order.symbol}_${order.clientId}`,
        error,
      )
      // Optionally re-enqueue the order or log the failure
    } finally {
      this.activeWorkers-- // Decrement active workers
      this.process() // Trigger the next order processing
    }

    // Process additional orders if workers are available
    this.process()
  }

  protected async executeOrder(order: ProcessOrderOptions) {
    console.log(
      `Executing postback order: ${order.txnType}_${order.symbol}_${order.clientId}, Quantity: ${order.qty}`,
    )
    await retryAsync(
      async () => {
        await placeOrderAndSaveIntoDB(order)
      },
      { delay: 1000, maxTry: 2 },
    )
  }
}

export const orderPostbackQueue = remember(
  'order-postback-queue',
  () => new OrderPostbackQueue(10),
)

export async function placeOrderAndSaveIntoDB({
  price = '0',
  squareoff = '0',
  stoploss = '0',
  triggerprice = '0',
  duration = 'DAY',
  ...options
}: ProcessOrderOptions) {
  const orderRes = await placeOrder({
    authToken: options.authToken,
    variety: options.variety,
    ordertype: options.orderType,
    producttype: options.productType,
    duration,
    exchange: options.exchange,
    tradingsymbol: options.symbol,
    symboltoken: options.symbolToken,
    transactiontype: options.txnType,
    quantity: options.qty,
    price,
    triggerprice,
    squareoff,
    stoploss,
  })

  console.log('🚀 ~ orderRes:', orderRes)

  if (!orderRes) {
    throw new Error(
      `Unable to create order: ${options.txnType}_${options.symbol}_${options.clientId}`,
    )
  }

  await retryAsync(
    async () => {
      await db.orderHistory.create({
        data: {
          brokerOrderId: orderRes.orderid,
          brokerUniqueOrderId: orderRes.uniqueorderid,
          clientId: options.clientId,
          price: 0,
          qty: options.qty,
          lotSize: options.lotSize,
          filledShares: 0,
          unfilledShares: options.qty * options.lotSize,
          txnType: options.txnType,
          status: 'PENDING',
          variety: options.variety,
          orderType: options.orderType,
          productType: options.productType,
          exchange: options.exchange,
          symbol: options.symbol,
          symbolToken: options.symbolToken,
          userId: options.userId,
          signalId: options.signalId,
          brokerAccountId: options.brokerAccountId,
          parentOrderId: options.parentOrderId ?? undefined,
        },
      })
    },
    { delay: 100, maxTry: 2 },
  )
  return null
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
