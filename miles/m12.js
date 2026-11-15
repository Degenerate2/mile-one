/* Mile 12: Arizona weather and night */
(function(){
var MO = window.MO, s = MO.s, tx = MO.tx, txs = MO.txs, CAR = MO.CAR, YOU = MO.YOU;

MO.figs.hydro = function(svg){
  MO.figBg(svg, '#E8F0F4');
  tx(svg, 200, 38, 'Hydroplaning', {size:22, weight:900});
  txs(svg, 200, 62, 'The tire rides up on a film of water|and stops gripping the road.', {size:13.5, weight:700, fill:'#56616A', lh:17});
  s('rect', {x:0, y:270, width:400, height:22, fill:'#474D55'}, svg);
  s('path', {d:'M0,263 L120,263 Q160,262 178,252 L262,258 Q310,263 400,263 L400,270 L0,270 Z', fill:'#4F9BD9', opacity:.9}, svg);
  s('circle', {cx:222, cy:182, r:72, fill:'#1A1E22'}, svg);
  s('circle', {cx:222, cy:182, r:40, fill:'#C9CED2', stroke:'#8A9299', 'stroke-width':3}, svg);
  s('circle', {cx:222, cy:182, r:10, fill:'#56616A'}, svg);
  MO.arrow(svg, 96, 150, 40, 150, {color:'#1A2026', w:4, head:9});
  tx(svg, 68, 136, '50 mph', {size:13, weight:900});
  MO.arrow(svg, 330, 228, 262, 256, {color:'#1F5FA8', w:2.5, head:6});
  tx(svg, 344, 222, 'water', {size:12, fill:'#1F5FA8'});
  MO.pill(svg, 200, 318, 'EASE OFF THE GAS', 'good', 11);
  MO.pill(svg, 200, 346, 'DO NOT BRAKE', 'bad', 11);
  MO.pill(svg, 200, 374, 'HOLD THE WHEEL STEADY', 'good', 11);
};

MO.figs.beams = function(svg){
  s('rect', {x:0, y:0, width:400, height:400, fill:'#0E1626'}, svg);
  function panel(cx, title, sub, high){
    s('rect', {x:cx - 38, y:62, width:76, height:276, fill:'#2A3038'}, svg);
    s('line', {x1:cx, y1:62, x2:cx, y2:338, stroke:'#F3C01F', 'stroke-width':1.6, 'stroke-dasharray':'12 10'}, svg);
    var x = cx + 19, top = high ? 76 : 206;
    s('polygon', {points:(x - 8) + ',284 ' + (x + 8) + ',284 ' + (x + (high ? 30 : 22)) + ',' + top + ' ' + (x - (high ? 48 : 30)) + ',' + top, fill:'#FFE89A', opacity:.5}, svg);
    MO.still(svg, 'car', x, 302, 0, {color:CAR.you});
    if (!high) { MO.still(svg, 'car', x, 150, 0, {color:CAR.gray}); MO.dim(svg, cx - 52, 284, cx - 52, 168, ''); MO.pill(svg, cx - 52, 226, '200 FT', 'warn', 9); }
    else MO.pill(svg, cx, 170, 'NOBODY WITHIN 500 FT', 'warn', 8);
    tx(svg, cx, 38, title, {size:19, weight:900, fill:'#fff'});
    txs(svg, cx, 362, sub, {size:13, weight:700, fill:'#DDE3EA', lh:16});
  }
  panel(100, 'HIGH BEAMS', 'Only when nobody is|within 500 feet', true);
  panel(300, 'LOW BEAMS', 'Oncoming traffic, or within|200 feet of the car ahead', false);
  s('line', {x1:200, y1:54, x2:200, y2:346, stroke:'#3A4352', 'stroke-width':2}, svg);
};

MO.scene('dust', {
  layout:{type:'fwy'}, duration:7, freeze:3.8, thumb:4.8,
  overlay:{fill:'#C9A46B', keys:[[0,0],[1.6,.3],[4,.72],[9,.72]]},
  actors:[
    {kind:'car', color:CAR.you, path:'M220,430 L220,340 C220,290 294,280 294,230 L294,200', keys:[[0,0],[1.4,90],[3.0,236],[3.6,'end'],[7,'end']],
      signal:[{side:'R', from:0.8, to:3.0}], lightsOff:[4.2,99], tags:[YOU]}
  ],
  captions:[[0,'A wall of dust is ahead. Slow down now, before you are inside it.'],[1.4,'Pull all the way off the pavement, as far right as you can.'],[3.6,'Stopped. Now turn every light off.'],[4.2,'Foot off the brake, so the brake lights go dark too.'],[5.2,'Seat belt on. Wait it out.']]
});
MO.scene('flood', {
  layout:{type:'road'}, duration:5, freeze:1.2, thumb:2.6,
  props:[['zone', '112,126 288,126 288,206 112,206', '#4F9BD9', .55], ['zone', '156,118 244,118 244,214 156,214', '#4F9BD9', .9], ['barricade', 158, 234, 86], ['sign', 'reg:DO NOT|ENTER|WHEN|FLOODED', 290, 270, 50]],
  actors:[{kind:'car', color:CAR.you, path:MO.up(222), keys:[[0,0],[2.2,150],[7,150]], tags:[YOU]}],
  captions:[[0,'Water is running across the road ahead.'],[2.2,'Stop. You cannot tell how deep it is or what it hides.'],[3.6,'Turn around and find another way.']]
});

var RAIN = {fig:'tiles', title:'When it rains', items:[
  {big:'30', unit:'min', label:'Slickest right after|the rain starts'},
  {big:'6', unit:'sec', label:'Following distance|on wet roads'},
  {big:'50', unit:'mph', label:'Tires can lose all|grip in heavy rain'}
]};
var HYDRO = {fig:'hydro'};
var BEAMS = {fig:'beams'};
var SEE = {fig:'steps', title:'When you cannot see well', items:[
  {t:'Oncoming high beams', d:'Look toward the right edge of the road,|not into the lights.'},
  {t:'Fog', d:'Low beams, slow down, follow the edge line.|Too thick? Pull off and wait.'},
  {t:'Sun glare', d:'Sunglasses, visor down, clean windshield.|Drivers facing the sun may not see you.'},
  {t:'Tired eyes at night', d:'Stop and rest. Take a break about every hour.'}
]};

MO.mile({
  n:12, id:'weather', title:'Arizona weather and night', badge:'Storm Smart',
  blurb:'Dust storms, monsoon rain, floods and headlights.',
  steps:[
    { title:'Dust storm', setup:'You are on the freeway and the sky ahead turns brown.',
      rule:'Pull Aside, Stay Alive: off the road, lights off, foot off the brake.',
      why:'In thick dust, drivers behind you steer toward any lights they can see. If yours are on, they may follow you right off the road and hit you.',
      show:{scene:'dust'},
      try:{ask:'You are stopped off the road in the dust. What do you do with your lights?', choices:['Hazard flashers on','Headlights on so others can see me','All lights off, foot off the brake'], answer:2} },
    { title:'Rain', rule:'Rain: slow down and double your following distance.',
      why:'Oil and grime float up in the first half hour of rain and make the road slick. Turn your headlights on so other drivers can see you.',
      show:RAIN,
      try:{ask:'When is a rainy road at its most slippery?', choices:['After it has rained for hours','In the first 30 minutes','Only once it floods'], answer:1} },
    { title:'Hydroplaning', rule:'Hydroplaning: ease off the gas, do not brake, hold the wheel steady.',
      why:'Wait for the tires to grip again. Worn or soft tires lose the road at much lower speeds than good ones.',
      show:HYDRO,
      try:{ask:'In heavy rain the steering suddenly feels light and the car seems to float. What do you do?', choices:['Brake hard','Ease off the gas and hold the wheel steady','Turn sharply toward the shoulder'], answer:1} },
    { title:'Flooded roads', setup:'A monsoon storm has filled the wash that crosses this road.',
      rule:'Flooded road: turn around.',
      why:'Moving water hides holes and can carry a car away. Drive around a flood barricade and you can be billed for your own rescue.',
      show:{scene:'flood'},
      try:{ask:'A barricade blocks a flooded wash, and the water looks shallow. What do you do?', choices:['Drive around the barricade slowly','Turn around','Follow the truck that just made it across'], answer:1} },
    { title:'Headlights', rule:'Headlights on from sunset to sunrise. High beams only when nobody is within 500 feet.',
      why:'Drop to low beams for oncoming traffic and when you are within 200 feet of the car ahead. Use low beams in rain, dust and fog too. Turn headlights on as daylight fades. Parking lights are not enough.',
      show:BEAMS,
      try:{ask:'At night you are following a car about 150 feet ahead. Which beams?', choices:['High beams','Low beams','Parking lights only'], answer:1} },
    { title:'Glare and fog', rule:'Blinded by oncoming headlights? Look to the right edge of the road.',
      why:'Your eyes follow where you look. Using the edge line keeps you in your lane without staring into the lights.',
      show:SEE,
      try:{ask:'An oncoming driver leaves the high beams on. Where do you look?', choices:['Straight at the lights','Toward the right edge of the road','At my mirror'], answer:1} }
  ],
  quiz:[
    {show:{scene:'dust', t:4.8}, q:'You are stopped off the road in a dust storm. What about your lights?', o:['Headlights on','Hazard flashers on','All lights off'], a:2, why:'Lights off and foot off the brake, so nobody follows you off the road.'},
    {show:{scene:'dust', t:0.6}, q:'When do you start slowing down for a dust storm?', o:['Before you are in it','Once you cannot see the road','When other cars stop'], a:0, why:'Slow down as soon as you see it coming.'},
    {show:{scene:'dust', t:3.8}, q:'Where do you stop in a severe dust storm?', o:['In the right lane','On the shoulder with flashers on','Completely off the pavement, as far right as possible'], a:2, why:'Not in a travel lane and not in the emergency lane.'},
    {show:RAIN, q:'What following distance do you keep on wet roads?', o:['2 seconds','3 seconds','At least 6 seconds'], a:2, why:'At least 6 seconds in the wet.'},
    {show:HYDRO, q:'What should you not do while hydroplaning?', o:['Ease off the gas','Hit the brakes','Hold the wheel steady'], a:1, why:'Braking or sharp steering can spin the car.'},
    {show:{scene:'flood', t:2.6}, q:'Who can be billed for a rescue from a flooded road?', o:['Nobody','A driver who drove around the barricades','The county'], a:1, why:'Go around a barricade and the rescue costs can land on you.'},
    {show:BEAMS, q:'High beams are allowed only when no vehicle is within:', o:['100 feet','500 feet','One mile'], a:1, why:'500 feet. Within 200 feet behind another car, use low beams.'},
    {show:BEAMS, q:'When are headlights required?', o:['From sunset to sunrise','Only after midnight','Only on highways'], a:0, why:'Sunset to sunrise, and whenever it is hard to see.'},
    {show:SEE, q:'Which headlights do you use in fog?', o:['High beams','Low beams','None'], a:1, why:'Low beams. High beams bounce back off the fog.'}
  ]
});
})();
