// ══════════════════════════════════════════════════════════════════════════════
// cekwajar.id — Typed Error Classes
// Consistent error handling across all API routes and services
// ══════════════════════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Base application error with code, status, and optional details.
 * All cekwajar.id errors extend this class.
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    public readonly details?: unknown
  ) {
    super(message)
    this.name = 'AppError'
  }
}

/**
 * Validation errors from Zod or manual input validation (400)
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', 400, details)
    this.name = 'ValidationError'
  }
}

/**
 * Resource not found (404)
 */
export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const msg = id ? `${resource} not found: ${id}` : `${resource} not found`
    super(msg, 'NOT_FOUND', 404)
    this.name = 'NotFoundError'
  }
}

/**
 * Authentication required (401)
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 'UNAUTHORIZED', 401)
    this.name = 'UnauthorizedError'
  }
}

/**
 * Insufficient permissions (403)
 */
export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 'FORBIDDEN', 403)
    this.name = 'ForbiddenError'
  }
}

/**
 * Rate limit exceeded (429)
 */
export class TooManyRequestsError extends AppError {
  constructor(retryAfterMs?: number) {
    super('Too many requests', 'RATE_LIMITED', 429, retryAfterMs ? { retryAfterMs } : undefined)
    this.name = 'TooManyRequestsError'
  }
}

/**
 * Payment required for premium content (402)
 */
export class PaymentRequiredError extends AppError {
  constructor(message = 'Payment required for this content') {
    super(message, 'PAYMENT_REQUIRED', 402)
    this.name = 'PaymentRequiredError'
  }
}

/**
 * API response shape for errors
 */
interface ErrorResponse {
  success: false
  error: string
  code: string
  details?: unknown
}

/**
 * Convert AppError to NextResponse JSON.
 * Use this in all API route catch blocks.
 *
 * @example
 * try {
 *   // ... route logic
 * } catch (err) {
 *   return handleApiError(err)
 * }
 */
export function handleApiError(error: unknown): NextResponse<ErrorResponse> {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
        details: error.details,
      },
      { status: error.statusCode }
    )
  }

  // Log unexpected errors — capture in Sentry via error handler
  const message = error instanceof Error ? error.message : 'Unknown error'
  console.error('[Unhandled API Error]', { message, error })

  return NextResponse.json(
    {
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    },
    { status: 500 }
  )
}

/**
 * Wrap an API route handler with consistent error handling + Sentry.
 * Use this instead of try/catch in route handlers.
 *
 * @example
 * export const POST = withApiErrorHandler(async (req) => {
 *   const body = await req.json()
 *   // ... route logic
 * })
 */
export function withApiErrorHandler<T>(
  handler: (req: NextRequest) => Promise<NextResponse>
): (req: NextRequest) => Promise<NextResponse> {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      return await handler(req)
    } catch (err) {
      return handleApiError(err)
    }
  }
}

/**
 * Parse JSON body with typed error handling.
 * Returns ValidationError for malformed JSON or invalid payload.
 */
export async function parseJsonBody<T>(
  req: NextRequest,
  schema: { parse: (value: unknown) => T }
): Promise<T> {
  let json: unknown
  try {
    json = await req.json()
  } catch {
    throw new ValidationError('Malformed JSON body')
  }

  try {
    return schema.parse(json)
  } catch (err) {
    if (err instanceof Error && 'issues' in err) {
      const issues = (err as { issues?: Array<{ message: string }> }).issues
      throw new ValidationError(issues?.[0]?.message ?? 'Invalid input', { issues })
    }
    throw new ValidationError('Invalid input')
  }
}