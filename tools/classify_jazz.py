# -*- coding: utf-8 -*-
"""Keyword-based scene classifier for jazz / lounge / blues-adjacent BGM titles."""
import re

# subcategory id -> (category, ko name, regex keywords, focus_default)
SUB = {
    "A1_curtain": ("오프닝·신호", "커튼콜 / 개장",
        r"\b(curtain|open(ing)? (night|club|set)|doors? open|welcome|house (open|lights)|enter|arrival|overture|fanfare|call to|showtime|lights up)\b|커튼|개장|오프닝", 4),
    "A2_intro": ("오프닝·신호", "밴드 인트로 / 테마",
        r"\b(intro(duction)?|theme|main theme|bandstand|hit it|count( |-)?in|take (one|1)|set (theme|opener)|signature)\b|인트로|테마|주제", 3),
    "A3_break": ("오프닝·신호", "브레이크 / 인터미션",
        r"\b(break|intermission|interlude|pause|breath(er)?|in[- ]between|sting|jingle|short cue)\b|브레이크|인터미션|간주", 4),
    "A4_close": ("오프닝·신호", "라스트콜 / 클로징",
        r"\b(last call|closing|close(d|out|ing)?|finale|end of (the )?(night|set)|lights out|goodbye|farewell|sign[- ]off|wrap ?up)\b|라스트콜|클로징|폐장|끝", 5),

    "B1_swing": ("장르·결", "스윙 / 빅밴드",
        r"\b(swing|big ?band|shuffle|fox[- ]?trot|jitterbug|lindy|charleston|swingin'?|swinging|brass section|jump blues)\b|스윙|빅밴드|셔플", 4),
    "B2_bebop": ("장르·결", "비밥",
        r"\b(bebop|be[- ]?bop|hard ?bop(?!)|fast jazz|uptempo jazz|bop)\b|비밥|비밥", 2),
    "B3_cool": ("장르·결", "쿨 재즈",
        r"\b(cool (jazz|vibes?)|west coast|mellow (jazz|vibe)|laid[- ]?back|understated|vibraphone|vibe ace|cool vibes)\b|쿨\s*재즈|쿨한", 5),
    "B4_hardbop": ("장르·결", "하드밥",
        r"\b(hard ?bop|gospel jazz|soulful jazz|cooking|blowing session)\b|하드밥", 3),
    "B5_modal": ("장르·결", "모달",
        r"\b(modal|mode(s)? |kind of blue|impressionist|spacey jazz|open harmony|drone jazz)\b|모달", 5),
    "B6_latin": ("장르·결", "라틴 / 보사 / 삼바",
        r"\b(bossa|nova|samba|latin|mambo|rumba|cha[- ]?cha|afro[- ]?cuban|salsa|calypso|osaka|antigua|tropical|brazilian)\b|보사|삼바|라틴|맘보", 5),
    "B7_blues": ("장르·결", "재즈 블루스",
        r"\b(blues|blue note|12[- ]?bar|shuffle blues|jazz blues|walking bass|harmonica)\b|블루스", 4),
    "B8_ballad": ("장르·결", "발라드",
        r"\b(ballad|slow (dance|jazz)|tender|lovin|lullaby|nocturne|adagio|soft sax|smooth lovin)\b|발라드|느린", 5),
    "B9_smooth": ("장르·결", "스무스 / 컨템포러리",
        r"\b(smooth|easy (lemon|listening)|contemporary|lounge jazz|backed vibes|wallpaper|soft groove|chill jazz|elevator)\b|스무스|이지리스닝", 5),
    "B10_fusion": ("장르·결", "퓨전 / 일렉트릭",
        r"\b(fusion|electric jazz|jazz[- ]?rock|jazz[- ]?funk|synth jazz|rhodes|electric piano|nu[- ]?jazz|acid jazz)\b|퓨전|일렉|애시드", 3),
    "B11_free": ("장르·결", "프리 / 아방가르드",
        r"\b(free jazz|avant[- ]?garde|experimental jazz|atonal|improv(isation)? free)\b|프리\s*재즈|아방가르드", 1),
    "B12_dixie": ("장르·결", "딕실랜드 / 트래디셔널",
        r"\b(dixie(land)?|trad(itional)? jazz|new orleans|ragtime|stride|hot jazz|trad jazz|clarinets?)\b|딕시|딕실랜드|래그타임|뉴올리언스", 3),
    "B13_soul": ("장르·결", "소울 재즈 / 펑키",
        r"\b(soul (jazz)?|funky|funk|groove|organ|hammond|acidjazz|acid jazz|boogie|get down)\b|소울|펑키|펑크|그루브|오르간", 3),
    "B14_noir": ("장르·결", "누아르 / 탐정",
        r"\b(noir|detective|hard[- ]?boiled|private eye|gumshoe|femme fatale|dances and dames|i knew a guy|spy|shadow(s|y)?|dark alley|crime|mystery jazz|film noir)\b|누아르|탐정|느와르", 5),

    "C1_lounge": ("장소", "미드나잇 라운지",
        r"\b(lounge|cocktail|midnight|night (on the )?docks|sax(ophone)?|late night|dim light|velvet|martini|after dark|night club|nightclub)\b|라운지|칵테일|미드나잇|색소폰", 5),
    "C2_cafe": ("장소", "브런치 카페",
        r"\b(cafe|café|brunch|coffee|lobby|bistro|bakery|morning jazz|daytime|patio|terrace cafe)\b|카페|브런치|커피|로비", 5),
    "C3_speakeasy": ("장소", "스피크이지",
        r"\b(speakeasy|whiskey|whisky|bourbon|prohibition|underground club|hidden bar|basement|smoky)\b|스피크이지|위스키|금지", 4),
    "C4_rooftop": ("장소", "루프탑 / 시티 라이트",
        r"\b(rooftop|skyline|city (lights?|nights?)|urban|metropolis|penthouse|highrise|downtown night)\b|루프탑|시티|야경|도시", 4),
    "C5_festival": ("장소", "야외 페스티벌",
        r"\b(festival|beach party|outdoor|parade|carnival|fiesta|summer fest|street fair|celebration)\b|페스티벌|축제|비치|야외", 3),
    "C6_studio": ("장소", "스튜디오 세션",
        r"\b(studio|session|rehearsal|trio|quartet|quintet|combo|practice|jam session|live take)\b|스튜디오|세션|트리오|쿼텟", 5),
    "C7_dance": ("장소", "댄스플로어",
        r"\b(dance(floor|able)?|ballroom|swing dance|boogy|boogie|disco jazz|party floor|feet)\b|댄스|무도|춤", 2),

    "D1_melancholy": ("감정·시간", "멜랑콜리 / 블루",
        r"\b(melanchol(y|ic)|sad(ness)?|sorrow|blue(s)? mood|lonely|alone|wistful|bittersweet|heartache|tears?)\b|멜랑콜리|쓸쓸|슬픔|애수", 5),
    "D2_romance": ("감정·시간", "로맨스",
        r"\b(roman(ce|tic)|love|lover|sweetheart|valentine|serenade|kiss|embrace|tender(ness)?|affection)\b|로맨스|사랑|연인", 5),
    "D3_uplift": ("감정·시간", "업리프트 / 선데이 모닝",
        r"\b(uplift(ing)?|sunday|spring|bright|cheerful|sunny|morning|optimistic|feel[- ]?good|happy|hopeful|shades of spring)\b|업리프트|선데이|아침|봄|밝은", 4),
    "D4_tense": ("감정·시간", "텐스 / 서스펜스",
        r"\b(tense|tension|suspense|spy glass|thriller|uneasy|nervous|edge|pressure|chase|danger|intrigue)\b|텐스|서스펜스|스릴|긴장", 3),
    "D5_playful": ("감정·시간", "플레이풀 / 위트",
        r"\b(playful|witty|quirky|fun(ny)?|cheeky|ska|cartoon|whimsical|silly|bouncy|jaunty|comic)\b|플레이풀|위트|스키|유머|장난", 3),
    "D6_elegant": ("감정·시간", "엘레강스 / 블랙타이",
        r"\b(elegant|black[- ]?tie|classy|sophisticated|glamour|glamorous|tuxedo|formal|deluxe|opulent|waltz jazz)\b|엘레강스|블랙타이|우아|세련", 4),
    "D7_rainy": ("감정·시간", "비 오는 창가",
        r"\b(rain(y|ing)?|drizzle|storm(y)?|wet|umbrella|window|puddle|gray day|grey day)\b|비\s*오|빗소리|장마|창가", 5),
    "D8_afterhours": ("감정·시간", "애프터아워 / 라스트 세트",
        r"\b(after[- ]?hours|last set|late night|moonlight|closing time|empty glass|last drink|mining by moonlight|wee hours)\b|애프터|라스트\s*세트|심야|달빛", 5),
    "D9_dawn": ("감정·시간", "새벽 / 빈 클럽",
        r"\b(dawn|sunrise|daybreak|empty (club|room|bar)|early morning|first light|aftermath|hangover|quiet morning)\b|새벽|일출|빈\s*클럽|아침", 5),
}

