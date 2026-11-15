'use strict';
/* ============================================================
   문제루프 — 임종평 문제은행 (정적 웹앱)
   ============================================================ */

const LS_KEY = 'munjeloop:v1';
const EXAM_LIMIT_MS = 100 * 60 * 1000; // 100분
const MARKERS = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩'];
const CIRC = { '①': 1, '②': 2, '③': 3, '④': 4, '⑤': 5 };

/* ---------------- utils ---------------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const now = () => Date.now();
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

const ICON = {
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
  sync: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11a8 8 0 0 0-14.3-4.7L4 8"/><path d="M4 4v4h4"/><path d="M4 13a8 8 0 0 0 14.3 4.7L20 16"/><path d="M20 20v-4h-4"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 3.6l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.9z"/></svg>',
  calc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="5" y="3" width="14" height="18" rx="2.5"/><path d="M8 7.5h8"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 15.5h.01M12 15.5h.01M15.5 15.5h.01M8.5 19h.01M12 19h.01M15.5 19h.01"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4l10-10-4-4L4 16z"/><path d="M13.5 6.5l4 4"/></svg>',
  page: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/></svg>',
  chevronUp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 15l6-6 6 6"/></svg>',
  chevronDown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>',
  chevronLeft: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>',
  chevronRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="7" y="5" width="3.5" height="14" rx="1.2"/><rect x="13.5" y="5" width="3.5" height="14" rx="1.2"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5l11 6.5-11 6.5z"/></svg>',
  grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="4" width="6.5" height="6.5" rx="1.4"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.4"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.4"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.4"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>',
};

function fmtClock(ms) {
  const t = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
  const mm = String(m).padStart(2, '0'), ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}
function fmtDur(ms) {
  const t = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
  if (h > 0) return `${h}시간 ${m}분`;
  if (m > 0) return `${m}분 ${s}초`;
  return `${s}초`;
}
function fmtAgo(ts) {
  if (!ts) return '없음';
  const d = now() - ts;
  if (d < 60000) return '방금';
  if (d < 3600000) return `${Math.floor(d / 60000)}분 전`;
  if (d < 86400000) return `${Math.floor(d / 3600000)}시간 전`;
  return new Date(ts).toLocaleString('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

let toastTimer = null;
function toast(msg, ms = 2600) {
  const root = $('#toast-root');
  const div = document.createElement('div');
  div.className = 'toast';
  div.textContent = msg;
  root.innerHTML = '';
  root.appendChild(div);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    div.classList.add('out');
    setTimeout(() => div.remove(), 300);
  }, ms);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.top = '-1000px';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch (e2) {
      return false;
    }
  }
}

/* ---------------- store ---------------- */
function emptyStore() {
  return { v: 1, updatedAt: 0, answers: {}, answerRev: {}, sessions: {}, stats: {}, edits: {}, settings: {} };
}
let store = emptyStore();

function loadStore() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return emptyStore();
    const s = JSON.parse(raw);
    if (!s || typeof s !== 'object') return emptyStore();
    return Object.assign(emptyStore(), s);
  } catch (e) {
    return emptyStore();
  }
}

let saveTimer = null;
function saveStore(immediate) {
  store.updatedAt = now();
  const write = () => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(store));
    } catch (e) {
      toast('저장 공간이 부족해 기록을 저장하지 못했어요');
    }
  };
  if (immediate) {
    clearTimeout(saveTimer);
    write();
  } else {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(write, 250);
  }
  scheduleAutoPush();
}

function mergeStores(local, remote) {
  const out = emptyStore();
  out.settings = Object.assign({}, local.settings);
  out.updatedAt = Math.max(local.updatedAt || 0, remote.updatedAt || 0);
  out.answers = Object.assign({}, local.answers);
  out.answerRev = Object.assign({}, local.answerRev);
  for (const k of Object.keys(remote.answers || {})) {
    if (!(k in out.answers) || (remote.answerRev?.[k] || 0) > (local.answerRev?.[k] || 0)) {
      out.answers[k] = remote.answers[k];
      out.answerRev[k] = remote.answerRev?.[k] || 0;
    }
  }
  out.sessions = Object.assign({}, local.sessions);
  for (const k of Object.keys(remote.sessions || {})) {
    const a = out.sessions[k], b = remote.sessions[k];
    if (!a || (b?.updatedAt || 0) > (a?.updatedAt || 0)) out.sessions[k] = b;
  }
  out.stats = Object.assign({}, local.stats);
  for (const ex of Object.keys(remote.stats || {})) {
    out.stats[ex] = Object.assign({}, out.stats[ex] || {});
    for (const q of Object.keys(remote.stats[ex])) {
      const a = out.stats[ex][q] || { w: 0, c: 0 };
      const b = remote.stats[ex][q] || { w: 0, c: 0 };
      out.stats[ex][q] = { w: Math.max(a.w || 0, b.w || 0), c: Math.max(a.c || 0, b.c || 0) };
    }
  }
  out.edits = Object.assign({}, local.edits);
  for (const ex of Object.keys(remote.edits || {})) {
    out.edits[ex] = Object.assign({}, out.edits[ex] || {});
    for (const q of Object.keys(remote.edits[ex])) {
      const a = out.edits[ex][q], b = remote.edits[ex][q];
      if (!a || (b?.updatedAt || 0) > (a?.updatedAt || 0)) out.edits[ex][q] = b;
    }
  }
  return out;
}

/* ---------------- data ---------------- */
let INDEX = null;
const EXAM_CACHE = {};
let BOOT_ERROR = null;

async function fetchJSON(path) {
  const res = await fetch(path, { cache: 'default' });
  if (!res.ok) throw new Error(`${path} (${res.status})`);
  return res.json();
}
async function getIndex() {
  if (!INDEX) INDEX = await fetchJSON('data/index.json');
  return INDEX;
}
async function getExam(id) {
  if (!EXAM_CACHE[id]) EXAM_CACHE[id] = await fetchJSON(`data/${id}.json`);
  return EXAM_CACHE[id];
}
function examMeta(id) {
  return (INDEX?.exams || []).find((e) => e.exam_id === id);
}

/* ---------------- state ---------------- */
const ui = {
  view: 'home',
  filterYear: 'all',
  q: '',
  examId: null,
  exam: null,
  session: null,
  isMini: false,
  order: [],
  idx: 0,
  limitMs: EXAM_LIMIT_MS,
  omrOpen: false,
  omrFilter: 'all',
  resultFilter: 'all',
  result: null,
  timer: null,
  lastSave: 0,
  expanded: {},
  calc: null,
};

function newSession() {
  const t = now();
  return {
    answers: {}, excluded: {}, flags: [], notes: {},
    elapsedMs: 0, running: true, lastTs: t, startedAt: t,
    submitted: false, submittedAt: null, updatedAt: t,
  };
}
function peekSession(id) {
  return store.sessions[id] || null;
}
function ensureSession(id) {
  if (!store.sessions[id]) store.sessions[id] = newSession();
  return store.sessions[id];
}
function currentElapsed(s) {
  if (!s) return 0;
  return s.elapsedMs + (s.running && !s.submitted ? Math.max(0, now() - s.lastTs) : 0);
}
function commitElapsed(s) {
  if (s.running && !s.submitted) s.elapsedMs += Math.max(0, now() - s.lastTs);
  s.lastTs = now();
}
function remainingMs() {
  return Math.max(0, ui.limitMs - currentElapsed(ui.session));
}

/* ---------------- 문제 접근 ---------------- */
function editOf(no) {
  return store.edits[ui.examId]?.[no] || null;
}
function getQ(no) {
  const base = ui.exam.questions.find((q) => q.number === no);
  if (!base) return null;
  const e = editOf(no);
  if (!e) return { ...base, options: base.options.map((o) => ({ ...o })) };
  return {
    ...base,
    stem: typeof e.stem === 'string' ? e.stem : base.stem,
    options: base.options.map((o, i) => ({ ...o, text: typeof e.options?.[i] === 'string' ? e.options[i] : o.text })),
  };
}
function keyOf(no) {
  const e = editOf(no);
  if (e && e.answer) return Number(e.answer);
  const a = store.answers[ui.examId]?.[no];
  return a ? Number(a) : null;
}
function wrongCount(no) {
  return store.stats[ui.examId]?.[no]?.w || 0;
}
function hasAnyKey() {
  const keys = store.answers[ui.examId] || {};
  const edits = store.edits[ui.examId] || {};
  return ui.exam.questions.some((q) => keys[q.number] || edits[q.number]?.answer);
}
function answeredCount(list, s) {
  return list.filter((n) => s.answers[n]).length;
}
function isWrong(no, s) {
  const k = keyOf(no);
  const a = (s || ui.session).answers[no];
  return !!k && !!a && a !== k;
}
function isCorrect(no, s) {
  const k = keyOf(no);
  const a = (s || ui.session).answers[no];
  return !!k && !!a && a === k;
}

