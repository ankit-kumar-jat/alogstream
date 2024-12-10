import { Link } from '@remix-run/react'
import { TrendingUp } from 'lucide-react'
import { SITE_NAME } from '~/config/site'
import { Button } from '~/components/ui/button'

export function Hero() {
  return (
    <div className="container mx-auto">
      <header className="container absolute inset-x-0 top-0 z-50 mx-auto">
        <nav
          className="flex items-center justify-between p-6 lg:px-8"
          aria-label="Global"
        >
          <div className="flex lg:flex-1">
            <Link to="/" className="-m-1.5 flex gap-2 p-1.5">
              <TrendingUp width={28} height={28} />
              <span className="text-xl font-bold leading-tight">
                {SITE_NAME}
              </span>
            </Link>
          </div>

          {/* <div className="hidden lg:flex lg:gap-x-12">
            <a href="#" className="text-sm/6 font-semibold text-gray-900">
              Product
            </a>
            <a href="#" className="text-sm/6 font-semibold text-gray-900">
              Features
            </a>
            <a href="#" className="text-sm/6 font-semibold text-gray-900">
              Marketplace
            </a>
            <a href="#" className="text-sm/6 font-semibold text-gray-900">
              Company
            </a>
          </div> */}
          <div className="flex flex-1 justify-end">
            <Link to="/login" className="text-sm/6 font-semibold text-gray-900">
              Log in <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </nav>
      </header>

      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          ></div>
        </div>
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          {/* <div className="hidden sm:mb-8 sm:flex sm:justify-center">
            <div className="relative rounded-full px-3 py-1 text-sm/6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
              Announcing our next round of funding.{' '}
              <a href="#" className="font-semibold text-indigo-600">
                <span className="absolute inset-0" aria-hidden="true"></span>
                Read more <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </div> */}
          <div className="text-center">
            <h1 className="text-balance text-5xl font-semibold tracking-tight text-gray-900 sm:text-7xl">
              Automate Your Trades, Seamlessly
            </h1>
            <p className="mt-8 text-pretty text-lg font-medium text-gray-500 sm:text-xl/8">
              Effortlessly fully automate your trades by connecting TradingView
              strategy alerts to your AngelOne account. Simplify strategy
              execution and seize every opportunity.
            </p>

            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button asChild>
                <Link to="/login">Get started</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/">
                  Learn more <span aria-hidden="true">→</span>
                </Link>
              </Button>
            </div>
          </div>
          <p className="mt-8 text-pretty text-center text-xs text-gray-500 sm:text-sm/8">
            <sup>*</sup>Profits and losses are not assured, Investments in
            securities market are subject to market risks.
          </p>
        </div>
        <div
          className="absolute inset-x-0 top-1/4 -z-10 transform-gpu overflow-hidden blur-3xl"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          ></div>
        </div>
      </div>
    </div>
  )
}
