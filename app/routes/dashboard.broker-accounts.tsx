import type { LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/node'
import { data } from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'
import {
  EllipsisVertical,
  KeyRound,
  Link as LinkIcon,
  Plus,
  Trash2,
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { useIsPending } from '~/hooks/use-is-pending'
import { requireUserId } from '~/lib/auth.server'
import { db } from '~/lib/db.server'

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request)

  const BrokerAccounts = await db.brokerAccount.findMany({
    where: { userId },
    select: {
      id: true,
      broker: true,
      clientName: true,
      clientId: true,
      isLoginRequired: true,
    },
  })
  return { accounts: BrokerAccounts }
}

export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request)
  const formData = await request.formData()

  if (request.method === 'DELETE') {
    const brokerAccountId = formData.get('accountId')
    console.log('🚀 ~ action ~ brokerAccountId:', brokerAccountId)

    if (!brokerAccountId || typeof brokerAccountId !== 'string') {
      return data(
        { success: false, message: 'Broker account id required.' },
        { status: 400 },
      )
    }

    await db.brokerAccount.delete({ where: { userId, id: brokerAccountId } })

    data({ success: true })
  }

  return data({ success: true })
}

export default function BrokerAccounts() {
  const { accounts } = useLoaderData<typeof loader>()
  return (
    <div className="container mx-auto my-10 max-w-3xl space-y-4 px-4">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-lg font-bold md:text-xl">Linked Accounts</h1>
        <div>
          <AddAccountButton />
        </div>
      </div>

      {accounts.length ? (
        <div className="space-y-2">
          {accounts.map(account => (
            <AccountCard
              key={account.id}
              name={account.clientName}
              accUserId={account.clientId}
              isLoginRequired={account.isLoginRequired}
              accountId={account.id}
            />
          ))}
        </div>
      ) : (
        <BrokerAccountsEmptyPlaceholder />
      )}
    </div>
  )
}

function AddAccountButton() {
  const isPending = useIsPending({
    formAction: '/dashboard/broker-accounts/connect',
  })
  return (
    <Form method="post" action="/dashboard/broker-accounts/connect">
      <Button type="submit" disabled={isPending}>
        <Plus /> Add Account
      </Button>
    </Form>
  )
}

interface AccountCardProps {
  name: string
  accUserId: string | number
  isLoginRequired: boolean
  accountId: string
}

function AccountCard({
  name,
  accUserId,
  isLoginRequired,
  accountId,
}: AccountCardProps) {
  return (
    <div className="flex items-center rounded-lg border p-4">
      <div className="space-y-1">
        <p className="font-medium leading-none">{name}</p>
        <p className="text-sm text-muted-foreground">{accUserId}</p>
      </div>
      <div className="ml-auto flex items-center gap-4">
        {isLoginRequired && <Badge variant="destructive">Login Required</Badge>}
        <AccountCardDropdownMenu accountId={accountId} />
      </div>
    </div>
  )
}

function AccountCardDropdownMenu({ accountId }: { accountId: string }) {
  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <EllipsisVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <Form method="post" action="/dashboard/broker-accounts/connect">
              <DropdownMenuItem asChild>
                <button type="submit" className="w-full">
                  <KeyRound />
                  <span>Login again</span>
                </button>
              </DropdownMenuItem>
            </Form>

            <DropdownMenuItem
              className="w-full text-destructive hover:text-destructive focus-visible:text-destructive"
              asChild
            >
              <AlertDialogTrigger>
                <Trash2 />
                <span>Delete</span>
              </AlertDialogTrigger>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will unlink your broker account
            and remove all data related to this broker account like signals,
            order history etc.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Form action="" method="DELETE">
            <input
              type="text"
              defaultValue={accountId}
              name="accountId"
              hidden
              readOnly
            />
            <AlertDialogAction>
              <button type="submit">Continue</button>
            </AlertDialogAction>
          </Form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function BrokerAccountsEmptyPlaceholder() {
  return (
    <div className="flex h-96 shrink-0 items-center justify-center rounded-lg border border-dashed">
      <div className="mx-auto flex max-w-md flex-col items-center justify-center text-center">
        <LinkIcon className="h-10 w-10 text-muted-foreground" />

        <h3 className="mt-4 text-lg font-semibold">No accounts added</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">
          You have not added any account. Add one below.
        </p>

        <AddAccountButton />
      </div>
    </div>
  )
}
