import type { Shoe } from "../types"

const day = 24 * 60 * 60 * 1000

export const shoes: Shoe[] = [
  {
    id: "1",
    name: "Dunk Low Panda",
    brand: "Nike",
    price: 139000,
    addedAt: Date.now() - 27 * day,
    memo: "뭘 입어도 어울려서 제일 손이 자주 간다.",
    wornCount: 12,
    lastWornAt: Date.now() - 2 * day,
    imageUrl:
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "2",
    name: "Samba OG",
    brand: "Adidas",
    price: 129000,
    addedAt: Date.now() - 24 * day,
    memo: "봄에 청바지랑 신으려고 샀는데 생각보다 발볼이 좁다.",
    wornCount: 5,
    lastWornAt: Date.now() - 8 * day,
    imageUrl:
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "3",
    name: "550 White Green",
    brand: "New Balance",
    price: 149000,
    addedAt: Date.now() - 21 * day,
    imageUrl:
      "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "4",
    name: "Air Force 1",
    brand: "Nike",
    price: 139000,
    addedAt: Date.now() - 18 * day,
    imageUrl:
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "5",
    name: "Chuck 70",
    brand: "Converse",
    price: 99000,
    addedAt: Date.now() - 15 * day,
    imageUrl:
      "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "6",
    name: "Gel-Kayano 14",
    brand: "Asics",
    price: 209000,
    addedAt: Date.now() - 12 * day,
    memo: "러닝용으로 들였다. 5km까지는 발이 편하다.",
    wornCount: 8,
    lastWornAt: Date.now() - 1 * day,
    imageUrl:
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "7",
    name: "Arizona 샌달",
    brand: "Birkenstock",
    price: 145000,
    addedAt: Date.now() - 9 * day,
    imageUrl:
      "https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "8",
    name: "Gizeh 샌달",
    brand: "Birkenstock",
    price: 135000,
    addedAt: Date.now() - 6 * day,
    imageUrl:
      "https://images.unsplash.com/photo-1596523027665-9da35ced2388?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "9",
    name: "Offcourt Slide 슬리퍼",
    brand: "Nike",
    price: 79000,
    addedAt: Date.now() - 3 * day,
    imageUrl:
      "https://images.unsplash.com/photo-1622920799137-86c891159e44?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "10",
    name: "Adilette 슬리퍼",
    brand: "Adidas",
    price: 45000,
    addedAt: Date.now() - 1 * day,
    imageUrl:
      "https://images.unsplash.com/photo-1583473848882-f9a5bc7fd2ee?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "11",
    name: "Gazelle Indoor",
    brand: "Adidas",
    price: 149000,
    addedAt: Date.now() - 20 * day,
    memo: "굽이 낮아서 바지 길이를 신경 써야 한다.",
    wornCount: 4,
    lastWornAt: Date.now() - 6 * day,
    imageUrl:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "12",
    name: "2002R",
    brand: "New Balance",
    price: 169000,
    addedAt: Date.now() - 14 * day,
    wornCount: 3,
    lastWornAt: Date.now() - 4 * day,
    imageUrl:
      "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "13",
    name: "Old Skool",
    brand: "Vans",
    price: 79000,
    addedAt: Date.now() - 7 * day,
    memo: "비 오는 날에는 절대 안 신는다.",
    imageUrl:
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "14",
    name: "Ultraboost 1.0",
    brand: "Adidas",
    price: 229000,
    addedAt: Date.now() - 2 * day,
    imageUrl:
      "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=800&q=80",
  },
]
