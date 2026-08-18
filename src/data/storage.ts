import { shoes as sampleShoes } from "./shoes"
import type { Shoe } from "../types"

const STORAGE_KEY = "shuga-shoes"
const SEEDED_KEY = "shuga-seeded-ids"

function normalize(shoe: Shoe, index: number): Shoe {
  const sample = sampleShoes.find(
    (item) => item.id === shoe.id || item.name === shoe.name,
  )

  return {
    ...shoe,
    price: shoe.price ?? sample?.price ?? 0,
    addedAt: shoe.addedAt ?? sample?.addedAt ?? Date.now() - index * 86400000,
  }
}

function readSeededIds(): string[] {
  try {
    const raw = localStorage.getItem(SEEDED_KEY)
    const parsed = raw ? (JSON.parse(raw) as string[]) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeSeededIds(ids: string[]) {
  localStorage.setItem(SEEDED_KEY, JSON.stringify(ids))
}

export function loadShoes(): Shoe[] {
  const raw = localStorage.getItem(STORAGE_KEY)

  if (!raw) {
    writeSeededIds(sampleShoes.map((shoe) => shoe.id))
    return sampleShoes
  }

  let stored: Shoe[]
  try {
    const parsed = JSON.parse(raw) as Shoe[]
    if (!Array.isArray(parsed)) return sampleShoes
    stored = parsed.map(normalize)
  } catch {
    return sampleShoes
  }

  // The closet is written to storage on first visit, so sample shoes added to
  // the codebase later would otherwise never reach an existing user. Each
  // sample is offered once; once seeded, removing it stays removed.
  const seeded = readSeededIds()
  const known = new Set(stored.map((shoe) => shoe.id))
  const incoming = sampleShoes.filter(
    (shoe) => !seeded.includes(shoe.id) && !known.has(shoe.id),
  )

  writeSeededIds([...new Set([...seeded, ...sampleShoes.map((s) => s.id)])])

  if (incoming.length === 0) return stored

  const merged = [...stored, ...incoming]
  saveShoes(merged)
  return merged
}

export function saveShoes(items: Shoe[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function addShoe(shoe: Shoe) {
  saveShoes([shoe, ...loadShoes()])
}

export function updateShoe(id: string, patch: Partial<Shoe>): Shoe[] {
  const next = loadShoes().map((shoe) =>
    shoe.id === id ? { ...shoe, ...patch } : shoe,
  )
  saveShoes(next)
  return next
}

export function resetShoes(): Shoe[] {
  writeSeededIds(sampleShoes.map((shoe) => shoe.id))
  saveShoes([])
  return []
}
