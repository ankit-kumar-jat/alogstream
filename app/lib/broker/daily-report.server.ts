import { retryAsync } from 'ts-retry'
import { db } from '~/lib/db.server'
import { getToken } from './angleone.server'
import { getPositions } from './portfolio.server'

const BATCH_SIZE = 10

export async function processAllUserPositions() {
  console.log(
    '🚀 ~ DailyReport generation started:',
    new Date(
      new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }),
    ).toLocaleString(),
  )

  // TODO: add pagination if user increases
  const users = await db.user.findMany({})

  for (let i = 0; i < users.length; i += BATCH_SIZE) {
    console.log('🚀 ~ DailyReport generation started: ', `batch-${i + 1}`)
    const batch = users.slice(i, i + BATCH_SIZE)
    try {
      const promises = batch.map(user => processUserPositions(user.id))
      await Promise.all(promises)
    } catch (error) {
      console.error(
        `Error processing user batch ${i / BATCH_SIZE + 1}:`,
        `userId: ${batch.map(({ id }) => id)}`,
        error,
      )
    }
    console.log('🚀 ~ DailyReport generation completed: ', `batch-${i + 1}`)
  }

  console.log(
    '🚀 ~ DailyReport generation completed:',
    new Date(
      new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }),
    ).toLocaleString(),
  )
}

export async function processUserPositions(userId: string) {
  const brokerAccounts = await db.brokerAccount.findMany({
    where: {
      userId,
    },
    select: { id: true },
  })

  if (!brokerAccounts.length) {
    return null
  }

  const promises = brokerAccounts.map(({ id }) =>
    processBrokerAccountPositions(userId, id),
  )

  return Promise.all(promises)
}

export async function processBrokerAccountPositions(
  userId: string,
  brokerAccountId: string,
) {
  const { data: tokens } = await getToken({ brokerAccountId, userId })
  if (!tokens) {
    return null
  }

  const positions = await retryAsync(
    async () => await getPositions({ authToken: tokens.authToken }),
    { delay: 1100, maxTry: 2 },
  )
  if (!positions) {
    return null
  }

  return db.dailyTradeReport.createMany({
    data: positions.map(position => ({
      exchange: position.exchange,
      symbol: position.tradingsymbol,
      symbolToken: position.symboltoken,
      buyQty: parseInt(position.buyqty, 10),
      sellQty: parseInt(position.sellqty, 10),
      pnl: position.pnl,
      userId,
      brokerAccountId,
    })),
  })
}
