import * as React from 'react'
import { useSearchParams } from '@remix-run/react'
import { addDays, format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { DateRange, SelectRangeEventHandler } from 'react-day-picker'

import { cn } from '~/lib/utils'
import { Button } from '~/components/ui/button'
import { Calendar } from '~/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'
import { useDebounce } from '~/hooks/use-debounce'

export function CalendarDateRangePicker({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const [searchParams, setSearchParams] = useSearchParams()
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  const [date, setDate] = React.useState<DateRange | undefined>({
    from: from ? new Date(from) : addDays(new Date(), -6),
    to: to ? new Date(to) : new Date(),
  })

  const updateSearchParams = useDebounce((range: DateRange | undefined) => {
    setSearchParams(
      prev => {
        if (!range || !range?.from || !range?.to) {
          prev.delete('from')
          prev.delete('to')
          return prev
        }

        prev.set('from', format(range.from, 'yyyy-MM-dd'))
        prev.set('to', format(range.to, 'yyyy-MM-dd'))

        return prev
      },
      { preventScrollReset: true, replace: true },
    )
  }, 1000)

  const onDateSelect: SelectRangeEventHandler = range => {
    setDate(range)
    updateSearchParams(range)
  }

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={'outline'}
            className="justify-start text-left font-normal text-muted-foreground"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, 'LLL dd, y')} -{' '}
                  {format(date.to, 'LLL dd, y')}
                </>
              ) : (
                format(date.from, 'LLL dd, y')
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={onDateSelect}
            numberOfMonths={2}
            disabled={date =>
              date > new Date() || date < new Date('1900-01-01')
            }
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
