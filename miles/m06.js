/* Mile 6: Who goes first? (right-of-way) */
(function(){
var MO = window.MO, CAR = MO.CAR, YOU = MO.YOU;
var N = MO.up(222), S = MO.down(178), E = 'M-30,222 L430,222', W = 'M430,178 L-30,178';
var ROUND_N = 'M222,430 L222,262.2 A66,66 0 0,0 222,137.8 L222,-30';

MO.scene('first', {
  layout:{type:'cross', stops:true}, duration:8.2, freeze:3.1, thumb:3.1,
  actors:[
    {kind:'car', color:CAR.orange, path:E, keys:[[0,0],[0.9,0],[2.7,160],[5.4,160],[8.2,'end']], tags:[{text:'2nd', from:2.7, to:99}]},
    {kind:'car', color:CAR.you, path:N, keys:[[0,0],[1.6,160],[3.6,160],[6.2,'end']], tags:[{text:'YOU', from:0, to:1.6, tone:'you'},{text:'YOU, 1st', from:1.6, to:99, tone:'you'}]}
  ],
  captions:[[0,'You roll up to the stop sign.'],[1.6,'You stop first.'],[2.7,'Orange stops a moment after you.'],[3.6,'You stopped first, so you go first.'],[5.4,'Then orange takes its turn.']]
});
MO.scene('firstB', {
  layout:{type:'cross', stops:true}, duration:8.2, freeze:3.1,
  actors:[
    {kind:'car', color:CAR.orange, path:E, keys:[[0,0],[1.6,160],[3.6,160],[6.2,'end']], tags:[{text:'1st', from:1.6, to:99}]},
    {kind:'car', color:CAR.you, path:N, keys:[[0,0],[0.9,0],[2.7,160],[5.4,160],[8.2,'end']], tags:[{text:'YOU', from:0, to:2.7, tone:'you'},{text:'YOU, 2nd', from:2.7, to:99, tone:'you'}]}
  ],
  captions:[[0,'Orange is already rolling up to its stop sign.'],[1.6,'Orange stops first.'],[2.7,'You stop a moment later.'],[3.6,'Orange stopped first, so orange goes first.'],[5.4,'Now it is your turn.']]
});
MO.scene('tie', {
  layout:{type:'cross', stops:true}, duration:7.8, freeze:2.5, thumb:3.1,
  actors:[
    {kind:'car', color:CAR.purple, path:W, keys:[[0,0],[1.8,160],[3.0,160],[5.6,'end']], tags:[{text:'ON YOUR RIGHT', from:2.6, to:3.6}]},
    {kind:'car', color:CAR.you, path:N, keys:[[0,0],[1.8,160],[5.2,160],[7.8,'end']], tags:[YOU]}
  ],
  captions:[[0,'You and purple pull up at the same moment.'],[1.8,'Both stopped. It is a tie.'],[3.0,'Purple is on your right, so purple goes first.'],[5.2,'Now it is your turn.']]
});
MO.scene('tieB', {
  layout:{type:'cross', stops:true}, duration:7.8, freeze:2.5,
  actors:[
    {kind:'car', color:CAR.orange, path:E, keys:[[0,0],[1.8,160],[5.2,160],[7.8,'end']], tags:[{text:'ON YOUR LEFT', from:2.6, to:3.6}]},
    {kind:'car', color:CAR.you, path:N, keys:[[0,0],[1.8,160],[3.0,160],[5.6,'end']], tags:[YOU]}
  ],
  captions:[[0,'You and orange pull up at the same moment.'],[1.8,'Both stopped. Another tie.'],[3.0,'You are the car on the right, so you go first.'],[5.2,'Then orange goes.']]
});
MO.scene('left', {
  layout:{type:'cross', crosswalks:true}, signal:'green', duration:8.6, freeze:2.1, thumb:3.3,
  actors:[
    {kind:'ped', color:'#D2477E', path:'M147,150 L147,250', linear:true, keys:[[0,0],[1.0,0],[5.6,'end']]},
    {kind:'car', color:CAR.gray, path:S, keys:[[0,0],[0.9,0],[4.2,'end']]},
    {kind:'car', color:CAR.you, path:'M222,430 L222,250 Q222,178 150,178 L-30,178', keys:[[0,0],[1.9,196],[5.9,196],[8.6,'end']], signal:[{side:'L', from:0.3, to:7.6}], tags:[YOU]}
  ],
  captions:[[0,'Green light. Your left signal is on.'],[1.9,'You ease into the intersection.'],[2.2,'The oncoming car goes first.'],[4.3,'Still waiting. Someone is in the crosswalk.'],[5.9,'All clear. Now you turn.']]
});
MO.scene('round', {
  layout:{type:'round'}, duration:6.9, freeze:2.3, thumb:2.3,
  actors:[
    {kind:'car', color:CAR.orange, path:'M178,-30 L178,137.8 A66,66 0 1,0 262.2,222 L430,222', linear:true, keys:[[0,0],[5.2,'end']]},
    {kind:'car', color:CAR.you, path:ROUND_N, keys:[[0,0],[1.7,118],[3.5,118],[6.9,'end']], tags:[YOU]}
  ],
  captions:[[0,'You come up to the roundabout.'],[1.7,'You slow down at the yield line.'],[2.4,'Orange is already in the circle, so it goes first.'],[3.5,'There is your gap. Enter to the right of the island.'],[5.0,'Keep moving. No stopping inside.']]
});
MO.scene('bus', {
  layout:{type:'road'}, duration:9.8, freeze:2.2, thumb:3.6,
  actors:[
    {kind:'kid', color:'#3E8E7E', path:'M152,214 L152,250 L250,250', linear:true, visible:[2.6,99], keys:[[0,0],[2.6,0],[6.0,'end']]},
    {kind:'car', color:CAR.gray, path:MO.down(178, -40, 440), keys:[[0,0],[1.6,0],[3.4,158],[7.6,158],[9.8,'end']]},
    {kind:'bus', path:MO.down(178, -40, 440), keys:[[0,0],[1.5,240],[7.0,240],[9.6,'end']], flash:[1.7,6.6], arm:[1.9,6.4]},
    {kind:'car', color:CAR.you, path:N, keys:[[0,0],[0.6,0],[2.9,130],[7.0,130],[9.6,'end']], tags:[YOU]}
  ],
  captions:[[0,'A school bus is coming the other way.'],[1.5,'It stops. Red lights flash and the stop arm swings out.'],[2.3,'You stop too, even though the bus is across the road.'],[3.0,'Kids may cross right in front of you.'],[6.6,'Arm folded, lights off. Now traffic can move.']]
});
MO.scene('siren', {
  layout:{type:'road'}, duration:8.6, freeze:1.5, thumb:3.5,
  actors:[
    {kind:'car', color:CAR.gray, path:'M178,-30 L178,60 C178,90 166,98 166,128 L166,160 C166,190 178,198 178,228 L178,430', keys:[[0,0],[1.4,70],[2.7,148],[5.9,148],[8.6,'end']]},
    {kind:'car', color:CAR.you, path:'M222,380 L222,300 C222,270 234,262 234,232 L234,200 C234,170 222,162 222,132 L222,-30', keys:[[0,0],[1.5,110],[2.8,176],[5.8,176],[8.6,'end']], signal:[{side:'R', from:1.5, to:2.9},{side:'L', from:5.8, to:7.2}], tags:[YOU]},
    {kind:'truck', path:'M200,470 L200,-70', linear:true, keys:[[0,20],[1.5,110],[2.8,135],[5.4,'end']]}
  ],
  captions:[[0,'Lights and a siren are coming up behind you.'],[1.6,'You signal and move to the right edge.'],[2.8,'Everyone is stopped. The fire truck goes through.'],[5.8,'It has passed. Check your mirrors and pull back in.']]
});
/* still pictures for the quiz */
MO.scene('tieLeft', {layout:{type:'cross', stops:true}, actors:[
  {kind:'car', color:CAR.orange, path:E, keys:[[0,160]]},
  {kind:'car', color:CAR.you, path:N, keys:[[0,160]], tags:[YOU]}]});
MO.scene('dark', {layout:{type:'cross', crosswalks:true}, signal:'dark', actors:[
  {kind:'car', color:CAR.gray, path:W, keys:[[0,145]]},
  {kind:'car', color:CAR.you, path:N, keys:[[0,145]], tags:[YOU]}]});
MO.scene('rbDir', {layout:{type:'round', arrows:false}, actors:[
  {kind:'car', color:CAR.you, path:ROUND_N, keys:[[0,118]], tags:[YOU]}]});
MO.scene('busDiv', {layout:{type:'road', center:'median', w:64}, actors:[
  {kind:'bus', path:MO.down(158, -40, 440), keys:[[0,240]], flash:[0,99], arm:[0,99]},
  {kind:'car', color:CAR.you, path:MO.up(242), keys:[[0,110]], tags:[YOU]}]});

MO.mile({
  n:6, id:'right-of-way', title:'Who goes first?', badge:'Right-of-Way Pro',
  blurb:'Stop signs, left turns, roundabouts, school buses and sirens.',
  steps:[
    { title:'Four stop signs', setup:'You pull up to an all-way stop. So does an orange car.',
      rule:'First to stop, first to go.',
      why:'At an all-way stop, cars take turns in the order they stopped. A full stop comes first, every time.',
      show:{scene:'first'},
      try:{show:{scene:'firstB'}, ask:'This time orange stopped first and you stopped second. Who goes first?', choices:['I go first','Orange goes first'], answer:1} },
    { title:'Same moment, two cars', setup:'This time you and a purple car reach the stop signs together.',
      rule:'Tie? The car on the right goes first.',
      why:'When two cars stop at about the same time, the driver on the left waits. Use the same rule when a traffic light is dark or there are no signs at all.',
      show:{scene:'tie'},
      try:{show:{scene:'tieB'}, ask:'Another tie. This time the other car is on your left. Who goes first?', choices:['I go first','Orange goes first'], answer:0} },
    { title:'Left turn on a green light', setup:'Your light is green and your left signal is on.',
      rule:'Turning left? Everyone in your path goes first.',
      why:'A green light lets you start the turn. Oncoming cars, bikes and people on foot still have the right-of-way.',
      show:{scene:'left'},
      try:{ask:'A car is coming toward you, and someone is stepping into the crosswalk you will turn across. When do you turn?', choices:['Right away. Green means go.','After the oncoming car, before the walker','After both of them are clear'], answer:2} },
    { title:'The roundabout', setup:'You are coming up to a roundabout. An orange car is on its way around.',
      rule:'Yield to the circle. Go right. Keep moving.',
      why:'Cars entering a roundabout yield to cars already in it, and to people walking or biking across. Enter to the right of the island and do not stop once you are in.',
      show:{scene:'round'},
      try:{ask:'Orange is already in the circle. What do you do?', choices:['Go now. I am on its right.','Wait at the line for a gap','Enter, then stop inside to let it pass'], answer:1} },
    { title:'School bus across the road', setup:'A school bus is coming toward you in the other lane.',
      rule:'Stop arm out, red lights on: both directions stop.',
      why:'Stay stopped until the arm folds in and the lights turn off. One exception: if a raised median or barrier separates you from the bus, cars going the opposite way may continue with caution. Painted lines are not a barrier.',
      show:{scene:'bus'},
      try:{ask:'The bus is on the other side of the road. Its stop arm is out and its red lights are flashing. Do you stop?', choices:['No. It is in the other lane.','Yes. Stop and wait.'], answer:1} },
    { title:'Siren behind you', setup:'You hear a siren. A fire truck with its lights on is coming up behind you.',
      rule:'Lights and siren: pull right and stop.',
      why:'Move to the right side of the road and stay stopped until the emergency vehicle has passed. Then stay well back from it.',
      show:{scene:'siren'},
      try:{ask:'The fire truck is right behind you. What do you do?', choices:['Speed up to stay ahead of it','Stop right where I am','Pull to the right edge and stop'], answer:2} }
  ],
  quiz:[
    {show:{scene:'first', t:3.1}, q:'You stopped first. Orange stopped a moment later. Who goes first?', o:['I go first','Orange goes first','Whoever waves the other one through'], a:0, why:'Cars at an all-way stop take turns in the order they stopped.'},
    {show:{scene:'tie', t:2.5}, q:'You and the purple car stopped at the same moment. Who goes first?', o:['I go first','Purple goes first'], a:1, why:'In a tie, the driver on the left waits for the driver on the right. Purple is on your right.'},
    {show:{scene:'tieLeft'}, q:'A tie at the stop signs. The other car is on your left. Who goes first?', o:['Orange goes first','I go first'], a:1, why:'You are the car on the right, so orange waits for you.'},
    {show:{scene:'dark'}, q:'The traffic light is completely dark. How do you treat this intersection?', o:['Like a green light','Like a yield sign','Like a four-way stop'], a:2, why:'A signal that is not working is treated as a four-way stop. Come to a full stop, then take turns.'},
    {show:{scene:'left', t:2.1}, q:'Green light, and you are turning left. When do you go?', o:['Right away. Green means go.','After the oncoming car, even if someone is still crossing','After the oncoming car and the person crossing are both clear'], a:2, why:'A left turn yields to oncoming cars, bikes and people on foot.'},
    {show:{scene:'rbDir'}, q:'Which way do you drive around a roundabout?', o:['To the left of the island','To the right of the island','Either way, whichever is shorter'], a:1, why:'Everyone enters to the right of the center island and circles in the same direction.'},
    {show:{scene:'round', t:2.3}, q:'Orange is already in the roundabout. What do you do?', o:['Enter now. Orange has to let me in.','Wait at the line for a gap, then enter','Enter, then stop inside to let orange by'], a:1, why:'Cars entering yield to cars already circling. Once you are in, you do not stop.'},
    {show:{scene:'bus', t:2.2}, q:'A school bus across the road has its stop arm out and red lights flashing. There is no median. What do you do?', o:['Slow down and pass carefully','Stop, then go if I do not see any kids','Stop and wait until the arm folds in and the lights turn off'], a:2, why:'With no physical barrier, traffic in both directions stops and waits.'},
    {show:{scene:'busDiv'}, q:'A raised median separates you from the stopped school bus. Do you have to stop?', o:['Yes, always','No. A physical barrier is the one exception.'], a:1, why:'On a divided road with a real barrier, cars going the opposite way may continue with caution. Paint alone is not a barrier.'},
    {show:{scene:'siren', t:1.5}, q:'Flashing lights and a siren are coming up behind you. What do you do?', o:['Speed up to stay ahead of it','Stop right where I am','Pull to the right edge and stop'], a:2, why:'Move right and stay stopped until the emergency vehicle has passed.'}
  ]
});
})();