/* ---------------- 렌더 ---------------- */
function render() {
  stopTimer();
  const screen = $('#screen');
  if (ui.view === 'exam') {
    screen.className = 'screen';
    screen.innerHTML = examHTML();
    renderQuestionCard();
    updateTimerUI(true);
    startTimer();
    window.scrollTo(0, 0);
  } else if (ui.view === 'result') {
    screen.className = 'screen no-bottom';
    screen.innerHTML = resultHTML();
  } else {
    screen.className = 'screen no-bottom';
    screen.innerHTML = homeHTML();
  }
  closeModal();
}

function homeHTML() {
  if (BOOT_ERROR) {
    return `<div class="home-head"><div class="logo">${ICON.sync}</div><div><div class="home-title">문제루프</div></div></div>
      <div class="emptystate">문제은행을 불러오지 못했어요.<br><small>${esc(BOOT_ERROR)}</small><br><br><button class="btn btn-ghost btn-sm" data-act="reload">다시 시도</button></div>`;
  }
  const exams = INDEX?.exams || [];
  const years = [...new Set(exams.map((e) => e.year))].sort((a, b) => b - a);
  const q = ui.q.trim().toLowerCase();
  let list = exams.filter((e) => {
    if (ui.filterYear !== 'all' && String(e.year) !== ui.filterYear) return false;
    if (!q) return true;
    const hay = `${e.title} ${e.year} ${e.course}교시 ${e.exam_id}`.toLowerCase();
    return hay.includes(q);
  });
  list = list.slice().sort((a, b) => b.year - a.year || a.course - b.course);

  const cards = list.map((e) => examCardHTML(e)).join('');
  const syncOn = !!(store.settings.gistId && store.settings.gistToken);

  return `
  <div class="home-head">
    <div class="logo" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6.5 18.5A7 7 0 1 1 17 7.2"/><path d="M17.5 3.5v4.2h-4.2"/><circle cx="12" cy="12.6" r="2.1" fill="#fff" stroke="none"/>
      </svg>
    </div>
    <div>
      <div class="home-title">문제루프</div>
      <div class="home-sub">자체 2차 임종평 8회 · 640문항</div>
    </div>
    <div class="head-spacer"></div>
    <button class="icon-btn" data-act="open-sync" aria-label="동기화">${ICON.sync}${syncOn ? '<span class="dot"></span>' : ''}</button>
  </div>
  <div class="search-wrap">
    <div class="search">${ICON.search}<input id="searchInput" type="search" placeholder="시험 이름으로 찾기 (예: 2025 2교시)" value="${esc(ui.q)}" autocomplete="off"></div>
  </div>
  <div class="chips">
    <button class="chip ${ui.filterYear === 'all' ? 'on' : ''}" data-act="year" data-year="all">전체 ${exams.length}</button>
    ${years.map((y) => `<button class="chip ${ui.filterYear === String(y) ? 'on' : ''}" data-act="year" data-year="${y}">${y}년 ${exams.filter((e) => e.year === y).length}</button>`).join('')}
  </div>
  ${cards || '<div class="emptystate">조건에 맞는 시험이 없어요.</div>'}
  <div class="home-foot">
    <b>정답 데이터</b>는 원본 PDF에 없어서, 시험마다 [정답 입력]에 한 번 넣어 주면 채점·오답 기록이 쌓입니다.<br>
    <b>기기 간 이어 풀기</b>는 상단 동기화 버튼에서 GitHub Gist를 연결하면 아이폰·아이패드·맥에서 같은 기록으로 이어집니다.
  </div>`;
}

function examCardHTML(e) {
  const s = peekSession(e.exam_id);
  const submitted = !!s?.submitted;
  const inProgress = !!s && !submitted && (Object.keys(s.answers || {}).length > 0 || (s.flags || []).length > 0 || currentElapsed(s) > 3000);
  const answered = s ? Object.keys(s.answers || {}).length : 0;
  const total = e.question_count;
  const hasKey = !!(store.answers[e.exam_id] && Object.keys(store.answers[e.exam_id]).length);
  const hasEditKey = Object.keys(store.edits[e.exam_id] || {}).some((k) => store.edits[e.exam_id][k]?.answer);
  const keyed = hasKey || hasEditKey;
  let score = null;
  if (submitted && keyed && s) {
    const qs = (EXAM_CACHE[e.exam_id]?.questions) || [];
    if (qs.length) {
      let c = 0, t = 0;
      for (const q of qs) {
        const k = store.answers[e.exam_id]?.[q.number] || store.edits[e.exam_id]?.[q.number]?.answer;
        if (k) { t++; if (s.answers?.[q.number] === Number(k)) c++; }
      }
      score = { c, t };
    }
  }
  const pct = Math.round((answered / total) * 100);
  const tags = [];
  tags.push(`<span class="tag ${e.year === 2023 ? 'year23' : ''}">${e.year}</span>`);
  if (!keyed) tags.push('<span class="tag warn">정답 미입력</span>');
  if (submitted) tags.push(`<span class="tag ok">채점 완료</span>`);

  let progress = '';
  if (submitted) {
    progress = `<div class="exam-progress"><div class="pbar ok"><i style="width:100%"></i></div>
      <div class="txt"><span>${score ? `정답 <b>${score.c}</b> / ${score.t}` : '정답을 입력하면 점수가 나와요'}</span><span>${answered}/${total} 응답</span></div></div>`;
  } else if (inProgress) {
    progress = `<div class="exam-progress"><div class="pbar"><i style="width:${pct}%"></i></div>
      <div class="txt"><span>${answered}/${total} 응답 (${pct}%)</span><span>남은 ${fmtClock(EXAM_LIMIT_MS - currentElapsed(s))}</span></div></div>`;
  }

  const actions = [];
  if (submitted) {
    actions.push(`<button class="btn btn-soft" data-act="result" data-exam="${e.exam_id}">답안 보기</button>`);
    actions.push(`<button class="btn btn-ghost btn-sm" data-act="start" data-exam="${e.exam_id}" data-fresh="1">다시 풀기</button>`);
  } else if (inProgress) {
    actions.push(`<button class="btn btn-primary" data-act="resume" data-exam="${e.exam_id}">이어 풀기</button>`);
    actions.push(`<button class="btn btn-ghost btn-sm" data-act="start" data-exam="${e.exam_id}" data-fresh="1">새로 풀기</button>`);
  } else {
    actions.push(`<button class="btn btn-primary" data-act="start" data-exam="${e.exam_id}">시작</button>`);
  }
  actions.push(`<button class="link-btn muted" data-act="keys" data-exam="${e.exam_id}">정답 입력</button>`);

  return `<div class="exam-card">
    <div class="exam-top">${tags.join('')}</div>
    <h3 class="exam-title">${esc(e.title)}</h3>
    <div class="exam-meta"><span>${total}문항</span><span class="sep">·</span><span>100분</span><span class="sep">·</span><span>그림 ${e.figure_count}장</span></div>
    ${progress}
    <div class="exam-actions">${actions.join('')}</div>
  </div>`;
}

/* ---------------- 시험 화면 ---------------- */
function examHTML() {
  const title = ui.isMini ? `틀린 문제 미니 퀴즈 · ${ui.exam.title}` : ui.exam.title;
  return `
  <header class="exam-head">
    <div class="exam-head-row">
      <button class="back-btn" data-act="back" aria-label="뒤로">${ICON.back}</button>
      <div class="exam-head-title">
        <div class="t">${esc(title)}</div>
        <div class="s" id="headSub">문제 1 / ${ui.order.length}</div>
      </div>
      <div class="timer-box">
        <div class="timer" id="timer">${fmtClock(remainingMs())}</div>
        <button class="pause-btn" id="pauseBtn" data-act="pause" aria-label="일시정지"></button>
        <button class="submit-btn" data-act="submit">제출</button>
      </div>
    </div>
  </header>
  <div class="qwrap">
    <div class="qcard" id="qcard"></div>
    <div class="nav-row">
      <button class="btn btn-ghost" data-act="prev">← 이전</button>
      <button class="btn btn-ghost" data-act="next">다음 →</button>
    </div>
  </div>
  <div class="bottom">
    <div class="bottom-inner">
      <div class="bottom-top">
        <span id="progTxt">0 / ${ui.order.length} 응답</span>
        <button class="omr-btn ${ui.omrOpen ? 'open' : ''}" id="omrBtn" data-act="omr">OMR 번호판 ${ICON.chevronUp}</button>
      </div>
      <div class="pbar"><i id="progFill" style="width:0%"></i></div>
    </div>
  </div>
  <div class="sheet-scrim ${ui.omrOpen ? 'show' : ''}" id="scrim" data-act="omr-close"></div>
  <div class="omr-sheet ${ui.omrOpen ? 'open' : ''}" id="omrSheet">
    <div class="omr-hdr"><span class="h">OMR 번호판</span><span class="badge" id="omrCount" style="background:var(--bg); color:var(--muted)"></span><div class="qbar-spacer"></div><button class="x-btn" data-act="omr-close">${ICON.close}</button></div>
    <div class="omr-tabs">
      <button class="omr-tab ${ui.omrFilter === 'all' ? 'on' : ''}" data-act="omr-filter" data-f="all">전체</button>
      <button class="omr-tab ${ui.omrFilter === 'unans' ? 'on' : ''}" data-act="omr-filter" data-f="unans">미응답</button>
      <button class="omr-tab ${ui.omrFilter === 'flag' ? 'on' : ''}" data-act="omr-filter" data-f="flag">마킹</button>
    </div>
    <div class="omr-grid" id="omrGrid"></div>
  </div>`;
}

