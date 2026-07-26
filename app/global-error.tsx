"use client";

import "./globals.css";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex h-full min-h-screen items-center justify-center bg-muted/30 p-4">
        <div className="flex w-full max-w-sm flex-col items-center gap-3 rounded-xl border bg-card p-8 text-center text-card-foreground shadow-sm">
          <h2 className="text-lg font-semibold">Something went wrong</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            The application hit an unexpected error and could not recover on
            its own. Try again, or reload the page.
          </p>
          {error.digest ? (
            <p className="font-mono text-xs text-muted-foreground">
              Reference: {error.digest}
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => unstable_retry()}
            className="mt-2 inline-flex h-8 items-center justify-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/80"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
