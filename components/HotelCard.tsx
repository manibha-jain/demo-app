'use client'

import Link from 'next/link'
import { useRef, useState, useEffect } from 'react'
import type { Hotel } from '@/lib/types'

type Props = { hotel: Hotel; avgRating?: number; reviewCount?: number; index?: number }

export default function HotelCard({ hotel, avgRating, reviewCount, index = 0 }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 })
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 })
  const [imgOffset, setImgOffset] = useState({ x: 0, y: 0 })
  const [spot, setSpot] = useState({ x: 0, y: 0, active: false })
  const [entered, setEntered] = useState(false)

  // Staggered entrance — each card delays by index * 100ms
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), index * 100)
    return () => clearTimeout(t)
  }, [index])

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = cardRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = e.clientX - r.left
    const y = e.clientY - r.top
    const cx = r.width / 2
    const cy = r.height / 2
    setTilt({ rx: -((y - cy) / cy) * 10, ry: ((x - cx) / cx) * 14 })
    setGlare({ x: (x / r.width) * 100, y: (y / r.height) * 100, opacity: 0.14 })
    setImgOffset({ x: ((x - cx) / cx) * -8, y: ((y - cy) / cy) * -8 })
    setSpot({ x, y, active: true })
  }

  function onMouseLeave() {
    setTilt({ rx: 0, ry: 0 })
    setGlare(g => ({ ...g, opacity: 0 }))
    setImgOffset({ x: 0, y: 0 })
    setSpot(s => ({ ...s, active: false }))
  }

  const stars = avgRating !== undefined ? Math.round(avgRating) : 0

  return (
    // Staggered fade-up wrapper
    <div
      style={{
        opacity: entered ? 1 : 0,
        transform: entered ? 'translateY(0px)' : 'translateY(32px)',
        transition: `opacity 0.6s cubic-bezier(0.4,0,0.2,1) ${index * 100}ms, transform 0.6s cubic-bezier(0.4,0,0.2,1) ${index * 100}ms`,
      }}
    >
      {/* Spotlight border — glowing ring that follows cursor */}
      <div
        className="rounded-3xl p-px"
        style={{
          background: spot.active
            ? `radial-gradient(circle 220px at ${spot.x}px ${spot.y}px, rgba(99,102,241,0.75), rgba(203,213,225,0.15) 70%)`
            : 'rgba(203,213,225,0.3)',
          transition: spot.active ? 'none' : 'background 0.5s ease',
        }}
      >
        <Link href={`/hotels/${hotel.id}`} className="block">
          {/* 3D tilt card */}
          <div
            ref={cardRef}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
            style={{
              transform: `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale3d(${spot.active ? 1.04 : 1},${spot.active ? 1.04 : 1},${spot.active ? 1.04 : 1})`,
              boxShadow: spot.active
                ? `${-tilt.ry * 1.5}px ${tilt.rx * 1.5 + 28}px 55px rgba(0,0,0,0.18), 0 0 0 1px rgba(99,102,241,0.08)`
                : '0 2px 20px rgba(0,0,0,0.06)',
              transformStyle: 'preserve-3d',
              transition: 'transform 0.12s ease-out, box-shadow 0.12s ease-out',
            }}
            className="relative bg-white rounded-[calc(1.5rem-1px)] cursor-pointer group"
          >
            {/* Image with parallax */}
            <div className="relative h-56 overflow-hidden rounded-t-[calc(1.5rem-1px)]">
              <img
                src={hotel.image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600'}
                alt={hotel.name}
                className="w-full h-full object-cover"
                style={{
                  transform: `scale(1.12) translate(${imgOffset.x}px, ${imgOffset.y}px)`,
                  transition: 'transform 0.12s ease-out',
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

              {/* Category badge */}
              <span className="absolute top-3 left-3 bg-white/15 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-[0.15em] px-3 py-1.5 rounded-full border border-white/25">
                {hotel.category}
              </span>

              {/* Rating badge */}
              {avgRating !== undefined && (
                <span className="absolute top-3 right-3 bg-black/30 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1.5 rounded-full flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {avgRating.toFixed(1)}
                </span>
              )}
            </div>

            {/* Glare overlay */}
            <div
              className="absolute inset-0 pointer-events-none z-10"
              style={{
                background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,${glare.opacity}) 0%, transparent 65%)`,
                transition: 'background 0.12s ease-out',
                borderRadius: 'inherit',
              }}
            />

            {/* Content */}
            <div className="p-5" style={{ transform: 'translateZ(20px)', transformStyle: 'preserve-3d' }}>
              <h3 className="text-lg font-bold text-gray-900 leading-snug group-hover:text-indigo-600 transition-colors duration-200">
                {hotel.name}
              </h3>
              <p className="text-sm text-gray-400 mt-0.5 flex items-center gap-1">
                <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {hotel.location}
              </p>
              <p className="text-sm text-gray-500 mt-2.5 line-clamp-2 leading-relaxed">{hotel.description}</p>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1.5">
                  {avgRating !== undefined ? (
                    <>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(i => (
                          <svg key={i} className={`w-3.5 h-3.5 ${i <= stars ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-xs text-gray-400">{reviewCount} review{reviewCount !== 1 ? 's' : ''}</span>
                    </>
                  ) : (
                    <span className="text-xs text-gray-400">No reviews yet</span>
                  )}
                </div>
                <span className="text-indigo-500 text-sm font-semibold flex items-center gap-0.5 group-hover:gap-2 transition-all duration-200">
                  View
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
