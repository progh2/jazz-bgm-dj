# -*- coding: utf-8 -*-
"""Expand jazz BGM catalog: scrape free-license channels, classify, verify, write playlist."""
import sys, os, json, re, csv, time, datetime, concurrent.futures as cf
from collections import defaultdict, OrderedDict, Counter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
sys.path.insert(0, os.path.join(ROOT, "tools"))

import yt
from channels_jazz import CHANNELS
from classify_jazz import SUB, ORDER, classify, focus_score, clean, is_jazzish, TITLE_SCENE
import verify as V

CAP = int(os.environ.get("CAP", "55"))  # per-scene cap
MIN_LEN = 45
MAX_LEN = 900  # prefer non-1HOUR; allow up to 15min singles
AUTHOR_OK = re.compile(
    r"Kevin MacLeod|incompetech|Audionautix|Jason Shaw|Twin Musicom|"
    r"Loyalty Freak|Komiku|Eric Matyas|Soundimage|MusMus|魔王魂|Maou|"
    r"TeknoAXE|Teknoaxe|Snabisch|SHW|Hamashio|"
    r"Kevin Macleod|"  # alternate capitalization
    r"Archive\.org|Internet Archive",
    re.I,
)
# Must NOT match bare "… - Topic" (major-label Topic channels)
NOISE = re.compile(
    r"\b(tutorial|how to|vlog|livestream|live stream|stream archive|announcement|"
    r"q&a|interview|behind the scenes|making of|update|unboxing|review|reaction|"
    r"podcast|trailer|teaser|shorts?|sfx|sound effects?|patreon|challenge|"
    r"official mv|lyric|karaoke)\b|#shorts|効果音|ボイス|カラオケ|歌唱|MV|PV|まとめ|メドレー",
    re.I,
)
MIX = re.compile(
    r"\b(mix vol|full album|album stream|compilation|megamix|medley|playlist|"
    r"best of|collection vol|\d+\s*tracks? in|1\s*hour|1hr|one hour|2\s*hours?|"
    r"3\s*hours?|10\s*hours?|hours? of)\b|メドレー|アルバム|\d+\s*曲",
    re.I,
)
COVER = re.compile(
    r"\b(cover(ed|s)?|tribute|arrange(d|ment)? of|remix of|originally by)\b|"
    r"\[COVER\]|カバー|カヴァー|歌ってみた|弾いてみた",
    re.I,
)

SEARCH_QUERIES = [
    ("Kevin MacLeod jazz", "Kevin MacLeod"),
    ("Kevin MacLeod swing", "Kevin MacLeod"),
    ("Kevin MacLeod blues", "Kevin MacLeod"),
    ("Kevin MacLeod bossa", "Kevin MacLeod"),
    ("Kevin MacLeod lounge", "Kevin MacLeod"),
    ("Kevin MacLeod ska", "Kevin MacLeod"),
    ("Kevin MacLeod funk", "Kevin MacLeod"),
    ("Kevin MacLeod noir", "Kevin MacLeod"),
    ("Kevin MacLeod spy", "Kevin MacLeod"),
    ("Kevin MacLeod cafe", "Kevin MacLeod"),
    ("Kevin MacLeod ragtime", "Kevin MacLeod"),
    ("Kevin MacLeod dixie", "Kevin MacLeod"),
    ("Kevin MacLeod samba", "Kevin MacLeod"),
    ("Kevin MacLeod cocktail", "Kevin MacLeod"),
    ("Kevin MacLeod saxophone", "Kevin MacLeod"),
    ("Kevin MacLeod big band", "Kevin MacLeod"),
    ("\"Dances and Dames\" Kevin MacLeod", "Kevin MacLeod"),
    ("\"Hep Cats\" Kevin MacLeod", "Kevin MacLeod"),
    ("\"Bass Walker\" Kevin MacLeod", "Kevin MacLeod"),
    ("\"Dixie Outlandish\" Kevin MacLeod", "Kevin MacLeod"),
    ("\"Swinging With the Sultan\" Kevin MacLeod", "Kevin MacLeod"),
    ("\"Investigations\" Kevin MacLeod", "Kevin MacLeod"),
    ("Audionautix jazz", "Audionautix"),
    ("Audionautix swing", "Audionautix"),
    ("Audionautix blues", "Audionautix"),
    ("Audionautix lounge", "Audionautix"),
    ("Audionautix bossa", "Audionautix"),
    ("Jason Shaw jazz", "Audionautix"),
    ("Twin Musicom jazz", "Twin Musicom"),
    ("Twin Musicom lounge", "Twin Musicom"),
    ("Twin Musicom blues", "Twin Musicom"),
    ("Komiku jazz", "Komiku"),
    ("Loyalty Freak jazz", "Loyalty Freak"),
    ("Loyalty Freak lounge", "Loyalty Freak"),
    ("Eric Matyas jazz", "Eric Matyas"),
    ("Eric Matyas lounge", "Eric Matyas"),
    ("Eric Matyas blues", "Eric Matyas"),
    ("MusMus jazz", "MusMus"),
    ("MusMus ジャズ", "MusMus"),
    ("魔王魂 ジャズ", "魔王魂"),
    ("maou jazz", "魔王魂"),
    ("TeknoAXE jazz", "TeknoAXE"),
]


