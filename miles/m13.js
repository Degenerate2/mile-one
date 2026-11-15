/* Mile 13: When things go wrong */
(function(){
var MO = window.MO, CAR = MO.CAR, YOU = MO.YOU;

MO.scene('blowout', {
  layout:{type:'road'}, duration:7, freeze:1.6, thumb:2.0,
  top:[['label', 300, 280, 'BANG', 'bad', 13, {from:1.5, to:2.4}]],
  actors:[{kind:'car', color:CAR.you, path:'M222,430 L222,200 C222,165 236,155 236,120 L236,90', keys:[[0,0],[1.5,150],[4.4,270],[5.6,'end'],[8,'end']],
    yaw:[[1.5,0],[1.7,7],[1.95,-6],[2.2,5],[2.5,-3],[2.8,0]], signal:[{side:'R', from:4.2, to:5.6},{side:'B', from:5.6, to:99}], tags:[YOU]}],
  captions:[[0,'Normal driving.'],[1.5,'Bang. A tire just blew.'],[1.8,'Grip the wheel. Keep the car straight. Ease off the gas.'],[3.2,'No brakes yet. Let the car slow down by itself.'],[4.4,'Nearly stopped: signal, pull off, then brake.']]
});
function skid(dir){
  var k = dir === 'right' ? -1 : 1;
  return {
    layout:{type:'road'}, duration:5, freeze:2.1, thumb:2.3,
    props:[['zone', '156,150 244,150 244,280 156,280', '#D6ECF8', .85], ['label', 124, 214, 'ICE', 'dark', 10]],
    actors:[{kind:'car', color:CAR.you, path:MO.up(222), linear:true, keys:[[0,0],[5,460]], yaw:[[1.6,0],[2.3,24*k],[3.0,-8*k],[3.5,3*k],[3.9,0]], tags:[YOU]}],
    captions:[[0,'The road ahead is icy.'],[1.6,'The back of the car slides out to the ' + dir + '.'],[2.1,'Stay off the brake. Steer ' + dir + ', the way the back is sliding.'],[3.0,'As the car straightens, steer back.'],[3.9,'Back in control.']]
  };
}
MO.scene('skidR', skid('right'));
MO.scene('skidL', skid('left'));
MO.scene('debris', {
  layout:{type:'road'}, duration:5, freeze:1.3, thumb:2.0,
  props:[['box', 222, 170]],
  actors:[
    {kind:'car', color:CAR.gray, path:MO.down(178), linear:true, keys:[[0,0],[1.0,0],[4,460]]},
    {kind:'car', color:CAR.you, path:MO.up(222), linear:true, keys:[[0,0],[1.6,150],[3.2,250],[5,'end']], tags:[YOU]}
  ],
  captions:[[0,'Something small is lying in your lane.'],[1.2,'A car is coming the other way, so swerving is not safe.'],[1.8,'Slow down, hold your lane and drive over it.'],[3.6,'A small bump beats a head-on crash.']]
});

var BRAKES = {fig:'steps', title:'If the brakes fail', items:[
  {t:'Pump the pedal fast', d:'Only without anti-lock brakes.|With ABS, do not pump.'},
  {t:'Ease on the parking brake', d:'Slowly. Be ready to let off|if the rear wheels lock.'},
  {t:'Shift to a lower gear', d:'The engine helps slow the car.'},
  {t:'Steer somewhere safe to stop'}
]};
var CRASH = {fig:'steps', title:'After a crash', items:[
  {t:'Stop and stay', d:'Leaving the scene can cost your license|for a year or more.'},
  {t:'Help anyone who is hurt', d:'Call 911 right away if someone is injured.'},
  {t:'Clear the lanes', d:'No serious injuries and the car still drives?|Move it out of traffic.'},
  {t:'Trade information', d:'License number, name and address, insurance|and policy number, plates, witnesses.'}
]};
var MORE = {fig:'steps', title:'Three more to know', items:[
  {k:'!', tone:'warn', t:'Engine overheating', d:'Pull over, engine off, hood up. Never open|the radiator cap while it is hot.'},
  {k:'!', tone:'warn', t:'Fire', d:'Pull over, ignition off, everyone out|and well away. Call 911.'},
  {k:'!', tone:'warn', t:'Headlights go out', d:'Try the dimmer and the light switch.|Then flashers on and pull off.'}
]};

MO.mile({
  n:13, id:'emergencies', title:'When things go wrong', badge:'Cool Head',
  blurb:'Blowouts, skids, brake failure and crashes.',
  steps:[
    { title:'Tire blowout', setup:'You are cruising along when a tire lets go.',
      rule:'Blowout: hold it straight, ease off the gas, brake last.',
      why:'Braking hard on a blown tire can spin the car. Let it slow down, then signal, pull off and brake just before you stop.',
      show:{scene:'blowout'},
      try:{ask:'A tire blows at highway speed. What is your first move?', choices:['Brake hard','Grip the wheel and keep the car straight','Swerve to the shoulder'], answer:1} },
    { title:'Skids', setup:'There is ice on the road ahead.',
      rule:'Skid: stay off the brake and steer the way the car is sliding.',
      why:'Turn the wheel toward the slide, then back the other way as the car straightens. You may have to do it more than once.',
      show:{scene:'skidR'},
      try:{show:{scene:'skidL'}, ask:'This time the back of the car is sliding to the left. Which way do you steer?', choices:['Left','Right','Straight, and brake hard'], answer:0} },
    { title:'Brake failure', rule:'No brakes: pump (without ABS), parking brake, lower gear, steer clear.',
      why:'Apply the parking brake slowly. Yanking it can lock the rear wheels and put you in a skid.',
      show:BRAKES,
      try:{ask:'The brake pedal sinks to the floor. Your car has no anti-lock brakes. First move?', choices:['Pump the brake pedal fast','Turn the engine off','Yank the parking brake as hard as I can'], answer:0} },
    { title:'After a crash', rule:'Crash: stop, help, clear the lanes if you can, trade information.',
      why:'Moving a drivable car out of the travel lanes after a minor crash is the law. Doing it does not make you at fault.',
      show:CRASH,
      try:{ask:'A fender-bender. Nobody is hurt and both cars still drive, but you are blocking a lane. What do you do?', choices:['Leave the cars until police arrive','Move out of the travel lanes, then trade information','Drive home and call it in later'], answer:1} },
    { title:'Debris and animals', setup:'Something is lying in your lane.',
      rule:'Do not swerve for debris or small animals.',
      why:'A sudden swerve is how drivers lose control or hit someone else. Slow down instead. If an animal is near the road but not on it yet, do not honk.',
      show:{scene:'debris'},
      try:{ask:'A cardboard box is in your lane and a car is coming the other way. What do you do?', choices:['Swerve into the other lane','Slow down and stay in my lane','Slam the brakes and stop'], answer:1} },
    { title:'Heat, fire and dark', rule:'Steam or smoke: pull over, shut it off, get everyone out.',
      why:'A hot radiator can spray scalding water when the cap comes off. With a fire, distance matters more than the car.',
      show:MORE,
      try:{ask:'The temperature gauge is in the red and steam is coming from the hood. What do you do?', choices:['Keep driving to the next town','Pull over, engine off, and leave the radiator cap alone','Pour water on the engine right away'], answer:1} }
  ],
  quiz:[
    {show:{scene:'blowout', t:2.0}, q:'After a blowout, when do you brake?', o:['Immediately','Only once the car has slowed almost to a stop','Never'], a:1, why:'Let the car slow down first, then pull off and brake.'},
    {show:{scene:'blowout', t:2.0}, q:'What do you do with the gas pedal after a blowout?', o:['Press it harder','Ease off it','Pump it'], a:1, why:'Ease off the gas and keep the car going straight.'},
    {show:{scene:'skidR', t:2.3}, q:'The back of the car is sliding to the right. Which way do you steer?', o:['Right','Left'], a:0, why:'Steer in the direction the car is sliding.'},
    {show:{scene:'skidR', t:2.3}, q:'In a skid, what do you do with the brake?', o:['Press harder','Stay off it'], a:1, why:'Do not press the brake further.'},
    {show:BRAKES, q:'Your brakes fail and the car has anti-lock brakes. Do you pump the pedal?', o:['Yes','No'], a:1, why:'Pumping is only for cars without ABS.'},
    {show:CRASH, q:'After a minor crash with no injuries, where should drivable cars go?', o:['Stay exactly where they stopped','Out of the travel lanes','Home'], a:1, why:'Clear the lanes as soon as it is safe. Never leave the scene.'},
    {show:CRASH, q:'Which of these do you exchange after a crash?', o:['Insurance company and policy number','Phone passwords','Nothing, if it was not your fault'], a:0, why:'Also license number, name and address, plates and witness details.'},
    {show:{scene:'debris', t:2.0}, q:'Why is swerving around debris risky?', o:['It wastes gas','You can lose control or hit another car','It scratches the tires'], a:1, why:'Driving over small debris is often the safer choice.'},
    {show:MORE, q:'Your engine overheats. What must you not do?', o:['Pull over','Open the radiator cap while it is hot','Turn the engine off'], a:1, why:'Wait until the engine cools before touching the cap.'}
  ]
});
})();
