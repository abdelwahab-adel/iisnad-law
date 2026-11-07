#!/usr/bin/env python3
"""يولّد js/chat-data.js (قاعدة معرفة المساعد الآلي) من محتوى الموقع نفسه، فلا تتكرر المعلومات يدويًا.

المصادر: faq.html (الأسئلة الشائعة) · about.html (الفريق ومنهجية العمل) · index.html (من نحن والاعتمادات)
        contact.html (العنوان وساعات العمل) · practice/*.html (وصف كل مجال) · tools/content.py (حالات وجهات كل مجال)
        js/main.js (أسماء المجالات وروابطها).

بعد تعديل أي من هذه الصفحات شغّل من جذر المشروع:  python3 tools/build_chat_data.py
ويتوقف السكربت برسالة واضحة إن اختفى نص يعتمد عليه المساعد (مثل ساعات العمل).
"""
import html
import importlib.util
import json
import pathlib
import re
import sys

R = pathlib.Path(__file__).resolve().parent.parent


def read(p):
    return (R / p).read_text(encoding='utf-8')


def clean(h):
    h = re.sub(r'<(script|style)[^>]*>.*?</\1>', '', h, flags=re.S)
    h = re.sub(r'<br\s*/?>', ' ', h)
    h = re.sub(r'<[^>]+>', ' ', h)
    h = re.sub(r'\s+', ' ', html.unescape(h)).strip()
    return re.sub(r'\s+([،.؛:؟!»)])', r'\1', h)


def fail(msg):
    sys.exit('build_chat_data.py: ' + msg)


# ---------- المجالات ----------
spec = importlib.util.spec_from_file_location('content', R / 'tools/content.py')
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
X = mod.X
main_js = read('js/main.js')
names = dict((u, n) for n, u in re.findall(r'\["([^"]+)", "practice/([a-z\-]+)\.html", "مجال ممارسة"\]', main_js))
areas = []
for slug, n in names.items():
    page = read(f'practice/{slug}.html')
    desc = re.search(r'<meta name="description" content="([^"]*)"', page)
    if slug not in X or not desc:
        fail(f'بيانات المجال ناقصة: {slug}')
    areas.append({'s': slug, 'n': n, 'd': html.unescape(desc.group(1)), 'c': list(X[slug][0]), 'a': X[slug][1]})

# ---------- الأسئلة الشائعة ----------
faq = [{'q': clean(q), 'a': clean(a)} for q, a in
       re.findall(r'<details[^>]*><summary[^>]*>(.*?)</summary>(.*?)</details>', read('faq.html'), flags=re.S)]
if len(faq) < 20:
    fail('تعذّر قراءة الأسئلة الشائعة من faq.html')

# أسئلة يعتمد عليها المساعد مباشرة (جزء من السؤال → فهرسه)
KEYS = {
    'fees': 'أتعاب المكتب', 'free': 'مجانية', 'expenses': 'مصروفات', 'secret': 'الاستشارة الأولى سرية',
    'urgent': 'الاستجابة لطلب الاستشارة العاجلة', 'docs': 'المستندات المطلوبة', 'guarantee': 'يضمن المكتب',
    'poa': 'وكالة ليتولى', 'remote': 'عن بُعد', 'foreign': 'الأجنبية', 'hours': 'مواعيد عمل',
    'rights': 'للتحقيق', 'notice': 'إشعاراً', 'request': 'كيف أطلب استشارة', 'after': 'بعد الاستشارة الأولى',
    'who': 'للشركات والأفراد', 'info': 'تغني المعلومات',
}
faq_key = {}
for k, frag in KEYS.items():
    hit = [i for i, f in enumerate(faq) if frag in f['q']]
    if not hit:
        fail(f'لم أجد في الأسئلة الشائعة سؤالًا يحتوي «{frag}» (المفتاح {k})')
    faq_key[k] = hit[0]

# ---------- منهجية العمل ----------
about = read('about.html')
steps = []
for t, d, x in re.findall(
        r'<div class="nu"><bdi dir="ltr">\d+</bdi></div><h3>(.*?)</h3><p>(.*?)</p><p class="xp"><b>[^<]*</b>(.*?)</p>', about, flags=re.S):
    steps.append({'t': clean(t), 'd': clean(d), 'x': clean(x)})
if len(steps) != 5:
    fail('تعذّر قراءة خطوات منهجية العمل من about.html')
