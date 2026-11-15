/* Mile 1: Getting your license */
(function(){
var MO = window.MO;
var PATH = {fig:'steps', title:'The Arizona teen license path', items:[
  {t:'Age 15 and a half: permit', d:'Pass the written test. Drive only|with a supervising driver beside you.'},
  {t:'Hold the permit 6 months', d:'Finish driver ed, or 30 practice hours|signed off by a parent.'},
  {t:'Age 16: graduated license', d:'Pass the road test. You can drive alone,|with limits for the first 6 months.'},
  {t:'After 6 months: limits lift', d:'Tickets along the way can|stretch the limits out longer.'}
]};
var SUPER = {fig:'seats', seats:{fl:{tone:'you', label:'YOU'}, fr:{tone:'ok', label:'21 or older|licensed'}}, note:'SUPERVISING DRIVER RIDES UP FRONT', noteTone:'good'};
var HOURS = {fig:'grid', n:30, cols:6, dark:10, title:'30 hours of practice', a:'20 in daylight', b:'10 at night'};
var CURFEW = {fig:'clock', h0:0, h1:5, label:'NO DRIVING', note:'First 6 months with your license:|midnight to 5 a.m. is off limits.'};
var FRIENDS = {fig:'seats', seats:{fl:{tone:'you', label:'YOU'}, fr:{tone:'ok', label:'1 friend|under 18'}, rl:{tone:'no', label:'2nd|friend'}}, note:'ONE PASSENGER UNDER 18', noteTone:'bad'};
var STRIKES = {fig:'tiles', title:'Traffic tickets before you turn 18', bs:30, items:[
  {big:'1st', label:'Traffic Survival School,|and it goes on your record'},
  {big:'2nd', color:'#A32A22', label:'License suspended|for 3 months'},
  {big:'3rd', color:'#A32A22', label:'License suspended|for 6 months'}
]};

MO.mile({
  n:1, id:'license', title:'Getting your license', badge:'Permit Pro',
  blurb:'Permit to full license, laid out on a timeline.',
  steps:[
    { title:'The path to a license', rule:'Permit at 15 and a half. License at 16, after 6 months of practice.',
      why:'The permit is good for 12 months. You must hold it at least 6 months before you can get a graduated license.',
      show:PATH,
      try:{ask:'What is the shortest time you must hold your permit before you can get a graduated license?', choices:['30 days','6 months','12 months'], answer:1} },
    { title:'Who rides with you', rule:'On a permit, a licensed driver 21 or older rides in the front seat.',
      why:'Not the back seat, and not an 18-year-old friend. Front seat, every single drive.',
      show:SUPER,
      try:{show:{fig:'seats', seats:{fl:{tone:'you', label:'YOU'}, fr:{tone:'no', label:'Age 19|licensed'}}}, ask:'Your 19-year-old cousin has a license and sits up front. Is that legal on your permit?', choices:['Yes. She is licensed','No. The supervising driver must be 21 or older'], answer:1} },
    { title:'Practice hours', rule:'30 practice hours, 10 of them at night.',
      why:'A parent or guardian certifies the hours, unless you finish an MVD-approved driver education program instead.',
      show:HOURS,
      try:{ask:'How many of the 30 practice hours must be at night?', choices:['5','10','15'], answer:1} },
    { title:'The night rule', rule:'First 6 months: no driving from midnight to 5 a.m.',
      why:'Two exceptions. A licensed parent or guardian is in the front seat, or you are driving straight to or from a school activity, work, a religious activity or a family emergency.',
      show:CURFEW,
      try:{ask:'Two months into your license. It is 12:30 a.m. and you are driving home alone from a friend\'s house. Allowed?', choices:['Yes. I have my license','No. Midnight to 5 a.m. is off limits'], answer:1} },
    { title:'The passenger rule', rule:'First 6 months: one passenger under 18, at most.',
      why:'Brothers and sisters do not count against the limit. The limit also lifts when a licensed parent or guardian is in the front seat.',
      show:FRIENDS,
      try:{show:{fig:'seats', seats:{fl:{tone:'you', label:'YOU'}, fr:{tone:'kid', label:'Sister|age 15'}, rl:{tone:'kid', label:'Brother|age 12'}}}, ask:'You drive your younger sister and brother to school. Is that allowed in your first 6 months?', choices:['Yes. Siblings are the exception','No. Only one passenger under 18'], answer:0} },
    { title:'Tickets hit harder under 18', rule:'Under 18, a second ticket costs you your license for 3 months.',
      why:'A third one costs 6 months. Breaking the night or passenger limits can also bring fines and stretch those limits out.',
      show:STRIKES,
      try:{ask:'You are 17 and get your second moving violation. What happens?', choices:['A warning','Traffic Survival School only','A 3-month suspension'], answer:2} }
  ],
  quiz:[
    {show:PATH, q:'How old must you be to get an Arizona instruction permit?', o:['15','15 and a half','16'], a:1, why:'The graduated instruction permit starts at 15 years and 6 months.'},
    {show:SUPER, q:'Who must be in the front seat when you drive on a permit?', o:['Any licensed driver','A licensed driver 21 or older','Any adult, licensed or not'], a:1, why:'The supervising driver must be at least 21, licensed, and in the front seat.'},
    {show:HOURS, q:'How many hours of supervised practice does a parent certify before the road test?', o:['10 hours','30 hours','100 hours'], a:1, why:'30 hours, with at least 10 at night, unless you complete an approved driver education program.'},
    {show:PATH, q:'How long is an instruction permit good for?', o:['6 months','12 months','Until you turn 18'], a:1, why:'A permit is valid for 12 months.'},
    {show:CURFEW, q:'In your first 6 months with a license, which hours are off limits?', o:['10 p.m. to 6 a.m.','Midnight to 5 a.m.','Any time after dark'], a:1, why:'No driving between midnight and 5 a.m., with a few exceptions.'},
    {show:CURFEW, q:'Which solo trip after midnight is allowed in your first 6 months?', o:['Driving home from your job','A late-night food run','Dropping a friend at home'], a:0, why:'Driving straight to or from work, a school or religious activity, or a family emergency is allowed.'},
    {show:FRIENDS, q:'First 6 months, no parent in the car. How many friends under 18 may ride with you?', o:['One','Two','As many as there are seat belts'], a:0, why:'One passenger under 18. Siblings are the exception.'},
    {show:STRIKES, q:'You are 17. What does a third traffic conviction bring?', o:['Traffic Survival School','A 3-month suspension','A 6-month suspension'], a:2, why:'First: Traffic Survival School. Second: 3 months. Third: 6 months.'}
  ]
});
})();
