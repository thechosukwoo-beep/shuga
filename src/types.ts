export type Shoe = {
  id: string
  name: string
  brand: string
  imageUrl: string
  price: number
  addedAt: number
  memo?: string
  wornCount?: number
  lastWornAt?: number
}

export type MarketCategory = "sneakers" | "running" | "sandals" | "slides"

export type MarketShoe = {
  id: string
  name: string
  brand: string
  imageUrl: string
  price: number
  category: MarketCategory
}
