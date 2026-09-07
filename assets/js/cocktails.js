// cocktails.js — 바 카운터의 칵테일 레일과 조율 미니게임.
//
// 레시피 카드가 속삭이는 비율(스피릿·시트러스·스위트)을 맞추고 Shake.
// 맞으면 잔이 레일에 올라 마실 수 있고, 틀리면 muddled — 다시 조율.
// 재생과는 아무 상관이 없다. 곁눈으로 보다가 한 잔 맞춰 보라고 둔 것이다.
//
// 잔은 CSS/SVG. 색은 --drink 변수로 머무는 곳의 팔레트를 탄다.
// (예전 roast.js 의 장작·음식 그림을 쓰지 않는다.)

/** 레시피 — spirit / citrus / sweet 각각 0~5. 허용 오차 ±0. */
export const DISHES = {
  none: {
    label: '빈 바', weight: 0, eatable: false,
    done: '네온만 숨 쉬고 있습니다.',
    spirit: 0, citrus: 0, sweet: 0, hue: 'amber',
  },

  old_fashioned: {
    label: 'Old Fashioned', weight: 4, eatable: true,
    whisper: 'Old Fashioned 4-0-2',
    spirit: 4, citrus: 0, sweet: 2, hue: 'amber',
    raw: '아직 조율 전입니다.',
    cooking: '셰이커가 손길을 기다립니다.',
    done: '호박빛이 고왔습니다. 드십시오.',
    burnt: '김이 빠졌습니다. 그래도…',
    eaten: '한 모금에 밤이 정리되는군요.',
    muddled: '머들링이 과했습니다. 비율을 다시.',
  },

  midnight_martini: {
    label: 'Midnight Martini', weight: 5, eatable: true,
    whisper: 'Midnight Martini 3-1-1',
    spirit: 3, citrus: 1, sweet: 1, hue: 'clear',
    raw: '아직 조율 전입니다.',
    cooking: '차가운 잔을 기다리는 중입니다.',
    done: '자정용으로 딱입니다.',
    burnt: '미지근해졌습니다.',
    eaten: '올리브 하나 남는 맛이군요.',
    muddled: '마틴은 관대하지 않습니다. 다시.',
  },

  blue_note: {
    label: 'Blue Note', weight: 4, eatable: true,
    whisper: 'Blue Note 2-1-3',
    spirit: 2, citrus: 1, sweet: 3, hue: 'teal',
    raw: '아직 조율 전입니다.',
    cooking: '청록이 섞이길 기다립니다.',
    done: '블루 노트처럼 달콤합니다.',
    burnt: '색이 탁해졌습니다.',
    eaten: '색소폰 솔로 한 소절 같군요.',
    muddled: '노트가 어긋났습니다. 다시 맞춰 보시죠.',
  },

  speakeasy_sour: {
    label: 'Speakeasy Sour', weight: 5, eatable: true,
    whisper: 'Speakeasy Sour 2-3-1',
    spirit: 2, citrus: 3, sweet: 1, hue: 'gold',
    raw: '아직 조율 전입니다.',
    cooking: '신맛이 자리를 찾는 중입니다.',
    done: '뒷골목 문으로 들 맛입니다.',
    burnt: '신맛이 날아갔습니다.',
    eaten: '문간 암호가 풀리는 느낌이군요.',
    muddled: '사워가 아닙니다. 비율을 다시.',
  },

  vinyl_negroni: {
    label: 'Vinyl Negroni', weight: 4, eatable: true,
    whisper: 'Vinyl Negroni 3-0-2',
    spirit: 3, citrus: 0, sweet: 2, hue: 'crimson',
    raw: '아직 조율 전입니다.',
    cooking: '붉은 홈이 돌길 기다립니다.',
    done: '바이닐처럼 짙습니다.',
    burnt: '따뜻해져 버렸습니다.',
    eaten: 'B면까지 듣고 싶어지는군요.',
    muddled: '홈이  scratch 났습니다. 다시.',
  },

  dawn_espresso: {
    label: 'Dawn Espresso', weight: 3, eatable: true,
    whisper: 'Dawn Espresso 4-0-1',
    spirit: 4, citrus: 0, sweet: 1, hue: 'espresso',
    raw: '아직 조율 전입니다.',
    cooking: '에스프레소가 식지 않길.',
    done: '동트기 전용입니다. 각성하세요.',
    burnt: '식어 쓴맛만 남았습니다.',
    eaten: '눈이 뜹니다. 한 세트 더?',
    muddled: '커피가 아닙니다. 다시 내려 보시죠.',
  },

  rainy_highball: {
    label: 'Rainy Highball', weight: 5, eatable: true,
    whisper: 'Rainy Highball 2-2-1',
    spirit: 2, citrus: 2, sweet: 1, hue: 'clear',
    raw: '아직 조율 전입니다.',
    cooking: '탄산이 자리를 잡는 중입니다.',
    done: '창밖 빗소리에 맞습니다.',
    burnt: '탄산이 다 빠졌습니다.',
    eaten: '우산 없이도 젖는 맛이군요.',
    muddled: '하이볼이 무거워졌습니다. 다시.',
  },

  crimson_manhattan: {
    label: 'Crimson Manhattan', weight: 3, eatable: true,
    whisper: 'Crimson Manhattan 4-1-0',
    spirit: 4, citrus: 1, sweet: 0, hue: 'crimson',
    raw: '아직 조율 전입니다.',
    cooking: '체리빛이 가라앉는 중입니다.',
    done: '누아르 한 잔입니다.',
    burnt: '달콤함만 남았습니다.',
    eaten: '코트 깃을 세우고 싶어지는군요.',
    muddled: '맨해튼이 무너졌습니다. 다시.',
  },

  amber_sidecar: {
    label: 'Amber Sidecar', weight: 4, eatable: true,
    whisper: 'Amber Sidecar 3-2-1',
    spirit: 3, citrus: 2, sweet: 1, hue: 'gold',
    raw: '아직 조율 전입니다.',
    cooking: '사이드카가 기울길 기다립니다.',
    done: '호박빛 가장자리가 예쁩니다.',
    burnt: '가장자리가 흐려졌습니다.',
    eaten: '택시 한 대 부를까요.',
    muddled: '사이드가 어긋났습니다. 다시.',
  },

  teal_collins: {
    label: 'Teal Collins', weight: 4, eatable: true,
    whisper: 'Teal Collins 2-3-2',
    spirit: 2, citrus: 3, sweet: 2, hue: 'teal',
    raw: '아직 조율 전입니다.',
    cooking: '청록 거품이 오르는 중입니다.',
    done: '길면서도 가볍습니다.',
    burnt: '거품이 가라앉았습니다.',
    eaten: '한 잔이 세트로 이어지는군요.',
    muddled: '콜린스가 아닙니다. 다시.',
  },
};

