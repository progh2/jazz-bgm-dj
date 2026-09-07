// roast.js — 바 난로에 걸어 두는 것들.
//
// 아무것도 없다가, 누군가 뭔가를 걸어 두고, 익고, 안 먹으면 타고, 다시 빈다.
// 재생과는 아무 상관이 없다. 곁눈으로 보다가 "어, 익었네" 하고 눌러 먹으라고 둔 것이다.
//
// 그림은 assets/art/hearth-*.webp 를 쓴다 (기존 파이프라인을 그대로 둔다).
// 익은 정도는 그림을 네 벌 두지 않고 **CSS 필터 하나로** 낸다.

const ART = 'assets/art';

export const DISHES = {
  none: {
    label: '빈 바', weight: 3, eatable: false,
    done: '불씨만 숨 쉬고 있습니다.',
    img: '',
  },

  skewer: {
    label: '올리브 꼬치', weight: 5, eatable: true,
    raw: '아직 차갑습니다. 좀 더 두시지요.',
    cooking: '기름이 반짝이기 시작했습니다.',
    done: '잘 데워졌습니다. 드십시오.',
    burnt: '아이고, 태워 먹었군요.',
    eaten: '잘 드셨습니까. 또 걸어 두겠습니다.',
    img: `${ART}/hearth-skewer.webp`,
  },

  pig: {
    label: '공유 플래터', weight: 2, eatable: true,
    raw: '이제 막 올렸습니다. 한참 걸립니다.',
    cooking: '향이 퍼지기 시작합니다.',
    done: '테이블이 다 냄새납니다. 나누십시오.',
    burnt: '겉이 새까맣게 탔습니다…',
    eaten: '한 판을 다 비우시다니.',
    img: `${ART}/hearth-pig.webp`,
  },

  cauldron: {
    label: '따뜻한 펀치', weight: 4, eatable: true,
    raw: '아직 미지근합니다.',
    cooking: '가장자리가 보글거립니다.',
    done: '푹 우러났습니다. 한 잔 뜨시지요.',
    burnt: '바닥이 눌어붙었습니다.',
    eaten: '속이 든든하시겠습니다.',
    img: `${ART}/hearth-cauldron.webp`,
    bubbles: true,
    hangs: true,
  },

  marshmallow: {
    label: '마시멜로', weight: 4, eatable: true,
    raw: '아직 하얗습니다.',
    cooking: '겉이 노릇해집니다.',
    done: '겉은 바삭, 속은 흐물. 지금입니다.',
    burnt: '불이 붙었다가 꺼졌습니다.',
    eaten: '손이 끈적하시겠습니다.',
    img: `${ART}/hearth-marshmallow.webp`,
  },

  corn: {
    label: '프레첼과 견과', weight: 5, eatable: true,
    raw: '아직 차갑습니다.',
    cooking: '향이 나기 시작합니다.',
    done: '알맞게 데워졌습니다.',
    burnt: '숯이 되었습니다.',
    eaten: '간단한 게 제일이지요.',
    img: `${ART}/hearth-corn.webp`,
    inAshes: true,
  },

  fish: {
    label: '스모크드 피시', weight: 3, eatable: true,
    raw: '방금 올렸습니다.',
    cooking: '연기가 살살 납니다.',
    done: '고소하게 익었습니다.',
    burnt: '끝부분이 사라졌습니다.',
    eaten: '가시 조심하십시오.',
    img: `${ART}/hearth-fish.webp`,
  },
};

/** 익는 단계와 머무는 시간(ms) */
export const STAGES = [
  { id: 'raw',     label: '설익음',  ms: 22_000 },
  { id: 'cooking', label: '익는 중', ms: 26_000 },
  { id: 'done',    label: '다 익음', ms: 55_000 },
  { id: 'burnt',   label: '탐',      ms: 20_000 },
];

const EMPTY_MS = 14_000;

/** 집어 먹을 수 있는 단계. 설익음·익는 중에는 손이 안 간다. */
export const EATABLE_STAGES = new Set(['done', 'burnt']);

function pickDish(exclude) {
  const pool = [];
  for (const [id, d] of Object.entries(DISHES)) {
    if (id === exclude) continue;
    for (let i = 0; i < d.weight; i++) pool.push(id);
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * 바 난로 위 요리를 굴린다.
 * @param {object} o
 * @param {HTMLElement} o.slot   그림이 들어갈 자리
 * @param {(dish,stage)=>void} o.onChange  걸리거나 익거나 탈 때
 * @param {()=>void} o.onSizzle  지글거릴 때 (소리용)
 */
export function startRoast({ slot, onChange, onSizzle }) {
  let dishId = 'none';
  let stageIdx = 0;
  let timer = null;

  function render() {
    const dish = DISHES[dishId];
    const stage = STAGES[stageIdx];
    slot.innerHTML = dish.img
      ? `<img class="dish" src="${dish.img}" alt="" decoding="async" draggable="false">`
        + (dish.bubbles ? '<i class="bub bub1"></i><i class="bub bub2"></i><i class="bub bub3"></i>' : '')
      : '';
    slot.dataset.stage = dish.img ? stage.id : 'none';
    slot.dataset.dish = dishId;
    slot.dataset.seat = dish.inAshes ? 'ashes' : dish.hangs ? 'hang' : 'spit';
    onChange?.(dish, dish.img ? stage : null);
  }

  function schedule(ms, fn) { clearTimeout(timer); timer = setTimeout(fn, ms); }

  function toEmpty(delay = EMPTY_MS) {
    dishId = 'none';
    stageIdx = 0;
    render();
    schedule(delay, serve);
  }

  function serve() {
    dishId = pickDish('none');
    if (dishId === 'none') { toEmpty(); return; }
    stageIdx = 0;
    render();
    advance();
  }

  function advance() {
    schedule(STAGES[stageIdx].ms, () => {
      if (stageIdx >= STAGES.length - 1) { toEmpty(); return; }
      stageIdx += 1;
      if (STAGES[stageIdx].id === 'cooking' || STAGES[stageIdx].id === 'done') onSizzle?.();
      render();
      advance();
    });
  }

  function bite() {
    const dish = DISHES[dishId];
    const stage = STAGES[stageIdx];
    if (!dish.img || !dish.eatable) return { ate: false, why: 'empty', id: dishId, dish, stage: null };
    if (!EATABLE_STAGES.has(stage.id)) return { ate: false, why: 'notyet', id: dishId, dish, stage };
    const id = dishId;
    toEmpty(9_000);
    return { ate: true, id, dish, stage };
  }

  const peek = () => ({ id: dishId, dish: DISHES[dishId], stage: DISHES[dishId].img ? STAGES[stageIdx] : null });

  function stop() { clearTimeout(timer); }

  toEmpty(6_000);

  return { bite, peek, stop };
}
