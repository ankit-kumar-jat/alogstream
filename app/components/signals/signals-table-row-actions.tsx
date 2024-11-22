import { Link, useSubmit } from '@remix-run/react'
import { Row } from '@tanstack/react-table'
import { MoreHorizontal } from 'lucide-react'

import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

const statusOptions = [
  { label: 'Draft', value: 'DRAFT', disabled: true },
  { label: 'Active', value: 'ACTIVE', disabled: false },
  { label: 'Inactive', value: 'INACTIVE', disabled: false },
  { label: 'Archived', value: 'ARCHIVED', disabled: false },
]

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const status = row.getValue<string>('status')
  const signalId = row.getValue<string>('id')

  const submit = useSubmit()

  const onStatusChange = (value: string) => {
    submit(
      { status: value },
      {
        method: 'PUT',
        preventScrollReset: true,
        action: `/dashboard/signals/${signalId}`,
        navigate: false,
      },
    )
  }

  const onDelete = () => {
    submit(
      {},
      {
        method: 'DELETE',
        preventScrollReset: true,
        action: `/dashboard/signals/${signalId}`,
        navigate: false,
      },
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <MoreHorizontal />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem asChild>
          <Link to={`/dashboard/signals/${signalId}`}>View</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Status</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup
              value={status}
              onValueChange={onStatusChange}
            >
              {statusOptions.map(status => (
                <DropdownMenuRadioItem
                  key={status.value}
                  value={status.value}
                  disabled={status.disabled}
                >
                  {status.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onDelete}>Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