function renderQuestionCard() {
  const card = $('#qcard');
  if (!card) return;
  const no = ui.order[ui.idx];
  const q = getQ(no);
  const s = ui.session;
  const sel = s.answers[no];
  const exc = s.excluded[no] || [];
  const flagged = s.flags.includes(no);
  const memo = s.notes[no] || '';
  const wc = wrongCount(no);
  const pages = (q.pages && q.pages.length ? q.pages : [q.page]).filter(Boolean);

  const figs = (q.figures || []).map((f) => `<img src="${esc(f.path)}" alt="문항 ${no} 그림" loading="lazy" decoding="async" data-fig>`).join('');

  const opts = q.options.map((o) => {
    const isSel = sel === o.no;
    const isExc = exc.includes(o.no);
    return `<div class="opt ${isSel ? 'sel' : ''} ${isExc ? 'exc' : ''}" data-act="pick" data-no="${o.no}">
      <span class="mk">${esc(o.marker || MARKERS[o.no - 1])}</span>
      <span class="ot">${esc(o.text)}</span>
      <button class="exc-btn" data-act="exclude" data-no="${o.no}">제외</button>
    </div>`;
  }).join('');

  card.innerHTML = `
    <div class="qbar">
      <span class="qno">문제 ${no} <span>/ ${ui.exam.question_count}</span></span>
      ${wc > 0 ? `<span class="badge wrong">누적 ${wc}회 오답</span>` : ''}
      ${memo ? '<span class="badge memo">메모</span>' : ''}
      <div class="qbar-spacer"></div>
      <button class="qtool ${flagged ? 'on' : ''}" data-act="flag" aria-label="마킹">${ICON.star}<span>마킹</span></button>
      <button class="qtool" data-act="calc" aria-label="계산기">${ICON.calc}<span>계산기</span></button>
      <button class="qtool" data-act="edit" aria-label="수정">${ICON.edit}<span>Edit</span></button>
      ${pages.length ? `<button class="qtool" data-act="page" data-page="${pages[0]}">${ICON.page}<span>원문 p.${pages[0]}</span></button>` : ''}
    </div>
    <div class="stem">${esc(q.stem)}</div>
    ${figs ? `<div class="figs">${figs}</div>` : ''}
    <div class="opts">${opts}</div>
    <div class="memo-line">
      <button class="link-btn" data-act="memo">${memo ? '메모 수정' : '+ 이 문제에 메모'}</button>
    </div>
    ${memo ? `<div class="memo-box">${esc(memo)}</div>` : ''}
  `;

  $('#headSub').textContent = `${ui.isMini ? '미니 퀴즈 ' : '문제 '}${ui.idx + 1} / ${ui.order.length}${ui.isMini ? ` · ${no}번` : ''}`;
  updateProgress();
  updateTimerUI();
}

function updateProgress() {
  const s = ui.session;
  const total = ui.order.length;
  const done = answeredCount(ui.order, s);
  const pct = total ? Math.round((done / total) * 100) : 0;
  const fill = $('#progFill');
  if (fill) fill.style.width = `${pct}%`;
  const txt = $('#progTxt');
  if (txt) txt.textContent = `${done} / ${total} 응답 (${pct}%)`;
  renderOMR();
}

function renderOMR() {
  const grid = $('#omrGrid');
  if (!grid) return;
  const s = ui.session;
  let list = ui.order.slice();
  if (ui.omrFilter === 'unans') list = list.filter((n) => !s.answers[n]);
  if (ui.omrFilter === 'flag') list = list.filter((n) => s.flags.includes(n));
  const cur = ui.order[ui.idx];
  if (!list.length) {
    grid.innerHTML = `<div class="omr-empty">${ui.omrFilter === 'flag' ? '마킹한 문제가 없어요. 문제 위 ☆를 눌러 표시해 두세요.' : '미응답 문제가 없어요.'}</div>`;
  } else {
    grid.innerHTML = list.map((n) => {
      const cls = ['omr-cell'];
      if (s.answers[n]) cls.push('ans');
      if (s.flags.includes(n)) cls.push('flag');
      if (n === cur) cls.push('cur');
      return `<button class="${cls.join(' ')}" data-act="jump" data-no="${n}">${n}</button>`;
    }).join('');
  }
  const cnt = $('#omrCount');
  if (cnt) cnt.textContent = `${answeredCount(ui.order, s)}/${ui.order.length}`;
}

function pickOption(no) {
  const qno = ui.order[ui.idx];
  const s = ui.session;
  if (s.answers[qno] === no) delete s.answers[qno];
  else s.answers[qno] = no;
  const exc = (s.excluded[qno] || []).filter((x) => x !== no);
  if (exc.length) s.excluded[qno] = exc; else delete s.excluded[qno];
  s.updatedAt = now();
  saveStore();
  // in-place update
  $$('#qcard .opt').forEach((el) => {
    el.classList.toggle('sel', Number(el.dataset.no) === s.answers[qno]);
    el.classList.remove('exc');
  });
  (s.excluded[qno] || []).forEach((n) => {
    const el = $(`#qcard .opt[data-no="${n}"]`);
    if (el) el.classList.add('exc');
  });
  updateProgress();
}

function toggleExclude(no) {
  const qno = ui.order[ui.idx];
  const s = ui.session;
  const list = s.excluded[qno] || [];
  if (list.includes(no)) s.excluded[qno] = list.filter((x) => x !== no);
  else s.excluded[qno] = [...list, no];
  if (s.excluded[qno].includes(no) && s.answers[qno] === no) delete s.answers[qno];
  if (!s.excluded[qno].length) delete s.excluded[qno];
  s.updatedAt = now();
  saveStore();
  const el = $(`#qcard .opt[data-no="${no}"]`);
  if (el) {
    el.classList.toggle('exc', (s.excluded[qno] || []).includes(no));
    el.classList.toggle('sel', s.answers[qno] === no);
  }
  updateProgress();
}

function toggleFlag() {
  const qno = ui.order[ui.idx];
  const s = ui.session;
  if (s.flags.includes(qno)) s.flags = s.flags.filter((n) => n !== qno);
  else s.flags.push(qno);
  s.updatedAt = now();
  saveStore();
  const btn = $('#qcard .qtool[data-act="flag"]');
  if (btn) btn.classList.toggle('on', s.flags.includes(qno));
  const badgeHost = $('#qcard .qbar');
  updateProgress();
}

function goTo(i) {
  ui.idx = clamp(i, 0, ui.order.length - 1);
  renderQuestionCard();
  const head = $('.exam-head');
  const top = window.scrollY + ($('#qcard')?.getBoundingClientRect().top || 0) - (head?.offsetHeight || 0) - 8;
  window.scrollTo({ top: Math.max(0, top), behavior: 'auto' });
}

/* ---------------- 타이머 ---------------- */
function startTimer() {
  stopTimer();
  if (!ui.session) return;
  if (!ui.session.lastTs || now() - ui.session.lastTs > 15 * 60 * 1000) ui.session.lastTs = now();
  ui.timer = setInterval(() => {
    updateTimerUI();
    if (now() - ui.lastSave > 5000 && ui.session && !ui.isMini) {
      ui.lastSave = now();
      commitElapsed(ui.session);
      ui.session.updatedAt = now();
      saveStore(true);
    }
    if (remainingMs() <= 0) {
      stopTimer();
      autoSubmit();
    }
  }, 500);
}
function stopTimer() {
  if (ui.timer) clearInterval(ui.timer);
  ui.timer = null;
}
function updateTimerUI(force) {
  const el = $('#timer');
  if (!el) return;
  const rem = remainingMs();
  el.textContent = fmtClock(rem);
  el.classList.toggle('warn', rem <= 10 * 60000 && rem > 60000);
  el.classList.toggle('danger', rem <= 60000);
  const btn = $('#pauseBtn');
  if (btn) {
    const running = ui.session?.running;
    btn.innerHTML = running ? ICON.pause : ICON.play;
    btn.setAttribute('aria-label', running ? '일시정지' : '재개');
    btn.style.color = running ? 'var(--muted)' : 'var(--brand)';
  }
  if (force !== false) {
    const sub = $('#headSub');
    if (sub) sub.textContent = `${ui.isMini ? '미니 퀴즈 ' : '문제 '}${ui.idx + 1} / ${ui.order.length}${ui.isMini ? ` · ${ui.order[ui.idx]}번` : ''}`;
  }
}

