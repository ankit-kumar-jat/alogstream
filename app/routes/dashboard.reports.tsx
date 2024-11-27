import type { LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData, useSearchParams } from '@remix-run/react'
import { columns } from '~/components/daily-reports/table-columns'
import { DataTable } from '~/components/data-table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { requireUserId } from '~/lib/auth.server'
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

  const selectedBrokerAccount = brokerAccountId
    ? brokerAccounts?.find(acc => acc.id == brokerAccountId)
    : brokerAccounts?.[0]

  if (!selectedBrokerAccount) {
    return { brokerAccounts: [], reports: [] }
  }

  const reports = await db.dailyTradeReport.findMany({
    where: {
      userId,
      brokerAccountId: selectedBrokerAccount.id,
    },
  })

  return {
    brokerAccounts,
    reports: reports.map(report => ({ ...report, pnl: report.pnl.toNumber() })),
  }
}

export default function Reports() {
  const { brokerAccounts, reports } = useLoaderData<typeof loader>()
  const [searchParams, setSearchParams] = useSearchParams()

  const selectedAccount = searchParams.get('acc') ?? brokerAccounts?.[0].id

  const onAccountChange = (acc: string) => {
    setSearchParams({ acc })
  }

  return (
    <div className="container mx-auto my-10 space-y-4 px-4">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-lg font-bold md:text-xl">Trade Report</h1>
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

      <div>
        <DataTable data={reports} columns={columns} />
      </div>
    </div>
  )
}
