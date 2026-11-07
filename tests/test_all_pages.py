"""اختبار آلي للمساعد (الشات) — test_all_pages.py. التشغيل من جذر المشروع: python3 tests/test_all_pages.py  (يتطلب Playwright وChromium: انظر README)."""
import glob, pathlib
from playwright.sync_api import sync_playwright
base=str(pathlib.Path(__file__).resolve().parent.parent) + "/"
pages=sorted(glob.glob(base+"*.html")+glob.glob(base+"practice/*.html"))
with sync_playwright() as pw:
    b=pw.chromium.launch()
    bad=0
    for motion in ("no-preference","reduce"):
        ctx=b.new_context(viewport={"width":1280,"height":820},reduced_motion=motion); pg=ctx.new_page()
        errs=[]; pg.on("pageerror",lambda e:errs.append(str(e)))
        for f in pages:
            pg.goto(pathlib.Path(f).as_uri(),wait_until="domcontentloaded"); pg.wait_for_timeout(250)
            ok=pg.locator(".cw-btn").count()==1 and pg.locator(".fb").count()==0
            pg.click(".cw-btn"); pg.wait_for_timeout(120)
            ok=ok and pg.locator(".cw-panel").is_visible() and pg.locator(".cw-sg .cw-c").count()>=6
            # one real exchange with full animation timing
            pg.fill(".cw-in","كم الاتعاب"); pg.press(".cw-in","Enter")
            try:
                pg.wait_for_function("document.querySelectorAll('.cw-m.b .cw-bb:not(.cw-ty)').length>=2",timeout=3000)
            except Exception: ok=False
            ok=ok and ("تعتمد الأتعاب" in pg.locator(".cw-m.b .cw-bb:not(.cw-ty)").last.inner_text())
            pg.evaluate("sessionStorage.clear()")
            if not ok: bad+=1; print("✗",motion,f.replace(base,""))
        print(f"{motion}: {len(pages)} pages checked, failures={bad}, js errors={errs[:2]}")
        ctx.close()
    b.close()
