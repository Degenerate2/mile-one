/* Mile One engine: drawing kit, road layouts, vehicles, the animated Stage.
   Nothing in this file is specific to one state or one lesson. */
(function(){
'use strict';

var MO = window.MO = {
  miles: [], scenes: {}, figs: {},
  PACK: { brand:'Mile One', state:'Arizona', code:'AZ', storage:'mileone.az.v2', legacy:'mileone.az.v1' }
};
MO.mile = function(m){ MO.miles.push(m); MO.miles.sort(function(a, b){ return a.n - b.n; }); };
MO.scene = function(id, def){ MO.scenes[id] = def; return def; };

var NS = 'http://www.w3.org/2000/svg';
var FONT = 'Overpass,Arial Narrow,Arial,sans-serif';
var INK = '#1A2026';

function s(tag, attrs, parent){
  var e = document.createElementNS(NS, tag);
  if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}
function tx(g, x, y, str, o){
  o = o || {};
  var a = {x:x, y:y, 'text-anchor':o.anchor || 'middle', 'font-family':FONT, 'font-weight':o.weight || 800, 'font-size':o.size || 12, fill:o.fill || INK};
  if (o.ls != null) a['letter-spacing'] = o.ls;
  var t = s('text', a, g);
  t.textContent = str;
  return t;
}
/* multi-line text: "|" is a line break */
function txs(g, x, y, str, o){
  o = o || {};
  var lh = o.lh || (o.size || 12) * 1.18;
  String(str).split('|').forEach(function(ln, i){ tx(g, x, y + i*lh, ln, o); });
}
var TONE = {you:'#2C78D4', dark:INK, good:'#0A6A4E', bad:'#C3342B', warn:'#F5C120'};
function pill(g, x, y, text, tone, size){
  size = size || 9;
  var w = text.length * size * .66 + size * 1.4, hh = size * 1.7;
  var q = s('g', {transform:'translate(' + x + ' ' + y + ')'}, g);
  s('rect', {x:-w/2, y:-hh/2, width:w, height:hh, rx:hh/2, fill:TONE[tone] || INK, stroke:'#fff', 'stroke-width':1.3}, q);
  tx(q, 0, size * .37, text, {size:size, fill: tone === 'warn' ? INK : '#fff', ls:.5});
  return {g:q, w:w};
}
function head(g, x, y, ang, color, sz){
  sz = sz || 7;
  s('path', {d:'M0,0 L' + (-sz*1.6) + ',' + (-sz*.85) + ' L' + (-sz*1.6) + ',' + (sz*.85) + ' Z', fill:color, transform:'translate(' + x + ' ' + y + ') rotate(' + ang + ')'}, g);
}
function arrow(g, x1, y1, x2, y2, o){
  o = o || {};
  var c = o.color || INK, ang = Math.atan2(y2 - y1, x2 - x1), sz = o.head || 7;
  var ln = s('line', {x1:x1, y1:y1, x2:x2 - Math.cos(ang)*sz, y2:y2 - Math.sin(ang)*sz, stroke:c, 'stroke-width':o.w || 3, 'stroke-linecap':'round'}, g);
  if (o.dash) ln.setAttribute('stroke-dasharray', o.dash);
  head(g, x2, y2, ang * 180/Math.PI, c, sz);
}
function arrowPath(g, d, o){
  o = o || {};
  var c = o.color || INK;
  var p = s('path', {d:d, fill:'none', stroke:c, 'stroke-width':o.w || 3, 'stroke-linecap':'round'}, g);
  if (o.dash) p.setAttribute('stroke-dasharray', o.dash);
  var L = p.getTotalLength(), a = p.getPointAtLength(Math.max(0, L - 4)), b = p.getPointAtLength(L);
  head(g, b.x, b.y, Math.atan2(b.y - a.y, b.x - a.x) * 180/Math.PI, c, o.head || 7);
}
function dim(g, x1, y1, x2, y2, label){
  var ang = Math.atan2(y2 - y1, x2 - x1), nx = -Math.sin(ang)*6, ny = Math.cos(ang)*6;
  s('line', {x1:x1, y1:y1, x2:x2, y2:y2, stroke:INK, 'stroke-width':1.6}, g);
  s('line', {x1:x1-nx, y1:y1-ny, x2:x1+nx, y2:y1+ny, stroke:INK, 'stroke-width':1.6}, g);
  s('line', {x1:x2-nx, y1:y2-ny, x2:x2+nx, y2:y2+ny, stroke:INK, 'stroke-width':1.6}, g);
  if (label) pill(g, (x1+x2)/2, (y1+y2)/2, label, 'dark', 10);
}
function oct(cx, cy, r){
  var p = [];
  for (var i = 0; i < 8; i++) { var a = (22.5 + 45*i) * Math.PI/180; p.push((cx + r*Math.cos(a)).toFixed(1) + ',' + (cy + r*Math.sin(a)).toFixed(1)); }
  return p.join(' ');
}
MO.s = s; MO.tx = tx; MO.txs = txs; MO.pill = pill; MO.arrow = arrow; MO.arrowPath = arrowPath; MO.dim = dim; MO.oct = oct; MO.INK = INK; MO.FONT = FONT;

/* ---------- path helpers for scenes ---------- */
MO.up = function(x, y0, y1){ return 'M' + x + ',' + (y0 == null ? 430 : y0) + ' L' + x + ',' + (y1 == null ? -30 : y1); };
MO.down = function(x, y0, y1){ return 'M' + x + ',' + (y0 == null ? -30 : y0) + ' L' + x + ',' + (y1 == null ? 430 : y1); };
/* drive up in lane x1, change to lane x2 between ya and yb (ya > yb) */
MO.shift = function(x1, x2, ya, yb, y0, y1){
  var m = (ya - yb) * .45;
  return 'M' + x1 + ',' + (y0 == null ? 430 : y0) + ' L' + x1 + ',' + ya + ' C' + x1 + ',' + (ya - m) + ' ' + x2 + ',' + (yb + m) + ' ' + x2 + ',' + yb + ' L' + x2 + ',' + (y1 == null ? -30 : y1);
};
MO.CAR = {you:'#2C78D4', orange:'#E8772E', purple:'#8A5CC2', gray:'#97A0A8', green:'#3F9B6B', red:'#C8423A', white:'#E9ECEE', teal:'#2E9AA3'};
MO.YOU = {text:'YOU', from:0, to:99, tone:'you'};

/* ---------- signs ---------- */
MO.sign = function(g, kind, x, y, size){
  var q = s('g', {transform:'translate(' + x + ' ' + y + ') scale(' + (size/100) + ')'}, g);
  var i = kind.indexOf(':'), k = i < 0 ? kind : kind.slice(0, i), arg = i < 0 ? '' : kind.slice(i + 1);
  var W = '#fff', Y = '#F7C81E', R = '#C3342B', O = '#F08A24', GR = '#0A6A4E', YG = '#CBE32E', BLANK = '#C5CDD4';
  function poly(pts, fill, stroke, sw){ return s('polygon', {points:pts, fill:fill, stroke:stroke || 'none', 'stroke-width':sw || 0, 'stroke-linejoin':'round'}, q); }
  function T(str, yy, sz, fill, xx){ return tx(q, xx || 0, yy, str, {size:sz, fill:fill || INK, weight:900}); }
  function block(str, cy, maxW, maxSz, fill){
    var ls = str.split('|'), n = ls.length, longest = 1;
    ls.forEach(function(l){ longest = Math.max(longest, l.length); });
    var sz = Math.min(maxSz, maxW / (longest * .7)), lh = sz * 1.08, y0 = cy - (n - 1) * lh / 2 + sz * .36;
    ls.forEach(function(l, j){ T(l, y0 + j * lh, sz, fill); });
  }
  function diamond(fill){
    poly('0,-50 50,0 0,50 -50,0', fill, INK, 2.5);
    s('polygon', {points:'0,-42 42,0 0,42 -42,0', fill:'none', stroke:INK, 'stroke-width':1.5}, q);
  }
  function glyph(name){
    if (name === 'curve') { s('path', {d:'M-10,28 L-10,2 Q-10,-14 6,-14 L12,-14', fill:'none', stroke:INK, 'stroke-width':8}, q); poly('10,-27 28,-14 10,-1', INK); }
    else if (name === 'merge') { s('path', {d:'M4,30 L4,-14', fill:'none', stroke:INK, 'stroke-width':8}, q); poly('-8,-12 4,-30 16,-12', INK); s('path', {d:'M-20,30 Q-20,8 2,-2', fill:'none', stroke:INK, 'stroke-width':7}, q); }
    else if (name === 'cross') { s('line', {x1:0, y1:-30, x2:0, y2:30, stroke:INK, 'stroke-width':9}, q); s('line', {x1:-27, y1:0, x2:27, y2:0, stroke:INK, 'stroke-width':7}, q); }
    else if (name === 'signal') { s('rect', {x:-10, y:-27, width:20, height:54, rx:5, fill:INK}, q); s('circle', {cx:0, cy:-16, r:6, fill:'#FF3B30'}, q); s('circle', {cx:0, cy:0, r:6, fill:'#FFC21F'}, q); s('circle', {cx:0, cy:16, r:6, fill:'#2EDB6E'}, q); }
    else if (name === 'tee') { s('line', {x1:-26, y1:-8, x2:26, y2:-8, stroke:INK, 'stroke-width':8}, q); s('line', {x1:0, y1:-8, x2:0, y2:30, stroke:INK, 'stroke-width':8}, q); }
    else block(name, 0, 60, 17);
  }
  switch (k) {
    case 'stop':
      poly(oct(0, 0, 50), R); s('polygon', {points:oct(0, 0, 44), fill:'none', stroke:W, 'stroke-width':3}, q); T('STOP', 11, 30, W); break;
    case 'yield':
      poly('-50,-43 50,-43 0,45', R, R, 4); poly('-29,-31 29,-31 0,20', W); T('YIELD', -15, 11.5, R); break;
    case 'shape':
      if (arg === 'oct') poly(oct(0, 0, 48), BLANK, INK, 3);
      else if (arg === 'tri') poly('-48,-41 48,-41 0,43', BLANK, INK, 3);
      else if (arg === 'diamond') poly('0,-50 50,0 0,50 -50,0', BLANK, INK, 3);
      else if (arg === 'rect') s('rect', {x:-34, y:-46, width:68, height:92, rx:5, fill:BLANK, stroke:INK, 'stroke-width':3}, q);
      else if (arg === 'pent') poly('0,-50 46,-14 46,48 -46,48 -46,-14', BLANK, INK, 3);
      else if (arg === 'circle') s('circle', {cx:0, cy:0, r:47, fill:BLANK, stroke:INK, 'stroke-width':3}, q);
      else if (arg === 'pennant') poly('-48,-34 50,0 -48,34', BLANK, INK, 3);
      break;
    case 'warn': diamond(Y); glyph(arg); break;
    case 'work': diamond(O); glyph(arg); break;
    case 'speed':
      s('rect', {x:-34, y:-46, width:68, height:92, rx:5, fill:W, stroke:INK, 'stroke-width':3}, q);
      T('SPEED', -26, 13); T('LIMIT', -12, 13); T(arg, 32, 42); break;
    case 'advisory':
      s('rect', {x:-34, y:-34, width:68, height:68, rx:5, fill:O, stroke:INK, 'stroke-width':3}, q);
      T(arg, 8, 36); T('MPH', 27, 12); break;
    case 'school':
      poly('0,-50 46,-14 46,48 -46,48 -46,-14', YG, INK, 3);
      [[-13, 0], [13, 6]].forEach(function(p){
        s('circle', {cx:p[0], cy:p[1] - 14, r:6, fill:INK}, q);
        poly((p[0]-8) + ',' + (p[1]+14) + ' ' + p[0] + ',' + (p[1]-7) + ' ' + (p[0]+8) + ',' + (p[1]+14), INK);
        s('line', {x1:p[0]-4, y1:p[1]+14, x2:p[0]-7, y2:p[1]+28, stroke:INK, 'stroke-width':4}, q);
        s('line', {x1:p[0]+4, y1:p[1]+14, x2:p[0]+7, y2:p[1]+28, stroke:INK, 'stroke-width':4}, q);
      });
      break;
    case 'rr':
      s('circle', {cx:0, cy:0, r:48, fill:Y, stroke:INK, 'stroke-width':3}, q);
      s('line', {x1:-31, y1:-31, x2:31, y2:31, stroke:INK, 'stroke-width':7}, q);
      s('line', {x1:-31, y1:31, x2:31, y2:-31, stroke:INK, 'stroke-width':7}, q);
      T('R', 8, 22, INK, -29); T('R', 8, 22, INK, 29); break;
    case 'xbuck':
      [35, -35].forEach(function(a, j){
        var r = s('g', {transform:'rotate(' + a + ')'}, q);
        s('rect', {x:-50, y:-9, width:100, height:18, rx:2, fill:W, stroke:INK, 'stroke-width':2}, r);
        if (j) tx(r, 0, 4, 'CROSSING', {size:11, weight:900}); else { tx(r, -31, 4, 'RAIL', {size:11, weight:900}); tx(r, 31, 4, 'ROAD', {size:11, weight:900}); }
      });
      break;
    case 'pennant':
      poly('-48,-34 50,0 -48,34', Y, INK, 3); T('NO', -8, 10, INK, -26); T('PASSING', 3, 10, INK, -17); T('ZONE', 14, 10, INK, -23); break;
    case 'reg':
      s('rect', {x:-36, y:-46, width:72, height:92, rx:5, fill:W, stroke:INK, 'stroke-width':3}, q); block(arg, 0, 62, 19); break;
    case 'noturn':
      s('rect', {x:-40, y:-40, width:80, height:80, rx:5, fill:W, stroke:INK, 'stroke-width':3}, q);
      if (arg === 'u') { s('path', {d:'M12,22 L12,-4 A11,11 0 0,0 -10,-4 L-10,8', fill:'none', stroke:INK, 'stroke-width':7}, q); poly('-20,6 -10,22 0,6', INK); }
      else { var sx = arg === 'left' ? -1 : 1; s('path', {d:'M' + (-8*sx) + ',24 L' + (-8*sx) + ',-4 L' + (8*sx) + ',-4', fill:'none', stroke:INK, 'stroke-width':7}, q); poly((8*sx) + ',-15 ' + (24*sx) + ',-4 ' + (8*sx) + ',7', INK); }
      s('circle', {cx:0, cy:0, r:31, fill:'none', stroke:R, 'stroke-width':7}, q);
      s('line', {x1:-22, y1:-22, x2:22, y2:22, stroke:R, 'stroke-width':7}, q); break;
    case 'guide':
      s('rect', {x:-50, y:-30, width:100, height:60, rx:7, fill:GR}, q);
      s('rect', {x:-46, y:-26, width:92, height:52, rx:5, fill:'none', stroke:W, 'stroke-width':2.5}, q); block(arg, 0, 80, 17, W); break;
    case 'milepost':
      s('rect', {x:-17, y:-46, width:34, height:92, rx:3, fill:GR}, q);
      s('rect', {x:-14, y:-43, width:28, height:86, rx:2, fill:'none', stroke:W, 'stroke-width':2}, q);
      T('MILE', -27, 9, W);
      String(arg).split('').forEach(function(ch, j){ T(ch, -4 + j*21, 21, W); });
      break;
    case 'paddle':
      s('rect', {x:-3, y:30, width:6, height:22, fill:'#8A6A45'}, q);
      poly(oct(0, -6, 40), arg === 'slow' ? O : R, W, 3); T(arg === 'slow' ? 'SLOW' : 'STOP', 2, 22, arg === 'slow' ? INK : W); break;
    case 'slowveh':
      poly('-44,36 44,36 0,-42', O, '#B5261E', 9); break;
    case 'hydrant':
      s('rect', {x:-13, y:-10, width:26, height:44, rx:5, fill:R, stroke:INK, 'stroke-width':2.5}, q);
      s('rect', {x:-18, y:-22, width:36, height:14, rx:6, fill:R, stroke:INK, 'stroke-width':2.5}, q);
      s('rect', {x:-24, y:2, width:11, height:12, rx:3, fill:R, stroke:INK, 'stroke-width':2.5}, q);
      s('rect', {x:13, y:2, width:11, height:12, rx:3, fill:R, stroke:INK, 'stroke-width':2.5}, q);
      s('rect', {x:-20, y:34, width:40, height:8, rx:2, fill:INK}, q); break;
    case 'xwalk':
      s('rect', {x:-44, y:-34, width:88, height:68, rx:6, fill:'#474D55'}, q);
      for (var xx = -36; xx < 36; xx += 16) s('rect', {x:xx, y:-26, width:9, height:52, fill:'#F4F4EF'}, q);
      break;
    case 'ok':
      s('circle', {cx:0, cy:0, r:44, fill:GR}, q); s('path', {d:'M-22,2 L-6,18 L24,-16', fill:'none', stroke:W, 'stroke-width':11, 'stroke-linecap':'round', 'stroke-linejoin':'round'}, q); break;
    case 'no':
      s('circle', {cx:0, cy:0, r:44, fill:R}, q); s('path', {d:'M-18,-18 L18,18 M18,-18 L-18,18', fill:'none', stroke:W, 'stroke-width':11, 'stroke-linecap':'round'}, q); break;
  }
  return q;
};

/* ---------- traffic signal heads ---------- */
var LAMP = {red:['#FF3B30', '#4A1A17'], yellow:['#FFC21F', '#4A3D12'], green:['#2EDB6E', '#15321F']};
function flash(el, phase){
  var a = s('animate', {attributeName:'opacity', values: phase ? '0.12;0.12;1;1' : '1;1;0.12;0.12', keyTimes:'0;0.5;0.5;1', dur:'1s', repeatCount:'indefinite'}, el);
  return a;
}
MO.light = function(g, state, x, y, size){
  var q = s('g', {transform:'translate(' + x + ' ' + y + ') scale(' + (size/104) + ')'}, g);
  var isFlash = state.indexOf('flash') >= 0, isArrow = state.indexOf('arrow') >= 0, color = state.split('-').pop();
  s('rect', {x:-21, y:-52, width:42, height:104, rx:10, fill:'#14181C', stroke:'#000', 'stroke-width':1}, q);
  ['red', 'yellow', 'green'].forEach(function(c, i){
    var cy = -33 + i * 33, lit = c === color;
    s('circle', {cx:0, cy:cy, r:13.5, fill: lit && !isArrow ? LAMP[c][0] : (isArrow ? '#0C0F12' : LAMP[c][1])}, q);
    if (lit && isArrow) {
      var a = s('path', {d:'M-9,0 L0,-9 L0,-3.6 L9,-3.6 L9,3.6 L0,3.6 L0,9 Z', fill:LAMP[c][0], transform:'translate(0 ' + cy + ')'}, q);
      if (isFlash) flash(a);
    } else if (lit && isFlash) {
      flash(q.lastChild);
    }
  });
  return q;
};
/* pedestrian hybrid beacon: two reds over one yellow */
MO.hawk = function(g, state, x, y, size){
  var q = s('g', {transform:'translate(' + x + ' ' + y + ') scale(' + (size/104) + ')'}, g);
  s('path', {d:'M-36,-40 L36,-40 L36,0 L20,46 L-20,46 L-36,0 Z', fill:'#14181C', stroke:'#000', 'stroke-width':1, 'stroke-linejoin':'round'}, q);
  var redOn = state.indexOf('red') >= 0, yelOn = state.indexOf('yellow') >= 0, fl = state.indexOf('flash') >= 0;
  var r1 = s('circle', {cx:-17, cy:-19, r:13, fill: redOn ? LAMP.red[0] : LAMP.red[1]}, q);
  var r2 = s('circle', {cx:17, cy:-19, r:13, fill: redOn ? LAMP.red[0] : LAMP.red[1]}, q);
  var yl = s('circle', {cx:0, cy:22, r:13, fill: yelOn ? LAMP.yellow[0] : LAMP.yellow[1]}, q);
  if (fl && redOn) { flash(r1, 0); flash(r2, 1); }
  if (fl && yelOn) flash(yl, 0);
  return q;
};

/* ---------- road drawing ---------- */
var K = MO.K = {ground:'#E4DDC7', scrub:'#B4BE96', walk:'#CBC7BC', road:'#474D55', paint:'#F4F4EF', yellow:'#F3C01F', island:'#C5CFA2', curb:'#8C9869'};
var SCRUB = [[40,52,7],[96,30,5],[70,110,6],[330,60,7],[362,112,5],[300,28,4],[52,330,6],[104,366,5],[30,290,4],[340,320,7],[372,356,5],[306,372,4],[112,76,4],[290,104,5],[88,300,5],[318,286,4]];
function ground(g){
  s('rect', {x:0, y:0, width:400, height:400, fill:K.ground}, g);
  SCRUB.forEach(function(p){ s('circle', {cx:p[0], cy:p[1], r:p[2], fill:K.scrub}, g); });
}
function legs(g, fn){ [0, 90, 180, 270].forEach(function(a){ fn(s('g', {transform:'rotate(' + a + ' 200 200)'}, g)); }); }
function vline(g, x, color, w, dashArr, y1, y2){
  var l = s('line', {x1:x, y1:y1 == null ? 0 : y1, x2:x, y2:y2 == null ? 400 : y2, stroke:color, 'stroke-width':w}, g);
  if (dashArr) l.setAttribute('stroke-dasharray', dashArr);
  return l;
}
function yellowPair(g, x, y1, y2){ vline(g, x - 1.6, K.yellow, 1.6, null, y1, y2); vline(g, x + 1.6, K.yellow, 1.6, null, y1, y2); }
var DASH = '14 12';

MO.geom = function(o){
  var w = o.w || 44, up = o.up == null ? 1 : o.up, down = o.down == null ? 1 : o.down;
  var c = o.center === 'turn' ? (o.cw || 40) : o.center === 'median' ? 20 : 0;
  var cL = 200 - c/2, cR = 200 + c/2;
  return {w:w, up:up, down:down, cL:cL, cR:cR, L:cL - down*w - (o.parkL ? 26 : 0), R:cR + up*w + (o.parkR ? 26 : 0)};
};

var LAYOUT = MO.LAYOUT = {
  cross: function(g, o){
    ground(g);
    s('rect', {x:148, y:0, width:104, height:400, fill:K.walk}, g);
    s('rect', {x:0, y:148, width:400, height:104, fill:K.walk}, g);
    s('rect', {x:156, y:0, width:88, height:400, fill:K.road}, g);
    s('rect', {x:0, y:156, width:400, height:88, fill:K.road}, g);
    var sl = o.crosswalks ? 265 : 250;
    legs(g, function(lg){
      yellowPair(lg, 200, sl + 3, 400);
      s('line', {x1:201, y1:sl, x2:243, y2:sl, stroke:K.paint, 'stroke-width':3}, lg);
      if (o.crosswalks) for (var x = 160; x < 240; x += 12) s('rect', {x:x, y:246, width:6, height:14, fill:K.paint}, lg);
      if (o.stops) s('polygon', {points:oct(257, sl + 12, 8.5), fill:'#C3342B', stroke:'#fff', 'stroke-width':1.8}, lg);
    });
  },
  round: function(g, o){
    ground(g);
    s('rect', {x:148, y:0, width:104, height:400, fill:K.walk}, g);
    s('rect', {x:0, y:148, width:400, height:104, fill:K.walk}, g);
    s('circle', {cx:200, cy:200, r:99, fill:K.walk}, g);
    s('rect', {x:156, y:0, width:88, height:400, fill:K.road}, g);
    s('rect', {x:0, y:156, width:400, height:88, fill:K.road}, g);
    s('circle', {cx:200, cy:200, r:92, fill:K.road}, g);
    s('circle', {cx:200, cy:200, r:40, fill:K.island, stroke:K.curb, 'stroke-width':2.5}, g);
    s('circle', {cx:194, cy:196, r:8, fill:K.scrub}, g);
    s('circle', {cx:210, cy:208, r:5, fill:K.scrub}, g);
    legs(g, function(lg){
      yellowPair(lg, 200, 300, 400);
      s('line', {x1:202, y1:292, x2:243, y2:292, stroke:K.paint, 'stroke-width':3, 'stroke-dasharray':'6 4'}, lg);
    });
    if (o.arrows !== false) [45, 135, 225, 315].forEach(function(deg){
      var a = deg * Math.PI/180, x = 200 + 66*Math.cos(a), y = 200 + 66*Math.sin(a);
      var rot = Math.atan2(-Math.cos(a), Math.sin(a)) * 180/Math.PI + 90;
      s('path', {d:'M0,-8 L6,4 L0,1 L-6,4 Z', fill:K.paint, opacity:.85, transform:'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') rotate(' + rot.toFixed(1) + ')'}, g);
    });
  },
  /* straight vertical road. o: up, down (lane counts), w (lane width), center
     ('double' | 'broken' | 'solidUp' | 'solidDown' | 'turn' | 'median'), sep ('broken' | 'solid' | 'double'),
     parkR, parkL, curbR (color), xwalk (y) */
  road: function(g, o){
    ground(g);
    var G = MO.geom(o), w = G.w, i, x, c = o.center || 'double';
    var eR = G.R - (o.parkR ? 26 : 0), eL = G.L + (o.parkL ? 26 : 0);
    s('rect', {x:G.L - 8, y:0, width:G.R - G.L + 16, height:400, fill:K.walk}, g);
    s('rect', {x:G.L, y:0, width:G.R - G.L, height:400, fill:K.road}, g);
    if (o.parkR) { s('rect', {x:eR, y:0, width:26, height:400, fill:'#535A62'}, g); for (i = 20; i < 400; i += 90) s('line', {x1:eR, y1:i, x2:G.R, y2:i, stroke:K.paint, 'stroke-width':1.4}, g); }
    if (o.parkL) { s('rect', {x:G.L, y:0, width:26, height:400, fill:'#535A62'}, g); for (i = 20; i < 400; i += 90) s('line', {x1:G.L, y1:i, x2:eL, y2:i, stroke:K.paint, 'stroke-width':1.4}, g); }
    if (c === 'double') yellowPair(g, 200);
    else if (c === 'broken') vline(g, 200, K.yellow, 1.8, DASH);
    else if (c === 'solidUp') { vline(g, 201.8, K.yellow, 1.7); vline(g, 198.2, K.yellow, 1.7, DASH); }
    else if (c === 'solidDown') { vline(g, 198.2, K.yellow, 1.7); vline(g, 201.8, K.yellow, 1.7, DASH); }
    else if (c === 'turn') {
      vline(g, G.cL - 1.2, K.yellow, 1.7); vline(g, G.cL + 2.6, K.yellow, 1.7, DASH);
      vline(g, G.cR + 1.2, K.yellow, 1.7); vline(g, G.cR - 2.6, K.yellow, 1.7, DASH);
    } else if (c === 'median') {
      s('rect', {x:G.cL, y:-4, width:G.cR - G.cL, height:408, fill:K.island, stroke:K.curb, 'stroke-width':2.5}, g);
      [40, 130, 220, 310, 380].forEach(function(y){ s('circle', {cx:200, cy:y, r:5, fill:K.scrub}, g); });
      vline(g, G.cL - 3.5, K.yellow, 1.6); vline(g, G.cR + 3.5, K.yellow, 1.6);
    }
    function sep(xx){
      var st = o.sep || 'broken';
      if (st === 'double') { vline(g, xx - 1.6, K.paint, 1.5); vline(g, xx + 1.6, K.paint, 1.5); }
      else vline(g, xx, K.paint, 1.6, st === 'solid' ? null : DASH);
    }
    for (i = 1; i < G.up; i++) sep(G.cR + w*i);
    for (i = 1; i < G.down; i++) sep(G.cL - w*i);
    vline(g, eL + 3.5, K.paint, 1.4); vline(g, eR - 3.5, K.paint, 1.4);
    if (o.curbR) vline(g, G.R + 1, o.curbR, 6);
    if (o.xwalk != null) {
      for (x = G.L + 4; x < G.R - 6; x += 12) s('rect', {x:x, y:o.xwalk - 7, width:6, height:14, fill:K.paint}, g);
      s('line', {x1:G.cR + 1, y1:o.xwalk + 17, x2:eR - 1, y2:o.xwalk + 17, stroke:K.paint, 'stroke-width':3}, g);
      s('line', {x1:eL + 1, y1:o.xwalk - 17, x2:G.cL - 1, y2:o.xwalk - 17, stroke:K.paint, 'stroke-width':3}, g);
    }
  },
  two: function(g, o){ LAYOUT.road(g, o.median ? {center:'median', w:64} : {}); },
  /* one side of a freeway, 3 lanes heading up. Lane centers 140, 180, 220. Right shoulder 251.
     o.ramp 'on' | 'off', o.hov */
  fwy: function(g, o){
    ground(g);
    var flip = o.ramp === 'off' ? {transform:'translate(0 400) scale(1 -1)'} : {};
    if (o.ramp) {
      var ra = s('g', flip, g);
      s('path', {d:'M330,430 C330,345 262,335 262,270 L262,140', fill:'none', stroke:K.road, 'stroke-width':44}, ra);
      s('polygon', {points:'240,142 284,142 262,58 240,58', fill:K.road}, ra);
    }
    s('rect', {x:98, y:0, width:10, height:400, fill:'#B9B6AD', stroke:'#8E8B82', 'stroke-width':1}, g);
    s('rect', {x:108, y:0, width:154, height:400, fill:K.road}, g);
    vline(g, 120, K.yellow, 1.8);
    if (o.hov) {
      vline(g, 160, K.paint, 1.8);
      [70, 200, 330].forEach(function(y){ s('polygon', {points:'140,' + (y-13) + ' 148,' + y + ' 140,' + (y+13) + ' 132,' + y, fill:'none', stroke:K.paint, 'stroke-width':1.8}, g); });
    } else vline(g, 160, K.paint, 1.6, DASH);
    vline(g, 200, K.paint, 1.6, DASH);
    if (!o.ramp) vline(g, 240, K.paint, 1.6);
    else {
      var rb = s('g', flip, g);
      vline(rb, 240, K.paint, 1.6, null, 278, 400);
      vline(rb, 240, K.paint, 1.6, '8 8', 142, 278);
      vline(rb, 240, K.paint, 1.6, null, 0, 58);
      s('polygon', {points:'241,280 241,352 274,352 253,316', fill:'#5B616A'}, rb);
      [[300, 248], [320, 256], [340, 266]].forEach(function(p){ s('line', {x1:242, y1:p[0], x2:p[1], y2:p[0] + 6, stroke:K.paint, 'stroke-width':2}, rb); });
      s('path', {d:'M308,430 C308,350 242,340 242,278', fill:'none', stroke:K.paint, 'stroke-width':1.6}, rb);
      s('path', {d:'M352,430 C352,345 284,335 284,270 L284,142 L262,58', fill:'none', stroke:K.paint, 'stroke-width':1.6}, rb);
    }
  }
};
MO.FX = [140, 180, 220];

/* ---------- static props placed in a scene ---------- */
MO.prop = function(parent, p){
  var g = s('g', {}, parent), k = p[0], i, x;
  switch (k) {
    case 'sign': MO.sign(g, p[1], p[2], p[3], p[4] || 30); break;
    case 'light': MO.light(g, p[1], p[2], p[3], p[4] || 40); break;
    case 'label': pill(g, p[1], p[2], p[3], p[4] || 'dark', p[5] || 9); break;
    case 'text': txs(g, p[1], p[2], p[3], {size:p[4] || 12, fill:p[5] || INK}); break;
    case 'dim': dim(g, p[1], p[2], p[3], p[4], p[5]); break;
    case 'zone': s('polygon', {points:p[1], fill:p[2] || '#C3342B', opacity:p[3] == null ? .35 : p[3]}, g); break;
    case 'rect': s('rect', {x:p[1], y:p[2], width:p[3], height:p[4], fill:p[5] || K.road, opacity:p[6] == null ? 1 : p[6], rx:p[7] || 0}, g); break;
    case 'arrow': arrow(g, p[1], p[2], p[3], p[4], {color:p[5] || INK, w:p[6] || 3}); break;
    case 'path': arrowPath(g, p[1], {color:p[2] || INK, w:p[3] || 3, dash:p[4]}); break;
    case 'hydrant':
      s('circle', {cx:p[1], cy:p[2], r:6, fill:'#C3342B', stroke:INK, 'stroke-width':1.2}, g);
      s('circle', {cx:p[1], cy:p[2], r:2.2, fill:'#7A1512'}, g); break;
    case 'box':
      s('rect', {x:p[1] - 7, y:p[2] - 6, width:14, height:12, rx:1.5, fill:'#B98A52', stroke:'#6E4E27', 'stroke-width':1.2}, g);
      s('line', {x1:p[1] - 7, y1:p[2], x2:p[1] + 7, y2:p[2], stroke:'#6E4E27', 'stroke-width':1}, g); break;
    case 'barricade':
      for (i = 0; i < p[3]; i += 22) {
        s('rect', {x:p[1] + i, y:p[2] - 4, width:18, height:8, rx:1.5, fill:'#F08A24', stroke:INK, 'stroke-width':1}, g);
        s('line', {x1:p[1] + i + 5, y1:p[2] - 4, x2:p[1] + i + 9, y2:p[2] + 4, stroke:'#fff', 'stroke-width':2.5}, g);
        s('line', {x1:p[1] + i + 11, y1:p[2] - 4, x2:p[1] + i + 15, y2:p[2] + 4, stroke:'#fff', 'stroke-width':2.5}, g);
      }
      break;
    case 'tracks':
      for (x = 2; x < 400; x += 12) s('rect', {x:x, y:p[1] - 10, width:5, height:20, fill:'#6B5A48'}, g);
      s('line', {x1:0, y1:p[1] - 5, x2:400, y2:p[1] - 5, stroke:'#D2D6DA', 'stroke-width':2.6}, g);
      s('line', {x1:0, y1:p[1] + 5, x2:400, y2:p[1] + 5, stroke:'#D2D6DA', 'stroke-width':2.6}, g);
      MO.sign(g, 'xbuck', 268, p[1] + 34, 34);
      if (p[2]) {
        var a = s('circle', {cx:259, cy:p[1] + 54, r:5, fill:'#FF2D21', stroke:INK, 'stroke-width':1}, g), b = s('circle', {cx:277, cy:p[1] + 54, r:5, fill:'#FF2D21', stroke:INK, 'stroke-width':1}, g);
        flash(a, 0); flash(b, 1);
      }
      break;
  }
  return g;
};

function signalHud(g, state){
  while (g.firstChild) g.removeChild(g.firstChild);
  s('rect', {x:10, y:10, width:24, height:62, rx:6, fill:'#14181C'}, g);
  s('circle', {cx:22, cy:22, r:7, fill: state === 'red' ? LAMP.red[0] : LAMP.red[1]}, g);
  s('circle', {cx:22, cy:41, r:7, fill: state === 'yellow' ? LAMP.yellow[0] : LAMP.yellow[1]}, g);
  s('circle', {cx:22, cy:60, r:7, fill: state === 'green' ? LAMP.green[0] : LAMP.green[1]}, g);
  tx(g, 41, 24, 'YOUR LIGHT', {anchor:'start', size:9, ls:.8});
  var name = {green:'GREEN', yellow:'YELLOW', red:'RED', dark:'NOT WORKING'}[state] || '';
  var col = {green:'#0A6A4E', yellow:'#8A6500', red:'#A32A22', dark:'#A32A22'}[state] || INK;
  tx(g, 41, 38, name, {anchor:'start', size:12, weight:900, fill:col});
}

/* ---------- vehicles and people, drawn facing up ---------- */
function lamps(g, hw, front, rear){
  var head = [s('rect', {x:-hw + 1.5, y:front, width:5, height:2.6, rx:1, fill:'#FFF7C9'}, g), s('rect', {x:hw - 6.5, y:front, width:5, height:2.6, rx:1, fill:'#FFF7C9'}, g)];
  var brake = [s('rect', {x:-hw + 1.5, y:rear - 2.6, width:5, height:2.6, rx:1, fill:'#7A1512'}, g), s('rect', {x:hw - 6.5, y:rear - 2.6, width:5, height:2.6, rx:1, fill:'#7A1512'}, g)];
  function sig(x){ return [s('circle', {cx:x, cy:front + 3, r:2.8, fill:'#FFA51F', opacity:0}, g), s('circle', {cx:x, cy:rear - 3, r:2.8, fill:'#FFA51F', opacity:0}, g)]; }
  return {head:head, brake:brake, L:sig(-hw + .5), R:sig(hw - .5)};
}
var DRAW = MO.DRAW = {
  car: function(g, def){
    s('rect', {x:-10, y:-18, width:20, height:36, rx:6, fill:def.color || MO.CAR.gray, stroke:'rgba(0,0,0,.4)', 'stroke-width':1}, g);
    s('rect', {x:-7.5, y:-9.5, width:15, height:7, rx:2, fill:'#16212B', opacity:.82}, g);
    s('rect', {x:-7, y:7, width:14, height:5, rx:2, fill:'#16212B', opacity:.65}, g);
    return lamps(g, 10, -18, 18);
  },
  cop: function(g){
    s('rect', {x:-10, y:-18, width:20, height:36, rx:6, fill:'#F2F4F5', stroke:'rgba(0,0,0,.5)', 'stroke-width':1}, g);
    s('rect', {x:-10, y:-18, width:20, height:9, rx:5, fill:'#1A2026'}, g);
    s('rect', {x:-10, y:9, width:20, height:9, rx:5, fill:'#1A2026'}, g);
    s('rect', {x:-7.5, y:-9.5, width:15, height:6, rx:2, fill:'#16212B', opacity:.82}, g);
    var P = lamps(g, 10, -18, 18);
    P.bar = [s('rect', {x:-8, y:-2, width:8, height:4.5, rx:1.5, fill:'#fff'}, g), s('rect', {x:0, y:-2, width:8, height:4.5, rx:1.5, fill:'#fff'}, g)];
    return P;
  },
  bus: function(g){
    s('rect', {x:-12, y:-30, width:24, height:60, rx:4, fill:'#F2B01E', stroke:'rgba(0,0,0,.45)', 'stroke-width':1}, g);
    s('rect', {x:-12, y:-30, width:24, height:8, rx:4, fill:'#D2930D'}, g);
    s('rect', {x:-9, y:-20, width:18, height:5, rx:1.5, fill:'#16212B', opacity:.8}, g);
    s('line', {x1:-12, y1:-8, x2:12, y2:-8, stroke:INK, 'stroke-width':1}, g);
    s('line', {x1:-12, y1:10, x2:12, y2:10, stroke:INK, 'stroke-width':1}, g);
    var fl = [[-8,-27],[8,-27],[-8,27],[8,27]].map(function(p){ return s('circle', {cx:p[0], cy:p[1], r:3, fill:'#5C1A16'}, g); });
    var arm = s('g', {}, g);
    s('line', {x1:-12, y1:-12, x2:-19, y2:-12, stroke:'#3A3F45', 'stroke-width':2}, arm);
    s('polygon', {points:oct(-25, -12, 7), fill:'#D2281E', stroke:'#fff', 'stroke-width':1.6}, arm);
    return {flash:fl, arm:arm};
  },
  truck: function(g){
    s('rect', {x:-13, y:-27, width:26, height:54, rx:4, fill:'#C3342B', stroke:'rgba(0,0,0,.45)', 'stroke-width':1}, g);
    s('rect', {x:-13, y:-27, width:26, height:15, rx:4, fill:'#9C241D'}, g);
    s('rect', {x:-10, y:-23, width:20, height:5, rx:1.5, fill:'#16212B', opacity:.85}, g);
    s('rect', {x:-4, y:-5, width:8, height:28, rx:1, fill:'#DADFE2'}, g);
    for (var y = -1; y < 22; y += 5) s('line', {x1:-4, y1:y, x2:4, y2:y, stroke:'#8A9299', 'stroke-width':1}, g);
    return {bar:[s('rect', {x:-11, y:-12, width:10, height:4.5, rx:1.5, fill:'#fff'}, g), s('rect', {x:1, y:-12, width:10, height:4.5, rx:1.5, fill:'#fff'}, g)]};
  },
  semi: function(g, def){
    s('rect', {x:-12, y:-22, width:24, height:66, rx:2, fill:'#E6E9EC', stroke:'rgba(0,0,0,.45)', 'stroke-width':1}, g);
    for (var y = -10; y < 40; y += 12) s('line', {x1:-12, y1:y, x2:12, y2:y, stroke:'#C2C8CD', 'stroke-width':1}, g);
    s('rect', {x:-11, y:-44, width:22, height:21, rx:4, fill:def.color || '#2F5D8A', stroke:'rgba(0,0,0,.45)', 'stroke-width':1}, g);
    s('rect', {x:-8.5, y:-40, width:17, height:5.5, rx:1.5, fill:'#16212B', opacity:.85}, g);
    return lamps(g, 12, -44, 44);
  },
  moto: function(g, def){
    s('rect', {x:-2.2, y:-13, width:4.4, height:26, rx:2.2, fill:'#23282D'}, g);
    s('line', {x1:-6, y1:-7, x2:6, y2:-7, stroke:'#23282D', 'stroke-width':2}, g);
    s('ellipse', {cx:0, cy:2, rx:5.2, ry:6.5, fill:'#2B3138', stroke:'rgba(0,0,0,.5)', 'stroke-width':.8}, g);
    s('circle', {cx:0, cy:-1, r:4.2, fill:def.color || '#D9A21B'}, g);
    s('rect', {x:-1.5, y:-13.5, width:3, height:2.4, rx:1, fill:'#FFF7C9'}, g);
    return {};
  },
  bike: function(g, def){
    s('rect', {x:-1.2, y:-12, width:2.4, height:24, rx:1.2, fill:'#23282D'}, g);
    s('line', {x1:-5, y1:-6, x2:5, y2:-6, stroke:'#23282D', 'stroke-width':1.6}, g);
    s('ellipse', {cx:0, cy:2, rx:4.6, ry:5.6, fill:def.color || '#2E9AA3', stroke:'rgba(0,0,0,.45)', 'stroke-width':.8}, g);
    s('circle', {cx:0, cy:-.5, r:3.4, fill:'#F2F2EE', stroke:INK, 'stroke-width':.8}, g);
    return {};
  },
  train: function(g){
    s('rect', {x:-13, y:-80, width:26, height:160, rx:9, fill:'#DDE2E6', stroke:'rgba(0,0,0,.5)', 'stroke-width':1}, g);
    s('rect', {x:-13, y:-80, width:26, height:160, rx:9, fill:'none', stroke:'#2E9AA3', 'stroke-width':3, 'stroke-dasharray':'0'}, g);
    s('rect', {x:-9, y:-74, width:18, height:7, rx:2, fill:'#16212B'}, g);
    s('rect', {x:-9, y:67, width:18, height:7, rx:2, fill:'#16212B'}, g);
    s('line', {x1:-13, y1:0, x2:13, y2:0, stroke:'#8A9299', 'stroke-width':2}, g);
    s('rect', {x:-8, y:-81, width:5, height:3, rx:1, fill:'#fff'}, g); s('rect', {x:3, y:-81, width:5, height:3, rx:1, fill:'#fff'}, g);
    return {};
  },
  ped: function(g, def){
    s('ellipse', {cx:0, cy:0, rx:9, ry:5.6, fill:def.color || '#D2477E', stroke:'rgba(0,0,0,.4)', 'stroke-width':1}, g);
    s('circle', {cx:0, cy:-.6, r:5, fill:'#3B2F2A'}, g);
    return {};
  },
  kid: function(g, def){
    s('rect', {x:-4.6, y:2, width:9.2, height:7, rx:2, fill:'#D2477E', stroke:'rgba(0,0,0,.35)', 'stroke-width':.8}, g);
    s('ellipse', {cx:0, cy:0, rx:7.6, ry:4.8, fill:def.color || '#3E8E7E', stroke:'rgba(0,0,0,.4)', 'stroke-width':1}, g);
    s('circle', {cx:0, cy:-.5, r:4.3, fill:'#3B2F2A'}, g);
    return {};
  }
};
/* a vehicle drawn once, not animated (for diagrams) */
MO.still = function(g, kind, x, y, rot, def, scale){
  var q = s('g', {transform:'translate(' + x + ' ' + y + ') rotate(' + (rot || 0) + ') scale(' + (scale || 1) + ')'}, g);
  DRAW[kind](q, def || {});
  return q;
};

function dist(a, t){
  var k = a.keys;
  if (t <= k[0][0]) return k[0][1];
  for (var i = 0; i < k.length - 1; i++) {
    if (t <= k[i+1][0]) {
      var t0 = k[i][0], d0 = k[i][1], t1 = k[i+1][0], d1 = k[i+1][1];
      if (d0 === d1) return d0;
      var u = (t - t0) / (t1 - t0);
      if (!a.def.linear) {
        var fromRest = i > 0 && k[i-1][1] === d0;
        var toRest = i + 2 < k.length && k[i+2][1] === d1;
        if (fromRest && toRest) u = u*u*(3 - 2*u);
        else if (fromRest) u = u*u;
        else if (toRest) u = 1 - (1-u)*(1-u);
      }
      return d0 + (d1 - d0) * u;
    }
  }
  return k[k.length-1][1];
}
function lin(keys, t){
  if (t <= keys[0][0]) return keys[0][1];
  for (var i = 0; i < keys.length - 1; i++) if (t <= keys[i+1][0]) return keys[i][1] + (keys[i+1][1] - keys[i][1]) * (t - keys[i][0]) / (keys[i+1][0] - keys[i][0]);
  return keys[keys.length-1][1];
}
function inWin(w, t){ return !!w && t >= w[0] && t <= w[1]; }
function hudAt(sg, t){
  if (typeof sg === 'string') return sg;
  var st = sg[0][1];
  sg.forEach(function(k){ if (t >= k[0]) st = k[1]; });
  return st;
}

/* ---------- the animated stage ---------- */
function Stage(svg, scene, still){
  var self = this;
  this.svg = svg; this.scene = scene; this.still = !!still; this.raf = null; this.done = null; this.hudState = null; this.timed = [];
  while (svg.firstChild) svg.removeChild(svg.firstChild);
  svg.setAttribute('viewBox', '0 0 400 400');
  LAYOUT[scene.layout.type](s('g', {}, svg), scene.layout);
  var propLayer = s('g', {}, svg);
  function addProps(list, layer){
    (list || []).forEach(function(p){
      var last = p[p.length - 1], win = last && typeof last === 'object' && !Array.isArray(last) && last.from != null ? last : null;
      var g = MO.prop(layer, p);
      if (win) self.timed.push({g:g, win:[win.from, win.to == null ? 99 : win.to]});
    });
  }
  addProps(scene.props, propLayer);
  this.hud = scene.signal ? s('g', {}, svg) : null;
  var host = s('g', {fill:'none', stroke:'none'}, svg);
  var layer = s('g', {}, svg);
  this.ov = scene.overlay ? s('rect', {x:0, y:0, width:400, height:400, fill:scene.overlay.fill, opacity:0, 'pointer-events':'none'}, svg) : null;
  addProps(scene.top, s('g', {}, svg));
  var tagLayer = s('g', {}, svg);
  this.actors = scene.actors.map(function(def){
    var path = s('path', {d:def.path}, host);
    var len = path.getTotalLength();
    var g = s('g', {}, layer);
    var a = {def:def, path:path, len:len, g:g, parts:DRAW[def.kind](g, def)};
    a.keys = def.keys.map(function(kk){ return [kk[0], kk[1] === 'end' ? len : kk[1]]; });
    a.tags = (def.tags || []).map(function(tg){
      var pl = pill(tagLayer, 0, 0, tg.text, tg.tone || 'dark', 9);
      return {def:tg, g:pl.g, w:pl.w};
    });
    return a;
  });
  this.setTime(0);
}
Stage.prototype.setTime = function(t){
  var still = this.still, blink = still || Math.floor(t * 3.2) % 2 === 0, sc = this.scene;
  if (this.hud) { var hs = hudAt(sc.signal, t); if (hs !== this.hudState) { this.hudState = hs; signalHud(this.hud, hs); } }
  if (this.ov) this.ov.setAttribute('opacity', lin(sc.overlay.keys, t).toFixed(3));
  this.timed.forEach(function(p){ p.g.style.display = inWin(p.win, t) ? '' : 'none'; });
  this.actors.forEach(function(a){
    var d = dist(a, t), len = a.len, def = a.def;
    var p = a.path.getPointAtLength(d), q0, q1;
    if (d < len - 1.5) { q0 = p; q1 = a.path.getPointAtLength(d + 1.5); }
    else { q0 = a.path.getPointAtLength(Math.max(0, len - 1.5)); q1 = a.path.getPointAtLength(len); }
    var ang = Math.atan2(q1.y - q0.y, q1.x - q0.x) * 180/Math.PI + 90;
    if (def.yaw) ang += lin(def.yaw, t);
    a.g.setAttribute('transform', 'translate(' + p.x.toFixed(2) + ' ' + p.y.toFixed(2) + ') rotate(' + ang.toFixed(1) + ')');
    var vis = !def.visible || inWin(def.visible, t);
    a.g.style.display = vis ? '' : 'none';
    var P = a.parts;
    if (P.brake) {
      var off = inWin(def.lightsOff, t);
      var stopped = !def.parked && !off && Math.abs(dist(a, t + .06) - dist(a, t - .06)) < .05;
      P.brake.forEach(function(b){ b.setAttribute('fill', stopped ? '#FF3B30' : '#7A1512'); });
      P.head.forEach(function(b){ b.setAttribute('fill', off || def.parked ? '#8D949A' : '#FFF7C9'); });
      var side = null;
      (def.signal || []).forEach(function(w){ if (t >= w.from && t <= w.to) side = w.side; });
      ['L', 'R'].forEach(function(sd){ P[sd].forEach(function(c){ c.setAttribute('opacity', (side === sd || side === 'B') && blink && !off ? 1 : 0); }); });
    }
    if (P.flash) {
      var on = inWin(def.flash, t);
      P.flash.forEach(function(c, i){ var lit = on && (still || (i % 2 === 0) === blink); c.setAttribute('fill', lit ? '#FF2D21' : '#5C1A16'); c.setAttribute('r', lit ? 3.6 : 3); });
      P.arm.style.display = inWin(def.arm, t) ? '' : 'none';
    }
    if (P.bar) {
      var barOn = !def.bar || inWin(def.bar, t);
      P.bar[0].setAttribute('fill', !barOn ? '#C9CED2' : blink ? '#FF2D21' : '#fff');
      P.bar[1].setAttribute('fill', !barOn ? '#C9CED2' : blink ? '#fff' : '#3B7BFF');
    }
    a.tags.forEach(function(tg){
      var show = vis && t >= tg.def.from && t <= tg.def.to;
      tg.g.style.display = show ? '' : 'none';
      if (show) {
        var x = Math.min(400 - tg.w/2 - 3, Math.max(tg.w/2 + 3, p.x + (tg.def.dx || 0)));
        var y = Math.min(390, Math.max(12, p.y + (tg.def.dy == null ? -32 : tg.def.dy)));
        tg.g.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ')');
      }
    });
  });
};
Stage.prototype.cancel = function(){
  if (this.raf) { cancelAnimationFrame(this.raf); this.raf = null; }
  if (this.done) { var f = this.done; this.done = null; f(false); }
};
Stage.prototype.play = function(from, to, onTime){
  var self = this;
  this.cancel();
  return new Promise(function(res){
    self.done = res;
    var start = null;
    function step(now){
      if (start === null) start = now;
      var t = Math.min(to, from + (now - start) / 1000);
      self.setTime(t);
      if (onTime) onTime(t);
      if (t < to) self.raf = requestAnimationFrame(step);
      else { self.raf = null; self.done = null; res(true); }
    }
    self.raf = requestAnimationFrame(step);
  });
};
MO.Stage = Stage;
})();
