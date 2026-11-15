/* Mile One diagram types. Each one draws into a 400 x 400 SVG.
   fn(svg, params, ctl): ctl is an optional HTML box for controls (null in thumbnails). */
(function(){
'use strict';
var MO = window.MO, s = MO.s, tx = MO.tx, txs = MO.txs, INK = MO.INK;
var MUTED = '#56616A';

function clear(svg){ while (svg.firstChild) svg.removeChild(svg.firstChild); }
function bg(svg, fill){ s('rect', {x:0, y:0, width:400, height:400, fill:fill || '#EEF1EA'}, svg); }
function mark(svg, kind, x, y, size){
  if (kind.slice(0, 2) === 'L:') return MO.light(svg, kind.slice(2), x, y, size);
  if (kind.slice(0, 2) === 'H:') return MO.hawk(svg, kind.slice(2), x, y, size);
  return MO.sign(svg, kind, x, y, size);
}
MO.figBg = bg; MO.figClear = clear; MO.mark = mark;

/* grid of signs or signal heads with a label under each: items [[kind, label], ...] */
MO.figs.signs = function(svg, p){
  bg(svg);
  var it = p.items, n = it.length, cols = p.cols || (n <= 3 ? n : n === 4 ? 2 : 3), rows = Math.ceil(n / cols);
  var top = p.title ? 40 : 6, H = 400 - top - 6, cw = 400 / cols, ch = H / rows;
  if (p.title) tx(svg, 200, 28, p.title, {size:16, weight:900});
  var fs = n <= 2 ? 16 : n <= 4 ? 14 : 12.5, maxLines = 0;
  it.forEach(function(item){ if (item[1]) maxLines = Math.max(maxLines, item[1].split('|').length); });
  var labelH = maxLines ? maxLines * fs * 1.18 + 10 : 0;
  var size = Math.min(cw * .74, ch - labelH - 16, p.max || 190);
  it.forEach(function(item, i){
    var row = Math.floor(i / cols), inRow = row === rows - 1 ? n - cols * (rows - 1) : cols;
    var cx = (400 - inRow * cw) / 2 + cw * (i % cols + .5);
    var cy = top + row * ch + (ch - labelH) / 2 + 2;
    mark(svg, item[0], cx, cy, size);
    if (item[1]) txs(svg, cx, cy + size / 2 + fs + 5, item[1], {size:fs, weight:800});
  });
};

/* numbered steps along a strip of road: items [{t, d, k, tone}] */
MO.figs.steps = function(svg, p){
  bg(svg);
  var it = p.items, n = it.length, top = p.title ? 44 : 12, rh = (400 - top - 10) / n;
  if (p.title) tx(svg, 200, 28, p.title, {size:16, weight:900});
  s('rect', {x:22, y:top - 2, width:36, height:400 - top - 6, rx:8, fill:'#2A3037'}, svg);
  s('line', {x1:40, y1:top + 4, x2:40, y2:390, stroke:'#F5C120', 'stroke-width':2, 'stroke-dasharray':'10 10'}, svg);
  it.forEach(function(item, i){
    var cy = top + rh * (i + .5), tone = item.tone || 'good';
    var fill = {good:'#0A6A4E', bad:'#C3342B', warn:'#F5C120', dark:INK}[tone];
    s('rect', {x:24, y:cy - 15, width:32, height:30, rx:5, fill:fill, stroke:'#fff', 'stroke-width':2}, svg);
    tx(svg, 40, cy + 6, item.k != null ? item.k : String(i + 1), {size:17, weight:900, fill: tone === 'warn' ? INK : '#fff'});
    var dl = item.d ? item.d.split('|').length : 0, blockH = 17 + dl * 16.5, y = cy - blockH / 2 + 14;
    tx(svg, 72, y, item.t, {anchor:'start', size:17, weight:900});
    if (item.d) txs(svg, 72, y + 19, item.d, {anchor:'start', size:14, weight:700, fill:MUTED, lh:16.5});
  });
};

/* rows with a big number or icon and a label: items [{big, unit, label, sign, chip, color}] */
MO.figs.tiles = function(svg, p){
  bg(svg);
  var it = p.items, n = it.length, top = p.title ? 44 : 10;
  if (p.title) tx(svg, 200, 28, p.title, {size:16, weight:900});
  var rh = Math.min(124, (400 - top - 8) / n), y0 = top + ((400 - top - 8) - rh * n) / 2;
  it.forEach(function(item, i){
    var y = y0 + rh * i, x = 30, cy = y + rh / 2;
    s('rect', {x:14, y:y + 4, width:372, height:rh - 8, rx:12, fill:'#fff', stroke:'#D5DAD1', 'stroke-width':1.5}, svg);
    if (item.chip) { s('rect', {x:14, y:y + 4, width:16, height:rh - 8, rx:6, fill:item.chip, stroke:INK, 'stroke-width':1.5}, svg); x = 44; }
    if (item.sign) { var sz = Math.min(rh - 22, 66); mark(svg, item.sign, x + sz / 2, cy, sz); x += sz + 12; }
    if (item.big) {
      var bs = p.bs || Math.min(40, rh * .42) * (item.big.length > 5 ? .72 : 1);
      tx(svg, x, cy + bs * .36, item.big, {anchor:'start', size:bs, weight:900, fill:item.color || INK});
      var bw = item.big.length * bs * .62;
      if (item.unit) tx(svg, x + bw + 5, cy + bs * .36, item.unit, {anchor:'start', size:14, fill:MUTED});
      x += bw + (item.unit ? item.unit.length * 8 + 14 : 10);
    }
    var lines = (item.label || '').split('|'), lx = Math.max(x + 4, p.lx || 150), ls = 15, lh = 18;
    lines.forEach(function(ln, j){ tx(svg, lx, cy - (lines.length - 1) * lh / 2 + 5 + j * lh, ln, {anchor:'start', size:ls, weight:700}); });
  });
};

/* top-down car with five seats: seats {fl, fr, rl, rm, rr} each {tone, label} */
MO.figs.seats = function(svg, p){
  bg(svg);
  s('rect', {x:92, y:22, width:216, height:356, rx:54, fill:'#D5DBE0', stroke:INK, 'stroke-width':3}, svg);
  s('path', {d:'M114,98 Q200,72 286,98 L274,128 Q200,112 126,128 Z', fill:'#16212B', opacity:.82}, svg);
  s('path', {d:'M126,322 Q200,338 274,322 L282,342 Q200,360 118,342 Z', fill:'#16212B', opacity:.6}, svg);
  var POS = {fl:[150,194,70,66], fr:[250,194,70,66], rl:[134,276,56,62], rm:[200,276,56,62], rr:[266,276,56,62]};
  var FILL = {you:'#2C78D4', ok:'#0A6A4E', no:'#C3342B', kid:'#F5C120', empty:'#AEB7BE'};
  Object.keys(POS).forEach(function(k){
    var d = (p.seats && p.seats[k]) || {tone:'empty'}, q = POS[k], tone = d.tone || 'empty';
    s('rect', {x:q[0] - q[2]/2, y:q[1] - q[3]/2, width:q[2], height:q[3], rx:12, fill:FILL[tone], stroke:INK, 'stroke-width':2}, svg);
    if (tone !== 'empty') s('circle', {cx:q[0], cy:q[1] - 12, r:11, fill:'#3B2F2A', stroke:'#fff', 'stroke-width':1.5}, svg);
    if (d.label) txs(svg, q[0], q[1] + (tone === 'empty' ? 3 : 13), d.label, {size:10.5, weight:900, fill: tone === 'kid' || tone === 'empty' ? INK : '#fff', lh:11.5});
  });
  s('circle', {cx:150, cy:146, r:14, fill:'none', stroke:INK, 'stroke-width':4}, svg);
  if (p.note) MO.pill(svg, 200, 388, p.note, p.noteTone || 'dark', 10);
};

/* grid of hour blocks: n cells, the last `dark` of them shown as night */
MO.figs.grid = function(svg, p){
  bg(svg);
  var n = p.n, cols = p.cols || 6, rows = Math.ceil(n / cols), cs = Math.min(54, 348 / cols), x0 = 200 - cols * cs / 2, y0 = 54;
  if (p.title) tx(svg, 200, 32, p.title, {size:17, weight:900});
  for (var i = 0; i < n; i++) {
    var x = x0 + (i % cols) * cs, y = y0 + Math.floor(i / cols) * cs, night = i >= n - p.dark;
    s('rect', {x:x + 3, y:y + 3, width:cs - 6, height:cs - 6, rx:8, fill: night ? '#1F2A44' : '#F5C120', stroke:INK, 'stroke-width':1.5}, svg);
    if (night) s('path', {d:'M' + (x + cs/2 + 5) + ',' + (y + cs/2 - 9) + ' a10,10 0 1,0 4,15 a8,8 0 1,1 -4,-15', fill:'#F4E9B8'}, svg);
    else s('circle', {cx:x + cs/2, cy:y + cs/2, r:7, fill:'#fff', stroke:'#B88A00', 'stroke-width':1.5}, svg);
  }
  var ly = y0 + rows * cs + 26;
  s('rect', {x:52, y:ly - 13, width:18, height:18, rx:4, fill:'#F5C120', stroke:INK, 'stroke-width':1.5}, svg);
  tx(svg, 78, ly + 1, p.a, {anchor:'start', size:14});
  s('rect', {x:222, y:ly - 13, width:18, height:18, rx:4, fill:'#1F2A44', stroke:INK, 'stroke-width':1.5}, svg);
  tx(svg, 248, ly + 1, p.b, {anchor:'start', size:14});
};

/* 24-hour clock with a shaded block from h0 to h1 */
MO.figs.clock = function(svg, p){
  bg(svg);
  var cx = 200, cy = 186, r = 124;
  function pt(h, rr){ var a = (h / 24 * 360 - 90) * Math.PI / 180; return [cx + rr * Math.cos(a), cy + rr * Math.sin(a)]; }
  s('circle', {cx:cx, cy:cy, r:r, fill:'#FFF6D6', stroke:INK, 'stroke-width':3}, svg);
  var a = pt(p.h0, r), b = pt(p.h1, r), large = ((p.h1 - p.h0 + 24) % 24) > 12 ? 1 : 0;
  s('path', {d:'M' + cx + ',' + cy + ' L' + a[0].toFixed(1) + ',' + a[1].toFixed(1) + ' A' + r + ',' + r + ' 0 ' + large + ',1 ' + b[0].toFixed(1) + ',' + b[1].toFixed(1) + ' Z', fill:'#1F2A44', stroke:INK, 'stroke-width':2}, svg);
  for (var h = 0; h < 24; h++) { var o = pt(h, r), i = pt(h, r - (h % 6 === 0 ? 14 : 7)); s('line', {x1:o[0], y1:o[1], x2:i[0], y2:i[1], stroke: h >= p.h0 && h < p.h1 ? '#fff' : INK, 'stroke-width': h % 6 === 0 ? 3 : 1.5}, svg); }
  tx(svg, 200, 48, 'MIDNIGHT', {size:12, ls:1}); tx(svg, 200, 336, 'NOON', {size:12, ls:1});
  tx(svg, 352, 190, '6 AM', {size:12, ls:1}); tx(svg, 48, 190, '6 PM', {size:12, ls:1});
  var m = pt((p.h0 + p.h1) / 2, r * .62);
  if (p.label) MO.pill(svg, Math.min(300, m[0] + 20), m[1], p.label, 'bad', 11);
  s('circle', {cx:cx, cy:cy, r:5, fill:INK}, svg);
  if (p.note) txs(svg, 200, 368, p.note, {size:14, weight:800});
};

/* one big signal head with its meaning; buttons switch between states */
MO.SIG = {
  red:['Red', 'Stop behind the line.|Stay stopped.'],
  yellow:['Yellow', 'Stop if you have not|entered yet. Do not|speed up to beat it.'],
  green:['Green', 'Go, once the|intersection is clear.'],
  'flash-red':['Flashing red', 'Same as a stop sign:|full stop, then go|when it is clear.'],
  'flash-yellow':['Flashing yellow', 'Slow down and|go through|with caution.'],
  'arrow-green':['Green arrow', 'Go the way the|arrow points when|the way is clear.'],
  'arrow-yellow':['Yellow arrow', 'The arrow is ending.|Stop if you have|not entered yet.'],
  'arrow-red':['Red arrow', 'No turn in the|direction of|the arrow.'],
  'flash-arrow-yellow':['Flashing yellow arrow', 'You may turn after|yielding to oncoming|cars and walkers.'],
  dark:['Dark', 'Not working. Treat|it as a four-way stop.']
};
MO.figs.sig = function(svg, p, ctl){
  var cur = p.state || p.states[0], btns = [];
  function draw(){
    clear(svg); bg(svg);
    MO.light(svg, cur, 104, 200, 310);
    var d = MO.SIG[cur], small = d[0].length > 15;
    tx(svg, 278, 150, d[0], {size: small ? 17 : 24, weight:900});
    txs(svg, 278, 186, d[1], {size:15, weight:700, lh:20});
    btns.forEach(function(b){ b.el.className = 'seg' + (b.st === cur ? ' on' : ''); b.el.setAttribute('aria-pressed', b.st === cur); });
  }
  if (ctl) p.states.forEach(function(st){
    var b = document.createElement('button');
    b.type = 'button'; b.textContent = MO.SIG[st][0];
    b.addEventListener('click', function(){ cur = st; draw(); });
    ctl.appendChild(b); btns.push({el:b, st:st});
  });
  draw();
};

/* stopping distance against speed, with a slider */
MO.figs.stopdist = function(svg, p, ctl){
  var mph = p.mph || 45, lab = null;
  function draw(){
    clear(svg); bg(svg);
    var react = mph * 1.467 * 1.5, brake = mph * mph / 21, total = react + brake, k = 340 / 435;
    tx(svg, 200, 52, 'Stopping from ' + mph + ' mph', {size:24, weight:900});
    tx(svg, 30, 98, 'See it and react (1.5 seconds)', {anchor:'start', size:14});
    s('rect', {x:30, y:106, width:react * k, height:30, rx:4, fill:'#F5C120', stroke:INK, 'stroke-width':1.5}, svg);
    tx(svg, 30 + react * k + 8, 127, Math.round(react) + ' ft', {anchor:'start', size:15, weight:900});
    tx(svg, 30, 176, 'Braking (dry road, good tires)', {anchor:'start', size:14});
    s('rect', {x:30, y:184, width:brake * k, height:30, rx:4, fill:'#C3342B', stroke:INK, 'stroke-width':1.5}, svg);
    tx(svg, 30 + brake * k + 8, 205, Math.round(brake) + ' ft', {anchor:'start', size:15, weight:900});
    tx(svg, 30, 256, 'Total', {anchor:'start', size:14});
    s('rect', {x:30, y:264, width:react * k, height:30, fill:'#F5C120', stroke:INK, 'stroke-width':1.5}, svg);
    s('rect', {x:30 + react * k, y:264, width:brake * k, height:30, fill:'#C3342B', stroke:INK, 'stroke-width':1.5}, svg);
    tx(svg, 200, 340, Math.round(total) + ' feet', {size:34, weight:900});
    tx(svg, 200, 366, 'about ' + Math.round(total / 15) + ' car lengths', {size:15, fill:MUTED});
    tx(svg, 200, 390, 'An estimate. Wet roads and worn tires take longer.', {size:11, weight:700, fill:MUTED});
    if (lab) lab.textContent = 'Speed: ' + mph + ' mph (drag to change)';
  }
  if (ctl) {
    lab = document.createElement('label'); lab.setAttribute('for', 'f-speed');
    var r = document.createElement('input'); r.type = 'range'; r.id = 'f-speed'; r.min = 15; r.max = 75; r.step = 5; r.value = mph;
    r.addEventListener('input', function(){ mph = +r.value; draw(); });
    ctl.appendChild(lab); ctl.appendChild(r);
  }
  draw();
};

/* parking on a hill: which way the front wheels turn */
MO.HILL = {
  down:['Downhill, with a curb', 'Wheels RIGHT, toward the curb', 25, true, 'If it rolls, the curb stops it.'],
  upcurb:['Uphill, with a curb', 'Wheels LEFT, away from the curb', -25, true, 'It rolls back until the wheel rests on the curb.'],
  upnone:['Uphill, no curb', 'Wheels RIGHT', 25, false, 'If it rolls, it leaves the road, away from traffic.']
};
MO.figs.hill = function(svg, p, ctl){
  var cur = p.mode || 'down', btns = [];
  function draw(){
    clear(svg); bg(svg, '#E4DDC7');
    var d = MO.HILL[cur], ang = p.hide ? 0 : d[2], curb = d[3], up = cur !== 'down';
    s('rect', {x:96, y:0, width:214, height:400, fill:'#474D55'}, svg);
    s('line', {x1:122, y1:0, x2:122, y2:400, stroke:'#F3C01F', 'stroke-width':3}, svg);
    if (curb) { s('rect', {x:310, y:0, width:34, height:400, fill:'#CBC7BC'}, svg); s('rect', {x:306, y:0, width:8, height:400, fill:'#8E8B82'}, svg); tx(svg, 366, 204, 'CURB', {size:11, ls:1}); }
    else tx(svg, 356, 204, 'NO CURB', {size:11, ls:1});
    var cx = curb ? 262 : 252, cy = 214;
    var car = s('g', {transform:'translate(' + cx + ' ' + cy + ')'}, svg);
    [[-33, -36, true], [33, -36, true], [-33, 40, false], [33, 40, false]].forEach(function(w){
      s('rect', {x:-6, y:-15, width:12, height:30, rx:3, fill:'#111', stroke:'#fff', 'stroke-width':1.5, transform:'translate(' + w[0] + ' ' + w[1] + ') rotate(' + (w[2] ? ang : 0) + ')'}, car);
    });
    s('rect', {x:-30, y:-58, width:60, height:116, rx:16, fill:'#2C78D4', stroke:'rgba(0,0,0,.5)', 'stroke-width':1.5}, car);
    s('rect', {x:-23, y:-32, width:46, height:20, rx:5, fill:'#16212B', opacity:.82}, car);
    s('rect', {x:-21, y:26, width:42, height:14, rx:5, fill:'#16212B', opacity:.65}, car);
    var ax = 48;
    MO.arrow(svg, ax, up ? 120 : 280, ax, up ? 280 : 120, {color:INK, w:5, head:10});
    txs(svg, ax, up ? 100 : 316, up ? 'DOWNHILL|is behind you' : 'DOWNHILL|is ahead', {size:11, weight:900, lh:13});
    s('rect', {x:10, y:8, width:380, height:44, rx:10, fill:'#fff', stroke:INK, 'stroke-width':2.5}, svg);
    tx(svg, 200, 37, p.hide ? d[0] + ': which way?' : d[1], {size:17, weight:900});
    if (!p.hide) { s('rect', {x:10, y:352, width:380, height:38, rx:10, fill:'#1A2026'}, svg); tx(svg, 200, 376, d[4], {size:13, fill:'#fff'}); }
    MO.pill(svg, cx, cy + 4, 'PARKING BRAKE ON', 'warn', 8);
    btns.forEach(function(b){ b.el.className = 'seg' + (b.st === cur ? ' on' : ''); b.el.setAttribute('aria-pressed', b.st === cur); });
  }
  if (ctl && !p.hide && !p.lock) ['down', 'upcurb', 'upnone'].forEach(function(st){
    var b = document.createElement('button');
    b.type = 'button'; b.textContent = MO.HILL[st][0];
    b.addEventListener('click', function(){ cur = st; draw(); });
    ctl.appendChild(b); btns.push({el:b, st:st});
  });
  draw();
};
})();
