import { createServerSupabaseClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import type { Hotel, Review } from '@/lib/types'
import ReviewForm from '@/components/ReviewForm'
import ReviewList from '@/components/ReviewList'

export default async function HotelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  const { data: hotel } = await supabase.from('hotels').select('*').eq('id', id).single()
  if (!hotel) notFound()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('hotel_id', id)
    .order('created_at', { ascending: false })

  const { data: { user } } = await supabase.auth.getUser()

  const avgRating = reviews && reviews.length > 0
    ? reviews.reduce((sum: number, r: Review) => sum + r.rating, 0) / reviews.length
    : null

  return (
    <div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <img
          src={hotel.image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200'}
          alt={hotel.name}
          className="w-full h-72 object-cover"
        />
        <div className="p-6">
          <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">{hotel.category}</span>
          <h1 className="text-3xl font-bold text-gray-900 mt-1">{hotel.name}</h1>
          <p className="text-gray-500 mt-1">{hotel.location}</p>
          <p className="text-gray-700 mt-4">{hotel.description}</p>
          {avgRating !== null && (
            <div className="flex items-center gap-2 mt-4">
              <span className="text-yellow-400 text-xl">{'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))}</span>
              <span className="text-gray-500 text-sm">{avgRating.toFixed(1)} avg · {reviews?.length} review{reviews?.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ReviewList reviews={reviews as Review[] || []} currentUserId={user?.id ?? null} />
        </div>
        <div>
          <ReviewForm hotelId={id} user={user} />
        </div>
      </div>
    </div>
  )
}
