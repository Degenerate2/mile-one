/* Mile 4: Signals and arrows */
(function(){
var MO = window.MO, CAR = MO.CAR, YOU = MO.YOU;
function one(kind, label){ return {fig:'signs', items:[[kind, label || '']]}; }

MO.scene('yellowStop', {
  layout:{type:'cross', crosswalks:true}, signal:[[0,'green'],[1.4,'yellow'],[4.2,'red']],
  duration:6.2, freeze:1.7, thumb:3.6,
  actors:[
    {kind:'car', color:CAR.orange, path:'M-30,222 L430,222', keys:[[0,0],[4.5,0],[6.2,'end']]},
    {kind:'car', color:CAR.you, path:MO.up(222), keys:[[0,0],[1.4,60],[3.4,145],[6.2,145]], tags:[YOU]}
  ],
  captions:[[0,'Green light ahead.'],[1.4,'It turns yellow. You have not reached the intersection.'],[2.2,'So you slow down and stop behind the line.'],[4.2,'Red. You are already stopped, and cross traffic goes.']]
});
MO.scene('rightRed', {
  layout:{type:'cross', crosswalks:true}, signal:'red', duration:7.2, freeze:1.9, thumb:2.4,
  actors:[
    {kind:'ped', color:'#D2477E', path:'M250,253 L150,253', linear:true, keys:[[0,0],[0.8,0],[3.8,'end']]},
    {kind:'car', color:CAR.orange, path:'M-30,222 L430,222', keys:[[0,0],[1.4,0],[4.3,'end']]},
    {kind:'car', color:CAR.you, path:'M222,430 L222,262 Q222,222 262,222 L430,222', keys:[[0,0],[1.6,145],[4.5,145],[7.2,'end']], signal:[{side:'R', from:0.3, to:6}], tags:[YOU]}
  ],
  captions:[[0,'Red light. You want to turn right.'],[1.6,'Full stop behind the line first.'],[2.0,'Wait for the person crossing and for the orange car.'],[4.5,'Clear. Turn into the right lane.']]
});

var BASIC = {fig:'sig', states:['red','yellow','green'], state:'yellow'};
var FLASHING = {fig:'signs', items:[['L:flash-red', 'Flashing red:|treat it as a|stop sign'], ['L:flash-yellow', 'Flashing yellow:|slow down, go|with caution']]};
var ARROWS = {fig:'sig', states:['arrow-green','arrow-yellow','arrow-red','flash-arrow-yellow'], state:'arrow-green'};
var HAWK = {fig:'signs', cols:2, items:[
  ['H:dark', 'Dark:|keep going'], ['H:flash-yellow', 'Flashing yellow:|button was pressed'],
  ['H:red', 'Solid red: stop.|Someone is crossing'], ['H:flash-red', 'Flashing red: stop,|then go if empty']
]};
var REDTURNS = {fig:'tiles', title:'Turning on a red light', items:[
  {sign:'ok', label:'Right on red after a full stop,|unless a sign says no'},
  {sign:'ok', label:'Left on red, but only from a|one-way onto a one-way'},
  {sign:'no', label:'Left on red from or onto|a two-way street'}
], lx:96};

MO.mile({
  n:4, id:'signals', title:'Signals and arrows', badge:'Signal Smart',
  blurb:'Every light and arrow, one step at a time.',
  steps:[
    { title:'Red, yellow, green', setup:'Tap each color under the picture to see what it means.',
      rule:'Yellow means stop if you can. It does not mean hurry.',
      why:'Red: stop behind the line. Green: go once the intersection is clear. Yellow: stop unless you are already in the intersection. Speeding up to beat it is illegal.',
      show:BASIC,
      try:{show:{scene:'yellowStop'}, ask:'The light just turned yellow and you have not reached the intersection. What do you do?', choices:['Speed up and make it','Stop behind the line','Stop in the middle of the intersection'], answer:1} },
    { title:'Right turn on red', setup:'Your light is red and your right signal is on.',
      rule:'Right on red: full stop first, then turn when it is clear.',
      why:'Stop before the crosswalk. Yield to people walking, bikes and cross traffic, then turn into the right lane. A NO TURN ON RED sign cancels the whole thing.',
      show:{scene:'rightRed'},
      try:{ask:'Red light, and you want to turn right. What comes first?', choices:['Slow down and roll through if it looks clear','A complete stop, then yield','Nothing. Right turns never have to stop'], answer:1} },
    { title:'Flashing lights', rule:'Flashing red is a stop sign. Flashing yellow is a caution sign.',
      why:'You see these late at night, at quiet intersections, or when a signal has a problem.',
      show:FLASHING,
      try:{show:one('L:flash-red'), ask:'This light is flashing red. What do you do?', choices:['Slow down and coast through','Stop, then go when it is clear','Wait for it to turn green'], answer:1} },
    { title:'Arrows', setup:'Tap each arrow under the picture.',
      rule:'An arrow controls one turn. Flashing yellow arrow: turn only after yielding.',
      why:'Green arrow: go that way when the way is clear. Red arrow: no turn that way. A flashing yellow arrow lets you turn left once oncoming cars and people crossing have gone.',
      show:ARROWS,
      try:{show:one('L:flash-arrow-yellow'), ask:'Flashing yellow left arrow, and a car is coming toward you. What do you do?', choices:['Turn now. The arrow means go','Wait for the oncoming car, then turn','Stop and wait for a green arrow no matter what'], answer:1} },
    { title:'Crosswalk beacons', rule:'Solid red: stop. Flashing red: stop, then go once the crosswalk is empty.',
      why:'These signals hang over busy crosswalks and stay dark until someone pushes the button. The yellow is your warning that red is coming.',
      show:HAWK,
      try:{show:one('H:flash-red'), ask:'The two red lights are flashing back and forth, and the crosswalk is now empty. What do you do?', choices:['Stay stopped until it goes dark','Stop, then go since the crosswalk is clear','Drive through without stopping'], answer:1} },
    { title:'Left turn on red', rule:'Left on red: only from a one-way street onto a one-way street.',
      why:'Stop fully and yield first, the same as a right on red. Anywhere else, a left on red is illegal.',
      show:REDTURNS,
      try:{ask:'You are on a two-way street at a red light and want to turn left. Can you?', choices:['Yes, after a full stop','No. Wait for the green'], answer:1} }
  ],
  quiz:[
    {show:one('L:yellow'), q:'The light turns steady yellow before you reach the intersection. What do you do?', o:['Speed up to get through','Stop before the intersection','Hold your speed no matter what'], a:1, why:'Stop if you have not entered. Speeding up to beat the light is illegal.'},
    {show:{scene:'rightRed', t:1.9}, q:'Before turning right on red you must:', o:['Come to a complete stop and yield','Slow to 5 mph','Flash your headlights'], a:0, why:'Full stop before the crosswalk, then yield to people and traffic.'},
    {show:one('reg:NO|TURN|ON RED'), q:'This sign is posted at your red light. Can you turn right after stopping?', o:['Yes','No'], a:1, why:'The sign prohibits turning on red at that intersection.'},
    {show:one('L:flash-red'), q:'A flashing red light means:', o:['Yield','Stop, the same as a stop sign','The light is about to turn green'], a:1, why:'Treat it exactly like a stop sign.'},
    {show:one('L:flash-yellow'), q:'A flashing yellow light means:', o:['Stop and wait','Slow down and go with caution','Speed up'], a:1, why:'Slow down and proceed carefully.'},
    {show:one('L:arrow-red'), q:'A red arrow pointing left means:', o:['Turn left after stopping','No left turn right now','Left turns only'], a:1, why:'No turn in the direction of a red arrow.'},
    {show:one('L:arrow-green'), q:'A green arrow means:', o:['Go in the direction of the arrow when the way is clear','Yield to oncoming traffic, then turn','Stop'], a:0, why:'You may go the way the arrow points, from the proper lane, once it is clear.'},
    {show:one('H:red'), q:'Both red lights on a crosswalk beacon are solid. What do you do?', o:['Stop and stay stopped','Slow down','Go if you do not see anyone'], a:0, why:'Solid red means someone is in the crosswalk.'},
    {show:REDTURNS, q:'When is a left turn on red legal?', o:['Never','From a one-way street onto a one-way street','Any time after a full stop'], a:1, why:'Only one-way to one-way, after stopping and yielding.'}
  ]
});
})();
