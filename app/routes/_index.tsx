import type { MetaFunction } from '@remix-run/node'
import { NavLink } from '@remix-run/react'

export const meta: MetaFunction = () => {
  return [
    { title: 'New Remix App' },
    { name: 'description', content: 'Welcome to Remix!' },
  ]
}

export default function Index() {
  return (
    <div className="container mx-auto p-4">
      <h1>Home</h1>
      <nav className="flex gap-4">
        <NavLink to="/login">Login</NavLink>
        <NavLink to="/dashboard">Dashboard</NavLink>
      </nav>
    </div>
  )
}
