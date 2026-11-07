"""اختبار آلي للمساعد (الشات) — test_knowledge.py. التشغيل من جذر المشروع: python3 tests/test_knowledge.py  (يتطلب Playwright وChromium: انظر README)."""
import json, pathlib, random
from playwright.sync_api import sync_playwright
BASE=str(pathlib.Path(__file__).resolve().parent.parent) + "/"
U=lambda p: pathlib.Path(BASE+p).as_uri()
core=open(BASE+'js/chat-data.js',encoding='utf-8').read(); D=json.loads(core[core.index('{'):core.rindex('}')+1])
kbt=open(BASE+'js/chat-kb.js',encoding='utf-8').read(); K=json.loads(kbt[kbt.index('{'):kbt.rindex('}')+1])
BOT=".cw-m.b .cw-bb:not(.cw-ty)"
def nbot(pg): return pg.locator(BOT).count()
def say(pg,q,wait_all=1):
    n0=nbot(pg); pg.fill(".cw-in",q); pg.press(".cw-in","Enter")
    pg.wait_for_function("n=>document.querySelectorAll('.cw-m.b .cw-bb:not(.cw-ty)').length>n",arg=n0,timeout=5000); pg.wait_for_timeout(50)
    return pg.locator(BOT).last.inner_text()
def new_chat(pg): pg.click(".cw-mn"); pg.click("[data-m=new]"); pg.wait_for_timeout(60)
T=[]  # (query, [accepted substrings])
for a in D['areas']:
    s=a['s']; x=K['aspects'][s]; n=a['n']
    T.append((f"ماذا تقدمون في {n}",[x['sv'][0]]))
    T.append((f"ما المستندات المطلوبة في {n}",[x['dc'][:25]]))
    T.append((f"ما الأخطاء الشائعة في {n}",[x['mk'][0]]))
    T.append((f"متى أحتاج إلى محامٍ في {n}",[x['wn'][:25]]))
    T.append((f"من المحامي المختص في {n}",[x['lw']['n']] if 'lw' in x else ["ولا تعرض صفحته محاميًا"]))
    # one area-specific FAQ per area, asked verbatim
    for i in x['fq'][:1]:
        e=K['kb'][i]; T.append((e['l'],[e['p'][0][:30]]))
# articles by title
for e in K['kb']:
    if e.get('ar'): T.append((e['l'],[e['l']]))
# a deterministic sample of case items
cases=[e for e in K['kb'] if e.get('cs')]; random.Random(7).shuffle(cases)
for e in cases[:20]: T.append((e['l'],["نعم"]))
T+= [("ما رؤية المكتب",[ [e for e in K['kb'] if e.get('id')=='vision'][0]['p'][0][:25] ]),("رسالتكم",[ [e for e in K['kb'] if e.get('id')=='mission'][0]['p'][0][:25] ]),
 ("ما هي قيمكم",[ [e for e in K['kb'] if e.get('id')=='values'][0]['p'][0][:25] ]),("فلسفة العمل عندكم",[ [e for e in K['kb'] if e.get('id')=='philosophy'][0]['p'][0][:25] ]),
 ("لمن تعملون",["لمن نعمل"]),("محطات المكتب",["2004"]),("لماذا انتم",["ما يميّزنا"]),("ما الذي يميزكم عن غيركم",["ما يميّزنا"]),
 ("هل أحتاج موعد مسبق للزيارة",["بموعد مسبق"]),("هل اقدر ازوركم بدون موعد",["بموعد مسبق"]),
 ("من هو عبدالعزيز الراشد",["الشريك المدير"]),("نورة الفهد",["نورة الفهد"]),("من هو سلمان الدوسري",["سلمان الدوسري"]),("ريم العتيبي",["ريم العتيبي"]),
 ("ماذا تستطيع ان تفعل",["كيف أساعدك"]),("كيف حالك",["بخير"]),("هل انت chatgpt",["مبرمج على محتوى"]),("هل عندكم فروع",["مقر المكتب"]),
 ("ابغى وظيفة عندكم",["لا يعرض الموقع حاليًا"]),("طرق الدفع",["طرق الدفع"]),("عندي شكوى",["نأسف"]),("حساباتكم في تويتر",["لا يعرض الموقع حسابات"]),
 ("اريد ان ارى دراسات الحالة",["دراسات الحالة وآراء العملاء"]),("اعرض لي المقالات",["مقالات مركز المعرفة"]),("مواعيد العمل",["الزيارة بموعد مسبق"])]