function togglePause() {
  const s = ui.session;
  if (!s) return;
  if (s.running) {
    commitElapsed(s);
    s.running = false;
    s.updatedAt = now();
    saveStore(true);
    toast('타이머를 일시정지했어요');
  } else {
    s.lastTs = now();
    s.running = true;
    s.updatedAt = now();
    saveStore(true);
    toast('타이머를 다시 시작했어요');
  }
  updateTimerUI();
}

/* ---------------- 제출 / 채점 ---------------- */
function confirmModal(opts) {
  return new Promise((resolve) => {
    const html = `<div class="modal" role="dialog" aria-modal="true">
      <div class="modal-hdr"><div class="modal-title">${esc(opts.title)}</div></div>
      <div class="hint" style="font-size:13.5px; color:var(--text); line-height:1.65">${opts.body || ''}</div>
      <div class="modal-actions">
        <button class="btn btn-ghost" data-act="confirm-no">${esc(opts.cancel || '취소')}</button>
        <button class="btn ${opts.danger ? 'btn-primary' : 'btn-primary'}" data-act="confirm-yes" style="${opts.danger ? 'background:var(--bad)' : ''}">${esc(opts.ok || '확인')}</button>
      </div>
    </div>`;
    openModal(html);
    const root = $('#modal-root');
    const done = (v) => { closeModal(); resolve(v); };
    root.querySelector('[data-act="confirm-no"]').onclick = () => done(false);
    root.querySelector('[data-act="confirm-yes"]').onclick = () => done(true);
  });
}

async function submitExam() {
  const s = ui.session;
  if (!s) return;
  const unanswered = ui.order.filter((n) => !s.answers[n]).length;
  if (unanswered > 0) {
    const ok = await confirmModal({
      title: `미응답 ${unanswered}문항이 있어요`,
      body: `그대로 제출할까요?<br><span style="color:var(--muted); font-size:12.5px">제출하면 채점 결과와 오답 기록이 남습니다.</span>`,
      ok: '제출하기',
    });
    if (!ok) return;
  }
  doSubmit(false);
}

function doSubmit(auto) {
  const s = ui.session;
  if (!s) return;
  commitElapsed(s);
  s.submitted = true;
  s.submittedAt = now();
  s.running = false;
  s.updatedAt = now();

  // 누적 오답 집계 (실제로 답을 고르고 틀린 문항만)
  if (!ui.isMini) {
    const st = (store.stats[ui.examId] = store.stats[ui.examId] || {});
    for (const n of ui.order) {
      const k = keyOf(n);
      const a = s.answers[n];
      if (!k || !a) continue;
      const rec = (st[n] = st[n] || { w: 0, c: 0 });
      if (a === k) rec.c = (rec.c || 0) + 1;
      else rec.w = (rec.w || 0) + 1;
    }
  }
  saveStore(true);
  stopTimer();

  ui.result = {
    examId: ui.examId,
    order: ui.order.slice(),
    session: s,
    isMini: ui.isMini,
    limitMs: ui.limitMs,
    cameFromMini: ui.cameFromResult || null,
  };
  ui.view = 'result';
  ui.resultFilter = 'all';
  render();
  window.scrollTo(0, 0);
  if (auto) toast('시험 시간이 끝나 자동 제출했어요', 3200);
}

function autoSubmit() {
  doSubmit(true);
}

/* ---------------- 결과 화면 ---------------- */
function resultStats() {
  const { order, session: s } = ui.result;
  let correct = 0, wrong = 0, skipped = 0, keyed = 0;
  for (const n of order) {
    const k = keyOf(n);
    const a = s.answers[n];
    if (k) keyed++;
    if (!a) skipped++;
    else if (k && a === k) correct++;
    else if (k) wrong++;
  }
  return { correct, wrong, skipped, keyed, total: order.length, flags: s.flags.filter((n) => order.includes(n)).length };
}

function resultHTML() {
  const r = ui.result;
  const st = resultStats();
  const hasKey = st.keyed > 0;
  const elapsed = currentElapsed(r.session);
  const pct = hasKey ? Math.round((st.correct / st.keyed) * 100) : 0;
  const grade = pct >= 90 ? '훌륭해요' : pct >= 70 ? '잘 하고 있어요' : pct >= 50 ? '조금 더 다듬어요' : '오답을 정리해 봐요';

  const wrongNos = r.order.filter((n) => isWrong(n, r.session));
  const filters = [
    { k: 'all', label: '전체', n: r.order.length },
    { k: 'correct', label: '정답', n: st.correct },
    { k: 'wrong', label: '틀린 문제', n: wrongNos.length },
    { k: 'flag', label: '마킹', n: st.flags },
  ];
  let list = r.order.slice();
  if (ui.resultFilter === 'correct') list = list.filter((n) => isCorrect(n, r.session));
  if (ui.resultFilter === 'wrong') list = list.filter((n) => isWrong(n, r.session));
  if (ui.resultFilter === 'flag') list = list.filter((n) => r.session.flags.includes(n));

  const cards = list.map((n) => resultCardHTML(n, r.session)).join('');

  return `
  <div class="result-head">
    <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px">
      <button class="back-btn" data-act="${r.isMini && r.cameFromMini ? 'mini-back' : 'back-result'}" aria-label="뒤로">${ICON.back}</button>
      <div style="flex:1; min-width:0">
        <div style="font-size:13.5px; font-weight:750; white-space:nowrap; overflow:hidden; text-overflow:ellipsis">${esc(r.isMini ? `미니 퀴즈 결과 · ${ui.exam.title}` : ui.exam.title)}</div>
        <div style="font-size:11.5px; color:var(--muted)">${r.session.submittedAt ? new Date(r.session.submittedAt).toLocaleString('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' 제출' : ''}</div>
      </div>
    </div>
    <div class="score-card">
      <div class="score-label">${hasKey ? '채점 결과' : '정답이 아직 없어요'}</div>
      ${hasKey ? `<div class="score-big">${st.correct}<small> / ${st.keyed}</small></div>
      <div class="score-pct">${pct}점 · ${grade}${st.keyed < r.order.length ? ` (정답 입력 ${st.keyed}/${r.order.length}문항)` : ''}</div>`
      : `<div class="score-big" style="font-size:26px; letter-spacing:-.6px">정답 입력이 필요해요</div>
         <div class="score-pct">정답을 넣으면 바로 채점하고 오답을 모아 드려요.</div>`}
      <div class="score-stats">
        <div class="stat ok"><div class="v">${st.correct}</div><div class="k">정답</div></div>
        <div class="stat bad"><div class="v">${st.wrong}</div><div class="k">틀린 문제</div></div>
        <div class="stat star"><div class="v">${st.flags}</div><div class="k">마킹</div></div>
      </div>
      <div class="score-stats" style="grid-template-columns:1fr 1fr; margin-top:8px">
        <div class="stat"><div class="v">${fmtDur(elapsed)}</div><div class="k">풀이 시간</div></div>
        <div class="stat"><div class="v">${st.skipped}</div><div class="k">미응답</div></div>
      </div>
      <div class="result-actions">
        ${wrongNos.length ? `<button class="btn btn-primary" data-act="mini">틀린 문제로 미니 퀴즈 (${wrongNos.length})</button>` : ''}
        ${!hasKey ? `<button class="btn btn-primary" data-act="keys" data-exam="${r.examId}">정답 입력하기</button>` : ''}
      </div>
      <div class="result-actions" style="margin-top:8px">
        <button class="btn btn-ghost btn-sm" data-act="start" data-exam="${r.examId}" data-fresh="1">같은 시험 다시 풀기</button>
        <button class="btn btn-ghost btn-sm" data-act="home">문제은행으로</button>
      </div>
    </div>
  </div>
  <div class="filter-tabs">
    ${filters.map((f) => `<button class="ftab ${ui.resultFilter === f.k ? 'on' : ''}" data-act="rfilter" data-f="${f.k}">${f.label}<span class="n">${f.n}</span></button>`).join('')}
  </div>
  ${cards || '<div class="emptystate">해당하는 문항이 없어요.</div>'}
  <div style="height:24px"></div>`;
}

