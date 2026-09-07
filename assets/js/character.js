// character.js — 무대에 선 DJ.
//
// ┌──────────────────────────────────────────────────────────────────────────┐
// │ 그림을 갈아 끼우는 곳                                                    │
// │                                                                          │
// │ ART.source 만 바꾸면 된다. 세 가지를 받는다.                             │
// │                                                                          │
// │   'svg'    아래 bardSvg() — 색이 장소·분위기를 따라간다.                 │
// │   'image'  상태별 그림 네 장 (idle / talk / dig / play)                  │
// │   'video'  짧은 반복 영상 한 편                                          │
// │                                                                          │
// │ 어느 쪽이든 바깥 요소에 data-state 가 붙는다: idle | talk | dig | play   │
// │ 그림 규격과 넣는 방법은 assets/art/README.md 에 적어 두었다.             │
// └──────────────────────────────────────────────────────────────────────────┘

export const BARD_NAME = 'DJ 니키';
export const BARD_SHORT = '니키';

export const ART = {
  /** 'svg' | 'image' | 'video' */
  source: 'image',

  /** source: 'image' 일 때 — 상태별 그림. 파일이 없는 상태는 idle 로 대신한다. */
  images: {
    idle: 'assets/art/dj-idle.webp',
    talk: 'assets/art/dj-talk.webp',
    dig:  'assets/art/dj-dig.webp',
    play: 'assets/art/dj-play.webp',
  },

  /** source: 'video' 일 때 — 반복 재생할 짧은 영상. */
  video: {
    src: 'assets/art/dj.webm',
    poster: 'assets/art/dj-idle.webp',
    /** 연주 중이 아닐 때 영상을 세워 둘지. 배터리를 아끼려면 true. */
    pauseWhenIdle: true,
  },
};

const INK = '#241a12';

/* ────────────────────────────────────────────────────────────── SVG 그림 */