def scrape_channels(force=False):
    os.makedirs("data/channels", exist_ok=True)
    results = []
    for cid, name, lic, url, pages in CHANNELS:
        out = f"data/channels/{cid}.json"
        if os.path.exists(out) and not force:
            d = json.load(open(out))
            print(f"skip {name}: {len(d.get('videos',[]))} cached", flush=True)
            results.append(d)
            continue
        print(f"scraping {name} pages={pages} ...", flush=True)
        try:
            vids = yt.channel_videos(cid, max_pages=pages, sleep=0.65)
        except Exception as e:
            print(f"ERR {name}: {e}", flush=True)
            continue
        d = {"channelId": cid, "name": name, "license": lic, "url": url, "videos": vids}
        json.dump(d, open(out, "w"), ensure_ascii=False, indent=0)
        print(f"ok {name}: {len(vids)}", flush=True)
        results.append(d)
    return results


def search_extra():
    """Targeted searches to catch jazz tracks not obvious from channel dumps alone."""
    out_path = "data/search_jazz.json"
    found = json.load(open(out_path)) if os.path.exists(out_path) else {}
    for q, artist_hint in SEARCH_QUERIES:
        if any(v.get("query") == q for v in found.values()):
            continue
        print(f"search: {q}", flush=True)
        try:
            res = yt.search(q, cc=False, pages=2, sleep=0.7)
        except Exception as e:
            print(f"  err {e}", flush=True)
            continue
        n = 0
        for v in res:
            ch = v.get("channel") or ""
            if not re.search(
                r"Kevin MacLeod|Audionautix|Jason Shaw|Twin Musicom|Loyalty Freak|"
                r"Komiku|Eric Matyas|Soundimage|MusMus|魔王魂|Maou|TeknoAXE|Snabisch|SHW",
                ch, re.I,
            ):
                continue
            # reject major-label Topic channels that aren't our artists
            if re.search(r" - Topic$", ch) and not re.search(
                r"Audionautix|Jason Shaw|Twin Musicom|Komiku|Loyalty Freak|"
                r"Kevin MacLeod|Snabisch",
                ch, re.I,
            ):
                continue
            vid = v["videoId"]
            if vid in found:
                found[vid]["query"] = found[vid].get("query", "") + "|" + q
                continue
            L = v.get("length")
            if L is not None and (L < 45 or L > 900):
                continue
            found[vid] = {
                "videoId": vid, "title": v["title"], "channel": ch,
                "length": L, "artist_hint": artist_hint,
                "query": q, "origin": "search",
            }
            n += 1
        print(f"  kept {n} / {len(res)}", flush=True)
        json.dump(found, open(out_path, "w"), ensure_ascii=False, indent=0)
        time.sleep(0.5)
    return found


def artist_for_channel(name):
    # normalize Topic channel display names
    n = name or ""
    if "Kevin" in n: return "Kevin MacLeod"
    if "Audionautix" in n or "Jason Shaw" in n: return "Audionautix / Jason Shaw"
    if "Twin Musicom" in n: return "Twin Musicom"
    if "Loyalty" in n or "Komiku" in n: return "Loyalty Freak Music / Komiku"
    if "Eric Matyas" in n or "Soundimage" in n: return "Eric Matyas (Soundimage.org)"
    if "MusMus" in n: return "MusMus"
    if "魔王" in n or "Maou" in n: return "魔王魂 (森田交一)"
    if "TeknoAXE" in n or "Teknoaxe" in n: return "TeknoAXE"
    if "Snabisch" in n: return "Snabisch"
    if "SHW" in n or "Hamashio" in n: return "SHW (Hamashio)"
    return n.split("(")[0].strip() or n


