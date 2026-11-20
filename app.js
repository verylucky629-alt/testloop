'use strict';
/* ============================================================
   문제 트레이너 — 임종평 문제은행 + 스파르타 타이머 (정적 웹앱)
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
  gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.56V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.1-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.56-1H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10 3.04V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9v.09a1.7 1.7 0 0 0 1.56 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51.91z"/></svg>',
  timer: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9 2.5h6"/></svg>',
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
  return { v: 1, updatedAt: 0, answers: {}, answerRev: {}, sessions: {}, stats: {}, edits: {}, topicEdits: {}, analyses: [], settings: {} };
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
  out.topicEdits = Object.assign({}, local.topicEdits);
  for (const ex of Object.keys(remote.topicEdits || {})) {
    out.topicEdits[ex] = Object.assign({}, out.topicEdits[ex] || {});
    for (const q of Object.keys(remote.topicEdits[ex])) {
      const a = out.topicEdits[ex][q], b = remote.topicEdits[ex][q];
      if (!a || (b?.updatedAt || 0) > (a?.updatedAt || 0)) out.topicEdits[ex][q] = b;
    }
  }
  const analyses = new Map();
  for (const a of [...(local.analyses || []), ...(remote.analyses || [])]) {
    if (!a || !a.id) continue;
    const prev = analyses.get(a.id);
    if (!prev || (a.savedAt || 0) >= (prev.savedAt || 0)) analyses.set(a.id, a);
  }
  out.analyses = Array.from(analyses.values()).sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0)).slice(0, 6);
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
  if (!EXAM_CACHE[id]) {
    EXAM_CACHE[id] = await fetchJSON(`data/${id}.json`);
    seedAnswerKeys(id, EXAM_CACHE[id]);
  }
  return EXAM_CACHE[id];
}
/* 시험 JSON에 실린 정답을 정답표에 채운다(이미 넣은 값은 그대로 둔다). */
function seedAnswerKeys(id, exam) {
  if (!exam || !Array.isArray(exam.questions)) return;
  const box = store.answers[id] || (store.answers[id] = {});
  let added = false;
  for (const q of exam.questions) {
    if (q.answer && !box[q.number]) {
      box[q.number] = Number(q.answer);
      added = true;
    }
  }
  if (added) saveStore(true);
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
  analysisTab: 'mine',
  analysisScope: 'all',
  analysisLevel: 'subject',
  analysisOpen: {},
  pasteText: '',
  pasteName: '',
  pasteRows: null,
  pasteSkipped: 0,
  pasteSavedId: null,
  topicEditExam: null,
  topicEditNo: 1,
  cameFromAnalysis: false,
  qStart: 0,
  qStartNo: null,
};

