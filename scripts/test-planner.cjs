const assert = require('node:assert/strict');
const {test} = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const C = require('../tools/planer/core.js');
const now='2026-09-03';
const base=()=>C.defaults(now);
test('exact round trip and same-day/past/invalid rejection',()=>{
  assert.deepEqual(C.datePairs(base(),now),[{depart:'2026-09-10',back:'2026-09-13',days:3}]);
  for(const patch of [{returnDate:'2026-09-10'},{departDate:'2026-09-01'},{departDate:'2026-02-30'}])assert.throws(()=>C.datePairs({...base(),...patch},now));
});
test('Friday to Monday with date ranges and exact duration',()=>{
  const s={...base(),dateMode:'range',departFrom:'2026-09-04',departTo:'2026-09-25',returnFrom:'2026-09-07',returnTo:'2026-09-28',departDays:[5],returnDays:[1],minDays:3,maxDays:3};
  const pairs=C.datePairs(s,now);assert.equal(pairs.length,4);assert.equal(pairs[3].back,'2026-09-28');
  assert.equal(C.datePairs({...s,returnDays:[2]},now).length,0);
});
test('month crossing year boundary and leap February',()=>{
  const s={...base(),dateMode:'month',departMonth:'2026-12',returnMonth:'2027-01',minDays:7,maxDays:7};
  assert.equal(C.datePairs(s,now).length,7);
  const leap={...s,departMonth:'2028-02',returnMonth:'2028-03',minDays:1,maxDays:1};
  assert.equal(C.datePairs(leap,now)[0].depart,'2028-02-29');
});
test('current month omits past departures',()=>{
  const s={...base(),dateMode:'month',departMonth:'2026-09',returnMonth:'2026-09',minDays:3,maxDays:3};
  assert.equal(C.datePairs(s,now)[0].depart,now);
});
test('validation protects all dimensions and bounded ranges',()=>{
  for(const patch of [{origins:[]},{origins:['<X>']},{adults:0},{adults:1.5},{children:'1, 3'},{children:'7,'},{children:'18'},{departTimeRule:'after',departTime:''},{dateMode:'range',departDays:[]},{dateMode:'range',minDays:8,maxDays:3},{dateMode:'range',minDays:1.5},{dateMode:'range',departTo:'2028-10-01'},{dateMode:'month',departMonth:'2026-13'},{destinationMode:'airports',destinations:[]}])assert.throws(()=>C.datePairs({...base(),...patch},now),JSON.stringify(patch));
});
test('no duplicates and geographic continent filtering',()=>{
  assert.equal(new Set(C.airports.map(a=>a.code)).size,C.airports.length);
  assert(C.destinations(base()).every(a=>a.continent==='EU'));
  assert.equal(C.destinations({...base(),destinationMode:'airports',destinations:['TIA','FCO','TIA']}).length,2);
  assert.equal(C.parseAirport('WRO — Wrocław'),'WRO');assert.equal(C.parseAirport('Tirana'),'TIA');assert.equal(C.parseAirport('zzz'),'ZZZ');assert.equal(C.parseAirport('<script>'),null);
});
test('links carry route, dates, party, direct and price sorting; no fake arrival filter',()=>{
  const s={...base(),adults:2,children:'8, 14',directOnly:true,returnTimeRule:'before',returnTime:'08:00'};
  const p=C.datePairs(s,now)[0];const u=new URL(C.skyLink('WRO','TIA',p,s));
  assert.equal(u.pathname,'/transport/flights/wro/tia/260910/260913/');assert.equal(u.searchParams.get('adultsv2'),'2');assert.equal(u.searchParams.get('childrenv2'),'8|14');assert.equal(u.searchParams.get('preferdirects'),'true');assert.equal(u.searchParams.get('sortby'),'cheapest');
  assert(new URL(C.skyLink('WRO','TIA',p,s,true)).pathname.endsWith('/260912/'));
  assert(C.skyLink('WRO','anywhere',p,s).includes('/anywhere/'));
  assert(new URL(C.googleLink('WRO','TIA',p,s)).searchParams.get('q').includes('returning 2026-09-13'));
});
test('planner shell assets and navigation, unchanged travel package versions',()=>{
  const root=path.resolve(__dirname,'..');const catalog=JSON.parse(fs.readFileSync(path.join(root,'offline-catalog.json')));
  for(const file of catalog.shell)assert(fs.existsSync(path.join(root,file)),file);
  for(const file of ['index.html','planer.css','core.js','planer.js'])assert(catalog.shell.includes('tools/planer/'+file));
  assert(fs.readFileSync(path.join(root,'index.html'),'utf8').includes('./tools/planer/'));
  assert(fs.readFileSync(path.join(root,'tools/kiedy-i-dokad/index.html'),'utf8').includes('../planer/'));
});
