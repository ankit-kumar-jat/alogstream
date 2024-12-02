import { Form, useLoaderData } from '@remix-run/react'
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { Plus } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { db } from '~/lib/db.server'
import { requireUserId } from '~/lib/auth.server'

export async function loader({}: LoaderFunctionArgs) {
  const logs = await db.signalLogs.findMany({})
  const dailyReports = await db.dailyTradeReport.findMany({})

  return { logs, dailyReports }
}

export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request)

  await db.dailyTradeReport.create({
    data: {
      exchange: 'NSE',
      symbol: 'IOC-EQ',
      symbolToken: '1624',
      buyQty: 1,
      sellQty: 1,
      pnl: '-0.03',
      createdAt: '2024-12-02T11:50:00.782Z',
      userId,
      brokerAccountId: 'cm46pcf4o0001yzkruwluaujx',
    },
  })
  await db.dailyTradeReport.delete({
    where: { id: 'cm46yxdn20000sej2mb33p8kr' },
  })
  return {}
}

export default function Backtests() {
  const { logs, dailyReports } = useLoaderData<typeof loader>()
  return (
    <div className="container mx-auto my-10 space-y-4 px-4">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-lg font-bold md:text-xl">Backtests</h1>
        <div>
          <Button size="sm">
            <Plus /> New Backtest
          </Button>
        </div>
      </div>

      <pre>{JSON.stringify(dailyReports)}</pre>
      <Form method="POST">
        <Button type="submit">clean data</Button>
      </Form>
    </div>
  )
}
