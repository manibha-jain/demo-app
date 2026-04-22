'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Review } from '@/lib/types'

type Props = {
  reviews: Review[]
  currentUserId: string | null
}

export default function ReviewList({ reviews, currentUserId }: Props) {
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editRating, setEditRating] = useState(5)
  const [editComment, setEditComment] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const startEdit = (review: Review) => {
    setEditingId(review.id)
    setEditRating(review.rating)
    setEditComment(review.comment)
    setError('')
  }

  const saveEdit = async (reviewId: string) => {
    setLoading(true)
    setError('')
    const res = await fetch(`/api/reviews/${reviewId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: editRating, comment: editComment }),
    })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Failed to update review')
    } else {
      setEditingId(null)
      router.refresh()
    }
    setLoading(false)
  }

  const deleteReview = async (reviewId: string) => {
    setLoading(true)
    setError('')
    const res = await fetch(`/api/reviews/${reviewId}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Failed to delete review')
    } else {
      setDeletingId(null)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {reviews.length > 0 ? `Reviews (${reviews.length})` : 'Reviews'}
        </h2>
        <span className="flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full border border-green-200">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          Secured by Row-Level Security
        </span>
      </div>

      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      {reviews.length === 0 ? (
        <p className="text-gray-400 py-8 text-center">No reviews yet. Be the first to review!</p>
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.map(review => {
            const isOwn = currentUserId === review.user_id
            const isEditing = editingId === review.id
            const isDeleting = deletingId === review.id

            return (
              <div key={review.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                {isEditing ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setEditRating(star)}
                          className={`text-2xl transition ${star <= editRating ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={editComment}
                      onChange={e => setEditComment(e.target.value)}
                      rows={3}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(review.id)}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition disabled:opacity-50"
                      >
                        {loading ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-gray-500 hover:text-gray-700 px-3 py-1 rounded-lg text-sm transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-yellow-400 text-lg">
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400">
                          {new Date(review.created_at).toLocaleDateString('en-GB', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                        </span>
                        {isOwn && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEdit(review)}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setDeletingId(review.id)}
                              className="text-xs text-red-500 hover:text-red-700 font-medium transition"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {isDeleting && (
                      <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-3">
                        <p className="text-red-700 text-sm font-medium mb-2">Delete this review?</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => deleteReview(review.id)}
                            disabled={loading}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition disabled:opacity-50"
                          >
                            {loading ? 'Deleting...' : 'Confirm'}
                          </button>
                          <button
                            onClick={() => setDeletingId(null)}
                            className="text-gray-500 hover:text-gray-700 px-3 py-1 rounded-lg text-sm transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    <p className="text-gray-700 text-sm">{review.comment}</p>
                    {review.user_email && (
                      <p className="text-xs text-gray-400 mt-2">{review.user_email}</p>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
