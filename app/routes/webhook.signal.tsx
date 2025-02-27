import type { ActionFunctionArgs } from '@remix-run/node'
import { data, json } from '@remix-run/node'
import { z } from 'zod'

import { orderQueue } from '~/lib/broker/process-order.server'
import { db } from '~/lib/db.server'
import { isCurrentTimeInWindow } from '~/lib/utils'

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
    return Response.json(
      { success: false, message: 'Invalid api key' },
      { status: 401 },
    )
  }

  const signal = await db.signal.findUnique({
    where: { id: key },
    include: {
      brokerAccounts: {
        select: { id: true, clientId: true },
      },
    },
  })

  if (!signal) {
    return Response.json(
      { success: false, message: 'Invalid api key' },
      { status: 401 },
    )
  }

  const formPayload = await request.json()
  console.log('🚀 ~ action ~ formPayload:', formPayload)
  const parsed = await SignalSchema.safeParseAsync({
    txnType:
      typeof formPayload?.txnType === 'string'
        ? formPayload.txnType.toUpperCase()
        : formPayload?.txnType,
  })
  console.log('🚀 ~ action ~ parsed:', parsed)

  if (!parsed.success) {
    return Response.json(
      {
        success: false,
        message: 'Invalid payload',
        error: parsed.error.format(),
      },
      { status: 400 },
    )
  }

  db.signalLogs.create({
    data: {
      body: parsed.data,
      signalId: signal.id,
      userId: signal.userId,
    },
  })

  if (signal && signal.status !== 'ACTIVE') {
    // Ignore status to
    console.log('Signal is not live')
    return data({ success: true }, { status: 200 })
  }

  if (!inMarketTime()) {
    console.log('Market is closed')
    // Ignore order if not in market time
    return data({ success: true }, { status: 200 })
  }

  signal.brokerAccounts.map(({ id, clientId }) =>
    orderQueue.enqueue({
      brokerAccountId: id,
      clientId,
      userId: signal.userId,
      signalId: signal.id,
      txnType: parsed.data.txnType,
      exchange: signal.exchange,
      qty: signal.size,
      lotSize: signal.lotSize,
      symbol: signal.tickerSymbol,
      symbolToken: signal.tickerSymbolToken,
    }),
  )

  return Response.json({ success: true }, { status: 200 })
}

function inMarketTime() {
  return isCurrentTimeInWindow({
    // MARKET_START = 9:15 am
    startHour: 9,
    startMinute: 13,
    // we only accept orders till 2:30 pm
    // MARKET_CLOSE = 2:30 pm
    endHour: 14,
    endMinute: 30,
  })
}
