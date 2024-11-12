import type { LoaderFunctionArgs } from '@remix-run/node'
import { data } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { Button } from '~/components/ui/button'
import { requireUserId } from '~/lib/auth.server'
import { db } from '~/lib/db.server'

export async function loader({ request, params }: LoaderFunctionArgs) {
  const userId = await requireUserId(request)

  const { id } = params

  const signal = await db.signal.findUnique({
    where: { userId, id },
  })

  if (!signal) {
    return data({ signal: null }, { status: 404 })
  }

  return {
    signal: {
      ...signal,
      takeProfitValue: signal.takeProfitValue.toString(),
      stopLossValue: signal.stopLossValue.toString(),
    },
  }
}

export default function TradeSignals() {
  const { signal } = useLoaderData<typeof loader>()

  if (!signal) {
    return (
      <div className="container mx-auto my-10 max-w-3xl space-y-4 px-4">
        <p>404 | invalid signal id</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto my-10 max-w-3xl space-y-4 px-4">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-lg font-bold md:text-xl">Signals Details</h1>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-sm text-muted-foreground">Signal Name</p>
          <p>{signal.name}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Stock</p>
          <p>
            {signal.exchange} - {signal.tickerSymbol}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Stop Loss</p>
          <p>
            {signal.stopLossValue}
            {signal.targetStopLossType === 'PERCENTAGE' ? '%' : ''}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Target</p>
          <p>
            {signal.takeProfitValue}
            {signal.targetStopLossType === 'PERCENTAGE' ? '%' : ''}
          </p>
        </div>
        <div className="sm:col-span-2">
          <p className="text-sm text-muted-foreground">Description</p>
          <p>{signal.description}</p>
        </div>
      </div>
    </div>
  )
}
