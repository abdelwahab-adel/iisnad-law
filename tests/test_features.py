"""اختبار آلي للمساعد (الشات) — test_features.py. التشغيل من جذر المشروع: python3 tests/test_features.py  (يتطلب Playwright وChromium: انظر README)."""
import pathlib, datetime, json
from playwright.sync_api import sync_playwright
BASE=str(pathlib.Path(__file__).resolve().parent.parent) + "/"
U=lambda p: pathlib.Path(BASE+p).as_uri()
res=[]
def check(name, ok, info=""):
    res.append((name,bool(ok),info)); print(("✓ " if ok else "✗ ")+name+("" if ok else f"   -> {info}"),flush=True)
BOT=".cw-m.b .cw-bb:not(.cw-ty)"
def nbot(pg): return pg.locator(BOT).count()
def wait(pg,n0,t=4000): pg.wait_for_function("n=>document.querySelectorAll('.cw-m.b .cw-bb:not(.cw-ty)').length>n",arg=n0,timeout=t); pg.wait_for_timeout(60)
def say(pg,q):
    n0=nbot(pg); pg.fill(".cw-in",q); pg.press(".cw-in","Enter"); wait(pg,n0)
def chip(pg,l):
    n0=nbot(pg); pg.locator(".cw-sg .cw-c",has_text=l).first.click(); wait(pg,n0)
def last(pg): return pg.locator(BOT).last.inner_text()
def new_chat(pg): pg.click(".cw-mn"); pg.click("[data-m=new]"); pg.wait_for_timeout(80)
def fresh(b, page="index.html", w=1280, h=820, motion="reduce", mobile=False, perms=False, time=None):
    kw=dict(viewport={"width":w,"height":h},reduced_motion=motion)
    if mobile: kw.update(is_mobile=True,has_touch=True,device_scale_factor=2)
    ctx=b.new_context(**kw)
    if perms: ctx.grant_permissions(["clipboard-read","clipboard-write"])
    if time: ctx.clock.set_fixed_time(time)
    pg=ctx.new_page(); errs=[]; pg.on("pageerror",lambda e:errs.append(str(e)))
    pg.goto(U(page),wait_until="domcontentloaded"); pg.wait_for_timeout(500)
    return ctx,pg,errs
def riyadh(y,m,d,h,mi=0):  # local Riyadh time -> UTC datetime
    return datetime.datetime(y,m,d,h,mi,tzinfo=datetime.timezone(datetime.timedelta(hours=3)))

