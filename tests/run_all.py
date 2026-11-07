#!/usr/bin/env python3
"""يشغّل كل اختبارات المساعد الآلي ويُلخّص النتيجة.

    pip install -r tests/requirements.txt && playwright install chromium
    python3 tests/run_all.py            # كل الاختبارات
    python3 tests/run_all.py features   # ما يطابق الكلمة في اسم الملف فقط

كل سكربت مستقل ويطبع نتيجته؛ يُعدّ فاشلًا إن خرج برمز غير صفري، أو طبع ✗، أو False، أو نسبة ناقصة (مثل 52/53)،
أو failures غير صفرية، أو أخطاء JS غير فارغة. الاختبارات تفتح صفحات المشروع من القرص (file://) ولا تحتاج خادمًا.
"""
import pathlib
import re
import subprocess
import sys
import time

HERE = pathlib.Path(__file__).resolve().parent


def verdict(out, code):
    why = []
    if code:
        why.append(f'رمز الخروج {code}')
    if '✗' in out:
        why.append('يوجد ✗')
    if re.search(r'\bFalse\b', out):
        why.append('يوجد False')
    for a, b in re.findall(r'(\d+)/(\d+)', out):
        if a != b:
            why.append(f'نسبة ناقصة {a}/{b}')
            break
    if re.search(r'failures=[1-9]', out):
        why.append('failures غير صفرية')
    m = re.search(r'js errors:\s*\[(.+?)\]', out)
    if m:
        why.append('أخطاء JS')
    return why


def main():
    pick = sys.argv[1] if len(sys.argv) > 1 else ''
    files = sorted(p for p in HERE.glob('test_*.py') if pick in p.name)
    if not files:
        sys.exit('لا توجد اختبارات مطابقة')
    rows, bad = [], 0
    for f in files:
        t0 = time.time()
        r = subprocess.run([sys.executable, str(f)], capture_output=True, text=True, encoding='utf-8')
        out = r.stdout + r.stderr
        why = verdict(out, r.returncode)
        bad += bool(why)
        rows.append((f.name, 'نجح' if not why else 'فشل: ' + '، '.join(why), time.time() - t0))
        if why:
            print(f'\n----- {f.name} -----\n{out[-1800:]}')
    print('\n' + '=' * 60)
    for n, v, t in rows:
        print(f'{"✓" if v == "نجح" else "✗"} {n:<28} {v}  ({t:.0f}ث)')
    print('=' * 60)
    print('النتيجة:', 'كل الاختبارات نجحت' if not bad else f'{bad} من {len(files)} فشلت')
    sys.exit(1 if bad else 0)


if __name__ == '__main__':
    main()