notes = re.findall(r'<aside class="ix[^"]*"[^>]*><b>(.*?)</b><p>(.*?)</p></aside>',
                   re.search(r'<section[^>]*id="method".*?</section>', about, flags=re.S).group(0), flags=re.S)
duration = next((clean(p) for b, p in notes if 'تستغرق' in b), '')
tip = next((clean(p) for b, p in notes if 'نصيحة' in b), '')
if not duration:
    fail('لم أجد ملاحظة «كم تستغرق القضية؟» في about.html')

# ---------- الفريق ----------
team = []
for card in re.findall(r'<article class="team-card".*?</article>', about, flags=re.S):
    g = lambda c: clean(re.search(r'class="%s">(.*?)</div>' % c, card, flags=re.S).group(1))
    yrs = re.search(r'(\d+)\s*سنة', clean(card))
    team.append({'n': g('team-name'), 'r': g('team-role'), 's': g('team-spec'), 'y': int(yrs.group(1)) if yrs else 0})
if not team:
    fail('تعذّر قراءة الفريق من about.html')

# ---------- من نحن والاعتمادات ----------
index = read('index.html')
ab = re.search(r'<section[^>]*id="about".*?</section>', index, flags=re.S).group(0)
about_txt = clean(re.search(r'<p class="ld[^"]*">(.*?)</p>', ab, flags=re.S).group(1))
accred = re.search(r'<section[^>]*id="accred".*?</section>', index, flags=re.S).group(0)
checks = [clean(x) for x in re.findall(r'<li>(.*?)</li>', re.search(r'<div class="ck">.*?</div>', accred, flags=re.S).group(0), flags=re.S)]
if len(checks) < 3:
    fail('تعذّر قراءة قائمة التحقق من المكتب من index.html')

# ---------- العنوان وساعات العمل ----------
contact = clean(read('contact.html'))
addr = re.search(r'العنوان\s*(طريق الملك فهد، حي العليا\s*الرياض\s*\d+)', contact)
hours = re.search(r'ساعات العمل\s*(الأحد – الخميس: [^ ]+ ص – [^ ]+ م)\s*(الجمعة – السبت: \S+)', contact)
if not addr or not hours:
    fail('تعذّر قراءة العنوان أو ساعات العمل من contact.html')
prep = [clean(x) for x in re.findall(r'<li>(.*?)</li>', re.search(r'ما الذي تجهّزه قبل الاستشارة.*?</ul>', read('contact.html'), flags=re.S).group(0), flags=re.S)]

# أشهر الأسئلة (تظهر في «الأسئلة الشائعة» داخل المحادثة)
top = [faq_key[k] for k in ('fees', 'free', 'secret', 'urgent', 'docs', 'remote', 'after', 'who', 'guarantee', 'poa')]

# ملاحظات قصيرة من الصفحات
loc = re.search(r'<section id="location".*?</section>', read('contact.html'), flags=re.S)
visit_note = clean(re.findall(r'<p>(.*?)</p>', loc.group(0), flags=re.S)[-1]) if loc else ''
cases_sec = re.search(r'<section[^>]*id="cases".*?</section>', index, flags=re.S).group(0)
cases_note = clean(re.search(r'<aside class="ix[^"]*"[^>]*><b>[^<]*</b><p>(.*?)</p>', cases_sec, flags=re.S).group(1))
if 'بموعد مسبق' not in visit_note or 'النتائج السابقة' not in cases_note:
    fail('تعذّر قراءة ملاحظة الزيارة بموعد أو ملاحظة دراسات الحالة')

data = {
    'areas': areas, 'faq': faq, 'fk': faq_key, 'top': top, 'visit_note': visit_note, 'cases_note': cases_note, 'steps': steps, 'duration': duration, 'tip': tip,
    'team': team, 'about': about_txt, 'checks': checks, 'prep': prep,
    'address': re.sub(r'\s+', ' ', addr.group(1)).replace(' الرياض', '، الرياض'),
    'hours': hours.group(1), 'closed': hours.group(2),
}
out = ('/* إسناد القانونية — قاعدة معرفة المساعد الآلي. ملف مولَّد: لا تعدّله يدويًا.\n'
       '   المصدر: tools/build_chat_data.py (يقرأ صفحات الموقع). لإعادة التوليد: python3 tools/build_chat_data.py */\n'
       'window.CHAT_DATA = ' + json.dumps(data, ensure_ascii=False, indent=1) + ';\n')
