/* Mile 9: Parking and backing */
(function(){
var MO = window.MO, CAR = MO.CAR, YOU = MO.YOU;

/* curb-side parking: travel lane at x 222, parking strip at x 257 */
MO.scene('parallel', {
  layout:{type:'road', parkR:true}, duration:8, freeze:0.6, thumb:4.5,
  actors:[
    {kind:'car', color:CAR.gray, parked:true, path:MO.up(257), keys:[[0,320]]},
    {kind:'car', color:CAR.purple, parked:true, path:MO.up(257), keys:[[0,140]]},
    {kind:'car', color:CAR.you, path:'M222,430 L222,110', keys:[[0,0],[2.2,320],[9,320]], visible:[0,2.8], signal:[{side:'R', from:0.8, to:2.8}], tags:[YOU]},
    {kind:'car', color:CAR.you, path:'M257,215 C257,175 222,165 222,110', keys:[[0,'end'],[2.8,'end'],[5.6,0],[9,0]], visible:[2.8,6.4], signal:[{side:'R', from:2.8, to:5.6}], tags:[YOU]},
    {kind:'car', color:CAR.you, path:'M257,215 L257,196', keys:[[0,0],[6.4,0],[7.4,'end'],[9,'end']], visible:[6.4,99], tags:[YOU]}
  ],
  captions:[[0,'Signal, and pull up beside the car in front of the space.'],[2.2,'Stop with your back bumpers even, about 2 feet apart.'],[2.8,'Back up slowly. Look over your right shoulder and steer right.'],[4.4,'As your front clears their bumper, steer left.'],[5.6,'Straighten the wheels and pull forward.']]
});

var NEAR = {fig:'tiles', title:'Too close to park', lx:236, items:[
  {sign:'hydrant', big:'15', unit:'ft', label:'from a|fire hydrant'},
  {sign:'xwalk', big:'20', unit:'ft', label:'from a|crosswalk'},
  {sign:'rr', big:'50', unit:'ft', label:'from a railroad|crossing'}
]};
var NEVER = {fig:'steps', title:'Never park here', items:[
  {k:'X', tone:'bad', t:'On a sidewalk'},
  {k:'X', tone:'bad', t:'In front of a driveway'},
  {k:'X', tone:'bad', t:'In an intersection or crosswalk'},
  {k:'X', tone:'bad', t:'On a bridge or in a tunnel'},
  {k:'X', tone:'bad', t:'On a freeway', d:'Emergencies only.'},
  {k:'X', tone:'bad', t:'In a disabled space', d:'Unless the car shows the placard or plate|and that person is riding with you.'}
]};
var HILL = {fig:'hill', mode:'down'};
var BACK = {fig:'steps', title:'Backing up', items:[
  {t:'Walk around first', d:'Check behind the car before you get in.|Kids and small things hide back there.'},
  {t:'Turn and look', d:'Look straight out the rear window. Do not|rely on mirrors or the camera alone.'},
  {t:'Go slowly', d:'You see less and steer less well in reverse.'}
]};

MO.mile({
  n:9, id:'parking', title:'Parking and backing', badge:'Parking Pro',
  blurb:'Hills, curbs and parallel parking, step by step.',
  steps:[
    { title:'Keep your distance', rule:'15 feet from a hydrant, 20 from a crosswalk, 50 from the tracks.',
      why:'Fire crews need the hydrant, drivers need to see people in the crosswalk, and trains are wider than the rails.',
      show:NEAR,
      try:{ask:'How close to a fire hydrant may you park?', choices:['5 feet','No closer than 15 feet','Right beside it, if you stay in the car'], answer:1} },
    { title:'Places you never park', rule:'If your car would block people, driveways or traffic, it cannot park there.',
      why:'A disabled space is only for a car showing a valid placard or plate, and only when that person is in the car.',
      show:NEVER,
      try:{ask:'Can you block a driveway for a minute while you run inside?', choices:['Yes, with the flashers on','No. Parking in front of a driveway is illegal'], answer:1} },
    { title:'Parking on a hill', setup:'Tap each kind of hill under the picture.',
      rule:'On a hill, aim the wheels so a rolling car goes into the curb or off the road.',
      why:'Downhill with a curb: wheels toward the curb. Uphill with a curb: wheels away from it, then let the car roll back until the tire touches. Uphill with no curb: wheels right. Always set the parking brake.',
      show:HILL,
      try:{show:{fig:'hill', mode:'upcurb', hide:true}, ask:'Uphill, with a curb. Which way do you turn the front wheels?', choices:['Left, away from the curb','Right, toward the curb','Straight ahead'], answer:0, reveal:{fig:'hill', mode:'upcurb', lock:true}} },
    { title:'Parallel parking', setup:'The open space is between the two parked cars on the right.',
      rule:'Parallel parking: line up, back in, straighten out.',
      why:'Pull up even with the car in front of the space, about 2 feet away. Back in slowly while looking over your right shoulder. Steer right, then left as your front clears their bumper.',
      show:{scene:'parallel'},
      try:{ask:'Where do you stop before backing into the space?', choices:['Beside the empty space','Beside the car in front of the space, back bumpers even','Behind the space'], answer:1} },
    { title:'Backing up', rule:'Backing up: check behind first, turn your head, go slow.',
      why:'Never back up on a freeway. If you miss an exit, drive on to the next one.',
      show:BACK,
      try:{ask:'The backup camera shows nothing behind you. Is that enough?', choices:['Yes. That is what it is for','No. Turn and look out the rear window too'], answer:1} }
  ],
  quiz:[
    {show:NEAR, q:'How far from a fire hydrant must you park?', o:['At least 5 feet','At least 15 feet','At least 50 feet'], a:1, why:'Stay 15 feet from a hydrant.'},
    {show:NEAR, q:'How far from a crosswalk must you park?', o:['At least 20 feet','At least 5 feet','Right up to it'], a:0, why:'Stay 20 feet from a crosswalk.'},
    {show:NEAR, q:'How far from a railroad crossing must you park?', o:['15 feet','20 feet','50 feet'], a:2, why:'Stay 50 feet from a railroad crossing.'},
    {show:{fig:'hill', mode:'down', hide:true}, q:'Downhill with a curb. Which way do the front wheels turn?', o:['Toward the curb','Away from the curb','Straight ahead'], a:0, why:'Toward the curb, so a rolling car is stopped by it.'},
    {show:{fig:'hill', mode:'upnone', hide:true}, q:'Uphill with no curb. Which way do the front wheels turn?', o:['Right, so the car would roll off the road','Left, toward traffic','Straight ahead'], a:0, why:'Right, so the car rolls away from the center of the road.'},
    {show:{fig:'hill', mode:'upcurb', lock:true}, q:'Whatever the hill, what do you always set?', o:['The parking brake','The cruise control','The high beams'], a:0, why:'Always set the parking brake.'},
    {show:{scene:'parallel', t:2.4}, q:'About how much side room do you leave beside the car you line up with?', o:['About 2 feet','About 6 feet','None'], a:0, why:'About 2 feet, with your back bumpers even.'},
    {show:BACK, q:'What is the first step before backing up?', o:['Check behind the car before getting in','Honk twice','Turn on the wipers'], a:0, why:'Children and small objects are hard to see from the driver\'s seat.'},
    {show:NEVER, q:'When may you park in a disabled space?', o:['When you will only be a minute','When the car shows a valid placard or plate and that person is with you','Any time after 6 p.m.'], a:1, why:'Only with the placard or plate, and only when transporting that person.'}
  ]
});
})();
