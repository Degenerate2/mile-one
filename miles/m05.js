/* Mile 5: Lines and curbs */
(function(){
var MO = window.MO, CAR = MO.CAR, YOU = MO.YOU;
var FOUR = {type:'road', up:2, down:2, w:38};   /* lanes: up 219, 257; down 181, 143 */

MO.scene('flow4', {
  layout:FOUR, duration:6, thumb:2.6,
  top:[['label', 200, 44, 'YELLOW LINE: oncoming traffic across it', 'warn', 9], ['label', 238, 372, 'WHITE LINE: same direction', 'dark', 9]],
  actors:[
    {kind:'car', color:CAR.gray, path:MO.down(181), linear:true, keys:[[0,0],[6,420]]},
    {kind:'car', color:CAR.purple, path:MO.down(143), linear:true, keys:[[0,120],[6,460]]},
    {kind:'car', color:CAR.orange, path:MO.up(257), linear:true, keys:[[0,160],[6,460]]},
    {kind:'car', color:CAR.you, path:MO.up(219), linear:true, keys:[[0,40],[6,400]], tags:[YOU]}
  ],
  captions:[[0,'Yellow line in the middle: the cars across it are coming toward you.'],[3,'White lines: the cars beside you are going your way.']]
});
MO.scene('wrongSide', {layout:{type:'road'}, actors:[
  {kind:'car', color:CAR.you, path:MO.up(178), keys:[[0,210]], tags:[YOU]}],
  top:[['label', 262, 220, 'yellow line', 'warn', 9], ['arrow', 232, 220, 206, 220, '#1A2026', 2.5]]});
MO.scene('passBroken', {
  layout:{type:'road', center:'broken'}, duration:6.5, freeze:1.0, thumb:2.9,
  actors:[
    {kind:'car', color:CAR.gray, path:MO.up(222), linear:true, keys:[[0,150],[6.5,280]]},
    {kind:'car', color:CAR.you, path:'M222,430 L222,340 C222,295 178,285 178,240 L178,180 C178,135 222,125 222,80 L222,-30', linear:true,
      keys:[[0,0],[1.1,90],[2.5,200],[3.4,260],[4.8,370],[6.5,'end']], signal:[{side:'L', from:0.7, to:2.5},{side:'R', from:3.2, to:4.8}], tags:[YOU]}
  ],
  captions:[[0,'Broken yellow line, and a slow car ahead.'],[1.0,'The road ahead is clear, so passing is allowed.'],[2.5,'Pass on the left.'],[3.4,'Signal and move back once you are well ahead.']]
});
MO.scene('noPass', {layout:{type:'road', center:'solidUp'}, actors:[
  {kind:'car', color:CAR.gray, path:MO.up(222), keys:[[0,220]]},
  {kind:'car', color:CAR.you, path:MO.up(222), keys:[[0,130]], tags:[YOU]}]});
MO.scene('dbl', {layout:{type:'road'}, actors:[
  {kind:'car', color:CAR.gray, path:MO.down(178), keys:[[0,150]]},
  {kind:'car', color:CAR.you, path:MO.up(222), keys:[[0,130]], tags:[YOU]}],
  top:[['label', 200, 44, 'DOUBLE SOLID YELLOW', 'warn', 10]]});
MO.scene('laneChange', {
  layout:FOUR, duration:5, freeze:1.2, thumb:2.2,
  actors:[
    {kind:'car', color:CAR.orange, path:MO.up(257), linear:true, keys:[[0,230],[5,330]]},
    {kind:'car', color:CAR.you, path:MO.shift(257, 219, 300, 190), linear:true, keys:[[0,40],[1.6,130],[3.2,249],[5,'end']], signal:[{side:'L', from:0.8, to:3.2}], tags:[YOU]}
  ],
  captions:[[0,'A broken white line sits between your lane and the next one.'],[0.8,'Signal, check your mirror, look over your shoulder.'],[1.6,'Clear. Change lanes smoothly.']]
});
MO.scene('dblWhite', {layout:{type:'road', up:2, down:2, w:38, sep:'double'}, actors:[
  {kind:'car', color:CAR.you, path:MO.up(257), keys:[[0,150]], tags:[YOU]}],
  top:[['label', 238, 60, 'DOUBLE SOLID WHITE', 'dark', 9]]});
MO.scene('turnLane', {
  layout:{type:'road', center:'turn', w:44, cw:40}, duration:6.4, freeze:1.0, thumb:3.4,
  props:[['rect', 0, 176, 136, 28, '#474D55']],
  actors:[
    {kind:'car', color:CAR.gray, path:MO.down(158), keys:[[0,0],[1.6,0],[4.4,'end']]},
    {kind:'car', color:CAR.you, path:'M242,430 L242,350 C242,305 200,295 200,250 L200,215 Q200,190 170,190 L-30,190',
      keys:[[0,0],[1.1,80],[2.3,190],[2.9,220],[4.6,220],[6.4,'end']], signal:[{side:'L', from:0.6, to:5.6}], tags:[YOU]}
  ],
  captions:[[0,'The middle lane has yellow lines on both sides.'],[1.2,'Signal and move all the way into it.'],[2.9,'Wait there for a gap in oncoming traffic.'],[4.6,'Turn left.']]
});

var CURBS = {fig:'tiles', title:'Painted curbs', bs:25, lx:178, items:[
  {chip:'#F4F4EF', big:'WHITE', label:'Stop only to pick up|or drop off passengers'},
  {chip:'#F3C01F', big:'YELLOW', label:'Stop only to load|or unload'},
  {chip:'#C3342B', big:'RED', label:'No stopping, standing|or parking'}
]};

MO.mile({
  n:5, id:'lines', title:'Lines and curbs', badge:'Line Reader',
  blurb:'What the paint on the road is telling you.',
  steps:[
    { title:'Yellow or white?', setup:'Watch which way the cars move on each side of each line.',
      rule:'Yellow divides opposite directions. White divides the same direction.',
      why:'If a yellow line is ever on your right, you are on the wrong side of the road.',
      show:{scene:'flow4'},
      try:{show:{scene:'wrongSide'}, ask:'The yellow line is on your right. What does that mean?', choices:['Nothing. That is normal','You are driving on the wrong side of the road','You are in a passing lane'], answer:1} },
    { title:'Passing lines', setup:'A slow car is ahead and the center line is broken.',
      rule:'Broken yellow line: you may pass when the way ahead is clear.',
      why:'A solid yellow line on your side means no passing. Pass on the left, and get back into your lane well ahead of the car you passed.',
      show:{scene:'passBroken'},
      try:{show:{scene:'noPass'}, ask:'The yellow line on your side is solid, and the car ahead is slow. Can you pass?', choices:['Yes, if nothing is coming','No. Solid on your side means no passing'], answer:1} },
    { title:'Double yellow', rule:'Double solid yellow: nobody passes.',
      why:'You may cross it only to turn left, into a driveway or a side street, when it is safe.',
      show:{scene:'dbl'},
      try:{ask:'Can you cross a double yellow line to turn left into a driveway?', choices:['Yes, when it is safe','No, never'], answer:0} },
    { title:'White lane lines', setup:'You are in the right lane and want the left one.',
      rule:'Broken white: change lanes when it is safe. Solid white: stay in your lane.',
      why:'Solid white lines mark the road edge and guide you near intersections. A double solid white line is a wall: do not cross it.',
      show:{scene:'laneChange'},
      try:{show:{scene:'dblWhite'}, ask:'A double solid white line separates you from the next lane. Can you change lanes?', choices:['Yes, with a signal','No. Do not cross it'], answer:1} },
    { title:'The center turn lane', setup:'You want to turn left into a driveway on a busy street.',
      rule:'Center lane with yellow on both sides: left turns only.',
      why:'Drivers from both directions share it. Never use it to pass, to drive along, or to speed up before merging.',
      show:{scene:'turnLane'},
      try:{ask:'Can you use the center turn lane to pass a slow car?', choices:['Yes, if it is empty','No. It is for left turns only'], answer:1} },
    { title:'Curb colors', rule:'White curb: quick drop-off. Yellow: loading. Red: never.',
      why:'Curb paint tells you whether you may stop there at all, and for what.',
      show:CURBS,
      try:{ask:'Red curb outside a store. Can you stop for 30 seconds to drop off a friend?', choices:['Yes, if I stay in the car','No. Red means no stopping at all'], answer:1} }
  ],
  quiz:[
    {show:{scene:'flow4', t:2.6}, q:'What does a yellow center line separate?', o:['Lanes going the same way','Traffic going opposite ways','The bike lane'], a:1, why:'Yellow means the traffic across the line is coming toward you.'},
    {show:{scene:'flow4', t:2.6}, q:'What do white lane lines separate?', o:['Traffic going the same way','Traffic going opposite ways','Parking from driving'], a:0, why:'White lines sit between lanes moving in the same direction.'},
    {show:{scene:'noPass'}, q:'Solid yellow on your side, broken on the other side. Who may pass?', o:['Only you','Only drivers coming the other way','Nobody'], a:1, why:'The solid line applies to the lane next to it. That is yours.'},
    {show:{scene:'passBroken', t:1.0}, q:'Broken yellow center line. When may you pass?', o:['Any time you like','When the way ahead is clear','Never'], a:1, why:'A broken line allows passing only when it is clear and safe.'},
    {show:{scene:'dbl'}, q:'Double solid yellow. May you cross it to turn left into a driveway?', o:['Yes, when it is safe','No'], a:0, why:'Turning left is the one reason you may cross a double yellow.'},
    {show:{scene:'dblWhite'}, q:'Double solid white lines between lanes mean:', o:['Change lanes with care','Do not cross','Passing zone'], a:1, why:'Double solid white lines may not be crossed.'},
    {show:{scene:'turnLane', t:2.9}, q:'What is the center lane with yellow lines on both sides for?', o:['Passing','Left turns, from either direction','Faster traffic'], a:1, why:'It is a shared left-turn lane and nothing else.'},
    {show:CURBS, q:'A yellow curb means:', o:['No stopping at all','Loading and unloading only','Free parking'], a:1, why:'Yellow is for loading and unloading.'},
    {show:CURBS, q:'A white curb means:', o:['Passenger pick-up and drop-off only','Disabled parking','No stopping at all'], a:0, why:'White is for picking up or dropping off passengers.'}
  ]
});
})();