/** 레일 위 잔의 단계 */
export const STAGES = [
  { id: 'empty',   label: '빈 잔',  ms: 0 },
  { id: 'mixing',  label: '조율 중', ms: 0 },
  { id: 'ready',   label: '완성',   ms: 90_000 },
  { id: 'flat',    label: '김 빠짐', ms: 28_000 },
];

/** 마실 수 있는 단계 */
export const EATABLE_STAGES = new Set(['ready', 'flat']);

const INGS = ['spirit', 'citrus', 'sweet'];
const ING_LABEL = { spirit: '스피릿', citrus: '시트러스', sweet: '스위트' };
const MAX = 5;

function pickRecipe(exclude) {
  const pool = [];
  for (const [id, d] of Object.entries(DISHES)) {
    if (id === 'none' || id === exclude || !d.eatable) continue;
    for (let i = 0; i < d.weight; i++) pool.push(id);
  }
  return pool[Math.floor(Math.random() * pool.length)] || 'midnight_martini';
}

function glassSvg(hue) {
  return `<svg class="glass-svg" viewBox="0 0 48 64" aria-hidden="true">
    <path class="glass-bowl" d="M10 8h28l-4 28H14z" fill="color-mix(in srgb, var(--drink-${hue}, var(--flame)) 72%, transparent)"
          stroke="color-mix(in srgb, var(--metal) 70%, #fff 30%)" stroke-width="1.6"/>
    <path d="M24 36v16" stroke="var(--metal)" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M16 54h16" stroke="var(--metal)" stroke-width="2.4" stroke-linecap="round"/>
    <ellipse cx="24" cy="10" rx="12" ry="3" fill="color-mix(in srgb, #fff 35%, transparent)"/>
  </svg>`;
}

