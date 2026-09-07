# 이 폴더의 그림들

| 파일 | 쓰이는 곳 | 만든 것 |
|---|---|---|
| `dj-{idle,talk,dig,play}.webp` | 무대의 DJ 니키 | **ChatGPT `gpt-image-2`** (Grok 키 없음·비교 시 OpenAI 우위) → `.art-work/make_dj_art_v2.mjs` |
| `hearth-{skewer,pig,marshmallow,fish}.webp` | 걸이대에 봉으로 걸리는 것들 | `gpt-image-2` → `tools/make_hearth_art.mjs` |
| `hearth-cauldron.webp` | S자 고리로 가로대에 매달리는 냄비(펀치) | 〃 |
| `hearth-corn.webp` | 잉걸 위의 간식 (제 잿더미 포함) | 〃 |
| `hearth-flame-{a,b,c}.webp` | 불꽃 세 모양 — 곧게 솟는 것·부푸는 것·눕는 것 | 〃 |
| `hearth-logs.webp` · `hearth-embers.webp` | 장작 더미와 잉걸 바닥 | 〃 |
| `wall-stone.webp` | 벽과 바 난로 둘레의 돌결 | 〃 |

난로 쪽 **프롬프트는 `tools/gen_hearth_art.mjs` 에 그대로** 들어 있습니다.
`OPENAI_API_KEY` 를 두고 `cd .art-work && node ../tools/gen_hearth_art.mjs [이름…]`
으로 그 장만 다시 뽑을 수 있습니다. 뽑힌 raw-*.png 는
`tools/make_hearth_art.mjs` 가 다듬어 이 폴더에 넣습니다.

**CSS/SVG 로 남겨 둔 것** — 꼬치걸이대, 불씨, 냄비 거품, 불꽃의 흔들림, 그리고
맨틀 위의 물건들(등불·열쇠·오르골 — `index.html` 안 인라인 SVG). 머무는 곳에 따라
쇠 빛과 불빛이 같이 변해야 하는 것들이라, 그림으로 박아 두면 일곱 곳 중 여섯 곳에서 겉돕니다.

**크기는 그림이 아니라 CSS 가 정합니다.** `tavern.css` 의 `--dish-w` 를 보세요.

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
