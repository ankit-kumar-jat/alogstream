import { MetaFunction } from '@remix-run/node'
import PageNotFound from '~/components/page-not-found'

export async function loader() {
  throw new Response('Not found', { status: 404 })
}

export const meta: MetaFunction = () => {
  return [{ title: 'Page Not Found!' }]
}

export default function Page404() {
  return <PageNotFound />
}

export function ErrorBoundary() {
  return <PageNotFound />
}
