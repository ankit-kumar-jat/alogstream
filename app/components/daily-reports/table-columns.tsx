import { ColumnDef } from '@tanstack/react-table'
import type { DailyTradeReport } from '@prisma/client'
import { Link } from '@remix-run/react'
import { DataTableColumnHeader } from '~/components/data-table/column-header'
import { cn } from '~/lib/utils'
import { format } from 'date-fns'

interface ModifiedDailyReport extends Omit<DailyTradeReport, 'pnl'> {
  pnl: number
}

export const columns: ColumnDef<ModifiedDailyReport>[] = [
  { accessorKey: 'id' },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => (
      <div>{format(row.getValue<string>('createdAt'), 'dd/MM/yyyy')}</div>
    ),
  },
  {
    accessorKey: 'exchange',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Exchange" />
    ),
    cell: ({ row }) => <div>{row.getValue('exchange')}</div>,
  },
  {
    accessorKey: 'symbol',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Symbol" />
    ),
    cell: ({ row }) => <div>{row.getValue('symbol')}</div>,
  },
  {
    accessorKey: 'buyQty',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total Buy Qty" />
    ),
    cell: ({ row }) => <div>{row.getValue('buyQty')}</div>,
  },
  {
    accessorKey: 'sellQty',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total Sell Qty" />
    ),
    cell: ({ row }) => <div>{row.getValue('sellQty')}</div>,
  },
  {
    accessorKey: 'pnl',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="PnL" />
    ),
    cell: ({ row }) => {
      const pnl = row.getValue<number>('pnl')
      return (
        <div
          className={cn(
            'font-medium',
            pnl > 0 && 'text-green-600',
            pnl < 0 && 'text-red-600',
          )}
        >
          {pnl}
        </div>
      )
    },
  },
]
