import { ColumnDef } from '@tanstack/react-table'
import type { OrderHistory } from '@prisma/client'
import { DataTableColumnHeader } from '~/components/data-table/column-header'
import { format } from 'date-fns'

interface ModifiedOrder extends Omit<OrderHistory, 'price' | 'avgPrice'> {
  avgPrice?: number
  price?: number
}

export const columns: ColumnDef<ModifiedOrder>[] = [
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
    cell: ({ row }) => (
      <div className="w-[160px]">{row.getValue('symbol')}</div>
    ),
  },
  {
    accessorKey: 'txnType',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Txn Type" />
    ),
    cell: ({ row }) => <div>{row.getValue('txnType')}</div>,
  },
  {
    accessorKey: 'qty',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Qty (Lots)" />
    ),
    cell: ({ row }) => <div>{row.getValue('qty')}</div>,
  },
  {
    accessorKey: 'lotSize',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Lot Size" />
    ),
    cell: ({ row }) => <div>{row.getValue('lotSize')}</div>,
  },
  {
    accessorKey: 'avgPrice',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Avg. Price" />
    ),
    cell: ({ row }) => {
      return <div className={'font-medium'}>{row.getValue('avgPrice')}</div>
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      return <div className={'font-medium'}>{row.getValue('status')}</div>
    },
  },
]
