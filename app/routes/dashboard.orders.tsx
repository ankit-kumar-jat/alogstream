import { useLoaderData } from '@remix-run/react'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { db } from '~/lib/db.server'
import { requireUserId } from '~/lib/auth.server'
import { DataTable } from '~/components/data-table'
import { columns } from '~/components/orders/table-columns'

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request)
  const orderHistory = await db.orderHistory.findMany({ where: { userId } })

  return {
    orderHistory: orderHistory.map(order => ({
      ...order,
      price: order.price?.toNumber(),
      avgPrice: order.avgPrice?.toNumber(),
    })),
  }
}

export default function Orders() {
  const { orderHistory } = useLoaderData<typeof loader>()
  return (
    <div className="container mx-auto my-10 space-y-4 px-4">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-lg font-bold md:text-xl">Order History</h1>
        <div></div>
      </div>

      <div>
        <DataTable
          data={orderHistory}
          columns={columns}
          //   toolbar={table => <SignalTableToolbar table={table} />}
          //   pagination={table => <SignalTablePagination table={table} />}
        />
      </div>
    </div>
  )
}