ORDER = list(SUB.keys())

# Prefer specific genre/mood hits over generic venue words
PRIORITY = [
    "B14_noir", "B6_latin", "B1_swing", "B12_dixie", "B13_soul", "B10_fusion",
    "B2_bebop", "B4_hardbop", "B11_free", "B7_blues", "B8_ballad", "B3_cool",
    "B5_modal", "B9_smooth", "D4_tense", "D5_playful", "D2_romance", "D7_rainy",
    "D1_melancholy", "D8_afterhours", "D9_dawn", "D3_uplift", "D6_elegant",
    "C3_speakeasy", "C5_festival", "C7_dance", "C1_lounge", "C2_cafe",
    "C4_rooftop", "C6_studio", "A4_close", "A1_curtain", "A2_intro", "A3_break",
]

BRAND = re.compile(
    r"【魔王魂公式】|魔王魂|フリーBGM素材|フリーBGM|無料フリーBGM|無料BGM|音楽素材MusMus|MusMus|"
    r"Royalty[- ]Free (Music|BGM)|Copyright[- ]free BGM|No Copyright|\(FREE DOWNLOAD\)|FREE DOWNLOAD|"
    r"Free Download|Free BGM|Free Music|Music Track|\(Looping\)|Looping|Kevin MacLeod|incompetech|"
    r"Audionautix|Jason Shaw|Twin Musicom|Loyalty Freak|Komiku|Eric Matyas|Soundimage|"
    r"TeknoAXE|CC[- ]BY|OFFICIAL|Official|YouTube|CHANNEL|Channel|20 ?min\.?|1 hour|1hr|"
    r"Extended|Loop(ed)?|Ver(sion)?\.?|ver\.|カラオケ|Karaoke|Instrumental|"
    r"\[|\]|【|】|『|』|「|」|#\d+|Topic",
    re.I,
)

