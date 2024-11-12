import { Plus } from 'lucide-react'
import { Button } from '~/components/ui/button'

export default function Backtests() {
  return (
    <div className="container mx-auto my-10 space-y-4 px-4">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-lg font-bold md:text-xl">Backtests</h1>
        <div>
          <Button size="sm">
            <Plus /> New Backtest
          </Button>
        </div>
      </div>

      <div>account a</div>
    </div>
  )
}
