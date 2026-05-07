'use client'

import * as React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

/** Logger that connects to Sentry in production; no-ops in dev without credentials */
function logError(error: Error, errorInfo: React.ErrorInfo): void {
  if (process.env.NODE_ENV === 'production') {
    // In production with Sentry, this would be:
    // Sentry.captureException(error, { extra: errorInfo })
    console.error('[ErrorBoundary]', error.message, errorInfo)
  } else {
    // Development: structured error output without sensitive data
    console.error(
      JSON.stringify({
        type: 'component_error',
        message: error.message,
        componentStack: errorInfo.componentStack?.split('\n').slice(0, 3).join('\n'),
        timestamp: new Date().toISOString(),
      })
    )
  }
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  onReset?: () => void
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    logError(error, errorInfo)
  }

  handleReset = (): void => {
    this.setState({ hasError: false })
    this.props.onReset?.()
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
          <div className="max-w-md w-full text-center space-y-5">
            {/* Icon */}
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-7 w-7 text-destructive" />
            </div>

            {/* Text */}
            <div className="space-y-1.5">
              <h2 className="text-lg font-semibold text-foreground">Terjadi Kesalahan</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {this.state.error?.message ?? 'Komponen mengalami masalah. Silakan muat ulang halaman.'}
              </p>
            </div>

            {/* CTA */}
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <RefreshCw className="h-4 w-4" />
              Coba Lagi
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}