import type { ActionFunctionArgs } from '@remix-run/node'
import { data, json } from '@remix-run/node'
import { z } from 'zod'
import { retryAsync } from 'ts-retry'

import { processOrder } from '~/lib/broker/process-order.server'
import { db } from '~/lib/db.server'

// Instructions to add signal
// create signal => select symbol/stock and exchange, name signal, qty,
//                  product Type, order-tag (to identify autometic order)
// set target/stop loss percentage or points
//
//
// Add stratagy entry with alert message
// stratagy.entry("name", stratagy.long, alert_messgae='{id: "1", signal: "BUY"}')
//

// variety
// NORMAL      Normal Order (Regular)
// STOPLOSS    Stop loss order
// AMO         After Market Order
// ROBO        ROBO (Bracket Order)

// transactiontype
// BUY
// SELL

// ordertype
// MARKET              Market Order(MKT)
// LIMIT               Limit Order(L)
// STOPLOSS_LIMIT      Stop Loss Limit Order(SL)
// STOPLOSS_MARKET     Stop Loss Market Order(SL-M)

// producttype
// DELIVERY                Cash & Carry for equity (CNC)
// CARRYFORWARD            Normal for futures and options (NRML)
// MARGIN                  Margin Delivery
// INTRADAY                Margin Intraday Squareoff (MIS)
// BO                      Bracket Order (Only for ROBO)

// Duration
// DAY         Regular Order
// IOC         Immediate or Cancel

// exchange
// BSE     BSE Equity
// NSE     NSE Equity
// NFO     NSE Future and Options
// MCX     MCX Commodity
// BFO     BSE Futures and Options
// CDS     Currency Derivate Segment

const SignalSchema = z.object({
  txnType: z.enum(['BUY', 'SELL']),
})

export async function action({ request }: ActionFunctionArgs) {
  const url = new URL(request.url)
  const key = url.searchParams.get('key')

  if (!key) {
    return json({ success: false, message: 'Invalid api key' }, { status: 401 })
  }

  const signal = await db.signal.findUnique({
    where: { id: key },
    include: {
      brokerAccounts: {
        select: { id: true },
      },
    },
  })

  if (!signal) {
    return json({ success: false, message: 'Invalid api key' }, { status: 401 })
  }

  if (signal)
    if (signal.status !== 'ACTIVE') {
      // Ignore status to
      return data({ success: true }, { status: 200 })
    }

  const formPayload = await request.json()
  const parsed = await SignalSchema.safeParseAsync(formPayload)

  if (!parsed.success) {
    return json(
      {
        success: false,
        message: 'Invalid payload',
        error: parsed.error.format(),
      },
      { status: 400 },
    )
  }

  signal.brokerAccounts.map(
    async ({ id }) =>
      await retryAsync(
        async () => {
          await processOrder({
            brokerAccountId: id,
            userId: signal.userId,
            signalId: signal.id,
            txnType: parsed.data.txnType,
            exchange: signal.exchange,
            qty: signal.size,
            stopLoss: signal.stopLossValue.toNumber(),
            target: signal.takeProfitValue.toNumber(),
            symbol: signal.tickerSymbol,
            symbolToken: signal.tickerSymbolToken,
            targetStopLossType: signal.targetStopLossType,
          })
        },
        { delay: 1000, maxTry: 2 },
      ),
  )

  return json({ success: true }, { status: 200 })
}