function newSession() {
  const t = now();
  return {
    answers: {}, excluded: {}, flags: [], notes: {}, times: {},
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
/* 정답이 하나로 정해지지 않는 문항(모두 정답·복수 정답·채점 제외) */
function keyInfo(no) {
  const q = (ui.exam?.questions || []).find((x) => x.number === no);
  if (!q) return null;
  if (q.excluded) return { kind: 'excluded' };
  if (q.answerAll) return { kind: 'all' };
  if (Array.isArray(q.answers) && q.answers.length) return { kind: 'set', set: q.answers.map(Number) };
  return null;
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
  const a = (s || ui.session).answers[no];
  if (!a) return false;
  const ki = keyInfo(no);
  if (ki?.kind === 'excluded' || ki?.kind === 'all') return false;
  if (ki?.kind === 'set') return !ki.set.includes(Number(a));
  const k = keyOf(no);
  return !!k && a !== k;
}
function isCorrect(no, s) {
  const a = (s || ui.session).answers[no];
  if (!a) return false;
  const ki = keyInfo(no);
  if (ki?.kind === 'excluded') return false;
  if (ki?.kind === 'all') return true;
  if (ki?.kind === 'set') return ki.set.includes(Number(a));
  const k = keyOf(no);
  return !!k && a === k;
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
  } else if (ui.view === 'etc') {
    screen.className = 'screen';
    screen.innerHTML = etcHTML();
  } else if (ui.view === 'analysis') {
    screen.className = 'screen';
    screen.innerHTML = analysisHTML();
  } else {
    screen.className = 'screen no-bottom';
    screen.innerHTML = homeHTML();
  }
  closeModal();
  updateSpartaUI();
}

function homeHTML() {
  if (BOOT_ERROR) {
    return `<div class="home-head"><div class="logo">${ICON.sync}</div><div><div class="home-title">문제 트레이너</div></div></div>
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
      <div class="home-title">문제 트레이너</div>
      <div class="home-sub">자체 2차·대경 임종평 ${exams.length}회 · ${exams.reduce((a, e) => a + (e.question_count || 0), 0).toLocaleString()}문항</div>
    </div>
    <div class="head-spacer"></div>
    <button class="icon-btn" data-act="open-sync" aria-label="동기화">${ICON.sync}${syncOn ? '<span class="dot"></span>' : ''}</button>
  </div>
  ${spartaCardHTML()}
  <div class="search-wrap">
    <div class="search">${ICON.search}<input id="searchInput" type="search" placeholder="시험 이름으로 찾기 (예: 2025 2교시)" value="${esc(ui.q)}" autocomplete="off"></div>
  </div>
  <div class="chips">
    <button class="chip ${ui.filterYear === 'all' ? 'on' : ''}" data-act="year" data-year="all">전체 ${exams.length}</button>
    ${years.map((y) => `<button class="chip ${ui.filterYear === String(y) ? 'on' : ''}" data-act="year" data-year="${y}">${y}년 ${exams.filter((e) => e.year === y).length}</button>`).join('')}
  </div>
  <div id="examList">${cards || '<div class="emptystate">조건에 맞는 시험이 없어요.</div>'}</div>
  <div class="home-foot">
    <b>정답</b>은 문제에 실린 정답표로 자동으로 채워져요. 정답이 없는 시험은 [정답 입력]에 한 번만 넣으면 채점·오답 기록이 쌓입니다.<br>
    <b>기기 간 이어 풀기</b>는 상단 동기화 버튼에서 GitHub Gist를 연결하면 아이폰·아이패드·맥에서 같은 기록으로 이어집니다.
  </div>
  ${tabbarHTML('home')}`;
}

function examCardHTML(e) {
  const s = peekSession(e.exam_id);
  const submitted = !!s?.submitted;
  const inProgress = !!s && !submitted && (Object.keys(s.answers || {}).length > 0 || (s.flags || []).length > 0 || currentElapsed(s) > 3000);
  const answered = s ? Object.keys(s.answers || {}).length : 0;
  const total = e.question_count;
  const hasKey = !!(store.answers[e.exam_id] && Object.keys(store.answers[e.exam_id]).length);
  const hasEditKey = Object.keys(store.edits[e.exam_id] || {}).some((k) => store.edits[e.exam_id][k]?.answer);
  const localKeyCount = Object.keys(store.answers[e.exam_id] || {}).filter((n) => store.answers[e.exam_id][n]).length;
  const editKeyCount = Object.keys(store.edits[e.exam_id] || {}).filter((n) => store.edits[e.exam_id][n]?.answer).length;
  const keyCount = Math.min(total, Math.max(e.answer_count || 0, localKeyCount, editKeyCount));
  const keyed = keyCount > 0 || hasKey || hasEditKey;
  let score = null;
  if (submitted && keyed && s) {
    const qs = (EXAM_CACHE[e.exam_id]?.questions) || [];
    if (qs.length) {
      let c = 0, t = 0;
      for (const q of qs) {
        if (q.excluded) continue;
        const k = store.answers[e.exam_id]?.[q.number] || store.edits[e.exam_id]?.[q.number]?.answer;
        const set = Array.isArray(q.answers) ? q.answers.map(Number) : null;
        const all = !!q.answerAll;
        if (!k && !set && !all) continue;
        t++;
        const mine = s.answers?.[q.number];
        if (!mine) continue;
        if (all || (set ? set.includes(Number(mine)) : Number(mine) === Number(k))) c++;
      }
      score = { c, t };
    }
  }
  const pct = Math.round((answered / total) * 100);
  const tags = [];
  tags.push(`<span class="tag ${e.year === 2023 ? 'year23' : ''}">${e.year}</span>`);
  tags.push(keyCount > 0
    ? `<span class="tag key-on">정답 ${keyCount}/${total}</span>`
    : '<span class="tag key-off">정답 없음</span>');
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
  const title = ui.isMini ? `${ui.quizLabel ? ui.quizLabel + ' 복습' : '틀린 문제 미니 퀴즈'} · ${ui.exam.title}` : ui.exam.title;
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

function resetQClock() {
  ui.qStart = now();
  ui.qStartNo = ui.order?.[ui.idx] ?? null;
}
function flushQTime() {
  const s = ui.session;
  if (!s || !ui.qStart || ui.qStartNo == null) return;
  const dt = clamp(now() - ui.qStart, 0, 10 * 60 * 1000);
  if (dt > 400) {
    s.times = s.times || {};
    s.times[ui.qStartNo] = (s.times[ui.qStartNo] || 0) + dt;
  }
  ui.qStart = now();
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
  resetQClock();
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

function closeOmr() {
  ui.omrOpen = false;
  $('#omrSheet')?.classList.remove('open');
  $('#scrim')?.classList.remove('show');
  $('#omrBtn')?.classList.remove('open');
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
  flushQTime();
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
    flushQTime();
    commitElapsed(s);
    s.running = false;
    s.updatedAt = now();
    saveStore(true);
    toast('타이머를 일시정지했어요');
  } else {
    s.lastTs = now();
    s.running = true;
    ui.qStart = now();
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
  flushQTime();
  commitElapsed(s);
  s.submitted = true;
  s.submittedAt = now();
  s.running = false;
  s.updatedAt = now();

  // 누적 오답 집계 (실제로 답을 고르고 틀린 문항만)
  if (!ui.isMini) {
    const st = (store.stats[ui.examId] = store.stats[ui.examId] || {});
    for (const n of ui.order) {
      const ki = keyInfo(n);
      const a = s.answers[n];
      if (!a || ki?.kind === 'excluded') continue;
      if (!keyOf(n) && !ki) continue;
      const rec = (st[n] = st[n] || { w: 0, c: 0 });
      if (isCorrect(n, s)) rec.c = (rec.c || 0) + 1;
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
    const ki = keyInfo(n);
    if (ki?.kind === 'excluded') continue;
    const k = keyOf(n);
    const a = s.answers[n];
    if (k || ki) keyed++;
    if (!a) skipped++;
    else if (isCorrect(n, s)) correct++;
    else if (k || ki) wrong++;
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
  const ki = keyInfo(no);
  const k = keyOf(no);
  const known = !!(k || ki);
  const kLabel = ki?.kind === 'all' ? '전부 정답'
    : ki?.kind === 'set' ? ki.set.map((x) => MARKERS[x - 1]).join('·')
    : ki?.kind === 'excluded' ? '채점 제외'
    : k ? esc(MARKERS[k - 1]) : '';
  const a = s.answers[no];
  const state = ki?.kind === 'excluded' ? 'excl'
    : !known ? 'nokey' : !a ? 'skip' : isCorrect(no, s) ? 'correct' : 'wrong';
  const flagged = s.flags.includes(no);
  const memo = s.notes[no] || '';
  const wc = wrongCount(no);
  const open = !!ui.expanded[no];
  const label = state === 'correct' ? '<span class="badge" style="background:var(--ok-weak); color:var(--ok)">정답</span>'
    : state === 'wrong' ? '<span class="badge" style="background:var(--bad-weak); color:var(--bad)">틀림</span>'
    : state === 'excl' ? '<span class="badge" style="background:var(--bg); color:var(--muted)">채점 제외</span>'
    : state === 'skip' ? '<span class="badge" style="background:var(--bg); color:var(--muted)">미응답</span>'
    : '<span class="badge" style="background:var(--star-weak); color:#a2710b">정답 미입력</span>';

  const opts = q.options.map((o) => {
    const isKey = ki?.kind === 'set' ? ki.set.includes(o.no) : k === o.no;
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
      <span style="font-size:12.5px; color:var(--muted)">내 답 <b style="color:var(--text)">${a ? esc(MARKERS[a - 1]) : '없음'}</b> · 정답 <b style="color:${known ? 'var(--ok)' : 'var(--muted)'}">${known ? (kLabel || '미입력') : '미입력'}</b></span>
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
        description: '문제 트레이너 풀이 기록 (자동 생성)',
        files: { 'munjeloop.json': { content } },
      }, token);
    } else {
      res = await gistAPI('POST', '/gists', {
        description: '문제 트레이너 풀이 기록 (자동 생성)',
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

/* ============================================================
   기타 · 토픽·약점 분석
   ============================================================ */
let TOPICS = null;
async function getTopics() {
  if (TOPICS) return TOPICS;
  try { TOPICS = await fetchJSON('data/topics.json'); } catch (e) { TOPICS = { map: {} }; }
  return TOPICS;
}
function baseTopic(eid, no) {
  const t = TOPICS?.map?.[eid]?.[String(no)];
  return t ? { s: t.s, t: t.t } : { s: '미분류', t: '미분류' };
}
function topicOf(eid, no) {
  const e = store.topicEdits?.[eid]?.[no];
  return e ? { s: e.s, t: e.t } : baseTopic(eid, no);
}
function examShort(eid) {
  const m = examMeta(eid);
  return m ? (m.short || `${m.year} ${m.course}교시`) : eid;
}
function keyOfExam(eid, no) {
  const e = store.edits?.[eid]?.[no];
  if (e && e.answer) return Number(e.answer);
  const a = store.answers?.[eid]?.[no];
  return a ? Number(a) : null;
}
function rateClass(rate) { return rate >= 80 ? 'good' : rate >= 60 ? 'mid' : 'low'; }

/* ----- 내 기록 집계 ----- */
function analyzeMine(scope) {
  const exams = (INDEX?.exams || []).filter((e) => scope === 'all' || e.exam_id === scope);
  const items = [];
  const examRows = [];
  const noKey = [];
  for (const meta of exams) {
    const eid = meta.exam_id;
    const exam = EXAM_CACHE[eid];
    const s = store.sessions?.[eid];
    if (!exam || !s || !s.submitted) continue;
    let keyed = 0, correct = 0;
    for (const q of exam.questions) {
      const k = keyOfExam(eid, q.number);
      if (!k) continue;
      keyed++;
      const a = s.answers?.[q.number] || null;
      const ok = !!a && a === k;
      if (ok) correct++;
      const tt = topicOf(eid, q.number);
      items.push({
        eid, no: q.number, key: k, ans: a, ok,
        wrong: !!a && a !== k, skip: !a,
        flag: (s.flags || []).includes(q.number),
        time: (s.times && s.times[q.number]) || 0,
        s: tt.s, t: tt.t,
      });
    }
    if (keyed) examRows.push({ eid, keyed, correct });
    else noKey.push(eid);
  }
  return { items, examRows, noKey };
}

function aggItems(items, level) {
  const map = new Map();
  for (const it of items) {
    const name = level === 'subject' ? it.s : it.t;
    const key = level === 'subject' ? it.s : `${it.s}|${it.t}`;
    let g = map.get(key);
    if (!g) { g = { key, name, subject: it.s, n: 0, correct: 0, wrong: 0, skip: 0, flag: 0, qs: [] }; map.set(key, g); }
    g.n++;
    if (it.ok) g.correct++;
    if (it.wrong) g.wrong++;
    if (it.skip) g.skip++;
    if (it.flag) g.flag++;
    if (it.wrong || it.skip || it.flag) g.qs.push(it);
  }
  const rows = Array.from(map.values());
  rows.forEach((r) => { r.rate = r.n ? Math.round((r.correct / r.n) * 100) : 0; });
  return rows.sort((a, b) => a.rate - b.rate || b.n - a.n);
}

function weakHighlights(items) {
  const out = [];
  const missed = items.filter((i) => i.wrong || i.skip);
  if (!missed.length) {
    const flagged = items.filter((i) => i.flag).length;
    out.push(flagged ? `오답·미응답은 없어요. 마킹한 <b>${flagged}문항</b>만 다시 보면 충분해요` : '이번 범위는 오답·미응답·마킹이 모두 없어요');
    return out;
  }
  const subs = aggItems(items, 'subject').filter((r) => r.n >= 5 && (r.wrong > 0 || r.skip > 0));
  if (subs.length) {
    const w = subs[0];
    out.push(`<b>${esc(w.name)}</b>가 가장 약해요. ${w.n}문항 중 ${w.correct}개 정답 (${w.rate}%)`);
  }
  const tops = aggItems(items, 'topic').filter((r) => r.n >= 3);
  const conc = tops.slice().sort((a, b) => (b.wrong + b.flag) - (a.wrong + a.flag))[0];
  if (conc && conc.wrong + conc.flag >= 2) {
    out.push(`<b>${esc(conc.subject)} · ${esc(conc.name)}</b>에 오답 ${conc.wrong} · 마킹 ${conc.flag}이 몰렸어요`);
  }
  const skipped = items.filter((i) => i.skip).length;
  if (skipped) out.push(`미응답 <b>${skipped}문항</b>. 시간 배분만 잡아도 바로 오를 구간이에요`);
  const timed = items.filter((i) => i.time > 0);
  if (timed.length >= 5) {
    const avg = timed.reduce((s, i) => s + i.time, 0) / timed.length;
    const long = timed.filter((i) => i.time >= Math.max(90000, avg * 2)).length;
    const rush = timed.filter((i) => i.wrong && i.time <= 15000).length;
    const parts = [];
    if (long) parts.push(`평균 ${Math.round(avg / 1000)}초보다 2배 넘게 걸린 문항 ${long}개`);
    if (rush) parts.push(`15초 안에 틀린 문항 ${rush}개(성급한 오답)`);
    if (parts.length) out.push(parts.join(' · '));
  } else if (items.length) {
    out.push('문항별 소요 시간은 다음 응시부터 함께 쌓여요');
  }
  return out;
}

function reviewQs(items) {
  const byExam = new Map();
  for (const it of items) {
    if (!(it.wrong || it.skip || it.flag)) continue;
    if (!byExam.has(it.eid)) byExam.set(it.eid, []);
    byExam.get(it.eid).push(it.no);
  }
  return byExam;
}

/* ----- 공통 조각 ----- */
function tabbarHTML(active) {
  return `<nav class="tabbar"><div class="tabbar-inner">
    <button class="tab ${active === 'home' ? 'on' : ''}" data-act="nav-home">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="M4 5.5h7v6H4zM13 5.5h7v6h-7zM4 13.5h7v5H4zM13 13.5h7v5h-7z"/></svg>
      <span>문제은행</span></button>
    <button class="tab ${active === 'etc' ? 'on' : ''}" data-act="nav-etc">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/></svg>
      <span>기타</span></button>
  </div></nav>`;
}

function etcHTML() {
  const stats = (INDEX?.exams || []).length;
  const submitted = (INDEX?.exams || []).filter((e) => store.sessions?.[e.exam_id]?.submitted).length;
  return `
  <div class="etc-head">
    <div class="home-title">기타</div>
    <div class="home-sub">스파르타 타이머와 분석 도구</div>
  </div>
  <div class="section-label">공부</div>
  ${spartaCardHTML()}
  <div class="section-label">분석</div>
  <button class="etc-row primary" data-act="open-analysis">
    <span class="ic brand">${ICON.grid}</span>
    <span class="tx"><b>토픽·약점 분석</b><small>내 풀이 기록과 다른 시험의 문항별 분석표로 약한 과목·단원 찾기</small></span>
    <span class="ar">${ICON.chevronRight}</span>
  </button>
  <div class="section-label">기록</div>
  <button class="etc-row" data-act="open-sync">
    <span class="ic">${ICON.sync}</span>
    <span class="tx"><b>기기 간 동기화</b><small>Gist 연결 · JSON 백업/가져오기</small></span>
    <span class="ar">${ICON.chevronRight}</span>
  </button>
  <div class="etc-row static">
    <span class="ic">${ICON.page}</span>
    <span class="tx"><b>문제은행</b><small>자체 2차 임종평 ${stats}회 · 640문항 · 제출 ${submitted}회</small></span>
  </div>
  <div class="etc-foot">
    문항의 과목·단원은 지문 키워드로 자동 분류한 값이에요. 분석 화면에서 문항별로 고칠 수 있고, 고친 값은 이 기기(동기화하면 다른 기기)에 저장됩니다.
  </div>
  ${tabbarHTML('etc')}`;
}

/* ----- 분석 화면 ----- */
function analysisHTML() {
  const tab = ui.analysisTab;
  return `
  <div class="an-head">
    <button class="back-btn" data-act="etc-back" aria-label="뒤로">${ICON.back}</button>
    <div><div class="an-title">토픽·약점 분석</div><div class="an-sub">내 기록과 외부 분석표</div></div>
  </div>
  <div class="seg">
    <button class="seg-b ${tab === 'mine' ? 'on' : ''}" data-act="an-tab" data-t="mine">내 기록</button>
    <button class="seg-b ${tab === 'paste' ? 'on' : ''}" data-act="an-tab" data-t="paste">분석표 붙여넣기</button>
  </div>
  ${tab === 'mine' ? analysisMineHTML() : analysisPasteHTML()}
  ${tabbarHTML('etc')}`;
}

function analysisMineHTML() {
  const scope = ui.analysisScope;
  const { items, examRows, noKey } = analyzeMine(scope);
  const chips = (INDEX?.exams || []).map((e) => {
    const s = store.sessions?.[e.exam_id];
    const done = !!s?.submitted;
    const hasKey = !!e.has_answers || (e.answer_count || 0) > 0 || Object.keys(store.answers?.[e.exam_id] || {}).length > 0 || Object.keys(store.edits?.[e.exam_id] || {}).some((k) => store.edits[e.exam_id][k]?.answer);
    return `<button class="chip ${scope === e.exam_id ? 'on' : ''} ${done ? '' : 'dim'}" data-act="an-scope" data-scope="${e.exam_id}">${esc(e.short || `${e.year} ${e.course}교시`)}${done ? '' : ' · 미응시'}${done && !hasKey ? ' · 정답없음' : ''}</button>`;
  }).join('');
  const head = `
  <div class="chips" style="padding-left:14px; padding-right:14px">
    <button class="chip ${scope === 'all' ? 'on' : ''}" data-act="an-scope" data-scope="all">전체</button>
    ${chips}
  </div>`;

  if (!items.length) {
    return `${head}
    <div class="an-card">
      <div class="emptystate" style="padding:22px 8px">
        ${examRows.length ? '아직 분석할 기록이 없어요.' : '제출한 시험이 없어요.'}<br>
        <small style="font-size:12.5px">시험을 풀고 제출하면 과목·단원별 정답률이 여기에 쌓입니다.<br>정답을 입력한 시험만 채점 대상에 들어가요.</small>
      </div>
      <button class="btn btn-soft btn-block" data-act="an-tab" data-t="paste">다른 시험 분석표 붙여넣기</button>
    </div>`;
  }

  const correct = items.filter((i) => i.ok).length;
  const wrong = items.filter((i) => i.wrong).length;
  const skip = items.filter((i) => i.skip).length;
  const flag = items.filter((i) => i.flag).length;
  const rate = Math.round((correct / items.length) * 100);
  const rows = aggItems(items, ui.analysisLevel);
  const hl = weakHighlights(items);

  const summary = `
  <div class="an-card">
    <div class="an-sum-top"><span>채점 ${items.length}문항</span><span class="an-rate ${rateClass(rate)}">${rate}%</span></div>
    <div class="anbar big"><i class="${rateClass(rate)}" style="width:${rate}%"></i></div>
    <div class="an-stats">
      <div><b>${correct}</b><span>정답</span></div>
      <div><b class="bad">${wrong}</b><span>오답</span></div>
      <div><b class="star">${flag}</b><span>마킹</span></div>
      <div><b class="muted">${skip}</b><span>미응답</span></div>
    </div>
    ${noKey.length ? `<div class="an-note">정답이 입력되지 않아 빠진 시험: ${noKey.map((id) => esc(examShort(id))).join(', ')}</div>` : ''}
  </div>`;

  const hlHTML = hl.length ? `<div class="an-card hl"><div class="hl-title">약점 하이라이트</div><ul>${hl.map((x) => `<li>${x}</li>`).join('')}</ul></div>` : '';

  const seg = `<div class="an-toggle">
    <button class="${ui.analysisLevel === 'subject' ? 'on' : ''}" data-act="an-level" data-l="subject">과목별</button>
    <button class="${ui.analysisLevel === 'topic' ? 'on' : ''}" data-act="an-level" data-l="topic">단원별</button>
    <span class="an-hint">정답률 낮은 순</span>
  </div>`;

  const rowHTML = rows.map((r) => {
    const key = `${ui.analysisLevel}:${r.key}`;
    const open = !!ui.analysisOpen[key];
    const groups = open ? reviewQs(r.qs) : new Map();
    const more = open ? `<div class="anrow-more">
      ${groups.size ? Array.from(groups.entries()).map(([eid, nos]) => `
        <div class="an-group">
          <div class="an-group-top"><span>${esc(examShort(eid))}</span>
            <button class="link-btn" data-act="topic-edit-open" data-exam="${eid}" data-no="${nos[0]}">분류 수정</button>
            <button class="btn btn-primary btn-sm" data-act="quiz" data-exam="${eid}" data-nos="${nos.join(',')}" data-label="${esc(r.subject)} ${esc(r.name)}">복습 ${nos.length}</button></div>
          <div class="qchips">${nos.map((n) => `<button class="qchip ${r.qs.find((q) => q.eid === eid && q.no === n)?.wrong ? 'bad' : ''}" data-act="jumpq" data-exam="${eid}" data-no="${n}">${n}</button>`).join('')}</div>
        </div>`).join('') : '<div class="an-note">복습할 문항이 없어요.</div>'}
    </div>` : '';
    return `<div class="anrow">
      <button class="anrow-main" data-act="an-open" data-key="${esc(key)}">
        <div class="anrow-top">
          <span class="anrow-name">${ui.analysisLevel === 'topic' ? `<small>${esc(r.subject)}</small> ` : ''}${esc(r.name)}</span>
          <span class="an-rate ${rateClass(r.rate)}">${r.rate}%</span>
        </div>
        <div class="anbar"><i class="${rateClass(r.rate)}" style="width:${r.rate}%"></i></div>
        <div class="anrow-meta"><span>${r.n}문항</span><span>정답 ${r.correct}</span><span class="bad">오답 ${r.wrong}</span><span class="star">마킹 ${r.flag}</span>${r.skip ? `<span>미응답 ${r.skip}</span>` : ''}</div>
      </button>
      ${more}
    </div>`;
  }).join('');

  return `${head}${summary}${hlHTML}${seg}<div class="an-list">${rowHTML}</div>
  <div class="an-tools">
    <button class="link-btn" data-act="topic-edit-open">문항 과목·단원 수정</button>
  </div>`;
}

/* ----- 외부 문항별 분석표 ----- */
const SUBJECT_ALIAS = {
  '의료법규': '의료법규', '법규': '의료법규', '의료법': '의료법규', '보건의약법규': '의료법규',
  '예방의학': '예방의학', '예방': '예방의학',
  '내과': '내과', '내과학': '내과',
  '산부인과': '산부인과', '산과': '산부인과', '부인과': '산부인과',
  '소아과': '소아과', '소아청소년과': '소아과', '소아': '소아과',
  '외과': '외과', '일반외과': '외과',
  '정신과': '정신의학', '정신건강의학과': '정신의학', '정신의학': '정신의학',
  '신경과': '신경과', '신경외과': '신경외과',
  '피부과': '피부과', '이비인후과': '이비인후과', '안과': '안과',
  '비뇨의학과': '비뇨의학과', '비뇨기과': '비뇨의학과',
  '정형외과': '정형외과', '응급의학과': '응급의학', '응급의학': '응급의학',
  '마취통증의학과': '마취·중환자', '마취과': '마취·중환자',
  '가정의학과': '가정의학', '영상의학과': '영상의학', '병리과': '병리·검사',
};

function toSec(tok) {
  let m;
  if ((m = tok.match(/^(\d+):(\d{1,2})$/))) return +m[1] * 60 + +m[2];
  if ((m = tok.match(/^(\d+)\s*분\s*(\d+)?\s*초?$/))) return +m[1] * 60 + (+m[2] || 0);
  if ((m = tok.match(/^(\d+)\s*초$/))) return +m[1];
  if ((m = tok.match(/^(\d+)\s*분$/))) return +m[1] * 60;
  return null;
}

function parsePasteLine(toks) {
  let no = null, ok = null, pct = null, rest = [];
  const times = [];
  for (const raw of toks) {
    const t = String(raw).replace(/,/g, '').trim();
    if (!t) continue;
    const noMatch = t.match(/^(\d{1,3})\s*(번|\.|\))?$/);
    if (no === null && noMatch && +noMatch[1] >= 1 && +noMatch[1] <= 300 && times.length === 0 && pct === null && ok === null) { no = +noMatch[1]; continue; }
    if (ok === null) {
      if (['O', '○', '◯', '✓', '✔', 'V', '정답', '맞음', '정'].includes(t.toUpperCase())) { ok = true; continue; }
      if (['X', '×', '✗', '✘', '오답', '틀림', '틀'].includes(t.toUpperCase())) { ok = false; continue; }
    }
    const sec = toSec(t);
    if (sec !== null && times.length < 2) { times.push(sec); continue; }
    if (ok !== null && times.length < 2 && rest.length === 0 && /^\d{1,3}$/.test(t) && +t <= 600) { times.push(+t); continue; }
    if (pct === null && /^\d{1,3}(\.\d+)?%$/.test(t)) { pct = parseFloat(t); continue; }
    if (pct === null && times.length >= 1 && rest.length === 0 && /^\d{1,3}(\.\d+)?$/.test(t) && +t <= 100) { pct = +t; continue; }
    rest.push(t);
  }
  if (no === null || ok === null) return null;
  let subject = '기타', topic = '';
  if (rest.length) {
    subject = SUBJECT_ALIAS[rest[0]] || rest[0];
    topic = rest.slice(1).join(' ');
  }
  return { no, ok, mySec: times[0] ?? 0, avgSec: times[1] ?? 0, pct: pct == null ? null : pct, subject, topic };
}

function parsePasteVertical(raw) {
  const cells = String(raw || '').replace(/\r/g, '').split(/\n|\t/).map((t) => t.trim()).filter(Boolean)
    .filter((t) => !/^[?★☆✎🔖]+$/.test(t));
  const rows = [];
  for (let i = 0; i < cells.length; i++) {
    if (!/^\d{1,3}$/.test(cells[i])) continue;
    const r = parsePasteLine(cells.slice(i, i + 7));
    if (r) rows.push(r);
  }
  return rows;
}

function parsePaste(raw) {
  const lines = String(raw || '').replace(/\r/g, '').split('\n');
  let rows = [];
  let skipped = 0;
  for (let line of lines) {
    line = line.trim();
    if (!line) continue;
    if (!/^\d/.test(line) && (/번호|결과|정답률|평균\s*시간|과목|단원/.test(line) || /(^|[,\t])\s*(no|ok|pct|avg|subject|topic)\s*([,\t]|$)/i.test(line))) continue;
    let toks;
    if (line.includes('\t')) toks = line.split('\t');
    else if ((line.match(/,/g) || []).length >= 4) toks = line.split(',');
    else toks = line.split(/\s{2,}|\s+/);
    toks = toks.map((t) => t.trim()).filter(Boolean).filter((t) => !/^[?★☆✎🔖]+$/.test(t));
    const row = parsePasteLine(toks);
    if (row) rows.push(row); else skipped++;
  }
  if (!rows.length) {
    const vertical = parsePasteVertical(raw);
    if (vertical.length) rows = vertical;
  }
  const seen = new Set();
  const out = [];
  for (const r of rows) { if (seen.has(r.no)) continue; seen.add(r.no); out.push(r); }
  out.sort((a, b) => a.no - b.no);
  return { rows: out, skipped };
}

function groupPaste(rows, key) {
  const map = new Map();
  for (const r of rows) {
    const k = key === 'subject' ? r.subject : `${r.subject}|${r.topic || '단원 미기재'}`;
    let g = map.get(k);
    if (!g) { g = { key: k, name: r.subject, subject: r.subject, topic: r.topic || '단원 미기재', n: 0, correct: 0, wrong: 0, zero: 0, pcts: [], rows: [] }; map.set(k, g); }
    g.n++;
    if (r.ok) g.correct++;
    else { g.wrong++; if (!r.mySec) g.zero++; }
    if (r.pct != null) g.pcts.push(r.pct);
    g.rows.push(r);
  }
  const out = Array.from(map.values());
  out.forEach((g) => {
    g.rate = g.n ? Math.round((g.correct / g.n) * 100) : 0;
    g.expected = g.pcts.length ? Math.round(g.pcts.reduce((s, v) => s + v, 0) / g.pcts.length) : null;
    g.gap = g.expected == null ? null : g.rate - g.expected;
  });
  return out;
}

function analysisPasteHTML() {
  const rows = ui.pasteRows || [];
  const saved = store.analyses || [];
  const savedHTML = saved.length ? `<div class="saved-wrap">
    <div class="an-note" style="margin:0 0 6px">저장된 분석</div>
    <div class="saved-list">${saved.map((a) => `<span class="saved-chip ${ui.pasteSavedId === a.id ? 'on' : ''}">
      <button data-act="paste-load" data-id="${a.id}">${esc(a.name || '분석표')} <small>${new Date(a.savedAt).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })}</small></button>
      <button class="x" data-act="paste-del" data-id="${a.id}" aria-label="삭제">×</button></span>`).join('')}</div>
  </div>` : '';

  const input = `
  <div class="an-card">
    <div class="field" style="margin-bottom:10px"><label>분석표 붙여넣기</label>
      <textarea id="pasteBox" rows="7" placeholder="번호  결과  내 시간  평균 시간  정답률  과목  단원&#10;1  O  28초  17초  64.2%  의료법규  혈액관리법&#10;2  X  8초  15초  56.2%  의료법규  감염병의 예방 및 관리">${esc(ui.pasteText || '')}</textarea>
    </div>
    <div class="field" style="margin-bottom:10px"><label>이름 (선택)</label>
      <input type="text" id="pasteName" value="${esc(ui.pasteName || '')}" placeholder="예: 9월 전국 모의고사">
    </div>
    <button class="btn btn-primary btn-block" data-act="paste-run">분석하기</button>
    <div class="hint">시험 사이트의 문항별 분석 표를 그대로 복사해 붙여넣으면 됩니다. 탭·쉼표·공백으로 나뉜 줄을 모두 읽고, O/X·내 시간·평균 시간·정답률·과목·단원을 찾아냅니다.</div>
  </div>`;

  if (!rows.length) {
    return `<div class="an-card" style="padding:0; background:none; border:0; box-shadow:none">${savedHTML}${input}</div>
      ${ui.pasteSkipped ? `<div class="an-note" style="padding:0 16px">${ui.pasteSkipped}줄은 형식을 읽지 못했어요. 번호·O/X·시간이 한 줄에 있는지 확인해 주세요.</div>` : ''}`;
  }
  return renderPasteResult(rows, savedHTML, input);
}

function renderPasteResult(rows, savedHTML, input) {
  const n = rows.length;
  const correct = rows.filter((r) => r.ok).length;
  const wrong = n - correct;
  const zero = rows.filter((r) => !r.ok && !r.mySec).length;
  const rate = n ? Math.round((correct / n) * 100) : 0;
  const accExcl = n - zero > 0 ? Math.round((correct / (n - zero)) * 100) : null;
  const pcts = rows.map((r) => r.pct).filter((v) => v != null);
  const expected = pcts.length ? Math.round(pcts.reduce((s, v) => s + v, 0) / pcts.length) : null;
  const avgTime = (() => { const v = rows.map((r) => r.mySec).filter((x) => x > 0); return v.length ? Math.round(v.reduce((s, x) => s + x, 0) / v.length) : 0; })();

  const subs = groupPaste(rows, 'subject').sort((a, b) => a.rate - b.rate || b.n - a.n);
  const tops = groupPaste(rows, 'topic').filter((g) => g.n >= 3).sort((a, b) => a.rate - b.rate || b.n - a.n);
  const hardWrong = rows.filter((r) => !r.ok && r.pct != null && r.pct >= 60).sort((a, b) => b.pct - a.pct);
  const zeroRows = rows.filter((r) => !r.ok && !r.mySec);
  const rush = rows.filter((r) => !r.ok && r.mySec > 0 && r.avgSec > 0 && r.mySec <= Math.max(5, Math.round(r.avgSec * 0.4)));
  const slow = rows.filter((r) => r.mySec >= Math.max(60, r.avgSec * 2)).sort((a, b) => b.mySec - a.mySec);

  const hl = [];
  if (subs.length) {
    const w = subs[0];
    hl.push(`<b>${esc(w.name)}</b>가 가장 약해요. ${w.n}문항 중 ${w.correct}개 정답 (${w.rate}%)${w.expected != null ? ` · 기대 ${w.expected}%` : ''}`);
  }
  if (zero) hl.push(`0초 문항 <b>${zero}개</b>${accExcl != null ? ` · 0초를 빼면 정답률 ${accExcl}%` : ''}`);
  if (hardWrong.length) hl.push(`정답률 60% 이상인데 틀린 문항 <b>${hardWrong.length}개</b>. 아깝게 놓친 부분이에요`);
  if (rush.length) hl.push(`평균보다 훨씬 빨리(5초 이내) 틀린 문항 <b>${rush.length}개</b>. 성급한 오답 패턴이에요`);
  if (slow.length) hl.push(`평균의 2배 넘게 걸린 문항 <b>${slow.length}개</b>${slow[0] ? ` · 최장 ${slow[0].no}번 ${slow[0].mySec}초` : ''}`);

  const sum = `
  <div class="an-card">
    <div class="an-sum-top"><span>${esc(ui.pasteName || '붙여넣은 분석표')} · ${n}문항</span><span class="an-rate ${rateClass(rate)}">${rate}%</span></div>
    <div class="anbar big"><i class="${rateClass(rate)}" style="width:${rate}%"></i></div>
    <div class="an-stats">
      <div><b>${correct}</b><span>정답</span></div>
      <div><b class="bad">${wrong}</b><span>오답</span></div>
      <div><b class="muted">${zero}</b><span>0초</span></div>
      <div><b>${expected != null ? expected + '%' : '-'}</b><span>평균 정답률</span></div>
    </div>
    <div class="an-note">내 평균 풀이 ${avgTime}초${expected != null ? ` · 문항 평균 정답률 ${expected}%` : ''}${accExcl != null && zero ? ` · 0초 제외 정답률 ${accExcl}%` : ''}</div>
  </div>`;

  const barRow = (g) => `<div class="anrow">
    <div class="anrow-main static">
      <div class="anrow-top"><span class="anrow-name">${esc(g.name)}${g.topic && g.topic !== '단원 미기재' ? `<small> ${esc(g.topic)}</small>` : ''}</span><span class="an-rate ${rateClass(g.rate)}">${g.rate}%</span></div>
      <div class="anbar"><i class="${rateClass(g.rate)}" style="width:${g.rate}%"></i></div>
      <div class="anrow-meta"><span>${g.n}문항</span><span class="bad">오답 ${g.wrong}</span>${g.zero ? `<span>0초 ${g.zero}</span>` : ''}${g.expected != null ? `<span>기대 ${g.expected}%</span>` : ''}${g.gap != null ? `<span class="${g.gap < 0 ? 'bad' : 'ok'}">${g.gap > 0 ? '+' : ''}${g.gap}%p</span>` : ''}</div>
    </div></div>`;

  const listBlock = (title, list, render) => `<div class="an-card">
    <div class="an-block-title">${title}<span>${list.length}</span></div>
    ${list.length ? list.map(render).join('') : '<div class="an-note" style="margin:0">해당 문항이 없어요.</div>'}
  </div>`;
  const qline = (r, extra) => `<div class="qline"><b>${r.no}번</b><span>${esc(r.subject)}${r.topic ? ` · ${esc(r.topic)}` : ''}</span>${extra}</div>`;

  const copyText = () => {
    const lines = hardWrong.length ? hardWrong : rows.filter((r) => !r.ok);
    return lines.map((r) => `${r.no}. ${r.subject}${r.topic ? ' / ' + r.topic : ''} — 정답률 ${r.pct != null ? r.pct + '%' : '?'}, 내 ${r.mySec}초 / 평균 ${r.avgSec}초`).join('\n');
  };

  return `${savedHTML}
  ${sum}
  <div class="an-card hl"><div class="hl-title">약점 하이라이트</div><ul>${hl.map((x) => `<li>${x}</li>`).join('')}</ul></div>
  <div class="an-card"><div class="an-block-title">과목별 정답률<span>${subs.length}</span></div>${subs.map(barRow).join('')}</div>
  ${tops.length ? `<div class="an-card"><div class="an-block-title">약한 단원 TOP ${Math.min(5, tops.length)}<span>3문항 이상</span></div>${tops.slice(0, 5).map(barRow).join('')}</div>` : ''}
  ${listBlock('정답률 60% 이상인데 틀린 문항', hardWrong, (r) => qline(r, `<span class="qmeta">정답률 <b>${r.pct}%</b> · 내 ${r.mySec}초</span>`))}
  ${listBlock('0초 문항', zeroRows, (r) => qline(r, `<span class="qmeta">정답률 ${r.pct != null ? r.pct + '%' : '?'} · 평균 ${r.avgSec}초</span>`))}
  ${listBlock('성급한 오답 (평균보다 훨씬 빠름)', rush, (r) => qline(r, `<span class="qmeta">내 ${r.mySec}초 / 평균 ${r.avgSec}초</span>`))}
  ${listBlock('시간이 오래 걸린 문항', slow.slice(0, 12), (r) => qline(r, `<span class="qmeta">내 ${r.mySec}초 / 평균 ${r.avgSec}초${r.ok ? '' : ' · 오답'}</span>`))}
  <div class="an-tools">
    <button class="link-btn" data-act="paste-copy">틀린 문항 목록 복사</button>
    <button class="link-btn" data-act="paste-edit">분석표 다시 붙여넣기</button>
    <button class="link-btn muted" data-act="paste-clear">지우기</button>
  </div>
  ${input.replace('분석하기', '다시 분석하기')}`;
}

/* ----- 미니 퀴즈 진입 ----- */
async function startQuiz(examId, nos, label) {
  const list = (nos || []).filter((n) => Number.isFinite(Number(n))).map(Number);
  if (!list.length) { toast('복습할 문항이 없어요'); return; }
  const exam = await getExam(examId);
  if (!exam) return;
  const prev = ui.session;
  if (prev && !ui.isMini) { flushQTime(); commitElapsed(prev); prev.updatedAt = now(); saveStore(true); }
  ui.exam = exam;
  ui.examId = examId;
  ui.isMini = true;
  ui.quizLabel = label || '';
  ui.cameFromAnalysis = true;
  ui.session = newSession();
  ui.order = list;
  ui.idx = 0;
  ui.limitMs = Math.max(60 * 1000, Math.round((EXAM_LIMIT_MS * list.length) / (exam.question_count || 80)));
  ui.omrFilter = 'all';
  ui.view = 'exam';
  render();
  toast(`${label ? label + ' · ' : ''}${list.length}문항 복습을 시작해요`, 2800);
}
async function openExamAt(examId, no) {
  await openExam(examId, { fresh: false });
  const i = ui.order.indexOf(Number(no));
  if (i >= 0) goTo(i);
}

function openTopicEdit() {
  const exams = INDEX?.exams || [];
  const eid = ui.topicEditExam || (ui.analysisScope !== 'all' ? ui.analysisScope : (ui.examId || exams[0]?.exam_id));
  const exam = EXAM_CACHE[eid];
  const max = exam?.question_count || 80;
  const no = ui.topicEditNo || 1;
  const tt = topicOf(eid, no);
  const body = `
    <div class="row2">
      <div class="field"><label>시험</label><select id="teExam">${exams.map((e) => `<option value="${e.exam_id}" ${e.exam_id === eid ? 'selected' : ''}>${esc(e.short || `${e.year} ${e.course}교시`)}</option>`).join('')}</select></div>
      <div class="field"><label>문항 번호</label><input type="text" id="teNo" value="${no}" inputmode="numeric"></div>
    </div>
    <div class="field"><label>과목</label><input type="text" id="teSubject" value="${esc(tt.s)}" placeholder="예: 내과"></div>
    <div class="field"><label>단원·토픽</label><input type="text" id="teTopic" value="${esc(tt.t)}" placeholder="예: 내분비"></div>
    <div class="hint">자동 분류가 틀렸을 때 고쳐 주세요. 저장한 값은 이 기기에 남고, 기기 간 동기화에도 함께 실립니다.</div>
    <div class="modal-actions">
      <button class="btn btn-ghost" data-act="topic-edit-reset">자동 분류로 되돌리기</button>
      <button class="btn btn-primary" data-act="topic-edit-save">저장</button>
    </div>`;
  openModal(modalShell('문항 과목·단원 수정', body));
  $('#teExam').addEventListener('change', (e) => { ui.topicEditExam = e.target.value; ui.topicEditNo = 1; openTopicEdit(); });
}


/* ----- 기타/분석 진입과 동작 ----- */
function hasMineData() {
  return (INDEX?.exams || []).some((e) => {
    const s = store.sessions?.[e.exam_id];
    if (!s?.submitted) return false;
    return Object.keys(store.answers?.[e.exam_id] || {}).length > 0 || Object.keys(store.edits?.[e.exam_id] || {}).some((k) => store.edits[e.exam_id][k]?.answer);
  });
}
function openEtc() {
  if (ui.session && !ui.isMini) {
    flushQTime();
    commitElapsed(ui.session);
    ui.session.updatedAt = now();
    saveStore(true);
  }
  ui.view = 'etc';
  ui.session = null;
  ui.result = null;
  ui.isMini = false;
  ui.cameFromAnalysis = false;
  try { history.pushState({ ml: 1 }, ''); } catch (e) {}
  render();
  window.scrollTo(0, 0);
}
async function openAnalysis() {
  if (ui.session && !ui.isMini) {
    flushQTime();
    commitElapsed(ui.session);
    ui.session.updatedAt = now();
    saveStore(true);
  }
  await getTopics();
  if (ui.analysisTab === 'mine' && !ui.pasteRows && !hasMineData()) ui.analysisTab = 'paste';
  ui.view = 'analysis';
  try { history.pushState({ ml: 1 }, ''); } catch (e) {}
  render();
  window.scrollTo(0, 0);
}
function runPaste() {
  const text = $('#pasteBox')?.value || '';
  const name = ($('#pasteName')?.value || '').trim();
  if (!text.trim()) { toast('분석표를 붙여넣어 주세요'); return; }
  const { rows, skipped } = parsePaste(text);
  ui.pasteText = text;
  ui.pasteName = name;
  ui.pasteRows = rows;
  ui.pasteSkipped = skipped;
  if (!rows.length) {
    toast('표를 읽지 못했어요. 번호·O/X·시간이 한 줄에 있는지 확인해 주세요.', 4200);
    render();
    return;
  }
  savePasteAnalysis(name || '분석표', text);
  toast(`${rows.length}문항을 분석했어요`, 2400);
  render();
  window.scrollTo(0, 0);
}
function savePasteAnalysis(name, text) {
  const id = 'a' + now();
  const list = (store.analyses || []).filter((a) => a.text !== text);
  list.unshift({ id, name, savedAt: now(), text });
  store.analyses = list.slice(0, 6);
  ui.pasteSavedId = id;
  saveStore(true);
}
function loadPaste(id) {
  const a = (store.analyses || []).find((x) => x.id === id);
  if (!a) return;
  ui.pasteText = a.text;
  ui.pasteName = a.name === '분석표' ? '' : a.name;
  const { rows, skipped } = parsePaste(a.text);
  ui.pasteRows = rows;
  ui.pasteSkipped = skipped;
  ui.pasteSavedId = id;
  render();
  window.scrollTo(0, 0);
}
function delPaste(id) {
  store.analyses = (store.analyses || []).filter((a) => a.id !== id);
  if (ui.pasteSavedId === id) { ui.pasteSavedId = null; }
  saveStore(true);
  render();
  toast('저장한 분석을 지웠어요');
}
async function copyPasteList() {
  const rows = (ui.pasteRows || []).filter((r) => !r.ok);
  if (!rows.length) { toast('틀린 문항이 없어요'); return; }
  const text = rows.map((r) => `${r.no}. ${r.subject}${r.topic ? ' / ' + r.topic : ''} — 정답률 ${r.pct != null ? r.pct + '%' : '?'}, 내 ${r.mySec}초 / 평균 ${r.avgSec}초`).join('\n');
  const ok = await copyText(text);
  toast(ok ? '틀린 문항 목록을 복사했어요' : '복사에 실패했어요', 2800);
}
function saveTopicEdit() {
  const eid = $('#teExam')?.value;
  const no = Number($('#teNo')?.value);
  const subject = ($('#teSubject')?.value || '').trim();
  const topic = ($('#teTopic')?.value || '').trim();
  const max = (INDEX?.exams || []).find((e) => e.exam_id === eid)?.question_count || 80;
  if (!eid || !(no >= 1 && no <= max)) { toast(`문항 번호는 1~${max} 사이로 넣어 주세요`); return; }
  if (!subject || !topic) { toast('과목과 단원을 모두 넣어 주세요'); return; }
  const box = (store.topicEdits[eid] = store.topicEdits[eid] || {});
  box[no] = { s: subject, t: topic, updatedAt: now() };
  saveStore(true);
  closeModal();
  ui.topicEditExam = eid;
  ui.topicEditNo = no;
  if (ui.view === 'analysis') render();
  toast(`${no}번을 ${subject} · ${topic}(으)로 저장했어요`, 2800);
}
function resetTopicEdit() {
  const eid = $('#teExam')?.value;
  const no = Number($('#teNo')?.value);
  if (store.topicEdits?.[eid]) delete store.topicEdits[eid][no];
  saveStore(true);
  closeModal();
  ui.topicEditExam = eid;
  ui.topicEditNo = no;
  if (ui.view === 'analysis') render();
  toast('자동 분류 값으로 되돌렸어요');
}

/* ============================================================
   스파르타 타이머 · 종료 시 약점 1문제
   ============================================================ */
const SPARTA_PRESETS = [25, 30, 50];
const SPARTA_DEFAULT_MIN = 30;
const SPARTA_CORE = /의료법규|예방의학|내분비|감염|응급|중독|산과/;

let spartaTickTimer = null;
let spartaAudio = null;
let spartaFinishing = false;
let spartaSeen = [];
let spartaQuiz = null;
let SW_READY = null;

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function spartaSet() {
  if (!store.settings.sparta || typeof store.settings.sparta !== 'object') store.settings.sparta = {};
  const d = store.settings.sparta;
  if (!SPARTA_PRESETS.includes(Number(d.min))) d.min = SPARTA_DEFAULT_MIN;
  d.min = Number(d.min);
  if (typeof d.running !== 'boolean') d.running = false;
  if (typeof d.endsAt !== 'number') d.endsAt = 0;
  if (typeof d.remainMs !== 'number') d.remainMs = d.min * 60000;
  if (typeof d.rounds !== 'number') d.rounds = 0;
  if (typeof d.minutesToday !== 'number') d.minutesToday = 0;
  if (typeof d.sound !== 'boolean') d.sound = true;
  if (typeof d.notify !== 'boolean') d.notify = true;
  if (typeof d.pushUrl !== 'string') d.pushUrl = '';
  if (typeof d.vapid !== 'string') d.vapid = '';
  if (typeof d.subEndpoint !== 'string') d.subEndpoint = '';
  if (d.day !== todayKey()) { d.day = todayKey(); d.minutesToday = 0; d.rounds = 0; }
  return d;
}

function spartaRemain() {
  const d = spartaSet();
  const raw = d.running && d.endsAt ? d.endsAt - now() : (d.remainMs || 0);
  return Math.max(0, Math.min(raw, d.min * 60000));
}
function spartaFull() { return spartaSet().min * 60000; }
function fmtSparta(ms) {
  const t = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
}
function spartaStateText() {
  const d = spartaSet();
  const rem = spartaRemain();
  if (d.running) return '진행 중';
  if (rem <= 0) return '완료';
  if (rem < d.min * 60000) return '일시정지';
  return '대기 중';
}

/* ----- 카드 UI ----- */
function spartaCardHTML() {
  const d = spartaSet();
  const rem = spartaRemain();
  return `<div class="sparta-card ${d.running ? 'on' : ''}${!d.running && rem <= 0 ? ' done' : ''}">
    <div class="sp-top">
      <span class="sp-tag">스파르타</span>
      <span class="sp-round" data-sparta-round>${d.rounds + 1}교시</span>
      <div class="sp-spacer"></div>
      <button class="sp-gear" data-act="sparta-settings" aria-label="타이머 설정">${ICON.gear}</button>
    </div>
    <div class="sp-mid">
      <div class="sp-time" data-sparta-time>${fmtSparta(rem)}</div>
      <div class="sp-side">
        <span class="sp-state" data-sparta-state>${spartaStateText()}</span>
        <span class="sp-today">오늘 <b data-sparta-today>${d.minutesToday}분</b></span>
      </div>
    </div>
    <div class="sp-presets">
      ${SPARTA_PRESETS.map((m) => `<button class="sp-preset ${d.min === m ? 'on' : ''}" data-act="sparta-preset" data-min="${m}">${m}분</button>`).join('')}
    </div>
    <div class="sp-actions">
      <button class="btn btn-primary btn-sm" data-act="sparta-toggle" data-sparta-toggle>시작</button>
      <button class="btn btn-ghost btn-sm" data-act="sparta-reset">리셋</button>
      <button class="link-btn muted" data-act="sparta-preview">퀴즈 미리보기</button>
    </div>
    <div class="sp-foot" data-sparta-foot>${spartaFootText()}</div>
  </div>`;
}

function spartaFootText() {
  const d = spartaSet();
  const perm = notifyPermission();
  if (!d.notify || perm === 'granted') return '끝나면 알림음과 약점 1문제가 떠요';
  if (perm === 'unsupported') return '끝나면 알림음과 약점 1문제가 떠요';
  return '끝나면 알림음과 약점 1문제가 떠요 · 알림은 ⚙ 설정에서 켜요';
}

function updateSpartaUI() {
  const d = spartaSet();
  const rem = spartaRemain();
  const full = d.min * 60000;
  const state = spartaStateText();
  const toggleLabel = d.running ? '일시정지' : (rem > 0 && rem < full ? '이어서' : rem <= 0 ? '다시 시작' : '시작');
  const txt = fmtSparta(rem);
  $$('[data-sparta-time]').forEach((el) => { if (el.textContent !== txt) el.textContent = txt; });
  $$('[data-sparta-state]').forEach((el) => { if (el.textContent !== state) el.textContent = state; });
  $$('[data-sparta-round]').forEach((el) => { const t = `${d.rounds + 1}교시`; if (el.textContent !== t) el.textContent = t; });
  $$('[data-sparta-today]').forEach((el) => { const t = `${d.minutesToday}분`; if (el.textContent !== t) el.textContent = t; });
  $$('[data-sparta-toggle]').forEach((el) => { if (el.textContent !== toggleLabel) el.textContent = toggleLabel; });
  $$('[data-act="sparta-preset"]').forEach((el) => el.classList.toggle('on', Number(el.dataset.min) === d.min));
  $$('.sparta-card').forEach((el) => {
    el.classList.toggle('on', d.running);
    el.classList.toggle('done', !d.running && rem <= 0);
    el.classList.toggle('paused', !d.running && rem > 0 && rem < full);
  });
  const foot = spartaFootText();
  $$('[data-sparta-foot]').forEach((el) => { if (el.textContent !== foot) el.textContent = foot; });
}

/* ----- 소리 ----- */
function spartaUnlockAudio() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!spartaAudio) spartaAudio = new AC();
    if (spartaAudio.state === 'suspended') spartaAudio.resume();
    return spartaAudio;
  } catch (e) { return null; }
}
function spartaBeep() {
  const ctx = spartaUnlockAudio();
  if (!ctx) return;
  try {
    const t0 = ctx.currentTime + 0.06;
    [0, 0.32, 0.64, 0.96].forEach((off, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = i === 3 ? 'triangle' : 'sine';
      osc.frequency.value = [659, 784, 988, 1319][i];
      gain.gain.setValueAtTime(0.0001, t0 + off);
      gain.gain.exponentialRampToValueAtTime(0.3, t0 + off + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + off + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0 + off);
      osc.stop(t0 + off + 0.34);
    });
  } catch (e) {}
}

/* ----- 알림 / 서비스워커 ----- */
function notifyPermission() {
  if (typeof Notification === 'undefined') return 'unsupported';
  return Notification.permission;
}
async function spartaAskNotify() {
  if (typeof Notification === 'undefined') { toast('이 브라우저는 알림을 지원하지 않아요'); return 'unsupported'; }
  try {
    const p = await Notification.requestPermission();
    if (p === 'granted') { toast('알림을 켰어요'); ensureSW(); }
    else toast('알림 권한이 꺼져 있어요. 브라우저 설정에서 허용해 주세요.', 3600);
    updateSpartaUI();
    return p;
  } catch (e) {
    toast('알림 권한을 요청하지 못했어요', 3000);
    return 'default';
  }
}
async function spartaNotify(title, body) {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return false;
  const opts = {
    body,
    icon: 'icons/icon-192.png',
    badge: 'icons/icon-192.png',
    tag: 'sparta-round',
    data: { url: location.href.split('#')[0] },
  };
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg && reg.showNotification) { await reg.showNotification(title, opts); return true; }
  } catch (e) {}
  try { new Notification(title, opts); return true; } catch (e) { return false; }
}
function ensureSW() {
  if (!('serviceWorker' in navigator)) return Promise.resolve(null);
  if (SW_READY) return SW_READY;
  SW_READY = navigator.serviceWorker.register('sw.js', { scope: './' }).catch(() => null);
  return SW_READY;
}

/* ----- 시작 / 일시정지 / 리셋 ----- */
function spartaStart(min) {
  const d = spartaSet();
  const m = SPARTA_PRESETS.includes(Number(min)) ? Number(min) : d.min;
  d.min = m;
  d.remainMs = m * 60000;
  d.endsAt = now() + d.remainMs;
  d.running = true;
  d.startedAt = now();
  saveStore(true);
  spartaUnlockAudio();
  ensureSW();
  startSpartaTick();
  updateSpartaUI();
  toast(`${m}분 스파르타 타이머 시작. 끝나면 1문제 바로 떠요`, 2600);
}
function spartaPause() {
  const d = spartaSet();
  if (!d.running) return;
  d.remainMs = spartaRemain();
  d.running = false;
  d.endsAt = 0;
  stopSpartaTick();
  saveStore(true);
  updateSpartaUI();
  toast('잠깐 멈췄어요');
}
function spartaResume() {
  const d = spartaSet();
  const rem = d.remainMs || d.min * 60000;
  d.endsAt = now() + rem;
  d.running = true;
  saveStore(true);
  spartaUnlockAudio();
  startSpartaTick();
  updateSpartaUI();
  toast('이어서 갑니다', 2000);
}
function spartaReset() {
  const d = spartaSet();
  d.running = false;
  d.endsAt = 0;
  d.remainMs = d.min * 60000;
  stopSpartaTick();
  saveStore(true);
  updateSpartaUI();
  toast('타이머를 리셋했어요', 2000);
}
function spartaSetPreset(min) {
  const d = spartaSet();
  const m = Number(min);
  if (!SPARTA_PRESETS.includes(m)) return;
  d.min = m;
  if (!d.running) d.remainMs = m * 60000;
  saveStore();
  updateSpartaUI();
}

function startSpartaTick() {
  stopSpartaTick();
  spartaTickTimer = setInterval(spartaTick, 500);
}
function stopSpartaTick() {
  if (spartaTickTimer) clearInterval(spartaTickTimer);
  spartaTickTimer = null;
}
function spartaTick() {
  const d = spartaSet();
  if (!d.running) { stopSpartaTick(); updateSpartaUI(); return; }
  if (spartaRemain() <= 0) { spartaFinish(false); return; }
  updateSpartaUI();
}

function spartaFinish(silent) {
  if (spartaFinishing) return;
  spartaFinishing = true;
  try {
    const d = spartaSet();
    stopSpartaTick();
    d.running = false;
    d.endsAt = 0;
    d.remainMs = 0;
    d.rounds = (d.rounds || 0) + 1;
    d.minutesToday = (d.minutesToday || 0) + (d.min || SPARTA_DEFAULT_MIN);
    d.lastFinishedAt = now();
    saveStore(true);
    updateSpartaUI();
    if (!silent) {
      if (d.sound) spartaBeep();
      try { if (navigator.vibrate) navigator.vibrate([120, 90, 160]); } catch (e) {}
      if (d.notify) spartaNotify(`${d.min}분 완료!`, `스파르타 ${d.rounds}교시 끝. 약점 1문제 바로 풀어요.`);
      openSpartaQuiz().catch(() => {});
    }
  } finally {
    spartaFinishing = false;
  }
}

/* ----- 설정 ----- */
function spartaSettingsHTML() {
  const d = spartaSet();
  const perm = notifyPermission();
  const permText = perm === 'granted' ? '허용됨' : perm === 'denied' ? '차단됨' : perm === 'unsupported' ? '지원 안 함' : '아직 안 물어봄';
  const swText = !('serviceWorker' in navigator) ? '지원 안 함' : SW_READY ? '등록됨' : '대기';
  return `
    <div class="field"><label>기본 시간</label>
      <div class="sp-presets">
        ${SPARTA_PRESETS.map((m) => `<button class="sp-preset ${d.min === m ? 'on' : ''}" data-act="sparta-settings-preset" data-min="${m}">${m}분</button>`).join('')}
      </div>
    </div>
    <div class="switch-row">
      <div class="lbl">종료 알림음<div class="sub">타이머가 끝나면 비프음이 울려요</div></div>
      <button class="switch ${d.sound ? 'on' : ''}" data-act="sparta-toggle-sound" aria-label="알림음"></button>
    </div>
    <div class="switch-row">
      <div class="lbl">브라우저 알림<div class="sub">잠금 화면에도 알림 (홈 화면에 추가 + iOS 16.4 이상)</div></div>
      <button class="switch ${d.notify ? 'on' : ''}" data-act="sparta-toggle-notify" aria-label="브라우저 알림"></button>
    </div>
    <div class="row2">
      <button class="btn btn-ghost btn-sm" data-act="sparta-allow">알림 허용 (${permText})</button>
      <button class="btn btn-ghost btn-sm" data-act="sparta-test">테스트 알림</button>
    </div>
    <div class="sep-line"></div>
    <div class="field"><label>Push 서버 URL (선택)</label>
      <input type="text" id="spPushUrl" value="${esc(d.pushUrl)}" placeholder="https://sparta-push.내계정.workers.dev/push" autocomplete="off">
      <div class="hint">Cloudflare Worker 같은 푸시 서버를 붙이면 앱을 닫아 둔 상태에서도 알림이 와요. 비워 두면 이 기기에서만(타이머·비프음·팝업) 동작해요.</div>
    </div>
    <div class="field"><label>VAPID 공개키 (선택)</label>
      <input type="text" id="spVapid" value="${esc(d.vapid)}" placeholder="B로 시작하는 긴 문자열" autocomplete="off">
    </div>
    <div class="row2">
      <button class="btn btn-ghost btn-sm" data-act="sparta-subscribe">푸시 구독 준비</button>
      <button class="btn btn-ghost btn-sm" data-act="sparta-preview">퀴즈 미리보기</button>
    </div>
    <div class="sp-status">알림 권한 <b>${permText}</b> · 서비스워커 ${swText} · 구독 ${d.subEndpoint ? '있음' : '없음'}</div>
    <div class="hint" style="margin-top:10px"><b>아이폰 홈 화면 추가</b><br>Safari에서 이 페이지를 연 뒤 공유 → 홈 화면에 추가. 홈 화면 아이콘으로 열면 앱처럼 전체 화면으로 뜨고, 그때부터 알림을 받을 수 있어요.</div>
    <div class="modal-actions">
      <button class="btn btn-primary" data-act="sparta-save">저장</button>
    </div>`;
}
function openSpartaSettings() {
  const d = spartaSet();
  ensureSW();
  openModal(modalShell('스파르타 타이머 설정', spartaSettingsHTML(), `오늘 ${d.rounds}교시 · ${d.minutesToday}분`));
}
function saveSpartaSettings() {
  const d = spartaSet();
  const url = ($('#spPushUrl')?.value || '').trim();
  const vapid = ($('#spVapid')?.value || '').trim();
  if (url && !/^https?:\/\//i.test(url)) { toast('Push 서버 URL은 https:// 로 시작해야 해요'); return; }
  d.pushUrl = url;
  d.vapid = vapid;
  saveStore(true);
  closeModal();
  updateSpartaUI();
  toast('타이머 설정을 저장했어요');
}
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}
async function spartaSubscribe() {
  const d = spartaSet();
  const url = ($('#spPushUrl')?.value || '').trim();
  const vapid = ($('#spVapid')?.value || '').trim();
  d.pushUrl = url;
  d.vapid = vapid;
  saveStore(true);
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    toast('이 브라우저는 웹 푸시 구독을 지원하지 않아요. 아이폰은 홈 화면에 추가한 뒤 열어 주세요.', 4400);
    return;
  }
  const reg = await ensureSW();
  if (!reg) { toast('서비스워커를 등록하지 못했어요', 3200); return; }
  if (notifyPermission() !== 'granted') {
    const p = await spartaAskNotify();
    if (p !== 'granted') return;
  }
  if (!vapid) { toast('VAPID 공개키를 먼저 넣어 주세요. Worker를 만들면 발급돼요.', 4200); return; }
  try {
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(vapid) });
    }
    d.subEndpoint = sub.endpoint;
    saveStore(true);
    if (url) {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'subscribe', subscription: sub.toJSON(), tz: 'Asia/Seoul' }),
      });
      toast(res.ok ? '푸시 서버에 구독을 등록했어요' : `푸시 서버 응답 ${res.status}`, 3600);
    } else {
      toast('구독을 만들었어요. Push 서버 URL을 넣으면 서버로 보낼 수 있어요.', 4200);
    }
    openSpartaSettings();
  } catch (e) {
    toast(`구독 실패: ${e.message || e}`, 4200);
  }
}

