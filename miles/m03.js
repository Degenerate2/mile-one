/* Mile 3: Signs */
(function(){
var MO = window.MO;
function one(kind, label){ return {fig:'signs', items:[[kind, label || '']]}; }

var SHAPES = {fig:'signs', cols:3, items:[
  ['shape:oct', 'Stop'], ['shape:tri', 'Yield'], ['shape:diamond', 'Warning'],
  ['shape:rect', 'Rules'], ['shape:pent', 'School'], ['shape:circle', 'Railroad|ahead'],
  ['shape:pennant', 'No-passing|zone']
]};
var COLORS = {fig:'signs', cols:3, items:[
  ['stop', 'Red:|stop'], ['warn:curve', 'Yellow:|warning'], ['work:ROAD|WORK', 'Orange:|work zone'],
  ['speed:45', 'White:|the law'], ['school', 'Yellow-green:|school'], ['guide:TUCSON|64 MILES', 'Green:|directions']
]};
var STOPYIELD = {fig:'signs', items:[['stop', 'Full stop.|Every time.'], ['yield', 'Slow down.|Let others go first.']]};
var WARNS = {fig:'signs', cols:3, items:[
  ['warn:curve', 'Curve ahead'], ['warn:merge', 'Traffic merges'], ['warn:cross', 'Crossroad'],
  ['warn:tee', 'Road ends: go|left or right'], ['warn:signal', 'Signal ahead'], ['pennant', 'No-passing|zone starts']
]};
var SCHOOL = {fig:'signs', items:[['school', 'School crossing'], ['speed:15', '15 mph near the|school crosswalk']]};
var RAIL = {fig:'signs', items:[['rr', 'Tracks ahead'], ['xbuck', 'The crossing|itself']]};
var WORK = {fig:'signs', items:[['work:ROAD|WORK', 'Work zone'], ['paddle:slow', 'Flagger:|do what they say'], ['reg:FINES|DOUBLE', 'Speeding fines|double']]};
var POST = one('milepost:142', 'Milepost');

MO.mile({
  n:3, id:'signs', title:'Signs', badge:'Sign Reader',
  blurb:'Shapes and colors tell you before you can read them.',
  steps:[
    { title:'Seven shapes', rule:'Shape comes first. You can read it before you can read the words.',
      why:'An octagon is always stop. A triangle is always yield. Learn the seven shapes and you know what a sign wants from a block away.',
      show:SHAPES,
      try:{show:one('shape:pent'), ask:'This five-sided shape always means what?', choices:['Railroad crossing ahead','School crossing','Yield'], answer:1, reveal:one('school', 'School crossing')} },
    { title:'Color is the second clue', rule:'Red stops you. Yellow warns you. Orange is road work. White is the law.',
      why:'Black letters on a white sign are a rule you must follow, such as a speed limit. Yellow and orange signs tell you what is coming.',
      show:COLORS,
      try:{show:one('work:FLAGGER|AHEAD'), ask:'An orange diamond. What are you coming up on?', choices:['A school','Road work','A hospital'], answer:1} },
    { title:'Stop and yield', rule:'Stop means stopped. Yield means be ready to stop.',
      why:'At a stop sign the wheels stop turning, even when nobody is around. At a yield sign you slow down and give way to cross traffic or merging traffic, stopping only if you need to.',
      show:STOPYIELD,
      try:{show:one('yield'), ask:'Yield sign, and nothing is coming. Do you have to come to a full stop?', choices:['Yes, always','No. Slow down, check, and keep going if it is clear'], answer:1} },
    { title:'Yellow diamonds', rule:'A yellow diamond tells you what the road does next.',
      why:'It is not an order. It buys you time to slow down or change lanes before the road changes.',
      show:WARNS,
      try:{show:one('warn:merge'), ask:'What is this sign telling you?', choices:['The road ahead is closed','Traffic is about to join your lane','Passing is allowed here'], answer:1, reveal:one('warn:merge', 'Traffic merges')} },
    { title:'School crossings', rule:'School crossing: 15 mph, no passing, and stop if anyone is in the crosswalk.',
      why:'When the portable signs are out in the road, 15 mph is the limit from the first sign until you are past the crossing. Passing another car there is illegal.',
      show:SCHOOL,
      try:{ask:'The portable school signs are out, and a slow car is ahead of you in the zone. Can you pass it?', choices:['Yes, if the lane is clear','No. No passing in a school crossing zone'], answer:1} },
    { title:'Railroad crossings', rule:'Flashing red lights at the tracks: stop at least 15 feet back.',
      why:'The same goes for a lowered gate, ringing bells or a flagger. Never drive around a gate. If your car stalls on the tracks, get everyone out and away.',
      show:RAIL,
      try:{ask:'The crossing lights start flashing as you roll up. Where do you stop?', choices:['Right at the rails, to see better','At least 15 feet from the nearest rail','Nowhere, if no train is in sight'], answer:1} },
    { title:'Work zones', rule:'Orange means slow down. Speeding fines double in a work zone.',
      why:'Flaggers use red flags or STOP and SLOW paddles. Their directions count the same as a sign.',
      show:WORK,
      try:{show:one('paddle:stop'), ask:'A flagger holds up this paddle, but the lane beyond looks empty. What do you do?', choices:['Drive around slowly','Stop and wait for the flagger','Honk and go'], answer:1} },
    { title:'Mileposts', rule:'A milepost tells help exactly where you are.',
      why:'They stand about a mile apart along the highway. If you break down or see a crash, give 911 the highway name and the nearest milepost number.',
      show:POST,
      try:{ask:'You are stuck on the shoulder of a desert highway. What is the fastest way to tell 911 where you are?', choices:['Describe the scenery','Give the highway and the nearest milepost','Wait for someone to spot you'], answer:1} }
  ],
  quiz:[
    {show:one('shape:oct'), q:'This shape always means:', o:['Stop','Yield','Warning'], a:0, why:'Only stop signs are octagons.'},
    {show:one('shape:tri'), q:'A triangle pointing down means:', o:['School zone','Yield','No passing'], a:1, why:'Yield: give way to cross or merging traffic.'},
    {show:one('shape:circle'), q:'A round yellow sign warns of:', o:['A roundabout','A railroad crossing ahead','A rest area'], a:1, why:'The circle is the railroad warning sign.'},
    {show:one('shape:pennant'), q:'A pennant-shaped sign marks:', o:['The start of a no-passing zone','A sharp turn','A truck route'], a:0, why:'The pennant marks where a no-passing zone begins.'},
    {show:one('speed:35'), q:'Black letters on a white sign mean:', o:['A suggestion','A rule you must follow','A work zone'], a:1, why:'White regulatory signs are the law, like this speed limit.'},
    {show:one('work:ROAD|WORK'), q:'What color are work-zone warning signs?', o:['Yellow','Orange','Green'], a:1, why:'Orange is the color for construction and maintenance.'},
    {show:one('school'), q:'With no other limit posted, how fast may you go approaching a school crosswalk?', o:['15 mph','25 mph','35 mph'], a:0, why:'15 mph, and you must stop if anyone is in the crosswalk.'},
    {show:one('xbuck'), q:'Red lights are flashing at a railroad crossing. How far back do you stop?', o:['5 feet','At least 15 feet','50 feet exactly'], a:1, why:'Stop at least 15 feet from the nearest rail.'},
    {show:one('reg:FINES|DOUBLE'), q:'What happens to speeding fines in a posted work zone?', o:['They are waived','They double','Nothing changes'], a:1, why:'Speeding fines double in a posted work zone.'},
    {show:one('yield'), q:'At a yield sign you must:', o:['Always stop completely','Slow down and give way, stopping if needed','Speed up to get in first'], a:1, why:'Yield means let the other traffic go first.'}
  ]
});
})();