(R / 'js/chat-data.js').write_text(out, encoding='utf-8')
print(f'js/chat-data.js: {len(areas)} مجالًا، {len(faq)} سؤالًا شائعًا، {len(steps)} خطوات، {len(team)} من الفريق، {len(out) // 1024} KB')


# ======================================================================
# js/chat-kb.js — معرفة موسّعة تُحمَّل عند أول فتح للمحادثة (لا تثقل تحميل الصفحة)
# ======================================================================
generic_q = set(f['q'] for f in faq)
kb, aspects = [], {}


def add(**e):
    kb.append(e)
    return len(kb) - 1


for a in areas:
    slug, name = a['s'], a['n']
    pg = read(f'practice/{slug}.html')
    lk = [f'صفحة {name}', f'practice/{slug}.html']
    services = [clean(x) for x in re.findall(r'<li><b>\d+</b><span>(.*?)</span></li>', pg)]
    when = re.search(r'<h3>متى تحتاج هذه الخدمة؟</h3><p>(.*?)</p>', pg, flags=re.S)
    docs = re.search(r'<h3>مستندات تفيد عادةً</h3><p>(.*?)</p>', pg, flags=re.S)
    mistakes = [clean(x) for x in re.findall(r'<div><b>!</b><p>(.*?)</p></div>', pg)]
    lw = re.search(r'<div class="pd-lw">.*?<b>(.*?)</b><span>(.*?)</span><small>(.*?)</small>', pg, flags=re.S)
    qa_block = re.search(r'<div class="pd-q">(.*?)</div>', pg, flags=re.S)
    if len(services) < 2 or not when or not docs or len(mistakes) < 2 or not qa_block:  # المحامي المختص اختياري (بعض الصفحات بلا بطاقة محامٍ)
        fail(f'بنية صفحة المجال تغيّرت: {slug}')
    role_spec = [clean(x) for x in lw.group(2).split('·')] if lw else []
    years = re.search(r'\d+', clean(lw.group(3))) if lw else None
    fqi = []
    for q, ans in re.findall(r'<details><summary>(.*?)</summary><p>(.*?)</p></details>', qa_block.group(1), flags=re.S):
        q, ans = clean(q), clean(ans)
        if q not in generic_q:  # سؤال خاص بالمجال وليس من الأسئلة العامة المكررة
            fqi.append(add(l=q, p=[ans], s=slug, lk=lk, sg=1))
    aspects[slug] = {
        'sv': services, 'wn': clean(when.group(1)), 'dc': clean(docs.group(1)), 'mk': mistakes,
        'fq': fqi,
    }
    if lw:
        aspects[slug]['lw'] = {'n': clean(lw.group(1)), 'r': role_spec[0], 's': role_spec[1] if len(role_spec) > 1 else '', 'y': int(years.group(0)) if years else 0}
    for item in a['c']:
        add(l=f'هل تتولون {item}؟', p=[f'نعم، «{item}» من الحالات التي نتولاها في مجال «{name}». {a["d"]}'],
            n=f'الجهات المختصة: {a["a"]}.', s=slug, lk=lk, cs=1)

# ---- مقالات مركز المعرفة ----
art_sec = re.search(r'<section[^>]*id="articles".*?</section>', index, flags=re.S).group(0)
n_art = 0
for art in re.findall(r'<article class="ar[^"]*">(.*?)</article>', art_sec, flags=re.S):
    title = clean(re.search(r'<h3[^>]*>(.*?)</h3>', art, flags=re.S).group(1))
    kind = clean(re.search(r'<em>(.*?)</em>', art, flags=re.S).group(1))
    meta = clean(re.search(r'<div class="mm">(.*?)</div>', art, flags=re.S).group(1))
    by = clean(re.search(r'<div class="by">(.*?)</div>', art, flags=re.S).group(1))
    excerpt = clean(re.search(r'</h3><p>(.*?)</p>', art, flags=re.S).group(1))
    body = [[clean(h), clean(t)] for h, t in re.findall(r'<h4[^>]*>(.*?)</h4><p>(.*?)</p>', art, flags=re.S)]
    add(l=title, h=title, p=[f'{kind} · {meta} — {by}', excerpt], ol=body, lk=['مركز المعرفة', 'index.html#articles'], ar=1, sg=1)
    n_art += 1
