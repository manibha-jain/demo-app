import type { Review } from '@/lib/types'

export default function ReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Reviews</h2>
        <p className="text-gray-400 py-8 text-center">No reviews yet. Be the first to review!</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Reviews ({reviews.length})</h2>
      <div className="flex flex-col gap-4">
        {reviews.map(review => (
          <div key={review.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-yellow-400 text-lg">
                {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(review.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <p className="text-gray-700 text-sm">{review.comment}</p>
            {review.user_email && (
              <p className="text-xs text-gray-400 mt-2">{review.user_email}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