def load_seed():
    path = "data/seed_tracks.json"
    if not os.path.exists(path):
        return []
    return json.load(open(path))


def collect_rows(channel_docs, search_docs):
    rows = []
    seen = set()

    # seeds first (trusted)
    for s in load_seed():
        vid = s["videoId"]
        if vid in seen: continue
        seen.add(vid)
        rows.append({
            "videoId": vid, "title": s["title"], "artist": s.get("artist", "Kevin MacLeod"),
            "license": s.get("license", "CC BY 4.0"),
            "source": "https://incompetech.com/",
            "length": s.get("length") or None,
            "origin": "seed", "forced_sub": s.get("scene"),
            "focus_hint": s.get("focus"),
        })

    lic_by_artist = {}
    for cid, name, lic, url, pages in CHANNELS:
        lic_by_artist[name] = (lic, url)
        short = artist_for_channel(name)
        lic_by_artist[short] = (lic, url)

    for d in channel_docs:
        artist = artist_for_channel(d["name"])
        lic, url = d["license"], d["url"]
        for v in d.get("videos", []):
            vid = v.get("videoId")
            title = v.get("title") or ""
            if not vid or not title or vid in seen: continue
            if NOISE.search(title) or COVER.search(title) or MIX.search(title): continue
            L = v.get("length")
            if L is not None and (L < MIN_LEN or L > MAX_LEN): continue
            # Prefer jazzish titles; also keep known MacLeod jazz piece names
            low = title.lower()
            known = any(k in low for k in TITLE_SCENE)
            if not known and not is_jazzish(title):
                continue
            seen.add(vid)
            rows.append({
                "videoId": vid, "title": title, "artist": artist,
                "license": lic, "source": url, "length": L,
                "origin": "channel",
            })

    for vid, v in search_docs.items():
        if vid in seen: continue
        title = v.get("title") or ""
        if NOISE.search(title) or COVER.search(title) or MIX.search(title): continue
        L = v.get("length")
        if L is not None and (L < MIN_LEN or L > MAX_LEN): continue
        q = v.get("query") or ""
        hint = v.get("artist_hint") or ""
        keep = is_jazzish(title) or is_jazzish(q) or any(k in title.lower() for k in TITLE_SCENE)
        # quoted title hunts from free-artist pages
        if not keep and '"' in q and hint in (
            "Audionautix", "Kevin MacLeod", "Komiku", "Twin Musicom",
            "Eric Matyas", "MusMus", "魔王魂", "TeknoAXE", "Loyalty Freak",
        ):
            keep = True
        if not keep:
            continue
        ch = v.get("channel") or ""
        artist = artist_for_channel(ch) if ch else artist_for_channel(hint)
        lic, url = lic_by_artist.get(artist, ("Free with attribution", "https://www.youtube.com/"))
        for cid, name, lic2, url2, _ in CHANNELS:
            if artist_for_channel(name) == artist or hint in name:
                lic, url = lic2, url2
                artist = artist_for_channel(name)
                break
        seen.add(vid)
        rows.append({
            "videoId": vid, "title": title, "artist": artist,
            "license": lic, "source": url, "length": L,
            "origin": "search",
        })
    return rows


def classify_rows(rows):
    out = []
    for r in rows:
        if REJECT_TITLE.search(r["title"]):
            continue
        if r.get("forced_sub"):
            sub = r["forced_sub"]
            alts = []
            focus = r.get("focus_hint") or focus_score(r["title"], sub, r.get("length"))
        else:
            res = classify(r["title"])
            if not res:
                # soft default for clearly jazz-adjacent but unkeyworded titles
                if is_jazzish(r["title"]) or r.get("origin") in ("seed", "search", "channel"):
                    sub = "B9_smooth"
                    alts = []  # no fake venue alts — avoids polluting cafe/lounge
                    focus = focus_score(r["title"], sub, r.get("length"))
                else:
                    continue
            else:
                sub = res[0][0]
                alts = [k for k, _ in res[1:3]]
                focus = focus_score(r["title"], sub, r.get("length"))
        rr = dict(r)
        rr["sub"] = sub
        rr["alts"] = alts
        rr["focus"] = focus
        out.append(rr)
    # dedupe same cleaned title + artist (keep highest focus, then mid-length)
    best = {}
    for r in out:
        key = (clean(r["title"]).lower(), r["artist"])
        prev = best.get(key)
        if not prev:
            best[key] = r
            continue
        def score(x):
            L = x.get("length") or 180
            mid = -abs(L - 200)
            return (x["focus"], mid, -(L if L < 600 else 0))
        if score(r) > score(prev):
            best[key] = r
    return list(best.values())


