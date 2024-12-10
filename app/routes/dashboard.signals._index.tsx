import type { LoaderFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { Plus } from 'lucide-react'
import { DataTable } from '~/components/data-table'
import { TablePagination } from '~/components/data-table/pagination'
import { columns } from '~/components/signals/signals-table-columns'
import { SignalTableToolbar } from '~/components/signals/signals-table-toolbar'
import { Button } from '~/components/ui/button'
import { requireUserId } from '~/lib/auth.server'
import { db } from '~/lib/db.server'

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request)

  const signals = await db.signal.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
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
        <DataTable
          data={signals}
          columns={columns}
          toolbar={table => <SignalTableToolbar table={table} />}
          pagination={table => <TablePagination table={table} />}
        />
      </div>
    </div>
  )
}
