"""اختبار آلي للمساعد (الشات) — test_ui.py. التشغيل من جذر المشروع: python3 tests/test_ui.py  (يتطلب Playwright وChromium: انظر README)."""
import pathlib, json
from playwright.sync_api import sync_playwright
base=str(pathlib.Path(__file__).resolve().parent.parent) + "/"
U=lambda p: pathlib.Path(base+p).as_uri()
def say(pg,q):
    n0=pg.locator(".cw-m.b .cw-bb:not(.cw-ty)").count()
    pg.fill(".cw-in",q); pg.press(".cw-in","Enter")
    pg.wait_for_function("n=>document.querySelectorAll('.cw-m.b .cw-bb:not(.cw-ty)').length>n",arg=n0,timeout=3000); pg.wait_for_timeout(60)
def chip(pg,label):
    n0=pg.locator(".cw-m.b .cw-bb:not(.cw-ty)").count()
    pg.locator(".cw-sg .cw-c",has_text=label).first.click()
    pg.wait_for_function("n=>document.querySelectorAll('.cw-m.b .cw-bb:not(.cw-ty)').length>n",arg=n0,timeout=3000); pg.wait_for_timeout(60)
class R(dict):
    def __setitem__(self,k,v):
        print(f"{k}: {v}",flush=True); dict.__setitem__(self,k,v)
res=R()
with sync_playwright() as pw:
    b=pw.chromium.launch()
    # ---------- desktop ----------
    ctx=b.new_context(viewport={"width":1280,"height":820},reduced_motion="reduce"); pg=ctx.new_page()
    pg.goto(U("index.html"),wait_until="domcontentloaded"); pg.wait_for_timeout(700)
    res["no .fb"]=pg.locator(".fb").count()==0
    res["launcher visible"]=pg.locator(".cw-btn").is_visible()
    res["panel hidden initially"]=pg.locator(".cw-panel").is_hidden()
    pg.click(".cw-btn"); pg.wait_for_timeout(200)
    res["aria-expanded"]=pg.get_attribute(".cw-btn","aria-expanded")
    res["focus in input"]=pg.evaluate("document.activeElement.className")
    chip(pg,"مجالات الممارسة"); chip(pg,"القانون التجاري")
    # booking flow with WhatsApp configured
    pg.evaluate("window.SITE_CONFIG.whatsapp='966500000000'; window.SITE_CONFIG.phone='+966 11 000 0000'; window.SITE_CONFIG.email='info@example.sa'")
    pg.click(".cw-mn"); pg.click("[data-m=new]"); pg.wait_for_timeout(80)
    chip(pg,"احجز استشارة")
    pg.locator(".cw-m.b .cw-a.pri").last.click(); pg.wait_for_timeout(900)
    say(pg,"سارة"); chip(pg,"قضية أسرية"); chip(pg,"خلال أسبوع")
    wa=pg.locator(".cw-a.wa").last.get_attribute("href")
    res["wa href"]=wa
    res["tel/mail"]=[pg.locator(".cw-a",has_text="اتصل").last.get_attribute("href"),pg.locator(".cw-a",has_text="البريد").last.get_attribute("href")]
    # persistence across pages
    msgs=pg.locator(".cw-m").count()
    pg.goto(U("about.html"),wait_until="domcontentloaded"); pg.wait_for_timeout(600)
    res["state restored on about.html"]=[pg.locator(".cw-panel").is_visible(), pg.locator(".cw-m").count()==msgs]
    # Escape closes and returns focus
    pg.keyboard.press("Escape"); pg.wait_for_timeout(100)
    res["Esc closes"]=[pg.locator(".cw-panel").is_hidden(), pg.evaluate("document.activeElement.className.includes('cw-btn')")]
    # internal link closes the panel then navigates
    pg.click(".cw-btn"); pg.wait_for_timeout(100); chip(pg,"مجالات الممارسة"); chip(pg,"القانون التجاري")
    with pg.expect_navigation(): pg.locator(".cw-a",has_text="صفحة القانون التجاري").click()
    pg.wait_for_timeout(500)
    res["after link nav: url / panel hidden"]=[pg.url.split('/')[-1], pg.locator(".cw-panel").is_hidden()]
    # practice subpage uses ../ root
    pg.goto(U("practice/tax.html"),wait_until="domcontentloaded"); pg.wait_for_timeout(500)
    pg.click(".cw-btn"); pg.wait_for_timeout(100); say(pg,"وين المكتب")
    res["subpage link href"]=pg.locator(".cw-a",has_text="الخريطة").last.get_attribute("href")
    # a11y attributes
    res["roles"]=pg.evaluate("()=>[document.querySelector('.cw-panel').getAttribute('role'),document.querySelector('.cw-log').getAttribute('role'),document.querySelector('.cw-log').getAttribute('aria-live'),document.querySelector('.cw-btn').getAttribute('aria-controls')]")
    # XSS check
    pg.fill(".cw-in","<img src=x onerror=window.__x=1>"); pg.press(".cw-in","Enter"); pg.wait_for_timeout(1200)
    res["xss safe"]=[pg.evaluate("window.__x===undefined"), pg.locator(".cw-m.u .cw-bb").last.inner_text()[:30]]
    ctx.close()
    # ---------- mobile ----------
    ctx=b.new_context(viewport={"width":390,"height":780},device_scale_factor=2,is_mobile=True,has_touch=True,reduced_motion="reduce"); pg=ctx.new_page()
    pg.goto(U("index.html"),wait_until="domcontentloaded"); pg.wait_for_timeout(700)
    pg.click(".cw-btn"); pg.wait_for_timeout(300)
    res["mobile: launcher hidden when open"]=pg.locator(".cw-btn").is_hidden()
    res["mobile: panel fills screen"]=pg.evaluate("()=>{const r=document.querySelector('.cw-panel').getBoundingClientRect();return [Math.round(r.width),Math.round(r.height),window.innerWidth,window.innerHeight]}")
    res["mobile: html locked"]=pg.evaluate("document.documentElement.classList.contains('cw-lock')")
    chip(pg,"كيف نعمل؟")
    pg.click(".cw-close"); pg.wait_for_timeout(200)
    res["mobile: closed & launcher back"]=[pg.locator(".cw-panel").is_hidden(), pg.locator(".cw-btn").is_visible()]
    b.close()

