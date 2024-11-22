import { Exchange, Instrument } from '@prisma/client'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { useFetcher } from '@remix-run/react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '~/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '~/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'
import { useDebounce } from '~/hooks/use-debounce'
import { db } from '~/lib/db.server'
import { cn, isIn } from '~/lib/utils'

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const searchQuery = url.searchParams.get('q') ?? ''
  const exchange = url.searchParams.get('exchange')

  if (!exchange || !isIn(Object.values(Exchange), exchange)) {
    return { instruments: [], error: 'Invalid exchange value' }
  }

  const searchResults = await db.instrument.findMany({
    where: {
      name: { startsWith: searchQuery.toUpperCase() },
      exchange: { equals: exchange },
    },
    take: 20,
  })
  return { instruments: searchResults }
}

interface InstrumentSelectProps {
  exchange: Exchange
  value?: string
  setValue: (value: string) => void
}

export function InstrumentSelect({
  exchange,
  value = '',
  setValue,
}: InstrumentSelectProps) {
  const [open, setOpen] = useState(false)

  const fatcher = useFetcher<typeof loader>({ key: 'instruments-search' })

  const handleOnSearchChange = useDebounce((search: string) => {
    fatcher.load(
      `/resources/search-instrument?exchange=${exchange}&q=${search}`,
    )
  }, 400)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? fatcher.data?.instruments.find(
                instrument => instrument.token === value,
              )?.symbol
            : 'Select framework...'}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Type To Search..."
            onValueChange={handleOnSearchChange}
            className="uppercase"
          />
          <CommandList>
            <CommandEmpty>No Instrument found.</CommandEmpty>
            <CommandGroup>
              {fatcher.data?.instruments.map(instrument => (
                <CommandItem
                  key={instrument.token}
                  value={instrument.token}
                  onSelect={currentValue => {
                    setValue(currentValue === value ? '' : currentValue)
                    setOpen(false)
                  }}
                >
                  {instrument.name} ({instrument.symbol}) -{' '}
                  {instrument.exchange}
                  <Check
                    className={cn(
                      'ml-auto',
                      value === instrument.token ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