function bardSvg() {
  return `
<svg class="bard-art" viewBox="0 0 240 260" role="img" aria-label="무대에 선 ${BARD_NAME}">
  <defs>
    <radialGradient id="bdGlow" cx="50%" cy="42%" r="60%">
      <stop offset="0%"   stop-color="var(--accent-glow)" stop-opacity=".45"/>
      <stop offset="62%"  stop-color="var(--accent)"      stop-opacity=".13"/>
      <stop offset="100%" stop-color="var(--accent)"      stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="bdHair" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="var(--accent-glow)"/>
      <stop offset="58%"  stop-color="var(--accent)"/>
      <stop offset="100%" stop-color="var(--ember)"/>
    </linearGradient>
    <linearGradient id="bdCloak" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="var(--wood-light)"/>
      <stop offset="100%" stop-color="var(--wood-dark)"/>
    </linearGradient>
    <linearGradient id="bdLute" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%"   stop-color="var(--wood-light)"/>
      <stop offset="100%" stop-color="var(--wood)"/>
    </linearGradient>
  </defs>

  <ellipse class="bd-glow" cx="120" cy="112" rx="104" ry="98" fill="url(#bdGlow)"/>

  <!-- 뒷머리 -->
  <path d="M62 96c0 34 6 50 12 60h92c6-10 12-26 12-60-14 10-34 15-58 15s-44-5-58-15z"
        fill="url(#bdHair)" stroke="${INK}" stroke-width="3.6" stroke-linejoin="round"/>

  <g class="bd-neck">
    <path d="M108 138v18c0 7 24 7 24 0v-18z" fill="#e8c4a4" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/>
    <path d="M108 138v9c5 5 19 5 24 0v-9z" fill="${INK}" opacity=".22"/>
  </g>

  <!-- 몸 — 재킷 -->
  <g class="bd-body">
    <path d="M120 156c-30 0-50 15-56 34-3 9-4 18-4 26h120c0-8-1-17-4-26-6-19-26-34-56-34z"
          fill="url(#bdCloak)" stroke="${INK}" stroke-width="3.6" stroke-linejoin="round"/>
    <path d="M94 160c-9 5-15 13-17 22 9-6 19-9 28-10zM146 160c9 5 15 13 17 22-9-6-19-9-28-10z"
          fill="var(--accent)" stroke="${INK}" stroke-width="3" stroke-linejoin="round" opacity=".9"/>
    <circle cx="120" cy="171" r="6.5" fill="var(--metal)" stroke="${INK}" stroke-width="2.6"/>
    <circle cx="120" cy="171" r="2" fill="${INK}" opacity=".5"/>
  </g>

  <g class="bd-head">
    <ellipse cx="120" cy="106" rx="52" ry="48" fill="#fbe3cb" stroke="${INK}" stroke-width="3.6"/>

    <path d="M68 100c0-32 23-52 52-52s52 20 52 52c-5-16-13-25-22-27-4 9-11 14-17 14-6 0-12-5-16-14-9 9-30 16-49 27z"
          fill="url(#bdHair)" stroke="${INK}" stroke-width="3.6" stroke-linejoin="round"/>
    <path d="M70 100c-4 14-4 28-1 40 3-12 6-22 9-30z" fill="url(#bdHair)" stroke="${INK}" stroke-width="3"/>
    <path d="M170 100c4 14 4 28 1 40-3-12-6-22-9-30z" fill="url(#bdHair)" stroke="${INK}" stroke-width="3"/>

    <ellipse class="bd-blush" cx="88"  cy="122" rx="12" ry="7" fill="#f0968f" opacity=".55"/>
    <ellipse class="bd-blush" cx="152" cy="122" rx="12" ry="7" fill="#f0968f" opacity=".55"/>

    <g class="bd-eyes">
      <ellipse cx="99"  cy="110" rx="12"  ry="14" fill="${INK}"/>
      <ellipse cx="141" cy="110" rx="12"  ry="14" fill="${INK}"/>
      <ellipse cx="99"  cy="113" rx="8.6" ry="10" fill="var(--accent)"/>
      <ellipse cx="141" cy="113" rx="8.6" ry="10" fill="var(--accent)"/>
      <circle cx="103" cy="105" r="4.4" fill="#fff"/>
      <circle cx="145" cy="105" r="4.4" fill="#fff"/>
      <circle cx="94"  cy="117" r="2.4" fill="#fff" opacity=".9"/>
      <circle cx="136" cy="117" r="2.4" fill="#fff" opacity=".9"/>
    </g>
    <g class="bd-eyes-closed">
      <path d="M88 110q11 -11 22 0"  stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M130 110q11 -11 22 0" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/>
    </g>

    <path d="M88 90q11 -6 21 -1"  stroke="${INK}" stroke-width="2.8" fill="none" stroke-linecap="round" opacity=".65"/>
    <path d="M131 89q11 -5 21 1"  stroke="${INK}" stroke-width="2.8" fill="none" stroke-linecap="round" opacity=".65"/>

    <path class="bd-mouth" d="M114 132q6 6 12 0" stroke="#9c5a52" stroke-width="3.2" fill="none" stroke-linecap="round"/>
  </g>

  <!-- 헤드폰 -->
  <g class="bd-hat">
    <path d="M70 88c0-28 22-46 50-46s50 18 50 46" fill="none" stroke="var(--wood-dark)" stroke-width="10" stroke-linecap="round"/>
    <ellipse cx="68" cy="108" rx="14" ry="18" fill="var(--wood)" stroke="${INK}" stroke-width="3"/>
    <ellipse cx="172" cy="108" rx="14" ry="18" fill="var(--wood)" stroke="${INK}" stroke-width="3"/>
    <path d="M72 50q48 10 96 0" stroke="var(--accent)" stroke-width="5" fill="none" opacity=".8"/>
  </g>

  <!-- 턴테이블 (SVG 폴백용) -->
  <g class="bd-lute">
    <ellipse cx="152" cy="208" rx="38" ry="30" fill="url(#bdLute)" stroke="${INK}" stroke-width="3.4"/>
    <circle cx="152" cy="208" r="18" fill="var(--wood-dark)" stroke="${INK}" stroke-width="2.6"/>
    <circle cx="152" cy="208" r="4" fill="var(--metal)" stroke="${INK}" stroke-width="2"/>
    <path d="M120 194 72 178l6-10 48 20z" fill="url(#bdLute)" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/>
    <g class="bd-hand">
      <circle cx="152" cy="224" r="10" fill="#fbe3cb" stroke="${INK}" stroke-width="3"/>
    </g>
  </g>

  <g class="bd-notes" aria-hidden="true">
    <g class="bd-note bd-note-1"><path d="M0 0v-15l9-2v15" stroke="var(--accent-glow)" stroke-width="2.6" fill="none"/><ellipse cx="-3" cy="0" rx="4.4" ry="3.3" fill="var(--accent-glow)"/></g>
    <g class="bd-note bd-note-2"><path d="M0 0v-13l8-2v13" stroke="var(--accent)"      stroke-width="2.6" fill="none"/><ellipse cx="-2.7" cy="0" rx="4" ry="3" fill="var(--accent)"/></g>
    <g class="bd-note bd-note-3"><path d="M0 0v-17l10-2v17" stroke="var(--accent-glow)" stroke-width="2.6" fill="none"/><ellipse cx="-3.2" cy="0" rx="4.6" ry="3.5" fill="var(--accent-glow)"/></g>
  </g>
</svg>`;
}

