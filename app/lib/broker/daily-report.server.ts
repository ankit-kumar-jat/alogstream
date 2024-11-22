import type { Exchange } from '@prisma/client'
import { AngleoneTrade } from '~/types/angleone'

export async function processUserTrades(userId: string) {
  // TODO: get user token and trades from api and use blow function to calculate pnl
  // and store pnl in db
}

interface Trade {
  price: number
  quantity: number
}

interface SymbolData {
  buyQueue: Array<Trade>
  sellQueue: Array<Trade>
  pnl: number
  exchange: Exchange
  buyTradeCount: number
  sellTraderCount: number
}

export function processIntradayTrades(trades: AngleoneTrade[]) {
  const intradayTrades = trades.filter(
    trade => trade.producttype === 'INTRADAY',
  ) // Adjust productType key as needed

  const tradeSummary: Record<string, SymbolData> = {}

  intradayTrades.forEach(trade => {
    const { tradingsymbol, transactiontype, fillprice, fillsize, exchange } =
      trade

    if (!tradeSummary[tradingsymbol]) {
      tradeSummary[tradingsymbol] = {
        buyQueue: [],
        sellQueue: [],
        pnl: 0,
        exchange,
        sellTraderCount: 0,
        buyTradeCount: 0,
      }
    }

    const stockData = tradeSummary[tradingsymbol]

    if (transactiontype === 'BUY') {
      stockData.buyQueue.push({
        price: parseFloat(fillprice),
        quantity: parseInt(fillsize, 10),
      })
      stockData.buyTradeCount += 1
    } else if (transactiontype === 'SELL') {
      stockData.sellQueue.push({
        price: parseFloat(fillprice),
        quantity: parseInt(fillsize, 10),
      })
      stockData.sellTraderCount += 1
    }

    const queue =
      transactiontype === 'BUY' ? stockData.buyQueue : stockData.sellQueue
    const oppositeQueue =
      transactiontype === 'BUY' ? stockData.sellQueue : stockData.buyQueue

    let pnl = 0

    while (queue.length && oppositeQueue.length) {
      const currentOrder = queue[0]
      const oppositeOrder = oppositeQueue[0]

      const matchQty = Math.min(currentOrder.quantity, oppositeOrder.quantity)

      // Calculate PnL based on the trade direction
      if (transactiontype === 'BUY') {
        pnl += (oppositeOrder.price - currentOrder.price) * matchQty
      } else {
        pnl += (currentOrder.price - oppositeOrder.price) * matchQty
      }

      // Update remaining quantities in queues
      currentOrder.quantity -= matchQty
      oppositeOrder.quantity -= matchQty

      // Remove fully matched orders from the queue
      if (currentOrder.quantity === 0) queue.shift()
      if (oppositeOrder.quantity === 0) oppositeQueue.shift()
    }
    tradeSummary[tradingsymbol].pnl += pnl
  })

  return Object.keys(tradeSummary).map(key => ({
    ...tradeSummary[key],
    symbol: key,
  }))
}
