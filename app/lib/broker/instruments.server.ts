// symbol data fetch

import { db } from '~/lib/db.server'
import type { Exchange } from '@prisma/client'

interface Instrument {
  token: string
  symbol: string
  name: string
  expiry: string
  instrumenttype?: string
  exch_seg: Exchange
  tick_size: string
  lotsize: string
  strike: string
}

export async function getInstruments() {
  const res = await fetch(
    'https://margincalculator.angelbroking.com/OpenAPI_File/files/OpenAPIScripMaster.json',
  )

  if (!res.ok) {
    throw new Error('Unable to fetch instruments')
  }

  const instruments: Instrument[] = await res.json()

  return instruments
}

export async function saveInstumentsIntoDB() {
  const instruments = await getInstruments()

  await db.instrument.createMany({
    data: instruments.map(instrument => ({
      token: instrument.token,
      symbol: instrument.symbol,
      name: instrument.name,
      expiry: instrument.expiry,
      type: instrument.instrumenttype,
      exchange: instrument.exch_seg,
      tickSize: instrument.tick_size,
      lotSize: parseInt(instrument.lotsize, 10),
    })),
    skipDuplicates: true,
  })
}

export async function updateInstumentsIntoDB() {
  console.log(
    '🚀 ~ Update Instuments List Started:',
    new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }),
  )

  await db.instrument.deleteMany({})
  await saveInstumentsIntoDB()

  console.log(
    '🚀 ~ Update Instuments List Completed:',
    new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }),
  )
}
