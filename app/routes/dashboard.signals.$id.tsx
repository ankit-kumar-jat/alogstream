import { SignalStatus } from '@prisma/client'
import type { LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/node'
import { data } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { Copy } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { requireUserId } from '~/lib/auth.server'
import { db } from '~/lib/db.server'
import { isIn } from '~/lib/utils'

export async function loader({ request, params }: LoaderFunctionArgs) {
  const userId = await requireUserId(request)
  const { id } = params

  const signal = await db.signal.findUnique({
    where: { userId, id },
  })

  if (!signal) {
    return data({ signal: null }, { status: 404 })
  }

  const url = new URL(request.url)
  const webhookURL = `https://${url.hostname}/webhook/signal?key=${signal.id}`
  const webhookPayload = `{"txnType": "{{strategy.order.action}}"}`

  return {
    signal: {
      ...signal,
      allocatedFund: signal.allocatedFund.toString(),
      takeProfitValue: signal.takeProfitValue.toString(),
      stopLossValue: signal.stopLossValue.toString(),
      webhookURL,
      webhookPayload,
    },
  }
}

export async function action({ request, params }: ActionFunctionArgs) {
  const userId = await requireUserId(request)
  const { id } = params

  if (request.method === 'PUT') {
    const formData = await request.formData()

    const status = formData.get('status')
    if (isIn(Object.values(SignalStatus), status)) {
      await db.signal.update({ where: { id, userId }, data: { status } })
      return { success: true }
    }

    return { success: false }
  }

  if (request.method === 'DELETE') {
    await db.signal.delete({ where: { id, userId } })
    return { success: true }
  }

  return { success: true }
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

  const onCopyWebhookURL = () => {
    navigator.clipboard.writeText(signal.webhookURL)
  }

  const onCopyWebhookPayload = () => {
    navigator.clipboard.writeText(signal.webhookPayload)
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
          <p className="text-sm text-muted-foreground">Signal Status</p>
          <p>{signal.status}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Stock</p>
          <p>
            {signal.exchange} - {signal.tickerSymbol}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Order Size (Lots)</p>
          <p>{signal.size}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Stop Loss</p>
          <p>
            {signal.stopLossValue}
            {signal.targetStopLossType === 'PERCENTAGE' ? '%' : ' Point'}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Target</p>
          <p>
            {signal.takeProfitValue}
            {signal.targetStopLossType === 'PERCENTAGE' ? '%' : ' Point'}
          </p>
        </div>

        <div className="sm:col-span-2">
          <p className="text-sm text-muted-foreground">Description</p>
          <p>{signal.description ?? '-'}</p>
        </div>
      </div>
      <div className="space-y-2">
        <h2 className="text-lg font-medium">TradingView Link</h2>
        <pre className="relative rounded-lg bg-muted p-2">
          {signal.webhookURL}
          <Button
            className="absolute right-0 top-0"
            onClick={onCopyWebhookURL}
            size="icon"
            variant="ghost"
          >
            <Copy />
          </Button>
        </pre>
        <pre className="relative rounded-lg bg-muted p-2">
          {signal.webhookPayload}
          <Button
            className="absolute right-0 top-0"
            onClick={onCopyWebhookPayload}
            size="icon"
            variant="ghost"
          >
            <Copy />
          </Button>
        </pre>
      </div>
    </div>
  )
}
