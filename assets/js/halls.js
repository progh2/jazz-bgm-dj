// halls.js — 머무는 곳 7군데.
//
// 앞선 재생기의 '스킨'에 해당한다. 다만 바뀌는 것은 창틀이 아니라 **장소**다.
// 기둥에 쓴 나무, 벽을 쌓은 돌, 쇠장식과 나무 팻말의 색이 함께 움직인다.
// 장소가 가구의 성격을 정하고, 분위기(moods.js)가 그 위에 얹히는 불빛 색을 정한다.

export const HALLS = {
  midnight_lounge: {
    label: '미드나잇 라운지',
    note: '네이비 벨벳과 호박빛. 낮은 조명, 속삭이듯',
    vars: {
      '--wood':       '#3a2e22',
      '--wood-light': '#7a6248',
      '--wood-dark':  '#1a1410',
      '--stone':      '#2a3344',
      '--stone-dark': '#151c28',
      '--metal':      '#d4a84b',
      '--metal-dark': '#6e5320',
      '--sign-bg':    '#1e2430',
      '--sign-ink':   '#f0d9a0',
      '--sign-dim':   '#a88850',
      '--beam':       'linear-gradient(180deg, #4a3a28, #1a1410)',
      '--text':       '#f2e8d4',
      '--text-dim':   '#b8a890',
      '--page-bg':    '#121820',
      '--flame':      '#ffb445',
      '--flame-low':  '#c25a12',
    },
  },
  speakeasy: {
    label: '스피크이지',
    note: '벽돌과 촛불. 금지된 밤의 흥흥',
    vars: {
      '--wood':       '#4a2c1e',
      '--wood-light': '#8a5538',
      '--wood-dark':  '#24140e',
      '--stone':      '#6a3e32',
      '--stone-dark': '#3a221c',
      '--metal':      '#c9a056',
      '--metal-dark': '#6a4e22',
      '--sign-bg':    '#3a2418',
      '--sign-ink':   '#f0c98c',
      '--sign-dim':   '#a87f47',
      '--beam':       'linear-gradient(180deg, #633d29, #2e1a11)',
      '--text':       '#f2ddc4',
      '--text-dim':   '#c2a180',
      '--page-bg':    '#1e120e',
      '--flame':      '#ff9e3c',
      '--flame-low':  '#b04a10',
    },
  },
  rooftop: {
    label: '루프탑',
    note: '시티 라이트와 틸 유리. 바람이 스치는 옥상',
    vars: {
      '--wood':       '#2e3a42',
      '--wood-light': '#5a7480',
      '--wood-dark':  '#141c22',
      '--stone':      '#3a5058',
      '--stone-dark': '#1e2e34',
      '--metal':      '#7ec8c0',
      '--metal-dark': '#3a6e68',
      '--sign-bg':    '#1e3038',
      '--sign-ink':   '#d4f0ec',
      '--sign-dim':   '#7ab0a8',
      '--beam':       'linear-gradient(180deg, #3a5058, #1a282e)',
      '--text':       '#e8f4f2',
      '--text-dim':   '#a0c0bc',
      '--page-bg':    '#121c22',
      '--flame':      '#7ed4c8',
      '--flame-low':  '#2a8a7e',
    },
  },
  rainy_bar: {
    label: '비 오는 바',
    note: '젖은 창과 슬레이트. 빗소리 곁의 머테드 호른',
    vars: {
      '--wood':       '#343840',
      '--wood-light': '#5e6874',
      '--wood-dark':  '#181c22',
      '--stone':      '#4a5460',
      '--stone-dark': '#282e38',
      '--metal':      '#8aa0b4',
      '--metal-dark': '#4a5e72',
      '--sign-bg':    '#242a34',
      '--sign-ink':   '#d8e4f0',
      '--sign-dim':   '#8898ac',
      '--beam':       'linear-gradient(180deg, #4a5460, #1e242c)',
      '--text':       '#e8eef4',
      '--text-dim':   '#a8b4c4',
      '--page-bg':    '#161a22',
      '--flame':      '#9ab8d4',
      '--flame-low':  '#3a6088',
    },
  },
  sunday_cafe: {
    label: '선데이 카페',
    note: '따뜻한 목재와 소프트 골드. 낮 햇빛 트리오',
    vars: {
      '--wood':       '#6a4a30',
      '--wood-light': '#b08858',
      '--wood-dark':  '#342418',
      '--stone':      '#7a6a55',
      '--stone-dark': '#443828',
      '--metal':      '#d4b060',
      '--metal-dark': '#7a6028',
      '--sign-bg':    '#4a3824',
      '--sign-ink':   '#f8ecd0',
      '--sign-dim':   '#b89860',
      '--beam':       'linear-gradient(180deg, #8a6440, #3a2818)',
      '--text':       '#faf4e8',
      '--text-dim':   '#c8b898',
      '--page-bg':    '#2a2018',
      '--flame':      '#ffc45c',
      '--flame-low':  '#bf6a18',
    },
  },
  festival: {
    label: '야외 페스티벌',
    note: '햇살과 브라스. 사람들 사이로 스윙',
    vars: {
      '--wood':       '#5a4828',
      '--wood-light': '#9a8450',
      '--wood-dark':  '#2c2210',
      '--stone':      '#6a7850',
      '--stone-dark': '#384028',
      '--metal':      '#e8c040',
      '--metal-dark': '#8a6820',
      '--sign-bg':    '#3a4020',
      '--sign-ink':   '#f8f0c0',
      '--sign-dim':   '#b0a060',
      '--beam':       'linear-gradient(180deg, #7a6840, #2e2814)',
      '--text':       '#faf6e4',
      '--text-dim':   '#c8c0a0',
      '--page-bg':    '#242818',
      '--flame':      '#ffd060',
      '--flame-low':  '#c87818',
    },
  },
  vinyl_room: {
    label: '바이닐 룸',
    note: '월넛과 앰버 니들 라이트. 가까운 스피커',
    vars: {
      '--wood':       '#4a3224',
      '--wood-light': '#8a6448',
      '--wood-dark':  '#241810',
      '--stone':      '#3a342e',
      '--stone-dark': '#1e1a16',
      '--metal':      '#c89850',
      '--metal-dark': '#6a4e24',
      '--sign-bg':    '#2e2418',
      '--sign-ink':   '#f0d8a8',
      '--sign-dim':   '#a88850',
      '--beam':       'linear-gradient(180deg, #5a4030, #221810)',
      '--text':       '#f4e8d4',
      '--text-dim':   '#c0a888',
      '--page-bg':    '#181410',
      '--flame':      '#e8a040',
      '--flame-low':  '#a05018',
    },
  },
};

