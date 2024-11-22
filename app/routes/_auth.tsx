import { Outlet } from '@remix-run/react'
import { TrendingUp } from 'lucide-react'
import { SITE_NAME } from '~/config/site'

export default function AuthLayout() {
  return (
    <div className="relative mx-auto grid h-auto min-h-screen w-full grid-cols-1 flex-col items-center justify-center px-4 lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center gap-3">
          <TrendingUp width={28} height={28} />
          <span className="text-xl font-medium">{SITE_NAME}</span>
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;{SITE_NAME} simplifies your trading journey with secure
              account management and advanced automation. Effortlessly manage
              trades with intuitive, user-friendly features.&rdquo;
            </p>
            {/* <footer className="text-sm">Auto Trade</footer> */}
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <Outlet />
      </div>
    </div>
  )
}
