import { LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData, useSearchParams } from '@remix-run/react'
import { addDays } from 'date-fns'
import {
  Activity,
  IndianRupee,
  ShoppingCart,
  TrendingUpDown,
  TrendingUp,
} from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, LabelList } from 'recharts'
import { CalendarDateRangePicker } from '~/components/daily-reports/date-range-picker'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '~/components/ui/chart'
import { requireUserId } from '~/lib/auth.server'
import { db } from '~/lib/db.server'
import { cn } from '~/lib/utils'

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request)

  const url = new URL(request.url)
  const brokerAccountId = url.searchParams.get('acc')

  const brokerAccounts = await db.brokerAccount.findMany({
    where: {
      userId,
    },
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

  const from = parseInt(url.searchParams.get('from') ?? '', 10)
  const to = parseInt(url.searchParams.get('to') ?? '', 10)

  const fromDate = from ? new Date(from) : addDays(new Date(), -1)
  const toDate = to ? new Date(to) : addDays(new Date(), -1)
  fromDate.setHours(0, 0, 0)
  toDate.setHours(24, 0, 0)

  const whereCondition = {
    userId,
    brokerAccountId: selectedBrokerAccount?.id,
    createdAt: {
      gte: fromDate,
      lte: toDate,
    },
  }

  const reports = await db.dailyTradeReport.aggregate({
    where: whereCondition,
    _sum: {
      pnl: true,
    },
  })

  const pnlReport = await db.dailyTradeReport.groupBy({
    by: ['symbol'],
    where: whereCondition,
    _sum: {
      pnl: true,
    },
  })

  return {
    brokerAccounts,
    isProfitable: (reports._sum.pnl?.toNumber() || 0) > 0 ? true : false,
    pnl: new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(reports._sum.pnl?.toNumber() || 0),
    stocks: pnlReport.length,
    pnlReport: pnlReport.map(report => ({
      pnl: report._sum.pnl?.toNumber() || 0,
      symbol: report.symbol,
    })),
  }
}

export default function Dashboard() {
  const { brokerAccounts, pnl, stocks, pnlReport, isProfitable } =
    useLoaderData<typeof loader>()
  const [searchParams, setSearchParams] = useSearchParams()

  const selectedAccount = searchParams.get('acc') ?? 'ALL'

  const onAccountChange = (acc: string) => {
    setSearchParams(prev => {
      if (acc === 'ALL') {
        prev.delete('acc')
        return prev
      }

      prev.set('acc', acc)
      return prev
    })
  }

  return (
    <div className="container mx-auto my-10 max-w-4xl space-y-4 px-4">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-lg font-bold md:text-xl">Dashboard</h1>
        <div className="flex flex-grow flex-wrap gap-3 sm:flex-grow-0 sm:flex-nowrap">
          <div className="w-full sm:w-64">
            <CalendarDateRangePicker />
          </div>
          <Select
            onValueChange={onAccountChange}
            defaultValue={selectedAccount}
          >
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Select Account" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="ALL">ALL</SelectItem>
              {brokerAccounts.map(account => (
                <SelectItem value={account.id} key={account.id}>
                  {account.clientName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Profit/Loss
            </CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                'text-2xl font-bold',
                isProfitable ? 'text-green-600' : 'text-green-600',
              )}
            >
              {pnl}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stocks</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stocks}</div>
          </CardContent>
        </Card>
        {/* <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Signals</CardTitle>
            <TrendingUpDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12,234</div>
            <p className="text-xs text-muted-foreground">
              +19% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Signals
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground">
              +201 since last hour
            </p>
          </CardContent>
        </Card> */}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-7">
          <CardHeader>
            <CardTitle className="text-xl">Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview chartData={pnlReport} />
          </CardContent>
        </Card>
        {/* <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>You made 265 orders this month.</CardDescription>
          </CardHeader>
          <CardContent><RecentSales /></CardContent>
        </Card> */}
      </div>
    </div>
  )
}

const chartConfig = {
  pnl: {
    label: 'PnL',
  },
} satisfies ChartConfig

function Overview({
  chartData,
}: {
  chartData: { pnl: number; symbol: string }[]
}) {
  if (!chartData.length) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center justify-center text-center">
        <h3 className="mt-4 text-lg font-semibold">Data not available</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">
          We don’t have enough data currently to generate insights.
        </p>
      </div>
    )
  }

  return (
    <ChartContainer config={chartConfig}>
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel hideIndicator />}
        />
        <Bar dataKey="pnl">
          <LabelList position="top" dataKey="symbol" fillOpacity={1} />
          {chartData.map(item => (
            <Cell
              key={item.symbol}
              fill={
                item.pnl > 0 ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-1))'
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}
