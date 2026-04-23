import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { Review } from '@/lib/types'

interface AnthropicMessage {
  role: 'user' | 'assistant'
  content: string
}

interface AnthropicRequest {
  model: string
  max_tokens: number
  system: Array<{ type: string; text: string; cache_control?: { type: string } }>
  messages: AnthropicMessage[]
}

interface AnthropicResponse {
  content: Array<{ type: string; text: string }>
}

export interface ReviewAnalysis {
  summary: string
  sentiment: 'positive' | 'neutral' | 'negative' | 'mixed'
  pros: string[]
  cons: string[]
  themes: string[]
}

const SYSTEM_PROMPT = `You are a hotel review analyst. Analyze the provided hotel reviews and return a JSON object with this exact structure:
{
  "summary": "A 2-3 sentence overall summary of the hotel based on all reviews",
  "sentiment": "positive" | "neutral" | "negative" | "mixed",
  "pros": ["key positive aspects mentioned across reviews"],
  "cons": ["key negative aspects mentioned across reviews"],
  "themes": ["recurring topics or aspects guests mention"]
}

Rules:
- Return only valid JSON, no markdown formatting, no code blocks
- pros and cons should each have 2-5 items (or fewer if not enough reviews)
- themes should have 3-6 items
- Base everything on what reviewers actually say, not assumptions`

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('hotel_id', id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }

  if (!reviews || reviews.length === 0) {
    return NextResponse.json({ error: 'No reviews available for analysis' }, { status: 404 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'AI analysis not configured' }, { status: 503 })
  }

  const reviewText = reviews
    .map((r: Review, i: number) => `Review ${i + 1} (Rating: ${r.rating}/5): ${r.comment}`)
    .join('\n\n')

  const body: AnthropicRequest = {
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: [
      {
        type: 'text',
        text: SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [
      {
        role: 'user',
        content: `Analyze these ${reviews.length} hotel reviews:\n\n${reviewText}`,
      },
    ],
  }

  const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-beta': 'prompt-caching-2024-07-31',
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!anthropicResponse.ok) {
    const errorText = await anthropicResponse.text()
    console.error('Anthropic API error:', errorText)
    return NextResponse.json({ error: 'AI analysis failed' }, { status: 502 })
  }

  const data: AnthropicResponse = await anthropicResponse.json()
  const content = data.content[0]

  if (!content || content.type !== 'text') {
    return NextResponse.json({ error: 'Invalid AI response' }, { status: 502 })
  }

  try {
    const analysis: ReviewAnalysis = JSON.parse(content.text)
    return NextResponse.json(analysis)
  } catch {
    return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 502 })
  }
}
