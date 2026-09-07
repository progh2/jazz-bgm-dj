// bard.js — DJ 니키와 몇 마디 나눠 그 자리에서 셋리스트를 짠다.
//
// 답변 넷이 각각 다른 손잡이를 돌린다.
//   errand    오늘 집중(포커스) — 어느 장면 서랍에서 꺼낼지 (가중치)
//   where     결·장소 — 어느 장르/베뉴를 앞세울지 (가중치)
//   presence  집중도 하한 (일을 방해하는 정도)
//   spice     뜨거운 곡을 얼마나 섞을지
//
// 장소와 볼일은 '거르기'가 아니라 '가점'이다. 조건을 좁혀 거르면 마흔 곡도 못 채우는데,
// 그러느니 어울리는 것을 앞에 세우고 나머지를 뒤에 붙이는 편이 낫다.

export const QUESTIONS = [
  {
    id: 'errand',
    ask: '어서 오십시오. 오늘 밤은 어떤 집중이 필요하십니까?',
    hint: '클럽의 온도를 여기서 정합니다.',
    options: [
      { id: 'rush',  label: '기한을 쫓고 있소',   blurb: '추진력이 필요할 때',    icon: 'rush' },
      { id: 'calm',  label: '그저 앉아 있고 싶소', blurb: '오래 틀어 둘 참이라',  icon: 'calm' },
      { id: 'deep',  label: '깊이 파고들 일이',   blurb: '방해받지 않고',          icon: 'deep' },
      { id: 'worn',  label: '하루가 길었소',      blurb: '어깨를 좀 풀고',         icon: 'worn' },
    ],
  },
  {
    id: 'where',
    ask: '어떤 결을 곁에 두고 싶으십니까?',
    hint: '장르·장소를 정해 두면 셋이 잘 맞습니다.',
    options: [
      { id: 'town',    label: '라운지와 스피크이지', blurb: '낮은 조명, 칵테일',       icon: 'town' },
      { id: 'nature',  label: '카페와 루프탑',       blurb: '낮 햇살, 시티 라이트',   icon: 'nature' },
      { id: 'ancient', label: '누아르와 모달',       blurb: '어두운 클럽, 긴 호흡',   icon: 'ancient' },
      { id: 'hearth',  label: '발라드와 애프터아워', blurb: '라스트 세트, 여운',      icon: 'hearth' },
    ],
  },
  {
    id: 'presence',
    ask: '노래는 어느 만큼 들리면 되겠습니까?',
    hint: '집중도를 여기서 조절합니다.',
    options: [
      { id: 'bg',   label: '있는 듯 없는 듯', blurb: '일에만 매달릴 참이라', icon: 'soft' },
      { id: 'mid',  label: '적당히',          blurb: '가끔 귀에 걸리게',     icon: 'mid' },
      { id: 'fore', label: '제대로 들려주오', blurb: '세트를 들으러 왔소',   icon: 'loud' },
    ],
  },
  {
    id: 'spice',
    ask: '가끔 뜨거운 곡도 섞을까요?',
    hint: '비밥·퓨전·댄스 계열을 조금 넣는 것입니다.',
    options: [
      { id: 'none', label: '조용한 걸로만',   blurb: '흐름이 끊기지 않게',  icon: 'none' },
      { id: 'some', label: '가끔이면 좋소',   blurb: '열 곡에 한 곡쯤',      icon: 'some' },
      { id: 'lots', label: '피가 끓게 해주오', blurb: '그루브로 밀어붙이게', icon: 'lots' },
    ],
  },
];

/** 집중 → 기본 장면군 + 결 표현 */
const ERRAND = {
  rush: { scenes: ['B2_bebop', 'B4_hardbop', 'B13_soul', 'C7_dance', 'B1_swing'], word: '몰아치는' },
  calm: { scenes: ['B3_cool', 'C1_lounge', 'B8_ballad', 'D7_rainy', 'D9_dawn'],     word: '느긋한' },
  deep: { scenes: ['B5_modal', 'B14_noir', 'C6_studio', 'D1_melancholy', 'D8_afterhours'], word: '깊이 가라앉는' },
  worn: { scenes: ['B8_ballad', 'D2_romance', 'C2_cafe', 'D3_uplift', 'D7_rainy'],  word: '어깨 풀리는' },
};

