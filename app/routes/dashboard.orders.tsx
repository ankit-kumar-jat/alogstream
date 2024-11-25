import type { LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData, useSearchParams } from '@remix-run/react'
import { string } from 'zod'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { requireUserId } from '~/lib/auth.server'
import { getToken } from '~/lib/broker/angleone.server'
import { getOrderBook, getTradeBook } from '~/lib/broker/order.server'
import { getPositions } from '~/lib/broker/portfolio.server'
import { db } from '~/lib/db.server'

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request)

  const url = new URL(request.url)
  const brokerAccountId = url.searchParams.get('acc')

  const brokerAccounts = await db.brokerAccount.findMany({
    where: { userId },
    select: {
      id: true,
      broker: true,
      clientName: true,
      clientId: true,
    },
  })

  const isBrokerAccountIdExists = brokerAccountId
    ? Boolean(brokerAccounts?.find(acc => acc.id == brokerAccountId))
    : true

  if (!brokerAccounts.length || !isBrokerAccountIdExists) {
    return { brokerAccounts: [], orders: [] }
  }
  const { data: tokens } = await getToken({
    brokerAccountId: brokerAccountId ?? brokerAccounts[0].id,
    userId,
  })

  if (!tokens) {
    return { brokerAccounts: [], orders: [] }
  }

  const orders = await getOrderBook({ authToken: tokens.authToken })
  console.log('🚀 ~ loader ~ orders:', orders)

  const positions = await getPositions({ authToken: tokens.authToken })
  console.log('🚀 ~ loader ~ positions:', positions)

  const trades = await getTradeBook({ authToken: tokens.authToken })
  console.log('🚀 ~ loader ~ trades:', trades)

  return { brokerAccounts, orders: orders ?? [] }
}

export default function Orders() {
  const { brokerAccounts, orders } = useLoaderData<typeof loader>()
  const [searchParams, setSearchParams] = useSearchParams()

  const selectedAccount = searchParams.get('acc') ?? brokerAccounts[0].id

  const onAccountChange = (acc: string) => {
    setSearchParams({ acc })
  }

  return (
    <div className="container mx-auto my-10 space-y-4 px-4">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-lg font-bold md:text-xl">Trade Signals</h1>
        <div>
          <Select
            onValueChange={onAccountChange}
            defaultValue={selectedAccount}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Account" />
            </SelectTrigger>

            <SelectContent>
              {brokerAccounts.map(account => (
                <SelectItem value={account.id} key={account.id}>
                  {account.clientName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
