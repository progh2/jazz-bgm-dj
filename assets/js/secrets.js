// secrets.js — 미드나잇 클럽에만 있는 야사.
//
// rpg-bgm-dj 의 여관 야사(종·건배·수다·단골·올빼미·떠돌이·기록관·오르골)와
// id·설화를 겹치지 않게 클럽 메타포로 새로 짰다.
//
// 찾으면 반가운 정도로만. 못 찾아도 재생기 쓰는 데 지장 없다.

import { sfx } from './sounds.js';

const KEY = 'jazzbgm.found.v2';   // v2 — 옛 id 세트와 분리

export const SECRETS = {
  doorchime: {
    label: '도어 차임',
    nudge: '머리말 오른쪽 끝, 작은 벨이 하나 걸려 있습니다.',
    done: '클럽 문을 열며 차임을 울렸다',
  },
  tipjar: {
    label: '팁 단지',
    nudge: '머리말에 적힌 곡 수 — 단지로 보고 톡 건드려 보십시오.',
    done: '팁 단지에 잔소리를 넣었다',
  },
  neon: {
    label: '네온 사인',
    nudge: '바 안의 MIDNIGHT 네온을, 잔이 비어 있을 때 톡 건드려 보십시오.',
    done: 'MIDNIGHT 네온을 톡 건드려 깜빡이게 했다',
  },
  dropneedle: {
    label: '바늘 내리기',
    nudge: '무대 위 니키 곁의 턴테이블 — 눌러 보면 즉석 셋이 나옵니다.',
    done: '턴테이블에 바늘을 내려 즉석 셋을 청했다',
  },
  request: {
    label: '리퀘스트',
    nudge: '니키에게 말을 걸다 보면 대답이 달라집니다. 일곱 번쯤.',
    done: '니키에게 리퀘스트를 일곱 번 건넸다',
  },
  mixologist: {
    label: '믹솔로지스트',
    nudge: '바에서 서로 다른 레시피 다섯 잔을 Shake 성공하면 적힙니다.',
    done: '서로 다른 레시피 다섯 잔을 성공적으로 조율했다',
  },
  fullmenu: {
    label: '풀 메뉴',
    nudge: '레시피가 열이 넘습니다. 맞춰 올린 잔을 종류대로 비워 보십시오.',
    done: '메뉴에 오른 칵테일을 종류별로 다 마셔 보았다',
  },
  lastcall: {
    label: '라스트 콜',
    nudge: '깊은 밤에 Dawn Espresso 를 맞춰 보십시오. (머리말 시간대를 눌러 돌려 볼 수 있습니다)',
    done: '깊은 밤에 Dawn Espresso 로 라스트 콜을 열었다',
  },
  regular: {
    label: '레귤러 시트',
    nudge: '한 곡도 건너뛰지 말고 다섯 곡을 내리 들어 보십시오. 니키가 아껴 둔 셋을 꺼냅니다.',
    done: '건너뛰지 않고 다섯 곡을 내리 들으며 레귤러가 되었다',
  },
  bluehour: {
    label: '블루 아워',
    nudge: '자정을 넘겨 클럽에 앉아 계시면. (머리말의 시간대를 눌러 돌려 볼 수도 있습니다)',
    done: '블루 아워에 클럽에 앉아 있었다',
  },
  boothcrawl: {
    label: '부스 순례',
    nudge: '머물 곳이 일곱 군데입니다. 오른쪽 아래에서 하나씩 옮겨 보십시오.',
    done: '일곱 부스를 모두 둘러보았다',
  },
  cratedigger: {
    label: '크레이트 디거',
    nudge: '장면 서랍에 서른네 장면이 있습니다. 한 번씩은 들어 봐야 적힙니다.',
    done: '서른네 장면을 모두 파헤쳤다',
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

/** 레귤러가 되었을 때 부를 함수를 등록한다. */
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
  if (hasFound('regular')) return;
  const n = straightCount() + 1;
  straightCount(n);
  if (n >= STRAIGHT_NEEDED) { find('regular'); onPatron?.(); }
}

/** 건너뛰었다 — 연속이 끊긴다. */
export function noteSkipped() {
  if (hasFound('regular')) return;
  straightCount(0);
}

/** 블루 아워 — 깊은 밤 */
export function checkNightOwl(phaseId) {
  if (phaseId === 'deep_night') find('bluehour');
}

/** 들른 부스를 세어 둔다 */
const HALL_KEY = 'jazzbgm.visitedHalls';
export function noteHall(id, total) {
  try {
    const v = new Set(JSON.parse(localStorage.getItem(HALL_KEY) || '[]'));
    v.add(id);
    localStorage.setItem(HALL_KEY, JSON.stringify([...v]));
    if (v.size >= total) find('boothcrawl');
  } catch { /* noop */ }
}

/** 열어 본 장면을 세어 둔다 */
const SCENE_KEY = 'jazzbgm.playedScenes';
export function noteScene(id, total) {
  try {
    const v = new Set(JSON.parse(localStorage.getItem(SCENE_KEY) || '[]'));
    v.add(id);
    localStorage.setItem(SCENE_KEY, JSON.stringify([...v]));
    if (v.size >= total) find('cratedigger');
  } catch { /* noop */ }
}

/** 니키에게 리퀘스트를 건넨 횟수 */
let talks = 0;
export function noteTalk() {
  talks += 1;
  if (talks >= 7) find('request');
  return talks;
}

/** 조율에 성공한 레시피 — 다섯 가지면 믹솔로지스트 */
const MIXED_KEY = 'jazzbgm.mixed';
const MIXED_NEEDED = 5;
export function noteMixed(recipeId) {
  try {
    const v = new Set(JSON.parse(localStorage.getItem(MIXED_KEY) || '[]'));
    v.add(recipeId);
    localStorage.setItem(MIXED_KEY, JSON.stringify([...v]));
    if (v.size >= MIXED_NEEDED) find('mixologist');
  } catch { /* noop */ }
}

/** 레귤러에게 열리는 셋 — 각 장면에서 집중도가 가장 높은 한 곡씩 */
export function legendaryList(bySceneMap) {
  const out = [];
  for (const [scene, tracks] of Object.entries(bySceneMap)) {
    const best = [...tracks].sort((a, b) => b.focus - a.focus || (b.length || 0) - (a.length || 0))[0];
    if (best) out.push({ ...best, scene });
  }
  return out.sort(() => Math.random() - 0.5);
}
