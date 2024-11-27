import { ColumnDef } from '@tanstack/react-table'
import type { DailyTradeReport } from '@prisma/client'
import { Link } from '@remix-run/react'
import { DataTableColumnHeader } from '~/components/data-table/column-header'

interface ModifiedDailyReport extends Omit<DailyTradeReport, 'pnl'> {
  pnl: number
}

export const columns: ColumnDef<ModifiedDailyReport>[] = [
  { accessorKey: 'id' },
  {
    accessorKey: 'exchange',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Exchange" />
    ),
    cell: ({ row }) => (
      <div className="w-[80px]">{row.getValue('exchange')}</div>
    ),
  },
  {
    accessorKey: 'symbol',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Symbol" />
    ),
    cell: ({ row }) => <div className="w-[80px]">{row.getValue('symbol')}</div>,
  },
  {
    accessorKey: 'buyQty',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total Buy Qty" />
    ),
    cell: ({ row }) => <div className="w-[60px]">{row.getValue('buyQty')}</div>,
  },
  {
    accessorKey: 'sellQty',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total Sell Qty" />
    ),
    cell: ({ row }) => (
      <div className="w-[60px]">{row.getValue('sellQty')}</div>
    ),
  },
  {
    accessorKey: 'pnl',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="PnL" />
    ),
    cell: ({ row }) => <div className="w-[60px]">{row.getValue('pnl')}</div>,
  },
]
