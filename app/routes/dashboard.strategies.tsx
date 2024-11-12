import type { LoaderFunctionArgs } from '@remix-run/node'
import { Plus } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { requireUserId } from '~/lib/auth.server'
import { getToken } from '~/lib/broker/angleone.server'
import { db } from '~/lib/db.server'

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request)

  const brokerAccounts = await db.brokerAccount.findMany({
    where: { userId },
    select: { id: true },
  })

  const brokerAccountId = brokerAccounts[0].id

  const token = await getToken({ userId, brokerAccountId })
  console.log('🚀 ~ loader ~ token:', token)

  return { token }
}

export default function TradeSignals() {
  return (
    <div className="container mx-auto my-10 space-y-4 px-4">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-lg font-bold md:text-xl">Trade Strategies</h1>
        <div>
          <Button size="sm">
            <Plus /> New Strategy
          </Button>
        </div>
      </div>

      <div>account a</div>
    </div>
  )
}
