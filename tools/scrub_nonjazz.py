# -*- coding: utf-8 -*-
"""Remove non-jazz false positives from data/bgm_playlist.json and regenerate bgm-scenes.js."""
import json, re, csv, datetime, subprocess
from pathlib import Path
from collections import defaultdict

KNOWN = {
  'dances and dames', 'i knew a guy', 'vibe ace', 'as i figure', 'faster does it',
  'acidjazz', 'acid jazz', 'night on the docks - sax', 'night on the docks - piano',
  'night on the docks - trumpet', 'backed vibes clean', 'backed vibes - clean', 'backed vibes',
  'off to osaka', 'bossa antigua', 'lobby time', 'george street shuffle', 'cool vibes',
  'smooth lovin', 'jazz brunch', 'hard boiled', 'spy glass', 'wallpaper',
  'whiskey on the mississippi', 'airport lounge', 'backbay lounge', 'big band swingin',
  'hot swing', 'acoustic blues', 'bass walker', 'bass walker - film noir', 'hep cats',
  'hep cats by', 'ultralounge', 'easy lemon',
}
POS = re.compile(
  r'(jazz|jazzy|재즈|ジャズ|스윙)|'
  r'\b(swing|bebop|be-?bop|hardbop|hard-?bop|dixie(land)?|ragtime|stride|'
  r'bossa|samba|latin jazz|mambo|afro-?cuban|big\s*band|cool jazz|smooth jazz|soul jazz|'
  r'acid\s*jazz|acidjazz|electro\s*swing|noir|hard[- ]?boiled|film noir|blues|blue note|'
  r'boogie(?:\s*woogie)?|sax(ophone)?|vibraphone|\bvibes\b|lounge|cocktail|speakeasy|'
  r'night on the docks|jazz brunch|lobby time|hep cats?|trad(?:itional)?\s*jazz|'
  r'new orleans|hot jazz|ultralounge|airport lounge|backbay lounge|spy glass|wallpaper\b)\b',
  re.I)
NEG = re.compile(
  r'\b(chill rock|soft rock|retro/?\s*rock|medium rock|sax,\s*rock|rock/funk|funk/rock|'
  r'pop/funk/rock|indie rock|hard rock|metal|punk(?!\s*jazz)|grunge|hip[- ]?hop|rap\b|trap\b|'
  r'edm|dubstep|techno|trance|chiptune|8[- ]?bit|video\s*game|pixeltown|pixel spy|'
  r'christmas|xmas|holiday|halloween|orchestra/festive|festive/drama|comedy/drama|book club|'
  r'celtic|medieval|fantasy|pirate|viking|scarab|elvish|cretaceous|\bska\b|reggae|islandesque|'
  r'country\b|bluegrass|horror|zombie|g\s*funk|funkorama|happy go lucky|chilled for the holidays|'
  r'prancing o snow|midnight tale|light trail|glass lounge|lounge of fuzz|monster chill lounge|'
  r'playing it cool - saxophone/soft rock|amazing grace|disco lounge|beach party|summer love part)\b',
  re.I)

def norm(title):
  return re.sub(r'\s+', ' ', title).strip().lower()

def main():
  doc = json.loads(Path('data/bgm_playlist.json').read_text())
  scenes, all_tracks = [], []
  for c in doc['categories']:
    for s in c['subcategories']:
      scenes.append((c['name'], s['id'], s['name']))
      for t in s['tracks']:
        all_tracks.append({**t, 'scene': s['id']})
  keep, drop = [], []
  for t in all_tracks:
    title, n = t['title'], norm(t['title'])
    known = any(n == k or n.startswith(k) for k in KNOWN)
    if NEG.search(title) and not known:
      drop.append((t, 'neg')); continue
    if known or POS.search(title):
      keep.append(t); continue
    drop.append((t, 'no-signal'))
  by_vid = {}
  for t in keep:
    prev = by_vid.get(t['videoId'])
    if not prev or t.get('focus', 0) > prev.get('focus', 0):
      by_vid[t['videoId']] = t
  keep = list(by_vid.values())
  by_scene = defaultdict(list)
  for t in keep:
    row = {k: t[k] for k in t if k != 'scene'}
    by_scene[t['scene']].append(row)
  cats = {}
  for cat, sid, name in scenes:
    cats.setdefault(cat, []).append((sid, name))
  new_doc = {
    'title': 'Jazz BGM by scene (scrubbed)',
    'generated': datetime.date.today().isoformat(),
    'note': 'Jazz & jazz-adjacent only after scrub_nonjazz.py',
    'categories': []
  }
  for cat, items in cats.items():
    subs = []
    for sid, name in items:
      tracks = sorted(by_scene.get(sid, []), key=lambda t: (-t.get('focus', 0), t['title']))
      subs.append({'id': sid, 'name': name, 'count': len(tracks), 'tracks': tracks})
    new_doc['categories'].append({'name': cat, 'subcategories': subs})
  Path('data/bgm_playlist.json').write_text(json.dumps(new_doc, ensure_ascii=False, indent=2))
  with open('data/bgm_playlist.csv', 'w', newline='', encoding='utf-8') as f:
    w = csv.writer(f)
    w.writerow(['scene','id','title','artist','videoId','focus','length','license'])
    for c in new_doc['categories']:
      for s in c['subcategories']:
        for t in s['tracks']:
          w.writerow([s['id'], t['id'], t['title'], t['artist'], t['videoId'], t['focus'], t['length'], t['license']])
  Path('data/scrubbed_nonjazz.json').write_text(json.dumps([
    {'why': w, 'scene': t['scene'], 'title': t['title'], 'artist': t['artist'], 'videoId': t['videoId']}
    for t, w in drop
  ], ensure_ascii=False, indent=2))
  subprocess.check_call(['python3', 'tools/make_player_snippet.py'])
  js = Path('bgm-scenes.js')
  js.write_text(js.read_text().replace('고전 콘솔 RPG 장면 분류(34종)', '재즈 장면·장르 분류(34종)'))
  print(f'kept {len(keep)}, dropped {len(drop)}')

if __name__ == '__main__':
  main()