/* ----- 약점/랜덤 1문제 팝업 ----- */
async function spartaPickQuestion() {
  spartaSeen = spartaSeen.slice(-24);
  const take = (arr) => {
    const fresh = arr.filter((x) => !spartaSeen.includes(`${x.eid}:${x.no}`));
    const pool = fresh.length ? fresh : arr;
    return pool[Math.floor(Math.random() * pool.length)];
  };
  const keyed = (x) => !!keyOfExam(x.eid, x.no);
  const weak = analyzeMine('all').items.filter((i) => i.wrong || i.skip || i.flag).map((i) => ({ eid: i.eid, no: i.no }));
  const weakKeyed = weak.filter(keyed);
  if (weakKeyed.length) return take(weakKeyed);
  const core = [];
  const any = [];
  for (const eid of Object.keys(TOPICS?.map || {})) {
    for (const no of Object.keys(TOPICS.map[eid])) {
      const t = TOPICS.map[eid][no];
      const item = { eid, no: Number(no) };
      any.push(item);
      if (SPARTA_CORE.test(`${t.s} ${t.t}`)) core.push(item);
    }
  }
  const coreKeyed = core.filter(keyed);
  if (coreKeyed.length) return take(coreKeyed);
  const anyKeyed = any.filter(keyed);
  if (anyKeyed.length) return take(anyKeyed);
  if (weak.length) return take(weak);
  if (core.length) return take(core);
  if (any.length) return take(any);
  return null;
}