/** 결·장소 → 장면군 */
const WHERE = {
  town:    { scenes: ['C1_lounge', 'C3_speakeasy', 'B9_smooth', 'B3_cool', 'D6_elegant'], word: '라운지 구석' },
  nature:  { scenes: ['C2_cafe', 'C4_rooftop', 'C5_festival', 'D3_uplift', 'B6_latin'],   word: '창가와 옥상' },
  ancient: { scenes: ['B14_noir', 'B5_modal', 'C6_studio', 'D4_tense', 'B11_free'],       word: '어두운 클럽' },
  hearth:  { scenes: ['B8_ballad', 'D8_afterhours', 'D2_romance', 'D9_dawn', 'A4_close'], word: '라스트콜 무렵' },
};

const PRESENCE = { bg: 5, mid: 4, fore: 3 };

const SPICE = {
  none: { ratio: 0,    scenes: [] },
  some: { ratio: 0.12, scenes: ['B4_hardbop', 'B13_soul', 'B1_swing', 'B6_latin'] },
  lots: { ratio: 0.3,  scenes: ['B2_bebop', 'B10_fusion', 'B11_free', 'C7_dance', 'B13_soul', 'B4_hardbop'] },
};

function shuffle(arr, rnd = Math.random) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 한 사람 노래만 내리 나오지 않게 흩뿌린다. */
export function spreadByArtist(tracks) {
  const byArtist = new Map();
  for (const t of tracks) {
    if (!byArtist.has(t.artist)) byArtist.set(t.artist, []);
    byArtist.get(t.artist).push(t);
  }
  const queues = shuffle([...byArtist.values()]);
  for (const q of queues) q.splice(0, q.length, ...shuffle(q));
  const out = [];
  while (queues.some((q) => q.length)) {
    for (const q of queues) if (q.length) out.push(q.shift());
  }
  return out;
}

/**
 * 답변으로 셋리스트를 짠다.
 * @param {object} answers  {errand, where, presence, spice}
 * @param {object} bySceneMap  BGM_BY_SCENE
 * @param {number} size  목표 곡 수
 */
export function buildFromAnswers(answers, bySceneMap, size = 40) {
  const er = ERRAND[answers.errand] || ERRAND.calm;
  const wh = WHERE[answers.where] || WHERE.town;
  const minFocus = PRESENCE[answers.presence] ?? 4;
  const spice = SPICE[answers.spice] || SPICE.none;

  const weight = new Map();
  for (const s of er.scenes) weight.set(s, (weight.get(s) || 0) + 2);
  for (const s of wh.scenes) weight.set(s, (weight.get(s) || 0) + 2);

  const pool = [];
  for (const [scene, w] of weight) {
    const tracks = (bySceneMap[scene] || []).filter((t) => t.focus >= minFocus);
    for (const t of shuffle(tracks).slice(0, Math.ceil(size * (w / 8) + 4))) {
      pool.push({ ...t, scene });
    }
  }

  if (pool.length < size && minFocus > 3) {
    for (const [scene] of weight) {
      for (const t of bySceneMap[scene] || []) {
        if (t.focus >= minFocus - 1 && !pool.some((p) => p.videoId === t.videoId)) {
          pool.push({ ...t, scene });
        }
      }
    }
  }

  const seen = new Set();
  const unique = pool.filter((t) => !seen.has(t.videoId) && seen.add(t.videoId));
  let list = spreadByArtist(unique).slice(0, size);

  const spiceCount = Math.round(size * spice.ratio);
  if (spiceCount > 0) {
    const hot = [];
    for (const scene of spice.scenes) {
      for (const t of bySceneMap[scene] || []) {
        if (!seen.has(t.videoId)) { hot.push({ ...t, scene, spicy: true }); seen.add(t.videoId); }
      }
    }
    const picks = shuffle(hot).slice(0, spiceCount);
    list = list.slice(0, Math.max(0, size - picks.length));
    const step = Math.max(1, Math.floor(list.length / (picks.length + 1)));
    picks.forEach((t, i) => list.splice(Math.min(list.length, (i + 1) * step + i), 0, t));
  }

  return { tracks: list, summary: describe(answers, list), scenes: [...weight.keys()], minFocus };
}

function describe(answers, tracks) {
  const er = ERRAND[answers.errand] || ERRAND.calm;
  const wh = WHERE[answers.where] || WHERE.town;
  const spicy = tracks.filter((t) => t.spicy).length;
  const lines = [`${wh.word}에서 ${er.word} 결로 ${tracks.length}곡 골랐습니다.`];
  if (spicy > 0) lines.push(`중간중간 뜨거운 곡 ${spicy}곡 끼워 뒀으니 놀라지 마십시오.`);
  if (answers.presence === 'bg') lines.push('있는 듯 없는 듯 깔아 두겠습니다. 일 보십시오.');
  else if (answers.presence === 'fore') lines.push('오늘은 세트에도 귀를 좀 주십시오.');
  return lines.join(' ');
}

