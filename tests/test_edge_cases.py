"""اختبار آلي للمساعد (الشات) — test_edge_cases.py. التشغيل من جذر المشروع: python3 tests/test_edge_cases.py  (يتطلب Playwright وChromium: انظر README)."""
import pathlib
from playwright.sync_api import sync_playwright
U=lambda p: pathlib.Path(str(pathlib.Path(__file__).resolve().parent.parent) + "/"+p).as_uri()
def bot(pg): return pg.locator(".cw-m.b .cw-bb:not(.cw-ty)").last.inner_text()
def wait(pg,n0): pg.wait_for_function("n=>document.querySelectorAll('.cw-m.b .cw-bb:not(.cw-ty)').length>n",arg=n0,timeout=3000); pg.wait_for_timeout(60)
def n(pg): return pg.locator(".cw-m.b .cw-bb:not(.cw-ty)").count()
def say(pg,q):
    k=n(pg); pg.fill(".cw-in",q); pg.press(".cw-in","Enter"); wait(pg,k)
def chip(pg,l):
    k=n(pg); pg.locator(".cw-sg .cw-c",has_text=l).first.click(); wait(pg,k)
with sync_playwright() as pw:
    b=pw.chromium.launch(); ctx=b.new_context(viewport={"width":1280,"height":820},reduced_motion="reduce"); pg=ctx.new_page()
    pg.goto(U("index.html"),wait_until="domcontentloaded"); pg.wait_for_timeout(500); pg.click(".cw-btn")
    # default config (nothing set): contact answer + booking summary only offer the form
    chip(pg,"التواصل"); t=bot(pg); print("contact (no config):", "الهاتف" not in t and "واتساب:" not in t, "| actions:", pg.locator(".cw-m.b .cw-a").last.inner_text())
    print("wa button absent without number:", pg.locator(".cw-a.wa").count()==0)
    # flow: cancel via typed word
    pg.click(".cw-mn"); pg.click("[data-m=new]"); pg.wait_for_timeout(80); chip(pg,"احجز استشارة"); pg.locator(".cw-m.b .cw-a.pri").last.click(); pg.wait_for_timeout(800)
    say(pg,"إلغاء"); print("typed cancel:", "تم إلغاء" in bot(pg))
    # flow: cancel via chip mid-way, then start again and finish without name
    pg.locator(".cw-sg .cw-c",has_text="احجز استشارة").first.click() if False else None
    chip(pg,"احجز استشارة"); pg.locator(".cw-m.b .cw-a.pri").last.click(); pg.wait_for_timeout(800)
    chip(pg,"تخطي"); chip(pg,"أخرى"); chip(pg,"استشارة عامة")
    t=bot(pg); print("summary without name:", "الاسم" not in t and "نوع المسألة: أخرى" in t, "| nothing auto-sent note:", "لم يُرسل شيء" in t)
    print("form link only:", [pg.locator(".cw-m.b .cw-acts").last.locator(".cw-a").nth(i).inner_text() for i in range(pg.locator(".cw-m.b .cw-acts").last.locator(".cw-a").count())])
    # long input is capped, double submit ignored while busy
    pg.click(".cw-mn"); pg.click("[data-m=new]"); pg.wait_for_timeout(80)
    pg.fill(".cw-in","أ"*500); print("maxlength 300:", len(pg.input_value(".cw-in")))
    pg.fill(".cw-in","كم الاتعاب"); k=n(pg); pg.press(".cw-in","Enter"); pg.fill(".cw-in","من انتم"); pg.press(".cw-in","Enter")
    wait(pg,k); pg.wait_for_timeout(300); print("replies after rapid double submit:", n(pg)-k, "(second ignored while busy)")
    # reset returns to welcome
    pg.click(".cw-mn"); pg.click("[data-m=new]"); pg.wait_for_timeout(100); print("reset -> welcome only:", pg.locator(".cw-m").count()==1)
    # data-chat-open hook + API
    pg.evaluate("window.IsnadChat.close()"); pg.wait_for_timeout(50)
    pg.evaluate("document.body.insertAdjacentHTML('beforeend','<a href=\"#\" data-chat-open id=\"t1\">x</a>')"); pg.click("#t1"); pg.wait_for_timeout(100)
    print("data-chat-open opens:", pg.locator(".cw-panel").is_visible())
    b.close()
