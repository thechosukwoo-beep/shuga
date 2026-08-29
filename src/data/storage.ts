import { supabase, SHOE_BUCKET } from "../lib/supabase"
import type { Shoe } from "../types"

type ShoeRow = {
  id: string
  name: string
  brand: string
  image_url: string
  image_path: string | null
  price: number
  added_at: string
  memo: string | null
  worn_count: number
  last_worn_at: string | null
}

function fromRow(row: ShoeRow): Shoe {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    imageUrl: row.image_url,
    imagePath: row.image_path ?? undefined,
    price: row.price,
    addedAt: new Date(row.added_at).getTime(),
    memo: row.memo ?? undefined,
    wornCount: row.worn_count,
    lastWornAt: row.last_worn_at
      ? new Date(row.last_worn_at).getTime()
      : undefined,
  }
}

async function requireUser() {
  const { data } = await supabase.auth.getSession()
  return data.session?.user ?? null
}

export async function loadShoes(): Promise<Shoe[]> {
  const { data, error } = await supabase
    .from("shoes")
    .select(
      "id, name, brand, image_url, image_path, price, added_at, memo, worn_count, last_worn_at",
    )
    .order("added_at", { ascending: false })

  if (error || !data) return []
  return data.map((row) => fromRow(row as ShoeRow))
}

export async function addShoe(shoe: Shoe, photo?: Blob): Promise<boolean> {
  const user = await requireUser()
  if (!user) return false

  let imageUrl = shoe.imageUrl
  let imagePath: string | null = shoe.imagePath ?? null

  if (photo) {
    imagePath = `${user.id}/${shoe.id}.jpg`
    const { error: uploadError } = await supabase.storage
      .from(SHOE_BUCKET)
      .upload(imagePath, photo, {
        contentType: "image/jpeg",
        upsert: false,
      })
    if (uploadError) return false
    imageUrl = supabase.storage.from(SHOE_BUCKET).getPublicUrl(imagePath)
      .data.publicUrl
  }

  const { error } = await supabase.from("shoes").insert({
    id: shoe.id,
    user_id: user.id,
    name: shoe.name,
    brand: shoe.brand,
    image_url: imageUrl,
    image_path: imagePath,
    price: shoe.price,
    added_at: new Date(shoe.addedAt).toISOString(),
    memo: shoe.memo ?? null,
    worn_count: shoe.wornCount ?? 0,
    last_worn_at: shoe.lastWornAt
      ? new Date(shoe.lastWornAt).toISOString()
      : null,
  })

  if (error) {
    if (imagePath) await supabase.storage.from(SHOE_BUCKET).remove([imagePath])
    return false
  }
  return true
}

export async function updateShoe(
  id: string,
  patch: Partial<Shoe>,
): Promise<Shoe[] | null> {
  const row: Record<string, unknown> = {}
  if (patch.name !== undefined) row.name = patch.name
  if (patch.brand !== undefined) row.brand = patch.brand
  if (patch.imageUrl !== undefined) row.image_url = patch.imageUrl
  if (patch.price !== undefined) row.price = patch.price
  if (patch.memo !== undefined) row.memo = patch.memo || null
  if (patch.wornCount !== undefined) row.worn_count = patch.wornCount
  if (patch.lastWornAt !== undefined) {
    row.last_worn_at = new Date(patch.lastWornAt).toISOString()
  }

  const { error } = await supabase.from("shoes").update(row).eq("id", id)
  if (error) return null
  return loadShoes()
}

export async function deleteShoes(ids: string[]): Promise<boolean> {
  if (ids.length === 0) return true

  const { data } = await supabase
    .from("shoes")
    .select("image_path")
    .in("id", ids)
  const paths = (data ?? [])
    .map((row) => row.image_path as string | null)
    .filter((path): path is string => Boolean(path))

  const { error } = await supabase.from("shoes").delete().in("id", ids)
  if (error) return false
  if (paths.length > 0) {
    await supabase.storage.from(SHOE_BUCKET).remove(paths)
  }
  return true
}

export async function resetShoes(): Promise<Shoe[]> {
  const items = await loadShoes()
  await deleteShoes(items.map((shoe) => shoe.id))
  return []
}

export async function loadClosetName(): Promise<string> {
  const user = await requireUser()
  if (!user) return "슈가"

  await supabase.from("profiles").upsert(
    { id: user.id },
    { onConflict: "id", ignoreDuplicates: true },
  )

  const { data } = await supabase
    .from("profiles")
    .select("closet_name")
    .eq("id", user.id)
    .maybeSingle()

  return data?.closet_name || "슈가"
}

export async function saveClosetName(name: string): Promise<void> {
  const user = await requireUser()
  if (!user) return
  const next = name.trim() || "슈가"
  await supabase.from("profiles").upsert({
    id: user.id,
    closet_name: next,
    updated_at: new Date().toISOString(),
  })
}
