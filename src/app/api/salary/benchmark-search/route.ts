import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const schema = z.object({
  q: z.string().min(1).max(200),
  limit: z.coerce.number().min(1).max(20).default(10),
})

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const params = req.nextUrl.searchParams

    const parsed = schema.safeParse({
      q: params.get('q'),
      limit: params.get('limit'),
    })

    if (!parsed.success) {
      return NextResponse.json({ error: 'q is required' }, { status: 400 })
    }

    const { q, limit } = parsed.data

    const { data, error } = await supabase.rpc('search_job_categories_fuzzy', {
      search_term: q,
      threshold: 0.2,
    })

    if (error) {
      return NextResponse.json({ error: 'Search failed' }, { status: 500 })
    }

    const results = (data || []).map(row => ({
      id: row.id,
      title: row.title,
      industry: row.industry,
      similarity: row.similarity,
    }))

    return NextResponse.json(
      { results },
      {
        headers: {
          'Cache-Control': 'private, max-age=60',
        },
      }
    )
  } catch (error) {
    console.error('Salary benchmark-search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}