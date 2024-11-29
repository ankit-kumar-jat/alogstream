import type { MetaFunction, LoaderFunctionArgs } from '@remix-run/node'
import Hero from '~/components/home/hero'
import { SITE_DESCRIPTION, SITE_NAME } from '~/config/site'

export const meta: MetaFunction = () => {
  return [
    { title: SITE_NAME },
    { name: 'description', content: SITE_DESCRIPTION },
  ]
}

export async function loader({}: LoaderFunctionArgs) {
  return {}
}

export default function Index() {
  return (
    <>
      <Hero />
    </>
  )
}
