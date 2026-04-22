export type Hotel = {
  id: string
  name: string
  location: string
  category: string
  description: string
  image_url: string
}

export type Review = {
  id: string
  hotel_id: string
  user_id: string
  rating: number
  comment: string
  created_at: string
  user_email?: string
}
