import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { data } from '@remix-run/node'
import { z } from 'zod'
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
  quantity: z.number(),
  stoploss: z.number(),
  target: z.number(),
})

export async function action({ request }: ActionFunctionArgs) {
  const url = new URL(request.url)
  const key = url.searchParams.get('key')
  // TODO: validate key before any action

  if (!key) {
    return data({ success: false, message: 'Invalid api key' }, { status: 401 })
  }

  const signal = await db.signal.findUnique({
    where: { id: key },
  })

  if (!signal) {
    return data({ success: false, message: 'Invalid api key' }, { status: 401 })
  }

  const formData = await request.formData()
  console.log('🚀 ~ action ~ formData:', formData.get('action'))

  // const data = {
  //   symbol: 'LT',
  //   symbolToken: '1030',
  //   exchange: 'NSE',
  //   txnType: 'BUY', // BUY or SELL
  //   quantity: '1',
  //   price: '222.82', // just for refrence
  //   stoploss: '218',
  //   target: '235', // take profit
  // }

  return {}
}