def clean(title):
    t = BRAND.sub(" ", title)
    t = re.sub(r"\s+", " ", t).strip(" -–—|:・")
    return t

_RX = {k: re.compile(v[2], re.I) for k, v in SUB.items()}

# Broad jazz-adjacency gate (keep if title looks jazz/lounge/blues-ish)
JAZZISH = re.compile(
    r"\b("
    r"jazz|jazzy|blues|swing|bossa|samba|latin|lounge|cafe|café|cocktail|sax(ophone)?|"
    r"trumpet|trombone|clarinet|vibraphone|vibes?|piano trio|walking bass|big ?band|"
    r"bebop|bop|dixie|ragtime|ska|funk(y)?|soul|groove|noir|spy|detective|shuffle|"
    r"smooth|mellow|cool (vibe|jazz)|ballad|fusion|rhodes|organ|hammond|mambo|rumba|"
    r"speakeasy|whiskey|brunch|midnight|after[- ]?hours|night club|nightclub|"
    r"acidjazz|acid jazz|nu[- ]?jazz|trad(itional)?|boogie|rag\b|saloon|"
    r"late night|chillin|tiki|elevator|stomping|octoblues|got funk|groove grove|"
    r"jazzy frenchy|the elevator|swinging with|bass walker|dixie outlandish|"
    r"samba isobel|almost in f|mellowtron|darkest child|purely business|"
    r"big swing band|sideways samba|closer to jazz|standard jazz|plumber.?s rag|"
    r"okey dokey|panama hat|jumpin.? boogie|palm and soul|late night radio|"
    r"maple leaf|frogs? legs|leopard print|funky chunk|clean soul|airport lounge|"
    r"backbay|ultralounge|hot swing|acoustic blues|hep cats|local forecast|"
    r"mining by moonlight|carefree|bossa ?bossa|nonstop|blobby samba|"
    r"casa bossa|swinging pants|lobby time|"
    r"재즈|ジャズ|ブルーズ|ラウンジ|ボサ"
    r")\b|"
    r"jazz|ジャズ|재즈|blues|블루스|swing|스윙|bossa|보사|lounge|라운지|funk|groove|rag",
    re.I,
)