function resultCardHTML(no, s) {
  const q = getQ(no);
  const k = keyOf(no);
  const a = s.answers[no];
  const state = !k ? 'nokey' : !a ? 'skip' : a === k ? 'correct' : 'wrong';
  const flagged = s.flags.includes(no);
  const memo = s.notes[no] || '';
  const wc = wrongCount(no);
  const open = !!ui.expanded[no];
  const label = state === 'correct' ? '<span class="badge" style="background:var(--ok-weak); color:var(--ok)">정답</span>'
    : state === 'wrong' ? '<span class="badge" style="background:var(--bad-weak); color:var(--bad)">틀림</span>'
    : state === 'skip' ? '<span class="badge" style="background:var(--bg); color:var(--muted)">미응답</span>'
    : '<span class="badge" style="background:var(--star-weak); color:#a2710b">정답 미입력</span>';

  const opts = q.options.map((o) => {
    const isKey = k === o.no;
    const isMineBad = a === o.no && state === 'wrong';
    const cls = ['ropt'];
    if (isKey) cls.push('is-key');
    if (isMineBad) cls.push('is-mine-bad');
    const mine = a === o.no ? '<span class="tagmine">내 답</span>' : '';
    const keyTag = isKey ? '<span class="tagmine">정답</span>' : '';
    return `<div class="${cls.join(' ')}"><span class="m">${esc(o.marker || MARKERS[o.no - 1])}</span><span>${esc(o.text)}</span>${mine || keyTag}</div>`;
  }).join('');

  return `<div class="rcard ${state === 'correct' ? 'correct' : state === 'wrong' ? 'wrong' : 'skip'}">
    <div class="rhead">
      <span class="rno">${no}번</span>
      ${label}
      ${wc > 0 ? `<span class="badge wrong">누적 ${wc}회 오답</span>` : ''}
      ${flagged ? `<span class="badge" style="background:var(--star-weak); color:#a2710b">★ 마킹</span>` : ''}
      ${memo ? '<span class="badge memo">메모</span>' : ''}
    </div>
    <div class="rstem ${open ? 'open' : ''}">${esc(q.stem)}</div>
    <button class="rstem-more" data-act="expand" data-no="${no}">${open ? '접기' : '문제 전체 보기'}</button>
    ${(q.figures || []).length ? `<div class="figs">${q.figures.map((f) => `<img src="${esc(f.path)}" alt="문항 ${no} 그림" loading="lazy" decoding="async" data-fig>`).join('')}</div>` : ''}
    <div class="ropts">${opts}</div>
    ${memo ? `<div class="memo-box" style="margin-top:10px">${esc(memo)}</div>` : ''}
    <div class="rfoot">
      <span style="font-size:12.5px; color:var(--muted)">내 답 <b style="color:var(--text)">${a ? esc(MARKERS[a - 1]) : '없음'}</b> · 정답 <b style="color:${k ? 'var(--ok)' : 'var(--muted)'}">${k ? esc(MARKERS[k - 1]) : '미입력'}</b></span>
      <button class="ai-btn" data-act="ai" data-no="${no}">AI 분석</button>
    </div>
  </div>`;
}

function aiPrompt(no) {
  const q = getQ(no);
  const k = keyOf(no);
  const a = ui.result.session.answers[no];
  const wc = wrongCount(no);
  const lines = [];
  lines.push(`[문제] ${ui.exam.title} ${no}번`);
  lines.push('');
  lines.push(q.stem);
  lines.push('');
  lines.push('[선지]');
  q.options.forEach((o) => lines.push(`${o.marker || MARKERS[o.no - 1]} ${o.text}`));
  lines.push('');
  lines.push(`[내 답] ${a ? `${MARKERS[a - 1]} ${q.options[a - 1]?.text || ''}` : '미응답'}`);
  lines.push(`[정답] ${k ? `${MARKERS[k - 1]} ${q.options[k - 1]?.text || ''}` : '모름'}`);
  if (wc > 0) lines.push(`[메모] 이 문제를 ${wc}번 틀렸어요.`);
  lines.push('');
  lines.push('임상의학종합평가(임종평) 대비 중이야. 한국어로 간결하게 알려 줘.');
  lines.push('1) 정답인 이유 (근거 조항·수치·기전 포함)');
  lines.push('2) 각 오답 선지가 왜 틀렸는지 한 줄씩');
  lines.push('3) 이 문제에서 반드시 외워야 할 핵심 포인트 한두 개');
  return lines.join('\n');
}

/* ---------------- 미니 퀴즈 ---------------- */
function startMini() {
  const r = ui.result;
  const wrongNos = r.order.filter((n) => isWrong(n, r.session));
  if (!wrongNos.length) { toast('틀린 문제가 없어요'); return; }
  const limit = Math.max(60 * 1000, Math.round((EXAM_LIMIT_MS * wrongNos.length) / (ui.exam.question_count || 80)));
  const s = newSession();
  ui.cameFromResult = r;
  ui.isMini = true;
  ui.session = s;
  ui.order = wrongNos;
  ui.idx = 0;
  ui.limitMs = limit;
  ui.view = 'exam';
  ui.omrFilter = 'all';
  render();
  toast(`틀린 ${wrongNos.length}문항 · 제한시간 ${Math.round(limit / 60000)}분`, 3000);
}

/* ---------------- 모달 ---------------- */
function openModal(innerHTML) {
  const root = $('#modal-root');
  root.innerHTML = `<div class="modal-scrim" data-act="modal-away">${innerHTML}</div>`;
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  const root = $('#modal-root');
  if (!root) return;
  if (root.dataset.dirty === '1') { root.dataset.dirty = '0'; }
  root.innerHTML = '';
  document.body.style.overflow = '';
  ui.calc = null;
}
function modalShell(title, body, sub) {
  return `<div class="modal" role="dialog" aria-modal="true">
    <div class="modal-hdr">
      <div><div class="modal-title">${esc(title)}</div>${sub ? `<div class="modal-sub">${sub}</div>` : ''}</div>
      <button class="x-btn" data-act="modal-close" aria-label="닫기">${ICON.close}</button>
    </div>
    ${body}
  </div>`;
}

/* ----- 계산기 ----- */
function calcHTML() {
  const c = ui.calc || (ui.calc = { expr: '', result: '0', done: false });
  const keys = [
    ['C', 'fn'], ['←', 'fn'], ['%', 'op'], ['÷', 'op'],
    ['7', ''], ['8', ''], ['9', ''], ['×', 'op'],
    ['4', ''], ['5', ''], ['6', ''], ['−', 'op'],
    ['1', ''], ['2', ''], ['3', ''], ['+', 'op'],
    ['0', ''], ['.', ''], ['00', ''], ['=', 'eq'],
  ];
  return `<div class="modal calc" role="dialog">
    <div class="modal-hdr"><div class="modal-title">계산기</div><button class="x-btn" data-act="modal-close">${ICON.close}</button></div>
    <div class="calc-display" id="calcDisplay">${esc(c.result)}</div>
    <div class="calc-expr" id="calcExpr">${esc(c.expr)}</div>
    <div class="calc-keys">
      ${keys.map(([k, cls]) => `<button class="calc-key ${cls}" data-act="calc-key" data-k="${esc(k)}">${esc(k)}</button>`).join('')}
    </div>
  </div>`;
}
function openCalc() {
  ui.calc = { expr: '', result: '0', done: false };
  openModal(calcHTML());
}
function evalExpr(expr) {
  const clean = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/%/g, '/100');
  if (!/^[-+*/().\d\s]*$/.test(clean)) return null;
  try {
    const v = Function(`"use strict";return (${clean || 0})`)();
    if (typeof v !== 'number' || !isFinite(v)) return null;
    return Math.round(v * 1e10) / 1e10;
  } catch (e) { return null; }
}
function calcKey(k) {
  const c = ui.calc;
  if (!c) return;
  if (k === 'C') { c.expr = ''; c.result = '0'; c.done = false; }
  else if (k === '←') { c.expr = c.expr.slice(0, -1); c.result = evalExpr(c.expr) ?? c.result; c.done = false; }
  else if (k === '=') {
    const v = evalExpr(c.expr);
    if (v == null) { c.result = '오류'; }
    else { c.result = String(v); c.expr = c.expr; c.done = true; }
  } else {
    if (c.done && /[0-9.]/.test(k)) { c.expr = ''; c.done = false; }
    if (c.done && /[+\-−×÷%]/.test(k)) c.done = false;
    c.expr += k;
    if (!/[+\-−×÷%]$/.test(c.expr)) {
      const v = evalExpr(c.expr);
      if (v != null) c.result = String(v);
    }
  }
  const d = $('#calcDisplay'), e = $('#calcExpr');
  if (d) d.textContent = c.result;
  if (e) e.textContent = c.expr;
}

