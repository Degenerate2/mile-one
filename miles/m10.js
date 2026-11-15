/* Mile 10: Freeways. Lanes sit at x 140 (left), 180, 220 (right). Shoulder at 251. */
(function(){
var MO = window.MO, CAR = MO.CAR, YOU = MO.YOU;

MO.scene('merge', {
  layout:{type:'fwy', ramp:'on'}, duration:5.2, freeze:2.5, thumb:3.3,
  actors:[
    {kind:'car', color:CAR.purple, path:MO.up(180), linear:true, keys:[[0,40],[5.2,460]]},
    {kind:'car', color:CAR.orange, path:MO.up(220), linear:true, keys:[[0,100],[3.0,460]]},
    {kind:'car', color:CAR.gray, path:MO.up(220), linear:true, keys:[[0,0],[2.6,0],[6.6,460]]},
    {kind:'car', color:CAR.you, path:'M330,430 C330,345 262,335 262,270 L262,240 C262,195 220,185 220,140 L220,-30', linear:true,
      keys:[[0,0],[2.4,150],[3.0,210],[3.9,320],[4.9,'end']], signal:[{side:'L', from:1.6, to:4.2}], tags:[YOU]}
  ],
  captions:[[0,'You are on the on-ramp. Use it to build speed.'],[1.6,'Signal. Check your mirror and look over your shoulder.'],[2.6,'Freeway traffic has the right-of-way. Pick your gap.'],[3.9,'Merge in at freeway speed.']]
});
MO.scene('exitRight', {
  layout:{type:'fwy', ramp:'off'}, duration:5.2, thumb:2.4,
  top:[['label', 326, 186, 'GORE: never cross', 'bad', 9], ['arrow', 300, 176, 260, 104, '#1A2026', 2.5]],
  actors:[
    {kind:'car', color:CAR.orange, path:MO.up(180), linear:true, keys:[[0,60],[5.2,460]]},
    {kind:'car', color:CAR.you, path:'M220,430 L220,350 C220,305 262,295 262,250 L262,130 C262,65 330,55 330,-30', linear:true,
      keys:[[0,0],[1.2,80],[2.3,190],[3.4,310],[5.2,'end']], signal:[{side:'R', from:0.4, to:2.6}], tags:[YOU]}
  ],
  captions:[[0,'Your exit is coming up on the right.'],[0.4,'Signal early. You are already in the right lane.'],[1.4,'Move into the exit lane before the striped wedge.'],[3.4,'Follow the ramp off the freeway.']]
});
MO.scene('missed', {layout:{type:'fwy', ramp:'off'},
  top:[['label', 330, 150, 'YOUR EXIT', 'dark', 9]],
  actors:[{kind:'car', color:CAR.you, path:MO.up(180), keys:[[0,350]], tags:[YOU]}]});
MO.scene('fwyLanes', {
  layout:{type:'fwy'}, duration:6, freeze:0.4, thumb:2.0,
  top:[['label', 140, 34, 'PASSING', 'dark', 9], ['label', 226, 378, 'GETTING ON AND OFF', 'dark', 9]],
  actors:[
    {kind:'car', color:CAR.orange, path:MO.up(140), linear:true, keys:[[0,0],[3.6,460]]},
    {kind:'car', color:CAR.purple, path:MO.up(140), linear:true, keys:[[0,0],[3,0],[6,400]]},
    {kind:'car', color:CAR.gray, path:MO.up(180), linear:true, keys:[[0,120],[6,400]]},
    {kind:'car', color:CAR.you, path:MO.up(220), linear:true, keys:[[0,60],[6,330]], tags:[YOU]}
  ],
  captions:[[0,'Right lane: getting on and off the freeway.'],[3,'Left lane: passing. Then move back to the right.']]
});
MO.scene('hov', {layout:{type:'fwy', hov:true},
  top:[['label', 140, 34, 'HOV LANE', 'dark', 9]],
  actors:[
    {kind:'car', color:CAR.green, path:MO.up(140), keys:[[0,280]], tags:[{text:'2 PEOPLE', from:0, to:99, tone:'good'}]},
    {kind:'car', color:CAR.you, path:MO.up(180), keys:[[0,170]], tags:[YOU]}
  ]});
MO.scene('breakdown', {
  layout:{type:'fwy'}, duration:6, freeze:0.5, thumb:4.2,
  actors:[
    {kind:'car', color:CAR.gray, path:MO.up(180), linear:true, keys:[[0,100],[6,460]]},
    {kind:'car', color:CAR.orange, path:MO.up(220), linear:true, keys:[[0,0],[2.6,0],[5,460]]},
    {kind:'car', color:CAR.you, path:'M220,430 L220,340 C220,295 251,285 251,240 L251,200', keys:[[0,0],[1.2,90],[2.4,195],[3.4,235],[6,235]], signal:[{side:'R', from:0.6, to:2.2},{side:'B', from:2.2, to:99}], tags:[YOU]}
  ],
  captions:[[0,'The car is losing power.'],[0.6,'Signal and get all the way onto the right shoulder.'],[3.4,'Flashers on. If you need help, raise the hood.'],[4.6,'Stay with the car. Do not walk along the freeway.']]
});
MO.scene('wrongWay', {
  layout:{type:'fwy'}, duration:4.6, freeze:0.4, thumb:1.9,
  actors:[
    {kind:'car', color:CAR.red, path:MO.down(140), linear:true, keys:[[0,0],[1.0,0],[3.4,460]], tags:[{text:'WRONG WAY', from:1.0, to:99, tone:'bad'}]},
    {kind:'car', color:CAR.you, path:'M140,430 L140,340 C140,280 220,270 220,210 L220,-30', linear:true, keys:[[0,0],[1.0,90],[2.2,250],[4.6,'end']], tags:[YOU]}
  ],
  captions:[[0,'You are in the left lane.'],[1.0,'A car is coming straight at you in your lane.'],[1.2,'Off the gas. Steer right, away from it.'],[3.4,'Get somewhere safe and call 911.']]
});

MO.mile({
  n:10, id:'freeways', title:'Freeways', badge:'Freeway Ready',
  blurb:'Merging, exits, the carpool lane and trouble at speed.',
  steps:[
    { title:'Merging', setup:'You are coming up the on-ramp on the right.',
      rule:'Match freeway speed on the ramp, then merge into a gap.',
      why:'Traffic already on the freeway has the right-of-way. Do not stop on the ramp unless you truly have to.',
      show:{scene:'merge'},
      try:{ask:'You are on the on-ramp. Who has the right-of-way?', choices:['I do. They have to let me in','Traffic already on the freeway','Whoever is going faster'], answer:1} },
    { title:'Exits and the gore', rule:'Exit from the right lane. Never cut across the gore.',
      why:'The gore is the striped wedge between the freeway and the ramp. Driving over it costs points. Miss your exit? Go on to the next one. Never stop, back up or cross the median.',
      show:{scene:'exitRight'},
      try:{show:{scene:'missed'}, ask:'You just passed your exit. What now?', choices:['Stop and back up along the shoulder','Cut across the striped gore','Keep going to the next exit'], answer:2} },
    { title:'Which lane?', rule:'Right lane to get on and off. Left lane to pass.',
      why:'Once you have passed, move back to the right.',
      show:{scene:'fwyLanes'},
      try:{ask:'You are cruising in the left lane, not passing anyone, and a faster car comes up behind. What do you do?', choices:['Stay. I am doing the speed limit','Move right when it is safe','Brake'], answer:1} },
    { title:'The diamond lane', rule:'Diamond lane: 2 or more people at the posted times.',
      why:'The times are on the signs, Monday through Friday. Motorcycles and buses may use it too. Driving in it alone at those times brings a big fine.',
      show:{scene:'hov'},
      try:{show:{fig:'seats', seats:{fl:{tone:'you', label:'YOU'}}, note:'DRIVING ALONE'}, ask:'You are alone in the car at a posted HOV time. Can you use the diamond lane?', choices:['Yes, if traffic is bad','No. It takes at least 2 people'], answer:1} },
    { title:'Car trouble', setup:'You are in the right lane and the engine starts cutting out.',
      rule:'Car trouble: all the way onto the right shoulder, flashers on.',
      why:'Raise the hood if you need help. Stay with the car and do not walk along the freeway.',
      show:{scene:'breakdown'},
      try:{ask:'The engine starts cutting out on the freeway. Where do you go?', choices:['Stop in my lane with the flashers on','The left shoulder, by the median','All the way onto the right shoulder'], answer:2} },
    { title:'Wrong-way driver', setup:'It is late and you are in the left lane.',
      rule:'Wrong-way driver: off the gas, steer right, then call 911.',
      why:'Wrong-way drivers are most often in the left lane or the HOV lane. If an overhead sign warns of one ahead, head for the nearest exit.',
      show:{scene:'wrongWay'},
      try:{ask:'An overhead sign reads WRONG-WAY DRIVER AHEAD. What do you do?', choices:['Move to the left lane and speed up','Head for the nearest exit','Stop in my lane'], answer:1} }
  ],
  quiz:[
    {show:{scene:'merge', t:2.5}, q:'On an on-ramp, who has the right-of-way?', o:['You do','Traffic already on the freeway','Whoever is faster'], a:1, why:'You yield to traffic already on the freeway.'},
    {show:{scene:'merge', t:2.5}, q:'What is the on-ramp for?', o:['Waiting at a stop for a gap','Building up to freeway speed','Passing slower cars'], a:1, why:'Match the speed of traffic before you merge.'},
    {show:{scene:'missed'}, q:'You missed your exit. What is the right move?', o:['Back up on the shoulder','Cross the gore','Take the next exit'], a:2, why:'Never back up, U-turn or cross the gore or median.'},
    {show:{scene:'exitRight', t:2.4}, q:'What is the gore area?', o:['The striped wedge between the freeway and a ramp','The left shoulder','A rest stop'], a:0, why:'Never drive over or into it.'},
    {show:{scene:'fwyLanes', t:2.0}, q:'The left lane of a freeway is for:', o:['Passing','Slow traffic','Exiting'], a:0, why:'Pass on the left, then move back right.'},
    {show:{scene:'hov'}, q:'How many people must be in the car to use the HOV lane at posted times?', o:['1','At least 2','At least 4'], a:1, why:'Two or more, counting the driver.'},
    {show:{scene:'breakdown', t:4.2}, q:'You are broken down on the freeway shoulder. What should you not do?', o:['Turn on the flashers','Raise the hood','Walk along the freeway'], a:2, why:'Stay with the car. Walking on a freeway is dangerous.'},
    {show:{scene:'wrongWay', t:1.9}, q:'A car is coming at you in your freeway lane. What do you do?', o:['Flash your lights and hold your lane','Ease off the gas and steer right, away from it','Speed up to get past quickly'], a:1, why:'Slow, steer away, get somewhere safe, then call 911.'}
  ]
});
})();
