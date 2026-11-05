/* إسناد القانونية — المساعد الآلي (الشات): بديل زر واتساب العائم. كود فقط، بلا مفاتيح API ولا خوادم.
   - يجيب من محتوى الموقع نفسه (js/chat-data.js المولَّد بـ tools/build_chat_data.py) ولا يخترع معلومات.
   - الإنجليزية في js/chat-en.js (يُحمَّل عند الحاجة فقط).
   - لا يرسل شيئًا إلى أي خادم: المحادثة تُحفظ في sessionStorage ولا تغادر المتصفح إلا إذا اختار الزائر
     بنفسه فتح واتساب أو البريد أو الاتصال أو نسخ النص.
   - أرقام التواصل من CONFIG في main.js (window.SITE_CONFIG). خيارات اختيارية: SITE_CONFIG.chat = { teaser: false }. */
(function () {
  'use strict';

  var D = window.CHAT_DATA;
  if (!D || !document.body) return;
  var CFG = window.SITE_CONFIG || {}, OPT = CFG.chat || {};
  var me = document.currentScript || document.querySelector('script[src*="chat.js"]');
  var ROOT = ((me && me.getAttribute('src')) || 'js/chat.js').replace(/js\/chat\.js.*$/, '');
  var KEY = 'isnad-chat-v2', TIPKEY = 'isnad-chat-tip', PFKEY = 'isnad-prefill';
  function mq(q) { return !!(window.matchMedia && window.matchMedia(q).matches); }
  var calm = mq('(prefers-reduced-motion: reduce)'), coarse = mq('(pointer: coarse)');
  function isMobile() { return mq('(max-width: 760px)'); }
  var WA_PATH = 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z';

  /* ================= أيقونات ================= */
  var IC = {
    chat: '<path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.55L3 20.5l1.5-5.1A8.5 8.5 0 1 1 21 11.5Z"/><path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01"/>',
    close: '<path d="M18 6 6 18M6 6l12 12"/>',
    reset: '<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/>',
    send: '<path d="m22 2-7 20-4-9-9-4 20-7Z"/><path d="M22 2 11 13"/>',
    arrow: '<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    form: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
    pin: '<path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>',
    copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
    more: '<circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/>'
  };
  function svg(name) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      (name === 'wa' ? '<path d="' + WA_PATH + '"/>' : IC[name]) + '</svg>';
  }
  var ACT_ICON = { wa: 'wa', call: 'phone', mail: 'mail', form: 'form', page: 'arrow', map: 'pin', pri: 'chat', copy: 'copy' };

  /* ================= نصوص الواجهة (عربي / English) ================= */
  var UI = {
    ar: {
      dir: 'rtl', name: 'مساعد إسناد القانونية', ph: 'اكتب سؤالك…', ft: 'مساعد آلي للإرشاد العام — لا يغني عن استشارة محامٍ.',
      lbl: 'اسأل المساعد', openL: 'فتح المساعد الآلي', closeL: 'إغلاق المساعد الآلي', dlg: 'المساعد الآلي لمكتب إسناد القانونية',
      send: 'إرسال', menu: 'خيارات', newChat: 'محادثة جديدة', copyChat: 'نسخ المحادثة', copied: 'تم النسخ ✓', lang: 'EN', langT: 'Switch to English',
      log: 'سجل المحادثة', sg: 'اقتراحات سريعة', inp: 'اكتب رسالتك', typing: 'المساعد يكتب', bot: 'مساعد آلي',
      open: 'المكتب مفتوح الآن', closed: 'المكتب مغلق الآن', tip: 'هل لديك سؤال؟ اسأل المساعد', tipA: 'هل لديك سؤال عن «%»؟ اسأل المساعد', tipX: 'إغلاق',
      you: 'أنا', who: 'المساعد', title: 'محادثة مع المساعد الآلي — إسناد القانونية', ac: 'اقتراحات الأسئلة',
      pfn: 'تمت تعبئة بعض الحقول من محادثتك مع المساعد، راجعها قبل الإرسال.', noEn: 'تعذّر تحميل الوضع الإنجليزي الآن.',
      ch: { wa: 'تواصل عبر واتساب', call: 'اتصل بالمكتب', mail: 'راسلنا بالبريد', form: 'نموذج حجز الاستشارة', copy: 'نسخ الملخص', phone: 'الهاتف', waL: 'واتساب', mailL: 'البريد' },
      days: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
      f: {
        name: 'حسنًا، سأجهّز لك طلبًا مختصرًا في ثلاث خطوات. ما اسمك؟ يكفي الاسم الأول.', skip: 'تخطي', cancel: 'إلغاء',
        hello: 'أهلًا %. ', kind: 'ما نوع المسألة؟ اختر من الأسفل أو اكتبها بإيجاز.', urg: 'وما مدى أولوية الطلب؟',
        head: 'ملخص طلبك', sum: 'جهّزتُ لك الملخص التالي:', nm: 'الاسم', kd: 'نوع المسألة', pr: 'الأولوية',
        note1: 'لم يُرسل شيء بعد. اختر القناة التي تناسبك لإرسال الملخص إلى المكتب.',
        note2: 'لم يُرسل شيء بعد. أكمل طلبك عبر نموذج الحجز (سيُعبّأ بعض بياناته من هنا)، أو انسخ الملخص.',
        wa: 'السلام عليكم، أرغب في حجز استشارة قانونية.', cancelled: 'تم إلغاء الطلب. يمكنك البدء من جديد متى شئت.'
      },
      kinds: [['قضية تجارية', 'قضية تجارية'], ['قضية عقارية', 'قضية عقارية'], ['قضية أسرية', 'قضية أسرية'], ['قضية جنائية', 'قضية جنائية'],
              ['قضية عمالية', 'قضية عمالية'], ['تحكيم دولي', 'تحكيم دولي'], ['استشارة شركات', 'استشارة شركات'], ['أخرى', 'أخرى']],
      urgs: [['استشارة عامة', 'استشارة عامة'], ['خلال أسبوع', 'خلال أسبوع'], ['عاجلة خلال 48 ساعة', 'عاجلة خلال 48 ساعة']],
      today: 'اليوم', tomorrow: 'غدًا', until: 'حتى', hr: function (h) { return (h % 12 || 12) + (h < 12 ? ' ص' : ' م'); }
    },
    en: {
      dir: 'ltr', name: 'Isnad Assistant', ph: 'Type your question…', ft: 'Automated assistant for general guidance — not a substitute for legal advice.',
      lbl: 'Ask the assistant', openL: 'Open the assistant', closeL: 'Close the assistant', dlg: 'Isnad Legal automated assistant',
      send: 'Send', menu: 'Options', newChat: 'New conversation', copyChat: 'Copy conversation', copied: 'Copied ✓', lang: 'عربي', langT: 'التبديل إلى العربية',
      log: 'Conversation', sg: 'Quick suggestions', inp: 'Type your message', typing: 'The assistant is typing', bot: 'Automated assistant',
      open: 'Office open now', closed: 'Office closed now', tip: 'Have a question? Ask the assistant', tipA: 'Questions about “%”? Ask the assistant', tipX: 'Close',
      you: 'Me', who: 'Assistant', title: 'Conversation with the automated assistant — Isnad Legal', ac: 'Suggested questions',
      pfn: 'Some fields were filled in from your chat with the assistant. Please review them before sending.', noEn: 'English mode could not be loaded right now.',
      ch: { wa: 'Contact via WhatsApp', call: 'Call the firm', mail: 'Email us', form: 'Consultation booking form', copy: 'Copy summary', phone: 'Phone', waL: 'WhatsApp', mailL: 'Email' },
      days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      f: {
        name: 'Sure, I will prepare a short request in three steps. What is your name? A first name is enough.', skip: 'Skip', cancel: 'Cancel',
        hello: 'Welcome %. ', kind: 'What type of matter is it? Pick one below or describe it briefly.', urg: 'And how urgent is the request?',
        head: 'Your request summary', sum: 'Here is the summary I prepared:', nm: 'Name', kd: 'Type of matter', pr: 'Priority',
        note1: 'Nothing has been sent yet. Choose the channel that suits you to send the summary to the firm.',
        note2: 'Nothing has been sent yet. Continue through the booking form (some fields will be filled in from here), or copy the summary.',
        wa: 'Hello, I would like to book a legal consultation.', cancelled: 'The request was cancelled. You can start again whenever you like.'
      },
      kinds: [['Commercial case', 'قضية تجارية'], ['Real-estate case', 'قضية عقارية'], ['Family case', 'قضية أسرية'], ['Criminal case', 'قضية جنائية'],
              ['Labour case', 'قضية عمالية'], ['International arbitration', 'تحكيم دولي'], ['Corporate advice', 'استشارة شركات'], ['Other', 'أخرى']],
      urgs: [['General consultation', 'استشارة عامة'], ['Within a week', 'خلال أسبوع'], ['Urgent (within 48 hours)', 'عاجلة خلال 48 ساعة']],
      today: 'today', tomorrow: 'tomorrow', until: 'until', hr: function (h) { return (h % 12 || 12) + (h < 12 ? ' AM' : ' PM'); }
    }
  };
  var S = { v: 2, open: false, lang: 'ar', msgs: [], chips: [], flow: null, last: '', ctxArea: '' };
  function T() { return UI[S.lang] || UI.ar; }

  /* ================= تطبيع النص العربي ================= */
  function norm(s) {
    return String(s).toLowerCase()
      .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
      .replace(/[إأآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي')
      .replace(/[\u0660-\u0669]/g, function (d) { return String(d.charCodeAt(0) - 1632); })
      .replace(/[^\u0621-\u063A\u0641-\u064Aa-z0-9\s]/g, ' ')
      .replace(/([\u0621-\u064Aa-z])\1{2,}/g, '$1') // «ميراااث» → «ميراث»
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
  function prep(list) {
    list.forEach(function (it) { it.kw = it.k.split('|').map(K).filter(function (k) { return k.t.length >= 2; }); });
    return list;
  }
  function kws(str) { return str.split('|').map(K); }
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
  function rank(list, hay) {
    var out = [];
    list.forEach(function (it) { var s = score(it, hay); if (s > 0) out.push({ it: it, s: s }); });
    out.sort(function (a, b) { return b.s - a.s || (b.it.b || 0) - (a.it.b || 0); });
    return out;
  }
  /* تسامح مع الأخطاء الإملائية: كلمة بفارق حرف واحد (أو اثنين في الكلمات الطويلة) */
  function lev(a, b, max) {
    if (Math.abs(a.length - b.length) > max) return max + 1;
    var prev = [], cur, i, j, row;
    for (j = 0; j <= b.length; j++) prev[j] = j;
    for (i = 1; i <= a.length; i++) {
      cur = [i]; row = i;
      for (j = 1; j <= b.length; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1));
        if (cur[j] < row) row = cur[j];
      }
      if (row > max) return max + 1;
      prev = cur;
    }
    return prev[b.length];
  }
  function fuzzyRank(list, tk) {
    var out = [];
    list.forEach(function (it) {
      var s = 0;
      it.kw.forEach(function (k) {
        if (k.t.indexOf(' ') >= 0 || k.t.length < 5) return;
        tk.forEach(function (t) {
          /* تصريف لنفس الجذر أو بداية مختلفة (مثل «سيارة» و«زيارة») ليس خطأً إملائيًا */
          if (t.length < 5 || t.charAt(0) !== k.t.charAt(0) || t.indexOf(k.t) === 0 || k.t.indexOf(t) === 0) return;
          var max = Math.max(k.t.length, t.length) >= 8 ? 2 : 1;
          if (lev(t, k.t, max) <= max) s += 2;
        });
      });
      if (s > 0) out.push({ it: it, s: s + (it.b || 0) });
    });
    out.sort(function (a, b) { return b.s - a.s || (b.it.b || 0) - (a.it.b || 0); });
    return out;
  }

  /* ================= حالة المكتب (مفتوح/مغلق الآن بتوقيت الرياض) ================= */
  var OFFICE = (function () {
    var m = /(\d{1,2})\s*ص\s*[–-]\s*(\d{1,2})\s*م/.exec(D.hours || '');
    if (!m || !/الأحد/.test(D.hours) || !/الخميس/.test(D.hours)) return null;
    return { from: +m[1], to: (+m[2] % 12) + 12, days: [0, 1, 2, 3, 4] };
  })();
  function riyadh() {
    try {
      var o = {};
      new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Riyadh', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
        .formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
      return { d: { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[o.weekday], t: +o.hour + (+o.minute) / 60 };
    } catch (e) { return null; }
  }
  function officeNow() {
    var n = OFFICE && riyadh();
    if (!n || n.d == null) return null;
    var inDay = OFFICE.days.indexOf(n.d) >= 0, open = inDay && n.t >= OFFICE.from && n.t < OFFICE.to, add = 0, d = n.d;
    if (!open && !(inDay && n.t < OFFICE.from)) { do { d = (d + 1) % 7; add++; } while (OFFICE.days.indexOf(d) < 0); }
    return { open: open, d: d, add: add };
  }
  function officeLine() {
    var o = officeNow(), u = T();
    if (!o) return '';
    if (o.open) return S.lang === 'en' ? 'Right now the office is open until ' + u.hr(OFFICE.to) + '.' : 'الآن: المكتب مفتوح حتى ' + u.hr(OFFICE.to) + '.';
    var when = o.add === 0 ? u.today : o.add === 1 ? u.tomorrow : u.days[o.d];
    return S.lang === 'en' ? 'Right now the office is closed, and it opens ' + when + ' at ' + u.hr(OFFICE.from) + '.'
      : 'الآن: المكتب مغلق، ويفتح ' + when + ' الساعة ' + u.hr(OFFICE.from) + '.';
  }

  /* ================= الصفحة الحالية ================= */
  var PAGE = (function () {
    var m = /practice\/([a-z\-]+)\.html/.exec(location.pathname), file = location.pathname.split('/').pop() || 'index.html';
    return { area: m ? m[1] : null, file: file };
  })();
  var AREA_KIND = { 'commercial-law': 'قضية تجارية', 'real-estate': 'قضية عقارية', 'personal-status': 'قضية أسرية', 'criminal-law': 'قضية جنائية',
    'labor-cases': 'قضية عمالية', 'arbitration': 'تحكيم دولي', 'international-litigation': 'تحكيم دولي', 'company-formation': 'استشارة شركات',
    'contracts': 'استشارة شركات', 'investment': 'استشارة شركات', 'intellectual-property': 'استشارة شركات', 'tax': 'استشارة شركات' };

  /* ================= النوايا (العربية) ================= */
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
  var I = [
    { id: 'bot', b: 3, k: 'من أنت$|أنت مين$|مين أنت$|اسمك|أنت بوت|أنت روبوت|هل أنت إنسان|هل أنت بشر|أنت إنسان' },
    { id: 'about', b: 1, k: 'من نحن|من أنتم|عن المكتب|نبذة|تأسس|سنة التأسيس|تعرف علينا|حدثني عن المكتب|قصة المكتب' },
    { id: 'faqtop', b: 2, k: 'الأسئلة الشائعة|أسئلة شائعة|أكثر الأسئلة|استفسارات شائعة|أسئلة متكررة|الأسئلة المتكررة' },
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
    { id: 'help', b: 2, k: 'ماذا تستطيع|ماذا تفعل|ماذا تقدر|ايش تقدر|وش تقدر|كيف تساعدني|ساعدني|قدراتك|ما هي مهامك|ايش تسوي|وش تسوي|اشرح لي كيف أستخدمك' },
    { id: 'how', b: 3, k: 'كيف حالك|شلونك|كيفك|أخبارك|عامل إيه|عامل اي' },
    { id: 'ai', b: 3, k: 'شات جي بي تي|chatgpt|gpt|ذكاء اصطناعي|أنت ai|هل أنت ذكاء|جيميني|gemini|كلود' },
    { id: 'branches', b: 2, k: 'فرع|فروع|مقرات|مقر آخر|عندكم فرع' },
    { id: 'careers', b: 2, k: 'وظائف|وظيفة|توظيف|تدريب|أتدرب|أعمل معكم|فرصة عمل|سيرة ذاتية|cv' },
    { id: 'payment', b: 2, k: 'طرق الدفع|كيف أدفع|تقسيط|الدفع بالتقسيط|دفعات|فاتورة|الدفع الإلكتروني|بطاقة ائتمان|حوالة بنكية' },
    { id: 'complaint', b: 2, k: 'شكوى|أشتكي|تظلم|اقتراح|ملاحظة علي|مستاء|زعلان|سيء' },
    { id: 'social', b: 2, k: 'تويتر|انستقرام|انستجرام|سناب|لينكدان|لينكد ان|يوتيوب|حسابات التواصل|وسائل التواصل الاجتماعي|سوشيال' },
    { id: 'cases', b: 2, k: 'دراسات حالة|دراسة حالة|قضايا سابقة|نتائج سابقة|إنجازاتكم|سجلكم|أعمالكم السابقة|آراء العملاء|اراء العملاء|تقييمات|تجارب العملاء|شهادات العملاء' },
    { id: 'articles', b: 2, k: 'مقالات|مقال|مركز المعرفة|آخر المقالات|مدونة' },
    { id: 'kbid:vision', b: 2, k: 'رؤيتكم|رؤية المكتب|رؤيتنا' },
    { id: 'kbid:mission', b: 2, k: 'رسالتكم|رسالة المكتب|رسالتنا' },
    { id: 'kbid:values', b: 2, k: 'قيمكم|قيم المكتب|قيمنا' },
    { id: 'kbid:philosophy', b: 2, k: 'فلسفة العمل|فلسفتكم|فلسفة المكتب' },
    { id: 'kbid:whofor', b: 2, k: 'لمن تعملون|لمن يقدم المكتب|من تخدمون|عملاؤكم من' },
    { id: 'kbid:timeline', b: 3, k: 'محطات|مسيرة المكتب|تطور المكتب|متى بدأ المكتب|محطات المكتب|تاريخ المكتب' },
    { id: 'kbid:why', b: 3, k: 'لماذا أنتم|لماذا أختاركم|يميزكم|يميزنا|ميزتكم|لماذا أختار مكتبكم|ليش أختاركم|لماذا إسناد' },
    { id: 'kbid:appointment', b: 4, k: 'موعد مسبق|بدون موعد|هل أزوركم|أقدر أزوركم' },
    { id: 'offtopic', b: 6, k: 'سعر الذهب|أسعار الذهب|سعر الدولار|سعر الصرف|الأسهم|البورصة|عملات رقمية|بيتكوين|الطقس|حالة الجو|مباراة|كرة القدم|نتيجة مباراة|وصفة طبخ|كيف أطبخ|أطبخ|فيلم|مسلسل|أغنية|قصيدة|نكتة|برجي|حظي اليوم|حل واجب|معادلة|برمجة|اكتب لي كود' }
  ];
  Object.keys(AK).forEach(function (s) { I.push({ id: 'area:' + s, b: 0, k: AK[s] }); });
  prep(I);
  var OPIN = kws('قضيتي|مشكلتي|موقفي القانوني|هل يحق لي|هل لي حق|هل أستطيع|رأيك|رأيكم|ماذا أفعل|وش أسوي|ايش أعمل|شو أسوي|أنصحوني|تنصحني|حالتي|عندي قضية|عندي مشكلة|تعرضت|ظلموني|نصبوا');
  var GREET = kws('مرحبا|مرحبتين|أهلا|أهلين|هلا|هاي|السلام$|سلام$|صباح|مساء|hello|hi|هلا والله|حياك');
  var THANKS = kws('شكرا|شكر|مشكور|يعطيك العافية|جزاك الله|تسلم|ممتاز|ممنون|thanks');
  var BYE = kws('مع السلامة|وداعا|باي|إلى اللقاء|تصبح على خير|bye');
  var YES = {};
  'نعم ايوه ايوا اي اجل تمام اوكي موافق يلا ابغي ابي اكيد طبعا بالتاكيد ok okay yes sure طيب'.split(' ').forEach(function (w) { YES[stripPre(norm(w))] = 1; });
  var INFO = ['fees', 'free', 'confidential', 'after', 'process', 'duration', 'docs', 'urgent', 'visit', 'contact', 'remote', 'guarantee', 'poa', 'team', 'license', 'booking', 'about', 'areas'];
  var OFFERS = ['booking', 'opinion', 'urgent', 'emergency', 'notice', 'remote', 'free'];
  var COMP_AR = /(?:^|\s)(?:و(?:كم|اين|وين|كيف|هل|متي|ما|ماذا|ايش|وش|مواعيد|عنوان|سعر|اتعاب)|كذلك|ايضا|بالاضافه)(?:\s|$)/;

  /* ================= الأسئلة الشائعة: مطابقة واقتراحات ================= */
  var STOP = {};
  ('هل ما ماذا كيف اي ايش وش لماذا متي اين كم من في علي الي عن مع هو هي هذا هذه ذلك التي الذي او ان لا نعم يمكن يمكنني اريد ابغي ابي احتاج ' +
   'عندي لدي انا نحن انت بعد قبل لي لك له بين هناك يوجد تكون يكون كان عند حول ثم قد فقط ممكن لو طيب اذا لما مثل غير كل بس ده دي ايه فين المكتب مكتب لدينا تتولون تتولونها تقدمونها').split(' ')
    .forEach(function (w) { STOP[w] = 1; });
  var VOCAB = {};
  (function () {
    var texts = [D.about, D.duration, D.tip, D.address, D.hours].concat(D.prep, D.checks);
    D.faq.forEach(function (f) { texts.push(f.q, f.a); });
    D.areas.forEach(function (a) { texts.push(a.n, a.d, a.a); a.c.forEach(function (x) { texts.push(x); }); });
    D.steps.forEach(function (x) { texts.push(x.t, x.d, x.x); });
    D.team.forEach(function (x) { texts.push(x.n, x.r, x.s); });
    texts.forEach(function (t) { toks(t || '').forEach(function (w) { VOCAB[w] = 1; }); });
    I.forEach(function (it) { it.kw.forEach(function (k) { k.t.split(' ').forEach(function (w) { VOCAB[w] = 1; }); }); });
  })();
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
  function faqScores(text) {
    var msg = content(text, true), out = [];
    if (!msg.length) return out;
    D.faq.forEach(function (f, idx) {
      var qm = 0, am = 0;
      msg.forEach(function (t) { if (has(f.qs, t)) qm++; else if (has(f.as, t)) am++; });
      if (qm * 3 + am > 0) out.push({ i: idx, qm: qm, am: am, score: qm * 3 + am });
    });
    out.sort(function (a, b) { return b.score - a.score || D.faq[a.i].qs.length - D.faq[b.i].qs.length; }); // عند التعادل: الأقرب (الأقل كلمات زائدة)
    return out;
  }
  function relatedFaq(idx) {
    var base = D.faq[idx], out = [];
    D.faq.forEach(function (f, j) {
      if (j === idx || f.cs || f.ar) return;
      var sc = 0;
      f.qs.forEach(function (t) { if (has(base.qs, t) || has(base.as, t)) sc += 2; });
      f.as.forEach(function (t) { if (has(base.qs, t)) sc += 1; });
      if (sc >= 3) out.push({ j: j, s: sc });
    });
    out.sort(function (a, b) { return b.s - a.s; });
    return out.slice(0, 2).map(function (o) { return { l: D.faq[o.j].q, i: 'faq', p: o.j }; });
  }
  function fq(key) { return D.faq[D.fk[key]]; }

  /* ================= المعرفة الموسّعة: تفاصيل المجالات والمقالات ومن نحن (تُحمَّل عند أول فتح) ================= */
  var KBLOADED = false, kbLoading = false, kbQueue = [], ASP = {}, KBID = {}, ARTS = [], BIOS = [];
  function kbText(e) {
    return [e.h].concat(e.p || [], e.ul || [], (e.ol || []).map(function (o) { return o[0] + ' ' + o[1]; }), e.n ? [e.n] : []).filter(Boolean).join(' ');
  }
  function mergeKB(K) {
    var base = D.faq.length;
    ASP = K.aspects || {};
    K.kb.forEach(function (e, i) {
      var idx = base + i;
      e.q = e.l; e.a = kbText(e);
      e.qs = content(e.q); e.as = (e.cs || e.ar) ? [] : content(e.a);
      if (e.id) KBID[e.id] = idx;
      if (e.ar) ARTS.push(idx);
      if (e.id && e.id.indexOf('team:') === 0) BIOS.push({ i: idx, nt: toks(e.id.slice(5)) });
      D.faq.push(e);
      toks(e.q + ' ' + e.a).forEach(function (w) { VOCAB[w] = 1; });
      if (e.sg) { var x = { l: e.q, i: 'faq', p: idx }; x.tk = toks(x.l); POOL_AR.push(x); }
    });
    Object.keys(ASP).forEach(function (sl) {
      ASP[sl].fq = (ASP[sl].fq || []).map(function (i) { return base + i; });
      var n = area(sl).n;
      [['services', 'ما الخدمات التي تقدمونها في ' + n + '؟'], ['docs', 'ما المستندات التي تفيد في ' + n + '؟'],
       ['mistakes', 'ما الأخطاء الشائعة التي أتجنبها في ' + n + '؟'], ['when', 'متى أحتاج إلى محامٍ في ' + n + '؟']]
        .forEach(function (x) { var y = { l: x[1], i: 'aspect', p: { a: x[0], s: sl } }; y.tk = toks(y.l); POOL_AR.push(y); });
    });
    KBLOADED = true;
  }
  function loadKB(cb) {
    if (KBLOADED) { if (cb) cb(); return; }
    if (cb) kbQueue.push(cb);
    if (kbLoading) return;
    kbLoading = true;
    function done() { kbLoading = false; var q = kbQueue; kbQueue = []; q.forEach(function (f) { f(); }); }
    function build() { try { mergeKB(window.CHAT_KB); } catch (e) { KBLOADED = false; } done(); }
    if (window.CHAT_KB) { build(); return; }
    var sc = document.createElement('script');
    sc.src = ROOT + 'js/chat-kb.js';
    sc.onload = build;
    sc.onerror = done;
    document.head.appendChild(sc);
  }
  /* جوانب كل مجال: ما نقدمه، متى تحتاج، المستندات، الأخطاء الشائعة، المحامي المختص */
  var ASPECTS = [
    ['lawyer', kws('المحامي المختص|محامي مختص|من المحامي|مين المحامي|المحامي المتخصص|محامي متخصص')],
    ['mistakes', kws('أخطاء|خطأ شائع|أتجنب|تجنب|احذر|أحذر|ما يجب تجنبه')],
    ['when', kws('متى أحتاج|متى احتاج|متى أطلب|متى يلزم|متى أستشير|متى أراجع|هل أحتاج')],
    ['docs', kws('مستندات|أوراق|وثائق|ماذا أحضر|وش أحضر|ايش أحضر|ماذا أجهز')],
    ['services', kws('ماذا تقدمون|ايش تقدمون|وش تقدمون|ماذا تقدم|الخدمات التي|خدماتكم|تقدمونها|تقدمونه')]
  ];
  function detectAspect(hay) { for (var i = 0; i < ASPECTS.length; i++) if (anyHit(hay, ASPECTS[i][1])) return ASPECTS[i][0]; return null; }
  function areaOf(ranked) { for (var i = 0; i < ranked.length; i++) if (ranked[i].it.id.indexOf('area:') === 0) return ranked[i].it.id.slice(5); return null; }
  function bioMatch(tk) {
    for (var i = 0; i < BIOS.length; i++) if (BIOS[i].nt.length && BIOS[i].nt.every(function (t) { return has(tk, t); })) return BIOS[i].i;
    return null;
  }

  /* ================= قنوات التواصل (من CONFIG) ================= */
  function ltr(s) { return '\u2066' + s + '\u2069'; }
  function waNum() { return String(CFG.whatsapp || '').replace(/\D/g, ''); }
  function hasChannel() { return !!(waNum() || CFG.phone || CFG.email); }
  function channels(prefill, pf, withCopy) {
    var u = T().ch, a = [], wa = waNum();
    if (wa) a.push({ l: u.wa, href: 'https://wa.me/' + wa + (prefill ? '?text=' + encodeURIComponent(prefill) : ''), k: 'wa', x: 1 });
    if (CFG.phone) a.push({ l: u.call, href: 'tel:' + String(CFG.phone).replace(/\s/g, ''), k: 'call', x: 1 });
    if (CFG.email) a.push({ l: u.mail, href: 'mailto:' + CFG.email + (prefill ? '?body=' + encodeURIComponent(prefill) : ''), k: 'mail', x: 1 });
    a.push({ l: u.form, href: 'contact.html#contact', k: 'form', pf: pf || null });
    if (withCopy) a.push({ l: u.copy, k: 'copy', c: withCopy });
    return a;
  }
  function channelList() {
    var u = T().ch, l = [], wa = waNum();
    if (CFG.phone) l.push(u.phone + ': ' + ltr(CFG.phone));
    if (wa) l.push(u.waL + ': ' + ltr('+' + wa));
    if (CFG.email) l.push(u.mailL + ': ' + ltr(CFG.email));
    return l;
  }
  function copyText(text, cb) {
    function fallback() {
      var ok = false;
      try {
        var ta = document.createElement('textarea');
        ta.value = text; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
        document.body.appendChild(ta); ta.select(); ok = document.execCommand('copy'); document.body.removeChild(ta);
      } catch (e) { ok = false; }
      cb(ok);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { cb(true); }, fallback);
    else fallback();
  }
  /* تعبئة نموذج الحجز في «تواصل معنا» من ملخص المحادثة (لا يُرسل شيء ولا ينتقل بين الخطوات) */
  function applyPrefill() {
    var raw, form = document.getElementById('bk');
    try { raw = sessionStorage.getItem(PFKEY); } catch (e) { return; }
    if (!raw || !form) return;
    var pf, done = 0;
    try { pf = JSON.parse(raw); } catch (e) { return; }
    function setField(label, value, isSelect) {
      if (!value) return;
      var labels = form.querySelectorAll('label');
      for (var i = 0; i < labels.length; i++) {
        if (labels[i].textContent.replace(/\s+/g, ' ').trim().indexOf(label) !== 0) continue;
        var el = labels[i].querySelector(isSelect ? 'select' : 'input');
        if (!el) return;
        if (isSelect) {
          var ok = Array.prototype.some.call(el.options, function (o) { if (o.text.trim() === value) { el.value = o.value || o.text; return true; } return false; });
          if (!ok) return;
        } else el.value = value;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        done++;
        return;
      }
    }
    setField('نوع القضية', pf.kind, true);
    setField('مدى الأولوية', pf.urg, true);
    setField('الاسم الكامل', pf.name, false);
    try { sessionStorage.removeItem(PFKEY); } catch (e) { /* ignore */ }
    if (done && !form.querySelector('.cw-pfn')) {
      var p = document.createElement('p');
      p.className = 'cw-pfn'; p.setAttribute('role', 'status'); p.textContent = UI.ar.pfn;
      form.insertBefore(p, form.firstChild);
    }
  }

  /* ================= الاقتراحات والردود ================= */
  var C = {
    areas: { l: 'مجالات الممارسة', i: 'areas' }, booking: { l: 'احجز استشارة', i: 'booking' },
    process: { l: 'كيف نعمل؟', i: 'process' }, fees: { l: 'الأتعاب', i: 'fees' },
    conf: { l: 'سرية معلوماتك', i: 'confidential' }, visit: { l: 'المواعيد والموقع', i: 'visit' },
    contact: { l: 'التواصل', i: 'contact' }, about: { l: 'من نحن', i: 'about' }, docs: { l: 'المستندات المطلوبة', i: 'docs' },
    free: { l: 'هل الاستشارة مجانية؟', i: 'free' }, after: { l: 'ماذا يحدث بعد الاستشارة؟', i: 'after' },
    duration: { l: 'كم تستغرق القضية؟', i: 'duration' }, team: { l: 'الفريق القانوني', i: 'team' },
    license: { l: 'التراخيص والاعتمادات', i: 'license' }, urgent: { l: 'استشارة عاجلة', i: 'urgent' },
    remote: { l: 'استشارة عن بُعد', i: 'remote' }, poa: { l: 'الوكالة', i: 'poa' }, faqtop: { l: 'الأسئلة الشائعة', i: 'faqtop' }
  };
  var MAIN_AR = [C.areas, C.booking, C.process, C.fees, C.conf, C.visit, C.contact];
  function chips() { return Array.prototype.slice.call(arguments); }
  var TOP = ['commercial-law', 'real-estate', 'personal-status', 'criminal-law', 'labor-cases', 'company-formation', 'contracts', 'arbitration', 'debt-collection'];
  function area(s) { return D.areas.filter(function (a) { return a.s === s; })[0]; }
  function areaChip(s) { var a = area(s); return { l: a.n, i: 'area:' + s }; }
  function aspChips(sl) {
    var x = ASP[sl], out = [];
    if (!x) return [C.booking, C.docs, C.fees, { l: 'مجالات أخرى', i: 'areas' }];
    out.push({ l: 'ماذا نقدّم؟', i: 'aspect', p: { a: 'services', s: sl } }, { l: 'المستندات', i: 'aspect', p: { a: 'docs', s: sl } },
      { l: 'أخطاء شائعة', i: 'aspect', p: { a: 'mistakes', s: sl } }, { l: 'متى تحتاجنا؟', i: 'aspect', p: { a: 'when', s: sl } });
    if (x.lw) out.push({ l: 'المحامي المختص', i: 'aspect', p: { a: 'lawyer', s: sl } });
    out.push(C.booking);
    return out;
  }
  function kbMsg(f) {
    var m = { p: f.p || [] };
    if (f.h) m.h = f.h;
    if (f.ul) m.ul = f.ul;
    if (f.ol) m.ol = f.ol.map(function (o) { return { x: o[0], s: o[1] }; });
    if (f.n) m.n = f.n;
    m.a = f.lk ? [{ l: f.lk[0], href: f.lk[1], k: 'page' }] : [];
    return m;
  }

  function R(m, c) { return { m: m, c: c || pack().main() }; }

  function pageWelcome() {
    var m = { h: 'مرحبًا بك في إسناد القانونية',
      p: ['أنا المساعد الآلي للمكتب. أجيب عن أسئلتك حول مجالات الممارسة وخطوات العمل والأتعاب وحجز الاستشارة وبيانات التواصل.'],
      n: 'لا تكتب هنا بيانات هوية أو تفاصيل سرية.' };
    var c = MAIN_AR, a = PAGE.area && area(PAGE.area);
    if (a) {
      m.p.push('أنت تتصفح صفحة «' + a.n + '». يمكنني أن أعرض لك ما نتولاه فيها، أو أجهّز لك طلب استشارة.');
      c = [{ l: 'ما نتولاه في ' + a.n, i: 'area:' + a.s }, C.booking, C.docs, C.fees, C.areas, C.contact];
    } else {
      m.p.push('اختر موضوعًا من الأسفل أو اكتب سؤالك.');
      if (PAGE.file === 'faq.html') c = [C.faqtop, C.fees, C.free, C.conf, C.booking, C.contact];
      else if (PAGE.file === 'contact.html') c = [C.booking, C.visit, C.docs, C.fees, C.conf, C.urgent];
      else if (PAGE.file === 'about.html') c = [C.about, C.team, C.license, C.process, C.booking, C.contact];
    }
    return { m: m, c: c };
  }

  /* ---- الردود العربية ---- */
  function arAnswer(id, p) {
    var f, a;
    switch (id) {
      case 'greet': return R({ p: ['أهلًا بك في إسناد القانونية. كيف أستطيع مساعدتك؟'] });
      case 'salam': return R({ p: ['وعليكم السلام ورحمة الله وبركاته، أهلًا بك في إسناد القانونية. كيف أستطيع مساعدتك؟'] });
      case 'thanks': return R({ p: ['العفو، يسعدنا خدمتك. هل لديك سؤال آخر؟'] });
      case 'bye': return R({ p: ['مع السلامة، ونسعد بخدمتك متى شئت.'] }, chips(C.booking, C.contact));
      case 'bot':
        return R({ p: ['أنا المساعد الآلي لمكتب إسناد القانونية، ولست محاميًا. أجيب عن الأسئلة العامة اعتمادًا على محتوى الموقع، وأي رأي في حالتك الخاصة يقدّمه محامو المكتب في الاستشارة.'] },
          chips(C.areas, C.booking, C.contact));
      case 'about':
        return R({ h: 'من نحن', p: [D.about], a: [{ l: 'تعرّف على المكتب', href: 'about.html', k: 'page' }] }, chips(C.team, C.license, C.process, C.booking));
      case 'faqtop':
        return R({ h: 'أكثر الأسئلة طلبًا', p: ['اختر سؤالًا لأعرض لك إجابته:'],
          a: D.top.map(function (j) { return { l: D.faq[j].q, i: 'faq', p: j }; }).concat([{ l: 'كل الأسئلة الشائعة', href: 'faq.html', k: 'page' }]) },
          chips(C.areas, C.booking, C.contact));
      case 'areas':
        return R({ h: 'مجالات الممارسة', p: ['يغطي المكتب ' + D.areas.length + ' مجالًا قانونيًا للأفراد والشركات والمستثمرين. اختر مجالًا لأعرض لك ما نتولاه فيه:'],
          a: [{ l: 'كل مجالات الممارسة', href: 'practice.html', k: 'page' }] },
          TOP.map(areaChip).concat([{ l: 'مجالات أخرى', i: 'areas_more' }]));
      case 'areas_more':
        return R({ p: ['وهذه بقية المجالات:'] },
          D.areas.filter(function (x) { return TOP.indexOf(x.s) < 0; }).map(function (x) { return { l: x.n, i: 'area:' + x.s }; }).concat([C.booking]));
      case 'booking':
        return R({ h: 'حجز استشارة', p: ['يمكنك طلب الاستشارة بإحدى طريقتين:'],
          ul: ['تعبئة نموذج حجز الاستشارة في صفحة «تواصل معنا».', 'أو ابدأ طلبًا مختصرًا هنا، فأجهّز لك ملخصًا ترسله إلى المكتب بالطريقة التي تناسبك.'],
          n: 'لا يُرسل شيء من هذه المحادثة تلقائيًا، وتراجع الملخص قبل الإرسال.',
          a: [{ l: 'ابدأ الطلب هنا', i: 'f_start', k: 'pri' }, { l: 'نموذج حجز الاستشارة', href: 'contact.html#contact', k: 'form' }] },
          chips(C.free, C.docs, C.after, C.fees));
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
      case 'duration': return R({ p: [D.duration] }, chips(C.process, C.fees, C.booking));
      case 'docs':
        return R({ h: 'ما الذي تجهّزه قبل الاستشارة؟', ul: D.prep, n: fq('docs').a }, chips(C.booking, C.conf, C.fees));
      case 'urgent':
        return R({ h: 'الاستشارة العاجلة', p: [fq('urgent').a], a: channels('السلام عليكم، لدي مسألة قانونية عاجلة وأرغب في التواصل مع المكتب.') }, chips(C.booking, C.docs));
      case 'emergency':
        return R({ h: 'حالة عاجلة', p: ['إن كنت أو أحد أقاربك مستدعى للتحقيق أو موقوفًا، فتواصل مع المكتب في أقرب وقت ممكن.', fq('rights').a, 'وفي الطلبات العاجلة: ' + fq('urgent').a],
          a: channels('السلام عليكم، لدي حالة عاجلة تتعلق بتحقيق أو استدعاء وأحتاج إلى محامٍ في أقرب وقت.') }, chips(C.docs, C.conf, C.booking));
      case 'notice':
        return R({ h: 'إشعار أو دعوى', p: [fq('notice').a], a: channels('السلام عليكم، وصلني إشعار أو دعوى وأرغب في مراجعتها مع المكتب.') }, chips(C.docs, C.booking, C.fees));
      case 'visit':
        f = officeLine();
        return R({ h: 'المواعيد والموقع', ul: ['العنوان: ' + D.address, 'مواعيد العمل: ' + D.hours, D.closed, 'الزيارة ' + D.visit_note],
          n: (f ? f + ' ' : '') + 'يمكنك إرسال طلبك عبر النموذج في أي وقت، ونتواصل معك في أقرب فرصة.',
          a: [{ l: 'الخريطة وتفاصيل الموقع', href: 'contact.html#location', k: 'map' }] }, chips(C.booking, C.contact, C.remote));
      case 'contact':
        f = channelList();
        return R({ h: 'التواصل مع المكتب', p: [f.length ? 'يسعدنا تواصلك، وهذه قنواتنا:' : 'يسعدنا تواصلك. أرسل لنا طلبك عبر نموذج «تواصل معنا» وسيتواصل معك فريق المكتب.'],
          ul: f.length ? f : null, n: 'مواعيد العمل: ' + D.hours + '، ' + D.closed + '.' + (officeLine() ? ' ' + officeLine() : ''),
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
      case 'faq':
        f = D.faq[p];
        if (f.l) return answerKB(p);
        return R({ p: [f.a], n: 'من الأسئلة الشائعة. المعلومات عامة وقد تختلف باختلاف الوقائع.',
          a: [{ l: 'كل الأسئلة الشائعة', href: 'faq.html', k: 'page' }] }, relatedFaq(p).concat([C.booking, C.areas]));
      case 'aspect': return aspectAnswer(p.a, p.s);
      case 'articles':
        if (!ARTS.length) return null;
        return R({ h: 'مقالات مركز المعرفة', p: ['اختر مقالًا لأعرض لك ملخصه:'],
          a: ARTS.map(function (j) { return { l: D.faq[j].l, i: 'faq', p: j }; }).concat([{ l: 'مركز المعرفة', href: 'index.html#articles', k: 'page' }]) },
          chips(C.areas, C.faqtop, C.booking));
      case 'help':
        return R({ h: 'كيف أساعدك؟', p: ['أستطيع الإجابة عن:'],
          ul: ['مجالات الممارسة الخمسة عشر: ما نتولاه في كل مجال، والمستندات، والأخطاء الشائعة، ومتى تحتاج إلى محامٍ',
               'الأتعاب والاستشارة الأولى والسرية والوكالة', 'مراحل العمل ومدة القضية والمستندات المطلوبة',
               'المواعيد والعنوان وقنوات التواصل', 'الأسئلة الشائعة ومقالات مركز المعرفة', 'حجز استشارة وتجهيز ملخص طلبك'] },
          chips(C.areas, C.booking, C.faqtop, { l: 'مقالات المركز', i: 'articles' }, C.fees, C.contact));
      case 'how': return R({ p: ['بخير، شكرًا لسؤالك. كيف أستطيع مساعدتك؟'] });
      case 'offtopic':
        return R({ p: ['هذا خارج نطاق ما أستطيع الإجابة عنه؛ أنا مخصص للأسئلة عن إسناد القانونية وخدماتها ومجالاتها.'] }, chips(C.areas, C.booking, C.faqtop, C.contact));
      case 'ai':
        return R({ p: ['أنا مساعد آلي مبرمج على محتوى هذا الموقع، ويجيب بقواعد وليس بنموذج ذكاء اصطناعي توليدي. لذلك أجيب عمّا يعرضه الموقع فقط، وأحيلك إلى محامي المكتب فيما عداه.'] },
          chips(C.areas, C.booking, C.contact));
      case 'branches':
        return R({ h: 'مقر المكتب', p: ['يعرض الموقع المقر الرئيسي للمكتب في الرياض. وإن كنت خارج الرياض يمكنك طلب استشارة عن بُعد.'],
          ul: ['العنوان: ' + D.address, 'الزيارة ' + D.visit_note], a: [{ l: 'الخريطة وتفاصيل الموقع', href: 'contact.html#location', k: 'map' }] },
          chips(C.remote, C.visit, C.booking));
      case 'careers':
        return R({ p: ['لا يعرض الموقع حاليًا معلومات عن الوظائف أو التدريب. يمكنك مراسلة المكتب عبر قنوات التواصل.'],
          a: channels('السلام عليكم، أرغب في الاستفسار عن فرص العمل أو التدريب لديكم.') }, chips(C.about, C.contact));
      case 'payment':
        return R({ h: 'طرق الدفع', p: ['لا يذكر الموقع تفاصيل عن طرق الدفع أو التقسيط، ويمكنك الاستفسار عنها مباشرة. أما الأتعاب فنوضّحها قبل البدء كما في «الأتعاب».'],
          a: channels('السلام عليكم، أرغب في الاستفسار عن طرق دفع الأتعاب.') }, chips(C.fees, C.after, C.booking));
      case 'complaint':
        return R({ p: ['نأسف لسماع ذلك، وملاحظتك تهمنا. يمكنك مراسلة المكتب مباشرة عبر القنوات التالية:'],
          a: channels('السلام عليكم، لدي ملاحظة أرغب في إيصالها إلى المكتب.') }, chips(C.contact, C.booking));
      case 'social':
        f = CFG.social || {};
        a = [['li', 'LinkedIn'], ['x', 'X'], ['ig', 'Instagram'], ['yt', 'YouTube']].filter(function (x) { return f[x[0]]; })
          .map(function (x) { return { l: x[1], href: f[x[0]], k: 'page', x: 1 }; });
        if (a.length) return R({ p: ['حساباتنا الرسمية:'], a: a }, chips(C.contact, C.booking));
        return R({ p: ['لا يعرض الموقع حسابات تواصل اجتماعي رسمية حاليًا. يمكنك التواصل معنا عبر القنوات المتاحة.'], a: channels('السلام عليكم، أرغب في التواصل مع المكتب.') }, chips(C.contact, C.booking));
      case 'cases':
        return R({ h: 'دراسات الحالة وآراء العملاء', p: ['يعرض الموقع دراسات حالة وآراء عملاء في قسمين مستقلين.'], n: D.cases_note + '.',
          a: [{ l: 'دراسات الحالة', href: 'index.html#cases', k: 'page' }, { l: 'آراء العملاء', href: 'index.html#voices', k: 'page' }] },
          chips(C.areas, C.booking, C.process));
      case 'clarify':
        return R({ p: ['سؤالك قد يخص أكثر من مجال. أيّ المجالين تقصد؟'] }, p.map(areaChip).concat([C.contact]));
      case 'fallback':
        a = (p && p.length) ? p : null;
        if (a) return R({ p: ['لم أفهم سؤالك تمامًا. هل تقصد أحد هذه الأسئلة؟', 'أو تواصل مع فريق المكتب مباشرة:'],
          a: a.map(function (j) { return { l: D.faq[j].q, i: 'faq', p: j }; }).concat(channels('السلام عليكم، لدي استفسار قانوني.')) });
        return R({ p: ['لم أتمكن من فهم سؤالك بدقة، ولا أودّ أن أعطيك معلومة غير مؤكدة. اختر موضوعًا من الأسفل، أو تواصل مع فريق المكتب مباشرة.'],
          a: channels('السلام عليكم، لدي استفسار قانوني.') }, chips(C.faqtop, C.areas, C.booking, C.contact));
      default:
        if (id.indexOf('area:') === 0) {
          a = area(id.slice(5));
          return R({ h: a.n, p: [a.d, 'أبرز ما نتولاه:'], ul: a.c, n: 'الجهات المختصة: ' + a.a + '.',
            a: [{ l: 'صفحة ' + a.n, href: 'practice/' + a.s + '.html', k: 'page' }] }, aspChips(a.s));
        }
        if (id.indexOf('kbid:') === 0) {
          var ix = KBID[id.slice(5)];
          return ix != null ? answerKB(ix) : null;
        }
        return null;
    }
  }
  function answerKB(p) {
    var f = D.faq[p], r;
    r = R(kbMsg(f), f.s ? aspChips(f.s) : relatedFaq(p).concat([C.booking, C.areas]));
    r.ctx = f.s || '';
    return r;
  }
  function aspectAnswer(asp, sl) {
    var x = ASP[sl], a = area(sl), lk = [{ l: 'صفحة ' + a.n, href: 'practice/' + sl + '.html', k: 'page' }], m;
    if (!x) return null;
    if (asp === 'services') m = { h: 'ماذا نقدّم في ' + a.n, ul: x.sv, a: lk };
    else if (asp === 'when') m = { h: 'متى تحتاج هذه الخدمة؟', p: [x.wn], a: lk };
    else if (asp === 'docs') m = { h: 'المستندات التي تفيد في ' + a.n, p: [x.dc], n: 'وتجد قائمة عامة بما تجهّزه قبل أي استشارة في «المستندات المطلوبة».', a: lk };
    else if (asp === 'mistakes') m = { h: 'أخطاء شائعة تجنّبها في ' + a.n, ul: x.mk, a: lk };
    else if (x.lw) m = { h: 'المحامي المختص في ' + a.n, p: [x.lw.n + ' — ' + x.lw.r + (x.lw.s ? '، ' + x.lw.s : '') + (x.lw.y ? '. ' + x.lw.y + ' سنة من الخبرة.' : '')], a: lk.concat([{ l: 'الفريق القانوني', href: 'about.html#team', k: 'page' }]) };
    else m = { h: 'المحامي المختص', p: ['يغطي المكتب مجال «' + a.n + '»، ولا تعرض صفحته محاميًا بعينه. يمكنك التعرف على الفريق من صفحة «من نحن» أو طلب استشارة.'], a: lk.concat([{ l: 'الفريق القانوني', href: 'about.html#team', k: 'page' }]) };
    var r = R(m, aspChips(sl));
    r.ctx = sl;
    return r;
  }
  var AR = { lang: 'ar', fuzzy: true, I: I, GREET: GREET, THANKS: THANKS, BYE: BYE, OPIN: OPIN, comp: COMP_AR, hasFaq: true, answer: arAnswer, yes: YES, no: 'لا',
    main: function () { return MAIN_AR; }, welcome: pageWelcome, sug: null };
  var EN = null;
  function pack() { return (S.lang === 'en' && EN) ? EN : AR; }

  /* ---- ردود مشتركة بين اللغتين: التدفّق والقائمة ---- */
  function common(id, p) {
    var u = T(), F = u.f;
    switch (id) {
      case 'menu': return R({ p: [S.lang === 'en' ? 'Of course — what can I help you with?' : 'تفضّل، بماذا أستطيع مساعدتك؟'] });
      case 'declined': return R({ p: [S.lang === 'en' ? 'No problem. I am here if you need anything else.' : 'حسنًا، أنا هنا إن احتجت أي شيء.'] });
      case 'f_start':
        S.flow = { s: 'name', n: '', a: '', kv: '', u: '', uv: '' };
        return R({ p: [F.name] }, chips({ l: F.skip, i: 'f_skip' }, { l: F.cancel, i: 'f_cancel' }));
      case 'f_cancel':
        S.flow = null;
        return R({ p: [F.cancelled] }, pack().main());
      case 'f_skip': return flow({});
      case 'f_area': return flow({ k: p });
      case 'f_urg': return flow({ u: p });
      default: return null;
    }
  }
  function clip(s, n) { return String(s).replace(/\s+/g, ' ').trim().slice(0, n); }
  function areaLabel(slug) { return (S.lang === 'en' && EN && EN.areaName) ? EN.areaName(slug) : area(slug).n; }
  function flow(inp) {
    var F = S.flow, u = T(), L = u.f, cancel = { l: L.cancel, i: 'f_cancel' }, a;
    if (!F) return common('menu');
    if (F.s === 'name') {
      F.n = clip(inp.t || '', 40); F.s = 'area';
      var kc = u.kinds.map(function (k, ix) { return { l: k[0], i: 'f_area', p: ix }; });
      if (PAGE.area) kc.unshift({ l: areaLabel(PAGE.area), i: 'f_area', p: 'pa' });
      return R({ p: [(F.n ? L.hello.replace('%', F.n) : '') + L.kind] }, kc.concat([cancel]));
    }
    if (F.s === 'area') {
      if (inp.k === 'pa') { F.a = areaLabel(PAGE.area); F.kv = AREA_KIND[PAGE.area] || ''; }
      else if (inp.k != null) { F.a = u.kinds[inp.k][0]; F.kv = u.kinds[inp.k][1]; }
      else { F.a = clip(inp.t || '', 60); F.kv = ''; }
      F.s = 'urg';
      return R({ p: [L.urg] }, u.urgs.map(function (k, ix) { return { l: k[0], i: 'f_urg', p: ix }; }).concat([cancel]));
    }
    if (inp.u != null) { F.u = u.urgs[inp.u][0]; F.uv = u.urgs[inp.u][1]; } else { F.u = clip(inp.t || '', 40); F.uv = ''; }
    var msg = L.wa + (F.n ? '\n' + L.nm + ': ' + F.n : '') + '\n' + L.kd + ': ' + F.a + '\n' + L.pr + ': ' + F.u;
    var ul = (F.n ? [L.nm + ': ' + F.n] : []).concat([L.kd + ': ' + F.a, L.pr + ': ' + F.u]);
    var pf = { name: F.n, kind: F.kv, urg: F.uv };
    S.flow = null;
    return R({ h: L.head, p: [L.sum], ul: ul, n: hasChannel() ? L.note1 : L.note2, a: channels(msg, pf, msg) },
      S.lang === 'en' && EN ? EN.after() : chips(C.docs, C.fees, C.areas));
  }

  function answerFor(id, p) {
    var r = common(id, p) || pack().answer(id, p) || pack().answer('fallback');
    r.id = id;
    if (id.indexOf('area:') === 0) r.ctx = id.slice(5);
    return r;
  }

  /* ================= فهم الرسالة ================= */
  function tieAreas(ranked) {
    var a = ranked[0], b = ranked[1];
    return a && b && a.s === b.s && a.s >= 4 && a.it.id.indexOf('area:') === 0 && b.it.id.indexOf('area:') === 0 ? [a.it.id.slice(5), b.it.id.slice(5)] : null;
  }
  function isOffer() { return OFFERS.indexOf(S.last) >= 0 || (S.last || '').indexOf('area:') === 0; }
  function understand(text) {
    var pk = pack(), n = norm(text);
    if (!n) return answerFor('fallback');
    var tk = toks(text), hay = ' ' + tk.join(' ');
    var ranked = rank(pk.I, hay), best = ranked[0], second = ranked[1], bs = best ? best.s : 0;
    var faqs = pk.hasFaq ? faqScores(text) : [], fm = faqs[0] || null, fs = fm ? fm.score : 0;

    /* معرفة موسّعة (عربي): سيرة محامٍ باسمه، أو جانب من مجال (المستندات/الأخطاء/الخدمات…) */
    if (pk.lang === 'ar' && KBLOADED && !(fm && fm.qm >= 3)) {
      var bio = bioMatch(tk);
      if (bio != null) return answerFor('faq', bio);
      var asp = detectAspect(hay);
      if (asp) {
        var sl = areaOf(ranked);
        if (!sl && tk.length <= 3 && asp !== 'when' && asp !== 'services') sl = S.ctxArea || PAGE.area;
        if (sl && ASP[sl]) return answerFor('aspect', { a: asp, s: sl });
      }
    }

    /* ردّ قصير بنعم/لا على عرض سابق */
    if (tk.length <= 2 && tk.every(function (t) { return pk.yes[t]; })) return isOffer() ? answerFor('f_start') : answerFor('menu');
    if (tk[0] === pk.no && tk.length <= 3 && isOffer()) return answerFor('declined');

    if (tk.length <= 6 && bs < 2 && fs < 5) {
      if (anyHit(hay, pk.GREET)) return answerFor(/سلام/.test(n) ? 'salam' : 'greet');
      if (anyHit(hay, pk.THANKS)) return answerFor('thanks');
      if (anyHit(hay, pk.BYE)) return answerFor('bye');
    }
    var full = fm && fm.qm >= 2 && fm.qm === D.faq[fm.i].qs.length;   // كل كلمات السؤال المخزّن وردت في رسالتك
    if (fm && (fm.qm >= 3 || full || (fm.qm >= 2 && fs >= 7 && fs > bs))) return answerFor('faq', fm.i);

    /* سؤالان في رسالة واحدة (مثل: كم الأتعاب وأين المكتب؟) */
    if (best && second && bs >= 2 && second.s >= 2 && INFO.indexOf(best.it.id) >= 0 && INFO.indexOf(second.it.id) >= 0 &&
        best.it.id !== second.it.id && (pk.comp.test(n) || (text.match(/[؟?]/g) || []).length >= 2)) {
      return [answerFor(best.it.id), answerFor(second.it.id)];
    }
    var tie = tieAreas(ranked);
    if (tie) return answerFor('clarify', tie);
    if (bs >= 2) return answerFor(best.it.id);
    if (fm && fm.qm >= 2 && fs >= 6) return answerFor('faq', fm.i);
    var unk = pk.fuzzy ? tk.filter(function (t) { return t.length >= 5 && !VOCAB[t]; }) : [];
    var fz = unk.length ? fuzzyRank(pk.I, unk) : [];
    if (fz.length && fz[0].s >= 2) return answerFor(fz[0].it.id);
    if (anyHit(hay, pk.OPIN)) return answerFor('opinion');
    var sug = faqs.filter(function (x) { return x.score >= 3; }).slice(0, 3).map(function (x) { return x.i; });
    return answerFor('fallback', sug);
  }

  /* ================= التخزين ================= */
  function load() {
    try {
      var r = JSON.parse(sessionStorage.getItem(KEY) || 'null');
      if (r && r.v === 2 && r.msgs && r.msgs.length) S = r;
    } catch (e) { /* التخزين غير متاح */ }
  }
  function save() {
    try {
      if (S.msgs.length > 40) S.msgs = S.msgs.slice(-40);
      sessionStorage.setItem(KEY, JSON.stringify(S));
    } catch (e) { /* ignore */ }
  }

  /* ================= الواجهة ================= */
  function mk(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }
  var root = mk('div', 'cw');
  var btn = mk('button', 'cw-btn');
  btn.type = 'button';
  btn.setAttribute('aria-haspopup', 'dialog');
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', 'cw-panel');
  btn.innerHTML = '<span class="cw-ic">' + svg('chat') + '</span><span class="cw-x">' + svg('close') + '</span>';
  var btnLbl = mk('span', 'cw-lbl');
  btn.appendChild(btnLbl);
  var pip = mk('span', 'cw-pip');
  pip.setAttribute('aria-hidden', 'true');
  btn.appendChild(pip);

  var panel = mk('div', 'cw-panel');
  panel.id = 'cw-panel';
  panel.setAttribute('role', 'dialog');
  panel.hidden = true;
  panel.tabIndex = -1;
  panel.innerHTML =
    '<div class="cw-hd">' +
    '<div class="cw-ti"><b class="cw-nm"></b><span class="cw-st"><i></i><span class="cw-stt"></span></span></div>' +
    '<button type="button" class="cw-ib cw-lang"></button>' +
    '<button type="button" class="cw-ib cw-mn" aria-haspopup="menu" aria-expanded="false">' + svg('more') + '</button>' +
    '<button type="button" class="cw-ib cw-close">' + svg('close') + '</button>' +
    '<div class="cw-menu" role="menu" hidden>' +
    '<button type="button" role="menuitem" class="cw-mi" data-m="copy">' + svg('copy') + '<span></span></button>' +
    '<button type="button" role="menuitem" class="cw-mi" data-m="new">' + svg('reset') + '<span></span></button></div></div>' +
    '<div class="cw-log" role="log" aria-live="polite" aria-relevant="additions" tabindex="0"></div>' +
    '<div class="cw-sg" role="group"></div>' +
    '<form class="cw-f" autocomplete="off"><div class="cw-ac" id="cw-ac" role="listbox" hidden></div>' +
    '<input class="cw-in" type="text" maxlength="300" role="combobox" aria-autocomplete="list" aria-controls="cw-ac" aria-expanded="false" enterkeyhint="send">' +
    '<button type="submit" class="cw-send">' + svg('send') + '</button></form>' +
    '<p class="cw-ft"></p>';
  root.appendChild(panel);
  root.appendChild(btn);
  document.body.appendChild(root);

  var log = panel.querySelector('.cw-log'), tray = panel.querySelector('.cw-sg'), form = panel.querySelector('.cw-f'),
      input = panel.querySelector('.cw-in'), send = panel.querySelector('.cw-send'), acBox = panel.querySelector('.cw-ac'),
      menu = panel.querySelector('.cw-menu'), mnBtn = panel.querySelector('.cw-mn'), langBtn = panel.querySelector('.cw-lang'),
      closeBtn = panel.querySelector('.cw-close'), statusI = panel.querySelector('.cw-st i'), statusT = panel.querySelector('.cw-stt'),
      typing = null, busy = false, statusTimer = null, tipEl = null, tipTimer = null;

  function updateStatus() {
    var u = T(), o = officeNow();
    statusT.textContent = o ? (o.open ? u.open : u.closed) : u.bot;
    statusI.className = o && !o.open ? 'off' : '';
  }
  function applyChrome() {
    var u = T();
    root.setAttribute('dir', u.dir);
    root.setAttribute('lang', S.lang);
    btn.setAttribute('aria-label', S.open ? u.closeL : u.openL);
    btnLbl.textContent = u.lbl;
    panel.setAttribute('aria-label', u.dlg);
    panel.querySelector('.cw-nm').textContent = u.name;
    langBtn.textContent = u.lang;
    langBtn.setAttribute('aria-label', u.langT);
    langBtn.title = u.langT;
    langBtn.setAttribute('lang', S.lang === 'ar' ? 'en' : 'ar');
    mnBtn.setAttribute('aria-label', u.menu); mnBtn.title = u.menu;
    closeBtn.setAttribute('aria-label', u.closeL); closeBtn.title = u.closeL;
    menu.querySelector('[data-m="copy"] span').textContent = u.copyChat;
    menu.querySelector('[data-m="new"] span').textContent = u.newChat;
    log.setAttribute('aria-label', u.log);
    tray.setAttribute('aria-label', u.sg);
    acBox.setAttribute('aria-label', u.ac);
    input.placeholder = u.ph; input.setAttribute('aria-label', u.inp);
    send.setAttribute('aria-label', u.send);
    panel.querySelector('.cw-ft').textContent = u.ft;
    updateStatus();
  }

  function actionEl(a) {
    var isBtn = !!(a.i || a.k === 'copy'), el = mk(isBtn ? 'button' : 'a', 'cw-a');
    if (isBtn) {
      el.type = 'button';
      if (a.k === 'copy') {
        el.addEventListener('click', function () {
          copyText(a.c, function (ok) {
            var s = el.lastChild, old = s.textContent;
            if (ok) s.textContent = T().copied;
            setTimeout(function () { s.textContent = old; }, 1800);
          });
        });
      } else el.addEventListener('click', function () { ask(a.l, a.i, a.p); });
    } else {
      el.href = a.x ? a.href : ROOT + a.href;
      if (a.x && /^https?:/.test(a.href)) { el.target = '_blank'; el.rel = 'noopener noreferrer'; }
      if (!a.x) {
        el.addEventListener('click', function () {
          if (a.pf) { try { sessionStorage.setItem(PFKEY, JSON.stringify(a.pf)); } catch (e) { /* ignore */ } applyPrefill(); }
          setOpen(false, true);
        });
      }
    }
    if (a.k === 'pri') el.classList.add('pri');
    if (a.k === 'wa') el.classList.add('wa');
    el.innerHTML = svg(ACT_ICON[a.k] || 'arrow') + '<span></span>';
    if (!ACT_ICON[a.k] || a.k === 'page') el.classList.add('arr'); // سهم «التالي»: يُقلب في الاتجاه الإنجليزي
    el.lastChild.textContent = a.l;
    return el;
  }
  function render(m, fresh) {
    var dir = m.l === 'en' ? 'ltr' : 'rtl';
    var wrap = mk('div', 'cw-m ' + (m.f === 'u' ? 'u' : 'b') + (fresh && !calm ? ' new' : '')), bub = mk('div', 'cw-bb');
    bub.setAttribute('dir', dir);
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
      row.setAttribute('dir', dir);
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
    b.setAttribute('aria-label', T().typing);
    b.innerHTML = '<i></i><i></i><i></i>';
    typing.appendChild(b);
    log.appendChild(typing);
    toBottom();
  }
  function hideTyping() { if (typing && typing.parentNode) typing.parentNode.removeChild(typing); typing = null; }

  function respond(res) {
    var list = Array.isArray(res) ? res : [res], i = 0;
    setBusy(true);
    renderChips([]);
    function step() {
      showTyping();
      var r = list[i], len = JSON.stringify(r.m).length;
      setTimeout(function () {
        hideTyping();
        var m = r.m; m.f = 'b'; m.l = S.lang;
        S.msgs.push(m); S.last = r.id || ''; S.chips = r.c;
        if (r.ctx) S.ctxArea = r.ctx;
        i++;
        if (i === list.length) renderChips(r.c);
        add(m, true); save();
        if (i < list.length) step(); else setBusy(false);
      }, calm ? 80 : Math.min(1000, 380 + len * 0.8));
    }
    step();
  }
  function pushUser(x) {
    var u = { f: 'u', x: x, l: S.lang };
    S.msgs.push(u); add(u, true); save();
  }
  function ready(cb) { withPack(function () { if (S.lang === 'ar') loadKB(cb); else cb(); }); }
  function ask(label, id, p) {
    if (busy) return;
    ready(function () { pushUser(label); respond(answerFor(id, p)); });
  }
  function detect(text) {
    var n = norm(text), ar = /[\u0621-\u064A]/.test(n), lat = /[a-z]/.test(n);
    if (ar && !lat) return 'ar';
    if (lat && !ar && /[a-z]{2,}/.test(n) && n !== 'ok' && n !== 'okay') return 'en';
    return null;
  }
  function submit(text) {
    text = String(text).replace(/\s+/g, ' ').trim().slice(0, 300);
    if (!text || busy) return;
    var want = !S.flow ? detect(text) : null;
    if (want && want !== S.lang) { setLang(want, function () { go(text); }); return; }
    go(text);
  }
  function go(text) {
    ready(function () {
      pushUser(text);
      var res;
      if (S.flow && /^(الغاء|الغ|رجوع|ايقاف|توقف|cancel|stop|back)$/.test(norm(text))) res = answerFor('f_cancel');
      else res = S.flow ? flow({ t: text }) : understand(text);
      respond(res);
    });
  }

  /* ---- اللغة ---- */
  var enLoading = false, enQueue = [];
  function withPack(cb) {
    if (S.lang !== 'en' || EN) { cb(); return; }
    loadEN(function (ok) { if (!ok) { S.lang = 'ar'; applyChrome(); } cb(); });
  }
  function loadEN(cb) {
    if (EN) { cb(true); return; }
    enQueue.push(cb);
    if (enLoading) return;
    enLoading = true;
    function done(ok) { enLoading = false; var q = enQueue; enQueue = []; q.forEach(function (f) { f(ok); }); }
    function build() {
      try {
        EN = window.CHAT_EN({ D: D, R: R, K: K, kws: kws, prep: prep, toks: toks, chips: chips, channels: channels, channelList: channelList,
          area: area, fq: fq, officeLine: officeLine, ltr: ltr, PAGE: PAGE, social: function () { return CFG.social; } });
        done(true);
      } catch (e) { EN = null; done(false); }
    }
    if (window.CHAT_EN) { build(); return; }
    var s = document.createElement('script');
    s.src = ROOT + 'js/chat-en.js';
    s.onload = build;
    s.onerror = function () { done(false); };
    document.head.appendChild(s);
  }
  function setLang(l, cb) {
    if (l === S.lang) { if (cb) cb(); return; }
    function apply() {
      S.lang = l; S.flow = null;
      applyChrome();
      if (S.msgs.length <= 1) start();           // لم تبدأ المحادثة بعد: ترحيب جديد باللغة المختارة (مع وعي بالصفحة)
      else { renderChips(pack().main()); save(); }
      if (cb) cb();
    }
    if (l === 'en') {
      loadEN(function (ok) {
        if (ok) { apply(); return; }
        var m = { f: 'b', l: 'ar', p: [UI.ar.noEn] };
        S.msgs.push(m); add(m, true); save();
        if (cb) cb();
      });
    } else apply();
  }

  function start() {
    S.msgs = []; S.flow = null; S.last = '';
    log.textContent = '';
    var w = pack().welcome(PAGE.area);
    var m = w.m; m.f = 'b'; m.l = S.lang;
    S.msgs.push(m); S.chips = w.c;
    add(m, false); renderChips(w.c); save();
  }
  function restore() {
    log.textContent = '';
    S.msgs.forEach(function (m) { log.appendChild(render(m, false)); });
    renderChips(S.chips);
    log.scrollTop = log.scrollHeight;
  }

  /* ---- نسخ المحادثة ---- */
  function absUrl(a) { try { return a.x ? a.href : new URL(ROOT + a.href, location.href).href; } catch (e) { return a.href; } }
  function plain(m) {
    if (m.f === 'u') return m.x;
    var o = [];
    if (m.h) o.push(m.h);
    (m.p || []).forEach(function (t) { o.push(t); });
    (m.ul || []).forEach(function (t) { o.push('• ' + t); });
    (m.ol || []).forEach(function (x, i) { o.push((i + 1) + '. ' + x.x + (x.s ? ' — ' + x.s : '')); });
    if (m.n) o.push(m.n);
    (m.a || []).forEach(function (a) { if (a.href && !a.i) o.push('[' + a.l + '] ' + absUrl(a)); });
    return o.join('\n');
  }
  function transcript() {
    var u = T(), out = [u.title, location.href, ''];
    S.msgs.forEach(function (m) { out.push((m.f === 'u' ? u.you : u.who) + ':\n' + plain(m), ''); });
    return out.join('\n');
  }

  /* ---- القائمة والاقتراحات أثناء الكتابة ---- */
  function menuOpen(v) {
    menu.hidden = !v;
    mnBtn.setAttribute('aria-expanded', v ? 'true' : 'false');
  }
  var POOL_AR = (function () {
    var l = [];
    D.faq.forEach(function (f, j) { l.push({ l: f.q, i: 'faq', p: j }); });
    D.areas.forEach(function (a) { l.push({ l: 'ما الذي تتولونه في ' + a.n + '؟', i: 'area:' + a.s }); });
    [['ما هي مجالات الممارسة؟', 'areas'], ['كيف أحجز استشارة؟', 'booking'], ['ما مراحل العمل معكم؟', 'process'], ['كم تستغرق القضية؟', 'duration'],
     ['أين يقع المكتب؟', 'visit'], ['ما مواعيد عمل المكتب؟', 'visit'], ['هل المحامون مرخصون؟', 'license'], ['من هم محامو المكتب؟', 'team'],
     ['كيف أتواصل مع المكتب؟', 'contact'], ['لدي حالة عاجلة', 'urgent'], ['تم استدعائي للتحقيق', 'emergency'], ['أبرز الأسئلة الشائعة', 'faqtop']]
      .forEach(function (x) { l.push({ l: x[0], i: x[1] }); });
    l.forEach(function (x) { x.tk = toks(x.l); });
    return l;
  })();
  var acItems = [], acActive = -1;
  function acClose() {
    acBox.hidden = true; acBox.textContent = ''; acItems = []; acActive = -1;
    input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant');
  }
  function acUpdate() {
    var q = toks(input.value).filter(function (t) { return t.length >= 2; });
    if (!q.length || input.value.replace(/\s/g, '').length < 2 || busy) { acClose(); return; }
    var pool = (S.lang === 'en' ? (EN && EN.sug) : POOL_AR) || [], out = [];
    pool.forEach(function (it) {
      var pos = 0, ok = q.every(function (t) {
        for (var j = 0; j < it.tk.length; j++) if (it.tk[j].indexOf(t) === 0) { pos += j; return true; }
        return false;
      });
      if (ok) out.push({ it: it, s: pos + it.l.length * 0.01 });
    });
    out.sort(function (a, b) { return a.s - b.s; });
    acItems = out.slice(0, 4).map(function (o) { return o.it; });
    if (!acItems.length) { acClose(); return; }
    acBox.textContent = '';
    acItems.forEach(function (it, i) {
      var o = mk('div', 'cw-o', it.l);
      o.id = 'cw-o' + i; o.setAttribute('role', 'option');
      o.addEventListener('mousedown', function (e) { e.preventDefault(); });
      o.addEventListener('click', function () { acChoose(i); });
      acBox.appendChild(o);
    });
    acBox.hidden = false; acActive = -1;
    input.setAttribute('aria-expanded', 'true');
  }
  function acMove(d) {
    if (!acItems.length) return;
    acActive = (acActive + d + acItems.length) % acItems.length;
    Array.prototype.forEach.call(acBox.children, function (c, i) { c.classList.toggle('on', i === acActive); c.setAttribute('aria-selected', i === acActive ? 'true' : 'false'); });
    input.setAttribute('aria-activedescendant', 'cw-o' + acActive);
  }
  function acChoose(i) {
    var it = acItems[i];
    if (!it) return;
    input.value = ''; acClose();
    ask(it.l, it.i, it.p);
    if (!coarse) input.focus({ preventScroll: true });
  }

  /* ---- فتح/إغلاق ---- */
  function hideTip() { if (tipEl && tipEl.parentNode) tipEl.parentNode.removeChild(tipEl); tipEl = null; clearTimeout(tipTimer); }
  function setOpen(v, keepFocus) {
    S.open = v;
    panel.hidden = !v;
    btn.setAttribute('aria-expanded', v ? 'true' : 'false');
    btn.setAttribute('aria-label', v ? T().closeL : T().openL);
    panel.setAttribute('aria-modal', v && isMobile() ? 'true' : 'false');
    document.documentElement.classList.toggle('cw-lock', v);
    menuOpen(false); acClose();
    clearInterval(statusTimer);
    if (v) {
      hideTip();
      if (S.lang === 'ar') loadKB();
      updateStatus();
      statusTimer = setInterval(updateStatus, 60000);
      if (!calm) { panel.classList.remove('cw-show'); void panel.offsetWidth; panel.classList.add('cw-show'); }
      log.scrollTop = log.scrollHeight;
      if (!keepFocus) (coarse ? panel : input).focus({ preventScroll: true });
    } else if (!keepFocus) btn.focus({ preventScroll: true });
    save();
  }
  function focusables() {
    return Array.prototype.filter.call(panel.querySelectorAll('button,input,a[href]'), function (e) { return !e.disabled && e.offsetParent !== null; });
  }

  btn.addEventListener('click', function () { setOpen(!S.open); });
  closeBtn.addEventListener('click', function () { setOpen(false); });
  langBtn.addEventListener('click', function () { setLang(S.lang === 'ar' ? 'en' : 'ar'); });
  mnBtn.addEventListener('click', function (e) { e.stopPropagation(); menuOpen(menu.hidden); });
  menu.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-m]');
    if (!b) return;
    if (b.getAttribute('data-m') === 'new') {
      menuOpen(false);
      if (!busy) withPack(function () { start(); input.focus({ preventScroll: true }); });
      return;
    }
    copyText(transcript(), function (ok) {
      var s = b.lastChild, old = s.textContent;
      if (ok) s.textContent = T().copied;
      setTimeout(function () { s.textContent = old; menuOpen(false); }, 1100);
    });
  });
  panel.addEventListener('click', function (e) { if (!menu.hidden && !(e.target.closest && e.target.closest('.cw-menu,.cw-mn'))) menuOpen(false); });
  document.addEventListener('keydown', function (e) {
    if (!S.open || e.defaultPrevented) return;
    if (e.key === 'Escape') {
      var a = document.activeElement;
      if (!menu.hidden) { menuOpen(false); mnBtn.focus({ preventScroll: true }); e.preventDefault(); return; }
      if (!acBox.hidden) { acClose(); e.preventDefault(); return; }
      if (!a || a === document.body || root.contains(a)) setOpen(false);
    } else if (e.key === 'Tab' && isMobile() && root.contains(document.activeElement)) {
      var f = focusables();
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  input.addEventListener('input', acUpdate);
  input.addEventListener('keydown', function (e) {
    if (acBox.hidden) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); acMove(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); acMove(-1); }
    else if (e.key === 'Enter' && acActive >= 0) { e.preventDefault(); acChoose(acActive); }
  });
  input.addEventListener('blur', function () { setTimeout(acClose, 150); });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = input.value;
    input.value = ''; acClose();
    submit(v);
    if (!coarse) input.focus({ preventScroll: true });
  });
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-chat-open]');
    if (t) { e.preventDefault(); setOpen(true); }
  });

  /* ---- تنبيه لطيف مرة واحدة في الجلسة ---- */
  function maybeTip() {
    if (OPT.teaser === false) return;
    try { if (sessionStorage.getItem(TIPKEY)) return; } catch (e) { return; }
    tipTimer = setTimeout(function () {
      if (S.open || S.msgs.length > 1) return;
      var u = T(), a = PAGE.area && area(PAGE.area);
      tipEl = mk('div', 'cw-tip');
      tipEl.setAttribute('role', 'note');
      var t = mk('button', 'cw-tt', a && S.lang === 'ar' ? u.tipA.replace('%', a.n) : u.tip);
      t.type = 'button';
      t.addEventListener('click', function () { setOpen(true); });
      var x = mk('button', 'cw-tx');
      x.type = 'button'; x.setAttribute('aria-label', u.tipX); x.innerHTML = svg('close');
      x.addEventListener('click', hideTip);
      tipEl.appendChild(t); tipEl.appendChild(x);
      root.appendChild(tipEl);
      try { sessionStorage.setItem(TIPKEY, '1'); } catch (e) { /* ignore */ }
      tipTimer = setTimeout(hideTip, 12000);
    }, OPT.teaserDelay || 25000);
  }

  /* ---- تشغيل ---- */
  load();
  applyChrome();
  if (S.lang === 'en') loadEN(function (ok) { if (!ok) { S.lang = 'ar'; applyChrome(); } });
  if (S.msgs.length) restore(); else start();
  if (S.open) setOpen(true, true); else panel.hidden = true;
  applyPrefill();
  maybeTip();
  window.IsnadChat = { open: function () { setOpen(true); }, close: function () { setOpen(false); }, ask: submit, lang: setLang };
})();
