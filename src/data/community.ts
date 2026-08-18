export type CommunityPost = {
  id: string
  tag: "트렌드" | "이슈"
  title: string
  excerpt: string
  body: string
  date: string
  imageUrl: string
}

export const communityPosts: CommunityPost[] = [
  {
    id: "c1",
    tag: "트렌드",
    title: "올여름, 샌달이 스니커즈를 이겼다",
    excerpt: "버켄스탁과 테바가 도심 스트릿의 기본값이 된 이유.",
    body: "올해 더위가 길어지면서 스니커즈 대신 샌달을 신는 사람이 눈에 띄게 늘었습니다. 버켄스탁 아리조나는 여전히 기본이고, 테바 허리케인은 아웃도어를 거리로 끌어온 대표 실루엣입니다. 정돈된 옷차림에도 열린 신발이 자연스럽게 섞이는 여름입니다.",
    date: "2026.08.12",
    imageUrl:
      "https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "c2",
    tag: "이슈",
    title: "리셀 시장이 식고 있다",
    excerpt: "한정판도 정가 아래로 떨어지는 모델이 늘고 있습니다.",
    body: "한동안 신발을 사두면 오른다는 분위기가 강했는데, 요즘은 다릅니다. 인기 모델도 출시 직후 프리미엄이 빠르게 빠지고, 정가보다 낮게 거래되는 경우가 흔합니다. 신발을 신으려고 사는 사람과 시세를 보던 사람의 온도 차가 커진 시점입니다.",
    date: "2026.08.08",
    imageUrl:
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "c3",
    tag: "트렌드",
    title: "뉴발란스 1906R이 거리의 기본이 된 이유",
    excerpt: "530 다음은 역시 메쉬와 실버.",
    body: "530이 자리를 잡은 뒤, 조금 더 기술적으로 보이는 1906R로 관심이 옮아갔습니다. 은색 포인트와 가벼운 착화감이 데일리와 잘 맞습니다. 과하지 않으면서도 존재감이 있어, 요즘 옷장에 한 켤레씩 들어가고 있습니다.",
    date: "2026.08.03",
    imageUrl:
      "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "c4",
    tag: "이슈",
    title: "아식스 젤 시리즈, 다시 러닝 밖으로",
    excerpt: "Kayano 14와 1130이 패션 아이템으로 읽히는 풍경.",
    body: "러닝화로 출발한 젤 실루엣이 다시 스트릿으로 나왔습니다. 투박한 아웃솔과 투명한 젤이 오히려 포인트가 됩니다. 달리려고 산 사람과 어울리려고 산 사람이 같은 모델을 신는 장면이 자주 보입니다.",
    date: "2026.07.28",
    imageUrl:
      "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "c5",
    tag: "트렌드",
    title: "삼바와 가젤, 아직 안 죽었다",
    excerpt: "유행이 지나갔다는 말과 달리 거리는 여전히 아디다스.",
    body: "유행이 끝났다는 이야기가 나온 지 오래지만, 삼바와 가젤은 여전히 많이 보입니다. 색만 바뀌었을 뿐 실루엣은 그대로입니다. 기본에 가까운 신발일수록 오래 남는다는 걸 다시 보여주는 모델입니다.",
    date: "2026.07.21",
    imageUrl:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "c6",
    tag: "이슈",
    title: "온츠카 타이거가 다시 소환된 계절",
    excerpt: "멕시코 66이 슬림한 실루엣 취향을 건드렸다.",
    body: "두꺼운 러너가 익숙해진 뒤에, 얇고 긴 실루엣이 다시 눈에 들어옵니다. 온츠카 타이거 멕시코 66은 그 중심에 있습니다. 레트로이지만 가볍고, 청바지에도 슬랙스에도 잘 붙습니다.",
    date: "2026.07.14",
    imageUrl:
      "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=1200&q=80",
  },
]