/* ──────────────────────────────────────────────────── 그림 / 영상으로 갈 때 */

function bardImages() {
  const imgs = ['idle', 'talk', 'dig', 'play']
    .map((s) => `<img class="bard-img" data-for="${s}" src="${ART.images[s] || ART.images.idle}"
                      alt="" loading="eager" decoding="async" draggable="false">`)
    .join('\n    ');
  return `<div class="bard-art bard-art-image" role="img" aria-label="무대에 선 ${BARD_NAME}">
    ${imgs}
    <span class="bard-notes" aria-hidden="true"><i></i><i></i><i></i></span>
  </div>`;
}

function bardVideo() {
  const { src, poster } = ART.video;
  const ext = String(src).split('.').pop().toLowerCase();
  const type = ext === 'webm' ? 'video/webm' : ext === 'mp4' ? 'video/mp4' : '';
  return `<div class="bard-art bard-art-video" role="img" aria-label="무대에 선 ${BARD_NAME}">
    <video class="bard-vid" autoplay loop muted playsinline
           ${poster ? `poster="${poster}"` : ''} aria-hidden="true">
      <source src="${src}"${type ? ` type="${type}"` : ''}>
    </video>
    <span class="bard-notes" aria-hidden="true"><i></i><i></i><i></i></span>
  </div>`;
}

/**
 * 그림이 안 오면 그려 둔 SVG DJ 가 대신 선다.
 * 넷 중 idle 이 안 오면 통째로 SVG 로 갈고, 다른 상태 그림만 안 오면
 * 그 상태를 idle 로 때운다.
 */
export function guardBardArt(root) {
  if (!root || ART.source !== 'image') return;
  let fell = false;
  for (const img of root.querySelectorAll('.bard-img')) {
    img.addEventListener('error', () => {
      if (fell) return;
      if (img.dataset.for === 'idle') {
        fell = true;
        root.innerHTML = bardSvg();
      } else {
        img.src = ART.images.idle;
      }
    }, { once: true });
  }
}

/** 무대에 넣을 내용을 돌려준다. */
export function bardArt() {
  if (ART.source === 'image') return bardImages();
  if (ART.source === 'video') return bardVideo();
  return bardSvg();
}

/** DJ 상태를 바꾼다. state: idle | talk | dig | play */
export function setBardState(root, state) {
  if (!root) return;
  root.dataset.state = state;

  if (ART.source === 'video' && ART.video.pauseWhenIdle) {
    const v = root.querySelector('.bard-vid');
    if (!v) return;
    if (state === 'play' || state === 'talk') v.play?.().catch(() => {});
    else v.pause?.();
  }
}