NEG=["ما هو لون سيارة المدير","كم سعر الذهب اليوم","اكتب لي قصيدة عن الصحراء","ما هي عاصمة فرنسا","كيف اطبخ الكبسة","من فاز بكأس العالم"]
bad=[]; errs=[]
with sync_playwright() as pw:
    b=pw.chromium.launch(); ctx=b.new_context(viewport={"width":1280,"height":820},reduced_motion="reduce"); pg=ctx.new_page()
    pg.on("pageerror",lambda e:errs.append(str(e)))
    pg.goto(U("index.html"),wait_until="domcontentloaded"); pg.wait_for_timeout(500); pg.click(".cw-btn"); pg.wait_for_timeout(500)
    for q,exp in T:
        new_chat(pg); t=say(pg,q)
        if not any(e in t for e in exp): bad.append((q,exp[0][:30],t[:70].replace("\n"," / ")))
    nbad=len(bad)
    print(f"knowledge queries: {len(T)-nbad}/{len(T)} passed")
    for q,e,t in bad[:25]: print(f"  ✗ {q!r}\n      expected «{e}»\n      got: {t}")
    negbad=[]
    for q in NEG:
        new_chat(pg); t=say(pg,q)
        if ("لم أ" not in t and "خارج نطاق" not in t): negbad.append((q,t[:70].replace("\n"," / ")))
    print(f"negative (must admit not knowing): {len(NEG)-len(negbad)}/{len(NEG)}")
    for q,t in negbad: print(f"  ✗ {q!r} -> {t}")
    # context follow-ups
    new_chat(pg); say(pg,"ما نتولاه في الضرائب"); t=say(pg,"والمستندات؟"); ok1="الإقرارات والفواتير" in t
    t2=say(pg,"وما الاخطاء الشائعة"); ok2="تجاوز مهلة الاعتراض" in t2
    print("context follow-ups (area → docs → mistakes):",ok1 and ok2, "" if ok1 and ok2 else (t[:50],t2[:50]))
    # aspect chips navigation
    chips=[pg.locator(".cw-sg .cw-c").nth(i).inner_text() for i in range(pg.locator(".cw-sg .cw-c").count())]
    print("area deep-dive chips:",chips)
    new_chat(pg); say(pg,"ما نتولاه في العقارات"); n0=nbot(pg); pg.locator(".cw-sg .cw-c",has_text="المستندات").first.click()
    pg.wait_for_function("n=>document.querySelectorAll('.cw-m.b .cw-bb:not(.cw-ty)').length>n",arg=n0,timeout=5000); pg.wait_for_timeout(100)
    print("chip → docs of the same area:", "المستندات التي تفيد في العقارات" in pg.locator(BOT).last.inner_text())
    # page-context
    ctx2=b.new_context(viewport={"width":1280,"height":820},reduced_motion="reduce"); p2=ctx2.new_page(); p2.goto(U("practice/tax.html"),wait_until="domcontentloaded"); p2.wait_for_timeout(400); p2.click(".cw-btn"); p2.wait_for_timeout(500)
    t=say(p2,"ما المستندات؟"); print("page context (tax page): «ما المستندات؟»:", "الإقرارات والفواتير" in t)
    ctx2.close()
    # English additions
    ctx3=b.new_context(viewport={"width":1280,"height":820},reduced_motion="reduce"); p3=ctx3.new_page(); p3.goto(U("index.html"),wait_until="domcontentloaded"); p3.wait_for_timeout(400); p3.click(".cw-btn")
    en=[("what can you do","How can I help"),("do you have other branches","Our office"),("what are your payment methods","Payment methods"),("do you have any jobs","does not currently list"),("i was fired from my job","Labour cases"),
        ("show me your case studies","Case studies"),("how are you","I am well"),("are you chatgpt","generative AI"),("can i visit without an appointment","prior appointment"),("i have a complaint","sorry to hear")]
    eb=[]
    for q,e in en:
        new_chat(p3); t=say(p3,q)
        if e not in t: eb.append((q,e,t[:60]))
    print(f"English additions: {len(en)-len(eb)}/{len(en)}", eb[:3]); ctx3.close()
    b.close()
print("js errors:",errs[:2])
