import { Plus } from 'lucide-react'
import { Button } from '~/components/ui/button'

import type { LoaderFunctionArgs } from '@remix-run/node'
import { db } from '~/lib/db.server'
import { useLoaderData } from '@remix-run/react'
export async function loader({}: LoaderFunctionArgs) {
  const logs = await db.signalLogs.findMany({})
  const dailyReports = await db.dailyTradeReport.findMany({})

  return { logs, dailyReports }
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
    </div>
  )
}
