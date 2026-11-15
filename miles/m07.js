/* Mile 7: Turns, lanes and passing */
(function(){
var MO = window.MO, s = MO.s, tx = MO.tx, INK = MO.INK, CAR = MO.CAR, YOU = MO.YOU;
var RIGHT = 'M222,430 L222,262 Q222,222 262,222 L430,222';
var LEFT = 'M222,430 L222,250 Q222,178 150,178 L-30,178';

/* hand signals, seen from the car behind */
MO.figs.hands = function(svg, p){
  MO.figBg(svg);
  function car(cx, cy, k, mode){
    var g = s('g', {transform:'translate(' + cx + ' ' + cy + ') scale(' + k + ')'}, svg);
    s('rect', {x:-30, y:26, width:13, height:9, rx:2, fill:'#111'}, g); s('rect', {x:17, y:26, width:13, height:9, rx:2, fill:'#111'}, g);
    s('path', {d:'M-28,-18 L-22,-44 L22,-44 L28,-18 Z', fill:'#2C78D4', stroke:INK, 'stroke-width':2, 'stroke-linejoin':'round'}, g);
    s('path', {d:'M-22,-21 L-18,-39 L18,-39 L22,-21 Z', fill:'#16212B', opacity:.82}, g);
    s('rect', {x:-36, y:-18, width:72, height:46, rx:9, fill:'#2C78D4', stroke:INK, 'stroke-width':2}, g);
    s('rect', {x:-32, y:-8, width:11, height:7, rx:2, fill:'#C3342B'}, g); s('rect', {x:21, y:-8, width:11, height:7, rx:2, fill:'#C3342B'}, g);
    s('rect', {x:-9, y:8, width:18, height:9, rx:1.5, fill:'#fff', stroke:INK, 'stroke-width':1}, g);
    var d = mode === 'out' ? 'M-27,-28 L-66,-28' : mode === 'up' ? 'M-27,-28 L-52,-28 L-52,-58' : 'M-27,-28 L-52,-28 L-52,2';
    s('path', {d:d, fill:'none', stroke:INK, 'stroke-width':12, 'stroke-linecap':'round', 'stroke-linejoin':'round'}, g);
    s('path', {d:d, fill:'none', stroke:'#D9A07B', 'stroke-width':8.5, 'stroke-linecap':'round', 'stroke-linejoin':'round'}, g);
  }
  if (p.only) { car(222, 220, 2.3, p.only); return; }
  tx(svg, 200, 40, 'Hand signals, seen from behind', {size:17, weight:900});
  [['out', 'Left turn', 'arm straight out'], ['up', 'Right turn', 'arm bent up'], ['down', 'Slow or stop', 'arm bent down']].forEach(function(c, i){
    var cx = 86 + i * 126;
    car(cx, 200, 1, c[0]);
    tx(svg, cx - 8, 266, c[1], {size:16, weight:900});
    tx(svg, cx - 8, 285, c[2], {size:12.5, weight:700, fill:'#56616A'});
  });
  tx(svg, 200, 350, 'Used when turn signals or brake lights fail.', {size:13, weight:700, fill:'#56616A'});
};

MO.scene('signalEarly', {
  layout:{type:'cross'}, signal:'green', duration:5.4, freeze:0.3, thumb:1.6,
  props:[['dim', 266, 378, 266, 262, '100 ft']],
  actors:[{kind:'car', color:CAR.you, path:RIGHT, linear:true, keys:[[0,0],[2.4,150],[3.6,215],[5.4,'end']], signal:[{side:'R', from:0.5, to:4.0}], tags:[YOU]}],
  captions:[[0,'You plan to turn right at the corner.'],[0.5,'Signal on, at least 100 feet before the turn.'],[2.4,'Slow down and check for people crossing.'],[3.6,'Turn.']]
});
MO.scene('rightGood', {
  layout:{type:'cross'}, signal:'green', duration:5, thumb:0.4,
  props:[['path', 'M222,392 L222,262 Q222,222 262,222 L340,222', '#0A6A4E', 5, '2 9']],
  actors:[{kind:'car', color:CAR.you, path:RIGHT, linear:true, keys:[[0,0],[2.0,150],[3.2,215],[5,'end']], signal:[{side:'R', from:0, to:3.6}], tags:[YOU]}],
  captions:[[0,'Stay close to the right curb as you come up to the corner.'],[2.0,'Turn tight.'],[3.2,'Finish in the right lane of the new street.']]
});
MO.scene('rightAB', {layout:{type:'cross'}, signal:'green',
  props:[['path', 'M222,372 L222,262 Q222,222 262,222 L340,222', '#1A2026', 4], ['path', 'M214,372 L214,246 Q214,178 290,178 L340,178', '#1A2026', 4, '9 6']],
  top:[['label', 356, 222, 'A', 'dark', 13], ['label', 356, 178, 'B', 'dark', 13]],
  actors:[{kind:'car', color:CAR.you, path:MO.up(222), keys:[[0,30]], signal:[{side:'R', from:0, to:99}], tags:[YOU]}]});
MO.scene('leftGood', {
  layout:{type:'cross'}, signal:'green', duration:5.4, thumb:0.4,
  props:[['path', 'M222,392 L222,250 Q222,178 150,178 L60,178', '#0A6A4E', 5, '2 9']],
  actors:[{kind:'car', color:CAR.you, path:LEFT, linear:true, keys:[[0,0],[2.0,160],[3.6,290],[5.4,'end']], signal:[{side:'L', from:0, to:4.2}], tags:[YOU]}],
  captions:[[0,'Start from the lane nearest the center line.'],[2.0,'Turn without cutting the corner.'],[3.6,'Finish in the lane just to the right of the center line.']]
});
MO.scene('leftAB', {layout:{type:'cross'}, signal:'green',
  props:[['path', 'M214,372 L214,268 Q214,222 160,222 L60,222', '#1A2026', 4, '9 6'], ['path', 'M222,372 L222,250 Q222,178 150,178 L60,178', '#1A2026', 4]],
  top:[['label', 44, 222, 'A', 'dark', 13], ['label', 44, 178, 'B', 'dark', 13]],
  actors:[{kind:'car', color:CAR.you, path:MO.up(222), keys:[[0,30]], signal:[{side:'L', from:0, to:99}], tags:[YOU]}]});
MO.scene('blind', {
  layout:{type:'fwy'}, duration:7, freeze:1.0, thumb:1.6,
  props:[['zone', '192,256 240,256 240,318 206,318', '#C3342B', .42, {from:0, to:4.6}], ['zone', '168,256 120,256 120,318 154,318', '#C3342B', .42, {from:0, to:4.6}]],
  top:[['label', 316, 288, 'BLIND SPOT', 'bad', 9, {from:0, to:4.6}], ['arrow', 268, 288, 244, 288, '#1A2026', 2.5, {from:0, to:4.6}]],
  actors:[
    {kind:'car', color:CAR.orange, path:MO.up(220), linear:true, keys:[[0,60],[5,330],[6,460]]},
    {kind:'car', color:CAR.you, path:'M180,250 L180,244 C180,200 220,180 220,136 L220,120', linear:true, keys:[[0,0],[5,6],[7,'end']], signal:[{side:'R', from:4.4, to:7}], tags:[YOU]}
  ],
  captions:[[0,'You want the right lane. Your mirror looks clear.'],[1.2,'But orange is in your blind spot, where the mirrors cannot see.'],[3.0,'A look over your shoulder catches it.'],[5,'Now it is clear. Signal and move over.']]
});

var HANDS = {fig:'hands'};
var NOPASS = {fig:'tiles', title:'Never pass here', lx:100, items:[
  {sign:'warn:cross', label:'Within 100 feet of|an intersection'},
  {sign:'rr', label:'Within 100 feet of|a railroad crossing'},
  {sign:'warn:curve', label:'On a curve or hilltop|where you cannot see ahead'},
  {sign:'school', label:'In a school crossing zone'}
]};
var UTURN = {fig:'signs', items:[['noturn:u', 'No U-turn'], ['noturn:left', 'No left turn'], ['noturn:right', 'No right turn']]};

MO.mile({
  n:7, id:'turns', title:'Turns, lanes and passing', badge:'Smooth Operator',
  blurb:'Where the car goes, drawn as a path.',
  steps:[
    { title:'Signal early', setup:'You are coming up to a corner where you will turn right.',
      rule:'Signal at least 100 feet before you turn.',
      why:'A signal tells other drivers your plan. It does not give you the right-of-way, so you still yield to whoever was going to go first.',
      show:{scene:'signalEarly'},
      try:{ask:'When do you switch on your turn signal?', choices:['As you start to turn','At least 100 feet before the turn','Only when someone is behind you'], answer:1} },
    { title:'Right turns', rule:'Right turn: start near the right curb, finish in the right lane.',
      why:'Swinging wide puts you in the path of traffic coming the other way.',
      show:{scene:'rightGood'},
      try:{show:{scene:'rightAB'}, ask:'Which path is the correct right turn?', choices:['Path A, the tight one','Path B, the wide one'], answer:0} },
    { title:'Left turns', rule:'Left turn: start beside the center line, finish just right of the center line.',
      why:'Do not cut the corner. That puts you head-on with cars waiting on the cross street.',
      show:{scene:'leftGood'},
      try:{show:{scene:'leftAB'}, ask:'Which path is the correct left turn?', choices:['Path A, cutting the corner','Path B, the wider one'], answer:1} },
    { title:'Hand signals', rule:'Arm out: left. Arm up: right. Arm down: slowing or stopping.',
      why:'Drivers use them when lights fail. Bicyclists use them all the time, so you need to read them.',
      show:HANDS,
      try:{show:{fig:'hands', only:'up'}, ask:'The driver ahead has an arm out the window, bent upward. What are they about to do?', choices:['Turn left','Turn right','Stop'], answer:1} },
    { title:'Where passing is banned', rule:'No passing where you cannot see far enough, or within 100 feet of a crossing.',
      why:'Also no passing near a bridge, tunnel or underpass that blocks your view. And never pass by driving off the pavement.',
      show:NOPASS,
      try:{ask:'Broken yellow line, a slow truck ahead, and a hilltop right in front of you. Pass now?', choices:['Yes. The line is broken','No. You cannot see what is coming over the hill'], answer:1} },
    { title:'Blind spots', setup:'Three lanes going your way. You are in the middle one.',
      rule:'Mirrors miss things. Look over your shoulder before every lane change.',
      why:'Do not sit in someone else\'s blind spot either. Speed up or drop back so they can see you.',
      show:{scene:'blind'},
      try:{ask:'Your mirror shows an empty lane. What do you do before changing lanes?', choices:['Go. The mirror is clear','Look over my shoulder first','Honk and move over'], answer:1} },
    { title:'U-turns and turn bans', rule:'U-turn only where it is safe and no sign forbids it.',
      why:'You may not get in the way of other traffic while you do it. A red circle with a slash over an arrow means that turn is not allowed here.',
      show:UTURN,
      try:{ask:'No sign forbids a U-turn here, but cars are coming from both directions. Make the U-turn now?', choices:['Yes. No sign means go','No. Wait until it will not get in anyone\'s way'], answer:1} }
  ],
  quiz:[
    {show:{scene:'signalEarly', t:1.6}, q:'How far before a turn must your signal be on?', o:['At least 25 feet','At least 100 feet','Half a mile'], a:1, why:'At least 100 feet before you turn.'},
    {show:{scene:'signalEarly', t:1.6}, q:'Your turn signal is on. Does that give you the right-of-way?', o:['Yes','No'], a:1, why:'A signal tells others your plan. It does not give you the right to go.'},
    {show:{scene:'rightAB'}, q:'Which path is the correct right turn?', o:['Path A','Path B'], a:0, why:'Stay close to the right curb and finish in the right lane.'},
    {show:{scene:'leftAB'}, q:'Which path is the correct left turn?', o:['Path A','Path B'], a:1, why:'Do not cut the corner. Finish in the lane just right of the center line.'},
    {show:{fig:'hands', only:'out'}, q:'An arm held straight out of the driver\'s window means:', o:['Left turn','Right turn','Slowing or stopping'], a:0, why:'Straight out is a left turn.'},
    {show:{fig:'hands', only:'down'}, q:'An arm out the window and pointing down means:', o:['Left turn','Right turn','Slowing or stopping'], a:2, why:'Arm down means slowing or stopping.'},
    {show:NOPASS, q:'How close to an intersection or railroad crossing does passing become illegal?', o:['Within 100 feet','Within 500 feet','Only inside it'], a:0, why:'No passing within 100 feet of either one.'},
    {show:{scene:'blind', t:1.6}, q:'What is the surest way to check your blind spot?', o:['The rearview mirror','A quick look over your shoulder','Listening for a horn'], a:1, why:'Mirrors cannot see that area. Turn your head.'},
    {show:{scene:'passBroken', t:2.9}, q:'Which side do you pass on?', o:['The left','The right','Either one'], a:0, why:'Pass on the left, and never pass a car that is signaling a left turn.'},
    {show:UTURN, q:'A red circle and slash over a U-shaped arrow means:', o:['U-turns only','No U-turn','Roundabout ahead'], a:1, why:'The slash means that movement is prohibited.'}
  ]
});
})();
