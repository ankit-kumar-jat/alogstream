import { ColumnDef } from '@tanstack/react-table'
import type { Signal } from '@prisma/client'

import { DataTableColumnHeader } from './signals-table-column-header'
import { DataTableRowActions } from './signals-table-row-actions'
import { statuses } from './signals-table-toolbar'
import { Link } from '@remix-run/react'
import { Dialog } from '@radix-ui/react-dialog'

interface ModifiedSignal
  extends Omit<Signal, 'stopLossValue' | 'takeProfitValue' | 'allocatedFund'> {
  stopLossValue: string
  takeProfitValue: string
  allocatedFund: string
}

export const columns: ColumnDef<ModifiedSignal>[] = [
  { accessorKey: 'id' },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <Link
            to={`/dashboard/signals/${row.original.id}`}
            className="max-w-[500px] truncate font-medium"
          >
            {row.getValue('name')}
          </Link>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
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
    accessorKey: 'tickerSymbol',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Symbol" />
    ),
    cell: ({ row }) => (
      <div className="w-[80px]">{row.getValue('tickerSymbol')}</div>
    ),
  },
  {
    accessorKey: 'takeProfitValue',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Target" />
    ),
    cell: ({ row }) => (
      <div className="w-[80px]">{row.getValue('takeProfitValue')}</div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'stopLossValue',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Stop Loss" />
    ),
    cell: ({ row }) => (
      <div className="w-[80px]">{row.getValue('stopLossValue')}</div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = statuses.find(
        status => status.value === row.getValue('status'),
      )

      if (!status) {
        return null
      }

      return (
        <div className="flex w-[100px] items-center">
          {status.icon && (
            <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />
          )}
          <span>{status.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
