import type { LoaderFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { Plus } from 'lucide-react'
import { SignalsTable } from '~/components/signals/signals-table'
import { columns } from '~/components/signals/signals-table-columns'
import { Button } from '~/components/ui/button'
import { requireUserId } from '~/lib/auth.server'
import { db } from '~/lib/db.server'

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request)

  const signals = await db.signal.findMany({
    where: { userId },
  })

  return {
    signals: signals.map(signal => ({
      ...signal,
      allocatedFund: signal.allocatedFund.toString(),
      takeProfitValue: signal.takeProfitValue.toString(),
      stopLossValue: signal.stopLossValue.toString(),
    })),
  }
}

export default function TradeSignals() {
  const { signals } = useLoaderData<typeof loader>()
  return (
    <div className="container mx-auto my-10 space-y-4 px-4">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-lg font-bold md:text-xl">Trade Signals</h1>
        <div>
          <Button size="sm" asChild>
            <Link to="./create">
              <Plus /> New Signal
            </Link>
          </Button>
        </div>
      </div>

      <div>
        <SignalsTable data={signals} columns={columns} />
      </div>
    </div>
  )
}
