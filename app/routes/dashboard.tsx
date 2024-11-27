import { LoaderFunctionArgs } from '@remix-run/node'
import { Form, Link, NavLink, Outlet, useSubmit } from '@remix-run/react'
import {
  BadgeCheck,
  Bell,
  ChartCandlestick,
  ChartPie,
  ChevronsUpDown,
  CreditCard,
  FileChartLine,
  FlaskConical,
  Link as LinkIcon,
  LogOut,
  Sparkles,
  TrendingUp,
  TrendingUpDown,
  User,
} from 'lucide-react'
import { useRef } from 'react'
import { Avatar, AvatarFallback } from '~/components/ui/avatar'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import {
  SidebarProvider,
  SidebarTrigger,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroupContent,
  SidebarInset,
  useSidebar,
} from '~/components/ui/sidebar'
import { SITE_NAME } from '~/config/site'
import { useUser } from '~/hooks/use-user'
import { requireUserId } from '~/lib/auth.server'

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserId(request)
  return {}
}

export default function DashboardLayout() {
  return (
    <div>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex-grow">
            <div className="flex justify-between gap-4 border-b px-4 py-2">
              <SidebarTrigger className="h-9 w-9" />
              <Form action="/logout" method="POST">
                <Button variant="ghost" type="submit">
                  <LogOut />
                  <span>Logout</span>
                </Button>
              </Form>
            </div>
            <main className="mx-auto">
              <Outlet />
            </main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}

const SIDEBAR_LINKS = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: ChartPie,
    exect: true,
  },
  {
    title: 'Trade Signals',
    url: '/dashboard/signals',
    icon: TrendingUpDown,
  },
  // {
  //   title: 'Trade Strategies',
  //   url: '/dashboard/strategies',
  //   icon: ChartCandlestick,
  // },
  // {
  //   title: 'Backtests',
  //   url: '/dashboard/backtests',
  //   icon: FlaskConical,
  // },
  {
    title: 'Reports',
    url: '/dashboard/reports',
    icon: FileChartLine,
  },
  {
    title: 'Broker Accounts',
    url: '/dashboard/broker-accounts',
    icon: LinkIcon,
  },
]

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/">
                <span>
                  <TrendingUp width={28} height={28} />
                </span>
                <span className="text-xl font-bold leading-tight">
                  {SITE_NAME}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="mt-12">
        <SidebarGroup>
          {/* <SidebarGroupLabel>Main Navigation</SidebarGroupLabel> */}
          <SidebarGroupContent>
            <SidebarMenu>
              {SIDEBAR_LINKS.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end={item.exect}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}

export function NavUser() {
  const user = useUser()
  const submit = useSubmit()
  const formRef = useRef<HTMLFormElement>(null)
  const { isMobile } = useSidebar()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div>
                <User className="w-8" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <User />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            {/* <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup> */}
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck />
                Account
              </DropdownMenuItem>
              {/* <DropdownMenuItem>
                <CreditCard />
                Billing
              </DropdownMenuItem> */}
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <Form
              action="/logout"
              method="POST"
              ref={formRef}
              className="w-full"
            >
              <DropdownMenuItem
                asChild
                // this prevents the menu from closing before the form submission is completed
                onSelect={event => {
                  event.preventDefault()
                  submit(formRef.current)
                }}
                className="w-full"
              >
                <button type="submit">
                  <LogOut />
                  Log out
                </button>
              </DropdownMenuItem>
            </Form>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
