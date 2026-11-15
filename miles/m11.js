/* Mile 11: Sharing the road */
(function(){
var MO = window.MO, CAR = MO.CAR, YOU = MO.YOU;

MO.scene('bikePass', {
  layout:{type:'road', center:'broken'}, duration:6, freeze:0.8, thumb:2.9,
  top:[['label', 312, 214, 'AT LEAST 3 FEET', 'good', 9, {from:2.2, to:3.9}]],
  actors:[
    {kind:'bike', color:CAR.teal, path:MO.up(236), linear:true, keys:[[0,170],[7,330]]},
    {kind:'car', color:CAR.you, path:'M222,430 L222,340 C222,300 204,290 204,250 L204,170 C204,130 222,120 222,80 L222,-30', linear:true,
      keys:[[0,0],[1.2,90],[2.3,182],[3.5,262],[4.6,354],[6,'end']], signal:[{side:'L', from:0.8, to:2.3},{side:'R', from:3.5, to:4.6}], tags:[YOU]}
  ],
  captions:[[0,'A bicycle is ahead, near the right edge.'],[1.2,'The way is clear, so you move left to give it room.'],[2.3,'Pass with at least 3 feet between you.'],[3.6,'Move back only when you are well past.']]
});
MO.scene('motoLeft', {
  layout:{type:'cross', crosswalks:true}, signal:'green', duration:7.2, freeze:2.4, thumb:3.0,
  actors:[
    {kind:'moto', color:'#D9A21B', path:MO.down(178), keys:[[0,0],[1.4,0],[4.4,'end']], tags:[{text:'MOTORCYCLE', from:2.2, to:99}]},
    {kind:'car', color:CAR.you, path:'M222,430 L222,250 Q222,178 150,178 L-30,178', keys:[[0,0],[1.9,196],[4.6,196],[7.2,'end']], signal:[{side:'L', from:0.3, to:6.4}], tags:[YOU]}
  ],
  captions:[[0,'Green light. You are turning left.'],[1.9,'At a glance the road looks empty.'],[2.3,'Look again. A motorcycle is coming.'],[4.6,'Now it is clear. Turn.']]
});
MO.scene('noZone', {
  layout:{type:'fwy'}, duration:5, freeze:0.6, thumb:2.4,
  props:[
    ['zone', '164,96 196,96 196,154 164,154', '#C3342B', .45], ['zone', '164,246 196,246 196,334 164,334', '#C3342B', .45],
    ['zone', '194,150 240,150 240,300 194,300', '#C3342B', .45], ['zone', '166,150 120,150 120,300 166,300', '#C3342B', .45]
  ],
  top:[['label', 180, 122, 'NO-ZONE', 'bad', 8], ['label', 180, 292, 'NO-ZONE', 'bad', 8]],
  actors:[
    {kind:'semi', path:MO.up(180), keys:[[0,230]]},
    {kind:'car', color:CAR.you, path:MO.up(220), linear:true, keys:[[0,30],[5,400]], tags:[YOU]}
  ],
  captions:[[0,'The red areas are the truck driver\'s blind spots.'],[1.5,'Do not hang beside it. Pass and keep going.'],[3.6,'Leave plenty of room before you pull back in front.']]
});
MO.scene('wideTurn', {
  layout:{type:'cross'}, signal:'green', duration:7, freeze:1.0, thumb:2.2,
  top:[['label', 316, 318, 'Do not squeeze in here', 'bad', 9, {from:1.0, to:3.4}], ['arrow', 268, 308, 242, 288, '#1A2026', 2.5, {from:1.0, to:3.4}]],
  actors:[
    {kind:'semi', path:'M222,430 L222,330 C222,300 206,290 206,270 C206,240 230,222 270,222 L430,222', linear:true, keys:[[0,60],[1.6,150],[5.4,'end']], signal:[{side:'R', from:0, to:99}]},
    {kind:'car', color:CAR.you, path:MO.up(222), keys:[[0,0],[1.4,0],[3.0,90],[5.0,90],[7,'end']], tags:[YOU]}
  ],
  captions:[[0,'The truck ahead signals right, but swings left first.'],[1.4,'It needs that room. Stay behind it.'],[3.2,'Never slip up the right side of a turning truck.'],[5.0,'It has turned. Now you go.']]
});
MO.scene('pedPass', {
  layout:{type:'road', up:2, down:2, w:38, xwalk:180}, duration:8.2, freeze:1.6, thumb:3.4,
  actors:[
    {kind:'ped', color:'#D2477E', path:'M110,180 L290,180', linear:true, keys:[[0,20],[6,180]]},
    {kind:'car', color:CAR.gray, path:MO.up(219), keys:[[0,150],[1.2,213],[6.4,213],[8,'end']]},
    {kind:'car', color:CAR.you, path:MO.up(257), keys:[[0,0],[2.4,213],[6.4,213],[8.2,'end']], tags:[YOU]}
  ],
  captions:[[0,'Two lanes go your way. A crosswalk is ahead.'],[1.2,'The car in the next lane stops at the crosswalk.'],[1.8,'It is hiding someone from you. Stop too.'],[4.4,'There they are.'],[6.4,'Crosswalk empty. Go.']]
});
MO.scene('train', {
  layout:{type:'road'}, duration:8.2, freeze:1.2, thumb:3.6,
  props:[['tracks', 170, true]],
  top:[['label', 326, 250, 'STOP 15 FT BACK', 'dark', 9]],
  actors:[
    {kind:'train', path:'M-100,170 L500,170', linear:true, keys:[[0,0],[2.4,0],[6.2,'end']]},
    {kind:'car', color:CAR.you, path:MO.up(222), keys:[[0,0],[1.8,198],[6.4,198],[8.2,'end']], tags:[YOU]}
  ],
  captions:[[0,'Railroad crossing ahead.'],[1.0,'The red lights are flashing.'],[1.8,'Stop at least 15 feet back from the nearest rail.'],[2.6,'Here comes the train.'],[6.4,'Tracks clear. Go.']]
});
/* 2 lanes each way plus a shoulder strip: up lanes 218 and 254, shoulder 285 */
MO.scene('moveOver', {
  layout:{type:'road', up:2, down:2, w:36, parkR:true}, duration:5, freeze:0.4, thumb:2.4,
  actors:[
    {kind:'car', color:CAR.gray, parked:true, path:MO.up(285), keys:[[0,236]], signal:[{side:'B', from:0, to:99}]},
    {kind:'cop', parked:true, path:MO.up(285), keys:[[0,170]]},
    {kind:'car', color:CAR.you, path:MO.shift(254, 218, 370, 260), linear:true, keys:[[0,0],[0.8,60],[2.6,180],[5,'end']], signal:[{side:'L', from:0.4, to:2.6}], tags:[YOU]}
  ],
  captions:[[0,'Flashing lights on the shoulder ahead.'],[0.6,'Signal and move over one lane.'],[2.6,'Pass with an empty lane between you.'],[4,'If you cannot move over, slow down instead.']]
});

MO.mile({
  n:11, id:'sharing', title:'Sharing the road', badge:'Road Sharer',
  blurb:'Bikes, motorcycles, big trucks, people on foot and trains.',
  steps:[
    { title:'Bicycles', setup:'You are catching up to someone on a bike.',
      rule:'Pass a bicycle with at least 3 feet of space.',
      why:'Bike riders have the same rights and follow the same laws as drivers. Do not honk at them, and dim your headlights for them at night.',
      show:{scene:'bikePass'},
      try:{ask:'A car is coming the other way and the lane is too narrow to leave 3 feet. What do you do?', choices:['Squeeze past carefully','Wait behind the bike until there is room','Honk so the rider moves over'], answer:1} },
    { title:'Motorcycles', setup:'You are waiting to turn left on a green light.',
      rule:'Look twice for motorcycles, most of all before a left turn.',
      why:'Most car and motorcycle crashes happen when a car turns in front of the bike. They are small, so their speed and distance are hard to judge. A motorcycle gets the whole lane: never share it.',
      show:{scene:'motoLeft'},
      try:{ask:'A motorcycle is coming toward you as you wait to turn left. It looks far away. What do you do?', choices:['Turn now. It is small, so it must be far','Wait for it to pass','Turn. It will slow down for me'], answer:1} },
    { title:'Big trucks', setup:'You are passing a tractor-trailer on its right.',
      rule:'Stay out of a truck\'s No-Zones: front, back and both sides.',
      why:'Pass without lingering. Never cut in close: a truck needs about twice as far to stop as a car does.',
      show:{scene:'noZone'},
      try:{ask:'You just passed a big truck. When do you pull back in front of it?', choices:['As soon as my bumper clears it','When there is plenty of room ahead of it','It does not matter'], answer:1} },
    { title:'Trucks turning right', setup:'You are behind a truck at an intersection.',
      rule:'Truck signaling right? Stay back. Never pass it on the right.',
      why:'A long truck has to swing wide to make the corner. The gap it leaves by the curb closes as it turns.',
      show:{scene:'wideTurn'},
      try:{ask:'A truck ahead has its right signal on and swings left, opening a gap by the curb. What do you do?', choices:['Slip through the gap on the right','Stay behind until it finishes the turn','Honk'], answer:1} },
    { title:'People on foot', setup:'You are in the right lane, coming up to a crosswalk.',
      rule:'Never pass a car that is stopped at a crosswalk.',
      why:'It is stopped for someone you cannot see yet. Yield to people in every crosswalk, marked or not, even when your light is green.',
      show:{scene:'pedPass'},
      try:{ask:'The car in the lane beside you has stopped at a crosswalk. You cannot see why. What do you do?', choices:['Pass it carefully','Stop too','Honk at it'], answer:1} },
    { title:'Trains', setup:'You are coming up to a railroad crossing.',
      rule:'Flashing lights at the tracks: stop at least 15 feet back and wait.',
      why:'Never drive around a lowered gate and never stop on the tracks. Light rail in the Phoenix area is quiet: look both ways, and a red arrow means no turn across the tracks.',
      show:{scene:'train'},
      try:{ask:'The crossing lights are flashing but you do not see a train. What do you do?', choices:['Cross quickly','Stop at least 15 feet back and wait','Stop on the tracks and look both ways'], answer:1} },
    { title:'Move over', setup:'A police car has someone pulled over on the shoulder.',
      rule:'Flashing lights on the shoulder: move over one lane.',
      why:'The law covers any stopped vehicle with flashing lights: police, a tow truck, or a family with a flat tire. If moving over is not safe, slow down and pass with care.',
      show:{scene:'moveOver'},
      try:{ask:'A tow truck with flashing lights is on the shoulder, but traffic fills the next lane. What do you do?', choices:['Keep my speed. I tried','Slow down and pass with caution','Stop in my lane'], answer:1} }
  ],
  quiz:[
    {show:{scene:'bikePass', t:2.9}, q:'How much room must you leave when you pass a bicycle?', o:['1 foot','At least 3 feet','A full lane, always'], a:1, why:'At least 3 feet of clearance.'},
    {show:{scene:'bikePass', t:1.0}, q:'What should you not do as you come up behind a bicycle?', o:['Slow down','Honk at the rider','Wait for room to pass'], a:1, why:'Do not honk at bicyclists. It can startle them into a crash.'},
    {show:{scene:'motoLeft', t:2.6}, q:'When do most car and motorcycle crashes happen?', o:['When a car turns in front of the motorcycle','On freeways at night','In parking lots'], a:0, why:'Usually a car turning left across the motorcycle\'s path.'},
    {show:{scene:'motoLeft', t:2.6}, q:'How much of a lane does a motorcycle get?', o:['Half of it','The full lane','Whatever a car leaves'], a:1, why:'The rider is entitled to the full lane width.'},
    {show:{scene:'noZone', t:2.4}, q:'Where are a big truck\'s No-Zones?', o:['Only directly behind it','Front, back and both sides','Only on the left'], a:1, why:'The driver cannot see you in any of them.'},
    {show:{scene:'noZone', t:2.4}, q:'Compared with a car, how far does a truck need to stop?', o:['About the same','About twice as far','Half as far'], a:1, why:'About twice as far, so never cut in close.'},
    {show:{scene:'wideTurn', t:2.2}, q:'A truck is signaling a right turn. Which side must you never pass it on?', o:['The right','The left'], a:0, why:'The truck will swing back across that space.'},
    {show:{scene:'pedPass', t:1.6}, q:'A car beside you is stopped at a crosswalk. You should:', o:['Pass with care','Stop as well','Change lanes and go'], a:1, why:'Never pass a vehicle stopped for a pedestrian.'},
    {show:{scene:'train', t:3.6}, q:'How far from the nearest rail do you stop when the crossing lights flash?', o:['At least 15 feet','At least 5 feet','On the tracks'], a:0, why:'At least 15 feet.'},
    {show:{scene:'moveOver', t:2.4}, q:'Which stopped vehicles does the Move Over law cover?', o:['Police only','Any vehicle with flashing lights','Tow trucks only'], a:1, why:'Any vehicle pulled over with flashing lights.'}
  ]
});
})();
