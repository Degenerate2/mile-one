/* Mile 2: Before you drive */
(function(){
var MO = window.MO, s = MO.s, tx = MO.tx, txs = MO.txs, INK = MO.INK;

/* penny test: tread depth against Lincoln's head */
MO.figs.penny = function(svg, p){
  MO.figBg(svg);
  function panel(cx, top, title, sub, col){
    var py = 254;
    s('circle', {cx:cx, cy:py, r:46, fill:'#B87333', stroke:'#7A4A1E', 'stroke-width':3}, svg);
    s('circle', {cx:cx, cy:py, r:39, fill:'none', stroke:'#9A5F2A', 'stroke-width':1.5}, svg);
    s('ellipse', {cx:cx, cy:py - 24, rx:24, ry:12, fill:'#8A5526'}, svg);
    s('circle', {cx:cx, cy:py + 9, r:18, fill:'#8A5526'}, svg);
    s('rect', {x:cx - 88, y:top, width:176, height:350 - top, fill:'#23282D'}, svg);
    [-66, -22, 22, 66].forEach(function(gx){ s('rect', {x:cx + gx - 5, y:top, width:10, height:300 - top, fill:'#3D444B'}, svg); });
    s('rect', {x:cx - 88, y:300, width:176, height:50, fill:'#1A1E22'}, svg);
    tx(svg, cx, 338, 'TIRE', {size:10, fill:'#8A9299', ls:2});
    if (top > 281) { MO.arrow(svg, cx + 62, 262, cx + 22, 279, {color:'#A32A22', w:2.5, head:6}); tx(svg, cx + 64, 256, 'top of head', {size:11, fill:'#A32A22'}); }
    if (title) { tx(svg, cx, 66, title, {size:21, weight:900, fill:col}); txs(svg, cx, 90, sub, {size:13, weight:700}); }
  }
  if (p.only === 'worn') panel(200, 290);
  else {
    panel(104, 258, 'GOOD', 'The tread hides|the top of his head', '#0A6A4E');
    panel(296, 290, 'WORN OUT', 'You can see|the top of his head', '#A32A22');
    s('line', {x1:200, y1:50, x2:200, y2:356, stroke:'#C9CFC6', 'stroke-width':2}, svg);
  }
  tx(svg, 200, 384, 'Slide a penny into the tread, head first.', {size:13, weight:700, fill:'#56616A'});
};

/* required equipment, called out around the car */
MO.figs.parts = function(svg){
  MO.figBg(svg);
  s('rect', {x:138, y:146, width:12, height:10, rx:3, fill:'#1F5FA8', stroke:INK, 'stroke-width':1}, svg);
  s('rect', {x:250, y:146, width:12, height:10, rx:3, fill:'#1F5FA8', stroke:INK, 'stroke-width':1}, svg);
  MO.still(svg, 'car', 200, 200, 0, {color:'#2C78D4'}, 5.2);
  var L = [['Headlights', 66, 174, 110], ['Driver mirror:|200 ft view back', 132, 142, 151], ['Tires with|good tread', 246, 150, 252], ['Brake lights', 330, 172, 291]];
  var R = [['Horn: heard|from 200 ft', 58, 204, 110], ['Turn signals', 118, 250, 122], ['Windshield', 162, 238, 158], ['Seat belts', 208, 224, 204], ['Brakes: foot|and parking', 256, 250, 248], ['Hazard|flashers', 326, 228, 291]];
  L.forEach(function(c){
    txs(svg, 8, c[1], c[0], {anchor:'start', size:12.5, weight:800, lh:14});
    s('line', {x1:112, y1:c[1] - 4, x2:c[2], y2:c[3], stroke:INK, 'stroke-width':1.3}, svg);
    s('circle', {cx:c[2], cy:c[3], r:3.5, fill:'#F5C120', stroke:INK, 'stroke-width':1.2}, svg);
  });
  R.forEach(function(c){
    txs(svg, 392, c[1], c[0], {anchor:'end', size:12.5, weight:800, lh:14});
    s('line', {x1:298, y1:c[1] - 4, x2:c[2], y2:c[3], stroke:INK, 'stroke-width':1.3}, svg);
    s('circle', {cx:c[2], cy:c[3], r:3.5, fill:'#F5C120', stroke:INK, 'stroke-width':1.2}, svg);
  });
};

var SETUP = {fig:'steps', title:'Before the car moves', items:[
  {t:'Adjust your seat', d:'So you can reach the pedals and see out.'},
  {t:'Adjust the steering wheel'},
  {t:'Set your mirrors', d:'They are set from where you sit,|so the seat comes first.'},
  {t:'Buckle up', d:'You and everyone riding with you.'},
  {t:'Check signals and brakes', d:'Know they work before you need them.'}
]};
var BELTS = {fig:'seats', seats:{fl:{tone:'you', label:'YOU'}, fr:{tone:'ok', label:'Belt on'}, rl:{tone:'kid', label:'Age 14'}, rr:{tone:'ok', label:'Age 17'}}, note:'UNDER 16: THE DRIVER MAKES SURE THEY BUCKLE'};
var KIDS = {fig:'tiles', title:'Kids in the car', bs:26, lx:176, items:[
  {big:'Under 5', label:'Child safety seat'},
  {big:'Ages 5-7', label:'Booster seat, until they|are 4 feet 9 inches tall'},
  {big:'12 or less', label:'Back seat is safest'}
]};
var PENNY = {fig:'penny'};
var PARTS = {fig:'parts'};

MO.mile({
  n:2, id:'before', title:'Before you drive', badge:'Ready to Roll',
  blurb:'Seat, mirrors, belts, tires and a road-legal car.',
  steps:[
    { title:'Set yourself up', rule:'Seat, wheel, mirrors, belt. Then drive.',
      why:'Do it while parked. Adjusting anything once the car is moving takes your eyes and hands off the job.',
      show:SETUP,
      try:{ask:'When should you adjust your mirrors?', choices:['At the first red light','Before the car moves','Once you reach a quiet street'], answer:1} },
    { title:'Seat belts', rule:'Front seat buckles up. The driver answers for anyone under 16.',
      why:'Front-seat belts must be fastened whenever the car is moving. Passengers under 16 must be buckled, and making sure of that is the driver\'s job.',
      show:BELTS,
      try:{ask:'Your 14-year-old brother in the back seat will not buckle up. Who is responsible?', choices:['He is','Your parents','You, the driver'], answer:2} },
    { title:'Little passengers', rule:'Under 5: child seat. Ages 5 to 7: booster until 4 foot 9.',
      why:'Kids 12 and under are safest in the back seat. If one has to ride up front, switch the passenger airbag off when the car has a switch for it.',
      show:KIDS,
      try:{ask:'Your 6-year-old cousin is 4 feet tall. What does she ride in?', choices:['A regular seat belt','A booster seat','Anything, as long as she is in the back'], answer:1} },
    { title:'The penny test', rule:'If you can see the top of Lincoln\'s head, the tread is worn out.',
      why:'Check tire pressure too. The right number is on a sticker inside the driver\'s door frame.',
      show:PENNY,
      try:{show:{fig:'penny', only:'worn'}, ask:'The top of Lincoln\'s head is showing above the tread. What does that tell you?', choices:['The tires are fine','The tires may need replacing','The tires have too much air'], answer:1} },
    { title:'A road-legal car', rule:'Lights, signals, brakes, horn, mirrors, tires and belts all have to work.',
      why:'The horn must be heard from 200 feet, and the driver-side mirror must show 200 feet behind you. Use your hazard flashers any time you are stopped on the road or shoulder.',
      show:PARTS,
      try:{ask:'From how far away must your horn be heard?', choices:['50 feet','200 feet','500 feet'], answer:1} }
  ],
  quiz:[
    {show:SETUP, q:'Which comes first before you drive off?', o:['Mirrors, then seat','Seat, then mirrors','Either order is the same'], a:1, why:'Mirrors are set from where you sit, so the seat goes first.'},
    {show:BELTS, q:'Who must wear a seat belt in the front seat?', o:['Only the driver','The driver and the front passenger','Nobody on short trips'], a:1, why:'Everyone in the front seat must be belted while the car is moving.'},
    {show:BELTS, q:'A 15-year-old passenger is not buckled. Who is responsible?', o:['The passenger','The driver','Nobody'], a:1, why:'The driver must make sure passengers under 16 buckle up.'},
    {show:KIDS, q:'A 3-year-old must ride in:', o:['A child safety seat','A booster seat','A regular seat belt'], a:0, why:'Children under 5 ride in a child restraint system.'},
    {show:KIDS, q:'Kids ages 5 to 7 stay in a booster until they reach what height?', o:['4 feet','4 feet 9 inches','5 feet 2 inches'], a:1, why:'The booster stays until 4 feet 9 inches.'},
    {show:{fig:'penny', only:'worn'}, q:'In the penny test, what means the tire is worn out?', o:['The penny will not stand up','You can see the top of Lincoln\'s head','The penny disappears into the tread'], a:1, why:'If the tread does not cover the top of his head, the tire may need replacing.'},
    {show:PARTS, q:'Your driver-side mirror must show how far behind you?', o:['50 feet','100 feet','200 feet'], a:2, why:'The mirror must give a 200-foot view to the rear. The horn must carry 200 feet too.'},
    {show:PARTS, q:'You have to stop on the shoulder. What do you switch on?', o:['High beams','Hazard flashers','Nothing'], a:1, why:'Use hazard flashers whenever you are stopped on the road or shoulder.'}
  ]
});
})();
