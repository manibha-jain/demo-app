import { createServerSupabaseClient } from '@/lib/supabase-server'
import HotelCard from '@/components/HotelCard'
import type { Hotel, Review } from '@/lib/types'

export default async function HomePage() {
  const supabase = await createServerSupabaseClient()

  const { data: hotels } = await supabase.from('hotels').select('*').order('name')
  const { data: reviews } = await supabase.from('reviews').select('hotel_id, rating')

  const ratingMap: Record<string, { sum: number; count: number }> = {}
  reviews?.forEach((r: Pick<Review, 'hotel_id' | 'rating'>) => {
    if (!ratingMap[r.hotel_id]) ratingMap[r.hotel_id] = { sum: 0, count: 0 }
    ratingMap[r.hotel_id].sum += r.rating
    ratingMap[r.hotel_id].count += 1
  })

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          Discover <span className="text-blue-600">Hotels</span>
        </h1>
        <p className="text-gray-500 mt-2 text-base">Read honest reviews from real travellers around the world</p>
      </div>
      {!hotels || hotels.length === 0 ? (
        <p className="text-gray-400 text-center py-20">No hotels found. Check back soon!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.map((hotel: Hotel, index: number) => {
            const stats = ratingMap[hotel.id]
            return (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                avgRating={stats ? stats.sum / stats.count : undefined}
                reviewCount={stats?.count}
                index={index}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