async function openSpartaQuiz() {
  try {
    const pick = await spartaPickQuestion();
    if (!pick) { toast('퀴즈로 낼 문항을 찾지 못했어요'); return; }
    let exam = EXAM_CACHE[pick.eid];
    if (!exam) exam = await getExam(pick.eid);
    if (!exam || !exam.questions.some((q) => q.number === pick.no)) { toast('문항을 불러오지 못했어요', 3200); return; }
    spartaSeen.push(`${pick.eid}:${pick.no}`);
    spartaQuiz = { eid: pick.eid, no: pick.no, picked: null };
    openModal(spartaQuizHTML());
  } catch (e) {
    toast('퀴즈를 띄우지 못했어요. 잠시 뒤 [퀴즈 미리보기]로 다시 시도해 주세요.', 4000);
  }
}

function spartaQuizHTML() {
  const { eid, no, picked } = spartaQuiz;
  const exam = EXAM_CACHE[eid];
  const q = exam.questions.find((x) => x.number === no);
  const key = keyOfExam(eid, no);
  const tt = topicOf(eid, no);
  const done = picked != null;
  const opts = q.options.map((o) => {
    const state = done ? (key && o.no === key ? 'ok' : o.no === picked ? 'bad' : 'dim') : '';
    return `<button class="qp-opt ${state}" data-act="sparta-answer" data-no="${o.no}" ${done ? 'disabled' : ''}>
      <span class="mk">${esc(o.marker || MARKERS[o.no - 1])}</span>
      <span class="ot">${esc(o.text)}</span>
    </button>`;
  }).join('');
  let feedback = '';
  if (done) {
    if (key) {
      const ok = picked === key;
      feedback = `<div class="qp-fb ${ok ? 'ok' : 'bad'}">${ok ? '정답이에요' : `아쉬워요. 정답은 ${MARKERS[key - 1]}번`}</div>`;
    } else {
      feedback = `<div class="qp-fb info">이 시험은 정답이 아직 없어서 채점 없이 문제만 띄웠어요. 정답을 한 번 넣어 두면 다음부터 바로 채점돼요.</div>`;
    }
  }
  const figs = (q.figures || []).map((f) => `<img src="${esc(f.path)}" alt="문항 ${no} 그림" loading="lazy">`).join('');
  return `<div class="modal qp" role="dialog" aria-modal="true">
    <div class="qp-head">
      <div style="flex:1">
        <div class="qp-kicker">스파르타 복습 퀴즈</div>
        <div class="qp-sub">${esc(examShort(eid))} ${no}번 · ${esc(tt.s)}${tt.t && tt.t !== '미분류' ? ' · ' + esc(tt.t) : ''}</div>
      </div>
      <button class="x-btn" data-act="modal-close" aria-label="닫기">${ICON.close}</button>
    </div>
    <div class="qp-stem">${esc(q.stem)}</div>
    ${figs ? `<div class="qp-figs">${figs}</div>` : ''}
    <div class="qp-opts">${opts}</div>
    ${feedback}
    <div class="qp-actions">
      ${key ? '<span></span>' : `<button class="link-btn" data-act="sparta-quiz-keys" data-exam="${eid}">이 시험 정답 입력</button>`}
      <div class="qp-actions-r">
        <button class="btn btn-ghost btn-sm" data-act="modal-close">닫기</button>
        <button class="btn btn-primary btn-sm" data-act="sparta-next">한 문제 더</button>
      </div>
    </div>
  </div>`;
}

