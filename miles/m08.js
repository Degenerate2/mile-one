/* Mile 8: Speed and space */
(function(){
var MO = window.MO, CAR = MO.CAR, YOU = MO.YOU;
var POST = [['sign', 'speed:45', 266, 150, 36]];

MO.scene('follow3', {
  layout:{type:'road'}, props:POST, duration:5.5, thumb:2.0,
  actors:[
    {kind:'car', color:CAR.orange, path:MO.up(222), linear:true, keys:[[0,220],[4,460]]},
    {kind:'car', color:CAR.you, path:MO.up(222), linear:true, keys:[[0,40],[6,400]], tags:[YOU]}
  ],
  captions:[[0,'Pick something fixed ahead, like that sign.'],[1.0,'Orange passes the sign. Start counting.'],[2.0,'One thousand one...'],[3.0,'One thousand two...'],[4.0,'One thousand three. You reach the sign: a 3-second gap.']]
});
MO.scene('follow1', {
  layout:{type:'road'}, props:POST, duration:5.5, freeze:2.2,
  actors:[
    {kind:'car', color:CAR.orange, path:MO.up(222), linear:true, keys:[[0,220],[4,460]]},
    {kind:'car', color:CAR.you, path:MO.up(222), linear:true, keys:[[0,160],[2.2,292],[5.5,400]], tags:[YOU]}
  ],
  captions:[[0,'Count again.'],[1.0,'Orange passes the sign.'],[2.0,'You reach it after only one second. Far too close.'],[2.6,'Ease off the gas and let the gap open up.']]
});
MO.scene('keepRight', {
  layout:{type:'road', up:2, down:2, w:38}, duration:7, freeze:1.6, thumb:5.2,
  actors:[
    {kind:'car', color:CAR.orange, path:MO.up(219), linear:true, keys:[[0,0],[2,90],[4,140],[7,460]]},
    {kind:'car', color:CAR.you, path:MO.shift(219, 257, 280, 170), linear:true, keys:[[0,90],[2,150],[4.6,269],[7,330]], signal:[{side:'R', from:1.4, to:4.6}], tags:[YOU]}
  ],
  captions:[[0,'You are going slower than the traffic around you.'],[1.4,'A faster car comes up behind.'],[2,'Signal and move to the right lane.'],[4.6,'Faster traffic passes on your left.']]
});

var LIMITS = {fig:'signs', cols:3, title:'When no speed limit is posted', items:[
  ['speed:15', 'School|crosswalk'], ['speed:25', 'Business or|residential area'], ['speed:55', 'Open highway or|city freeway'],
  ['speed:65', 'Designated|open highway'], ['speed:75', 'Rural|freeway']
]};
var ADVISE = {fig:'signs', items:[['speed:45', 'White: the|legal maximum'], ['advisory:30', 'Orange: suggested|for this curve']]};
var STOPD = {fig:'stopdist', mph:45};
var SCAN = {fig:'steps', title:'Keep your eyes moving', items:[
  {t:'Far ahead', d:'Look about one city block up the road.'},
  {t:'Side to side', d:'Check left and right before every intersection.'},
  {t:'Mirrors', d:'Glance at them often.'},
  {t:'Over your shoulder', d:'Before every lane change.'}
]};

MO.mile({
  n:8, id:'speed', title:'Speed and space', badge:'Space Maker',
  blurb:'Speed limits, following distance and stopping distance.',
  steps:[
    { title:'Limits you have to know', rule:'No sign? 25 in town. 15 at a school crosswalk.',
      why:'Out of town it is 55 on open highways and city freeways, 65 on designated open highways and 75 on rural freeways.',
      show:LIMITS,
      try:{ask:'A neighborhood street with no speed limit sign. What is the limit?', choices:['15 mph','25 mph','35 mph'], answer:1} },
    { title:'White sign, orange sign', rule:'The white sign is the law. The orange sign is advice.',
      why:'An orange speed sign gives the safe speed for a curve, a hill or another hazard just ahead. The posted limit is for good conditions. In rain, dust or heavy traffic the safe speed is lower.',
      show:ADVISE,
      try:{ask:'Heavy rain on a road posted at 65. How fast should you go?', choices:['65. That is the limit','Slower, to match the conditions','75, to get out of the rain sooner'], answer:1} },
    { title:'The 3-second rule', setup:'Watch the sign on the right side of the road.',
      rule:'Stay at least 3 seconds behind the car ahead.',
      why:'Leave more at higher speeds. On wet or slippery roads make it at least 6 seconds, and hang farther back behind big trucks so you can see past them.',
      show:{scene:'follow3'},
      try:{show:{scene:'follow1'}, ask:'You reached the sign just one second after the car ahead. What do you do?', choices:['Speed up and pass','Ease off the gas and open the gap','Tap the brakes to warn them'], answer:1} },
    { title:'Stopping distance', setup:'Drag the slider under the picture and watch the bars grow.',
      rule:'Stopping takes more road than you think, and speed makes it much worse.',
      why:'It takes about three quarters of a second to see a problem and another three quarters to get your foot onto the brake. Only then does the car start to slow.',
      show:STOPD,
      try:{ask:'You double your speed. What happens to your braking distance?', choices:['It stays about the same','It doubles','It grows to about four times as long'], answer:2, why:'Slide from 30 to 60 and compare the red bars.'} },
    { title:'Too slow is a problem too', setup:'Two lanes go your way. You are in the left one.',
      rule:'Slower than traffic? Keep right and let others pass.',
      why:'Driving well under the flow makes other drivers brake and swerve around you.',
      show:{scene:'keepRight'},
      try:{ask:'You are below the speed of traffic and a faster car is behind you. What do you do?', choices:['Hold my lane. They can go around','Move to the right lane','Brake to make them back off'], answer:1} },
    { title:'Where to look', rule:'Look a full block ahead, not at the bumper in front of you.',
      why:'Seeing trouble early is what gives you time to slow down smoothly.',
      show:SCAN,
      try:{ask:'How far up the road should you be looking in town?', choices:['Just past the hood','At the car ahead','About one city block'], answer:2} }
  ],
  quiz:[
    {show:LIMITS, q:'No sign is posted in a business district. What is the speed limit?', o:['25 mph','35 mph','45 mph'], a:0, why:'25 mph in business and residential districts.'},
    {show:LIMITS, q:'No sign is posted on a rural freeway. What is the speed limit?', o:['55 mph','65 mph','75 mph'], a:2, why:'75 mph on rural freeways.'},
    {show:{fig:'signs', items:[['advisory:30', '']]}, q:'An orange speed sign before a curve gives:', o:['The legal maximum','The recommended safe speed','The minimum speed'], a:1, why:'Orange speed signs are advice for a curve, grade or hazard.'},
    {show:{scene:'follow3', t:2.0}, q:'What is the minimum following distance in good conditions?', o:['1 second','3 seconds','10 seconds'], a:1, why:'At least 3 seconds.'},
    {show:{scene:'follow3', t:2.0}, q:'On a wet, slippery road, your following distance should be at least:', o:['2 seconds','3 seconds','6 seconds'], a:2, why:'At least 6 seconds on slick roads.'},
    {show:STOPD, q:'Which part of stopping happens before the brakes start working?', o:['Seeing the problem and reacting','Skidding','Shifting to park'], a:0, why:'About a second and a half goes by before braking even begins.'},
    {show:{scene:'keepRight', t:5.2}, q:'You are driving slower than the traffic around you. Which lane?', o:['The left lane','The right lane','The center turn lane'], a:1, why:'Keep right so faster traffic can pass.'},
    {show:SCAN, q:'Before you enter an intersection you should:', o:['Look left and right','Watch only the light','Look only straight ahead'], a:0, why:'Check both ways even when you have the green.'}
  ]
});
})();
