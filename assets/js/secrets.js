// secrets.js — 클럽에 숨겨 둔 것들.
//
// 찾으면 반가운 정도로만 둔다. 못 찾아도 재생기 쓰는 데 아무 지장이 없고,
// 찾았다고 해서 대단한 게 나오지도 않는다. 그 선을 넘으면 이스터에그가 아니라 숨긴 기능이다.
//
// 찾은 것은 localStorage 에 남겨 두고, 클럽 야사에 한 줄씩 적어 준다.
//
// 항목마다 두 가지를 들고 있다.
//   nudge — 아직 못 찾았을 때 보여 주는 귀띔.
//   done  — 찾고 나서 적히는 문장.
//
// id 를 바꿀 때: 예전 키(hearth·gourmet)는 그대로 둔다. localStorage 의
// jazzbgm.found 에 이미 적힌 사람이 다시 깨지 않게. 새 항목(bartender·lastcall)만 추가.

import { sfx } from './sounds.js';

const KEY = 'jazzbgm.found';

export const SECRETS = {
  bell: {
    label: '문간 종',
    nudge: '머리말 오른쪽 끝, 고리 하나가 걸려 있습니다.',
    done: '들어오면서 종을 울렸다',
  },
  toast: {
    label: '건배',
    nudge: '머리말에 적힌 곡 수를 잔이라 여기고 부딪쳐 보십시오.',
    done: '잔을 부딪쳤다',
  },
  hearth: {
    // id 유지 — 예전엔 난로 찌르기, 지금은 네온/바이닐 톡
    label: '네온 스파크',
    nudge: '바 카운터의 네온이나 바이닐을 빈손일 때 톡 건드려 보십시오.',
    done: '네온을 톡 건드려 스파크를 보았다',
  },
  gourmet: {
    // id 유지 — 예전엔 음식 전부, 지금은 칵테일 전부 마시기
    label: '칵테일 마스터',
    nudge: '바에는 열이 넘는 레시피가 돕니다. 맞춰서 올린 잔을 종류대로 비워 보십시오.',
    done: '레시피대로 맞춘 칵테일을 종류별로 다 마셔 보았다',
  },
  bartender: {
    label: '바텐더',
    nudge: '비율을 맞춰 Shake 에 성공한 레시피가 다섯 가지면 야사에 적힙니다.',
    done: '서로 다른 레시피 다섯 잔을 성공적으로 조율했다',
  },
  lastcall: {
    label: '라스트 콜',
    nudge: '깊은 밤에 Dawn Espresso 를 맞춰 보십시오. (머리말의 시간대를 눌러 돌려 볼 수도 있습니다)',
    done: '깊은 밤에 Dawn Espresso 를 조율했다',
  },
  bard: {
    label: '수다쟁이',
    nudge: '니키를 자꾸 건드리면 하는 말이 달라집니다. 일곱 번쯤.',
    done: '니키에게 일곱 번 말을 걸었다',
  },
  lute: {
    label: '즉흥 셋',
    nudge: '니키의 턴테이블은 눌러 볼 수 있게 생기지 않았습니까.',
    done: '턴테이블을 건드려 즉석에서 셋을 청했다',
  },
  trinket: {
    label: '태엽 오르골',
    nudge: '바 선반 위에 놓인 작은 것, 장식만은 아닐 겁니다.',
    done: '선반 위 오르골의 태엽을 감았다',
  },
  patron: {
    label: '단골',
    nudge: '한 곡도 건너뛰지 말고 다섯 곡을 내리 들어 보십시오. 니키가 아껴 둔 셋을 꺼냅니다.',
    done: '건너뛰지 않고 다섯 곡을 내리 들었다',
  },
  nightowl: {
    label: '올빼미',
    nudge: '자정을 넘겨 클럽에 앉아 계시면. (머리말의 시간대를 눌러 돌려 볼 수도 있습니다)',
    done: '깊은 밤에 클럽에 앉아 있었다',
  },
  wanderer: {
    label: '떠돌이',
    nudge: '머물 곳이 일곱 군데입니다. 오른쪽 아래에서 하나씩 옮겨 보십시오.',
    done: '일곱 곳을 모두 둘러보았다',
  },
  loremaster: {
    label: '기록관',
    nudge: '장면 서랍에 서른네 장면이 있습니다. 한 번씩은 들어 봐야 적힙니다.',
    done: '서른네 장면을 모두 열어 보았다',
  },
};

