# 이 폴더의 그림들

| 파일 | 쓰이는 곳 | 만든 것 |
|---|---|---|
| `dj-{idle,talk,dig,play}.webp` | 무대의 DJ 니키 | **ChatGPT `gpt-image-2`** (Grok 키 없음·비교 시 OpenAI 우위) → `.art-work/make_dj_art_v2.mjs` |
| `promo.jpg` / `promo-banner.jpg` / `promo-square.jpg` | 홍보·OG | 클럽 배경(gpt-image-2) + 니키 합성 |
| `wall-stone.webp` | 벽과 바 카운터 둘레의 돌결 | soft-light 텍스처 |
| `hearth-*.webp` | **미사용 (레거시)** — 예전 난로·간식. UI 는 CSS/SVG 네온·바이닐·칵테일 잔으로 대체 | `tools/gen_hearth_art.mjs` 등 |

바 카운터의 네온 튜브·바이닐·셰이커·잔은 **CSS/SVG** 입니다. 머무는 곳에 따라
`--flame` / `--metal` / `--drink-*` 가 같이 변해야 해서 그림으로 박지 않았습니다.

**CSS/SVG 로 남겨 둔 것** — 네온 튜브, 바이닐, 칵테일 잔·조율 UI, 그리고
선반 위의 물건들(등불·열쇠·오르골 — `index.html` 안 인라인 SVG).

예전 난로 파이프라인은 `tools/gen_hearth_art.mjs` / `make_hearth_art.mjs` 에 남아 있으나
재생기는 더 이상 `hearth-*.webp` 를 참조하지 않습니다.
---

# DJ 니키 그림 갈아 끼우기

지금 무대에 서는 것은 **이 폴더의 그림 넉 장**입니다 (`source: 'image'`).
파일이 아직 없으면 `character.js` 의 `guardBardArt` 가 SVG 폴백으로 대신 세웁니다.

다른 그림이나 영상으로 바꾸려면 여기에 파일을 넣고
`assets/js/character.js` 맨 위의 `ART.source` 만 바꾸면 됩니다.

```js
export const ART = {
  source: 'image',   // 'svg' | 'image' | 'video'
  images: {
    idle: 'assets/art/dj-idle.webp',
    talk: 'assets/art/dj-talk.webp',
    dig:  'assets/art/dj-dig.webp',
    play: 'assets/art/dj-play.webp',
  },
};
```

`'svg'` 로 돌리면 벡터 치비 DJ(헤드폰·턴테이블)로 돌아갑니다.

---

## 1. 그림 넉 장으로 (`source: 'image'`)

| 파일 | 언제 보이나 |
|---|---|
| `dj-idle.webp` | 가만히 있을 때 (기본) |
| `dj-talk.webp` | 말할 때 — 입을 벌린 모습 |
| `dj-dig.webp`  | 곡을 고르는 중 — 크레이트/레코드를 뒤적임 |
| `dj-play.webp` | 연주 중 — 헤드폰·턴테이블에 손 |

없는 상태는 `dj-idle` 로 대신합니다.

### 규격

- **비율 240 × 260** (세로가 조금 김)
- **권장 크기 720 × 780**
- **배경은 반드시 투명** (PNG 또는 WebP)
- **형식은 WebP 권장.** 한 장 200KB 이하
- **넉 장의 얼굴이 같은 자리에 같은 크기로** — 전환은 투명도만 바꿈

### 구도

- 양옆 6% 정도 여백
- 아래쪽은 흘려보냄 (턴테이블/손이 무대 아래로)
- `tools/make_bard_art.mjs` 가 턱선 기준으로 정렬합니다 (파일명만 `idle-raw.png` … 로 두면 됨)

---

## 2. 짧은 영상으로 (`source: 'video'`)

```
assets/art/dj.webm       반복 재생할 영상
assets/art/dj-idle.webp  첫 프레임
```

소리 없이, 3~6초 루프, WebM 권장, 2MB 이하.

---

## 모델 결정 (니키)

**ChatGPT / OpenAI `gpt-image-2` 를 쓴다.**
- Grok(xAI) API 키는 환경에 없어 동일 조건 비교가 불가했다.
- 같은 프롬프트로 Cursor 내장 이미지 생성과도 비교했고, OpenAI idle 이 윙팁·색소폰 디테일·일관된 셀 셰이딩에서 앞섰다.
- `talk`/`dig`/`play` 는 idle 을 `images/edits` 레퍼런스로 넘겨 인물 일관성을 맞췄다.
- 정렬은 턱선보다 **머리(베레모) 상단 앵커** (`make_dj_art_v2.mjs`) — 풀바디 치비 + dig(눈 감음)에서 더 안정적.

요령:

1. `idle` 을 먼저 뽑고, `talk` · `dig` · `play` 는 그 결과를 레퍼런스로 "같은 인물·같은 옷·같은 화풍, 표정·손만 바꿔라"
2. 배경은 흰색으로 받아 `make_bard_art.mjs` 로 파낸다 (투명 배경 모델이 아니면)
3. 캐릭터: 치비 DJ **니키** — 베레모(금 음표 핀), 크림 터틀넥·네이비 재킷·블랙 타이, 금색 알토 색소폰, 흑백 윙팁. 판타지 바드·류트는 쓰지 않는다.

상태별 힌트:

- idle — 입을 다물고 잔잔히 웃으며 가만히
- talk — 입을 벌리고 말하는, 눈썹을 살짝 올리고
- dig  — 레코드/크레이트를 들고 눈 감고 갸웃
- play — 색소폰을 입에 대고 연주, 눈이 반짝

---

## 알아 둘 점

**색이 따라 변하지 않습니다.** SVG 폴백은 CSS 변수를 참조해 머무는 곳과 곡 분위기를 따라 바뀝니다.
그림으로 바꾸면 그 색은 고정됩니다. 일곱 장소와 맞추려면 **중간색(갈색·네이비·베이지)** 로 그리는 편이 무난합니다.

## 2026-09-07 수정 (이슈 #9)

- **다리 겹침**: CSS에서 idle 을 항상 `opacity:1` 로 깔아 두던 버그 수정 + 풀바디 다리 아티팩트를 피하려고 **허리 위 크롭**으로 맞춤 (원본 rpg 바드와 같은 무대 구도).
- **흰 테두리**: 가장자리 flood + 닫힌 흰 구멍 제거 + 가장자리 despill 3회.
- 모닥불 `hearth-*.webp` 는 UI에서 제거. 바는 네온·바이닐·칵테일(CSS/SVG).

## 홍보 배너

| 파일 | 크기 | 용도 |
|---|---|---|
| `promo.jpg` | 1600×1000 | OG/Twitter 카드 (`index.html` og:image) |
| `promo-banner.jpg` | 1920×640 | 와이드 배너 |
| `promo-square.jpg` | 1200×1200 | 정사각 SNS |

URL `https://progh2.github.io/jazz-bgm-dj/` 를 배너에 넣었다. 재생성은 `.art-work/promo/` 작업물 + ImageMagick 합성.