/** 묻지 않고 바로 트는 기본값 — "일하며 틀어놓기" */
export const DEFAULT_ANSWERS = { errand: 'calm', where: 'nature', presence: 'bg', spice: 'none' };

export const CHATTER = {
  greet:   ['자리 잡으셨습니까. 무엇을 들려 드릴까요.', '어서 오십시오. 오늘도 야근이군요.', '오셨군요. 바늘은 올려 두었습니다.'],
  picking: ['음—— 잠시만.', '크레이트 뒤적이는 중입니다.', '이 결이 어울리겠군요.'],
  playing: ['그럼 틀겠습니다.', '한 곡 뽑겠습니다.', '좋습니다, 이 셋입니다.'],
  paused:  ['잠시 쉬어 갈까요.', '바늘을 들어 두었습니다.'],
  done:    ['한 바퀴 다 돌았습니다. 더 할까요?', '셋리스트가 끝났습니다. 새로 짤까요?'],
};

export const pickChatter = (key) => {
  const arr = CHATTER[key] || CHATTER.greet;
  return arr[Math.floor(Math.random() * arr.length)];
};


/* ── 니키가 직접 고르는 셋리스트 ─────────────────────────────────
   문답을 거치지 않고 턴테이블을 건드렸을 때. 지금이 몇 시인지만 보고 짠다.
   새벽 세 시에 페스티벌 곡을 트는 것만 피해도 절반은 맞힌 셈이다. */

const PHASE_PICK = {
  deep_night: { scenes: ['D8_afterhours', 'D9_dawn', 'B8_ballad', 'C1_lounge', 'D1_melancholy'],
                floor: 5, say: '이 시간에는 소리를 낮춘 것이 낫습니다. 조용한 것으로 골랐습니다.' },
  dawn:       { scenes: ['D9_dawn', 'D3_uplift', 'C2_cafe', 'B3_cool', 'B9_smooth'],
                floor: 4, say: '곧 해가 뜹니다. 밝아 오는 결로 골랐습니다.' },
  morning:    { scenes: ['C2_cafe', 'D3_uplift', 'B9_smooth', 'B6_latin', 'A2_intro'],
                floor: 4, say: '아침이니 가벼운 트리오로 골랐습니다.' },
  day:        { scenes: ['B1_swing', 'C5_festival', 'B13_soul', 'B6_latin', 'C4_rooftop'],
                floor: 4, say: '볕이 좋습니다. 스윙 한 바퀴로 골랐습니다.' },
  dusk:       { scenes: ['C4_rooftop', 'B3_cool', 'D2_romance', 'C1_lounge', 'B8_ballad'],
                floor: 4, say: '해가 기웁니다. 하루를 접는 결로 골랐습니다.' },
  evening:    { scenes: ['C1_lounge', 'C3_speakeasy', 'B8_ballad', 'B14_noir', 'D6_elegant'],
                floor: 4, say: '저녁입니다. 라운지에 어울리는 것으로 골랐습니다.' },
  night:      { scenes: ['D8_afterhours', 'B14_noir', 'B5_modal', 'D7_rainy', 'B8_ballad'],
                floor: 5, say: '밤이 깊었습니다. 거슬리지 않을 것만 골랐습니다.' },
};

/**
 * 시각에 맞춰 셋리스트를 짠다.
 * @param {string} phaseId  hearth.js 의 시간대 id
 * @param {object} bySceneMap
 * @param {number} size
 * @returns {{tracks:object[], summary:string}}
 */
export function pickForPhase(phaseId, bySceneMap, size = 30) {
  const plan = PHASE_PICK[phaseId] || PHASE_PICK.evening;
  const seen = new Set();
  const pool = [];
  for (const scene of plan.scenes) {
    for (const t of bySceneMap[scene] || []) {
      if ((t.focus ?? 0) < plan.floor || seen.has(t.videoId)) continue;
      seen.add(t.videoId);
      pool.push({ ...t, scene });
    }
  }
  if (pool.length < size) {
    for (const scene of plan.scenes) {
      for (const t of bySceneMap[scene] || []) {
        if (seen.has(t.videoId)) continue;
        seen.add(t.videoId);
        pool.push({ ...t, scene });
      }
    }
  }
  const tracks = spreadByArtist(pool.sort(() => Math.random() - 0.5)).slice(0, size);
  return { tracks, summary: plan.say };
}