function spartaAnswer(no) {
  if (!spartaQuiz || spartaQuiz.picked != null) return;
  spartaQuiz.picked = Number(no);
  openModal(spartaQuizHTML());
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
    case 'nav-home': goHome(); break;
    case 'nav-etc': openEtc(); break;
    case 'etc-back': openEtc(); break;
    case 'open-analysis': await openAnalysis(); break;
    case 'an-tab': ui.analysisTab = el.dataset.t; render(); break;
    case 'an-scope': ui.analysisScope = el.dataset.scope; ui.analysisOpen = {}; render(); break;
    case 'an-level': ui.analysisLevel = el.dataset.l; ui.analysisOpen = {}; render(); break;
    case 'an-open': { const k = el.dataset.key; ui.analysisOpen[k] = !ui.analysisOpen[k]; render(); break; }
    case 'quiz': await startQuiz(el.dataset.exam, (el.dataset.nos || '').split(',').map(Number), el.dataset.label); break;
    case 'jumpq': await openExamAt(el.dataset.exam, Number(el.dataset.no)); break;
    case 'paste-run': runPaste(); break;
    case 'paste-load': loadPaste(el.dataset.id); break;
    case 'paste-del': delPaste(el.dataset.id); break;
    case 'paste-clear': ui.pasteText = ''; ui.pasteName = ''; ui.pasteRows = null; ui.pasteSkipped = 0; ui.pasteSavedId = null; render(); break;
    case 'paste-edit': { const b = $('#pasteBox'); if (b) { b.scrollIntoView({ block: 'center' }); b.focus(); } break; }
    case 'paste-copy': await copyPasteList(); break;
    case 'topic-edit-open': ui.topicEditExam = el.dataset.exam || null; ui.topicEditNo = Number(el.dataset.no) || 1; openTopicEdit(); break;
    case 'topic-edit-save': saveTopicEdit(); break;
    case 'topic-edit-reset': resetTopicEdit(); break;
    case 'year': ui.filterYear = el.dataset.year; render(); break;

    case 'sparta-toggle': {
      const sd = spartaSet();
      if (sd.running) spartaPause();
      else if (spartaRemain() > 0 && spartaRemain() < sd.min * 60000) spartaResume();
      else spartaStart(sd.min);
      break;
    }
    case 'sparta-preset': spartaSetPreset(el.dataset.min); break;
    case 'sparta-reset': spartaReset(); break;
    case 'sparta-settings': openSpartaSettings(); break;
    case 'sparta-settings-preset': spartaSetPreset(el.dataset.min); openSpartaSettings(); break;
    case 'sparta-save': saveSpartaSettings(); break;
    case 'sparta-toggle-sound': {
      const sd = spartaSet();
      sd.sound = !sd.sound;
      saveStore(true);
      el.classList.toggle('on', sd.sound);
      if (sd.sound) spartaBeep();
      break;
    }
    case 'sparta-toggle-notify': {
      const sd = spartaSet();
      sd.notify = !sd.notify;
      saveStore(true);
      el.classList.toggle('on', sd.notify);
      if (sd.notify && notifyPermission() === 'default') await spartaAskNotify();
      break;
    }
    case 'sparta-allow': await spartaAskNotify(); if ($('#modal-root')?.children.length) openSpartaSettings(); break;
    case 'sparta-test': {
      spartaBeep();
      const ok = await spartaNotify('문제 트레이너 테스트 알림', '이렇게 알림이 와요. 스파르타 타이머가 끝나면 약점 1문제도 함께 떠요.');
      toast(ok ? '테스트 알림을 보냈어요' : '알림 권한을 먼저 허용해 주세요', 3200);
      break;
    }
    case 'sparta-subscribe': await spartaSubscribe(); break;
    case 'sparta-preview': await openSpartaQuiz(); break;
    case 'sparta-next': await openSpartaQuiz(); break;
    case 'sparta-answer': spartaAnswer(Number(el.dataset.no)); break;
    case 'sparta-quiz-keys': openKeys(el.dataset.exam); break;

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
      if (ui.isMini && ui.cameFromAnalysis) {
        flushQTime();
        ui.session = null;
        ui.isMini = false;
        ui.cameFromAnalysis = false;
        ui.view = 'analysis';
        render();
        window.scrollTo(0, 0);
      } else if (ui.isMini && ui.cameFromResult) {
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
        goHome();
      }
      break;
    }
    case 'back-result':
      if (ui.isMini && ui.cameFromAnalysis) {
        ui.result = null;
        ui.session = null;
        ui.isMini = false;
        ui.cameFromAnalysis = false;
        ui.view = 'analysis';
        render();
        window.scrollTo(0, 0);
      } else goHome();
      break;
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
    case 'jump': goTo(ui.order.indexOf(Number(el.dataset.no))); closeOmr(); break;
    case 'pause': togglePause(); break;
    case 'submit': await submitExam(); break;
    case 'omr': ui.omrOpen = !ui.omrOpen; $('#omrSheet')?.classList.toggle('open', ui.omrOpen); el.classList.toggle('open', ui.omrOpen); $('#scrim')?.classList.toggle('show', ui.omrOpen); renderOMR(); break;
    case 'omr-close': closeOmr(); break;
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
    if (e.isComposing) return;
    renderExamList();
  }
});
document.addEventListener('compositionend', (e) => {
  if (e.target.id === 'searchInput') {
    ui.q = e.target.value;
    renderExamList();
  }
});