/** 분위기가 장소를 자동으로 고를 때 쓰는 매핑 */
export const MOOD_HALL = {
  calm: 'midnight_lounge', pastoral: 'sunday_cafe', wonder: 'vinyl_room', tender: 'midnight_lounge',
  sorrow: 'rainy_bar',      noble: 'speakeasy',     dread: 'rainy_bar',   ember: 'speakeasy',
  frost: 'rooftop',         merry: 'festival',
};

const STORE = 'jazzbgm.hall';
const DEFAULT_HALL = 'midnight_lounge';

export function loadHallPref() {
  try {
    const raw = localStorage.getItem(STORE);
    if (!raw) return { id: DEFAULT_HALL, locked: false };
    const p = JSON.parse(raw);
    return { id: HALLS[p.id] ? p.id : DEFAULT_HALL, locked: !!p.locked };
  } catch { return { id: DEFAULT_HALL, locked: false }; }
}

export function saveHallPref(pref) {
  try { localStorage.setItem(STORE, JSON.stringify(pref)); } catch { /* 사생활 보호 모드 */ }
}

/** 장소 + 분위기를 :root 커스텀 프로퍼티로 적용 */
export function applyHall(hallId, mood) {
  const hall = HALLS[hallId] || HALLS[DEFAULT_HALL];
  const root = document.documentElement;
  for (const [k, v] of Object.entries(hall.vars)) root.style.setProperty(k, v);
  if (mood) {
    root.style.setProperty('--accent', mood.accent);
    root.style.setProperty('--accent-deep', mood.deep);
    root.style.setProperty('--accent-glow', mood.glow);
    root.style.setProperty('--ember', mood.record);
  }
  root.dataset.hall = hallId;
}
