import { SignalStatus } from '@prisma/client'
import type { LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/node'
import { data } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { Copy, Pen } from 'lucide-react'
import { useState } from 'react'
import { Button } from '~/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip'
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
  const webhookBuyPayload = `{"txnType": "BUY"}`
  const webhookSellPayload = `{"txnType": "SELL"}`

  return {
    signal: {
      ...signal,
      allocatedFund: signal.allocatedFund.toString(),
      takeProfitValue: signal.takeProfitValue.toString(),
      stopLossValue: signal.stopLossValue.toString(),
      webhookURL,
      webhookPayload,
      webhookBuyPayload,
      webhookSellPayload,
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
  return (
    <div className="container mx-auto my-10 max-w-3xl space-y-4 px-4">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-lg font-bold md:text-xl">Signals Details</h1>
        <Button asChild size="sm">
          <Link to={`/dashboard/signals/create?id=${signal.id}`}>Edit</Link>
        </Button>
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
        <div className="sm:col-span-2">
          <p className="text-sm text-muted-foreground">Webhook URL</p>
          <CopyBox data={signal.webhookURL} />
        </div>
        <div className="sm:col-span-2">
          <p className="text-sm text-muted-foreground">Message</p>
          <CopyBox data={signal.webhookPayload} />
        </div>
        <div className="sm:col-span-2">
          <p className="text-sm text-muted-foreground">Buy only Message</p>
          <CopyBox data={signal.webhookBuyPayload} />
        </div>
        <div className="sm:col-span-2">
          <p className="text-sm text-muted-foreground">Sell only Message</p>
          <CopyBox data={signal.webhookSellPayload} />
        </div>
      </div>
    </div>
  )
}

function CopyBox({ data }: { data: string }) {
  const [open, setOpen] = useState(false)

  const showTooltip = () => {
    setOpen(true)
    setTimeout(() => setOpen(false), 1000)
  }

  const copyToClipboard = (value: string) => {
    navigator.clipboard.writeText(value)
    showTooltip()
  }

  return (
    <div className="relative">
      <pre className="overflow-x-auto rounded-lg bg-muted p-2 pr-10">
        {data}
      </pre>
      <TooltipProvider>
        <Tooltip open={open}>
          <TooltipTrigger asChild>
            <Button
              className="absolute right-0 top-0"
              onClick={() => copyToClipboard(data)}
              size="icon"
              variant="ghost"
              title="Click to Copy"
            >
              <Copy />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Copied!</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