/* ----- 문항 수정 ----- */
function openEdit() {
  const no = ui.order[ui.idx];
  const q = getQ(no);
  const k = keyOf(no);
  const body = `
    <div class="field"><label>지문</label><textarea id="editStem" rows="7">${esc(q.stem)}</textarea></div>
    ${q.options.map((o, i) => `<div class="field"><label>선지 ${esc(o.marker || MARKERS[i])}</label><input type="text" id="editOpt${i}" value="${esc(o.text)}"></div>`).join('')}
    <div class="field"><label>정답</label>
      <select id="editAnswer">
        <option value="">정답 없음</option>
        ${q.options.map((o) => `<option value="${o.no}" ${k === o.no ? 'selected' : ''}>${esc(o.marker || MARKERS[o.no - 1])} ${esc(o.text.slice(0, 24))}</option>`).join('')}
      </select>
    </div>
    <div class="hint">여기서 고친 내용은 이 기기에 저장되고, 동기화하면 다른 기기에도 함께 반영됩니다.</div>
    <div class="modal-actions">
      <button class="btn btn-ghost" data-act="edit-reset" data-no="${no}">원래대로</button>
      <button class="btn btn-primary" data-act="edit-save" data-no="${no}">저장</button>
    </div>`;
  openModal(modalShell(`문항 ${no} 수정`, body, esc(ui.exam.title)));
}
function saveEdit(no) {
  const stem = $('#editStem').value;
  const options = $$('[id^="editOpt"]').map((el) => el.value);
  const answer = $('#editAnswer').value ? Number($('#editAnswer').value) : null;
  const base = ui.exam.questions.find((q) => q.number === no);
  const changed = stem !== base.stem || options.some((t, i) => t !== base.options[i].text) || (answer && answer !== (store.answers[ui.examId]?.[no] || null));
  const box = (store.edits[ui.examId] = store.edits[ui.examId] || {});
  if (!changed) {
    delete box[no];
  } else {
    box[no] = { stem, options, answer, updatedAt: now() };
  }
  store.updatedAt = now();
  saveStore(true);
  closeModal();
  if (ui.view === 'exam') renderQuestionCard();
  else render();
  toast('문항을 저장했어요');
}
function resetEdit(no) {
  if (store.edits[ui.examId]) delete store.edits[ui.examId][no];
  saveStore(true);
  closeModal();
  if (ui.view === 'exam') renderQuestionCard(); else render();
  toast('원래 문항으로 되돌렸어요');
}

/* ----- 메모 ----- */
function openMemo() {
  const no = ui.order[ui.idx];
  const cur = ui.session.notes[no] || '';
  const body = `<div class="field"><label>메모</label><textarea id="memoText" rows="5" placeholder="예: 2회차에도 틀림 · 형평성/효율성 구분">${esc(cur)}</textarea></div>
    <div class="modal-actions">
      <button class="btn btn-ghost" data-act="memo-del">삭제</button>
      <button class="btn btn-primary" data-act="memo-save">저장</button>
    </div>`;
  openModal(modalShell(`문제 ${no} 메모`, body));
  setTimeout(() => $('#memoText')?.focus(), 120);
}

/* ----- 원문 페이지 ----- */
function openPage(p) {
  const no = ui.order[ui.idx];
  const q = getQ(no);
  const pages = (q.pages && q.pages.length ? q.pages : [q.page]).filter(Boolean);
  const i = Math.max(0, pages.indexOf(p));
  const body = `
    <div class="page-view" id="pageView"><img src="pages/${ui.examId}/p${String(p).padStart(3, '0')}.webp" alt="원문 ${p}쪽" id="pageImg"></div>
    <div class="page-nav">
      <button class="btn btn-ghost btn-sm" data-act="page-prev" ${i <= 0 ? 'disabled' : ''}>← 이전 쪽</button>
      <div class="lbl">${p}쪽 / 전체 ${ui.exam.source?.pages || '?'}쪽</div>
      <button class="btn btn-ghost btn-sm" data-act="page-next" ${i >= pages.length - 1 ? 'disabled' : ''}>다음 쪽 →</button>
    </div>
    <div class="modal-actions">
      <button class="btn btn-ghost btn-sm" data-act="page-zoom">원문 확대</button>
      <button class="btn btn-primary btn-sm" data-act="modal-close">닫기</button>
    </div>`;
  ui.pageInfo = { no, pages, i, p };
  openModal(`<div class="modal page-modal" role="dialog">${modalHead(`원문 ${p}쪽`, `문제 ${no}`)}${body}</div>`);
}
function modalHead(title, sub) {
  return `<div class="modal-hdr"><div><div class="modal-title">${esc(title)}</div>${sub ? `<div class="modal-sub">${esc(sub)}</div>` : ''}</div><button class="x-btn" data-act="modal-close">${ICON.close}</button></div>`;
}
function pageStep(dir) {
  const info = ui.pageInfo;
  if (!info) return;
  const ni = clamp(info.i + dir, 0, info.pages.length - 1);
  openPage(info.pages[ni]);
}

/* ----- 정답 입력 ----- */
function parseAnswers(raw, count) {
  const circIdx = (ch) => { const i = '①②③④⑤'.indexOf(ch); return i >= 0 ? i + 1 : null; };
  const text = String(raw || '').replace(/\r/g, '\n');
  const out = new Array(count).fill(null);
  const hasPairs = /\d{1,3}\s*[.)．｡]\s*[1-5①-⑤]/.test(text);
  if (hasPairs) {
    const re = /(\d{1,3})\s*[.)．｡]\s*([1-5①-⑤])/g;
    let m;
    while ((m = re.exec(text))) {
      const n = Number(m[1]);
      const a = circIdx(m[2]) || Number(m[2]);
      if (n >= 1 && n <= count && a >= 1 && a <= 5) out[n - 1] = a;
    }
    return { answers: out, mode: 'pair' };
  }
  const seq = (text.replace(/[①②③④⑤]/g, (ch) => ' ' + circIdx(ch) + ' ').match(/[1-5]/g) || []);
  seq.slice(0, count).forEach((d, i) => { out[i] = Number(d); });
  return { answers: out, mode: 'seq' };
}

function openKeys(examId, after) {
  const cur = store.answers[examId] || {};
  const prefill = Object.keys(cur).length
    ? Object.entries(cur).sort((a, b) => a[0] - b[0]).map(([n, a]) => `${n}. ${MARKERS[a - 1]}`).join('\n')
    : '';
  const body = `
    <div class="field">
      <label>정답 ${(INDEX?.exams || []).find((e) => e.exam_id === examId)?.question_count || 80}개</label>
      <textarea id="keyText" rows="7" placeholder="1. ③&#10;2. ①&#10;3. ⑤ ...  또는  3 1 5 2 4 ...">${esc(prefill)}</textarea>
      <div class="hint">1번부터 순서대로 들어갑니다. <b>1. ③</b> 처럼 번호를 붙여도 되고, <b>3 1 5 2 4</b> 처럼 숫자만 줄줄이 넣어도 됩니다.</div>
    </div>
    <div id="keyPreview"></div>
    <div class="modal-actions">
      <button class="btn btn-ghost" data-act="keys-clear">비우기</button>
      <button class="btn btn-primary" data-act="keys-save" data-exam="${examId}">저장</button>
    </div>`;
  openModal(modalShell('정답 일괄 입력', body, esc((INDEX?.exams || []).find((e) => e.exam_id === examId)?.title || '')));
  const ta = $('#keyText');
  const upd = () => {
    const count = (INDEX?.exams || []).find((e) => e.exam_id === examId)?.question_count || 80;
    const { answers, mode } = parseAnswers(ta.value, count);
    const n = answers.filter(Boolean).length;
    const cells = answers.map((a, i) => `<div class="key-cell ${a ? 'set' : ''}">${a ? MARKERS[a - 1] : i + 1}</div>`).join('');
    $('#keyPreview').innerHTML = `<div class="key-preview">${cells}</div><div class="key-count"><b>${n}</b> / ${count}문항 인식 (${mode === 'pair' ? '번호 붙인 형식' : '순서 나열'})</div>`;
    ui.keyParsed = answers;
  };
  ta.addEventListener('input', upd);
  if (ta.value) upd();
  else $('#keyPreview').innerHTML = '<div class="key-count">정답을 붙여넣으면 미리보기가 나와요.</div>';
  ui.keyExamId = examId;
  ui.keyAfter = after || null;
}
function saveKeys(examId) {
  const count = (INDEX?.exams || []).find((e) => e.exam_id === examId)?.question_count || 80;
  const { answers } = parseAnswers($('#keyText').value, count);
  const obj = {};
  answers.forEach((a, i) => { if (a) obj[i + 1] = a; });
  store.answers[examId] = obj;
  store.answerRev[examId] = now();
  store.updatedAt = now();
  saveStore(true);
  closeModal();
  const n = Object.keys(obj).length;
  render();
  toast(`정답 ${n}문항을 저장했어요`, 2800);
}

/* ----- 동기화 ----- */
function localPayload() {
  const { settings, ...rest } = store;
  return { ...rest, app: 'munjeloop', exportedAt: now() };
}

