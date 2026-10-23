'use client'

import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground antialiased font-sans">
        <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
          <div className="mx-auto max-w-md rounded-2xl border bg-card p-8 shadow-sm">
            <h2 className="font-serif text-2xl font-bold">Something went wrong</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              An unexpected error occurred. Please try again.
            </p>
            <div className="mt-6 flex items-center justify-center gap-4">
              <button
                onClick={() => reset()}
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                Try Again
              </button>
              <Link
                href="/"
                className="rounded-xl border px-5 py-2.5 text-sm font-semibold transition hover:bg-muted"
              >
                Go to Home
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
