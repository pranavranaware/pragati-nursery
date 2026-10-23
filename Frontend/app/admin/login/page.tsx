'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, LockKeyhole } from 'lucide-react'
import { buttonClass } from '@/components/admin'
import { authService } from '@/services/authService'

export default function AdminLoginPage() {
  const router = useRouter()
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md rounded-3xl border bg-card p-8 shadow-xl md:p-10">
        <Link href="/admin" className="mb-8 flex flex-col items-center gap-2 text-center" title="Pragati Nursery Admin Portal">
          <Image
            src="/pragati-nursery-logo.png"
            alt="Pragati Nursery Logo"
            width={180}
            height={100}
            className="h-14 w-auto object-contain"
            priority
          />
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">Admin Portal</span>
        </Link>
        <div className="mb-8">
          <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
            <LockKeyhole className="size-5" />
          </div>
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="mt-2 text-muted-foreground">Sign in to manage your nursery.</p>
        </div>
        {error && (
          <div role="alert" className="mb-5 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}
        {submitted && (
          <div className="mb-5 rounded-xl bg-green-100 px-4 py-3 text-sm text-green-800">
            Signed in successfully. Redirecting...
          </div>
        )}
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            setError('')
            setLoading(true)

            const form = new FormData(e.currentTarget)
            const email = String(form.get('email') || '')
            const password = String(form.get('password') || '')

            try {
              const user = await authService.login(email, password)
              if (!user) {
                setError('Invalid credentials.')
                setLoading(false)
                return
              }
              if (user.role !== 'ADMIN') {
                setError('Access denied. Admin privileges required.')
                setLoading(false)
                return
              }

              sessionStorage.setItem('pragati-admin-auth', 'true')
              setSubmitted(true)
              setTimeout(() => {
                router.push('/admin')
              }, 500)
            } catch (err: any) {
              setError(err.message || 'Authentication failed. Please try again.')
              setLoading(false)
            }
          }}
          className="grid gap-5"
        >
          <label className="grid gap-2 text-sm font-medium">
            Email
            <input
              type="email"
              name="email"
              required
              placeholder="admin@pragatinursery.in"
              className="rounded-xl border bg-background px-3 py-3 font-normal outline-none focus:ring-2 focus:ring-primary/30"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Password
            <input
              type="password"
              name="password"
              required
              placeholder="Enter your password"
              className="rounded-xl border bg-background px-3 py-3 font-normal outline-none focus:ring-2 focus:ring-primary/30"
            />
          </label>
          <button className={buttonClass} type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'} <ArrowRight className="size-4" />
          </button>
        </form>
      </div>
    </main>
  )
}