function openSync() {
  const g = store.settings;
  const body = `
    <div class="sync-status" id="syncStatus">
      마지막 저장 <b>${fmtAgo(store.updatedAt)}</b>${g.lastSync ? ` · 마지막 동기화 <b>${fmtAgo(g.lastSync)}</b>` : ''}${g.gistId ? '' : ' · 아직 Gist를 연결하지 않았어요'}
    </div>
    <div class="switch-row">
      <div class="lbl">자동 동기화<div class="sub">켜면 앱을 열 때 최신 기록을 먼저 가져오고, 바뀐 내용을 Gist에 올립니다.</div></div>
      <button class="switch ${g.autoSync ? 'on' : ''}" data-act="toggle-auto" aria-label="자동 동기화"></button>
    </div>
    <div class="sep-line"></div>
    <div class="field"><label>GitHub Personal Access Token (gist 권한)</label>
      <input type="password" id="gistToken" value="${esc(g.gistToken || '')}" placeholder="ghp_... 또는 github_pat_..." autocomplete="off">
      <div class="hint">토큰은 이 기기 브라우저에만 저장되고 Gist 내용에는 들어가지 않습니다. GitHub → Settings → Developer settings → Tokens 에서 <b>gist</b> 권한만 주면 됩니다.</div>
    </div>
    <div class="field"><label>Gist ID</label>
      <input type="text" id="gistId" value="${esc(g.gistId || '')}" placeholder="비워 두고 [새 Gist 만들기]를 눌러도 됩니다" autocomplete="off">
    </div>
    <div class="row2">
      <button class="btn btn-ghost btn-sm" data-act="gist-create">새 Gist 만들기</button>
      <button class="btn btn-ghost btn-sm" data-act="gist-pull">가져오기 (Pull)</button>
    </div>
    <div class="modal-actions">
      <button class="btn btn-primary" data-act="gist-push">지금 올리기 (Push)</button>
    </div>
    <div class="sep-line"></div>
    <div class="hint" style="margin-bottom:10px">Gist 없이도 파일로 옮길 수 있어요. 아이패드에서 내보낸 파일을 아이폰에서 열면 됩니다.</div>
    <div class="row2">
      <button class="btn btn-ghost btn-sm" data-act="export-json">JSON 백업 내보내기</button>
      <button class="btn btn-ghost btn-sm" data-act="import-json">JSON 가져오기</button>
    </div>
    <input type="file" id="importFile" accept="application/json,.json" style="display:none">
    <div class="hint">기록은 이 브라우저(localStorage)에 자동 저장됩니다. 브라우저 캐시를 지우면 사라지니 가끔 JSON으로 백업해 두세요.</div>`;
  openModal(modalShell('기기 간 동기화', body, '아이폰 · 아이패드 · 맥에서 같은 기록으로 이어 풀기'));
}

async function gistAPI(method, path, body, token) {
  const res = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch (e) { data = null; }
  if (!res.ok) {
    const msg = data?.message || res.status;
    throw new Error(`${res.status} ${msg}`);
  }
  return data;
}
function gistFields() {
  const token = ($('#gistToken')?.value || store.settings.gistToken || '').trim();
  const id = ($('#gistId')?.value || store.settings.gistId || '').trim();
  store.settings.gistToken = token;
  store.settings.gistId = id;
  saveStore(true);
  return { token, id };
}
let PUSHING = false;
async function gistPush(silent) {
  const { token, id } = gistFields();
  if (!token) { toast('Personal Access Token을 먼저 넣어 주세요'); return; }
  if (PUSHING) return;
  PUSHING = true;
  const status = $('#syncStatus');
  if (status && !silent) status.innerHTML = '<span class="spinner"></span> 올리는 중…';
  try {
    const payload = localPayload();
    const content = JSON.stringify(payload, null, 1);
    let res;
    if (id) {
      res = await gistAPI('PATCH', `/gists/${id}`, {
        description: '문제루프 풀이 기록 (자동 생성)',
        files: { 'munjeloop.json': { content } },
      }, token);
    } else {
      res = await gistAPI('POST', '/gists', {
        description: '문제루프 풀이 기록 (자동 생성)',
        public: false,
        files: { 'munjeloop.json': { content } },
      }, token);
      store.settings.gistId = res.id;
      if ($('#gistId')) $('#gistId').value = res.id;
    }
    store.settings.lastSync = now();
    store.settings.lastPush = now();
    saveStore(true);
    if (!silent) {
      toast(`Gist에 올렸어요 (${res.id.slice(0, 8)}…)`);
      const s = $('#syncStatus');
      if (s) s.innerHTML = `마지막 동기화 <b>방금</b> · <a href="${res.html_url}" target="_blank" rel="noopener">Gist 열기</a>`;
    }
  } catch (e) {
    if (!silent) {
      toast(`올리지 못했어요: ${e.message}`, 4200);
      const s = $('#syncStatus');
      if (s) s.innerHTML = `올리지 못했어요 · <b>${esc(e.message)}</b>`;
    }
  } finally {
    PUSHING = false;
  }
}
async function gistPull(silent) {
  const { token, id } = gistFields();
  if (!token) { if (!silent) toast('Personal Access Token을 먼저 넣어 주세요'); return; }
  if (!id) { if (!silent) toast('Gist ID가 필요해요'); return; }
  const status = $('#syncStatus');
  if (status && !silent) status.innerHTML = '<span class="spinner"></span> 가져오는 중…';
  try {
    const data = await gistAPI('GET', `/gists/${id}`, null, token);
    const file = data.files?.['munjeloop.json'] || Object.values(data.files || {})[0];
    let remote = null;
    if (file?.content) remote = JSON.parse(file.content);
    else if (file?.raw_url) remote = await (await fetch(file.raw_url)).json();
    if (!remote || typeof remote !== 'object') throw new Error('Gist에 기록이 없어요');
    const merged = mergeStores(store, remote);
    merged.settings = store.settings;
    merged.settings.lastSync = now();
    merged.settings.lastPull = now();
    store = merged;
    saveStore(true);
    if (ui.view === 'home') render();
    else if (ui.view === 'exam') { ui.session = store.sessions[ui.examId] || ui.session; renderQuestionCard(); }
    if (!silent) {
      toast('Gist에서 기록을 가져왔어요');
      const s = $('#syncStatus');
      if (s) s.innerHTML = `가져옴 <b>방금</b> · 마지막 저장 <b>${fmtAgo(store.updatedAt)}</b>`;
    }
  } catch (e) {
    if (!silent) {
      toast(`가져오지 못했어요: ${e.message}`, 4200);
      const s = $('#syncStatus');
      if (s) s.innerHTML = `가져오지 못했어요 · <b>${esc(e.message)}</b>`;
    }
  }
}

let autoPushTimer = null;
function scheduleAutoPush() {
  const g = store.settings;
  if (!g.autoSync || !g.gistToken || !g.gistId) return;
  if (PUSHING) return;
  clearTimeout(autoPushTimer);
  autoPushTimer = setTimeout(() => gistPush(true), 4000);
}

function exportJSON() {
  const blob = new Blob([JSON.stringify(localPayload(), null, 1)], { type: 'application/json' });
  const d = new Date();
  const name = `munjeloop-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}.json`;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  toast('백업 파일을 내려받았어요');
}

function importJSON(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result));
      if (!data || typeof data !== 'object') throw new Error('형식이 달라요');
      const merged = mergeStores(store, data);
      merged.settings = store.settings;
      store = merged;
      saveStore(true);
      render();
      toast('기록을 가져왔어요');
    } catch (e) {
      toast(`가져오지 못했어요: ${e.message}`, 4000);
    }
  };
  reader.readAsText(file);
}

