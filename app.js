/* Mile One app: accounts, learner profiles, progress, the map, lessons, quizzes. */
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
function blank(){ return {xp:0, miles:{}, fin:{best:0, passed:false}}; }
function norm(d){
  d = d && typeof d === 'object' ? d : {};
  return {xp:+d.xp || 0, miles:d.miles && typeof d.miles === 'object' ? d.miles : {}, fin:{best:(d.fin && +d.fin.best) || 0, passed:!!(d.fin && d.fin.passed)}};
}
/* progress only ever grows, so two copies combine by taking the most from each */
function mergeMem(a, b){
  a = norm(a); b = norm(b);
  var o = {xp:Math.max(a.xp, b.xp), miles:{}, fin:{best:Math.max(a.fin.best, b.fin.best), passed:a.fin.passed || b.fin.passed}}, ids = {};
  Object.keys(a.miles).concat(Object.keys(b.miles)).forEach(function(k){ ids[k] = 1; });
  Object.keys(ids).forEach(function(id){
    var x = a.miles[id] || {}, y = b.miles[id] || {}, xs = x.steps || {}, ys = y.steps || {}, st = {};
    Object.keys(xs).concat(Object.keys(ys)).forEach(function(k){ if (xs[k] || ys[k]) st[k] = true; });
    o.miles[id] = {steps:st, best:Math.max(+x.best || 0, +y.best || 0), passed:!!(x.passed || y.passed)};
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
function pushNow(id){
  if (!id || !cloud.enabled()) return Promise.resolve();
  clearTimeout(pushTimer);
  return cloud.pull(id).then(function(r){
    if (r.error) { syncError = r.error; noteSync(); return; }
    var mine = store.id === id ? mem : (readLocal(PACK.storage + '.' + id) || blank());
    var merged = mergeMem(mine, r.data);
    if (store.id === id) { mem = merged; writeLocal(); addXp(0); }
    return cloud.put(id, merged).then(function(p){
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
   ACCOUNT: one parent login, a profile for each learner
   ============================================================ */
var session = null, learner = null, learners = [], guest = lsGet('mileone.guest') === '1';
var booted = false, recovery = false, authMode = 'in', authFlash = null, famError = null;

function msg(el, text, kind){ el.hidden = !text; el.className = 'fb ' + (kind || 'bad'); el.textContent = text || ''; }
function updateWho(){
  var el = $('#who');
  if (session && learner) { el.hidden = false; el.textContent = learner.name; el.href = '#family'; el.title = 'Switch learner'; }
  else if (!session && guest) { el.hidden = false; el.textContent = 'Guest'; el.href = '#welcome'; el.title = 'Create an account or sign in'; }
  else el.hidden = true;
  $('#xp').hidden = !!(session && !learner) || (!session && !guest);
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
function onAuth(ev, s2){
  if (ev === 'PASSWORD_RECOVERY') { session = s2; recovery = true; authMode = 'newpw'; go('welcome'); return; }
  if (ev === 'SIGNED_OUT') {
    session = null; learner = null; learners = []; lsSet('mileone.last', null);
    guest = false; lsSet('mileone.guest', null);
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
  newpw:  {title:'Choose a new password', go:'Save new password', note:'Type the new password for your family account.', pw:true, email:false}
};
function renderAuth(){
  var a = AUTH[authMode];
  $('#tab-in').className = 'seg' + (authMode === 'in' ? ' on' : '');
  $('#tab-up').className = 'seg' + (authMode === 'up' ? ' on' : '');
  $('#auth-tabs').hidden = authMode === 'newpw';
  $('#auth-title').textContent = a.title;
  $('#auth-note').textContent = a.note; $('#auth-note').hidden = !a.note;
  $('#auth-email-row').hidden = !a.email; $('#auth-pw-row').hidden = !a.pw;
  $('#auth-pw').autocomplete = authMode === 'in' ? 'current-password' : 'new-password';
  $('#auth-pw-label').textContent = authMode === 'newpw' ? 'New password' : authMode === 'up' ? 'Choose a password (8 or more characters)' : 'Password';
  $('#auth-go').textContent = a.go; $('#auth-go').disabled = false;
  $('#auth-forgot').hidden = authMode !== 'in';
  $('#auth-back').hidden = authMode !== 'forgot';
  $('#auth-guest-row').hidden = authMode === 'newpw' || !!session;
  $('#auth-guest').textContent = guest ? 'Keep going as a guest' : 'Try it without an account';
  msg($('#auth-msg'), authFlash ? authFlash[0] : '', authFlash ? authFlash[1] : 'bad');
  authFlash = null;
}
function setAuthMode(m){ authMode = m; renderAuth(); }
$('#tab-in').addEventListener('click', function(){ setAuthMode('in'); });
$('#tab-up').addEventListener('click', function(){ setAuthMode('up'); });
$('#auth-forgot').addEventListener('click', function(){ setAuthMode('forgot'); });
$('#auth-back').addEventListener('click', function(){ setAuthMode('in'); });
$('#auth-guest').addEventListener('click', function(){ guest = true; lsSet('mileone.guest', '1'); useProfile(null); updateWho(); go('home'); });
$('#auth-form').addEventListener('submit', function(e){
  e.preventDefault();
  var email = $('#auth-email').value.trim(), pw = $('#auth-pw').value, box = $('#auth-msg'), btn = $('#auth-go'), a = AUTH[authMode];
  if (a.email && !/^\S+@\S+\.\S+$/.test(email)) return msg(box, 'Enter the parent\'s email address.');
  if (a.pw && authMode !== 'in' && pw.length < 8) return msg(box, 'Use a password with at least 8 characters.');
  if (a.pw && !pw) return msg(box, 'Enter your password.');
  if (!cloud.enabled()) return msg(box, 'Accounts are not available right now. You can still use the course as a guest.');
  btn.disabled = true; msg(box, 'One moment...', 'good');
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

/* ---------- Who's driving? ---------- */
function statsOf(d){
  d = norm(d);
  var passed = 0, cells = MO.miles.map(function(m){
    var r = d.miles[m.id] || {}, started = r.best > 0 || Object.keys(r.steps || {}).length > 0;
    if (r.passed) passed++;
    return r.passed ? 'passed' : started ? 'started' : '';
  });
  return {xp:d.xp, passed:passed, cells:cells, fin:d.fin};
}
function renderFamily(){
  var box = $('#learners');
  box.textContent = '';
  msg($('#fam-msg'), famError || '', 'bad');
  $('#acct-email').textContent = session && session.user ? 'Signed in as ' + session.user.email : '';
  $('#fam-lede').textContent = learners.length ? 'Pick a profile to continue. Each learner\'s progress is saved separately, and you can see everyone\'s here.' : 'Add your first learner below to get started.';
  $('#add-form').hidden = learners.length >= 8;
  learners.forEach(function(l){
    var st = statsOf(l.id === store.id ? mem : l.data), card = h('div', 'lcard');
    var top = h('div', 'ltop'); top.appendChild(h('h3', null, l.name)); top.appendChild(h('span', 'state', st.xp + ' XP')); card.appendChild(top);
    var grid = h('div', 'mgrid'); grid.setAttribute('role', 'img');
    grid.setAttribute('aria-label', st.passed + ' of ' + MO.miles.length + ' miles passed');
    st.cells.forEach(function(c){ grid.appendChild(h('i', c)); });
    grid.appendChild(h('i', st.fin.passed ? 'passed fin' : st.fin.best ? 'started fin' : 'fin'));
    card.appendChild(grid);
    card.appendChild(h('p', 'fine', st.passed + ' of ' + MO.miles.length + ' miles passed. Final challenge best: ' + st.fin.best + ' of ' + FINAL_N + '.'));
    var acts = h('div', 'acts');
    var open = h('button', 'btn sm', 'Continue as ' + l.name); open.type = 'button';
    open.addEventListener('click', function(){ useLearner(l); go('home'); });
    var ren = h('button', 'linkbtn', 'Rename'); ren.type = 'button';
    var rem = h('button', 'linkbtn', 'Remove'); rem.type = 'button';
    acts.appendChild(open); acts.appendChild(ren); acts.appendChild(rem); card.appendChild(acts);
    var slot = h('div'); card.appendChild(slot);
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
        cloud.renameLearner(l.id, name).then(function(r){ if (r.error) { famError = r.error; } else { l.name = name; famError = null; if (learner && learner.id === l.id) updateWho(); } renderFamily(); });
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
        cloud.removeLearner(l.id).then(function(r){
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
  cloud.addLearner(name).then(function(r){
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
var views = {auth:$('#view-auth'), family:$('#view-family'), home:$('#view-home'), lesson:$('#view-lesson'), quiz:$('#view-quiz')};
function renderNotices(){
  var device = store.id ? readLocal(PACK.storage) : null, claim = $('#claim');
  var offer = !!(device && hasProgress(device) && lsGet('mileone.claimskip.' + store.id) !== '1');
  claim.hidden = !offer;
  if (offer) $('#claim-text').textContent = 'This device has progress saved from before you signed in (' + device.xp + ' XP). Add it to ' + learner.name + '\'s profile?';
  $('#guestnote').hidden = !!session || !guest;
  noteSync();
}
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
  var st = M(cur.mile.id).steps;
  if (!st[i]) { st[i] = true; addXp(xp); return true; }
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
var Q = null, queue = [], qpos = 0, retry = [], score = 0, mainRun = true;
function shuffle(a){ for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function startQuiz(cfg){
  Q = cfg;
  $('#q-eyebrow').textContent = cfg.eyebrow; $('#q-title').textContent = cfg.title;
  queue = cfg.items.map(function(_, i){ return i; });
  qpos = 0; retry = []; score = 0; mainRun = true;
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
  startQuiz({items:m.quiz, eyebrow:'Mile ' + m.n + ' quiz', title:m.title, badge:m.badge, rec:function(){ return M(m.id); }, per:15, bonus:50, passTitle:'You passed this mile'});
}
function finalQuiz(){
  var pool = [];
  MO.miles.forEach(function(m){ m.quiz.forEach(function(q){ pool.push(q); }); });
  startQuiz({items:shuffle(pool).slice(0, FINAL_N), eyebrow:'Final challenge', title:'Road Rules Challenge', badge:'Road Ready', rec:function(){ return mem.fin; }, per:20, bonus:200, passTitle:'You are road ready'});
}

/* ============================================================
   ROUTING: #welcome, #family, #home, #mile-6, #quiz-6, #final
   ============================================================ */
function show(v){ for (var k in views) views[k].hidden = k !== v; $('#boot').hidden = true; }
function go(hash){ if (location.hash === '#' + hash) route(); else location.hash = hash; }
function route(){
  if (!booted) return;
  var hash = (location.hash || '#home').slice(1), m;
  runId++;
  if (stage) { stage.cancel(); stage = null; }
  window.scrollTo(0, 0);
  if (recovery) { show('auth'); authMode = 'newpw'; renderAuth(); return; }
  if (hash === 'welcome') {
    if (session) return go(learner ? 'home' : 'family');
    show('auth'); renderAuth(); return;
  }
  if (!session && !guest) return go('welcome');
  if (session && (hash === 'family' || !learner)) {
    if (hash !== 'family') return go('family');
    show('family'); renderFamily(); return;
  }
  if (hash === 'family') return go('welcome');
  if (hash.indexOf('mile-') === 0 && (m = mileByN(+hash.slice(5)))) { show('lesson'); openLesson(m); }
  else if (hash.indexOf('quiz-') === 0 && (m = mileByN(+hash.slice(5)))) { show('quiz'); mileQuiz(m); }
  else if (hash === 'final') { show('quiz'); finalQuiz(); }
  else { show('home'); renderHome(); }
}
window.addEventListener('hashchange', route);
document.addEventListener('visibilitychange', function(){
  if (!store.id) return;
  if (document.visibilityState === 'hidden') pushNow(store.id);        /* save before the tab goes away */
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
    booted = true; updateWho();
    if ((location.hash || '').indexOf('access_token=') >= 0) { try { history.replaceState(null, '', location.pathname); } catch (e) {} }
    route();
  });
}
MO.app = {route:route, quiz:function(){ return {items:Q.items, queue:queue, pos:qpos}; }, mem:function(){ return mem; }};
boot();
})();