function segsHtml(val) {
  let h = '';
  for (let i = 1; i <= MAX; i++) {
    h += `<button type="button" class="seg${i <= val ? ' on' : ''}" data-n="${i}" aria-label="${i}"></button>`;
  }
  return h;
}

/**
 * 바 카운터 칵테일 게임을 켠다.
 * @param {object} o
 * @param {HTMLElement} o.slot
 * @param {(dish,stage)=>void} o.onChange
 * @param {(ev:{ok:boolean,id:string,dish:object})=>void} [o.onShake]
 * @param {(id:string)=>void} [o.onMixed]  성공한 레시피 id
 */
export function startCocktails({ slot, onChange, onShake, onMixed }) {
  let recipeId = pickRecipe();
  let stageIdx = 0; // empty
  let pour = { spirit: 0, citrus: 0, sweet: 0 };
  let timer = null;
  let shaking = false;

  function dish() { return DISHES[recipeId] || DISHES.none; }
  function stage() {
    if (stageIdx === 0) return null;
    return STAGES[stageIdx];
  }

  function schedule(ms, fn) {
    clearTimeout(timer);
    if (ms > 0) timer = setTimeout(fn, ms);
  }

  function render() {
    const d = dish();
    const st = STAGES[stageIdx];
    const hasGlass = st.id === 'ready' || st.id === 'flat';
    const mixing = st.id === 'empty' || st.id === 'mixing';

    slot.innerHTML = `
      <div class="cocktail-desk" data-stage="${st.id}">
        <div class="recipe-card" aria-live="polite">
          <span class="rc-whisper">${mixing ? d.whisper : (hasGlass ? d.label : '—')}</span>
        </div>
        <div class="mixer" ${hasGlass ? 'hidden' : ''}>
          <div class="shaker ${shaking ? 'go' : ''}" aria-hidden="true">
            <i class="shaker-cap"></i><i class="shaker-body"></i>
          </div>
          <div class="meters" role="group" aria-label="조율">
            ${INGS.map((k) => `
              <div class="meter" data-ing="${k}">
                <span class="m-lab">${ING_LABEL[k]}</span>
                <button type="button" class="m-btn m-minus" data-ing="${k}" aria-label="${ING_LABEL[k]} 줄이기">−</button>
                <div class="segs" data-ing="${k}">${segsHtml(pour[k])}</div>
                <button type="button" class="m-btn m-plus" data-ing="${k}" aria-label="${ING_LABEL[k]} 늘리기">+</button>
              </div>`).join('')}
          </div>
          <button type="button" class="btn-shake">Shake</button>
        </div>
        <div class="glass-rail" data-hue="${d.hue}" data-stage="${st.id}" ${hasGlass ? '' : 'hidden'}>
          ${hasGlass ? glassSvg(d.hue) : ''}
        </div>
      </div>`;

    slot.dataset.stage = st.id;
    slot.dataset.dish = hasGlass ? recipeId : 'none';
    slot.dataset.seat = 'rail';

    // dish.img 호환 — 레일에 잔이 있으면 "뭔가 있음"
    const view = {
      ...d,
      img: hasGlass ? 'glass' : '',
      eatable: d.eatable,
      label: hasGlass ? d.label : (mixing ? d.label : '빈 바'),
    };
    onChange?.(view, hasGlass ? st : (mixing ? { id: 'mixing', label: '조율 중' } : null));
  }

  function setPour(ing, n) {
    if (!INGS.includes(ing)) return;
    if (stageIdx > 1) return; // ready/flat 중엔 조율 잠금
    pour[ing] = Math.max(0, Math.min(MAX, n));
    stageIdx = 1; // mixing
    render();
  }

  function bump(ing, delta) {
    setPour(ing, pour[ing] + delta);
  }

  function match() {
    const d = dish();
    return INGS.every((k) => pour[k] === d[k]);
  }

  function nextRecipe(delay = 4_000) {
    schedule(delay, () => {
      recipeId = pickRecipe(recipeId);
      stageIdx = 0;
      pour = { spirit: 0, citrus: 0, sweet: 0 };
      shaking = false;
      render();
    });
  }

  function shake() {
    if (stageIdx > 1 || shaking) return { ok: false, why: 'busy' };
    shaking = true;
    stageIdx = 1;
    render();

    const ok = match();
    const id = recipeId;
    const d = dish();
    onShake?.({ ok, id, dish: d, phase: 'start' });

    schedule(520, () => {
      shaking = false;
      if (ok) {
        stageIdx = 2; // ready
        pour = { spirit: 0, citrus: 0, sweet: 0 };
        render();
        onMixed?.(id);
        // 안 마시면 김 빠짐
        schedule(STAGES[2].ms, () => {
          if (stageIdx !== 2) return;
          stageIdx = 3;
          render();
          schedule(STAGES[3].ms, () => {
            if (stageIdx !== 3) return;
            nextRecipe(1_200);
          });
        });
      } else {
        stageIdx = 1;
        render();
      }
      onShake?.({ ok, id, dish: d, phase: 'result' });
    });

    return { ok, id, dish: d };
  }

  function bite() {
    const d = dish();
    const st = STAGES[stageIdx];
    if (stageIdx < 2) {
      return { ate: false, why: stageIdx === 0 ? 'empty' : 'notyet', id: recipeId, dish: d, stage: st };
    }
    if (!EATABLE_STAGES.has(st.id)) {
      return { ate: false, why: 'notyet', id: recipeId, dish: d, stage: st };
    }
    const id = recipeId;
    const drunk = d;
    const stageSnap = st;
    clearTimeout(timer);
    stageIdx = 0;
    pour = { spirit: 0, citrus: 0, sweet: 0 };
    recipeId = pickRecipe(id);
    render();
    return { ate: true, id, dish: drunk, stage: stageSnap };
  }

  const peek = () => {
    const d = dish();
    const st = STAGES[stageIdx];
    const hasGlass = st.id === 'ready' || st.id === 'flat';
    return {
      id: hasGlass ? recipeId : 'none',
      dish: { ...d, img: hasGlass ? 'glass' : '', label: hasGlass ? d.label : '빈 바' },
      stage: hasGlass ? st : null,
      recipeId,
      pour: { ...pour },
      mixing: stageIdx <= 1,
    };
  };

  function onSlotClick(e) {
    const t = e.target.closest('[data-ing], .btn-shake, .seg');
    if (!t) return;
    e.stopPropagation();
    e.preventDefault();

    if (t.classList.contains('btn-shake')) {
      shake();
      return;
    }
    if (t.classList.contains('seg')) {
      const ing = t.parentElement?.dataset?.ing;
      const n = Number(t.dataset.n);
      if (ing) setPour(ing, n);
      return;
    }
    if (t.classList.contains('m-plus')) bump(t.dataset.ing, 1);
    if (t.classList.contains('m-minus')) bump(t.dataset.ing, -1);
  }

  slot.addEventListener('click', onSlotClick);
  render();

  function stop() {
    clearTimeout(timer);
    slot.removeEventListener('click', onSlotClick);
  }

  return { bite, peek, stop, shake, setPour };
}

/** 예전 roast.js 이름 호환 */
export const startRoast = startCocktails;