REJECT_TITLE = re.compile(
    r"\b(8[- ]?bit|chiptune|glitch hop|synthwave|synthpop|drum and bass|\bdnb\b|"
    r"industrial|game show|grunge ballad|monster ballad|ballad of (aether|the gretsch|the zebra|the city|the eighties)|"
    r"electro(?!\s*swing)|house/electro|alternative rock|"
    r"van gelder|blue note|remastered|fiddling|tricone|solicitors reels|"
    r"horror music|ghost story)\b",
    re.I,
)


def pick(rows, cap):
    rows = sorted(rows, key=lambda r: (-r["focus"], -(r.get("length") or 0) if (r.get("length") or 0) < 600 else -300, r["title"]))
    buckets = defaultdict(list)
    for r in rows:
        buckets[r["artist"]].append(r)
    out = []
    while len(out) < cap and any(buckets.values()):
        for a in list(buckets):
            if buckets[a]:
                out.append(buckets[a].pop(0))
                if len(out) >= cap:
                    break
            else:
                del buckets[a]
    return out


def select_and_verify(classified):
    by = defaultdict(list)
    for r in classified:
        by[r["sub"]].append(r)

    selection = {}
    for sub in ORDER:
        cand = pick(by[sub], CAP * 3)
        if len(cand) < CAP:
            alt = [r for r in classified if sub in r.get("alts", []) and r["sub"] != sub]
            have = {r["videoId"] for r in cand}
            for r in pick(alt, CAP * 2):
                if r["videoId"] in have: continue
                cand.append(dict(r, sub=sub, focus=focus_score(r["title"], sub, r.get("length")), via="alt"))
                have.add(r["videoId"])
        selection[sub] = cand

    all_ids = list({r["videoId"] for s in selection.values() for r in s})
    print(f"verifying {len(all_ids)} videos via oEmbed ...", flush=True)
    res = V.verify(all_ids, workers=6)

    final = {sub: [] for sub in ORDER}
    used = set()
    for phase in ("primary", "backfill"):
        for sub in ORDER:
            cur = final[sub]
            for r in selection[sub]:
                if len(cur) >= CAP:
                    break
                vid = r["videoId"]
                if vid in used:
                    continue
                info = res.get(vid) or {}
                if not info.get("ok"):
                    continue
                author = info.get("author") or ""
                # Reject unknown uploaders (esp. major-label Topic channels)
                if author and not AUTHOR_OK.search(author):
                    continue
                # Also reject if yt title looks like commercial remaster of famous jazz
                yt_title = info.get("yt_title") or r.get("title") or ""
                if re.search(r"van gelder|blue note|remastered\s*19|remastered\s*20|"
                             r"miles davis|john coltrane|thelonious|charlie parker|"
                             r"duke ellington|billie holiday|jackie mclean", yt_title, re.I):
                    continue
                cur.append(dict(r, yt_author=author))
                used.add(vid)
    return final