# Hard rejects — clearly not jazz-adjacent even if a weak keyword slips
REJECT = re.compile(
    r"\b("
    r"metal|death|dubstep|trap beat|drill|hardcore|scream|horror ambe|"
    r"8[- ]?bit|chiptune|gameboy|pokemon|minecraft|fortnite|"
    r"christmas carol|jingle bells|halloween spooky|"
    r"orchestral epic trailer|cinematic trailer|"
    r"glitch hop|synthwave|synthpop|drum and bass|dnb|industrial|"
    r"alternative rock|grunge|house/electro|electro(?!\s*swing)|"
    r"game show|swamp blues|"
    r"tutorial|how to|livestream|podcast|interview|vlog"
    r")\b|"
    r"効果音|ボイス|カラオケ|歌ってみた|弾いてみた",
    re.I,
)

CALM = re.compile(
    r"\b(calm|relax(ed|ing)?|peaceful|gentle|soft|quiet|ambient|chill|lo-?fi|serene|"
    r"tranquil|soothing|mellow|smooth|lounge|cafe|ballad|cool|dreamy|slow)\b|"
    r"穏やか|静か|癒し|リラックス|ラウンジ|穏やか",
    re.I,
)
LOUD = re.compile(
    r"\b(intense|aggressive|metal|hard ?rock|dubstep|edm|trap|fast|hype|extreme|"
    r"scream|rage|heavy|loud|party anthem)\b|激しい|メタル|ハード",
    re.I,
)

# Title overrides for well-known seed / MacLeod jazz pieces
TITLE_SCENE = {
    "dances and dames": "B14_noir",
    "i knew a guy": "B14_noir",
    "hard boiled": "B14_noir",
    "spy glass": "D4_tense",
    "vibe ace": "B3_cool",
    "cool vibes": "B3_cool",
    "as i figure": "B1_swing",
    "faster does it": "B1_swing",
    "george street shuffle": "B1_swing",
    "acidjazz": "B13_soul",
    "acid jazz": "B13_soul",
    "night on the docks - sax": "C1_lounge",
    "night on the docks": "C1_lounge",
    "wallpaper": "C1_lounge",
    "backed vibes clean": "B9_smooth",
    "backed vibes": "B9_smooth",
    "easy lemon": "B9_smooth",
    "off to osaka": "B6_latin",
    "bossa antigua": "B6_latin",
    "lobby time": "C2_cafe",
    "jazz brunch": "C2_cafe",
    "smooth lovin": "B8_ballad",
    "shades of spring": "D3_uplift",
    "mining by moonlight": "D8_afterhours",
    "slow ska": "D5_playful",
    "whiskey on the mississippi": "C3_speakeasy",
    "whiskey on the rocks": "C3_speakeasy",
    "beach party": "C5_festival",
    "romantic": "D2_romance",
    "hep cats": "B1_swing",
    "local forecast": "B9_smooth",
    "carefree": "D3_uplift",
    "funkorama": "B13_soul",
    "thruster": "B10_fusion",
    "jazzy frenchy": "B1_swing",
    "the elevator bossa nova": "B6_latin",
    "bossa nova": "B6_latin",
    "swinging with the sultan": "B1_swing",
    "dixie outlandish": "B12_dixie",
    "bass walker": "B7_blues",
    "dig this": "B13_soul",
    "samba isobel": "B6_latin",
    "brazilian bittersweet": "B6_latin",
    "hot swing": "B1_swing",
    "jazz comedy": "D5_playful",
    "jazz pizzicato": "B3_cool",
    "nonstop": "B9_smooth",
    "purely business": "C2_cafe",
    "downtown": "C4_rooftop",
    "darkest child": "B14_noir",
    "sneaky snitch": "D5_playful",
    "investigations": "B14_noir",
    "ghost story": "B14_noir",
    "night on the docks - bass": "C1_lounge",
    "night on the docks - piano": "C1_lounge",
    "whiskey on the rocks": "C3_speakeasy",
    "cocktail lounge": "C1_lounge",
    "late night lounge": "C1_lounge",
    "smooth as silk": "B9_smooth",
    "mellowtron": "B9_smooth",
    "dreamy flashback": "D1_melancholy",
    "sad descent": "D1_melancholy",
    "lightless dawn": "D9_dawn",
    "sunrise meditation": "D9_dawn",
    "rainy day games": "D7_rainy",
    "almost in f": "B8_ballad",
    "tenderness": "D2_romance",
    "love song": "D2_romance",
    "stomping at midnight": "B1_swing",
    "palm and soul": "B13_soul",
    "maple leaf rag": "B12_dixie",
    "frogs legs rag": "B12_dixie",
    "frog's legs rag": "B12_dixie",
    "tiki bar mixer": "C5_festival",
    "late night radio": "C1_lounge",
    "bossabossa": "B6_latin",
    "bossa bossa": "B6_latin",
    "chillin hard": "B9_smooth",
    "octoblues": "B7_blues",
    "leopard print elevator": "B9_smooth",
    "funky chunk": "B13_soul",
    "clean soul": "B13_soul",
    "groove grove": "B13_soul",
    "got funk": "B13_soul",
    "airport lounge": "C1_lounge",
    "backbay lounge": "C1_lounge",
    "ultralounge": "C1_lounge",
    "big band swingin": "B1_swing",
    "acoustic blues": "B7_blues",
    "blobby samba": "B6_latin",
    "casa bossa nova": "B6_latin",
    "natural vibes": "B3_cool",
    "swinging pants": "B1_swing",
    "funky boxstep": "B13_soul",
    "laser groove": "B13_soul",
    "bittersweet": "D1_melancholy",
    "fig leaf times two": "B12_dixie",
    "hot salsa": "B6_latin",
    "bar street jam": "C3_speakeasy",
    "digital downtown": "C4_rooftop",
    "urban flight": "C4_rooftop",
    "puddle jumping": "D7_rainy",
    "romantic lands": "D2_romance",
    "the city without dawn": "D9_dawn",
}


