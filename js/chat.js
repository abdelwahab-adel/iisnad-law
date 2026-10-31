/* إسناد القانونية — المساعد الآلي (الشات): بديل زر واتساب العائم.
   - يجيب من محتوى الموقع نفسه (js/chat-data.js المولَّد بـ tools/build_chat_data.py)، ولا يخترع معلومات.
   - لا يرسل شيئًا إلى أي خادم: المحادثة تُحفظ في sessionStorage (حتى إغلاق التبويب) ولا تغادر المتصفح
     إلا إذا اختار الزائر بنفسه فتح واتساب أو البريد أو الاتصال.
   - أرقام التواصل تُقرأ من CONFIG في main.js (window.SITE_CONFIG)؛ ما لم يُضبط شيء منها تظهر روابط الموقع فقط. */
(function () {
  'use strict';

  var D = window.CHAT_DATA;
  if (!D || !document.body) return;
  var CFG = window.SITE_CONFIG || {};
  var me = document.currentScript || document.querySelector('script[src*="chat.js"]');
  var ROOT = ((me && me.getAttribute('src')) || 'js/chat.js').replace(/js\/chat\.js.*$/, '');
  var KEY = 'isnad-chat-v1';
  var calm = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var coarse = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
  var WA_PATH = 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z';

  /* ---------------- أيقونات ---------------- */
  var IC = {
    chat: '<path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.55L3 20.5l1.5-5.1A8.5 8.5 0 1 1 21 11.5Z"/><path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01"/>',
    close: '<path d="M18 6 6 18M6 6l12 12"/>',
    reset: '<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/>',
    send: '<path d="m22 2-7 20-4-9-9-4 20-7Z"/><path d="M22 2 11 13"/>',
    arrow: '<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    form: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
    pin: '<path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>'
  };
  function svg(name) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      (name === 'wa' ? '<path d="' + WA_PATH + '"/>' : IC[name]) + '</svg>';
  }
  var ACT_ICON = { wa: 'wa', call: 'phone', mail: 'mail', form: 'form', page: 'arrow', map: 'pin', pri: 'chat' };

  /* ---------------- تطبيع النص العربي ---------------- */
  function norm(s) {
    return String(s).toLowerCase()
      .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
      .replace(/[إأآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي')
      .replace(/[\u0660-\u0669]/g, function (d) { return String(d.charCodeAt(0) - 1632); })
      .replace(/[^\u0621-\u063A\u0641-\u064Aa-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ').trim();
  }
  var PRE = /^[وف]?(?:بال|كال|لل|ال)/;
  function stripPre(w) {
    var r = w.replace(PRE, '');
    if (r.length < 2) r = w;
    if (r.length >= 4 && r.charAt(0) === 'و') r = r.slice(1); // «ومعتمد» → «معتمد»
    return r;
  }
  function toks(s) { return norm(s).split(' ').filter(Boolean).map(stripPre); }
  function phrase(k) { return toks(k).join(' '); }
  /* كلمة مفتاحية: تنتهي بـ$ يعني تطابق نهاية الكلمة تمامًا (فلا تطابق «من أنت» عبارة «من أنتم») */
  function K(k) { return { t: phrase(k.replace(/\$$/, '')), x: /\$$/.test(k) }; }

  /* ---------------- قاعدة المعرفة: النوايا ---------------- */
  var AK = {
    'commercial-law': 'قانون تجاري|قضايا تجارية|قضية تجارية|نزاع تجاري|نزاعات تجارية|نزاع شركاء|المساهمين|أوراق تجارية|وكالة تجارية|حوكمة|محكمة تجارية|شريكي|شركائي|نزاع مع شريك|تجاري|تجارية',
    'criminal-law': 'جنائي|جنائية|جناية|جريمة|جرائم|بلاغ|متهم|النيابة العامة|نيابة|قضية جنائية|دفاع جنائي',
    'civil-cases': 'مدني|مدنية|قضايا مدنية|تعويض|تعويضات|مطالبة مالية|مسؤولية مدنية|ضرر|أضرار',
    'personal-status': 'أحوال شخصية|أسرة|أسري|أسرية|طلاق|نفقة|حضانة|زيارة الأطفال|ميراث|تركة|تركات|وصية|وصايا|خلع|فسخ زواج|زواج|ورثة',
    'company-formation': 'افتح شركة|أسس شركة|أنشئ شركة|أسجل شركة|تكوين شركة|تأسيس شركة|تأسيس شركات|تأسيس الشركات|فتح شركة|إنشاء شركة|سجل تجاري|عقد التأسيس|شركة ذات مسؤولية محدودة|شركة مساهمة|اتفاقية شركاء',
    'contracts': 'عقد|عقود|صياغة عقد|مراجعة عقد|مراجعة العقد|توقيع عقد|بنود العقد|فسخ عقد',
    'investment': 'استثمار|استثمارات|مستثمر|دخول السوق|فحص قانوني|صفقة|صفقات',
    'arbitration': 'تحكيم|محكم$|محكمين|شرط تحكيم|هيئة تحكيم|مركز التحكيم',
    'intellectual-property': 'ملكية فكرية|علامة تجارية|علامتي|براءة|براءات|حقوق مؤلف|حقوق النشر|سر تجاري|أسرار تجارية|تسجيل علامة',
    'tax': 'ضريبة|ضرائب|ضريبي|زكاة|قيمة مضافة|هيئة الزكاة',
    'real-estate': 'عقد إيجار|عقار|عقاري|عقارات|إيجار|إخلاء|مستأجر|مؤجر|صك|صكوك|رهن|بيع عقار|أرض|شقة|تطوير عقاري|مقاولات',
    'enforcement': 'تنفيذ|محكمة التنفيذ|حجز على|حجز أموال|حجز تحفظي|منع سفر|حكم لم ينفذ|سند تنفيذي|قاضي التنفيذ|ينفذ الحكم',
    'debt-collection': 'فلوسي|فلوس|تحصيل|دين|ديون|مستحقات|استرداد|إنذار|مديونية|مطالبة بدين|متأخرات',
    'labor-cases': 'قضايا العمل|قضية عمالية|عمالي|عمالية|عمال|عامل|موظف|موظفين|فصل|فصلوني|فصل تعسفي|نهاية خدمة|مستحقات عمالية|صاحب عمل|عقد عمل|نظام العمل|مكتب العمل|راتب|رواتب',
    'international-litigation': 'تقاضي دولي|عابر للحدود|عابرة للحدود|نزاع دولي|حكم أجنبي|أحكام أجنبية|اختصاص قضائي|مكتب أجنبي|خارج المملكة'
  };
  var NEXT_AREA = ['احجز استشارة', 'المستندات المطلوبة', 'الأتعاب', 'مجالات أخرى'];

  var I = [
    { id: 'bot', b: 3, k: 'من أنت$|أنت مين$|مين أنت$|اسمك|أنت بوت|أنت روبوت|هل أنت إنسان|هل أنت بشر|أنت إنسان' },
    { id: 'about', b: 1, k: 'من نحن|من أنتم|عن المكتب|نبذة|تأسس|سنة التأسيس|تعرف علينا|حدثني عن المكتب|تاريخ المكتب|قصة المكتب' },
    { id: 'areas', b: 0, k: 'مجالات|تخصصات|تخصص|خدمات|خدماتكم|ماذا تقدمون|ايش تقدمون|وش تقدمون|تقدمون|أنواع القضايا|تتولون|هل تقبلون|مجال' },
    { id: 'booking', b: 0, k: 'احجز|حجز|موعد|اطلب استشارة|أبغى استشارة|أبي استشارة|أريد استشارة|أحتاج استشارة|استشارة|مقابلة|زيارة المكتب|أقابل' },
    { id: 'fees', b: 1, k: 'أتعاب|أتعابكم|سعر|أسعار|أسعاركم|تكلفة|تكاليف|كم تأخذون|كم تكلف|رسوم|كم المبلغ|مبلغ|أجور|مصروفات|مصاريف|بكم|كم السعر|كم يكلف' },
    { id: 'free', b: 3, k: 'مجاني|مجانية|مجانا|بدون مقابل|بلاش|استشارة مجانية|مدفوعة|مدفوع|بفلوس' },
    { id: 'confidential', b: 1, k: 'سري|سرية|خصوصية|أسرار|معلوماتي الشخصية|حفظ المعلومات|هل معلوماتي' },
    { id: 'after', b: 3, k: 'بعد الاستشارة|ماذا يحدث بعد|وش يصير بعد|ايش يصير بعد|بعد الأولى' },
    { id: 'process', b: 0, k: 'مراحل العمل|خطوات العمل|خطواتكم|مراحلكم|خطوات التعاقد|خطوات التعامل|منهجية|كيف تعملون|كيف تشتغلون|طريقة العمل|طريقة شغلكم|سير العمل|مسار العمل|إجراءات العمل|كيف يتم العمل' },
    { id: 'duration', b: 2, k: 'كم تستغرق|كم تأخذ القضية|كم تأخذ الدعوى|كم تأخذ من الوقت|مدة القضية|كم المدة|كم تطول|متى تنتهي|وقت القضية|كم يوم|كم شهر|طول القضية|كم يستغرق' },
    { id: 'docs', b: 1, k: 'مستندات|أوراق|وثائق|ماذا أحضر|ايش أحضر|وش أحضر|ماذا أجهز|أجهز|تجهيز|المطلوب مني|ماذا تحتاجون|تحتاجون مني' },
    { id: 'urgent', b: 1, k: 'عاجل|عاجلة|مستعجل|مستعجلة|طارئ|طارئة|طوارئ|فوري|فورا|بسرعة' },
    { id: 'emergency', b: 4, k: 'قبض|انقبض|مقبوض|القبض علي|قبضوا علي|تم القبض|اعتقال|اعتقلوا|موقوف|توقيف|أوقفوا|سجن|محتجز|احتجاز|استدعاء|استدعوني|استدعيت|تحقيق|مركز شرطة|شرطة' },
    { id: 'notice', b: 2, k: 'إشعار|إشعارات|تبليغ|رفعوا علي دعوى|رفعت علي دعوى|وصلني إنذار|وصلتني دعوى|تلقيت' },
    { id: 'visit', b: 0, k: 'مواعيد العمل|ساعات العمل|مواعيد الدوام|دوام|متى تفتحون|متى تعملون|أوقات الدوام|مفتوح|تفتحون|الجمعة|السبت|إجازة|عنوان|عنوانكم|موقع المكتب|موقعكم|وين|فين|أين|مكان|خريطة|العليا|طريق الملك فهد|كيف أوصل|مقر|زيارة|الرياض' },
    { id: 'contact', b: 0, k: 'تواصل|تواصلوا|اتصال|اتصل|رقم|هاتف|جوال|تلفون|واتس|واتساب|إيميل|بريد|كلمكم|أكلمكم|أكلم|مراسلة|أراسلكم|أتحدث مع|أكلم محامي|موظف|خدمة العملاء|شخص حقيقي|ممثل' },
    { id: 'remote', b: 2, k: 'عن بعد|أونلاين|online|من خارج|خارج الرياض|خارج المملكة|فيديو|زوم|zoom|مكالمة فيديو|اتصال مرئي|مستثمر أجنبي|شركة أجنبية|مستثمرين أجانب|استشارة بالتلفون|استشارة بالهاتف|استشارة بالجوال|استشارة هاتفية|استشارة عبر الهاتف' },
    { id: 'guarantee', b: 1, k: 'ضمان|تضمنون|تضمن|ضامن|مضمونة|نضمن|أكسب القضية|هل أكسب|نسبة النجاح|نسبة نجاح' },
    { id: 'poa', b: 0, k: 'وكالة|توكيل|أوكل|توكل|ناجز|وكيل' },
    { id: 'team', b: 0, k: 'فريق|محامين|محامون|شريك$|الشريك المدير|مستشارين|عبدالعزيز|الراشد|نورة|الفهد|سلمان|الدوسري|ريم|العتيبي|خبرة|سنوات الخبرة' },
    { id: 'license', b: 1, k: 'مرخص|مرخصين|مرخصون|ترخيص|رخصة|رخصة مزاولة|عضوية|هيئة المحامين|اعتماد|اعتمادات|معتمد|موثوق|تحقق من المكتب' },
  ];
  Object.keys(AK).forEach(function (s) { I.push({ id: 'area:' + s, b: 0, k: AK[s] }); });
  var OPIN = 'قضيتي|مشكلتي|موقفي القانوني|هل يحق لي|هل لي حق|هل أستطيع|رأيك|رأيكم|ماذا أفعل|وش أسوي|ايش أعمل|شو أسوي|أنصحوني|تنصحني|حالتي|عندي قضية|عندي مشكلة|تعرضت|ظلموني|نصبوا'.split('|').map(K);
  I.forEach(function (it) {
    it.kw = it.k.split('|').map(K).filter(function (k) { return k.t.length >= 2; });
  });

  var GREET = ['مرحبا', 'مرحبتين', 'اهلا', 'اهلين', 'هلا', 'هاي', 'السلام$', 'سلام$', 'صباح', 'مساء', 'hello', 'hi', 'هلا والله', 'حياك'].map(K);
  var THANKS = ['شكرا', 'شكر', 'مشكور', 'يعطيك العافية', 'جزاك الله', 'تسلم', 'ممتاز', 'ممنون', 'thanks'].map(K);
  var BYE = ['مع السلامة', 'وداعا', 'باي', 'الى اللقاء', 'تصبح على خير', 'bye'].map(K);

  function hit(hay, kw) { return kw.x ? (hay + ' ').indexOf(' ' + kw.t + ' ') >= 0 : hay.indexOf(' ' + kw.t) >= 0; }
  function anyHit(hay, list) { return list.some(function (k) { return hit(hay, k); }); }
  function score(it, hay) {
    var s = 0;
    it.kw.forEach(function (k) {
      if (!hit(hay, k)) return;
      var n = k.t.split(' ').length;
      s += n * 2 + (n > 1 ? 1 : 0);
    });
    return s > 0 ? s + (it.b || 0) : 0;
  }

  /* ---------------- مطابقة الأسئلة الشائعة ---------------- */
  var STOP = {};
  ('هل ما ماذا كيف اي ايش وش لماذا متي اين كم من في علي الي عن مع هو هي هذا هذه ذلك التي الذي او ان لا نعم يمكن يمكنني اريد ابغي ابي احتاج ' +
   'عندي لدي انا نحن انت بعد قبل لي لك له بين هناك يوجد تكون يكون كان عند حول ثم قد فقط ممكن لو طيب اذا لما مثل غير كل بس ده دي ايه فين المكتب مكتب لدينا').split(' ')
    .forEach(function (w) { STOP[w] = 1; });
  var SYN = { 'مده': 'مهله', 'مهله': 'مده', 'ثمن': 'اتعاب', 'فلوس': 'اتعاب' };
  function content(s, syn) {
    var seen = {}, out = [];
    toks(s).forEach(function (t) {
      if (t.length < 3 || STOP[t]) return;
      [t].concat(syn && SYN[t] ? [SYN[t]] : []).forEach(function (w) { if (!seen[w]) { seen[w] = 1; out.push(w); } });
    });
    return out;
  }
  function same(a, b) { return a === b || (a.length >= 4 && b.length >= 4 && (a.indexOf(b) === 0 || b.indexOf(a) === 0)); }
  function has(set, t) { for (var i = 0; i < set.length; i++) if (same(set[i], t)) return true; return false; }
  D.faq.forEach(function (f) { f.qs = content(f.q); f.as = content(f.a); });
  function faqMatch(text) {
    var msg = content(text, true), best = null;
    if (!msg.length) return null;
    D.faq.forEach(function (f, idx) {
      var qm = 0, am = 0;
      msg.forEach(function (t) { if (has(f.qs, t)) qm++; else if (has(f.as, t)) am++; });
      var sc = qm * 3 + am;
      if (!best || sc > best.score) best = { i: idx, qm: qm, am: am, score: sc };
    });
    return best && best.score > 0 ? best : null;
  }
  function fq(key) { return D.faq[D.fk[key]]; }

  /* ---------------- قنوات التواصل (من CONFIG) ---------------- */
  function ltr(s) { return '\u2066' + s + '\u2069'; }
  function waNum() { return String(CFG.whatsapp || '').replace(/\D/g, ''); }
  function channels(prefill) {
    var a = [], wa = waNum();
    if (wa) a.push({ l: 'تواصل عبر واتساب', href: 'https://wa.me/' + wa + (prefill ? '?text=' + encodeURIComponent(prefill) : ''), k: 'wa', x: 1 });
    if (CFG.phone) a.push({ l: 'اتصل بالمكتب', href: 'tel:' + String(CFG.phone).replace(/\s/g, ''), k: 'call', x: 1 });
    if (CFG.email) a.push({ l: 'راسلنا بالبريد', href: 'mailto:' + CFG.email, k: 'mail', x: 1 });
    a.push({ l: 'نموذج حجز الاستشارة', href: 'contact.html#contact', k: 'form' });
    return a;
  }
  function channelList() {
    var l = [], wa = waNum();
    if (CFG.phone) l.push('الهاتف: ' + ltr(CFG.phone));
    if (wa) l.push('واتساب: ' + ltr('+' + wa));
    if (CFG.email) l.push('البريد: ' + ltr(CFG.email));
    return l;
  }

  /* ---------------- الاقتراحات ---------------- */
  var C = {
    areas: { l: 'مجالات الممارسة', i: 'areas' }, booking: { l: 'احجز استشارة', i: 'booking' },
    process: { l: 'كيف نعمل؟', i: 'process' }, fees: { l: 'الأتعاب', i: 'fees' },
    conf: { l: 'سرية معلوماتك', i: 'confidential' }, visit: { l: 'المواعيد والموقع', i: 'visit' },
    contact: { l: 'التواصل', i: 'contact' }, about: { l: 'من نحن', i: 'about' }, docs: { l: 'المستندات المطلوبة', i: 'docs' },
    free: { l: 'هل الاستشارة مجانية؟', i: 'free' }, after: { l: 'ماذا يحدث بعد الاستشارة؟', i: 'after' },
    duration: { l: 'كم تستغرق القضية؟', i: 'duration' }, team: { l: 'الفريق القانوني', i: 'team' },
    license: { l: 'التراخيص والاعتمادات', i: 'license' }, urgent: { l: 'استشارة عاجلة', i: 'urgent' },
    remote: { l: 'استشارة عن بُعد', i: 'remote' }, poa: { l: 'الوكالة', i: 'poa' }
  };
  var MAIN = [C.areas, C.booking, C.process, C.fees, C.conf, C.visit, C.contact];
  function chips() { return Array.prototype.slice.call(arguments); }

  /* ---------------- الردود ---------------- */
  var KIND = ['قضية تجارية', 'قضية عقارية', 'قضية أسرية', 'قضية جنائية', 'قضية عمالية', 'تحكيم دولي', 'استشارة شركات', 'أخرى'];
  var URG = ['استشارة عامة', 'خلال أسبوع', 'عاجلة خلال 48 ساعة'];
  var TOP = ['commercial-law', 'real-estate', 'personal-status', 'criminal-law', 'labor-cases', 'company-formation', 'contracts', 'arbitration', 'debt-collection'];

  function area(s) { return D.areas.filter(function (a) { return a.s === s; })[0]; }
  function areaChip(s) { var a = area(s); return { l: a.n, i: 'area:' + s }; }
  function R(m, c) { return { m: m, c: c || MAIN }; }

  var WELCOME = {
    h: 'مرحبًا بك في إسناد القانونية',
    p: ['أنا المساعد الآلي للمكتب. أجيب عن أسئلتك حول مجالات الممارسة وخطوات العمل والأتعاب وحجز الاستشارة وبيانات التواصل.',
        'اختر موضوعًا من الأسفل أو اكتب سؤالك.'],
    n: 'المعلومات عامة للتوعية ولا تُغني عن استشارة محامٍ. لا تكتب هنا بيانات هوية أو تفاصيل سرية.'
  };

  function answer(id, p) {
    var m, f;
    switch (id) {
      case 'menu': return R({ p: ['تفضّل، بماذا أستطيع مساعدتك؟'] });
      case 'greet': return R({ p: ['أهلًا بك في إسناد القانونية. كيف أستطيع مساعدتك؟'] });
      case 'salam': return R({ p: ['وعليكم السلام ورحمة الله وبركاته، أهلًا بك في إسناد القانونية. كيف أستطيع مساعدتك؟'] });
      case 'thanks': return R({ p: ['العفو، يسعدنا خدمتك. هل لديك سؤال آخر؟'] });
      case 'bye': return R({ p: ['مع السلامة، ونسعد بخدمتك متى شئت.'] }, chips(C.booking, C.contact));
      case 'bot':
        return R({ p: ['أنا المساعد الآلي لمكتب إسناد القانونية، ولست محاميًا. أجيب عن الأسئلة العامة اعتمادًا على محتوى الموقع، وأي رأي في حالتك الخاصة يقدّمه محامو المكتب في الاستشارة.'] },
          chips(C.areas, C.booking, C.contact));
      case 'about':
        return R({ h: 'من نحن', p: [D.about], a: [{ l: 'تعرّف على المكتب', href: 'about.html', k: 'page' }] }, chips(C.team, C.license, C.process, C.booking));
      case 'areas':
        return R({ h: 'مجالات الممارسة', p: ['يغطي المكتب ' + D.areas.length + ' مجالًا قانونيًا للأفراد والشركات والمستثمرين. اختر مجالًا لأعرض لك ما نتولاه فيه:'],
          a: [{ l: 'كل مجالات الممارسة', href: 'practice.html', k: 'page' }] },
          TOP.map(areaChip).concat([{ l: 'مجالات أخرى', i: 'areas_more' }]));
      case 'areas_more':
        return R({ p: ['وهذه بقية المجالات:'] },
          D.areas.filter(function (a) { return TOP.indexOf(a.s) < 0; }).map(function (a) { return { l: a.n, i: 'area:' + a.s }; }).concat([C.booking]));
      case 'booking':
        return R({ h: 'حجز استشارة', p: ['يمكنك طلب الاستشارة بإحدى طريقتين:'],
          ul: ['تعبئة نموذج حجز الاستشارة في صفحة «تواصل معنا».', 'أو ابدأ طلبًا مختصرًا هنا، فأجهّز لك ملخصًا ترسله إلى المكتب بالطريقة التي تناسبك.'],
          n: 'لا يُرسل شيء من هذه المحادثة تلقائيًا، وتراجع الملخص قبل الإرسال.',
          a: [{ l: 'ابدأ الطلب هنا', i: 'f_start', k: 'pri' }, { l: 'نموذج حجز الاستشارة', href: 'contact.html#contact', k: 'form' }] },
          chips(C.free, C.docs, C.after, C.fees));
      case 'f_start':
        S.flow = { s: 'name', n: '', a: '', u: '' };
        return R({ p: ['حسنًا، سأجهّز لك طلبًا مختصرًا في ثلاث خطوات. ما اسمك؟ يكفي الاسم الأول.'] },
          chips({ l: 'تخطي', i: 'f_skip' }, { l: 'إلغاء', i: 'f_cancel' }));
      case 'f_cancel':
        S.flow = null;
        return R({ p: ['تم إلغاء الطلب. يمكنك البدء من جديد متى شئت.'] }, chips(C.booking, C.areas, C.contact));
      case 'f_skip': return flow('');
      case 'f_area': return flow(p);
      case 'f_urg': return flow(p);
      case 'fees':
        return R({ h: 'الأتعاب', p: [fq('fees').a, 'أما الاستشارة الأولى: ' + fq('free').a], n: fq('expenses').a,
          a: [{ l: 'احجز استشارة', i: 'booking' }] }, chips(C.after, C.docs, C.booking));
      case 'free': return R({ p: [fq('free').a] }, chips(C.fees, C.booking));
      case 'confidential':
        return R({ h: 'سرية معلوماتك', p: [fq('secret').a],
          n: 'وهذه المحادثة تُحفظ في متصفحك فقط خلال الجلسة، ولا تصل إلى المكتب إلا إذا اخترت أنت إرسالها.' }, chips(C.license, C.booking, C.docs));
      case 'after': return R({ p: [fq('after').a] }, chips(C.fees, C.duration, C.booking));
      case 'process':
        return R({ h: 'كيف نعمل؟', p: ['نعمل وفق مسار واضح من خمس خطوات:'],
          ol: D.steps.map(function (s) { return { x: s.t, s: s.d }; }),
          a: [{ l: 'تفاصيل منهجية العمل', href: 'about.html#method', k: 'page' }] }, chips(C.duration, C.docs, C.booking));
      case 'duration':
        return R({ p: [D.duration] }, chips(C.process, C.fees, C.booking));
      case 'docs':
        return R({ h: 'ما الذي تجهّزه قبل الاستشارة؟', ul: D.prep, n: fq('docs').a }, chips(C.booking, C.conf, C.fees));
      case 'urgent':
        return R({ h: 'الاستشارة العاجلة', p: [fq('urgent').a], a: channels('السلام عليكم، لدي مسألة قانونية عاجلة وأرغب في التواصل مع المكتب.') },
          chips(C.booking, C.docs));
      case 'emergency':
        return R({ h: 'حالة عاجلة', p: ['إن كنت أو أحد أقاربك مستدعى للتحقيق أو موقوفًا، فتواصل مع المكتب في أقرب وقت ممكن.', fq('rights').a, 'وفي الطلبات العاجلة: ' + fq('urgent').a],
          a: channels('السلام عليكم، لدي حالة عاجلة تتعلق بتحقيق أو استدعاء وأحتاج إلى محامٍ في أقرب وقت.') },
          chips(C.docs, C.conf, C.booking));
      case 'notice':
        return R({ h: 'إشعار أو دعوى', p: [fq('notice').a], a: channels('السلام عليكم، وصلني إشعار أو دعوى وأرغب في مراجعتها مع المكتب.') },
          chips(C.docs, C.booking, C.fees));
      case 'visit':
        return R({ h: 'المواعيد والموقع', ul: ['العنوان: ' + D.address, 'مواعيد العمل: ' + D.hours, D.closed],
          n: 'يمكنك إرسال طلبك عبر النموذج في أي وقت، ونتواصل معك في أقرب فرصة.',
          a: [{ l: 'الخريطة وتفاصيل الموقع', href: 'contact.html#location', k: 'map' }] }, chips(C.booking, C.contact, C.remote));
      case 'contact':
        f = channelList();
        return R({ h: 'التواصل مع المكتب', p: [f.length ? 'يسعدنا تواصلك، وهذه قنواتنا:' : 'يسعدنا تواصلك. أرسل لنا طلبك عبر نموذج «تواصل معنا» وسيتواصل معك فريق المكتب.'],
          ul: f.length ? f : null, n: 'مواعيد العمل: ' + D.hours + '، ' + D.closed + '.',
          a: channels('السلام عليكم، أرغب في التواصل مع المكتب.') }, chips(C.booking, C.visit, C.areas));
      case 'remote':
        return R({ h: 'الاستشارة عن بُعد', p: [fq('remote').a, fq('foreign').a], a: [{ l: 'احجز استشارة', i: 'booking' }] }, chips(C.booking, C.visit, C.fees));
      case 'guarantee': return R({ p: [fq('guarantee').a] }, chips(C.process, C.booking));
      case 'poa': return R({ h: 'الوكالة', p: [fq('poa').a] }, chips(C.fees, C.booking, C.docs));
      case 'team':
        return R({ h: 'الفريق القانوني', p: ['يضم المكتب نخبة من المحامين المتخصصين، ومنهم:'],
          ul: D.team.map(function (t) { return t.n + ' — ' + t.r + '، ' + t.s + ' (' + t.y + ' سنة خبرة)'; }),
          a: [{ l: 'تعرّف على الفريق', href: 'about.html#team', k: 'page' }] }, chips(C.license, C.process, C.booking));
      case 'license':
        return R({ h: 'التراخيص والاعتمادات',
          p: ['محامو المكتب مرخصون رسميًا، ويمكنك طلب بيانات الترخيص والعضوية المهنية قبل التعاقد؛ وهذا حق لك عند اختيار أي مكتب محاماة.', 'وللتحقق من أي مكتب محاماة قبل التعاقد:'],
          ol: D.checks.map(function (x) { return { x: x }; }),
          a: [{ l: 'الاعتمادات المهنية', href: 'index.html#accred', k: 'page' }] }, chips(C.conf, C.fees, C.booking));
      case 'opinion':
        return R({ p: ['لا أستطيع إبداء رأي قانوني في حالة بعينها عبر المحادثة؛ فالإجابة تتوقف على الوقائع والمستندات والأنظمة النافذة.', fq('info').a],
          a: [{ l: 'ابدأ طلب استشارة', i: 'f_start', k: 'pri' }] }, chips(C.docs, C.fees, C.areas));
      case 'english':
        return R({ p: ['I currently answer in Arabic. For English-language inquiries, please use the booking form on our contact page and our team will get back to you.'],
          a: channels('Hello, I would like to inquire about your legal services.') }, chips(C.areas, C.booking));
      case 'faq':
        f = D.faq[p];
        return R({ p: [f.a], n: 'من الأسئلة الشائعة. المعلومات عامة وقد تختلف باختلاف الوقائع.',
          a: [{ l: 'كل الأسئلة الشائعة', href: 'faq.html', k: 'page' }] }, chips(C.booking, C.areas, C.fees));
      case 'fallback':
        return R({ p: ['لم أتمكن من فهم سؤالك بدقة، ولا أودّ أن أعطيك معلومة غير مؤكدة. اختر موضوعًا من الأسفل، أو تواصل مع فريق المكتب مباشرة.'],
          a: channels('السلام عليكم، لدي استفسار قانوني.') });
      default:
        if (id.indexOf('area:') === 0) {
          var a = area(id.slice(5));
          return R({ h: a.n, p: [a.d, 'أبرز ما نتولاه:'], ul: a.c, n: 'الجهات المختصة: ' + a.a + '.',
            a: [{ l: 'صفحة ' + a.n, href: 'practice/' + a.s + '.html', k: 'page' }] }, chips(C.booking, C.docs, C.fees, { l: 'مجالات أخرى', i: 'areas' }));
        }
        return answer('fallback');
    }
  }

  /* ---------------- تدفّق «احجز استشارة» ---------------- */
  function clip(s, n) { return String(s).replace(/\s+/g, ' ').trim().slice(0, n); }
  function flow(val) {
    var F = S.flow, cancel = chips({ l: 'إلغاء', i: 'f_cancel' });
    if (!F) return answer('menu');
    if (F.s === 'name') {
      F.n = clip(val, 40); F.s = 'area';
      return R({ p: [(F.n ? 'أهلًا ' + F.n + '. ' : '') + 'ما نوع المسألة؟ اختر من الأسفل أو اكتبها بإيجاز.'] },
        KIND.map(function (k) { return { l: k, i: 'f_area', p: k }; }).concat(cancel));
    }
    if (F.s === 'area') {
      F.a = clip(val, 60); F.s = 'urg';
      return R({ p: ['وما مدى أولوية الطلب؟'] }, URG.map(function (k) { return { l: k, i: 'f_urg', p: k }; }).concat(cancel));
    }
    F.u = clip(val, 40);
    var msg = 'السلام عليكم، أرغب في حجز استشارة قانونية.' + (F.n ? '\nالاسم: ' + F.n : '') + '\nنوع المسألة: ' + F.a + '\nالأولوية: ' + F.u;
    var ul = (F.n ? ['الاسم: ' + F.n] : []).concat(['نوع المسألة: ' + F.a, 'الأولوية: ' + F.u]);
    S.flow = null;
    var ch = channels(msg);
    return R({ h: 'ملخص طلبك', p: ['جهّزتُ لك الملخص التالي:'], ul: ul,
      n: ch.length > 1 ? 'لم يُرسل شيء بعد. اختر القناة التي تناسبك لإرسال الملخص إلى المكتب.'
                       : 'لم يُرسل شيء بعد. أكمل طلبك عبر نموذج الحجز، ويمكنك نقل هذه البيانات إليه.', a: ch },
      chips(C.docs, C.fees, C.areas));
  }

  /* ---------------- فهم الرسالة ---------------- */
  function understand(text) {
    var n = norm(text);
    if (!n) return answer('fallback');
    if (/^[a-z0-9\s]+$/.test(n) && /[a-z]{2,}/.test(n) && !anyHit(' ' + n, GREET.concat(THANKS, BYE))) return answer('english');
    var tk = toks(text), hay = ' ' + tk.join(' ');
    var best = null;
    I.forEach(function (it) {
      var s = score(it, hay);
      if (s > 0 && (!best || s > best.s || (s === best.s && (it.b || 0) > (best.it.b || 0)))) best = { it: it, s: s };
    });
    var fm = faqMatch(text), fs = fm ? fm.score : 0, bs = best ? best.s : 0;
    if (tk.length <= 6 && bs < 2 && fs < 5) {
      if (anyHit(hay, GREET)) return answer(/سلام/.test(n) ? 'salam' : 'greet');
      if (anyHit(hay, THANKS)) return answer('thanks');
      if (anyHit(hay, BYE)) return answer('bye');
    }
    if (fm && (fm.qm >= 3 || (fm.qm >= 2 && fs >= 7 && fs > bs))) return answer('faq', fm.i);
    if (bs >= 2) return answer(best.it.id);
    if (fm && fm.qm >= 2 && fs >= 6) return answer('faq', fm.i);
    if (anyHit(hay, OPIN)) return answer('opinion');
    return answer('fallback');
  }

  /* ---------------- الحالة والتخزين ---------------- */
  var S = { v: 1, open: false, msgs: [], chips: [], flow: null };
  function load() {
    try {
      var r = JSON.parse(sessionStorage.getItem(KEY) || 'null');
      if (r && r.v === 1 && r.msgs && r.msgs.length) S = r;
    } catch (e) { /* التخزين غير متاح */ }
  }
  function save() {
    try {
      if (S.msgs.length > 40) S.msgs = S.msgs.slice(-40);
      sessionStorage.setItem(KEY, JSON.stringify(S));
    } catch (e) { /* ignore */ }
  }

  /* ---------------- الواجهة ---------------- */
  function mk(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }
  var root = mk('div', 'cw');
  root.setAttribute('dir', 'rtl');
  root.setAttribute('lang', 'ar');
  var btn = mk('button', 'cw-btn');
  btn.type = 'button';
  btn.setAttribute('aria-haspopup', 'dialog');
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', 'cw-panel');
  btn.setAttribute('aria-label', 'فتح المساعد الآلي');
  btn.innerHTML = '<span class="cw-ic">' + svg('chat') + '</span><span class="cw-x">' + svg('close') + '</span>';
  btn.appendChild(mk('span', 'cw-lbl', 'اسأل المساعد'));
  btn.appendChild(mk('span', 'cw-pip'));
  btn.querySelector('.cw-pip').setAttribute('aria-hidden', 'true');

  var panel = mk('div', 'cw-panel');
  panel.id = 'cw-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'المساعد الآلي لمكتب إسناد القانونية');
  panel.hidden = true;
  panel.tabIndex = -1;
  panel.innerHTML =
    '<div class="cw-hd"><div class="cw-av" aria-hidden="true">§</div>' +
    '<div class="cw-ti"><b>مساعد إسناد القانونية</b><span class="cw-st"><i></i>مساعد آلي · يجيب فورًا</span></div>' +
    '<button type="button" class="cw-ib cw-reset" aria-label="بدء محادثة جديدة" title="بدء محادثة جديدة">' + svg('reset') + '</button>' +
    '<button type="button" class="cw-ib cw-close" aria-label="إغلاق المساعد" title="إغلاق">' + svg('close') + '</button></div>' +
    '<div class="cw-log" role="log" aria-live="polite" aria-relevant="additions" tabindex="0" aria-label="سجل المحادثة"></div>' +
    '<div class="cw-sg" role="group" aria-label="اقتراحات سريعة"></div>' +
    '<form class="cw-f" autocomplete="off"><input class="cw-in" type="text" maxlength="300" aria-label="اكتب رسالتك" placeholder="اكتب سؤالك…" enterkeyhint="send">' +
    '<button type="submit" class="cw-send" aria-label="إرسال">' + svg('send') + '</button></form>' +
    '<p class="cw-ft">مساعد آلي للإرشاد العام — لا يغني عن استشارة محامٍ.</p>';
  root.appendChild(panel);
  root.appendChild(btn);
  document.body.appendChild(root);

  var log = panel.querySelector('.cw-log'), tray = panel.querySelector('.cw-sg'), form = panel.querySelector('.cw-f'),
      input = panel.querySelector('.cw-in'), send = panel.querySelector('.cw-send'), typing = null, busy = false;

  function actionEl(a) {
    var isBtn = !!a.i, el = mk(isBtn ? 'button' : 'a', 'cw-a');
    if (isBtn) {
      el.type = 'button';
      el.addEventListener('click', function () { ask(a.l, a.i, a.p); });
    } else {
      el.href = a.x ? a.href : ROOT + a.href;
      if (a.x && /^https?:/.test(a.href)) { el.target = '_blank'; el.rel = 'noopener noreferrer'; }
      if (!a.x) el.addEventListener('click', function () { setOpen(false, true); });
    }
    if (a.k === 'pri') el.classList.add('pri');
    if (a.k === 'wa') el.classList.add('wa');
    el.innerHTML = svg(ACT_ICON[a.k] || 'arrow') + '<span></span>';
    el.lastChild.textContent = a.l;
    return el;
  }
  function render(m, fresh) {
    var wrap = mk('div', 'cw-m ' + (m.f === 'u' ? 'u' : 'b') + (fresh && !calm ? ' new' : '')), bub = mk('div', 'cw-bb');
    if (m.f === 'u') bub.textContent = m.x;
    else {
      if (m.h) bub.appendChild(mk('p', 'cw-h', m.h));
      (m.p || []).forEach(function (t) { bub.appendChild(mk('p', '', t)); });
      if (m.ul) { var ul = mk('ul'); m.ul.forEach(function (t) { ul.appendChild(mk('li', '', t)); }); bub.appendChild(ul); }
      if (m.ol) {
        var ol = mk('ol');
        m.ol.forEach(function (o) { var li = mk('li'); li.appendChild(document.createTextNode(o.x)); if (o.s) li.appendChild(mk('small', '', o.s)); ol.appendChild(li); });
        bub.appendChild(ol);
      }
      if (m.n) bub.appendChild(mk('p', 'cw-n', m.n));
    }
    wrap.appendChild(bub);
    if (m.a && m.a.length) {
      var row = mk('div', 'cw-acts');
      m.a.forEach(function (a) { row.appendChild(actionEl(a)); });
      wrap.appendChild(row);
    }
    return wrap;
  }
  function toBottom(node) {
    var bottom = log.scrollHeight - log.clientHeight;
    /* إلى آخر السجل، لكن دون أن يتجاوز رأس الرد الطويل فيبقى بدايته ظاهرة */
    log.scrollTop = node ? Math.max(0, Math.min(bottom, node.offsetTop - 12)) : bottom;
  }
  function add(m, fresh) {
    var n = render(m, fresh);
    log.appendChild(n);
    toBottom(n);
    return n;
  }
  function renderChips(list) {
    tray.textContent = '';
    (list || []).forEach(function (c) {
      var b = mk('button', 'cw-c', c.l);
      b.type = 'button';
      b.addEventListener('click', function () { ask(c.l, c.i, c.p); });
      tray.appendChild(b);
    });
    tray.scrollLeft = 0;
  }
  function setBusy(v) { busy = v; send.disabled = v; }
  function showTyping() {
    typing = mk('div', 'cw-m b');
    var b = mk('div', 'cw-bb cw-ty');
    b.setAttribute('aria-label', 'المساعد يكتب');
    b.innerHTML = '<i></i><i></i><i></i>';
    typing.appendChild(b);
    log.appendChild(typing);
    toBottom();
  }
  function hideTyping() { if (typing && typing.parentNode) typing.parentNode.removeChild(typing); typing = null; }

  function respond(res) {
    var len = JSON.stringify(res.m).length;
    setBusy(true);
    renderChips([]);
    showTyping();
    setTimeout(function () {
      hideTyping();
      var m = res.m; m.f = 'b';
      S.msgs.push(m); S.chips = res.c;
      renderChips(res.c); add(m, true); save(); setBusy(false); // الاقتراحات أولًا كي يُحسب التمرير على الارتفاع النهائي
    }, calm ? 80 : Math.min(1000, 380 + len * 0.8));
  }
  function ask(label, id, p) {
    if (busy) return;
    var u = { f: 'u', x: label };
    S.msgs.push(u); add(u, true); save();
    respond(answer(id, p));
  }
  function submit(text) {
    text = String(text).replace(/\s+/g, ' ').trim().slice(0, 300);
    if (!text || busy) return;
    var u = { f: 'u', x: text };
    S.msgs.push(u); add(u, true); save();
    var res;
    if (S.flow && /^(الغاء|الغ|رجوع|ايقاف|توقف)$/.test(norm(text))) res = answer('f_cancel');
    else res = S.flow ? flow(text) : understand(text);
    respond(res);
  }

  function start() {
    S.msgs = []; S.flow = null;
    log.textContent = '';
    var m = { f: 'b', h: WELCOME.h, p: WELCOME.p, n: WELCOME.n };
    S.msgs.push(m); S.chips = MAIN;
    add(m, false); renderChips(MAIN); save();
  }
  function restore() {
    log.textContent = '';
    S.msgs.forEach(function (m) { log.appendChild(render(m, false)); });
    renderChips(S.chips);
    log.scrollTop = log.scrollHeight;
  }

  function setOpen(v, keepFocus) {
    S.open = v;
    panel.hidden = !v;
    btn.setAttribute('aria-expanded', v ? 'true' : 'false');
    btn.setAttribute('aria-label', v ? 'إغلاق المساعد الآلي' : 'فتح المساعد الآلي');
    document.documentElement.classList.toggle('cw-lock', v);
    if (v) {
      if (!calm) { panel.classList.remove('cw-show'); void panel.offsetWidth; panel.classList.add('cw-show'); }
      log.scrollTop = log.scrollHeight;
      if (!keepFocus) (coarse ? panel : input).focus({ preventScroll: true });
    } else if (!keepFocus) btn.focus({ preventScroll: true });
    save();
  }

  btn.addEventListener('click', function () { setOpen(!S.open); });
  panel.querySelector('.cw-close').addEventListener('click', function () { setOpen(false); });
  panel.querySelector('.cw-reset').addEventListener('click', function () { if (!busy) { start(); input.focus({ preventScroll: true }); } });
  /* Esc يغلق النافذة إن كان التركيز داخلها أو على الصفحة نفسها (لا يتدخل إن كان التركيز في عنصر آخر كالبحث) */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || !S.open || e.defaultPrevented) return;
    var a = document.activeElement;
    if (!a || a === document.body || root.contains(a)) setOpen(false);
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = input.value;
    input.value = '';
    submit(v);
    if (!coarse) input.focus({ preventScroll: true });
  });
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-chat-open]');
    if (t) { e.preventDefault(); setOpen(true); }
  });

  load();
  if (S.msgs.length) restore(); else start();
  if (S.open) setOpen(true, true); else panel.hidden = true;
  window.IsnadChat = { open: function () { setOpen(true); }, close: function () { setOpen(false); }, ask: submit };
})();
