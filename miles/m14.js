/* Mile 14: Phones, impairment and the law */
(function(){
var MO = window.MO, s = MO.s, tx = MO.tx, txs = MO.txs, INK = MO.INK, CAR = MO.CAR, YOU = MO.YOU;

MO.figs.phone = function(svg){
  MO.figBg(svg);
  function ph(cx, cy, ang){
    var g = s('g', {transform:'translate(' + cx + ' ' + cy + ') rotate(' + ang + ')'}, svg);
    s('rect', {x:-26, y:-50, width:52, height:100, rx:10, fill:INK}, g);
    s('rect', {x:-21, y:-42, width:42, height:80, rx:4, fill:'#9CC8EE'}, g);
    [-28, -16, -4].forEach(function(y){ s('rect', {x:-15, y:y, width:30, height:6, rx:3, fill:'#fff', opacity:.85}, g); });
  }
  s('path', {d:'M56,250 Q52,186 88,170 L128,170 Q150,190 146,250 Z', fill:'#D9A07B', stroke:INK, 'stroke-width':2}, svg);
  ph(102, 150, -10);
  s('ellipse', {cx:76, cy:178, rx:9, ry:22, fill:'#D9A07B', stroke:INK, 'stroke-width':2, transform:'rotate(-14 76 178)'}, svg);
  MO.sign(svg, 'no', 158, 84, 48);
  tx(svg, 100, 286, 'In your hand', {size:18, weight:900, fill:'#A32A22'});
  txs(svg, 100, 306, 'Illegal while driving', {size:13, weight:700});
  s('rect', {x:216, y:214, width:170, height:36, rx:8, fill:'#2A3037'}, svg);
  s('rect', {x:292, y:186, width:14, height:30, fill:'#56616A'}, svg);
  ph(299, 138, 0);
  MO.sign(svg, 'ok', 356, 84, 48);
  tx(svg, 300, 286, 'Hands-free', {size:18, weight:900, fill:'#0A6A4E'});
  txs(svg, 300, 306, 'Voice calls and|voice-to-text only', {size:13, weight:700, lh:16});
  s('line', {x1:200, y1:40, x2:200, y2:326, stroke:'#C9CFC6', 'stroke-width':2}, svg);
  txs(svg, 200, 358, 'No reading, typing, scrolling|or recording video while you drive.', {size:14, weight:800, lh:18});
};

MO.figs.bac = function(svg){
  MO.figBg(svg);
  s('rect', {x:16, y:16, width:368, height:118, rx:12, fill:INK}, svg);
  tx(svg, 200, 54, 'UNDER 21: ZERO TOLERANCE', {size:19, weight:900, fill:'#F5C120'});
  txs(svg, 200, 84, 'Any alcohol or impairing drug|means a 2-year license suspension', {size:15, weight:800, fill:'#fff', lh:20});
  tx(svg, 200, 172, 'Blood alcohol level', {size:13, weight:800, fill:'#56616A'});
  function X(v){ return 40 + v / .2 * 320; }
  s('rect', {x:X(0), y:186, width:X(.08) - X(0), height:26, fill:'#F5C120', stroke:INK, 'stroke-width':1.5}, svg);
  s('rect', {x:X(.08), y:186, width:X(.15) - X(.08), height:26, fill:'#F08A24', stroke:INK, 'stroke-width':1.5}, svg);
  s('rect', {x:X(.15), y:186, width:X(.2) - X(.15), height:26, fill:'#C3342B', stroke:INK, 'stroke-width':1.5}, svg);
  [[0, '0.00'], [.08, '0.08'], [.15, '0.15']].forEach(function(m){
    s('line', {x1:X(m[0]), y1:182, x2:X(m[0]), y2:220, stroke:INK, 'stroke-width':2.5}, svg);
    tx(svg, X(m[0]), 238, m[1], {size:14, weight:900});
  });
  txs(svg, 72, 262, 'Under 21:|already illegal', {size:12.5, weight:800, lh:15});
  txs(svg, 186, 262, 'Adults: license|taken on the spot', {size:12.5, weight:800, lh:15});
  txs(svg, 316, 262, 'Extreme|DUI', {size:12.5, weight:800, lh:15});
  txs(svg, 200, 332, 'Under 0.08 is not a free pass. You can still be|arrested if your driving is impaired.', {size:13, weight:700, fill:'#56616A', lh:17});
};

MO.scene('pulledOver', {
  layout:{type:'road'}, duration:6.5, freeze:3.4, thumb:3.8,
  actors:[
    {kind:'cop', path:'M222,470 L222,380 C222,350 234,342 234,312 L234,236', keys:[[0,0],[1.6,90],[3.6,'end'],[9,'end']]},
    {kind:'car', color:CAR.you, path:'M222,400 L222,290 C222,260 234,252 234,222 L234,150', keys:[[0,0],[1.4,110],[3.2,'end'],[9,'end']], signal:[{side:'R', from:0.6, to:3.2}], tags:[YOU]}
  ],
  captions:[[0,'Police lights come on behind you.'],[0.8,'Signal and pull over as soon as it is safe.'],[3.2,'Engine and music off. Stay in the car.'],[4.4,'Hands on the wheel. At night, turn on the inside light.'],[5.6,'Wait to be asked before reaching for your license.']]
});

var PHONE = {fig:'phone'};
var FOCUS = {fig:'steps', title:'Other ways to lose focus', items:[
  {t:'Reaching or searching', d:'Dropped something? It stays dropped|until you are parked.'},
  {t:'Setting the GPS or music', d:'Do it before the car moves.'},
  {t:'Driving drowsy', d:'As serious as driving impaired.|The only fix is rest.'},
  {t:'Driving upset', d:'Angry, worried or keyed up?|Wait until you are calm.'}
]};
var BAC = {fig:'bac'};
var DUI = {fig:'tiles', title:'A first DUI, at the very least', bs:30, lx:196, items:[
  {big:'10', unit:'days', label:'in jail'},
  {big:'$1,250', label:'in fines'},
  {big:'90', unit:'days', label:'license suspended'},
  {big:'12', unit:'months', label:'suspended for|refusing the test'}
]};
var POINTS = {fig:'tiles', title:'Points on your license', bs:34, lx:138, items:[
  {big:'8', unit:'pts', label:'DUI, reckless driving,|racing, aggressive driving'},
  {big:'6', unit:'pts', label:'Leaving the scene of a crash'},
  {big:'3', unit:'pts', label:'Speeding'},
  {big:'2', unit:'pts', label:'Most other moving violations'}
]};
var PAPERS = {fig:'tiles', title:'Always in the car with you', lx:100, items:[
  {sign:'ok', label:'Driver license or permit'},
  {sign:'ok', label:'Vehicle registration'},
  {sign:'ok', label:'Proof of insurance'}
]};

MO.mile({
  n:14, id:'law', title:'Phones, impairment and the law', badge:'Clear Head',
  blurb:'What gets a new driver in trouble fastest.',
  steps:[
    { title:'Your phone', rule:'Phone out of your hands. No reading, typing or filming.',
      why:'Hands-free calls and voice-to-text are allowed, and you may use the phone to report an emergency. Need to text? Pull over first.',
      show:PHONE,
      try:{ask:'You are driving down a quiet street and your phone buzzes with a text. What do you do?', choices:['Hold it up and read it quickly','Leave it. Pull over if it matters','Text back with one hand'], answer:1} },
    { title:'Focus', rule:'Tired or upset counts as impaired. The only cure for drowsy is rest.',
      why:'Anything that takes your eyes, hands or mind off driving is a distraction, including food, passengers and the stereo.',
      show:FOCUS,
      try:{ask:'Your eyes are heavy on a long drive. What actually fixes it?', choices:['Opening the window and turning up the music','Pulling over to rest','A soda, and pushing on'], answer:1} },
    { title:'Under 21', rule:'Under 21: any alcohol means a 2-year suspension.',
      why:'It covers marijuana, medications and other drugs that impair you too. Impaired drivers usually feel fine, which is exactly the problem.',
      show:BAC,
      try:{ask:'You are 17. You had one drink at a party and feel fine. Can you legally drive home?', choices:['Yes. Under 0.08 is legal','No. Under 21, any alcohol can cost my license for 2 years'], answer:1} },
    { title:'DUI and the test', rule:'By driving in Arizona, you have already agreed to be tested.',
      why:'That is called implied consent. Refuse a breath, blood or urine test after a DUI arrest and you lose your license for 12 months automatically.',
      show:DUI,
      try:{ask:'A driver arrested for DUI refuses the test. What happens?', choices:['Nothing. Refusing is their right','An automatic 12-month loss of license','A warning'], answer:1} },
    { title:'Points', rule:'8 points in 12 months means Traffic Survival School or a suspension.',
      why:'Aggressive driving means speeding plus at least two more violations in one stretch, such as tailgating and unsafe lane changes. It is 8 points all at once.',
      show:POINTS,
      try:{ask:'How many points does a speeding ticket put on your license?', choices:['1','3','8'], answer:1} },
    { title:'Getting pulled over', setup:'You see police lights in your mirror.',
      rule:'Pulled over: stop safely, stay in the car, hands in plain sight.',
      why:'If your license is out of reach, say where it is before you move. If you disagree with the officer, settle it in court and not at the roadside.',
      show:{scene:'pulledOver'},
      try:{ask:'The officer is walking up. Your license is in the glove box. What do you do?', choices:['Grab it now to save time','Keep my hands on the wheel, say where it is, and wait','Get out and hand it over'], answer:1} },
    { title:'Your papers', rule:'No proof of insurance: a 3-month suspension, the first time.',
      why:'A second offense within 36 months costs 6 months, and the suspension covers your license, registration and plates.',
      show:PAPERS,
      try:{ask:'What three things will an officer usually ask for at a traffic stop?', choices:['License, registration, proof of insurance','License, passport, phone','Registration, title, birth certificate'], answer:0} }
  ],
  quiz:[
    {show:PHONE, q:'Which of these is legal while you are driving?', o:['Holding the phone to read a text','A hands-free call','Recording a video'], a:1, why:'Hands-free use is allowed. Holding the phone is not.'},
    {show:PHONE, q:'You need to send a text. What do you do?', o:['Pull over first','Type it at a slow speed','Use one hand'], a:0, why:'Pull over to text or to handle the phone.'},
    {show:FOCUS, q:'Drowsy driving is:', o:['Fine if you are careful','As serious as impaired driving','Only a problem at night'], a:1, why:'Fatigue slows you the way alcohol does. Rest is the only fix.'},
    {show:BAC, q:'Under 21, how much alcohol can cost you your license?', o:['0.08','0.04','Any amount'], a:2, why:'Arizona has zero tolerance for drivers under 21.'},
    {show:BAC, q:'How long is the zero-tolerance suspension for a driver under 21?', o:['30 days','6 months','2 years'], a:2, why:'Two years.'},
    {show:DUI, q:'What does implied consent mean?', o:['You agreed to be tested when you chose to drive here','You may refuse a test without penalty','Police need your written permission'], a:0, why:'Refusing costs you your license for 12 months.'},
    {show:DUI, q:'What is the minimum jail time for a first DUI?', o:['None','10 days in a row','1 day'], a:1, why:'At least 10 consecutive days, plus fines and a suspension.'},
    {show:POINTS, q:'What happens at 8 points within 12 months?', o:['Nothing','Traffic Survival School or a suspension','Automatic jail'], a:1, why:'You must attend Traffic Survival School or risk a suspension.'},
    {show:{scene:'pulledOver', t:3.8}, q:'During a traffic stop at night, what do you switch on?', o:['High beams','The interior light','Nothing'], a:1, why:'The interior light lets the officer see inside the car.'},
    {show:PAPERS, q:'What is the penalty the first time you cannot show proof of insurance?', o:['A warning','A 3-month suspension','A 2-year suspension'], a:1, why:'Three months for the first violation.'}
  ]
});
})();
