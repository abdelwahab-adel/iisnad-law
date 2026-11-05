/* Isnad Legal — English pack for the assistant (js/chat.js). Loaded only when the visitor switches to English or types in English.
   The texts are faithful translations of what the Arabic site already says (FAQ, method, contact). If you change the Arabic pages,
   mirror the change here. To change the English firm name used in the chat, edit BRAND below. */
window.CHAT_EN = function (H) {
  'use strict';
  var D = H.D, R = H.R, chips = H.chips, K = H.K, kws = H.kws, prep = H.prep, toks = H.toks, PAGE = H.PAGE;
  var BRAND = 'Isnad Legal';

  /* ---- names and one-line descriptions of the 15 practice areas (mirror practice.html) ---- */
  var ARN = {
    'commercial-law': 'Commercial law', 'criminal-law': 'Criminal law', 'civil-cases': 'Civil cases', 'personal-status': 'Personal status',
    'company-formation': 'Company formation', 'contracts': 'Contracts', 'investment': 'Investment', 'arbitration': 'Arbitration',
    'intellectual-property': 'Intellectual property', 'tax': 'Tax', 'real-estate': 'Real estate', 'enforcement': 'Enforcement',
    'debt-collection': 'Debt collection', 'labor-cases': 'Labour cases', 'international-litigation': 'International litigation'
  };
  var ARD = {
    'commercial-law': 'Advice for companies and traders on commercial disputes, governance, internal regulations and protecting contractual interests.',
    'criminal-law': 'Defence, analysis of evidence and representation in criminal cases and highly sensitive complaints, in full confidentiality.',
    'civil-cases': 'Claims, compensation and civil liability, with pleadings built on documented facts and precise legal grounds.',
    'personal-status': 'Refined legal solutions in family matters, maintenance, custody, estates and amicable settlements.',
    'company-formation': 'Setting up and aligning entities, partner agreements and regulations, and planning a legal structure that can grow.',
    'contracts': 'Drafting and reviewing high-protection contracts that reveal hidden obligations and reduce disputes before they arise.',
    'investment': 'Market-entry advice, investment agreements, legal due diligence and management of deal risk.',
    'arbitration': 'Representation in commercial arbitration, preparing memoranda, managing evidence and settling complex disputes.',
    'intellectual-property': 'Protecting trademarks, works and trade secrets, and licensing and exploitation agreements.',
    'tax': 'Legal support with objections, compliance, tax reviews and analysis of the regulatory impact.',
    'real-estate': 'Ownership disputes, leases, real-estate development, mortgages, and review of sale and investment contracts.',
    'enforcement': 'Following enforcement orders and instruments, attachments and financial claims, and protecting the rights of creditor and debtor.',
    'debt-collection': 'Recovering amounts owed to companies and individuals through a lawful path that starts with a notice and ends with enforcement.',
    'labor-cases': 'Representing employers and employees on contracts, dismissal, entitlements and labour violations.',
    'international-litigation': 'Coordinating cross-border disputes, jurisdiction, enforcement of foreign judgments and cooperation with foreign firms.'
  };
  var TOP = ['commercial-law', 'real-estate', 'personal-status', 'criminal-law', 'labor-cases', 'company-formation', 'contracts', 'arbitration', 'debt-collection'];
  var ROLE = { 'الشريك المدير': 'Managing Partner', 'رئيسة الاستشارات': 'Head of Advisory', 'محامي أول': 'Senior Lawyer', 'مستشارة قانونية أولى': 'Senior Legal Counsel' };
  var SPEC = { 'التقاضي التجاري والتحكيم': 'commercial litigation and arbitration', 'العقود والشركات': 'contracts and companies',
    'القضايا الجنائية والتنفيذ': 'criminal cases and enforcement', 'الملكية الفكرية وقانون العمل': 'intellectual property and labour law' };
  var STEPS = [
    ['Consultation', 'A confidential session where we listen to your story and understand your legal goal.'],
    ['File review', 'We study the evidence and documents and identify your strengths.'],
    ['Strategy', 'We draw up a plan that takes into account the regulations, cost and timing.'],
    ['Representation', 'We negotiate, plead and draft memoranda with skill before the competent authorities.'],
    ['Outcome', 'We close the file with the best possible result, God willing.']
  ];
  var PREP = ['A brief summary of the matter and the sequence of its events.', 'Relevant documents and correspondence.',
    'The names of the parties and how to contact them.', 'Any dates or deadlines you know of.', 'Your questions, and the outcome you would like to reach.'];

  var C = {
    areas: { l: 'Practice areas', i: 'areas' }, booking: { l: 'Book a consultation', i: 'booking' }, process: { l: 'How we work', i: 'process' },
    fees: { l: 'Fees', i: 'fees' }, conf: { l: 'Confidentiality', i: 'confidential' }, visit: { l: 'Hours & location', i: 'visit' },
    contact: { l: 'Contact', i: 'contact' }, about: { l: 'About the firm', i: 'about' }, docs: { l: 'What to prepare', i: 'docs' },
    free: { l: 'Is the first consultation free?', i: 'free' }, after: { l: 'What happens after?', i: 'after' },
    duration: { l: 'How long does it take?', i: 'duration' }, team: { l: 'Our team', i: 'team' }, license: { l: 'Licensing', i: 'license' },
    urgent: { l: 'Urgent consultation', i: 'urgent' }, remote: { l: 'Remote consultation', i: 'remote' }, poa: { l: 'Power of attorney', i: 'poa' }
  };
  var MAIN = [C.areas, C.booking, C.process, C.fees, C.conf, C.visit, C.contact];
  function areaChip(s) { return { l: ARN[s], i: 'area:' + s }; }

  /* ---- intents ---- */
  var AK = {
    'commercial-law': 'commercial|business dispute|shareholder|partners dispute|agency agreement|distribution agreement|company dispute',
    'criminal-law': 'criminal|crime|charged with|accused|defence|defense|prosecution|public prosecution',
    'civil-cases': 'civil|compensation|damages|liability',
    'personal-status': 'family|divorce|alimony|maintenance|child custody|custody|inheritance|last will|marriage|personal status|heirs',
    'company-formation': 'company formation|set up a company|register a company|incorporate|incorporation|start a company|open a company|llc|commercial registration|articles of association',
    'contracts': 'contract|contracts|draft a contract|review a contract|agreement|terminate a contract',
    'investment': 'invest|investment|investments|market entry|due diligence|acquisition|merger',
    'arbitration': 'arbitration|arbitrator|arbitral|arbitrate',
    'intellectual-property': 'intellectual property|trademark|patent|copyright|trade secret|brand registration|register a brand',
    'tax': 'tax|taxes|vat|zakat|zatca|taxation',
    'real-estate': 'real estate|property|lease|tenant|landlord|rent|eviction|mortgage|title deed|developer',
    'enforcement': 'enforcement|enforce a judgment|execute a judgment|asset freeze|travel ban|attachment|seizure',
    'debt-collection': 'debt|debts|collect money|collection|owed|unpaid|recover money|recover a debt|overdue payment',
    'labor-cases': 'labor|labour|employment|employee|employer|dismissed|fired|termination|end of service|salary|wages',
    'international-litigation': 'international litigation|cross border|foreign judgment|jurisdiction|foreign court'
  };
  var I = [
    { id: 'bot', b: 3, k: 'who are you|are you a bot|are you a robot|are you human|are you real|what is your name' },
    { id: 'about', b: 1, k: 'about the firm|about you|about isnad|tell me about|who are we|history|founded|established|since when' },
    { id: 'faqtop', b: 2, k: 'faq|frequently asked|common questions' },
    { id: 'areas', b: 0, k: 'practice areas|areas of practice|services|what do you do|what do you offer|what do you handle|do you handle|do you take|do you cover|specialise|specialize' },
    { id: 'booking', b: 0, k: 'book|booking|appointment|schedule|consultation|meeting|meet a lawyer|request a consultation|speak to a lawyer|need a lawyer|looking for a lawyer|hire a lawyer|find a lawyer|legal help|legal advice' },
    { id: 'fees', b: 1, k: 'fee$|fees|price|prices|pricing|cost|costs|how much|charge|charges|rates|expensive|payment' },
    { id: 'free', b: 3, k: 'free|complimentary|no charge|paid consultation|consultation paid' },
    { id: 'confidential', b: 1, k: 'confidential|confidentiality|privacy|private|secrecy|secret|data protection|my information' },
    { id: 'after', b: 3, k: 'what happens after|after the consultation|after consultation|next step after' },
    { id: 'process', b: 0, k: 'how do you work|your process|methodology|how it works|how does it work|what are the steps|stages' },
    { id: 'duration', b: 2, k: 'how long|duration|how many months|how many days|timeframe|time frame|timeline|take long|how soon' },
    { id: 'docs', b: 1, k: 'documents|what should i bring|what to bring|prepare|paperwork|what do you need from me|what do i need' },
    { id: 'urgent', b: 1, k: 'urgent|urgently|emergency|asap|immediately|right away|as soon as possible' },
    { id: 'emergency', b: 4, k: 'arrested|arrest|detained|detention|police|summoned|summons|investigation|prison|jail|in custody|taken in' },
    { id: 'notice', b: 2, k: 'notice|served with|lawsuit against me|sued|claim against me|i was served' },
    { id: 'visit', b: 0, k: 'hours|opening hours|working hours|open|closed|address|location|where|map|directions|office|visit|riyadh|olaya|find you' },
    { id: 'contact', b: 0, k: 'contact|phone|call|whatsapp|email|e mail|talk to|speak to|reach you|number|get in touch' },
    { id: 'remote', b: 2, k: 'remote|remotely|online|video|zoom|abroad|overseas|foreign|outside saudi|outside the kingdom|from outside|expat|international client|investor' },
    { id: 'guarantee', b: 1, k: 'guarantee|guaranteed|promise|win my case|chances of winning|success rate|will i win' },
    { id: 'poa', b: 0, k: 'power of attorney|poa|najiz|authorization|authorisation' },
    { id: 'team', b: 0, k: 'team|your lawyers|our lawyers|who are your lawyers|attorneys|partner|who will handle|experience' },
    { id: 'license', b: 1, k: 'licensed|licence|license|accredited|registered|qualified|credentials|certified|bar association' },
    { id: 'help', b: 2, k: 'what can you do|how can you help|help me|your capabilities|what do you know|how do i use you' },
    { id: 'how', b: 3, k: 'how are you|how is it going|how do you do' },
    { id: 'ai', b: 3, k: 'chatgpt|gpt|artificial intelligence|are you ai|are you an ai|gemini|claude' },
    { id: 'branches', b: 2, k: 'branch|branches|other offices|other locations|another office' },
    { id: 'careers', b: 2, k: 'any jobs|have jobs|job vacancies|job opportunities|job opening|job openings|looking for a job|apply for a job|career|careers|hiring|vacancy|vacancies|internship|train with you|work for you|work with you' },
    { id: 'payment', b: 2, k: 'payment methods|how do i pay|installments|instalments|pay by card|bank transfer|invoice' },
    { id: 'complaint', b: 2, k: 'complaint|complain|unhappy|feedback|suggestion|dissatisfied' },
    { id: 'social', b: 2, k: 'twitter|instagram|linkedin|youtube|snapchat|social media' },
    { id: 'cases', b: 2, k: 'case studies|past cases|previous cases|track record|testimonials|client reviews|reviews|results' },
    { id: 'appointment', b: 4, k: 'prior appointment|without an appointment|walk in|drop by|can i visit' },
    { id: 'offtopic', b: 6, k: 'gold price|exchange rate|stock market|bitcoin|crypto|weather|football|soccer|match score|recipe|movie|song|poem|joke|horoscope|homework|write code|programming' }
  ];
  Object.keys(AK).forEach(function (s) { I.push({ id: 'area:' + s, b: 0, k: AK[s] }); });
  prep(I);
  var OPIN = kws('my case|my situation|can i sue|do i have a case|should i|what should i do|what can i do|advice|my rights');
  var GREET = kws('hello|hi$|hey$|good morning|good evening|good afternoon|greetings|salam');
  var THANKS = kws('thanks|thank you|thx|appreciate');
  var BYE = kws('bye|goodbye|see you|take care');
  var YES = {}; 'yes yeah yep sure ok okay please definitely absolutely'.split(' ').forEach(function (w) { YES[w] = 1; });

  function ch(s) { return H.channels(s); }
  function hours() {
    var m = /(\d{1,2})\s*ص\s*[–-]\s*(\d{1,2})\s*م/.exec(D.hours || '');
    return m ? 'Sunday – Thursday: ' + m[1] + ' AM – ' + m[2] + ' PM' : D.hours;
  }
  function address() { var z = /\d{5}/.exec(D.address || ''); return 'King Fahd Road, Al Olaya District, Riyadh' + (z ? ' ' + z[0] : ''); }
  var CLOSED = 'Friday – Saturday: closed';

  function answer(id, p) {
    var f, a;
    switch (id) {
      case 'greet': return R({ p: ['Welcome to ' + BRAND + '. How can I help you?'] });
      case 'salam': return R({ p: ['Hello, and welcome to ' + BRAND + '. How can I help you?'] });
      case 'thanks': return R({ p: ['You are welcome — happy to help. Is there anything else?'] });
      case 'bye': return R({ p: ['Goodbye, and we are glad to help whenever you need.'] }, chips(C.booking, C.contact));
      case 'bot':
        return R({ p: ['I am the automated assistant of ' + BRAND + ', not a lawyer. I answer general questions based on the website content; any opinion on your own situation is given by the firm’s lawyers in a consultation.'] },
          chips(C.areas, C.booking, C.contact));
      case 'about':
        return R({ h: 'About the firm', p: [BRAND + ' was founded in 2004 with a clear vision: a refined legal service that combines depth of knowledge with strategic sense. Today the firm brings together a select group of specialist lawyers who represent individuals, companies and investors in the most complex and sensitive cases in Saudi Arabia and the region.'],
          a: [{ l: 'About the firm (Arabic page)', href: 'about.html', k: 'page' }] }, chips(C.team, C.license, C.process, C.booking));
      case 'faqtop':
        return R({ h: 'Frequently asked questions', p: ['Our FAQ page is currently in Arabic. Ask me here about fees, the first consultation, confidentiality, documents, remote consultations or how we work.'],
          a: [{ l: 'FAQ page (Arabic)', href: 'faq.html', k: 'page' }] }, chips(C.fees, C.free, C.conf, C.docs, C.remote));
      case 'areas':
        return R({ h: 'Practice areas', p: ['The firm covers ' + D.areas.length + ' legal practice areas for individuals, companies and investors. Pick one to see what we handle:'],
          a: [{ l: 'All practice areas (Arabic page)', href: 'practice.html', k: 'page' }] },
          TOP.map(areaChip).concat([{ l: 'More practice areas', i: 'areas_more' }]));
      case 'areas_more':
        return R({ p: ['And the remaining areas:'] },
          Object.keys(ARN).filter(function (s) { return TOP.indexOf(s) < 0; }).map(areaChip).concat([C.booking]));
      case 'booking':
        return R({ h: 'Booking a consultation', p: ['You can request a consultation in two ways:'],
          ul: ['Fill in the booking form on the “Contact us” page.', 'Or start a short request here and I will prepare a summary you can send to the firm in the way that suits you.'],
          n: 'Nothing from this chat is sent automatically, and you review the summary before sending it.',
          a: [{ l: 'Start the request here', i: 'f_start', k: 'pri' }, { l: 'Consultation booking form', href: 'contact.html#contact', k: 'form' }] },
          chips(C.free, C.docs, C.after, C.fees));
      case 'fees':
        return R({ h: 'Fees', p: ['Fees depend on the scope of work, the complexity, the value of the dispute and the number of expected procedures, and we explain this transparently before we begin.',
          'As for the first consultation: its policy varies by type, duration and the nature of the matter. We tell you before confirming the appointment whether it is paid and how much, so you are not surprised by any later cost.'],
          n: 'Some cases involve costs outside our fees, such as the fees of certain competent authorities where applicable, certified translation or expert fees; these vary by case. We outline what to expect before we begin as far as possible, and we tell you of any exceptional expense before you bear it.',
          a: [{ l: 'Book a consultation', i: 'booking' }] }, chips(C.after, C.docs, C.booking));
      case 'free':
        return R({ p: ['The policy for the first consultation varies by its type, duration and the nature of the matter. We tell you before confirming the appointment whether the consultation is paid and how much, so you are not surprised by any later cost.'] },
          chips(C.fees, C.booking));
      case 'confidential':
        return R({ h: 'Confidentiality', p: ['Yes. All information and documents that a client shares are treated with full professional confidentiality, even before the representation agreement is signed.'],
          n: 'This chat is kept in your browser only for the session and reaches the firm only if you choose to send it.' }, chips(C.license, C.booking, C.docs));
      case 'after':
        return R({ p: ['We present an assessment of your legal position, the available options and the potential risks. If you would like the firm to handle the procedures, the scope of work and fees are agreed in a separate agreement before we begin; if you prefer to stay with the consultation alone, you have no obligation to retain us.'] },
          chips(C.fees, C.duration, C.booking));
      case 'process':
        return R({ h: 'How we work', p: ['We work through a clear five-step path:'],
          ol: STEPS.map(function (s) { return { x: s[0], s: s[1] }; }),
          a: [{ l: 'More on our method (Arabic page)', href: 'about.html#method', k: 'page' }] }, chips(C.duration, C.docs, C.booking));
      case 'duration':
        return R({ p: ['Duration varies with the type of case, the competent authority and the course of the procedures. We provide a preliminary estimate after studying the file, without committing to any particular outcome.'] },
          chips(C.process, C.fees, C.booking));
      case 'docs':
        return R({ h: 'What to prepare before the consultation', ul: PREP,
          n: 'We prefer that you send us contracts, correspondence, previous judgments or decisions, and any documents that prove the facts of the dispute.' }, chips(C.booking, C.conf, C.fees));
      case 'urgent':
        return R({ h: 'Urgent consultation', p: ['We contact you within 30 minutes of receiving your request, God willing, and book the earliest available appointment with the relevant lawyer.'],
          a: ch('Hello, I have an urgent legal matter and would like to speak to the firm.') }, chips(C.booking, C.docs));
      case 'emergency':
        return R({ h: 'Urgent situation', p: ['If you or a relative has been summoned for investigation or detained, please contact the firm as soon as possible.',
          'The Law of Criminal Procedure guarantees the accused the right to seek the assistance of a lawyer or representative during the investigation and trial. We advise you to find out the reason for the summons, not to sign any statement before you understand its content and effect, and to contact a lawyer as soon as possible so that they can be with you and protect your rights.',
          'For urgent requests: we contact you within 30 minutes of receiving your request, God willing.'],
          a: ch('Hello, I have an urgent matter involving an investigation or summons and need a lawyer as soon as possible.') }, chips(C.docs, C.conf, C.booking));
      case 'notice':
        return R({ h: 'A notice or lawsuit', p: ['Do not ignore it. Keep a copy of it and of every related document, and contact the firm as soon as possible so that it can review the notice and determine the appropriate deadlines and procedures.'],
          a: ch('Hello, I received a notice or lawsuit and would like the firm to review it.') }, chips(C.docs, C.booking, C.fees));
      case 'appointment':
        return R({ p: ['Visits are by prior appointment, so that the right lawyer is assigned to you.'], a: [{ l: 'Book a consultation', i: 'booking' }] }, chips(C.visit, C.booking, C.contact));
      case 'visit':
        f = H.officeLine();
        return R({ h: 'Hours & location', ul: ['Address: ' + address(), 'Working hours: ' + hours(), CLOSED, 'Visits are by prior appointment, so that the right lawyer is assigned to you.'],
          n: (f ? f + ' ' : '') + 'You can send your request through the form at any time and we will get back to you as soon as possible.',
          a: [{ l: 'Map and location details', href: 'contact.html#location', k: 'map' }] }, chips(C.booking, C.contact, C.remote));
      case 'contact':
        f = H.channelList();
        return R({ h: 'Contact the firm', p: [f.length ? 'We would be glad to hear from you. Our channels:' : 'We would be glad to hear from you. Please send your request through the “Contact us” form and the firm’s team will get back to you.'],
          ul: f.length ? f : null, n: 'Working hours: ' + hours() + ', ' + CLOSED.toLowerCase() + '.' + (H.officeLine() ? ' ' + H.officeLine() : ''),
          a: ch('Hello, I would like to get in touch with the firm.') }, chips(C.booking, C.visit, C.areas));
      case 'remote':
        return R({ h: 'Remote consultation',
          p: ['You can request a consultation through the form or by phone, and after reviewing your request the firm decides the most suitable way for the initial consultation, in person or remotely.',
            'Yes, we provide consultations and representation to foreign investors and companies in matters connected to the Kingdom, and the consultation and communication can be arranged remotely for those who are not in Riyadh.'],
          a: [{ l: 'Book a consultation', i: 'booking' }] }, chips(C.booking, C.visit, C.fees));
      case 'guarantee':
        return R({ p: ['No. No lawyer can guarantee a judgment or a particular outcome, because the decision rests with the competent authority according to the evidence and the regulations. What we commit to is a thorough study of your file, a clear picture of the opportunities and risks, and serious follow-up of every procedure.'] },
          chips(C.process, C.booking));
      case 'poa':
        return R({ h: 'Power of attorney', p: ['In most cases, yes: a lawyer needs a formal power of attorney to carry out procedures on your behalf before the competent authorities. It can be issued electronically through the Ministry of Justice’s “Najiz” platform, without visiting a notary public in most cases; an electronic power of attorney lasts one year at most and can be revoked electronically. We help you choose the clauses that suit your case, and other attestation procedures are available for those outside the Kingdom.'] },
          chips(C.fees, C.booking, C.docs));
      case 'team':
        return R({ h: 'Our team', p: ['The firm brings together selected specialist lawyers, including:'],
          ul: D.team.map(function (t) { return (ROLE[t.r] || t.r) + ' — ' + (SPEC[t.s] || t.s) + ' (' + t.y + ' years of experience)'; }),
          a: [{ l: 'Meet the team (Arabic page)', href: 'about.html#team', k: 'page' }] }, chips(C.license, C.process, C.booking));
      case 'license':
        return R({ h: 'Licensing and accreditation',
          p: ['The firm’s lawyers are officially licensed, and you may ask for their licence and professional-membership details before engaging us; this is your right when choosing any law firm.', 'To verify any law firm before engaging it, look for:'],
          ol: [{ x: 'A valid practising licence in the lawyer’s name.' }, { x: 'A professional membership that can be verified with the competent authority.' },
               { x: 'A written fee agreement that sets out the scope and the fee.' }, { x: 'A power of attorney with a clear scope that does not exceed what your case needs.' }],
          a: [{ l: 'Professional accreditations (Arabic page)', href: 'index.html#accred', k: 'page' }] }, chips(C.conf, C.fees, C.booking));
      case 'help':
        return R({ h: 'How can I help?', p: ['I can answer questions about:'],
          ul: ['Our 15 practice areas and what we handle in each', 'Fees, the first consultation, confidentiality and power of attorney', 'How we work, how long a case takes and what to prepare',
               'Opening hours, our address and contact details', 'Booking a consultation and preparing a summary of your request'] }, chips(C.areas, C.booking, C.process, C.fees, C.contact));
      case 'how': return R({ p: ['I am well, thank you for asking. How can I help you?'] });
      case 'offtopic':
        return R({ p: ['That is outside what I can answer; I am here for questions about the firm, its practice areas and its services.'] }, chips(C.areas, C.booking, C.contact));
      case 'ai':
        return R({ p: ['I am an automated assistant programmed on this website’s content. I answer with rules rather than a generative AI model, so I can only answer what the website says, and refer you to the firm’s lawyers for anything else.'] },
          chips(C.areas, C.booking, C.contact));
      case 'branches':
        return R({ h: 'Our office', p: ['The website lists the firm’s main office in Riyadh. If you are outside Riyadh you can request a remote consultation.'],
          ul: ['Address: ' + address(), 'Visits are by prior appointment, so that the right lawyer is assigned to you.'], a: [{ l: 'Map and location details', href: 'contact.html#location', k: 'map' }] },
          chips(C.remote, C.visit, C.booking));
      case 'careers':
        return R({ p: ['The website does not currently list information about jobs or training. You can write to the firm through its contact channels.'],
          a: ch('Hello, I would like to ask about job or training opportunities at the firm.') }, chips(C.about, C.contact));
      case 'payment':
        return R({ h: 'Payment methods', p: ['The website does not give details about payment methods or instalments, and you can ask about them directly. As for fees, we explain them before we begin, as described under “Fees”.'],
          a: ch('Hello, I would like to ask about how fees are paid.') }, chips(C.fees, C.after, C.booking));
      case 'complaint':
        return R({ p: ['We are sorry to hear that, and your feedback matters to us. You can write to the firm directly through these channels:'],
          a: ch('Hello, I have feedback I would like to pass on to the firm.') }, chips(C.contact, C.booking));
      case 'social': {
        var so = H.social() || {};
        var links = [['li', 'LinkedIn'], ['x', 'X'], ['ig', 'Instagram'], ['yt', 'YouTube']].filter(function (x) { return so[x[0]]; })
          .map(function (x) { return { l: x[1], href: so[x[0]], k: 'page', x: 1 }; });
        if (links.length) return R({ p: ['Our official accounts:'], a: links }, chips(C.contact, C.booking));
        return R({ p: ['The website does not currently list official social-media accounts. You can reach us through the available channels.'], a: ch('Hello, I would like to get in touch with the firm.') }, chips(C.contact, C.booking));
      }
      case 'cases':
        return R({ h: 'Case studies and client reviews', p: ['The website presents case studies and client reviews in two separate sections (in Arabic).'],
          n: 'Every case has its own facts and evidence, and past results do not guarantee similar results. We review your situation on its own before any estimate.',
          a: [{ l: 'Case studies (Arabic page)', href: 'index.html#cases', k: 'page' }, { l: 'Client reviews (Arabic page)', href: 'index.html#voices', k: 'page' }] },
          chips(C.areas, C.booking, C.process));
      case 'opinion':
        return R({ p: ['I cannot give a legal opinion on a specific situation through chat; the answer depends on the facts, the documents and the regulations in force.',
          'This information does not replace legal advice: it is general and for awareness only, and the answer may differ with the facts, documents and regulations in force, so we recommend consulting a specialist before any decision.'],
          a: [{ l: 'Start a consultation request', i: 'f_start', k: 'pri' }] }, chips(C.docs, C.fees, C.areas));
      case 'clarify':
        return R({ p: ['Your question could relate to more than one practice area. Which one do you mean?'] }, p.map(areaChip).concat([C.contact]));
      case 'fallback':
        return R({ p: ['I did not quite understand your question, and I would rather not give you unverified information. Please choose a topic below or contact the firm’s team directly.'],
          a: ch('Hello, I have a legal enquiry.') }, chips(C.areas, C.booking, C.fees, C.contact));
      default:
        if (id.indexOf('area:') === 0) {
          a = id.slice(5);
          return R({ h: ARN[a], p: [ARD[a]], n: 'The cases we handle and the competent authorities are listed on the practice page (in Arabic).',
            a: [{ l: 'Open the practice page (Arabic)', href: 'practice/' + a + '.html', k: 'page' }] },
            chips(C.booking, C.docs, C.fees, { l: 'More practice areas', i: 'areas' }));
        }
        return null;
    }
  }

  function welcome(slug) {
    var m = { h: 'Welcome to ' + BRAND,
      p: ['I am the firm’s automated assistant. I can answer questions about our practice areas, how we work, fees, booking a consultation and contact details.'],
      n: 'Please do not type ID numbers or confidential details here.' };
    var c = MAIN;
    if (slug && ARN[slug]) {
      m.p.push('You are viewing the “' + ARN[slug] + '” page. I can show you what we handle in it, or prepare a consultation request for you.');
      c = [{ l: 'What we handle in ' + ARN[slug], i: 'area:' + slug }, C.booking, C.docs, C.fees, C.areas, C.contact];
    } else {
      m.p.push('Choose a topic below or type your question.');
      if (PAGE.file === 'contact.html') c = [C.booking, C.visit, C.docs, C.fees, C.conf, C.urgent];
      else if (PAGE.file === 'about.html') c = [C.about, C.team, C.license, C.process, C.booking, C.contact];
    }
    return { m: m, c: c };
  }

  var SUG = [['How much are your fees?', 'fees'], ['Is the first consultation free?', 'free'], ['How do I book a consultation?', 'booking'],
    ['Where is your office?', 'visit'], ['What are your working hours?', 'visit'], ['What are your practice areas?', 'areas'],
    ['How do you work?', 'process'], ['How long does a case take?', 'duration'], ['What documents should I prepare?', 'docs'],
    ['Is my information confidential?', 'confidential'], ['Do you offer remote consultations?', 'remote'], ['Do you advise foreign investors?', 'remote'],
    ['I have an urgent matter', 'urgent'], ['I was summoned for investigation', 'emergency'], ['Are your lawyers licensed?', 'license'],
    ['Who are your lawyers?', 'team'], ['How can I contact you?', 'contact'], ['Do I need a power of attorney?', 'poa'], ['Can you guarantee a result?', 'guarantee']]
    .map(function (x) { return { l: x[0], i: x[1] }; });
  Object.keys(ARN).forEach(function (s) { SUG.push({ l: 'What do you handle in ' + ARN[s].toLowerCase() + '?', i: 'area:' + s }); });
  SUG.forEach(function (x) { x.tk = toks(x.l); });

  return {
    lang: 'en', fuzzy: false, I: I, GREET: GREET, THANKS: THANKS, BYE: BYE, OPIN: OPIN, hasFaq: false, yes: YES, no: 'no',
    comp: /(?:^|\s)(?:also|plus|as well|and where|and how|and what|and when|and do|and is|and are|and can)(?:\s|$)/,
    answer: answer, main: function () { return MAIN; }, welcome: welcome, sug: SUG,
    areaName: function (s) { return ARN[s] || s; },
    after: function () { return chips(C.docs, C.fees, C.areas); }
  };
};