function renderExamList() {
  const box = $('#examList');
  if (!box || ui.view !== 'home') return;
  const exams = INDEX?.exams || [];
  const q = ui.q.trim().toLowerCase();
  let list = exams.filter((e) => {
    if (ui.filterYear !== 'all' && String(e.year) !== ui.filterYear) return false;
    if (!q) return true;
    return `${e.title} ${e.year} ${e.course}교시 ${e.exam_id}`.toLowerCase().includes(q);
  });
  list = list.slice().sort((a, b) => b.year - a.year || a.course - b.course);
  box.innerHTML = list.length ? list.map((e) => examCardHTML(e)).join('') : '<div class="emptystate">조건에 맞는 시험이 없어요.</div>';
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

// 탭 전환 시 스파르타 타이머 확인(백그라운드에서 멈춘 시계 보정)
document.addEventListener('visibilitychange', () => {
  const sd = store.settings.sparta;
  if (!sd || !sd.running) return;
  if (spartaRemain() <= 0) spartaFinish(false);
  else updateSpartaUI();
});

// 탭 전환 시 타이머 정리
document.addEventListener('visibilitychange', () => {
  if (!ui.session || ui.isMini) return;
  if (document.hidden) {
    flushQTime();
    if (ui.session.running) { commitElapsed(ui.session); ui.session.running = false; ui.session._wasRunning = true; ui.session.updatedAt = now(); saveStore(true); }
  } else if (ui.session._wasRunning) {
    ui.session.running = true;
    ui.session.lastTs = now();
    ui.session._wasRunning = false;
    ui.qStart = now();
    updateTimerUI();
  }
});
window.addEventListener('pagehide', () => {
  if (ui.session && !ui.isMini) { flushQTime(); commitElapsed(ui.session); ui.session.updatedAt = now(); saveStore(true); }
});
window.addEventListener('popstate', () => {
  if (ui.view !== 'home') goHome();
});

function goHome() {
  if (ui.session && !ui.isMini) {
    flushQTime();
    commitElapsed(ui.session);
    ui.session.updatedAt = now();
    saveStore(true);
  }
  ui.view = 'home';
  ui.session = null;
  ui.result = null;
  ui.isMini = false;
  ui.cameFromResult = null;
  ui.quizLabel = '';
  render();
}

/* ---------------- 시험 열기 / 결과 열기 ---------------- */
async function openExam(examId, opts = {}) {
  if (ui.session && !ui.isMini) { flushQTime(); commitElapsed(ui.session); ui.session.updatedAt = now(); }
  const exam = await getExam(examId);
  ui.exam = exam;
  ui.examId = examId;
  ui.isMini = false;
  ui.cameFromResult = null;
  ui.quizLabel = '';
  ui.cameFromAnalysis = false;
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
    if (!s.submitted) { s.running = true; s.lastTs = now(); }
  }
  s.updatedAt = now();
  ui.session = s;
  ui.order = exam.questions.map((q) => q.number);
  ui.idx = Math.max(0, ui.order.findIndex((n) => !s.answers[n]));
  if (ui.idx < 0) ui.idx = 0;
  ui.limitMs = EXAM_LIMIT_MS;
  ui.omrFilter = 'all';
  ui.view = 'exam';
  try { history.pushState({ ml: 1 }, ''); } catch (e) {}
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
  try { history.pushState({ ml: 1 }, ''); } catch (e) {}
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
    await getTopics();
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
  if (spartaSet().running && spartaRemain() <= 0) spartaFinish(true);
  else if (spartaSet().running) startSpartaTick();
  setTimeout(() => { ensureSW(); }, 1200);
}

boot();