function read() {
  try { return new Set(JSON.parse(localStorage.getItem(KEY) || '[]')); }
  catch { return new Set(); }
}
function write(set) {
  try { localStorage.setItem(KEY, JSON.stringify([...set])); } catch { /* noop */ }
}

export function found() { return read(); }
export function hasFound(id) { return read().has(id); }

let onFind = null;
/** 무언가 찾았을 때 부를 함수를 등록한다. (id, secret, 전체개수) */
export function onSecret(fn) { onFind = fn; }

/** 하나 찾았다고 기록한다. 이미 찾은 것이면 아무 일도 없다. */
export function find(id) {
  const s = SECRETS[id];
  if (!s) return false;
  const set = read();
  if (set.has(id)) return false;
  set.add(id);
  write(set);
  sfx.flourish();
  onFind?.(id, s, set.size);
  return true;
}

const STRAIGHT_KEY = 'jazzbgm.straight';
const STRAIGHT_NEEDED = 5;
let onPatron = null;

/** 단골이 되었을 때 부를 함수를 등록한다. */
export function onBecomePatron(fn) { onPatron = fn; }

function straightCount(v) {
  try {
    if (v === undefined) return Number(localStorage.getItem(STRAIGHT_KEY) || 0);
    localStorage.setItem(STRAIGHT_KEY, String(v));
  } catch { /* noop */ }
  return v ?? 0;
}

/** 한 곡을 끝까지 들었다. */
export function noteFinished() {
  if (hasFound('patron')) return;
  const n = straightCount() + 1;
  straightCount(n);
  if (n >= STRAIGHT_NEEDED) { find('patron'); onPatron?.(); }
}

/** 건너뛰었다 — 연속이 끊긴다. */
export function noteSkipped() {
  if (hasFound('patron')) return;
  straightCount(0);
}

/** 깊은 밤에 앉아 있다면 */
export function checkNightOwl(phaseId) {
  if (phaseId === 'deep_night') find('nightowl');
}

/** 들른 장소를 세어 둔다 */
const HALL_KEY = 'jazzbgm.visitedHalls';
export function noteHall(id, total) {
  try {
    const v = new Set(JSON.parse(localStorage.getItem(HALL_KEY) || '[]'));
    v.add(id);
    localStorage.setItem(HALL_KEY, JSON.stringify([...v]));
    if (v.size >= total) find('wanderer');
  } catch { /* noop */ }
}

/** 열어 본 장면을 세어 둔다 */
const SCENE_KEY = 'jazzbgm.playedScenes';
export function noteScene(id, total) {
  try {
    const v = new Set(JSON.parse(localStorage.getItem(SCENE_KEY) || '[]'));
    v.add(id);
    localStorage.setItem(SCENE_KEY, JSON.stringify([...v]));
    if (v.size >= total) find('loremaster');
  } catch { /* noop */ }
}

/** DJ에게 말 건 횟수 */
let talks = 0;
export function noteTalk() {
  talks += 1;
  if (talks >= 7) find('bard');
  return talks;
}

/** 조율에 성공한 레시피를 세어 둔다 — 다섯 가지면 바텐더 */
const MIXED_KEY = 'jazzbgm.mixed';
const MIXED_NEEDED = 5;
export function noteMixed(recipeId) {
  try {
    const v = new Set(JSON.parse(localStorage.getItem(MIXED_KEY) || '[]'));
    v.add(recipeId);
    localStorage.setItem(MIXED_KEY, JSON.stringify([...v]));
    if (v.size >= MIXED_NEEDED) find('bartender');
  } catch { /* noop */ }
}

/** 단골에게 열리는 셋 — 각 장면에서 집중도가 가장 높은 한 곡씩 */
export function legendaryList(bySceneMap) {
  const out = [];
  for (const [scene, tracks] of Object.entries(bySceneMap)) {
    const best = [...tracks].sort((a, b) => b.focus - a.focus || (b.length || 0) - (a.length || 0))[0];
    if (best) out.push({ ...best, scene });
  }
  return out.sort(() => Math.random() - 0.5);
}
