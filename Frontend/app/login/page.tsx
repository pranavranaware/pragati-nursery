'use client'

import Link from 'next/link'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, Leaf, LockKeyhole, Mail, User as UserIcon } from 'lucide-react'
import { authService } from '@/services/authService'
import { useCart } from '@/components/cart-provider'
import { fetchApi } from '@/lib/apiClient'

import { useLanguage } from '@/lib/language'

function LoginContent() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-3 sm:p-4">
      <div className="w-full max-w-md rounded-[1.5rem] sm:rounded-[2rem] border bg-card p-5 sm:p-8 shadow-xl md:p-10 text-center">
        <Link href="/" className="mb-6 inline-flex items-center justify-center gap-2 text-primary">
          <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Leaf className="size-5" />
          </span>
          <span className="font-serif text-xl font-semibold tracking-tight">
            Pragati <i className="font-normal">Nursery</i>
          </span>
        </Link>

        <h1 className="text-2xl sm:text-3xl font-bold font-serif">No Login Required</h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          At Pragati Nursery, you can browse plants, add items to your wishlist, cart, checkout, and view order history without creating an account or logging in!
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/shop"
            className="flex items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition"
          >
            Explore Plants <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/your-orders"
            className="flex items-center justify-center gap-2 rounded-full border border-border bg-background py-3.5 text-sm font-semibold text-foreground hover:bg-muted transition"
          >
            View Your Orders
          </Link>
        </div>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen py-20 text-center text-muted-foreground">Loading...</div>}>
      <LoginContent />
    </Suspense>
  )
}
