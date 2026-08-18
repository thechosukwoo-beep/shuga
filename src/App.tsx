import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react"
import {
  BrowserRouter,
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom"
import { communityPosts, type CommunityPost } from "./data/community"
import { marketShoes } from "./data/market"
import { addShoe, loadShoes, resetShoes, saveShoes, updateShoe } from "./data/storage"
import type { MarketCategory, MarketShoe, Shoe } from "./types"

const PAGE = "page-in min-h-dvh bg-night text-ink"
const CARD =
  "rounded-2xl border border-line bg-white/70 shadow-[0_1px_2px_rgba(25,23,19,0.03)]"
const CARD_LINK = `${CARD} block cursor-pointer transition duration-200 ease-out hover:bg-white hover:shadow-[0_8px_20px_-12px_rgba(25,23,19,0.22)] active:scale-[0.99]`
const FIELD =
  "w-full cursor-text rounded-xl border border-line bg-white/70 px-3.5 py-2.5 text-[13px] text-ink outline-none transition duration-200 ease-out placeholder:text-mist/70 hover:bg-white focus:border-ink/25 focus:bg-white"
const SECTION_LABEL = "text-[10px] font-medium tracking-[0.12em] text-mist"
const BACK_LINK =
  "inline-flex items-center gap-1 text-[11px] tracking-[0.06em] text-mist transition duration-150 hover:text-ink"

function chipClass(active: boolean) {
  return `shrink-0 cursor-pointer rounded-full border px-3 py-1 text-[11px] transition duration-200 ease-out active:scale-95 ${
    active
      ? "border-ink bg-ink text-white"
      : "border-line bg-white/60 text-mist hover:border-ink/25 hover:text-ink"
  }`
}

function ClosetPage() {
  const [items, setItems] = useState(loadShoes)
  const [closetName, setClosetName] = useState(
    () => localStorage.getItem("shuga-closet-name") || "슈가",
  )
  const [renaming, setRenaming] = useState(false)
  const [query, setQuery] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [addOpen, setAddOpen] = useState(false)
  const [sortKey, setSortKey] = useState<"time" | "price" | "name">("time")
  const [sortOpen, setSortOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const sortRef = useRef<HTMLDivElement>(null)

  const keyword = query.trim().toLowerCase()
  const filtered = useMemo(() => {
    const list = keyword
      ? items.filter(
          (shoe) =>
            shoe.name.toLowerCase().includes(keyword) ||
            shoe.brand.toLowerCase().includes(keyword),
        )
      : [...items]

    return list.sort((a, b) => {
      if (sortKey === "name") {
        return a.name.localeCompare(b.name, "ko")
      }
      if (sortKey === "price") {
        return a.price - b.price
      }
      return b.addedAt - a.addedAt
    })
  }, [items, keyword, sortKey])

  useEffect(() => {
    saveShoes(items)
  }, [items])

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  useEffect(() => {
    if (renaming) {
      nameRef.current?.focus()
      nameRef.current?.select()
    }
  }, [renaming])

  useEffect(() => {
    function closeMenu(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false)
      }
      if (!sortRef.current?.contains(event.target as Node)) {
        setSortOpen(false)
      }
    }

    document.addEventListener("pointerdown", closeMenu)
    return () => document.removeEventListener("pointerdown", closeMenu)
  }, [])

  function toggleSearch() {
    setMenuOpen(false)
    if (searchOpen) {
      setSearchOpen(false)
      setQuery("")
      return
    }
    setSearchOpen(true)
  }

  function startRenaming() {
    setMenuOpen(false)
    setSearchOpen(false)
    setQuery("")
    setRenaming(true)
  }

  function saveClosetName(value: string) {
    const next = value.trim() || "슈가"
    setClosetName(next)
    localStorage.setItem("shuga-closet-name", next)
    setRenaming(false)
  }

  function startEditing() {
    setMenuOpen(false)
    setSearchOpen(false)
    setQuery("")
    setSelected([])
    setEditing(true)
  }

  function stopEditing() {
    setEditing(false)
    setSelected([])
  }

  function toggleSelected(id: string) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    )
  }

  function deleteSelected() {
    setItems((current) => current.filter((shoe) => !selected.includes(shoe.id)))
    setSelected([])
  }

  return (
    <main className={`relative px-4 pb-32 pt-6 ${PAGE}`}>
      <header className="mb-5 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[19px] font-semibold leading-none tracking-[0.3em] text-ink">
            SHUGA
          </p>
          <label className="mt-1.5 block">
            <span className="sr-only">신발장 이름</span>
            <input
              ref={nameRef}
              value={closetName}
              readOnly={!renaming}
              maxLength={16}
              onClick={() => {
                if (!renaming) startRenaming()
              }}
              onChange={(event) => setClosetName(event.target.value)}
              onBlur={(event) => {
                if (renaming) saveClosetName(event.target.value)
              }}
              onKeyDown={(event) => {
                if (!renaming) return
                if (event.key === "Enter") {
                  event.preventDefault()
                  event.currentTarget.blur()
                }
                if (event.key === "Escape") {
                  setRenaming(false)
                  event.currentTarget.blur()
                }
              }}
              className={`w-full appearance-none bg-transparent p-0 text-[11.5px] leading-none tracking-[0.02em] outline-none ${
                renaming
                  ? "cursor-text text-ink caret-clay"
                  : "cursor-pointer text-mist caret-transparent transition duration-150 hover:text-clay"
              }`}
            />
          </label>
        </div>

        {editing ? (
          <div className="flex flex-col items-end gap-1">
            <button
              type="button"
              onClick={stopEditing}
              className="cursor-pointer rounded-full px-2.5 py-1 text-[10px] font-medium tracking-[0.04em] text-clay transition duration-150 ease-out hover:bg-clay-soft active:scale-95"
            >
              완료
            </button>
            <p className="text-[10px] text-mist/70">
              {selected.length > 0
                ? `${selected.length}켤레 선택`
                : "선택하세요"}
            </p>
          </div>
        ) : (
          <div className="relative flex items-start" ref={menuRef}>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={toggleSearch}
                  aria-label="검색"
                  aria-pressed={searchOpen}
                  className={`flex size-7 cursor-pointer items-center justify-center rounded-full transition duration-200 ease-out hover:bg-card active:scale-90 ${searchOpen ? "bg-card text-clay" : "text-ink"}`}
                >
                  <SearchIcon />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSortOpen(false)
                    setMenuOpen((open) => !open)
                  }}
                  aria-label="더보기"
                  aria-expanded={menuOpen}
                  className={`flex size-7 cursor-pointer items-center justify-center rounded-full transition duration-200 ease-out hover:bg-card active:scale-90 ${menuOpen ? "bg-card text-clay" : "text-ink"}`}
                >
                  <MoreIcon />
                </button>
              </div>
              <div className="relative mt-0.5 flex items-center justify-end gap-1" ref={sortRef}>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    setSortOpen((open) => !open)
                  }}
                  aria-label="정렬"
                  aria-expanded={sortOpen}
                  className={`flex size-6 cursor-pointer items-center justify-center rounded-full transition duration-200 ease-out hover:bg-card active:scale-90 ${sortOpen ? "bg-card text-clay" : "text-mist"}`}
                >
                  <SortIcon />
                </button>
                <p className="text-[10px] leading-none tracking-[0.04em] text-mist">
                  {keyword
                    ? `${filtered.length} / ${items.length}켤레`
                    : `${items.length}켤레`}
                </p>
                {sortOpen ? (
                  <div className="sheet-in absolute right-0 top-7 z-10 min-w-[4.75rem] overflow-hidden rounded-xl border border-line bg-white/95 py-1 shadow-[0_10px_24px_-14px_rgba(25,23,19,0.3)] backdrop-blur-xl">
                    {(
                      [
                        ["time", "최신순"],
                        ["price", "가격순"],
                        ["name", "이름순"],
                      ] as const
                    ).map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setSortKey(key)
                          setSortOpen(false)
                        }}
                        className={`block w-full cursor-pointer px-2.5 py-1.5 text-left text-[11px] transition duration-150 hover:bg-card ${
                          sortKey === key ? "font-medium text-clay" : "text-mist"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
            {menuOpen ? (
              <div className="sheet-in absolute right-0 top-8 z-10 min-w-[5.5rem] overflow-hidden rounded-xl border border-line bg-white/95 py-1 shadow-[0_10px_24px_-14px_rgba(25,23,19,0.3)] backdrop-blur-xl">
                <button
                  type="button"
                  onClick={startRenaming}
                  className="block w-full cursor-pointer px-2.5 py-1.5 text-left text-[11px] transition duration-150 hover:bg-card hover:text-clay"
                >
                  이름 변경
                </button>
                <button
                  type="button"
                  onClick={startEditing}
                  className="block w-full cursor-pointer px-2.5 py-1.5 text-left text-[11px] transition duration-150 hover:bg-card hover:text-clay"
                >
                  편집
                </button>
              </div>
            ) : null}
          </div>
        )}
      </header>

      {searchOpen && !editing ? (
        <label className="mb-5 block">
          <span className="sr-only">신발 검색</span>
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="이름 또는 브랜드 검색"
            className={FIELD}
          />
        </label>
      ) : null}

      {items.length === 0 ? (
        <p className="mt-20 text-center text-[12px] leading-relaxed text-mist">
          아직 비어 있어요
          <br />
          <span className="text-[11px] text-mist/70">첫 신발을 담아보세요</span>
        </p>
      ) : filtered.length === 0 ? (
        <p className="mt-20 text-center text-[12px] text-mist">찾는 신발이 없어요</p>
      ) : (
        <ul className="grid grid-cols-4 gap-2.5">
          {filtered.map((shoe) => (
            <li key={shoe.id}>
              <ShoeCard
                shoe={shoe}
                editing={editing}
                selected={selected.includes(shoe.id)}
                onToggle={() => toggleSelected(shoe.id)}
              />
            </li>
          ))}
        </ul>
      )}

      {editing && selected.length > 0 ? (
        <button
          type="button"
          onClick={deleteSelected}
          className="fixed bottom-20 left-1/2 z-10 -translate-x-1/2 cursor-pointer rounded-full bg-clay px-4 py-2 text-[11px] font-medium tracking-[0.02em] text-white shadow-[0_6px_16px_-6px_rgba(164,87,58,0.6)] transition duration-200 ease-out hover:brightness-95 active:scale-95"
        >
          선택 삭제
        </button>
      ) : !editing ? (
        <>
          {addOpen ? (
            <>
              <button
                type="button"
                aria-label="닫기"
                onClick={() => setAddOpen(false)}
                className="fixed inset-0 z-30 cursor-default bg-ink/15 backdrop-blur-[2px]"
              />
              <div className="sheet-in fixed bottom-[4.5rem] right-[max(1.5rem,calc(50%-215px+1.5rem))] z-40 min-w-[7rem] overflow-hidden rounded-xl border border-line bg-white/95 py-1 shadow-[0_14px_30px_-16px_rgba(25,23,19,0.35)] backdrop-blur-xl">
                <Link
                  to="/add/camera"
                  className="block cursor-pointer px-3 py-2 text-[11px] transition duration-150 hover:bg-card hover:text-clay"
                >
                  카메라로 추가
                </Link>
                <Link
                  to="/add/search"
                  className="block cursor-pointer px-3 py-2 text-[11px] transition duration-150 hover:bg-card hover:text-clay"
                >
                  직접 추가
                </Link>
              </div>
            </>
          ) : null}
          <button
            type="button"
            onClick={() => setAddOpen((open) => !open)}
            aria-label="신발 추가"
            aria-expanded={addOpen}
            className={`fixed bottom-20 right-[max(1.5rem,calc(50%-215px+1.5rem))] z-40 flex size-9 cursor-pointer items-center justify-center rounded-full bg-ink text-sm text-white shadow-[0_6px_18px_-6px_rgba(25,23,19,0.5)] transition duration-200 ease-out hover:shadow-[0_10px_24px_-8px_rgba(25,23,19,0.55)] active:scale-90 ${
              addOpen ? "rotate-45" : "hover:scale-105 hover:rotate-90"
            }`}
          >
            +
          </button>
        </>
      ) : null}
    </main>
  )
}

function ShoeCard({
  shoe,
  editing,
  selected,
  onToggle,
}: {
  shoe: Shoe
  editing: boolean
  selected: boolean
  onToggle: () => void
}) {
  const body = (
    <>
      <div className="aspect-square overflow-hidden rounded-[10px] bg-card">
        <img
          src={shoe.imageUrl}
          alt={`${shoe.brand} ${shoe.name}`}
          className="size-full object-cover transition duration-500 ease-out group-hover:scale-[1.07]"
        />
      </div>
      <div className="px-0.5 pt-1.5 text-left">
        <p className="truncate text-[10px] font-medium leading-tight">{shoe.name}</p>
        <p className="mt-0.5 truncate text-[9px] tracking-[0.02em] text-mist">
          {shoe.brand}
        </p>
      </div>
      {editing ? (
        <span
          className={`absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full backdrop-blur-sm transition duration-150 ${
            selected
              ? "bg-clay text-white"
              : "border border-white/70 bg-ink/25 text-transparent"
          }`}
        >
          <CheckIcon />
        </span>
      ) : null}
    </>
  )

  const shell = `group relative block w-full cursor-pointer rounded-xl p-1 text-left transition duration-300 ease-out hover:bg-white hover:shadow-[0_8px_20px_-14px_rgba(25,23,19,0.3)] active:scale-[0.98]`

  if (editing) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className={`${shell} ${selected ? "bg-white ring-1 ring-clay/40" : ""}`}
      >
        {body}
      </button>
    )
  }

  return (
    <Link to={`/shoes/${shoe.id}`} className={shell}>
      {body}
    </Link>
  )
}

function SearchIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M16 16.5 20.5 21"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden="true">
      <path
        d="M4.5 11.5 12 5l7.5 6.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 10.5V19h10v-8.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CommunityIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden="true">
      <path
        d="M5 16.5 5 8.5A2.5 2.5 0 0 1 7.5 6h9A2.5 2.5 0 0 1 19 8.5v5A2.5 2.5 0 0 1 16.5 16H9l-4 3.2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ClosetIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden="true">
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function AccountIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M5.5 19.2c.8-3.2 3.3-5 6.5-5s5.7 1.8 6.5 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function SortIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true">
      <rect x="4" y="5" width="16" height="2" rx="1" />
      <rect x="10" y="9" width="10" height="2" rx="1" />
      <rect x="6" y="13" width="14" height="2" rx="1" />
      <rect x="12" y="17" width="8" height="2" rx="1" />
    </svg>
  )
}

function MoreIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="5.5" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="18.5" r="1.5" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5" fill="none" aria-hidden="true">
      <path
        d="M5 12.5 10 17.5 19 7.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const MARKET_CATEGORIES: { id: "all" | MarketCategory; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "sneakers", label: "스니커즈" },
  { id: "running", label: "러닝" },
  { id: "sandals", label: "샌달" },
  { id: "slides", label: "슬리퍼" },
]

function formatPrice(price: number) {
  return `${price.toLocaleString("ko-KR")}원`
}

const TRENDING_KEYWORDS = ["덩크", "뉴발란스", "삼바", "조던", "아식스"]
const TRENDING_SHOES = marketShoes.slice(0, 5)

function SearchPage() {
  const [query, setQuery] = useState("")
  const [focused, setFocused] = useState(false)
  const [category, setCategory] = useState<"all" | MarketCategory>("all")
  const keyword = query.trim().toLowerCase()
  const filtered = useMemo(
    () =>
      marketShoes.filter((shoe) => {
        const matchesCategory = category === "all" || shoe.category === category
        const matchesQuery =
          !keyword ||
          shoe.name.toLowerCase().includes(keyword) ||
          shoe.brand.toLowerCase().includes(keyword)
        return matchesCategory && matchesQuery
      }),
    [category, keyword],
  )

  const showTrending = focused && !keyword

  return (
    <main className={`px-4 pb-32 pt-6 ${PAGE}`}>
      <div>
        <h1 className="text-[19px] font-semibold tracking-tight">구경</h1>
        <p className="mt-1 text-[11px] text-mist">시중에 나온 신발을 둘러보세요</p>
      </div>
      <label className="mt-4 block">
        <span className="sr-only">시중 신발 검색</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="브랜드, 모델명 검색"
          className={FIELD}
        />
      </label>

      {showTrending ? (
        <div className="mt-5 space-y-6">
          <section>
            <h2 className={SECTION_LABEL}>인기 검색어</h2>
            <ol className="mt-2">
              {TRENDING_KEYWORDS.map((kw, i) => (
                <li key={kw}>
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      setQuery(kw)
                      setFocused(false)
                    }}
                    className="group flex w-full cursor-pointer items-center gap-3 rounded-lg px-1.5 py-[7px] text-left transition duration-150 hover:bg-card"
                  >
                    <span
                      className={`w-3 text-[11px] font-semibold tabular-nums ${
                        i < 3 ? "text-clay" : "text-mist/60"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className="text-[12.5px] transition duration-150 group-hover:text-clay">
                      {kw}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </section>
          <section>
            <h2 className={SECTION_LABEL}>요즘 많이 찾는 신발</h2>
            <ul className="mt-2">
              {TRENDING_SHOES.map((shoe) => (
                <li key={shoe.id}>
                  <Link
                    to={`/browse/${shoe.id}`}
                    className="group flex cursor-pointer items-center gap-3 rounded-lg px-1.5 py-1.5 transition duration-150 hover:bg-card"
                  >
                    <span className="size-9 shrink-0 overflow-hidden rounded-lg bg-card">
                      <img
                        src={shoe.imageUrl}
                        alt=""
                        className="size-full object-cover transition duration-500 ease-out group-hover:scale-[1.08]"
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12px] font-medium">
                        {shoe.name}
                      </span>
                      <span className="block truncate text-[10px] tracking-[0.02em] text-mist">
                        {shoe.brand}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      ) : (
        <>
          <div className="no-scrollbar mt-3.5 flex gap-1.5 overflow-x-auto pb-1">
            {MARKET_CATEGORIES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setCategory(item.id)}
                className={chipClass(category === item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          {filtered.length === 0 ? (
            <p className="mt-20 text-center text-[12px] text-mist">
              아직 없는 모델이에요
            </p>
          ) : (
            <ul className="mt-5 grid grid-cols-2 gap-x-3 gap-y-5">
              {filtered.map((shoe) => (
                <li key={shoe.id}>
                  <MarketCard shoe={shoe} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </main>
  )
}

function MarketCard({ shoe }: { shoe: MarketShoe }) {
  return (
    <Link
      to={`/browse/${shoe.id}`}
      className="group block cursor-pointer transition duration-300 ease-out hover:-translate-y-1 active:scale-[0.98]"
    >
      <div className="aspect-square overflow-hidden rounded-2xl bg-card shadow-[0_1px_2px_rgba(25,23,19,0.03)] transition duration-300 group-hover:shadow-[0_14px_28px_-18px_rgba(25,23,19,0.35)]">
        <img
          src={shoe.imageUrl}
          alt={`${shoe.brand} ${shoe.name}`}
          className="size-full object-cover transition duration-500 ease-out group-hover:scale-[1.06]"
        />
      </div>
      <p className="mt-2 truncate text-[10px] tracking-[0.06em] text-mist">
        {shoe.brand}
      </p>
      <p className="mt-0.5 truncate text-[12px] font-medium leading-snug">
        {shoe.name}
      </p>
      <p className="mt-1 text-[11.5px] tabular-nums text-mute">
        {formatPrice(shoe.price)}
      </p>
    </Link>
  )
}

function BrowseDetailPage() {
  const { id } = useParams()
  const shoe = marketShoes.find((item) => item.id === id)

  if (!shoe) {
    return (
      <main className={`px-4 pt-6 ${PAGE}`}>
        <Link to="/search" className={BACK_LINK}>
          ← 구경
        </Link>
        <p className="mt-10 text-[12px] text-mist">없는 상품이에요</p>
      </main>
    )
  }

  const categoryLabel =
    MARKET_CATEGORIES.find((item) => item.id === shoe.category)?.label ?? ""

  return (
    <main className={`pb-32 ${PAGE}`}>
      <div className="px-4 pt-6">
        <Link to="/search" className={BACK_LINK}>
          ← 구경
        </Link>
      </div>
      <div className="mt-4 aspect-square overflow-hidden bg-card">
        <img
          src={shoe.imageUrl}
          alt={`${shoe.brand} ${shoe.name}`}
          className="size-full object-cover"
        />
      </div>
      <div className="px-4 pt-6">
        <p className="text-[10px] tracking-[0.14em] text-mist">{shoe.brand}</p>
        <h1 className="mt-1.5 text-[18px] font-semibold leading-snug tracking-tight">
          {shoe.name}
        </h1>
        <p className="mt-2 text-[15px] font-medium tabular-nums text-clay">
          {formatPrice(shoe.price)}
        </p>
        <p className="mt-4 border-t border-line pt-3 text-[11px] text-mist">
          {categoryLabel} · 시중 판매 상품
        </p>
      </div>
    </main>
  )
}

function AccountPage() {
  const [closet, setCloset] = useState(loadShoes)
  const [closetName, setClosetName] = useState(
    () => localStorage.getItem("shuga-closet-name") || "슈가",
  )
  const [renaming, setRenaming] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (renaming) nameRef.current?.focus()
  }, [renaming])

  function startRenaming() {
    setRenaming(true)
  }

  function saveName(value: string) {
    const next = value.trim() || "슈가"
    setClosetName(next)
    localStorage.setItem("shuga-closet-name", next)
    setRenaming(false)
  }

  function resetAll() {
    setCloset(resetShoes())
    localStorage.removeItem("shuga-closet-name")
    setClosetName("슈가")
    setConfirmReset(false)
  }

  const totalValue = closet.reduce((sum, shoe) => sum + shoe.price, 0)
  const totalWorn = closet.reduce((sum, shoe) => sum + (shoe.wornCount ?? 0), 0)
  const notedCount = closet.filter((shoe) => shoe.memo).length
  const mostWorn = [...closet]
    .filter((shoe) => (shoe.wornCount ?? 0) > 0)
    .sort((a, b) => (b.wornCount ?? 0) - (a.wornCount ?? 0))
    .slice(0, 3)
  const brandMap = closet.reduce<Record<string, number>>((acc, shoe) => {
    acc[shoe.brand] = (acc[shoe.brand] ?? 0) + 1
    return acc
  }, {})
  const brands = Object.entries(brandMap).sort((a, b) => b[1] - a[1])
  const topBrandCount = brands[0]?.[1] ?? 1

  return (
    <main className={`px-4 pb-32 pt-6 ${PAGE}`}>
      <div>
        <h1 className="text-[19px] font-semibold tracking-tight">내 계정</h1>
        <p className="mt-1 text-[11px] text-mist">슈가 프로필</p>
      </div>

      <div className={`mt-3 flex items-center gap-2 px-2.5 py-1.5 ${CARD}`}>
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-clay-soft text-clay">
          <AccountIcon className="size-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <label className="block">
            <span className="sr-only">신발장 이름</span>
            <input
              ref={nameRef}
              value={closetName}
              readOnly={!renaming}
              maxLength={16}
              onClick={() => {
                if (!renaming) startRenaming()
              }}
              onChange={(event) => setClosetName(event.target.value)}
              onBlur={(event) => saveName(event.target.value)}
              onKeyDown={(event) => {
                if (!renaming) return
                if (event.key === "Enter") {
                  event.preventDefault()
                  event.currentTarget.blur()
                }
                if (event.key === "Escape") {
                  setRenaming(false)
                  event.currentTarget.blur()
                }
              }}
              className={`w-full appearance-none bg-transparent p-0 text-[12px] font-medium leading-tight outline-none ${
                renaming
                  ? "cursor-text text-ink caret-clay"
                  : "cursor-pointer caret-transparent transition duration-150 hover:text-clay"
              }`}
            />
          </label>
          <p className="mt-0.5 text-[9px] text-mist">
            {renaming ? "이름을 적고 Enter" : `${closet.length}켤레와 함께`}
          </p>
        </div>
      </div>

      <section className="mt-6">
        <h2 className={SECTION_LABEL}>내 기록</h2>
        <div className="mt-2 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line">
          {(
            [
              ["신발", `${closet.length}켤레`],
              ["신발장 가치", formatPrice(totalValue)],
              ["신은 횟수", `${totalWorn}번`],
              ["남긴 기록", `${notedCount}개`],
            ] as const
          ).map(([label, value]) => (
            <div key={label} className="bg-white/70 px-4 py-3.5">
              <p className="text-[9px] tracking-[0.1em] text-mist/80">{label}</p>
              <p className="mt-1 truncate text-[14px] font-medium tabular-nums">
                {value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {mostWorn.length > 0 ? (
        <section className="mt-6">
          <h2 className={SECTION_LABEL}>많이 신은 신발</h2>
          <ul className="mt-2">
            {mostWorn.map((shoe, index) => (
              <li key={shoe.id}>
                <Link
                  to={`/shoes/${shoe.id}`}
                  className="group flex cursor-pointer items-center gap-3 rounded-lg px-1.5 py-2 transition duration-150 hover:bg-card"
                >
                  <span
                    className={`w-3 text-[11px] font-semibold tabular-nums ${
                      index === 0 ? "text-clay" : "text-mist/60"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className="size-10 shrink-0 overflow-hidden rounded-lg bg-card">
                    <img
                      src={shoe.imageUrl}
                      alt=""
                      className="size-full object-cover transition duration-500 ease-out group-hover:scale-[1.08]"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12px] font-medium">
                      {shoe.name}
                    </span>
                    <span className="block truncate text-[10px] tracking-[0.02em] text-mist">
                      {shoe.brand}
                    </span>
                  </span>
                  <span className="shrink-0 text-[11px] tabular-nums text-mute">
                    {shoe.wornCount}번
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {brands.length > 0 ? (
        <section className="mt-6">
          <h2 className={SECTION_LABEL}>브랜드</h2>
          <ul className="mt-2.5 space-y-2.5">
            {brands.map(([brand, count]) => (
              <li key={brand}>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-[11.5px]">{brand}</span>
                  <span className="shrink-0 text-[10px] tabular-nums text-mist">
                    {count}켤레
                  </span>
                </div>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-card">
                  <div
                    className="h-full rounded-full bg-clay/70 transition-[width] duration-700 ease-out"
                    style={{ width: `${(count / topBrandCount) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-8 border-t border-line pt-5">
        <h2 className={SECTION_LABEL}>설정</h2>
        <p className="mt-2 text-[11px] leading-relaxed text-mist">
          기록은 이 기기의 브라우저에만 저장됩니다. 비우면 되돌릴 수 없어요.
        </p>
        {confirmReset ? (
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={resetAll}
              className="flex-1 cursor-pointer rounded-xl bg-clay py-2.5 text-[12px] font-medium text-white shadow-[0_6px_16px_-8px_rgba(164,87,58,0.7)] transition duration-200 ease-out hover:brightness-95 active:scale-[0.98]"
            >
              정말 비우기
            </button>
            <button
              type="button"
              onClick={() => setConfirmReset(false)}
              className="flex-1 cursor-pointer rounded-xl border border-line py-2.5 text-[12px] text-mist transition duration-200 ease-out hover:bg-card hover:text-ink active:scale-[0.98]"
            >
              그만두기
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="mt-3 w-full cursor-pointer rounded-xl border border-line py-2.5 text-[12px] text-mist transition duration-200 ease-out hover:border-clay/40 hover:text-clay active:scale-[0.98]"
          >
            신발장 비우기
          </button>
        )}
      </section>
    </main>
  )
}

function HomePage() {
  const closet = useMemo(loadShoes, [])
  const closetName = localStorage.getItem("shuga-closet-name") || "슈가"
  const latest = communityPosts[0]
  const picks = marketShoes.slice(0, 4)

  const todayPick = useMemo(
    () => closet[Math.floor(Math.random() * closet.length)],
    [closet],
  )

  const totalValue = closet.reduce((sum, shoe) => sum + shoe.price, 0)
  const brandCount = new Set(closet.map((shoe) => shoe.brand)).size
  const averagePrice =
    closet.length > 0 ? Math.round(totalValue / closet.length) : 0

  const today = new Date().toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "long",
  })

  return (
    <main className={`px-4 pb-32 pt-6 ${PAGE}`}>
      <header>
        <p className="text-[19px] font-semibold leading-none tracking-[0.3em]">
          SHUGA
        </p>
        <div className="mt-2 flex items-baseline justify-between gap-3">
          <p className="min-w-0 text-[11px] leading-relaxed text-mist">
            신발을 고르고, 읽고, 담아 두는 집
          </p>
          <p className="shrink-0 pr-1.5 text-[10px] tracking-[0.06em] text-mist">
            {today}
          </p>
        </div>
      </header>

      {todayPick ? (
        <section className={`mt-6 overflow-hidden ${CARD}`}>
          <div className="px-4 pt-3.5">
            <h2 className={SECTION_LABEL}>오늘 뭐 신지?</h2>
          </div>
          <Link
            to={`/shoes/${todayPick.id}`}
            className="group mt-3 flex cursor-pointer items-center gap-3.5 px-4 pb-4 transition duration-200 active:scale-[0.99]"
          >
            <span className="size-[68px] shrink-0 overflow-hidden rounded-xl bg-card">
              <img
                src={todayPick.imageUrl}
                alt={`${todayPick.brand} ${todayPick.name}`}
                className="size-full object-cover transition duration-500 ease-out group-hover:scale-[1.07]"
              />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[10px] tracking-[0.1em] text-mist">
                {todayPick.brand}
              </span>
              <span className="mt-1 block truncate text-[15px] font-medium leading-snug">
                {todayPick.name}
              </span>
              {todayPick.memo ? (
                <span className="mt-1 block truncate text-[11px] italic text-mute">
                  “{todayPick.memo}”
                </span>
              ) : (
                <span className="mt-1 block text-[11px] tabular-nums text-mute">
                  {todayPick.wornCount
                    ? `${todayPick.wornCount}번 신었어요`
                    : formatPrice(todayPick.price)}
                </span>
              )}
            </span>
            <span className="shrink-0 text-[11px] text-mist transition duration-200 group-hover:translate-x-0.5 group-hover:text-clay">
              →
            </span>
          </Link>
        </section>
      ) : null}

      <Link to="/closet" className={`mt-2.5 px-4 py-4 ${CARD_LINK}`}>
        <span className="flex items-baseline justify-between gap-2">
          <span className="min-w-0">
            <span className="block truncate text-[13.5px] font-medium">
              {closetName}
            </span>
            <span className="mt-1 block text-[10px] tracking-[0.1em] text-mist">
              내 신발장
            </span>
          </span>
          <span className="shrink-0 text-[11px] tabular-nums text-mist">
            {closet.length}켤레
          </span>
        </span>
        <span className="mt-3.5 flex gap-3 border-t border-line pt-3.5">
          {(
            [
              ["가치", formatPrice(totalValue)],
              ["브랜드", `${brandCount}개`],
              ["평균가", formatPrice(averagePrice)],
            ] as const
          ).map(([label, value]) => (
            <span key={label} className="min-w-0 flex-1">
              <span className="block text-[9px] tracking-[0.1em] text-mist/80">
                {label}
              </span>
              <span className="mt-1 block truncate text-[11.5px] font-medium tabular-nums">
                {value}
              </span>
            </span>
          ))}
        </span>
      </Link>

      <Link
        to={`/community/${latest.id}`}
        className={`group mt-2.5 overflow-hidden ${CARD_LINK}`}
      >
        <span className="relative block aspect-[16/9] overflow-hidden bg-card">
          <img
            src={latest.imageUrl}
            alt=""
            className="size-full object-cover transition duration-700 ease-out group-hover:scale-[1.05]"
          />
          <span className="absolute left-3 top-3">
            <TagBadge tag={latest.tag} />
          </span>
        </span>
        <span className="block px-4 py-3.5">
          <span className="block text-[13.5px] font-medium leading-snug">
            {latest.title}
          </span>
          <span className="mt-1.5 block text-[11px] leading-relaxed text-mist">
            {latest.excerpt}
          </span>
          <span className="mt-2.5 block text-[10px] text-mist/70">
            {latest.date}
          </span>
        </span>
      </Link>

      <div className="mt-7 flex items-baseline justify-between">
        <h2 className={SECTION_LABEL}>요즘 많이 보는 신발</h2>
        <Link
          to="/search"
          className="group text-[10px] text-mist transition duration-150 hover:text-clay"
        >
          더보기
          <span className="ml-0.5 inline-block transition duration-200 group-hover:translate-x-0.5">
            →
          </span>
        </Link>
      </div>
      <ul className="mt-3 grid grid-cols-4 gap-2.5">
        {picks.map((shoe) => (
          <li key={shoe.id}>
            <Link
              to={`/browse/${shoe.id}`}
              className="group block cursor-pointer transition duration-300 ease-out hover:-translate-y-1"
            >
              <div className="aspect-square overflow-hidden rounded-xl bg-card transition duration-300 group-hover:shadow-[0_10px_22px_-14px_rgba(25,23,19,0.35)]">
                <img
                  src={shoe.imageUrl}
                  alt={`${shoe.brand} ${shoe.name}`}
                  className="size-full object-cover transition duration-500 ease-out group-hover:scale-[1.07]"
                />
              </div>
              <p className="mt-1.5 truncate text-[9px] tracking-[0.04em] text-mist">
                {shoe.brand}
              </p>
              <p className="truncate text-[10px] font-medium leading-tight">
                {shoe.name}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}

function TagBadge({ tag }: { tag: CommunityPost["tag"] }) {
  return (
    <span className="rounded-full bg-white/90 px-2 py-[3px] text-[9px] font-medium tracking-[0.12em] text-clay shadow-[0_1px_3px_rgba(25,23,19,0.12)] backdrop-blur">
      {tag}
    </span>
  )
}

function CommunityPage() {
  const [tag, setTag] = useState<"전체" | "트렌드" | "이슈">("전체")
  const posts =
    tag === "전체"
      ? communityPosts
      : communityPosts.filter((post) => post.tag === tag)

  const [featured, ...rest] = posts

  return (
    <main className={`pb-32 pt-6 ${PAGE}`}>
      <div className="px-4">
        <h1 className="text-[19px] font-semibold tracking-tight">커뮤니티</h1>
        <p className="mt-1 text-[11px] text-mist">요즘 신발 이야기</p>
      </div>

      <div className="no-scrollbar mt-4 flex gap-1.5 overflow-x-auto px-4 pb-1">
        {(["전체", "트렌드", "이슈"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTag(item)}
            className={chipClass(tag === item)}
          >
            {item}
          </button>
        ))}
      </div>

      {featured ? (
        <Link
          to={`/community/${featured.id}`}
          className="group mt-4 block cursor-pointer px-4 transition duration-300 ease-out active:scale-[0.99]"
        >
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-card shadow-[0_1px_2px_rgba(25,23,19,0.04)] transition duration-300 group-hover:shadow-[0_16px_32px_-20px_rgba(25,23,19,0.4)]">
            <img
              src={featured.imageUrl}
              alt=""
              className="size-full object-cover transition duration-700 ease-out group-hover:scale-[1.05]"
            />
            <span className="absolute left-3 top-3">
              <TagBadge tag={featured.tag} />
            </span>
          </div>
          <p className="mt-3 text-[16px] font-semibold leading-snug tracking-tight transition duration-200 group-hover:text-clay">
            {featured.title}
          </p>
          <p className="mt-1.5 text-[11.5px] leading-relaxed text-mist">
            {featured.excerpt}
          </p>
          <p className="mt-2 text-[10px] text-mist/70">{featured.date}</p>
        </Link>
      ) : null}

      {rest.length > 0 ? (
        <ul className="mt-6 divide-y divide-line px-4">
          {rest.map((post) => (
            <li key={post.id}>
              <Link
                to={`/community/${post.id}`}
                className="group flex cursor-pointer items-start gap-3 py-3.5"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-[9px] tracking-[0.12em] text-clay">
                    {post.tag}
                  </span>
                  <span className="mt-1 block text-[13px] font-medium leading-snug transition duration-200 group-hover:text-clay">
                    {post.title}
                  </span>
                  <span className="mt-1.5 block text-[10px] text-mist/70">
                    {post.date}
                  </span>
                </span>
                <span className="size-[60px] shrink-0 overflow-hidden rounded-xl bg-card">
                  <img
                    src={post.imageUrl}
                    alt=""
                    className="size-full object-cover transition duration-500 ease-out group-hover:scale-[1.08]"
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </main>
  )
}

function CommunityDetailPage() {
  const { id } = useParams()
  const post = communityPosts.find((item) => item.id === id)

  if (!post) {
    return (
      <main className={`px-4 pt-6 ${PAGE}`}>
        <Link to="/community" className={BACK_LINK}>
          ← 커뮤니티
        </Link>
        <p className="mt-10 text-[12px] text-mist">없는 글이에요</p>
      </main>
    )
  }

  const more = communityPosts.filter((item) => item.id !== post.id).slice(0, 3)

  return (
    <main className={`pb-32 pt-6 ${PAGE}`}>
      <div className="px-4">
        <Link to="/community" className={BACK_LINK}>
          ← 커뮤니티
        </Link>
      </div>

      <div className="mt-5 px-4">
        <p className="text-[9px] tracking-[0.14em] text-clay">{post.tag}</p>
        <h1 className="mt-2 text-[20px] font-semibold leading-snug tracking-tight">
          {post.title}
        </h1>
        <p className="mt-2 text-[11px] leading-relaxed text-mist">
          {post.excerpt}
        </p>
        <p className="mt-3 text-[10px] tracking-[0.04em] text-mist/70">
          {post.date}
        </p>
      </div>

      <div className="mt-5 aspect-[4/3] overflow-hidden bg-card">
        <img
          src={post.imageUrl}
          alt=""
          className="size-full object-cover"
        />
      </div>

      <p className="mt-6 px-4 text-[13px] leading-[1.9] text-ink/85">
        {post.body}
      </p>

      <div className="mt-9 px-4">
        <h2 className={SECTION_LABEL}>다른 이야기</h2>
        <ul className="mt-2 divide-y divide-line">
          {more.map((item) => (
            <li key={item.id}>
              <Link
                to={`/community/${item.id}`}
                className="group flex cursor-pointer items-center gap-3 py-3"
              >
                <span className="size-11 shrink-0 overflow-hidden rounded-lg bg-card">
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="size-full object-cover transition duration-500 ease-out group-hover:scale-[1.08]"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[9px] tracking-[0.12em] text-clay">
                    {item.tag}
                  </span>
                  <span className="mt-0.5 block truncate text-[12px] font-medium transition duration-200 group-hover:text-clay">
                    {item.title}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}

function TabBar() {
  const location = useLocation()
  const hidden =
    location.pathname.startsWith("/add") ||
    location.pathname.startsWith("/shoes/")

  if (hidden) return null

  return (
    <nav className="fixed bottom-0 left-1/2 z-20 w-full max-w-[430px] -translate-x-1/2 border-t border-line bg-night/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
      <ul className="grid h-14 grid-cols-5">
        <TabItem to="/" label="홈" end>
          <HomeIcon />
        </TabItem>
        <TabItem to="/community" label="커뮤니티">
          <CommunityIcon />
        </TabItem>
        <TabItem to="/closet" label="신발장">
          <ClosetIcon />
        </TabItem>
        <TabItem to="/search" label="검색">
          <SearchIcon />
        </TabItem>
        <TabItem to="/account" label="계정">
          <AccountIcon />
        </TabItem>
      </ul>
    </nav>
  )
}

function TabItem({
  to,
  label,
  end,
  children,
}: {
  to: string
  label: string
  end?: boolean
  children: ReactNode
}) {
  return (
    <li>
      <NavLink
        to={to}
        end={end}
        className={({ isActive }) =>
          `relative flex h-full cursor-pointer flex-col items-center justify-center gap-1 text-[9px] tracking-[0.04em] transition duration-200 ease-out active:scale-95 ${
            isActive ? "text-ink" : "text-mist hover:text-ink"
          }`
        }
      >
        {({ isActive }) => (
          <>
            <span
              className={`absolute top-1.5 size-1 rounded-full bg-clay transition duration-300 ease-out ${
                isActive ? "scale-100 opacity-100" : "scale-0 opacity-0"
              }`}
            />
            {children}
            <span>{label}</span>
          </>
        )}
      </NavLink>
    </li>
  )
}

function CameraAddPage() {
  const navigate = useNavigate()
  const [preview, setPreview] = useState("")
  const [name, setName] = useState("")
  const [brand, setBrand] = useState("")
  const [memo, setMemo] = useState("")

  function onFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPreview(String(reader.result))
    reader.readAsDataURL(file)
  }

  function save() {
    if (!preview) return
    addShoe({
      id: crypto.randomUUID(),
      name: name.trim() || "새 신발",
      brand: brand.trim() || "Brand",
      imageUrl: preview,
      price: 0,
      addedAt: Date.now(),
      memo: memo.trim() || undefined,
    })
    navigate("/closet")
  }

  return (
    <main className={`px-4 pb-10 pt-6 ${PAGE}`}>
      <Link to="/closet" className={BACK_LINK}>
        ← 취소
      </Link>
      <div className="mt-5">
        <h1 className="text-[18px] font-semibold tracking-tight">카메라로 추가</h1>
        <p className="mt-1 text-[11px] text-mist">사진을 찍거나 골라 넣으세요</p>
      </div>
      <label className="mt-5 flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-line bg-white/60 transition duration-200 ease-out hover:border-clay/40 hover:bg-white active:scale-[0.99]">
        {preview ? (
          <img src={preview} alt="" className="size-full object-cover" />
        ) : (
          <span className="text-[11px] tracking-[0.06em] text-mist">사진 찍기</span>
        )}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onFile}
          className="sr-only"
        />
      </label>
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="이름"
        className={`mt-4 ${FIELD}`}
      />
      <input
        value={brand}
        onChange={(event) => setBrand(event.target.value)}
        placeholder="브랜드"
        className={`mt-2 ${FIELD}`}
      />
      <textarea
        value={memo}
        onChange={(event) => setMemo(event.target.value)}
        rows={2}
        maxLength={120}
        placeholder="기록 (어디서 신었는지, 왜 골랐는지)"
        className={`mt-2 resize-none leading-relaxed ${FIELD}`}
      />
      <button
        type="button"
        onClick={save}
        disabled={!preview}
        className="mt-5 w-full cursor-pointer rounded-xl bg-ink py-3 text-[12.5px] font-medium tracking-[0.04em] text-white shadow-[0_6px_18px_-8px_rgba(25,23,19,0.5)] transition duration-200 ease-out hover:shadow-[0_10px_24px_-10px_rgba(25,23,19,0.55)] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-line disabled:text-mist disabled:shadow-none"
      >
        넣기
      </button>
    </main>
  )
}

function ManualAddPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState("")
  const keyword = query.trim().toLowerCase()
  const filtered = useMemo(
    () =>
      keyword
        ? marketShoes.filter(
            (shoe) =>
              shoe.name.toLowerCase().includes(keyword) ||
              shoe.brand.toLowerCase().includes(keyword),
          )
        : marketShoes,
    [keyword],
  )

  function pick(shoe: MarketShoe) {
    addShoe({
      id: crypto.randomUUID(),
      name: shoe.name,
      brand: shoe.brand,
      imageUrl: shoe.imageUrl,
      price: shoe.price,
      addedAt: Date.now(),
    })
    navigate("/closet")
  }

  return (
    <main className={`px-4 pb-10 pt-6 ${PAGE}`}>
      <Link to="/closet" className={BACK_LINK}>
        ← 취소
      </Link>
      <div className="mt-5">
        <h1 className="text-[18px] font-semibold tracking-tight">직접 추가</h1>
        <p className="mt-1 text-[11px] text-mist">이름이나 브랜드로 찾아 넣으세요</p>
      </div>
      <label className="mt-4 block">
        <span className="sr-only">신발 검색</span>
        <input
          type="search"
          value={query}
          autoFocus
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Nike, Dunk, Samba..."
          className={FIELD}
        />
      </label>
      {filtered.length === 0 ? (
        <p className="mt-20 text-center text-[12px] text-mist">아직 없는 모델이에요</p>
      ) : (
        <ul className="mt-3 divide-y divide-line">
          {filtered.map((shoe) => (
            <li key={shoe.id}>
              <button
                type="button"
                onClick={() => pick(shoe)}
                className="group flex w-full cursor-pointer items-center gap-3 rounded-lg px-1.5 py-2.5 text-left transition duration-200 hover:bg-card"
              >
                <span className="size-12 shrink-0 overflow-hidden rounded-lg bg-card">
                  <img
                    src={shoe.imageUrl}
                    alt=""
                    className="size-full object-cover transition duration-500 ease-out group-hover:scale-[1.07]"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12px] font-medium">
                    {shoe.name}
                  </span>
                  <span className="mt-0.5 block truncate text-[10px] tracking-[0.04em] text-mist">
                    {shoe.brand}
                  </span>
                </span>
                <span className="shrink-0 text-[11px] text-mist opacity-0 transition duration-200 group-hover:opacity-100 group-hover:text-clay">
                  담기
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

function isSameDay(a: number, b: number) {
  const left = new Date(a)
  const right = new Date(b)
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  )
}

function formatDay(time: number) {
  return new Date(time).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function DetailPage() {
  const { id } = useParams()
  const [shoe, setShoe] = useState(() =>
    loadShoes().find((item) => item.id === id),
  )
  const [memo, setMemo] = useState(shoe?.memo ?? "")
  const [editingMemo, setEditingMemo] = useState(false)
  const memoRef = useRef<HTMLTextAreaElement>(null)

  if (!shoe) {
    return (
      <main className={`px-4 pt-6 ${PAGE}`}>
        <Link to="/closet" className={BACK_LINK}>
          ← 신발장
        </Link>
        <p className="mt-10 text-[12px] text-mist">없는 신발이에요</p>
      </main>
    )
  }

  const wornCount = shoe.wornCount ?? 0
  const wornToday =
    shoe.lastWornAt !== undefined && isSameDay(shoe.lastWornAt, Date.now())

  function patch(changes: Partial<Shoe>) {
    const next = updateShoe(shoe!.id, changes)
    setShoe(next.find((item) => item.id === shoe!.id))
  }

  function startMemo() {
    setEditingMemo(true)
    requestAnimationFrame(() => memoRef.current?.focus())
  }

  function saveMemo() {
    setEditingMemo(false)
    const trimmed = memo.trim()
    if (trimmed === (shoe!.memo ?? "")) return
    patch({ memo: trimmed })
  }

  function wearToday() {
    if (wornToday) return
    patch({ wornCount: wornCount + 1, lastWornAt: Date.now() })
  }

  return (
    <main className={`pb-20 ${PAGE}`}>
      <div className="px-4 pt-6">
        <Link to="/closet" className={BACK_LINK}>
          ← 신발장
        </Link>
      </div>
      <div className="mt-4 aspect-square overflow-hidden bg-card">
        <img
          src={shoe.imageUrl}
          alt={`${shoe.brand} ${shoe.name}`}
          className="size-full object-cover"
        />
      </div>
      <div className="px-4 pt-6">
        <p className="text-[10px] tracking-[0.14em] text-mist">{shoe.brand}</p>
        <h1 className="mt-1.5 text-[18px] font-semibold leading-snug tracking-tight">
          {shoe.name}
        </h1>
        {shoe.price > 0 ? (
          <p className="mt-2 text-[15px] font-medium tabular-nums text-clay">
            {formatPrice(shoe.price)}
          </p>
        ) : null}
      </div>

      <section className="mt-6 px-4">
        <div className="flex items-baseline justify-between">
          <h2 className={SECTION_LABEL}>기록</h2>
          {shoe.memo || editingMemo ? (
            <button
              type="button"
              onClick={editingMemo ? saveMemo : startMemo}
              className="cursor-pointer rounded-full px-2 py-1 text-[10px] text-mist transition duration-150 hover:bg-card hover:text-clay active:scale-95"
            >
              {editingMemo ? "저장" : "고치기"}
            </button>
          ) : null}
        </div>
        {editingMemo ? (
          <textarea
            ref={memoRef}
            value={memo}
            onChange={(event) => setMemo(event.target.value)}
            onBlur={saveMemo}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault()
                event.currentTarget.blur()
              }
              if (event.key === "Escape") {
                setMemo(shoe!.memo ?? "")
                setEditingMemo(false)
              }
            }}
            rows={2}
            maxLength={120}
            placeholder="어디서 신었는지, 왜 골랐는지 적어 두세요"
            className={`mt-2 resize-none leading-relaxed ${FIELD}`}
          />
        ) : shoe.memo ? (
          <p className="mt-2 whitespace-pre-line text-[12.5px] leading-[1.8] text-ink/85">
            {shoe.memo}
          </p>
        ) : (
          <button
            type="button"
            onClick={startMemo}
            className="mt-2 w-full cursor-pointer rounded-xl border border-dashed border-line bg-white/50 py-3 text-[11px] text-mist transition duration-200 ease-out hover:border-clay/40 hover:bg-white hover:text-clay active:scale-[0.99]"
          >
            이 신발의 첫 기록을 남겨보세요
          </button>
        )}
      </section>

      <section className="mt-6 px-4">
        <h2 className={SECTION_LABEL}>착용</h2>
        <div className={`mt-2 flex items-center gap-3 px-4 py-3.5 ${CARD}`}>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium">
              {wornCount > 0 ? `${wornCount}번 신었어요` : "아직 안 신었어요"}
            </p>
            <p className="mt-1 text-[10px] text-mist">
              {shoe.lastWornAt !== undefined
                ? `마지막 ${formatDay(shoe.lastWornAt)}`
                : "신은 날을 기록해두면 쌓입니다"}
            </p>
          </div>
          <button
            type="button"
            onClick={wearToday}
            disabled={wornToday}
            className={`shrink-0 cursor-pointer rounded-full px-3 py-1.5 text-[11px] font-medium transition duration-200 ease-out active:scale-95 ${
              wornToday
                ? "cursor-default bg-clay-soft text-clay"
                : "bg-ink text-white shadow-[0_4px_12px_-4px_rgba(25,23,19,0.45)]"
            }`}
          >
            {wornToday ? "오늘 신었어요" : "오늘 신기"}
          </button>
        </div>
      </section>

      <p className="mt-6 px-4 text-[11px] text-mist">
        {formatDay(shoe.addedAt)}에 담았어요
      </p>
    </main>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="mx-auto min-h-dvh w-full max-w-[430px] bg-night">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/community/:id" element={<CommunityDetailPage />} />
          <Route path="/closet" element={<ClosetPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/browse/:id" element={<BrowseDetailPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/add/camera" element={<CameraAddPage />} />
          <Route path="/add/search" element={<ManualAddPage />} />
          <Route path="/add" element={<Navigate to="/closet" replace />} />
          <Route path="/shoes/:id" element={<DetailPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <TabBar />
      </div>
    </BrowserRouter>
  )
}
