import { Table } from '@tanstack/react-table'
import { Archive, Circle, CircleCheckBig, CircleOff, X } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { DataTableFacetedFilter } from '~/components/data-table/fact-filter'
import { DataTableViewOptions } from '~/components/data-table/view-options'

export const statuses = [
  {
    value: 'DRAFT',
    label: 'Draft',
    icon: Circle,
  },
  {
    value: 'ACTIVE',
    label: 'Live',
    icon: CircleCheckBig,
  },
  {
    value: 'INACTIVE',
    label: 'Inactive',
    icon: CircleOff,
  },
  {
    value: 'ARCHIVED',
    label: 'Archived',
    icon: Archive,
  },
]

interface SignalTableToolbarProps<TData> {
  table: Table<TData>
}

export function SignalTableToolbar<TData>({
  table,
}: SignalTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter tasks..."
          value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
          onChange={event =>
            table.getColumn('name')?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn('status') && (
          <DataTableFacetedFilter
            column={table.getColumn('status')}
            title="Status"
            options={statuses}
          />
        )}
        {/* {table.getColumn('priority') && (
          <DataTableFacetedFilter
            column={table.getColumn('priority')}
            title="Priority"
            options={priorities}
          />
        )} */}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}