/* ---------------- 이벤트 ---------------- */
document.addEventListener('click', async (e) => {
  const el = e.target.closest('[data-act]');
  if (!el) return;
  const act = el.dataset.act;
  const examId = el.dataset.exam;

  switch (act) {
    case 'reload': location.reload(); break;
    case 'home': ui.view = 'home'; ui.result = null; ui.session = null; ui.isMini = false; render(); break;
    case 'year': ui.filterYear = el.dataset.year; render(); break;

    case 'start': {
      const fresh = el.dataset.fresh === '1';
      const prev = peekSession(examId);
      if (fresh && prev && Object.keys(prev.answers || {}).length && !prev.submitted) {
        const ok = await confirmModal({ title: '새로 풀까요?', body: '지금까지 푼 답안과 메모가 이 시험에서 지워집니다.<br><span style="color:var(--muted); font-size:12.5px">오답 누적 기록은 그대로 남아요.</span>', ok: '새로 풀기' });
        if (!ok) break;
      }
      await openExam(examId, { fresh });
      break;
    }
    case 'resume': await openExam(examId, { fresh: false }); break;
    case 'result': await openResult(examId); break;

    case 'back': {
      if (ui.isMini && ui.cameFromResult) {
        // 미니 퀴즈 도중 나가기
        const s = ui.session;
        commitElapsed(s);
        s.running = false;
        ui.result = ui.cameFromResult;
        ui.isMini = false;
        ui.cameFromResult = null;
        ui.view = 'result';
        ui.exam = await getExam(ui.result.examId);
        ui.examId = ui.result.examId;
        render();
      } else {
        if (ui.session && !ui.isMini) { commitElapsed(ui.session); ui.session.updatedAt = now(); saveStore(true); }
        ui.view = 'home'; ui.session = null; ui.isMini = false; ui.result = null; render();
      }
      break;
    }
    case 'back-result': ui.view = 'home'; ui.result = null; render(); break;
    case 'mini-back':
      if (ui.result?.cameFromMini) {
        ui.result = ui.result.cameFromMini;
        ui.isMini = false;
        render();
        window.scrollTo(0, 0);
      } else { ui.view = 'home'; ui.result = null; render(); }
      break;

    case 'pick': pickOption(Number(el.dataset.no)); break;
    case 'exclude': e.stopPropagation(); toggleExclude(Number(el.dataset.no)); break;
    case 'flag': toggleFlag(); break;
    case 'memo': openMemo(); break;
    case 'calc': openCalc(); break;
    case 'edit': openEdit(); break;
    case 'page': openPage(Number(el.dataset.page)); break;
    case 'page-prev': pageStep(-1); break;
    case 'page-next': pageStep(1); break;
    case 'page-zoom': $('#pageImg')?.classList.toggle('wide'); break;

    case 'prev': goTo(ui.idx - 1); break;
    case 'next': goTo(ui.idx + 1); break;
    case 'jump': goTo(ui.order.indexOf(Number(el.dataset.no))); break;
    case 'pause': togglePause(); break;
    case 'submit': await submitExam(); break;
    case 'omr': ui.omrOpen = !ui.omrOpen; $('#omrSheet')?.classList.toggle('open', ui.omrOpen); el.classList.toggle('open', ui.omrOpen); $('#scrim')?.classList.toggle('show', ui.omrOpen); renderOMR(); break;
    case 'omr-close': ui.omrOpen = false; $('#omrSheet')?.classList.remove('open'); $('#scrim')?.classList.remove('show'); $('#omrBtn')?.classList.remove('open'); break;
    case 'omr-filter': ui.omrFilter = el.dataset.f; $$('.omr-tab').forEach((t) => t.classList.toggle('on', t.dataset.f === ui.omrFilter)); renderOMR(); break;

    case 'rfilter': ui.resultFilter = el.dataset.f; render(); break;
    case 'expand': ui.expanded[el.dataset.no] = !ui.expanded[el.dataset.no]; render(); break;
    case 'mini': startMini(); break;
    case 'ai': {
      const ok = await copyText(aiPrompt(Number(el.dataset.no)));
      toast(ok ? '분석 요청문을 복사했어요. ChatGPT·Claude에 붙여넣어 주세요.' : '복사에 실패했어요. 길게 눌러 직접 복사해 주세요.', 3400);
      break;
    }

    case 'keys': openKeys(examId || ui.result?.examId || ui.examId); break;
    case 'keys-clear': { const t = $('#keyText'); if (t) { t.value = ''; t.dispatchEvent(new Event('input')); } break; }
    case 'keys-save': saveKeys(el.dataset.exam); break;

    case 'edit-save': saveEdit(Number(el.dataset.no)); break;
    case 'edit-reset': resetEdit(Number(el.dataset.no)); break;

    case 'memo-save': {
      const no = ui.order[ui.idx];
      const v = $('#memoText').value.trim();
      if (v) ui.session.notes[no] = v; else delete ui.session.notes[no];
      ui.session.updatedAt = now();
      saveStore();
      closeModal();
      renderQuestionCard();
      toast(v ? '메모를 저장했어요' : '메모를 지웠어요');
      break;
    }
    case 'memo-del': {
      const no = ui.order[ui.idx];
      delete ui.session.notes[no];
      saveStore();
      closeModal();
      renderQuestionCard();
      toast('메모를 지웠어요');
      break;
    }

    case 'calc-key': calcKey(el.dataset.k); break;

    case 'open-sync': openSync(); break;
    case 'toggle-auto': {
      const gistFieldsNow = ($('#gistToken')?.value || '').trim();
      if (gistFieldsNow) store.settings.gistToken = gistFieldsNow;
      const gid = ($('#gistId')?.value || '').trim();
      if (gid) store.settings.gistId = gid;
      store.settings.autoSync = !store.settings.autoSync;
      saveStore(true);
      el.classList.toggle('on', store.settings.autoSync);
      toast(store.settings.autoSync ? '자동 동기화를 켰어요' : '자동 동기화를 껐어요');
      break;
    }
    case 'gist-create': await gistPush(false); break;
    case 'gist-push': await gistPush(false); break;
    case 'gist-pull': await gistPull(false); break;
    case 'export-json': exportJSON(); break;
    case 'import-json': $('#importFile')?.click(); break;

    case 'modal-close': closeModal(); break;
    case 'modal-away': if (e.target === el) closeModal(); break;
    default: break;
  }
});

document.addEventListener('change', (e) => {
  if (e.target.id === 'importFile' && e.target.files?.[0]) importJSON(e.target.files[0]);
});

document.addEventListener('input', (e) => {
  if (e.target.id === 'searchInput') {
    ui.q = e.target.value;
    renderHomeList();
  }
});

function renderHomeList() {
  const screen = $('#screen');
  if (!screen || ui.view !== 'home') return;
  const scroll = window.scrollY;
  const focused = document.activeElement?.id === 'searchInput';
  screen.innerHTML = homeHTML();
  window.scrollTo(0, scroll);
  if (focused) {
    const inp = $('#searchInput');
    if (inp) { inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); }
  }
}

// 그림 확대
document.addEventListener('click', (e) => {
  const img = e.target.closest('.figs img');
  if (!img) return;
  if (img.classList.contains('zoom')) { img.classList.remove('zoom'); return; }
  img.classList.add('zoom');
  img.addEventListener('click', function off(ev) { img.classList.remove('zoom'); img.removeEventListener('click', off); }, { once: true });
});

// 키보드
document.addEventListener('keydown', (e) => {
  if ($('#modal-root')?.children.length) {
    if (e.key === 'Escape') closeModal();
    if (ui.calc && /^[0-9+\-*/.]$/.test(e.key)) { calcKey(e.key === '*' ? '×' : e.key === '/' ? '÷' : e.key); }
    if (ui.calc && e.key === 'Enter') calcKey('=');
    if (ui.calc && e.key === 'Backspace') calcKey('←');
    return;
  }
  if (ui.view !== 'exam' || !ui.session) return;
  if (e.target.matches('input, textarea, select')) return;
  if (/^[1-5]$/.test(e.key)) pickOption(Number(e.key));
  if (e.key === 'ArrowRight') goTo(ui.idx + 1);
  if (e.key === 'ArrowLeft') goTo(ui.idx - 1);
  if (e.key === 'f' || e.key === 'F') toggleFlag();
});

// 탭 전환 시 타이머 정리
document.addEventListener('visibilitychange', () => {
  if (!ui.session || ui.isMini) return;
  if (document.hidden) {
    if (ui.session.running) { commitElapsed(ui.session); ui.session.running = false; ui.session._wasRunning = true; ui.session.updatedAt = now(); saveStore(true); }
  } else if (ui.session._wasRunning) {
    ui.session.running = true;
    ui.session.lastTs = now();
    ui.session._wasRunning = false;
    updateTimerUI();
  }
});
window.addEventListener('pagehide', () => {
  if (ui.session && !ui.isMini) { commitElapsed(ui.session); ui.session.updatedAt = now(); saveStore(true); }
});

/* ---------------- 시험 열기 / 결과 열기 ---------------- */
async function openExam(examId, opts = {}) {
  const exam = await getExam(examId);
  ui.exam = exam;
  ui.examId = examId;
  ui.isMini = false;
  ui.cameFromResult = null;
  let s = store.sessions[examId];
  if (!s || opts.fresh) {
    s = newSession();
    store.sessions[examId] = s;
  } else {
    if (s.running && !s.submitted) {
      const gap = now() - s.lastTs;
      if (gap > 15 * 60 * 1000) s.lastTs = now();
      s.lastTs = now();
    }
  }
  s.updatedAt = now();
  ui.session = s;
  ui.order = exam.questions.map((q) => q.number);
  ui.idx = Math.max(0, ui.order.findIndex((n) => !s.answers[n]));
  if (ui.idx < 0) ui.idx = 0;
  ui.limitMs = EXAM_LIMIT_MS;
  ui.omrFilter = 'all';
  ui.view = 'exam';
  saveStore(true);
  render();
  if (!hasAnyKey()) setTimeout(() => toast('정답이 아직 없어요. [정답 입력]에 넣으면 채점과 오답 기록이 쌓여요.', 3600), 500);
}

async function openResult(examId) {
  const exam = await getExam(examId);
  const s = store.sessions[examId];
  if (!s || !s.submitted) { toast('아직 제출한 기록이 없어요'); return; }
  ui.exam = exam;
  ui.examId = examId;
  ui.isMini = false;
  ui.result = { examId, order: exam.questions.map((q) => q.number), session: s, isMini: false, limitMs: EXAM_LIMIT_MS };
  ui.resultFilter = 'all';
  ui.view = 'result';
  render();
  window.scrollTo(0, 0);
}

/* ---------------- 부트 ---------------- */
async function boot() {
  store = loadStore();
  const screen = $('#screen');
  screen.innerHTML = '<div class="loading-screen"><span class="spinner"></span><span>문제은행을 불러오는 중…</span></div>';
  try {
    await getIndex();
    // 미리 로드: 카드에 점수·진행률 표시용
    await Promise.all((INDEX.exams || []).map((e) => getExam(e.exam_id).catch(() => null)));
  } catch (e) {
    BOOT_ERROR = e.message;
  }
  if (store.settings.autoSync && store.settings.gistToken && store.settings.gistId) {
    gistPull(true);
  }
  ui.view = 'home';
  render();
}

boot();