def is_jazzish(title, extra=""):
    text = f"{title} {extra}"
    if REJECT.search(text):
        return False
    low = clean(title).lower()
    if any(key in low for key in TITLE_SCENE):
        return True
    return bool(JAZZISH.search(text))


def classify(title, extra="", feel=""):
    """Return list of (sub_id, score) sorted; empty if none."""
    cleaned = clean(title)
    low = cleaned.lower()
    for key, scene in TITLE_SCENE.items():
        if key in low:
            return [(scene, 10)]

    text = f"{cleaned} {extra} {feel}"
    hits = {}
    for k, rx in _RX.items():
        n = len(rx.findall(text))
        if n:
            hits[k] = n

    f = (feel or "").lower()
    if f:
        fm = {
            "jazz": "B9_smooth", "blues": "B7_blues", "swing": "B1_swing",
            "bossa": "B6_latin", "latin": "B6_latin", "samba": "B6_latin",
            "lounge": "C1_lounge", "smooth": "B9_smooth", "cool": "B3_cool",
            "funk": "B13_soul", "soul": "B13_soul", "noir": "B14_noir",
            "dark": "B14_noir", "suspenseful": "D4_tense", "romantic": "D2_romance",
            "sad": "D1_melancholy", "somber": "D1_melancholy", "uplifting": "D3_uplift",
            "calming": "B9_smooth", "relaxed": "C1_lounge", "humorous": "D5_playful",
            "mysterious": "B14_noir", "elegant": "D6_elegant",
        }
        for w, k in fm.items():
            if w in f:
                hits[k] = hits.get(k, 0) + 0.75

    if not hits:
        # soft fallbacks from jazzish gate words
        if re.search(r"\bjazz(y)?\b|재즈|ジャズ", text, re.I):
            hits["B9_smooth"] = 0.4
        elif re.search(r"\blounge\b|라운지", text, re.I):
            hits["C1_lounge"] = 0.4
        elif re.search(r"\bblues\b|블루스", text, re.I):
            hits["B7_blues"] = 0.4
        else:
            return []

    ranked = sorted(
        hits.items(),
        key=lambda kv: (-kv[1], PRIORITY.index(kv[0]) if kv[0] in PRIORITY else 99),
    )
    top = ranked[0][1]
    cands = [k for k, s in ranked if s >= top - 0.5]
    best = min(cands, key=lambda k: PRIORITY.index(k) if k in PRIORITY else 99)
    ranked = [(best, hits[best])] + [(k, s) for k, s in ranked if k != best]
    return ranked


def focus_score(title, sub_id, length=None, feel=""):
    base = SUB[sub_id][3]
    t = f"{clean(title)} {feel}"
    if CALM.search(t):
        base += 1
    if LOUD.search(t):
        base -= 2
    if length and length < 60:
        base -= 2
    elif length and length < 100:
        base -= 1
    if length and length >= 180:
        base += 0.5
    return max(1, min(5, round(base)))
