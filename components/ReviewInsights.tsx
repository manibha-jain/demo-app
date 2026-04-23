'use client'

import { useEffect, useState } from 'react'
import type { ReviewAnalysis } from '@/app/api/hotels/[id]/analyze/route'

const SENTIMENT_CONFIG = {
  positive: { label: 'Positive', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', dot: 'bg-green-500' },
  negative: { label: 'Negative', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500' },
  mixed: { label: 'Mixed', color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200', dot: 'bg-yellow-500' },
  neutral: { label: 'Neutral', color: 'text-gray-700', bg: 'bg-gray-50', border: 'border-gray-200', dot: 'bg-gray-400' },
}

export default function ReviewInsights({ hotelId, reviewCount }: { hotelId: string; reviewCount: number }) {
  const [analysis, setAnalysis] = useState<ReviewAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (reviewCount === 0) {
      setLoading(false)
      return
    }

    fetch(`/api/hotels/${hotelId}/analyze`)
      .then((res) => {
        if (!res.ok) return res.json().then((d) => Promise.reject(d.error || 'Analysis unavailable'))
        return res.json()
      })
      .then((data: ReviewAnalysis) => setAnalysis(data))
      .catch((err: string) => setError(err))
      .finally(() => setLoading(false))
  }, [hotelId, reviewCount])

  if (reviewCount === 0) return null

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">✨</span>
        <h2 className="text-lg font-semibold text-gray-900">AI Review Insights</h2>
        {loading && (
          <span className="text-xs text-gray-400 ml-auto animate-pulse">Analyzing reviews…</span>
        )}
      </div>

      {loading && (
        <div className="space-y-3 animate-pulse">
          <div className="h-4 bg-gray-100 rounded w-full" />
          <div className="h-4 bg-gray-100 rounded w-5/6" />
          <div className="h-4 bg-gray-100 rounded w-4/6" />
        </div>
      )}

      {error && (
        <p className="text-sm text-gray-400 italic">{error}</p>
      )}

      {analysis && (
        <div className="space-y-5">
          {/* Sentiment badge */}
          {(() => {
            const cfg = SENTIMENT_CONFIG[analysis.sentiment] ?? SENTIMENT_CONFIG.neutral
            return (
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                {cfg.label} overall sentiment
              </div>
            )
          })()}

          {/* Summary */}
          <p className="text-gray-700 text-sm leading-relaxed">{analysis.summary}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Pros */}
            {analysis.pros.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">Guests love</h3>
                <ul className="space-y-1.5">
                  {analysis.pros.map((pro, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Cons */}
            {analysis.cons.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-2">Areas to note</h3>
                <ul className="space-y-1.5">
                  {analysis.cons.map((con, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-red-400 mt-0.5 shrink-0">✗</span>
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Themes */}
          {analysis.themes.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Frequently mentioned</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.themes.map((theme, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-100"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