if n_art < 3:
    fail('تعذّر قراءة مقالات مركز المعرفة')

# ---- من نحن: الرؤية والرسالة والقيم والفلسفة ولمن نعمل ----
ab_page = read('about.html')
tabs = dict((clean(l), clean(t)) for t, l in re.findall(r'data-x="([^"]+)">([^<]+)</button>', ab_page))
LBL = {'رؤيتنا': ('vision', 'ما رؤية المكتب؟', 'رؤيتنا'), 'رسالتنا': ('mission', 'ما رسالة المكتب؟', 'رسالتنا'),
       'قيمنا': ('values', 'ما قيم المكتب؟', 'قيمنا'), 'فلسفة العمل': ('philosophy', 'ما فلسفة العمل في المكتب؟', 'فلسفة العمل')}
for k, (kid, q, h) in LBL.items():
    if k not in tabs:
        fail(f'لم أجد «{k}» في about.html')
    add(id=kid, l=q, h=h, p=[tabs[k]], lk=['من نحن', 'about.html#about'], sg=1)
who = re.search(r'<b>لمن نعمل؟</b><p>(.*?)</p>', ab_page, flags=re.S)
if not who:
    fail('لم أجد «لمن نعمل؟» في about.html')
add(id='whofor', l='لمن يقدم المكتب خدماته؟', h='لمن نعمل؟', p=[clean(who.group(1))], lk=['من نحن', 'about.html#about'], sg=1)
tl = re.findall(r'<li><div class="y"><bdi dir="ltr">(\d{4})</bdi></div><b>(.*?)</b><p>(.*?)</p></li>', ab_page, flags=re.S)
if len(tl) < 3:
    fail('تعذّر قراءة محطات المسيرة من about.html')
add(id='timeline', l='ما أبرز محطات مسيرة المكتب؟', h='محطات في مسيرة المكتب', ul=[f'{y} — {clean(t)}: {clean(d)}' for y, t, d in tl],
    lk=['مسيرة المكتب', 'about.html#timeline'], sg=1)
for t in team:
    add(id='team:' + t['n'], l=f'من هو {t["n"]}؟', h=t['n'], p=[f'{t["r"]} — {t["s"]}. خبرة {t["y"]} سنة.'], lk=['الفريق القانوني', 'about.html#team'], sg=1)

# ---- لماذا إسناد القانونية ----
why_sec = re.search(r'<section[^>]*id="why".*?</section>', index, flags=re.S).group(0)
why = [(clean(h), clean(d)) for h, d in re.findall(r'<h3>(.*?)</h3><p>(.*?)</p>', why_sec, flags=re.S)]
why += [(clean(h), clean(d)) for h, d in re.findall(r'<div><b>(.*?)</b><span>(.*?)</span></div>', why_sec, flags=re.S)]
if len(why) < 6:
    fail('تعذّر قراءة قسم «لماذا» من index.html')
add(id='why', l='لماذا إسناد القانونية وما الذي يميّزكم؟', h='ما يميّزنا', ul=[f'{h}: {d}' for h, d in why], lk=['لماذا إسناد القانونية', 'index.html#why'], sg=1)
add(id='appointment', l='هل أحتاج إلى موعد مسبق لزيارة المكتب؟', h='زيارة المكتب', p=['الزيارة ' + visit_note + '.'],
    lk=['الموقع والخريطة', 'contact.html#location'], sg=1)

kb_data = {'kb': kb, 'aspects': aspects}
out_kb = ('/* إسناد القانونية — المعرفة الموسّعة للمساعد الآلي (تفاصيل المجالات والمقالات ومن نحن). ملف مولَّد: لا تعدّله يدويًا.\n'
          '   المصدر: tools/build_chat_data.py. يُحمَّل عند أول فتح للمحادثة. */\n'
          'window.CHAT_KB = ' + json.dumps(kb_data, ensure_ascii=False, separators=(',', ':')) + ';\n')
(R / 'js/chat-kb.js').write_text(out_kb, encoding='utf-8')
print(f'js/chat-kb.js: {len(kb)} مدخلًا ({n_art} مقالات، {sum(1 for e in kb if e.get("cs"))} حالة، {len(aspects)} مجالًا) {len(out_kb) // 1024} KB')
