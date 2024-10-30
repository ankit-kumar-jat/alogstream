import { LoaderFunctionArgs } from '@remix-run/node'
import { requireUserId } from '~/lib/auth.server'

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserId(request)
  return {}
}

export default function Dashboard() {
  return <div className="py-4">Dashboard</div>
}