def write_outputs(final):
    today = datetime.date.today().isoformat()
    cats = OrderedDict()
    for sub in ORDER:
        cat, ko, _, _ = SUB[sub]
        tracks = []
        for r in final[sub]:
            title = clean(r["title"]) or r["title"]
            tracks.append({
                "id": f"{sub.lower()}-{r['videoId'].lower()}",
                "title": title,
                "artist": r["artist"],
                "videoId": r["videoId"],
                "focus": int(r["focus"]),
                "length": int(r["length"] or 180),
                "license": r["license"],
                "source": f"https://www.youtube.com/watch?v={r['videoId']}",
            })
        cats.setdefault(cat, []).append({
            "id": sub, "name": ko, "count": len(tracks), "tracks": tracks,
        })

    doc = {
        "title": "Jazz BGM by scene",
        "generated": today,
        "note": "Free-license jazz/lounge/blues tracks from vetted artist channels (Kevin MacLeod, Audionautix, Twin Musicom, Komiku, Eric Matyas, MusMus, 魔王魂, …). Classified by title heuristics; verified via YouTube oEmbed.",
        "categories": [{"name": k, "subcategories": v} for k, v in cats.items()],
    }
    json.dump(doc, open("data/bgm_playlist.json", "w"), ensure_ascii=False, indent=2)

    with open("data/bgm_playlist.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["category", "sub_id", "sub_name", "title", "artist", "videoId", "url", "license", "length_sec", "focus", "origin"])
        for c in doc["categories"]:
            for s in c["subcategories"]:
                for t in s["tracks"]:
                    # find origin from final
                    origin = ""
                    for r in final[s["id"]]:
                        if r["videoId"] == t["videoId"]:
                            origin = r.get("origin", "")
                            break
                    w.writerow([c["name"], s["id"], s["name"], t["title"], t["artist"], t["videoId"],
                                t["source"], t["license"], t["length"], t["focus"], origin])
    return doc


def write_markdown(doc):
    lines = []
    tot = sum(s["count"] for c in doc["categories"] for s in c["subcategories"])
    filled = sum(1 for c in doc["categories"] for s in c["subcategories"] if s["count"] > 0)
    arts = Counter(t["artist"] for c in doc["categories"] for s in c["subcategories"] for t in s["tracks"])
    lics = Counter(t["license"] for c in doc["categories"] for s in c["subcategories"] for t in s["tracks"])

    lines.append("# 재즈 BGM — 무료 라이선스 음원 목록\n")
    lines.append(f"> 생성일 {doc['generated']} · 재생기 형식 `{{id,title,artist,videoId}}` · 집중도 `focus` 1~5 (5 = 작업용 최적)\n")
    lines.append("> 데이터: `data/bgm_playlist.json`, `data/bgm_playlist.csv`, `bgm-scenes.js`\n")
    lines.append(f"\n**총 {tot}곡 / {filled}/34 장면 / {len(arts)} 아티스트.** 전 곡 YouTube oEmbed 검증.\n")
    lines.append("\n## 장면별 곡 수\n")
    lines.append("| 장면 | 곡 수 | 대표 곡 |\n|---|---:|---|")
    for c in doc["categories"]:
        for s in c["subcategories"]:
            tops = ", ".join(t["title"] for t in sorted(s["tracks"], key=lambda t: -t["focus"])[:3]) or "—"
            lines.append(f"| `{s['id']}` {s['name']} | {s['count']} | {tops} |")

    lines.append("\n## 라이선스\n")
    lines.append("| 라이선스 | 곡 수 |\n|---|---:|")
    for k, v in lics.most_common():
        lines.append(f"| {k} | {v} |")
    lines.append("\n## 아티스트별\n")
    lines.append(", ".join(f"{a} {n}" for a, n in arts.most_common()))
    lines.append("\n\n## 수집 방법\n")
    lines.append(
        "- 화이트리스트 채널(`tools/channels_jazz.py`) 업로드 + 타깃 검색. YouTube CC 필터 단독 사용 안 함.\n"
        "- 제목 키워드로 재즈·라운지·블루스·스윙·보사 등만 통과 후 34 장면 분류.\n"
        "- oEmbed로 존재·임베드 가능 확인. 분류는 휴리스틱이라 오분류 가능.\n"
    )
    open("jazz_bgm_free_playlist.md", "w", encoding="utf-8").write("\n".join(lines))
    return tot, filled


def main():
    force = "--force" in sys.argv
    skip_search = "--no-search" in sys.argv
    channel_docs = scrape_channels(force=force)
    if skip_search:
        path = "data/search_jazz.json"
        search_docs = json.load(open(path)) if os.path.exists(path) else {}
        print(f"loaded search cache: {len(search_docs)}", flush=True)
    else:
        search_docs = search_extra()
    rows = collect_rows(channel_docs, search_docs)
    print(f"candidate rows: {len(rows)}", flush=True)
    classified = classify_rows(rows)
    print(f"classified: {len(classified)}", flush=True)
    c = Counter(r["sub"] for r in classified)
    for k in ORDER:
        print(f"  {k:16s} {c.get(k,0):4d}")
    json.dump(classified, open("data/classified_jazz.json", "w"), ensure_ascii=False, indent=0)

    final = select_and_verify(classified)
    doc = write_outputs(final)
    tot, filled = write_markdown(doc)
    print("TOTAL", tot, "scenes_filled", filled)
    for c in doc["categories"]:
        for s in c["subcategories"]:
            print(f"{s['id']:16s} {s['count']:3d}")


if __name__ == "__main__":
    main()