with sync_playwright() as pw:
    b=pw.chromium.launch()

    # ---------- English mode ----------
    ctx,pg,errs=fresh(b); pg.click(".cw-btn")
    say(pg,"how much are your fees")
    check("auto-switch to English on Latin input", "Fees" in last(pg) and pg.get_attribute(".cw","dir")=="ltr", last(pg)[:60])
    check("English chrome (placeholder, lang button)", pg.get_attribute(".cw-in","placeholder").startswith("Type") and pg.inner_text(".cw-lang")=="عربي")
    check("English chips", pg.locator(".cw-sg .cw-c").first.inner_text() in ("Practice areas","Book a consultation","Fees","How long does it take?","What to prepare","What happens after?"), pg.locator(".cw-sg .cw-c").first.inner_text())
    EN_T=[("where is your office","King Fahd Road"),("what are your working hours","Sunday – Thursday"),("is the first consultation free","varies by its type"),
      ("is my information confidential","full professional confidentiality"),("do you work with foreign investors","foreign investors"),("how do you work","five-step"),
      ("how long does a case take","preliminary estimate"),("what documents should i bring","What to prepare"),("i have an urgent matter","30 minutes"),
      ("i was arrested","Urgent situation"),("are your lawyers licensed","officially licensed"),("can you guarantee that i will win","guarantee a judgment"),
      ("do i need a power of attorney","Najiz"),("tell me about the firm","founded in 2004"),("i want to set up a company","Company formation"),
      ("i was fired from my job","Labour cases"),("trademark registration","Intellectual property"),("divorce and custody","Personal status"),
      ("rental dispute with my landlord","Real estate"),("how can i contact you","Contact the firm"),("thanks","You are welcome"),("who are you","automated assistant"),
      ("what practice areas do you cover","Practice areas"),("book an appointment","Booking a consultation"),("tax and vat advice","Tax"),("hello","Welcome to Isnad Legal"),
      ("blah blah quantum","did not quite understand"),("who are your lawyers","Managing Partner")]
    bad=[]
    for q,e in EN_T:
        new_chat(pg); say(pg,q); t=last(pg)
        if e not in t: bad.append((q,e,t[:60].replace("\n"," / ")))
    check(f"English understanding ({len(EN_T)-len(bad)}/{len(EN_T)})", not bad, bad[:4])
    # back to Arabic by typing Arabic
    say(pg,"كم الاتعاب"); check("auto-switch back to Arabic", pg.get_attribute(".cw","dir")=="rtl" and "تعتمد الأتعاب" in last(pg))
    # toggle button
    pg.click(".cw-lang"); pg.wait_for_timeout(300)
    check("language button toggles to English", pg.get_attribute(".cw","dir")=="ltr" and pg.get_attribute(".cw-in","placeholder").startswith("Type") and pg.locator(".cw-sg .cw-c").first.inner_text()=="Practice areas")
    # English booking flow
    new_chat(pg); chip(pg,"Book a consultation"); pg.locator(".cw-m.b .cw-a.pri").last.click(); pg.wait_for_timeout(900)
    say(pg,"Sara"); chip(pg,"Family case"); chip(pg,"Within a week")
    t=last(pg)
    check("English flow summary", "Your request summary" in t and "Name: Sara" in t and "Family case" in t and "Within a week" in t, t[:120])
    ctx.close()
    check("no JS errors (English)", not errs, errs[:2])

    # ---------- Persistence of language across pages ----------
    ctx,pg,errs=fresh(b); pg.click(".cw-btn"); pg.click(".cw-lang"); pg.wait_for_timeout(300); chip(pg,"Fees")
    pg.goto(U("about.html"),wait_until="domcontentloaded"); pg.wait_for_timeout(800)
    check("English + open state restored on another page", pg.get_attribute(".cw","dir")=="ltr" and pg.locator(".cw-panel").is_visible() and "Fees" in pg.locator(BOT).last.inner_text())
    say(pg,"where are you located"); check("English works after restore (lazy pack reloaded)", "King Fahd Road" in last(pg), last(pg)[:60])
    ctx.close()

    # ---------- Typos, compound, tie, follow-ups, FAQ browse, related ----------
    ctx,pg,errs=fresh(b); pg.click(".cw-btn")
    for q,e in [("كم الاتعااب","تعتمد الأتعاب"),("ميراااث","الأحوال الشخصية"),("استشارا عاجله","30 دقيقة"),("هل تقدمون استشاره اونلاين","الاستشارة عن بُعد"),("اين المكتبب","طريق الملك فهد")]:
        new_chat(pg); say(pg,q); check(f"typo/elongation «{q}»", e in last(pg), last(pg)[:60].replace("\n"," / "))
    new_chat(pg); n0=nbot(pg); pg.fill(".cw-in","كم الأتعاب وأين المكتب؟"); pg.press(".cw-in","Enter"); wait(pg,n0+1,6000)
    t2=pg.locator(BOT).nth(n0).inner_text()+" || "+pg.locator(BOT).nth(n0+1).inner_text()
    check("compound question answered twice", "الأتعاب" in t2 and "المواعيد والموقع" in t2, t2[:90])
    new_chat(pg); say(pg,"قضية تجارية وقضية جنائية"); check("area tie asks «هل تقصد»", "أيّ المجالين" in last(pg) and pg.locator(".cw-sg .cw-c").count()>=2, last(pg)[:60])
    new_chat(pg); chip(pg,"احجز استشارة"); say(pg,"نعم"); check("«نعم» after booking offer starts the flow", "ما اسمك" in last(pg), last(pg)[:50])
    new_chat(pg); chip(pg,"احجز استشارة"); say(pg,"لا شكرا"); check("«لا شكرا» declines politely", "حسنًا" in last(pg), last(pg)[:50])
    new_chat(pg); say(pg,"الأسئلة الشائعة"); check("FAQ browse lists the top questions", pg.locator(".cw-m.b .cw-a").count()>=10, pg.locator(".cw-m.b .cw-a").count())
    pg.locator(".cw-m.b .cw-a").first.click(); wait(pg,nbot(pg)-1 if False else nbot(pg)-0) if False else pg.wait_for_timeout(1200)
    check("FAQ answer shows related questions as chips", pg.locator(".cw-sg .cw-c").count()>=3, pg.locator(".cw-sg .cw-c").count())
    new_chat(pg); say(pg,"ما لون سيارة المدير"); check("helpful fallback offers channels/chips", "لم أ" in last(pg) and pg.locator(".cw-a").count()>=1, last(pg)[:120].replace("\n"," / "))
    ctx.close(); check("no JS errors (engine)", not errs, errs[:2])

    # ---------- Page awareness ----------
    ctx,pg,errs=fresh(b,"practice/tax.html"); pg.click(".cw-btn")
    w=last(pg); check("welcome mentions the viewed practice area", "أنت تتصفح صفحة «الضرائب»" in w, w[:80])
    check("first chip is the area chip", "الضرائب" in pg.locator(".cw-sg .cw-c").first.inner_text(), pg.locator(".cw-sg .cw-c").first.inner_text())
    chip(pg,"احجز استشارة"); pg.locator(".cw-m.b .cw-a.pri").last.click(); pg.wait_for_timeout(900); say(pg,"ليلى")
    check("flow offers the page area first", pg.locator(".cw-sg .cw-c").first.inner_text()=="الضرائب", pg.locator(".cw-sg .cw-c").first.inner_text())
    chip(pg,"الضرائب"); chip(pg,"خلال أسبوع")
    t=last(pg); check("summary uses the page area", "نوع المسألة: الضرائب" in t, t[:100])
    # prefill → contact form
    with pg.expect_navigation(): pg.locator(".cw-m.b .cw-acts").last.locator("a",has_text="نموذج حجز الاستشارة").click()
    pg.wait_for_timeout(700)
    vals=pg.evaluate("""()=>{const f=document.getElementById('bk');const sel=[...f.querySelectorAll('select')].map(s=>s.value);const inp=[...f.querySelectorAll('label')].filter(l=>l.textContent.trim().startsWith('الاسم الكامل')).map(l=>l.querySelector('input').value);return {sel,inp,note:!!f.querySelector('.cw-pfn')}}""")
    check("contact form prefilled (kind/priority/name + note)", vals["sel"][:2]==["استشارة شركات","خلال أسبوع"] and vals["inp"]==["ليلى"] and vals["note"], vals)
    ctx.close(); check("no JS errors (page/prefill)", not errs, errs[:2])
    ctx,pg,errs=fresh(b,"faq.html"); pg.click(".cw-btn")
    check("FAQ page welcome chips start with FAQ", pg.locator(".cw-sg .cw-c").first.inner_text()=="الأسئلة الشائعة", pg.locator(".cw-sg .cw-c").first.inner_text()); ctx.close()

    # ---------- Office status (fixed Riyadh times) ----------
    for label,t,exp_ok,exp_line in [("Sunday 10:00 open",riyadh(2026,11,1,10),True,"المكتب مفتوح حتى 6 م"),
                                    ("Friday 12:00 closed",riyadh(2026,10,30,12),False,"ويفتح الأحد الساعة 9 ص"),
                                    ("Saturday 20:00 closed",riyadh(2026,10,31,20),False,"ويفتح غدًا الساعة 9 ص"),
                                    ("Sunday 07:00 before opening",riyadh(2026,11,1,7),False,"ويفتح اليوم الساعة 9 ص")]:
        ctx,pg,errs=fresh(b,time=t); pg.click(".cw-btn"); st=pg.inner_text(".cw-stt")
        new_chat(pg); chip(pg,"المواعيد والموقع"); txt=last(pg)
        check(f"office status — {label}", (("مفتوح" in st) if exp_ok else ("مغلق" in st)) and exp_line in txt, (st,txt[-90:].replace("\n"," ")))
        ctx.close()
    ctx,pg,errs=fresh(b,time=riyadh(2026,11,1,10)); pg.click(".cw-btn"); pg.click(".cw-lang"); pg.wait_for_timeout(300)
    check("English office status", "open now" in pg.inner_text(".cw-stt").lower(), pg.inner_text(".cw-stt")); ctx.close()

    # ---------- Autocomplete ----------
    ctx,pg,errs=fresh(b); pg.click(".cw-btn"); pg.fill(".cw-in","اتع"); pg.wait_for_timeout(150)
    opts=pg.locator(".cw-o"); check("autocomplete lists matching questions", opts.count()>=1 and "أتعاب" in opts.first.inner_text(), [opts.nth(i).inner_text() for i in range(opts.count())])
    pg.keyboard.press("Escape"); check("Esc closes suggestions only", pg.locator(".cw-ac").is_hidden() and pg.locator(".cw-panel").is_visible())
    pg.fill(".cw-in","اتع"); pg.wait_for_timeout(150); n0=nbot(pg); pg.keyboard.press("ArrowDown"); pg.keyboard.press("Enter"); wait(pg,n0)
    check("keyboard selection answers the question", "الأتعاب" in last(pg) or "تعتمد الأتعاب" in last(pg), last(pg)[:60])
    pg.fill(".cw-in","مجالات"); pg.wait_for_timeout(150); pg.locator(".cw-o").first.click(); pg.wait_for_timeout(1200)
    check("click selection works", pg.locator(".cw-ac").is_hidden())
    ctx.close()

    # ---------- Copy conversation / summary ----------
    ctx,pg,errs=fresh(b,perms=True); pg.click(".cw-btn"); say(pg,"كم الاتعاب")
    pg.click(".cw-mn"); pg.click("[data-m=copy]"); pg.wait_for_timeout(300)
    clip=pg.evaluate("navigator.clipboard.readText()"); pg.wait_for_timeout(1300)
    check("copy conversation to clipboard", "كم الاتعاب" in clip and "تعتمد الأتعاب" in clip and clip.startswith("محادثة مع المساعد الآلي"), clip[:80])
    new_chat(pg); chip(pg,"احجز استشارة"); pg.locator(".cw-m.b .cw-a.pri").last.click(); pg.wait_for_timeout(900); say(pg,"منى"); chip(pg,"أخرى"); chip(pg,"استشارة عامة")
    pg.locator(".cw-m.b .cw-a",has_text="نسخ الملخص").last.click(); pg.wait_for_timeout(300)
    clip=pg.evaluate("navigator.clipboard.readText()"); check("copy summary action", "الاسم: منى" in clip and "الأولوية: استشارة عامة" in clip, clip[:80])
    ctx.close()

    # ---------- Teaser (once per session) ----------
    ctx=b.new_context(viewport={"width":1280,"height":820},reduced_motion="reduce"); pg=ctx.new_page(); errs=[]; pg.on("pageerror",lambda e:errs.append(str(e)))
    ctx.clock.install(); pg.goto(U("practice/tax.html"),wait_until="domcontentloaded"); pg.wait_for_timeout(300)
    check("no teaser before 25s", pg.locator(".cw-tip").count()==0)
    pg.clock.run_for(26000); pg.wait_for_timeout(200)
    check("teaser appears after ~25s (page-aware)", pg.locator(".cw-tip").count()==1 and "الضرائب" in pg.inner_text(".cw-tip"), pg.inner_text(".cw-tip") if pg.locator(".cw-tip").count() else "none")
    pg.click(".cw-tt"); pg.wait_for_timeout(200); check("clicking teaser opens the chat and hides it", pg.locator(".cw-panel").is_visible() and pg.locator(".cw-tip").count()==0)
    pg.goto(U("about.html"),wait_until="domcontentloaded"); pg.clock.run_for(30000); pg.wait_for_timeout(200)
    check("teaser not repeated in the same session", pg.locator(".cw-tip").count()==0)
    ctx.close()
    ctx=b.new_context(viewport={"width":1280,"height":820},reduced_motion="reduce"); pg=ctx.new_page()
    pg.add_init_script("window.__cfg=1"); ctx.clock.install(); pg.goto(U("index.html"),wait_until="domcontentloaded")
    pg.evaluate("window.SITE_CONFIG.chat={teaser:false}")  # (set after load: only documents the option; real option is read at init)
    ctx.close()

    # ---------- Mobile: focus trap, aria-modal ----------
    ctx,pg,errs=fresh(b,w=390,h=780,mobile=True); pg.click(".cw-btn"); pg.wait_for_timeout(250)
    check("aria-modal on mobile", pg.get_attribute(".cw-panel","aria-modal")=="true")
    seen=set()
    for _ in range(24):
        pg.keyboard.press("Tab"); seen.add(pg.evaluate("document.activeElement.className.split(' ')[0]"))
    inside=pg.evaluate("document.querySelector('.cw').contains(document.activeElement)")
    check("Tab stays inside the sheet on mobile", inside, seen)
    ctx.close()
    b.close()
bad=[r for r in res if not r[1]]
print(f"\n{len(res)-len(bad)}/{len(res)} checks passed")
