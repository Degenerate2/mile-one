/* Mile One app: accounts, learner profiles, linked learner devices, progress, the map, lessons, quizzes. */
(function(){
'use strict';
var MO = window.MO, s = MO.s, PACK = MO.PACK, cloud = MO.cloud;
function $(q){ return document.querySelector(q); }
function h(tag, cls, text){ var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
var reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
var FINAL_N = 25;
function lsGet(k){ try { return localStorage.getItem(k); } catch (e) { return null; } }
function lsSet(k, v){ try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} }

/* ============================================================
   PROGRESS: one record per learner. Kept on the device and, when
   signed in, merged with the copy in the family's account.
   ============================================================ */
/* Per mile: steps done, best quiz score, passed. For the parent's report it also keeps
   tries (quiz attempts), first (score on the first attempt), miss (how often each quiz
   question was missed) and at (when the learner last worked on it). */
function blank(){ return {xp:0, miles:{}, fin:{best:0, passed:false}}; }
function norm(d){
  d = d && typeof d === 'object' ? d : {};
  var f = d.fin && typeof d.fin === 'object' ? d.fin : {}, o = {xp:+d.xp || 0, miles:d.miles && typeof d.miles === 'object' ? d.miles : {}, fin:{best:+f.best || 0, passed:!!f.passed}};
  if (+f.tries) o.fin.tries = +f.tries;
  if (+f.at) o.fin.at = +f.at;
  if (+d.at) o.at = +d.at;
  return o;
}
function most(a, b){ return Math.max(+a || 0, +b || 0); }
/* progress only ever grows, so two copies combine by taking the most from each */
function mergeMem(a, b){
  a = norm(a); b = norm(b);
  var o = {xp:Math.max(a.xp, b.xp), miles:{}, fin:{best:Math.max(a.fin.best, b.fin.best), passed:a.fin.passed || b.fin.passed}}, ids = {};
  if (most(a.fin.tries, b.fin.tries)) o.fin.tries = most(a.fin.tries, b.fin.tries);
  if (most(a.fin.at, b.fin.at)) o.fin.at = most(a.fin.at, b.fin.at);
  if (most(a.at, b.at)) o.at = most(a.at, b.at);
  Object.keys(a.miles).concat(Object.keys(b.miles)).forEach(function(k){ ids[k] = 1; });
  Object.keys(ids).forEach(function(id){
    var x = a.miles[id] || {}, y = b.miles[id] || {}, xs = x.steps || {}, ys = y.steps || {}, st = {};
    Object.keys(xs).concat(Object.keys(ys)).forEach(function(k){ if (xs[k] || ys[k]) st[k] = true; });
    var r = o.miles[id] = {steps:st, best:most(x.best, y.best), passed:!!(x.passed || y.passed)};
    if (most(x.tries, y.tries)) r.tries = most(x.tries, y.tries);
    if (most(x.at, y.at)) r.at = most(x.at, y.at);
    if (x.first != null || y.first != null) r.first = x.first == null ? +y.first : y.first == null ? +x.first : Math.min(+x.first, +y.first);
    var xm = x.miss || {}, ym = y.miss || {}, miss = {}, any = false;
    Object.keys(xm).concat(Object.keys(ym)).forEach(function(k){ var c = most(xm[k], ym[k]); if (c) { miss[k] = c; any = true; } });
    if (any) r.miss = miss;
  });
  return o;
}
function hasProgress(d){ d = norm(d); return d.xp > 0 || Object.keys(d.miles).length > 0 || d.fin.best > 0; }
function readLocal(key){
  try {
    var raw = localStorage.getItem(key);
    if (raw) return norm(JSON.parse(raw));
    if (key === PACK.storage) {            /* carry over the very first single-lesson version */
      var old = localStorage.getItem(PACK.legacy);
      if (old) {
        var o = JSON.parse(old), ids = ['first', 'tie', 'left', 'round', 'bus', 'siren'], st = {}, d = blank();
        ids.forEach(function(id, i){ if (o.scenes && o.scenes[id]) st[i] = true; });
        d.xp = o.xp || 0; d.miles['right-of-way'] = {steps:st, best:o.best || 0, passed:!!o.passed};
        return d;
      }
    }
  } catch (e) {}
  return null;
}
var store = {key:PACK.storage, id:null};       /* id is the learner id when signed in */
var mem = readLocal(PACK.storage) || blank();
var pushTimer = null, syncError = null;
function writeLocal(){ lsSet(store.key, JSON.stringify(mem)); }
function save(){ writeLocal(); if (store.id) schedulePush(1500); }
function schedulePush(ms){ clearTimeout(pushTimer); var id = store.id; pushTimer = setTimeout(function(){ pushNow(id); }, ms); }
/* a learner's own phone talks to the account through its link; a signed-in parent goes direct */
function viaLink(id){ return !session && !!link && link.id === id; }
function remotePull(id){
  if (!viaLink(id)) return cloud.pull(id);
  return cloud.devicePull(link.token).then(function(r){
    if (r.error) return r;
    if (link && r.data.name && r.data.name !== link.name) { link.name = r.data.name; setLink(link); if (learner) learner.name = link.name; updateWho(); }
    return {data:r.data.data, error:null};
  });
}
function remotePut(id, data){ return viaLink(id) ? cloud.devicePut(link.token, data) : cloud.put(id, data); }
function pushNow(id){
  if (!id || !cloud.enabled()) return Promise.resolve();
  clearTimeout(pushTimer);
  return remotePull(id).then(function(r){
    if (r.error === 'unlinked') return lostLink();
    if (r.error) { syncError = r.error; noteSync(); return; }
    var mine = store.id === id ? mem : (readLocal(PACK.storage + '.' + id) || blank());
    var merged = mergeMem(mine, r.data);
    if (store.id === id) { mem = merged; writeLocal(); addXp(0); }
    return remotePut(id, merged).then(function(p){
      if (p.error === 'unlinked') return lostLink();
      syncError = p.error; noteSync();
      learners.forEach(function(l){ if (l.id === id && !p.error) l.data = merged; });
    });
  });
}
function noteSync(){ var el = $('#syncnote'); if (el) el.hidden = !syncError || !store.id; }
function useProfile(l){
  store.id = l ? l.id : null;
  store.key = l ? PACK.storage + '.' + l.id : PACK.storage;
  var local = readLocal(store.key) || blank();
  mem = l ? mergeMem(local, l.data) : local;
  writeLocal(); streak = 0; bump(false); addXp(0);
  if (l && JSON.stringify(mem) !== JSON.stringify(norm(l.data))) schedulePush(300);
}
function M(id){ return mem.miles[id] || (mem.miles[id] = {steps:{}, best:0, passed:false}); }
var streak = 0;
function bump(right){
  streak = right ? streak + 1 : 0;
  var el = $('#streak');
  if (streak >= 2) { el.hidden = false; el.textContent = 'Streak ' + streak; } else el.hidden = true;
}
function addXp(n){ if (n > 0) { mem.xp += n; save(); } $('#xp').textContent = mem.xp + ' XP'; }
function stepsDone(m){ var st = M(m.id).steps, c = 0; m.steps.forEach(function(_, i){ if (st[i]) c++; }); return c; }
function passN(n){ return Math.ceil(n * .8); }
function starsFor(score, n){ return score >= n ? 3 : score >= passN(n) ? 2 : score > 0 ? 1 : 0; }
function star(on){
  return '<svg width="30" height="30" viewBox="0 0 24 24"><path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21.1 7 14.2 2 9.3l6.9-1z" fill="' + (on ? '#F5C120' : '#E3E6DF') + '" stroke="' + (on ? '#1A2026' : '#C3C9BF') + '" stroke-width="1.4" stroke-linejoin="round"/></svg>';
}
function stars3(n){ return star(n >= 1) + star(n >= 2) + star(n >= 3); }
function mileByN(n){ for (var i = 0; i < MO.miles.length; i++) if (MO.miles[i].n === n) return MO.miles[i]; return null; }

/* ============================================================
   ACCOUNT: one parent login, a profile for each learner.
   A learner's own phone is linked to their profile with a one-time
   code from the parent, so it needs no login of its own.
   Who is using this device: a signed-in parent, else a linked learner, else a guest.
   ============================================================ */
var session = null, learner = null, learners = [], guest = lsGet('mileone.guest') === '1';
var link = (function(){ try { var o = JSON.parse(lsGet('mileone.link')); return o && o.token && o.id ? o : null; } catch (e) { return null; } })();
function setLink(o){ link = o; lsSet('mileone.link', o ? JSON.stringify(o) : null); }
function useLink(data){
  learner = {id:link.id, name:link.name, data:data || null};
  guest = false; lsSet('mileone.guest', null);
  useProfile(learner); updateWho();
}
function lostLink(){
  if (session || !link) return;
  setLink(null); learner = null; syncError = null; useProfile(null); updateWho();
  authFlash = ['This device is no longer linked to a profile. Ask a parent for a new code.', 'bad'];
  authMode = 'join'; go('welcome');
}
function fmtCode(v){ v = String(v || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 8); return v.length > 4 ? v.slice(0, 4) + '-' + v.slice(4) : v; }
var booted = false, recovery = false, authMode = 'in', authFlash = null, famError = null;

function msg(el, text, kind){ el.hidden = !text; el.className = 'fb ' + (kind || 'bad'); el.textContent = text || ''; }
function updateWho(){
  var el = $('#who');
  if (session && learner) { el.hidden = false; el.textContent = learner.name; el.href = '#family'; el.title = 'Switch learner'; }
  else if (!session && link && learner) { el.hidden = false; el.textContent = learner.name; el.href = '#home'; el.title = 'This device is linked to ' + learner.name + '\'s profile'; }
  else if (!session && guest) { el.hidden = false; el.textContent = 'Guest'; el.href = '#welcome'; el.title = 'Create an account or sign in'; }
  else el.hidden = true;
  $('#xp').hidden = !!(session && !learner) || (!session && !guest && !link);
}
function useLearner(l){
  learner = l; lsSet('mileone.last', l ? l.id : null);
  useProfile(l); updateWho();
}
function loadFamily(auto){
  return cloud.listLearners().then(function(r){
    famError = r.error; learners = r.data || [];
    if (auto && !r.error) {
      var last = lsGet('mileone.last'), hit = learners.filter(function(l){ return l.id === last; })[0];
      if (hit) useLearner(hit);
    }
  });
}
/* The parent's page shows work done on other devices, so fetch it fresh when the page opens.
   A fetched copy is dropped if the parent changed something or has a form open in the meantime. */
var famBusy = 0, famVer = 0;
function famDo(promise){ famBusy++; return promise.then(function(r){ famBusy--; famVer++; return r; }); }
function refreshFamily(){
  if (!session || !cloud.enabled() || famBusy) return;
  var v = famVer;
  cloud.listLearners().then(function(r){
    if (r.error || !session || famBusy || v !== famVer || document.querySelector('#learners .confirm')) return;
    learners = r.data || [];
    if (learner) { var hit = learners.filter(function(l){ return l.id === learner.id; })[0]; if (hit) learner = hit; }
    if (!views.family.hidden) renderFamily();
    if (!views.report.hidden) renderReport();
  });
}
function onAuth(ev, s2){
  if (ev === 'PASSWORD_RECOVERY') { session = s2; recovery = true; authMode = 'newpw'; go('welcome'); return; }
  if (ev === 'SIGNED_OUT') {
    session = null; learner = null; learners = []; lsSet('mileone.last', null);
    guest = false; lsSet('mileone.guest', null);
    if (link) { useLink(null); pushNow(link.id); go('home'); return; }   /* back to the learner this phone belongs to */
    useProfile(null); updateWho(); go('welcome'); return;
  }
  if (s2 && (ev === 'SIGNED_IN' || ev === 'TOKEN_REFRESHED' || ev === 'USER_UPDATED')) {
    var was = session && session.user ? session.user.id : null;
    session = s2;
    if (ev === 'SIGNED_IN') { guest = false; lsSet('mileone.guest', null); }
    if (ev === 'SIGNED_IN' && was !== s2.user.id && !recovery) { learner = null; loadFamily(true).then(function(){ updateWho(); go(learner ? 'home' : 'family'); }); }
  }
}

/* ---------- sign in / create account / reset ---------- */
var AUTH = {
  'in':   {title:'Sign in', go:'Sign in', note:'', pw:true, email:true},
  up:     {title:'Create a family account', go:'Create account', note:'Use a parent\'s email. You will add each learner on the next screen.', pw:true, email:true},
  forgot: {title:'Reset your password', go:'Email me a reset link', note:'Enter the email on the account and we will send a link to set a new password.', pw:false, email:true},
  newpw:  {title:'Choose a new password', go:'Save new password', note:'Type the new password for your family account.', pw:true, email:false},
  join:   {title:'Enter your learner code', go:'Link this device', note:'Ask a parent to sign in to the family account, tap Get code on your profile, and read you the code.', pw:false, email:false, code:true}
};
function renderAuth(){
  var a = AUTH[authMode];
  $('#tab-in').className = 'seg' + (authMode === 'in' ? ' on' : '');
  $('#tab-up').className = 'seg' + (authMode === 'up' ? ' on' : '');
  $('#auth-tabs').hidden = authMode === 'newpw' || authMode === 'join';
  $('#auth-title').textContent = a.title;
  $('#auth-note').textContent = a.note; $('#auth-note').hidden = !a.note;
  $('#auth-email-row').hidden = !a.email; $('#auth-pw-row').hidden = !a.pw; $('#auth-code-row').hidden = !a.code;
  $('#auth-pw').autocomplete = authMode === 'in' ? 'current-password' : 'new-password';
  $('#auth-pw-label').textContent = authMode === 'newpw' ? 'New password' : authMode === 'up' ? 'Choose a password (8 or more characters)' : 'Password';
  $('#auth-go').textContent = a.go; $('#auth-go').disabled = false;
  $('#auth-forgot').hidden = authMode !== 'in';
  $('#auth-back').hidden = authMode !== 'forgot' && authMode !== 'join';
  $('#auth-join-row').hidden = authMode === 'newpw' || authMode === 'join' || !!session;
  $('#auth-guest-row').hidden = authMode === 'newpw' || !!session;
  $('#auth-guest').textContent = link ? 'Back to ' + link.name + '\'s lessons' : guest ? 'Keep going as a guest' : 'Try it without an account';
  $('#auth-guest-fine').hidden = !!link;
  msg($('#auth-msg'), authFlash ? authFlash[0] : '', authFlash ? authFlash[1] : 'bad');
  authFlash = null;
}
function setAuthMode(m){ authMode = m; renderAuth(); }
$('#tab-in').addEventListener('click', function(){ setAuthMode('in'); });
$('#tab-up').addEventListener('click', function(){ setAuthMode('up'); });
$('#auth-forgot').addEventListener('click', function(){ setAuthMode('forgot'); });
$('#auth-back').addEventListener('click', function(){ setAuthMode('in'); });
$('#auth-join').addEventListener('click', function(){ setAuthMode('join'); $('#auth-code').focus(); });
$('#auth-code').addEventListener('input', function(){ var f = fmtCode(this.value); if (this.value !== f) this.value = f; });
$('#auth-guest').addEventListener('click', function(){
  if (link) return go('home');
  guest = true; lsSet('mileone.guest', '1'); useProfile(null); updateWho(); go('home');
});
$('#auth-form').addEventListener('submit', function(e){
  e.preventDefault();
  var email = $('#auth-email').value.trim(), pw = $('#auth-pw').value, box = $('#auth-msg'), btn = $('#auth-go'), a = AUTH[authMode];
  if (a.email && !/^\S+@\S+\.\S+$/.test(email)) return msg(box, 'Enter the parent\'s email address.');
  if (a.pw && authMode !== 'in' && pw.length < 8) return msg(box, 'Use a password with at least 8 characters.');
  if (a.pw && !pw) return msg(box, 'Enter your password.');
  var code = $('#auth-code').value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  if (a.code && code.length !== 8) return msg(box, 'Type the 8-character code a parent gave you.');
  if (!cloud.enabled()) return msg(box, 'Accounts are not available right now. You can still use the course as a guest.');
  btn.disabled = true; msg(box, 'One moment...', 'good');
  if (authMode === 'join') {
    var old = link;
    cloud.redeemCode(code).then(function(r){
      btn.disabled = false;
      if (r.error) return msg(box, r.error);
      if (old && old.token !== r.data.token) cloud.deviceUnlink(old.token);
      setLink({token:r.data.token, id:r.data.learner_id, name:r.data.name});
      $('#auth-code').value = ''; authMode = 'in';
      useLink(r.data.data); go('home');
    });
    return;
  }
  function done(r, okText){
    btn.disabled = false;
    if (r.error) return msg(box, r.error);
    msg(box, okText || '', 'good');
  }
  if (authMode === 'in') cloud.signIn(email, pw).then(function(r){ done(r, r.error ? '' : 'Signed in.'); $('#auth-pw').value = ''; });
  else if (authMode === 'up') cloud.signUp(email, pw).then(function(r){
    if (!r.error && r.data.exists) { btn.disabled = false; return msg(box, 'That email already has an account. Sign in instead.'); }
    done(r, r.error ? '' : r.data.needsConfirm ? 'Almost there. We sent a link to ' + email + '. Open it to confirm your email, then come back and sign in.' : 'Account created.');
    if (!r.error) $('#auth-pw').value = '';
  });
  else if (authMode === 'forgot') cloud.resetRequest(email).then(function(r){ done(r, 'If that email has an account, a reset link is on its way.'); });
  else cloud.setPassword(pw).then(function(r){
    btn.disabled = false;
    if (r.error) return msg(box, r.error);
    recovery = false; authMode = 'in'; $('#auth-pw').value = '';
    loadFamily(true).then(function(){ updateWho(); go(learner ? 'home' : 'family'); });
  });
});

/* ---------- a parent's view of one learner: what they have done and how well ---------- */
function ago(t){
  if (!t) return 'Not recorded yet';
  var day = function(x){ var d = new Date(x); d.setHours(0, 0, 0, 0); return d.getTime(); }, n = Math.round((day(Date.now()) - day(t)) / 86400000);
  if (n <= 0) return 'Today';
  if (n === 1) return 'Yesterday';
  if (n < 14) return n + ' days ago';
  try { return new Date(t).toLocaleDateString([], {month:'short', day:'numeric'}); } catch (e) { return n + ' days ago'; }
}
var STATE = {passed:'Passed', retry:'Quiz not passed yet', ready:'Ready for the quiz', started:'In progress', none:'Not started'};
function reportOf(d){
  d = norm(d);
  var R = {xp:d.xp, at:+d.at || 0, fin:d.fin, lessons:0, lessonsAll:0, passed:0, taken:0, pct:0, started:0, retry:[], missed:[], old:false};
  R.rows = MO.miles.map(function(m){
    var r = d.miles[m.id] || {}, done = 0, best = +r.best || 0, n = m.quiz.length, tries = +r.tries || 0;
    m.steps.forEach(function(_, i){ if (r.steps && r.steps[i]) done++; });
    var took = best > 0 || tries > 0;
    var row = {m:m, done:done, all:m.steps.length, best:best, n:n, passed:!!r.passed, tries:tries, first:r.first, at:+r.at || 0,
      state:r.passed ? 'passed' : took ? 'retry' : done === m.steps.length ? 'ready' : done ? 'started' : 'none'};
    R.lessons += done; R.lessonsAll += row.all;
    if (row.passed) R.passed++;
    if (done || took) R.started++;
    if (took) { R.taken++; R.pct += best / n; if (!tries) R.old = true; }
    if (row.state === 'retry') R.retry.push(row);
    if (row.at > R.at) R.at = row.at;
    Object.keys(r.miss || {}).forEach(function(k){ var q = m.quiz[k], c = +r.miss[k] || 0; if (q && c) R.missed.push({m:m, q:q, n:c}); });
    return row;
  });
  if (+d.fin.at > R.at) R.at = +d.fin.at;
  R.avg = R.taken ? Math.round(R.pct / R.taken * 100) : null;
  R.missed.sort(function(a, b){ return b.n - a.n || a.m.n - b.m.n; });
  return R;
}
var reportId = null;
function dataOf(l){ return l.id === store.id ? mem : l.data; }
function renderReport(){
  var l = learners.filter(function(x){ return x.id === reportId; })[0];
  if (!l) return go('family');
  var R = reportOf(dataOf(l)), name = l.name;
  $('#rp-title').textContent = name + '\'s progress';
  $('#rp-sum').textContent = !R.started && !R.fin.best
    ? name + ' has not started yet. Once they work through a lesson or take a quiz, it shows up here.'
    : name + ' has finished ' + R.lessons + ' of ' + R.lessonsAll + ' lesson steps and passed ' + R.passed + ' of ' + MO.miles.length + ' mile quizzes.' +
      (R.avg === null ? ' No quiz taken yet.' : ' Average best quiz score: ' + R.avg + '%. A pass is 80%.');
  var tiles = $('#rp-stats'); tiles.textContent = '';
  [[R.passed + '/' + MO.miles.length, 'Miles passed'], [R.avg === null ? 'None yet' : R.avg + '%', 'Average quiz score'],
   [R.fin.passed ? 'Passed' : R.fin.best ? R.fin.best + '/' + FINAL_N : 'Not taken', 'Final challenge'], [ago(R.at), 'Last active']].forEach(function(t){
    var d = h('div', 'tile'); d.appendChild(h('b', null, t[0])); d.appendChild(h('span', null, t[1])); tiles.appendChild(d);
  });

  var focus = $('#rp-focus'); focus.textContent = '';
  focus.appendChild(h('h3', 'rp-h', 'Worth going over together'));
  if (!R.retry.length && !R.missed.length) {
    focus.appendChild(h('p', 'lede', R.taken ? 'Nothing stands out. ' + name + ' has passed every quiz taken so far' + (R.old ? '.' : ' without missing a question.') : 'Nothing yet. When ' + name + ' takes a quiz, the questions they miss are listed here so you can talk them through.'));
  }
  if (R.retry.length) {
    var p = h('p', null); p.appendChild(h('b', null, 'Quiz not passed yet: '));
    p.appendChild(document.createTextNode(R.retry.map(function(r){ return 'Mile ' + r.m.n + ', ' + r.m.title + ' (best ' + r.best + ' of ' + r.n + ')'; }).join('; ') + '.'));
    focus.appendChild(p);
  }
  if (R.missed.length) {
    focus.appendChild(h('p', 'fine', 'Questions missed most on a first pass. The right answer is shown so you can ask ' + name + ' about it.'));
    var ul = h('ul', 'rp-missed');
    R.missed.slice(0, 6).forEach(function(x){
      var li = h('li');
      li.appendChild(h('span', 'rp-meta', 'Mile ' + x.m.n + ' · ' + x.m.title + ' · missed ' + x.n + (x.n === 1 ? ' time' : ' times')));
      li.appendChild(h('b', null, x.q.q));
      li.appendChild(h('span', 'rp-ans', 'Answer: ' + x.q.o[x.q.a]));
      ul.appendChild(li);
    });
    focus.appendChild(ul);
    if (R.missed.length > 6) focus.appendChild(h('p', 'fine', 'Plus ' + (R.missed.length - 6) + ' more missed once or twice.'));
  }

  var list = $('#rp-list'); list.textContent = '';
  R.rows.forEach(function(r){
    var li = h('li', 'rp-row ' + r.state), n = h('span', 'rp-n', String(r.m.n)), main = h('div', 'rp-main');
    n.setAttribute('aria-hidden', 'true');
    main.appendChild(h('b', null, r.m.title));
    var bits = ['Lessons ' + r.done + ' of ' + r.all];
    if (r.best > 0 || r.tries) {
      bits.push('Quiz best ' + r.best + ' of ' + r.n);
      if (r.first != null && r.tries > 1) bits.push('first try ' + r.first);
      if (r.tries) bits.push(r.tries + (r.tries === 1 ? ' try' : ' tries'));
    } else bits.push('Quiz not taken');
    if (r.at) bits.push(ago(r.at).toLowerCase());
    main.appendChild(h('span', 'rp-meta', bits.join(' · ')));
    var bar = h('i', 'rp-bar'), fill = h('i'); fill.style.width = Math.round(r.done / r.all * 100) + '%'; bar.appendChild(fill); main.appendChild(bar);
    li.appendChild(n); li.appendChild(main); li.appendChild(h('span', 'rp-pill', STATE[r.state]));
    li.setAttribute('aria-label', 'Mile ' + r.m.n + ', ' + r.m.title + ': ' + STATE[r.state] + '. ' + bits.join(', '));
    list.appendChild(li);
  });
  var f = R.fin, fl = h('li', 'rp-row ' + (f.passed ? 'passed' : f.best ? 'retry' : 'none')), fm = h('div', 'rp-main'), fb = [];
  fm.appendChild(h('b', null, 'Road Rules Challenge'));
  fb.push(f.best ? 'Best ' + f.best + ' of ' + FINAL_N + ' (20 to pass)' : FINAL_N + ' questions from every mile, 20 to pass');
  if (f.tries) fb.push(f.tries + (f.tries === 1 ? ' try' : ' tries'));
  if (f.at) fb.push(ago(f.at).toLowerCase());
  fm.appendChild(h('span', 'rp-meta', fb.join(' · ')));
  var star = h('span', 'rp-n fin', '\u2605'); star.setAttribute('aria-hidden', 'true');
  fl.appendChild(star); fl.appendChild(fm); fl.appendChild(h('span', 'rp-pill', f.passed ? 'Passed' : f.best ? 'Not passed yet' : 'Not taken'));
  list.appendChild(fl);

  var note = $('#rp-note');
  note.hidden = !R.old;
  note.textContent = 'Quizzes taken before this report was added show a best score only. Their try counts and missed questions start with the next attempt.';
  var acts = $('#rp-acts'); acts.textContent = '';
  var open = h('button', 'btn sm', 'Continue as ' + name); open.type = 'button';
  open.addEventListener('click', function(){ useLearner(l); go('home'); });
  var back = h('a', 'btn ghost sm', 'All learners'); back.href = '#family';
  acts.appendChild(open); acts.appendChild(back);
}

/* ---------- Who's driving? ---------- */
function statsOf(d){
  d = norm(d);
  var passed = 0, cells = MO.miles.map(function(m){
    var r = d.miles[m.id] || {}, started = r.best > 0 || Object.keys(r.steps || {}).length > 0;
    if (r.passed) passed++;
    return r.passed ? 'passed' : started ? 'started' : '';
  });
  var at = Math.max(+d.at || 0, +d.fin.at || 0);
  MO.miles.forEach(function(m){ var r = d.miles[m.id]; if (r && +r.at > at) at = +r.at; });
  return {xp:d.xp, passed:passed, cells:cells, fin:d.fin, at:at};
}
function renderFamily(){
  var box = $('#learners');
  box.textContent = '';
  msg($('#fam-msg'), famError || '', 'bad');
  $('#acct-email').textContent = session && session.user ? 'Signed in as ' + session.user.email : '';
  $('#fam-lede').textContent = learners.length ? 'Tap View progress to see what a learner has done and how well they are doing. Tap Continue to open the lessons as that learner.' : 'Add your first learner below to get started.';
  $('#add-form').hidden = learners.length >= 8;
  learners.forEach(function(l){
    var st = statsOf(l.id === store.id ? mem : l.data), card = h('div', 'lcard');
    var top = h('div', 'ltop'); top.appendChild(h('h3', null, l.name)); top.appendChild(h('span', 'state', st.xp + ' XP')); card.appendChild(top);
    var grid = h('div', 'mgrid'); grid.setAttribute('role', 'img');
    grid.setAttribute('aria-label', st.passed + ' of ' + MO.miles.length + ' miles passed');
    st.cells.forEach(function(c){ grid.appendChild(h('i', c)); });
    grid.appendChild(h('i', st.fin.passed ? 'passed fin' : st.fin.best ? 'started fin' : 'fin'));
    card.appendChild(grid);
    card.appendChild(h('p', 'fine', st.passed + ' of ' + MO.miles.length + ' miles passed. Final challenge best: ' + st.fin.best + ' of ' + FINAL_N + '.' + (st.at ? ' Last active: ' + ago(st.at).toLowerCase() + '.' : '')));
    var acts = h('div', 'acts');
    var view = h('a', 'btn sm', 'View progress'); view.href = '#report-' + l.id;
    var open = h('button', 'btn ghost sm', 'Continue as ' + l.name); open.type = 'button';
    open.addEventListener('click', function(){ useLearner(l); go('home'); });
    acts.appendChild(view);
    var getc = h('button', 'linkbtn', 'Get code'); getc.type = 'button'; getc.title = 'Link ' + l.name + '\'s own phone';
    var ren = h('button', 'linkbtn', 'Rename'); ren.type = 'button';
    var rem = h('button', 'linkbtn', 'Remove'); rem.type = 'button';
    acts.appendChild(open); acts.appendChild(getc); acts.appendChild(ren); acts.appendChild(rem); card.appendChild(acts);
    var dev = h('p', 'fine devline');
    if (l.devices) {
      dev.appendChild(document.createTextNode('Linked on ' + l.devices + (l.devices === 1 ? ' device. ' : ' devices. ')));
      var unl = h('button', 'linkbtn', l.devices === 1 ? 'Unlink it' : 'Unlink them'); unl.type = 'button'; unl.style.fontSize = '13px';
      dev.appendChild(unl);
      unl.addEventListener('click', function(){
        slot.textContent = '';
        var c = h('div', 'confirm'), ok = h('button', 'btn sm danger', 'Unlink'), no = h('button', 'btn ghost sm', 'Cancel');
        ok.type = 'button'; no.type = 'button';
        c.appendChild(h('p', null, 'Unlink ' + (l.devices === 1 ? 'the device' : 'all ' + l.devices + ' devices') + ' from ' + l.name + '\'s profile? Saved progress stays. To get back in, ' + l.name + ' will need a new code.'));
        var row = h('div', 'acts'); row.appendChild(ok); row.appendChild(no); c.appendChild(row); slot.appendChild(c);
        no.addEventListener('click', function(){ slot.textContent = ''; });
        ok.addEventListener('click', function(){
          ok.disabled = true;
          famDo(cloud.unlinkDevices(l.id)).then(function(r){ if (r.error) famError = r.error; else { famError = null; l.devices = 0; } renderFamily(); });
        });
      });
    } else dev.textContent = 'No phone linked yet. Tap Get code to link ' + l.name + '\'s own phone.';
    card.appendChild(dev);
    var slot = h('div'); card.appendChild(slot);
    getc.addEventListener('click', function(){
      slot.textContent = ''; getc.disabled = true;
      famDo(cloud.createCode(l.id)).then(function(r){
        getc.disabled = false;
        if (r.error) { famError = r.error; return renderFamily(); }
        var code = fmtCode(r.data.code), until = '';
        try { until = new Date(r.data.expires_at).toLocaleString([], {weekday:'long', hour:'numeric', minute:'2-digit'}); } catch (e) {}
        var c = h('div', 'confirm codebox');
        c.appendChild(h('p', 'fine', 'One-time code for ' + l.name));
        var big = h('p', 'code', code); big.setAttribute('aria-label', 'Code: ' + code.replace('-', '').split('').join(' '));
        c.appendChild(big);
        c.appendChild(h('p', null, 'On ' + l.name + '\'s phone, open ' + location.host + ', tap "I have a learner code" and type this in. After that the phone opens straight to ' + l.name + '\'s lessons.'));
        c.appendChild(h('p', 'fine', 'Works once. Good for 48 hours' + (until ? ' (until ' + until + ')' : '') + '. Getting another code cancels this one.'));
        var text = PACK.brand + ' code for ' + l.name + ': ' + code + '. Open ' + location.origin + location.pathname + '#join-' + code.replace('-', '') + ' on your phone to link it. Works once, good for 48 hours.';
        var canShare = !!navigator.share, send = h('button', 'btn sm', canShare ? 'Send it' : 'Copy a message'), done = h('button', 'btn ghost sm', 'Done');
        send.type = 'button'; done.type = 'button';
        var row = h('div', 'acts'); row.appendChild(send); row.appendChild(done); c.appendChild(row); slot.appendChild(c);
        done.addEventListener('click', function(){ slot.textContent = ''; refreshFamily(); });
        send.addEventListener('click', function(){
          function copied(){ send.textContent = 'Copied'; setTimeout(function(){ send.textContent = canShare ? 'Send it' : 'Copy a message'; }, 2000); }
          function copy(){
            try { navigator.clipboard.writeText(text).then(copied, function(){ send.textContent = 'Could not copy'; }); }
            catch (e) { send.textContent = 'Could not copy'; }
          }
          if (canShare) navigator.share({text:text}).catch(function(e){ if (!e || e.name !== 'AbortError') copy(); });
          else copy();
        });
      });
    });
    ren.addEventListener('click', function(){
      slot.textContent = '';
      var f = h('form', 'confirm plain'), inp = h('input'), ok = h('button', 'btn sm', 'Save'), no = h('button', 'btn ghost sm', 'Cancel');
      inp.type = 'text'; inp.maxLength = 24; inp.value = l.name; inp.id = 'ren-' + l.id; inp.setAttribute('aria-label', 'New name for ' + l.name);
      ok.type = 'submit'; no.type = 'button';
      var row = h('div', 'acts'); row.appendChild(ok); row.appendChild(no);
      f.appendChild(inp); f.appendChild(row); slot.appendChild(f); inp.focus();
      no.addEventListener('click', function(){ slot.textContent = ''; });
      f.addEventListener('submit', function(e){
        e.preventDefault();
        var name = inp.value.trim();
        if (!name) return;
        famDo(cloud.renameLearner(l.id, name)).then(function(r){ if (r.error) { famError = r.error; } else { l.name = name; famError = null; if (learner && learner.id === l.id) updateWho(); } renderFamily(); });
      });
    });
    rem.addEventListener('click', function(){
      slot.textContent = '';
      var c = h('div', 'confirm'), ok = h('button', 'btn sm danger', 'Remove ' + l.name), no = h('button', 'btn ghost sm', 'Cancel');
      ok.type = 'button'; no.type = 'button';
      c.appendChild(h('p', null, 'Remove ' + l.name + ' and all of their saved progress? This cannot be undone.'));
      var row = h('div', 'acts'); row.appendChild(ok); row.appendChild(no); c.appendChild(row); slot.appendChild(c);
      no.addEventListener('click', function(){ slot.textContent = ''; });
      ok.addEventListener('click', function(){
        ok.disabled = true;
        famDo(cloud.removeLearner(l.id)).then(function(r){
          if (r.error) famError = r.error;
          else {
            famError = null; learners = learners.filter(function(x){ return x.id !== l.id; });
            lsSet(PACK.storage + '.' + l.id, null);
            if (learner && learner.id === l.id) { learner = null; useProfile(null); lsSet('mileone.last', null); updateWho(); }
          }
          renderFamily();
        });
      });
    });
    box.appendChild(card);
  });
}
$('#add-form').addEventListener('submit', function(e){
  e.preventDefault();
  var inp = $('#add-name'), name = inp.value.trim();
  if (!name) return msg($('#fam-msg'), 'Type a first name or nickname for the learner.');
  famDo(cloud.addLearner(name)).then(function(r){
    if (r.error) famError = r.error; else { famError = null; learners.push(r.data); inp.value = ''; }
    renderFamily();
  });
});
$('#signout').addEventListener('click', function(){
  var id = store.id;
  (id ? pushNow(id) : Promise.resolve()).then(function(){ return cloud.signOut(); }).then(function(r){ if (r && r.error) { famError = r.error; renderFamily(); } });
});

/* ---------- drawing a step's picture ---------- */
function sceneOf(vis){ return typeof vis.scene === 'string' ? MO.scenes[vis.scene] : vis.scene; }
function draw(svg, ctl, vis, still){
  while (svg.firstChild) svg.removeChild(svg.firstChild);
  if (ctl) ctl.textContent = '';
  if (vis.scene) { var sc = sceneOf(vis); return {sc:sc, stage:new MO.Stage(svg, sc, still)}; }
  svg.setAttribute('viewBox', '0 0 400 400');
  MO.figs[vis.fig](svg, vis, ctl || null);
  return {};
}
function restT(sc){ return sc.thumb != null ? sc.thumb : sc.freeze != null ? sc.freeze : 0; }

/* ============================================================
   HOME
   ============================================================ */
var views = {auth:$('#view-auth'), family:$('#view-family'), report:$('#view-report'), home:$('#view-home'), lesson:$('#view-lesson'), quiz:$('#view-quiz')};
function renderNotices(){
  var device = store.id ? readLocal(PACK.storage) : null, claim = $('#claim');
  var offer = !!(device && hasProgress(device) && lsGet('mileone.claimskip.' + store.id) !== '1');
  claim.hidden = !offer;
  if (offer) $('#claim-text').textContent = 'This device has progress saved from before ' + (session ? 'you signed in' : 'it was linked') + ' (' + device.xp + ' XP). Add it to ' + learner.name + '\'s profile?';
  $('#guestnote').hidden = !!session || !guest || !!link;
  var par = !!(session && learner);
  $('#parentnote').hidden = !par;
  if (par) {
    $('#parent-text').textContent = 'You are signed in to the family account and viewing ' + learner.name + '\'s lessons. Anything done here counts as ' + learner.name + '\'s progress.';
    $('#parent-report').textContent = learner.name + '\'s progress'; $('#parent-report').href = '#report-' + learner.id;
  }
  var ln = !session && !!link;
  $('#linknote').hidden = !ln; $('#link-slot').hidden = true; $('#link-slot').textContent = '';
  if (ln) $('#link-text').textContent = 'This device is linked to ' + link.name + '\'s profile. Progress saves to the family account.';
  noteSync();
}
$('#link-off').addEventListener('click', function(){
  if (!link) return;
  var slot = $('#link-slot'), c = h('div', 'confirm'), ok = h('button', 'btn sm danger', 'Unlink'), no = h('button', 'btn ghost sm', 'Cancel');
  ok.type = 'button'; no.type = 'button';
  slot.textContent = ''; slot.hidden = false;
  c.appendChild(h('p', null, 'Unlink this device from ' + link.name + '\'s profile? Saved progress stays in the family account. To link again you will need a new code from a parent.'));
  var row = h('div', 'acts'); row.appendChild(ok); row.appendChild(no); c.appendChild(row); slot.appendChild(c);
  no.addEventListener('click', function(){ slot.hidden = true; slot.textContent = ''; });
  ok.addEventListener('click', function(){
    ok.disabled = true;
    var old = link;
    pushNow(old.id).then(function(){
      if (link !== old) return;                    /* already cut off from the parent's side */
      cloud.deviceUnlink(old.token);
      setLink(null); learner = null; syncError = null; useProfile(null); updateWho(); go('welcome');
    });
  });
});
$('#claim-yes').addEventListener('click', function(){
  var device = readLocal(PACK.storage);
  if (device && store.id) { mem = mergeMem(mem, device); lsSet(PACK.storage, null); lsSet(PACK.legacy, null); save(); addXp(0); }
  renderHome();
});
$('#claim-no').addEventListener('click', function(){ lsSet('mileone.claimskip.' + store.id, '1'); renderNotices(); });
function renderHome(){
  renderNotices();
  var passed = MO.miles.filter(function(m){ return M(m.id).passed; }).length;
  $('#st-xp').textContent = mem.xp;
  $('#st-miles').textContent = passed + '/' + MO.miles.length;
  $('#st-final').textContent = mem.fin.best + '/' + FINAL_N;
  var map = $('#map'), nextMarked = false;
  map.textContent = '';
  MO.miles.forEach(function(m){
    var st = M(m.id), done = stepsDone(m), all = m.steps.length, isNext = !st.passed && !nextMarked;
    if (isNext) nextMarked = true;
    var li = h('li', 'stop' + (st.passed ? ' passed' : '') + (isNext ? ' next' : ''));
    var post = h('div', 'post');
    post.appendChild(h('small', null, 'MILE')); post.appendChild(h('b', null, String(m.n)));
    li.appendChild(post);
    var card = h('div', 'stopcard'), txt = h('div', 'txt');
    txt.appendChild(h('h3', null, m.title)); txt.appendChild(h('p', null, m.blurb));
    card.appendChild(txt);
    var acts = h('div', 'acts');
    if (st.best) {
      var mi = h('div', 'minis'); mi.setAttribute('aria-label', starsFor(st.best, m.quiz.length) + ' of 3 stars');
      mi.innerHTML = stars3(starsFor(st.best, m.quiz.length)); acts.appendChild(mi);
    } else if (done) acts.appendChild(h('span', 'state', done + ' of ' + all + ' steps'));
    var a = h('a', 'btn sm' + (isNext ? '' : ' ghost'), done === 0 ? 'Start' : done < all ? 'Keep going' : 'Review');
    a.href = '#mile-' + m.n; acts.appendChild(a);
    if (done === all) { var q = h('a', 'btn sm' + (st.passed ? ' ghost' : ''), st.best ? 'Retake quiz' : 'Quiz'); q.href = '#quiz-' + m.n; acts.appendChild(q); }
    card.appendChild(acts);
    li.appendChild(card); map.appendChild(li);
  });
  var fl = h('li', 'stop final'), fp = h('div', 'post');
  fp.appendChild(h('small', null, 'END')); fp.appendChild(h('b', null, '★'));
  fl.appendChild(fp);
  var fc = h('div', 'stopcard'), ft = h('div', 'txt');
  ft.appendChild(h('h3', null, 'Road Rules Challenge'));
  ft.appendChild(h('p', null, FINAL_N + ' questions pulled from every mile. Score ' + passN(FINAL_N) + ' to earn the Road Ready badge.'));
  fc.appendChild(ft);
  var fa = h('div', 'acts');
  if (mem.fin.best) { var fm = h('div', 'minis'); fm.innerHTML = stars3(starsFor(mem.fin.best, FINAL_N)); fa.appendChild(fm); }
  var fb = h('a', 'btn sm', mem.fin.best ? 'Try again' : 'Take the challenge'); fb.href = '#final'; fa.appendChild(fb);
  fc.appendChild(fa); fl.appendChild(fc); map.appendChild(fl);
}

/* ============================================================
   LESSON
   ============================================================ */
var cur = {mile:null, i:0, phase:'learn'}, stage = null, runId = 0, onReplay = null;
function setCap(text){ var el = $('#caption'); el.hidden = !text; if (el.textContent !== (text || '')) el.textContent = text || ''; }
function capAt(sc, t){
  if (!sc.captions) return '';
  var txt = sc.captions[0][1];
  sc.captions.forEach(function(c){ if (t >= c[0]) txt = c[1]; });
  return txt;
}
function capFn(sc){ return function(t){ setCap(capAt(sc, t)); }; }
function drawDots(){
  var dots = $('#dots'), m = cur.mile, st = M(m.id).steps;
  dots.textContent = '';
  m.steps.forEach(function(_, i){
    var li = h('li', i === cur.i ? 'now' : st[i] ? 'done' : '');
    li.setAttribute('aria-label', 'Step ' + (i + 1) + (i === cur.i ? ', current' : st[i] ? ', done' : ''));
    dots.appendChild(li);
  });
}
function markDone(i, xp){
  var rec = M(cur.mile.id), st = rec.steps;
  if (!st[i]) { st[i] = true; rec.at = mem.at = Date.now(); addXp(xp); return true; }
  return false;
}
function countText(tail){ return 'Step ' + (cur.i + 1) + ' of ' + cur.mile.steps.length + ': ' + tail; }
function lastStep(){ return cur.i >= cur.mile.steps.length - 1; }

/* Step part 1: teach. Rule on screen, picture or animation shown in full. */
function openStep(i){
  var m = cur.mile, st = m.steps[i];
  cur.i = i; cur.phase = 'learn'; ++runId;
  $('#scene').hidden = false; $('#recap').hidden = true;
  if (stage) stage.cancel();
  var v = draw($('#stage'), $('#ctl'), st.show, false);
  if (v.stage && !(v.sc.duration > 0)) { v.stage.setTime(restT(v.sc)); v = {}; }   /* a still picture, not an animation */
  stage = v.stage || null;
  $('#count').textContent = countText(v.stage ? 'watch first' : 'learn it');
  $('#stitle').textContent = st.title;
  $('#setup').textContent = st.setup || ''; $('#setup').hidden = !st.setup;
  $('#ask').hidden = true; $('#choices').hidden = true; $('#fb').hidden = true;
  $('#rule-t').textContent = st.rule; $('#rule-w').textContent = st.why || ''; $('#rule').hidden = false;
  $('#next').textContent = st.try ? 'Now you try one' : lastStep() ? 'See the cheat sheet' : 'Next step';
  $('#actions').hidden = false;
  $('#under').hidden = !v.stage;
  $('#replay').textContent = reduce ? 'Play' : 'Replay';
  if (v.stage) {
    var sc = v.sc;
    if (reduce) { stage.setTime(restT(sc)); setCap(capAt(sc, restT(sc))); }
    else { setCap(capAt(sc, 0)); stage.play(0, sc.duration, capFn(sc)); }
    onReplay = function(){ stage.play(0, sc.duration, capFn(sc)); };
  } else { setCap(st.cap || ''); onReplay = null; }
  if (!st.try) markDone(i, 5);
  drawDots();
}

/* Step part 2: her turn. */
function openTry(){
  var m = cur.mile, i = cur.i, st = m.steps[i], T = st.try, my = ++runId;
  cur.phase = 'practice';
  if (stage) stage.cancel();
  var v = draw($('#stage'), $('#ctl'), T.show || st.show, false), sc = v.sc;
  if (v.stage && !(sc.duration > 0)) { v.stage.setTime(restT(sc)); v = {}; sc = null; }
  stage = v.stage || null;
  var fz = sc ? (T.freeze != null ? T.freeze : sc.freeze || 0) : 0;
  $('#count').textContent = countText('your turn');
  var setup = T.setup || (v.stage ? (T.show ? 'Same rule, new situation. Watch, then make the call.' : 'Same scene again. This time you make the call.') : '');
  $('#setup').textContent = setup; $('#setup').hidden = !setup;
  $('#ask').hidden = true; $('#choices').hidden = true; $('#fb').hidden = true; $('#rule').hidden = true; $('#actions').hidden = true;
  $('#under').hidden = !v.stage;
  $('#replay').textContent = 'Replay';
  $('#next').textContent = lastStep() ? 'See the cheat sheet' : 'Next step';
  var asked = false, answered = false;
  function after(){
    if (my !== runId) return;
    $('#rule').hidden = false; $('#actions').hidden = false;
    drawDots();
  }
  function ask(){
    if (my !== runId || asked) return;
    asked = true;
    if (v.stage) $('#setup').hidden = true;
    $('#ask').textContent = T.ask; $('#ask').hidden = false;
    var box = $('#choices');
    box.textContent = ''; box.hidden = false;
    T.choices.forEach(function(label, ci){
      var b = h('button', 'choice');
      b.type = 'button'; b.appendChild(h('span', null, label));
      b.addEventListener('click', function(){ choose(ci); });
      box.appendChild(b);
    });
  }
  function choose(ci){
    if (my !== runId || answered) return;
    answered = true;
    var right = ci === T.answer;
    Array.prototype.forEach.call($('#choices').children, function(b, bi){
      b.disabled = true;
      if (bi === T.answer) { b.classList.add('right'); b.appendChild(h('span', 'mark', 'Correct')); }
      else if (bi === ci) { b.classList.add('wrong'); b.appendChild(h('span', 'mark', 'Not this one')); }
    });
    bump(right);
    var first = markDone(i, right ? 10 : 3);
    var fb = $('#fb');
    fb.className = 'fb ' + (right ? 'good' : 'bad');
    fb.textContent = (right ? 'Good call.' : 'Not quite.') + (T.why ? ' ' + T.why : '') + (v.stage ? (right ? ' Watch it play out.' : ' Watch what happens.') : '') + (first && right ? ' +10 XP' : '');
    fb.hidden = false;
    if (v.stage) {
      try { $('#stage').parentNode.scrollIntoView({block:'start', behavior: reduce ? 'auto' : 'smooth'}); } catch (e) {}
      stage.play(fz, sc.duration, capFn(sc)).then(function(ok){ if (ok) after(); });
    } else {
      if (T.reveal) draw($('#stage'), $('#ctl'), T.reveal, false);
      after();
    }
  }
  if (v.stage) {
    onReplay = function(){
      if (!answered) stage.play(0, fz, capFn(sc)).then(function(ok){ if (ok) ask(); });
      else stage.play(0, sc.duration, capFn(sc)).then(function(ok){ if (ok) after(); });
    };
    if (reduce) { stage.setTime(fz); setCap(capAt(sc, fz)); ask(); }
    else { setCap(capAt(sc, 0)); stage.play(0, fz, capFn(sc)).then(function(ok){ if (ok) ask(); }); }
  } else { setCap(T.cap || ''); onReplay = null; ask(); }
}
$('#replay').addEventListener('click', function(){ if (onReplay) onReplay(); });
$('#next').addEventListener('click', function(){
  var st = cur.mile.steps[cur.i];
  if (cur.phase === 'learn' && st.try) openTry();
  else if (!lastStep()) openStep(cur.i + 1);
  else showRecap();
  window.scrollTo(0, 0);
});
$('#again').addEventListener('click', function(){ openStep(0); window.scrollTo(0, 0); });
function showRecap(){
  var m = cur.mile;
  runId++;
  if (stage) stage.cancel();
  $('#scene').hidden = true; $('#recap').hidden = false;
  cur.i = -1; drawDots();
  $('#rc-eyebrow').textContent = 'Mile ' + m.n + ' cheat sheet';
  $('#rc-lede').textContent = 'Look these over once, then take the quiz. You need ' + passN(m.quiz.length) + ' of ' + m.quiz.length + ' to earn the ' + m.badge + ' badge.';
  $('#rc-quiz').href = '#quiz-' + m.n;
  var box = $('#cheats');
  box.textContent = '';
  m.steps.forEach(function(st){
    var card = h('div', 'cheat'), holder = h('div', 'stage');
    var svg = s('svg', {role:'img', 'aria-label':st.title}, holder);
    card.appendChild(holder); card.appendChild(h('p', null, st.rule));
    box.appendChild(card);
    var v = draw(svg, null, st.show, true);
    if (v.stage) v.stage.setTime(restT(v.sc));
  });
}
function openLesson(m){
  cur.mile = m;
  $('#l-eyebrow').textContent = 'Mile ' + m.n;
  $('#l-title').textContent = m.title;
  var st = M(m.id).steps, next = 0;
  for (var i = 0; i < m.steps.length; i++) { if (!st[i]) { next = i; break; } }
  openStep(next);
}

/* ============================================================
   QUIZ (one mile, or the final challenge)
   ============================================================ */
var Q = null, queue = [], qpos = 0, retry = [], score = 0, mainRun = true, missed = [];
function shuffle(a){ for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function startQuiz(cfg){
  Q = cfg;
  $('#q-eyebrow').textContent = cfg.eyebrow; $('#q-title').textContent = cfg.title;
  queue = cfg.items.map(function(_, i){ return i; });
  qpos = 0; retry = []; score = 0; mainRun = true; missed = [];
  $('#qbody').hidden = false; $('#result').hidden = true;
  showQ();
}
function showQ(){
  var q = Q.items[queue[qpos]];
  $('#qcount').textContent = (mainRun ? 'Question ' : 'Second look ') + (qpos + 1) + ' of ' + queue.length;
  $('#qphase').textContent = mainRun ? '' : 'The ones you missed';
  $('#qbar').style.width = (qpos / queue.length * 100) + '%';
  $('#qstagecol').hidden = !q.show;
  if (q.show) {
    var v = draw($('#qstage'), null, q.show, true);
    if (v.stage) v.stage.setTime(q.show.t != null ? q.show.t : restT(v.sc));
  }
  $('#qask').textContent = q.q;
  $('#qfb').hidden = true; $('#qactions').hidden = true;
  var box = $('#qchoices');
  box.textContent = '';
  q.o.forEach(function(label, ci){
    var b = h('button', 'choice');
    b.type = 'button'; b.appendChild(h('span', null, label));
    b.addEventListener('click', function(){ answer(ci); });
    box.appendChild(b);
  });
}
function answer(ci){
  var qi = queue[qpos], q = Q.items[qi], right = ci === q.a;
  Array.prototype.forEach.call($('#qchoices').children, function(b, bi){
    b.disabled = true;
    if (bi === q.a) { b.classList.add('right'); b.appendChild(h('span', 'mark', 'Correct')); }
    else if (bi === ci) { b.classList.add('wrong'); b.appendChild(h('span', 'mark', 'Not this one')); }
  });
  bump(right);
  if (right && mainRun) score++;
  if (!right) retry.push(qi);
  if (!right && mainRun) missed.push(qi);
  var fb = $('#qfb');
  fb.className = 'fb ' + (right ? 'good' : 'bad');
  fb.textContent = (right ? 'Right. ' : 'Not quite. ') + q.why;
  fb.hidden = false;
  var last = qpos === queue.length - 1;
  $('#qnext').textContent = !last ? 'Next question' : retry.length ? 'Try the ones I missed' : 'See my result';
  $('#qactions').hidden = false;
  $('#qbar').style.width = ((qpos + 1) / queue.length * 100) + '%';
}
$('#qnext').addEventListener('click', function(){
  qpos++;
  if (qpos < queue.length) showQ();
  else if (retry.length) { queue = retry; retry = []; qpos = 0; mainRun = false; showQ(); }
  else showResult();
  window.scrollTo(0, 0);
});
$('#r-retry').addEventListener('click', function(){ route(); });
function showResult(){
  var n = Q.items.length, need = passN(n), pass = score >= need, rec = Q.rec();
  var gained = Math.max(0, score - rec.best) * Q.per + (pass && !rec.passed ? Q.bonus : 0);
  if (!rec.tries && !rec.best && rec.first == null && Q.track) rec.first = score;   /* only a true first attempt */
  rec.tries = (+rec.tries || 0) + 1;
  rec.at = mem.at = Date.now();
  if (Q.track && missed.length) {
    rec.miss = rec.miss || {};
    missed.forEach(function(qi){ rec.miss[qi] = (+rec.miss[qi] || 0) + 1; });
  }
  if (score > rec.best) rec.best = score;
  if (pass) rec.passed = true;
  save(); addXp(gained);
  $('#qbody').hidden = true; $('#result').hidden = false;
  $('#r-eyebrow').textContent = Q.eyebrow + ' result';
  $('#stars').innerHTML = stars3(starsFor(score, n));
  $('#r-score').textContent = score;
  $('#r-of').textContent = ' of ' + n + ' on the first try';
  $('#r-title').textContent = score === n ? 'Perfect run' : pass ? Q.passTitle : 'Close. Run it again.';
  $('#r-line').textContent = pass
    ? 'The real MVD written test needs 80 percent. You cleared that here.'
    : 'You need ' + need + ' of ' + n + ' to pass, the same 80 percent the real MVD test asks for. Review the steps you missed, then try again.';
  $('#r-badge').hidden = !rec.passed;
  $('#r-badge-name').textContent = Q.badge;
  $('#r-badge-line').textContent = 'Badge earned for scoring ' + need + ' or more.';
  $('#r-xp').textContent = gained ? '+' + gained + ' XP this round. Total ' + mem.xp + ' XP.' : 'Total ' + mem.xp + ' XP. Beat your best score to earn more.';
  var c = $('#confetti');
  c.textContent = '';
  if (pass && !reduce) {
    var cols = ['#0A6A4E', '#F5C120', '#2C78D4', '#C3342B'];
    for (var i = 0; i < 44; i++) {
      var p = document.createElement('i');
      p.style.left = (Math.random() * 100) + '%'; p.style.background = cols[i % 4]; p.style.animationDelay = (Math.random() * .7) + 's';
      c.appendChild(p);
    }
  }
}
function mileQuiz(m){
  startQuiz({items:m.quiz, eyebrow:'Mile ' + m.n + ' quiz', title:m.title, badge:m.badge, rec:function(){ return M(m.id); }, track:true, per:15, bonus:50, passTitle:'You passed this mile'});
}
function finalQuiz(){
  var pool = [];
  MO.miles.forEach(function(m){ m.quiz.forEach(function(q){ pool.push(q); }); });
  startQuiz({items:shuffle(pool).slice(0, FINAL_N), eyebrow:'Final challenge', title:'Road Rules Challenge', badge:'Road Ready', rec:function(){ return mem.fin; }, per:20, bonus:200, passTitle:'You are road ready'});
}

/* ============================================================
   ROUTING: #welcome, #family, #report-<learner id>, #home, #mile-6, #quiz-6, #final
   ============================================================ */
function show(v){ for (var k in views) views[k].hidden = k !== v; $('#boot').hidden = true; }
function go(hash){ if (location.hash === '#' + hash) route(); else location.hash = hash; }
function route(){
  if (!booted) return;
  var hash = (location.hash || (session ? '#family' : '#home')).slice(1), m;   /* a parent opening the site lands on the family page */
  runId++;
  if (stage) { stage.cancel(); stage = null; }
  window.scrollTo(0, 0);
  if (recovery) { show('auth'); authMode = 'newpw'; renderAuth(); return; }
  if (hash === 'join' || hash.indexOf('join-') === 0) {        /* a link a parent sent, with the code filled in */
    if (!session) { authMode = 'join'; $('#auth-code').value = fmtCode(hash.slice(5)); }
    try { history.replaceState(null, '', location.pathname + '#welcome'); } catch (e) {}
    hash = 'welcome';
  }
  if (hash === 'welcome') {
    if (session) return go(learner ? 'home' : 'family');
    show('auth'); renderAuth(); return;
  }
  if (!session && !guest && !link) return go('welcome');
  if (hash.indexOf('report-') === 0) {
    if (!session) return go(link || guest ? 'home' : 'welcome');
    reportId = hash.slice(7);
    $('#learners').textContent = '';
    show('report'); renderReport(); refreshFamily(); return;
  }
  if (session && (hash === 'family' || !learner)) {
    if (hash !== 'family') return go('family');
    show('family'); renderFamily(); refreshFamily(); return;
  }
  if (hash === 'family') return go(link ? 'home' : 'welcome');
  if (hash.indexOf('mile-') === 0 && (m = mileByN(+hash.slice(5)))) { show('lesson'); openLesson(m); }
  else if (hash.indexOf('quiz-') === 0 && (m = mileByN(+hash.slice(5)))) { show('quiz'); mileQuiz(m); }
  else if (hash === 'final') { show('quiz'); finalQuiz(); }
  else { show('home'); renderHome(); }
}
window.addEventListener('hashchange', route);
document.addEventListener('visibilitychange', function(){
  var back = document.visibilityState !== 'hidden';
  if (back && session && (!views.family.hidden || !views.report.hidden)) refreshFamily();
  if (!store.id) return;
  if (!back) pushNow(store.id);        /* save before the tab goes away */
  else pushNow(store.id).then(function(){ if (!views.home.hidden) renderHome(); });   /* pick up progress from another device */
});
window.addEventListener('online', function(){ if (store.id) pushNow(store.id); });

function boot(){
  /* a failed email link comes back as #error=...&error_description=... */
  var raw = location.hash || '';
  if (raw.indexOf('error_description=') >= 0) {
    try { authFlash = [decodeURIComponent(raw.split('error_description=')[1].split('&')[0].replace(/\+/g, ' ')) + '. Ask for a new link below.', 'bad']; } catch (e) {}
    try { history.replaceState(null, '', location.pathname); } catch (e) {}
  }
  addXp(0);
  cloud.init().then(function(s0){
    session = s0;
    cloud.onAuth(function(ev, s2){ setTimeout(function(){ onAuth(ev, s2); }, 0); });
    return session ? loadFamily(true) : null;
  }).then(function(){
    if (!session && link) {          /* a learner's own phone: open their saved copy now, then catch up with the account */
      useLink(null);
      pushNow(link.id).then(function(){ if (link && !views.home.hidden) renderHome(); });
    }
    booted = true; updateWho();
    if ((location.hash || '').indexOf('access_token=') >= 0) { try { history.replaceState(null, '', location.pathname); } catch (e) {} }
    route();
  });
}
MO.app = {route:route, quiz:function(){ return {items:Q.items, queue:queue, pos:qpos}; }, mem:function(){ return mem; }};
boot();
})();
