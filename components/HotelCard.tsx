import Link from 'next/link'
import type { Hotel } from '@/lib/types'

type Props = { hotel: Hotel; avgRating?: number; reviewCount?: number }

export default function HotelCard({ hotel, avgRating, reviewCount }: Props) {
  return (
    <Link href={`/hotels/${hotel.id}`}>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition cursor-pointer">
        <img
          src={hotel.image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600'}
          alt={hotel.name}
          className="w-full h-48 object-cover"
        />
        <div className="p-4">
          <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
            {hotel.category}
          </span>
          <h3 className="text-lg font-semibold text-gray-900 mt-1">{hotel.name}</h3>
          <p className="text-sm text-gray-500 mt-1">{hotel.location}</p>
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{hotel.description}</p>
          <div className="flex items-center gap-2 mt-3">
            {avgRating !== undefined ? (
              <>
                <span className="text-yellow-400">{'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))}</span>
                <span className="text-sm text-gray-500">({reviewCount} review{reviewCount !== 1 ? 's' : ''})</span>
              </>
            ) : (
              <span className="text-sm text-gray-400">No reviews yet</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
