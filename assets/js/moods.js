// moods.js — 34개 장면을 10가지 무드로 묶고, 무드마다 팔레트를 준다.
// 재생 중인 곡에 따라 페이지 배색을 바꾸는 데 쓰인다.

export const MOODS = {
  calm:     { label: '평온',    accent: '#7fd0bd', deep: '#124b45', glow: '#bff0e6', record: '#2f7d70' },
  pastoral: { label: '한가로움', accent: '#a8cf74', deep: '#2c4a1f', glow: '#dcf2b4', record: '#4f7a30' },
  wonder:   { label: '공간감',  accent: '#6eb0c8', deep: '#1a3a4a', glow: '#b8e0f0', record: '#3a7088' },
  tender:   { label: '애틋함',  accent: '#eda0b4', deep: '#4e2137', glow: '#ffd6e2', record: '#a34a68' },
  sorrow:   { label: '블루',    accent: '#8fb0d8', deep: '#1d2f4c', glow: '#cde0f7', record: '#3d5f8f' },
  noble:    { label: '엘레강스', accent: '#e2bb63', deep: '#4a3711', glow: '#ffe7ad', record: '#9c7420' },
  dread:    { label: '누아르',  accent: '#8a9ab0', deep: '#1e2838', glow: '#c0ccd8', record: '#3a4a60' },
  ember:    { label: '그루브',  accent: '#e8763f', deep: '#521f0e', glow: '#ffbf9b', record: '#b55a1e' },
  frost:    { label: '쿨',      accent: '#79c6e0', deep: '#123f50', glow: '#bde9f8', record: '#2c718c' },
  merry:    { label: '스윙',    accent: '#f0b13c', deep: '#4f2c0b', glow: '#ffdcaa', record: '#a86020' },
};

/** 장면 → 무드 */
export const SCENE_MOOD = {
  A1_curtain: 'merry',    A2_intro: 'merry',      A3_break: 'calm',       A4_close: 'tender',
  B1_swing: 'merry',      B2_bebop: 'ember',      B3_cool: 'frost',       B4_hardbop: 'ember',
  B5_modal: 'wonder',     B6_latin: 'pastoral',   B7_blues: 'sorrow',     B8_ballad: 'tender',
  B9_smooth: 'calm',      B10_fusion: 'ember',    B11_free: 'dread',      B12_dixie: 'merry',
  B13_soul: 'merry',      B14_noir: 'dread',
  C1_lounge: 'calm',      C2_cafe: 'pastoral',    C3_speakeasy: 'ember',  C4_rooftop: 'frost',
  C5_festival: 'merry',   C6_studio: 'calm',      C7_dance: 'ember',
  D1_melancholy: 'sorrow', D2_romance: 'tender',  D3_uplift: 'merry',     D4_tense: 'dread',
  D5_playful: 'merry',    D6_elegant: 'noble',    D7_rainy: 'frost',      D8_afterhours: 'tender',
  D9_dawn: 'pastoral',
};

export const moodKeyOf = (sceneId) => SCENE_MOOD[sceneId] || 'calm';
export const moodOf = (sceneId) => MOODS[moodKeyOf(sceneId)];
