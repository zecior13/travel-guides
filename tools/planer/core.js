(function (root) {
  'use strict';
  // Curated airport catalogue, not a route network or a live availability feed.
  const groups = [
    ['EU','Polska','WRO:Wrocław|POZ:Poznań|KTW:Katowice|WAW:Warszawa Chopin|WMI:Warszawa Modlin|KRK:Kraków|GDN:Gdańsk|RZE:Rzeszów'],
    ['EU','Niemcy','BER:Berlin Brandenburg|FRA:Frankfurt|MUC:Monachium|DUS:Düsseldorf|HAM:Hamburg'],
    ['EU','Czechy','PRG:Praga'],['EU','Austria','VIE:Wiedeń'],['EU','Albania','TIA:Tirana'],
    ['EU','Włochy','FCO:Rzym Fiumicino|CIA:Rzym Ciampino|BGY:Bergamo|MXP:Mediolan Malpensa|NAP:Neapol|BLQ:Bolonia|VCE:Wenecja|PSA:Piza|BRI:Bari|CTA:Katania|PMO:Palermo|CAG:Cagliari|PSR:Pescara'],
    ['EU','Hiszpania','MAD:Madryt|BCN:Barcelona|ALC:Alicante|AGP:Malaga|VLC:Walencja|SVQ:Sewilla|PMI:Palma de Mallorca'],
    ['AF','Hiszpania','TFS:Teneryfa Południe|LPA:Gran Canaria|ACE:Lanzarote'],
    ['EU','Portugalia','LIS:Lizbona|OPO:Porto|FAO:Faro'],['AF','Portugalia','FNC:Madera'],
    ['EU','Francja','CDG:Paryż Charles de Gaulle|ORY:Paryż Orly|BVA:Paryż Beauvais|NCE:Nicea|MRS:Marsylia'],
    ['EU','Wielka Brytania','LHR:Londyn Heathrow|STN:Londyn Stansted|LTN:Londyn Luton|LGW:Londyn Gatwick|EDI:Edynburg|MAN:Manchester|BRS:Bristol'],
    ['EU','Irlandia','DUB:Dublin'],['EU','Holandia','AMS:Amsterdam|EIN:Eindhoven'],['EU','Belgia','BRU:Bruksela|CRL:Charleroi'],
    ['EU','Grecja','ATH:Ateny|SKG:Saloniki|CHQ:Chania|HER:Heraklion|CFU:Korfu|RHO:Rodos'],
    ['EU','Chorwacja','SPU:Split|DBV:Dubrownik|ZAD:Zadar|ZAG:Zagrzeb'],['EU','Malta','MLA:Malta'],
    ['EU','Czarnogóra','TGD:Podgorica|TIV:Tivat'],['EU','Bułgaria','SOF:Sofia|BOJ:Burgas'],['EU','Rumunia','OTP:Bukareszt'],
    ['EU','Węgry','BUD:Budapeszt'],['EU','Serbia','BEG:Belgrad'],['EU','Słowenia','LJU:Lublana'],['EU','Słowacja','BTS:Bratysława'],
    ['EU','Szwecja','ARN:Sztokholm Arlanda|GOT:Göteborg'],['EU','Norwegia','OSL:Oslo|TRF:Sandefjord Torp|BGO:Bergen'],
    ['EU','Dania','CPH:Kopenhaga|BLL:Billund'],['EU','Finlandia','HEL:Helsinki'],['EU','Islandia','KEF:Keflavík'],
    ['EU','Litwa','VNO:Wilno'],['EU','Łotwa','RIX:Ryga'],['EU','Estonia','TLL:Tallinn'],['EU','Szwajcaria','ZRH:Zurych|GVA:Genewa'],
    ['EU','Turcja','IST:Stambuł IST'],['AS','Turcja','SAW:Stambuł Sabiha Gökçen|AYT:Antalya'],
    ['AS','Cypr','LCA:Larnaka|PFO:Pafos'],['AS','Gruzja','TBS:Tbilisi|KUT:Kutaisi'],
    ['AF','Maroko','RAK:Marrakesz|AGA:Agadir|CMN:Casablanca'],['AF','Egipt','CAI:Kair|HRG:Hurghada|SSH:Szarm el-Szejk'],
    ['AF','Tunezja','TUN:Tunis|DJE:Dżerba'],['AF','RPA','CPT:Kapsztad|JNB:Johannesburg'],['AF','Namibia','WDH:Windhuk'],
    ['AF','Tanzania','ZNZ:Zanzibar'],['AF','Kenia','NBO:Nairobi'],['AF','Mauritius','MRU:Mauritius'],
    ['AS','Zjednoczone Emiraty Arabskie','DXB:Dubaj|AUH:Abu Zabi'],['AS','Katar','DOH:Doha'],['AS','Japonia','HND:Tokio Haneda|NRT:Tokio Narita|KIX:Osaka'],
    ['AS','Tajlandia','BKK:Bangkok|HKT:Phuket'],['AS','Wietnam','HAN:Hanoi|SGN:Ho Chi Minh'],['AS','Indonezja','DPS:Bali'],
    ['AS','Singapur','SIN:Singapur'],['AS','Malezja','KUL:Kuala Lumpur'],['AS','Indie','DEL:Delhi|BOM:Mumbaj'],
    ['AS','Malediwy','MLE:Male'],['AS','Sri Lanka','CMB:Kolombo'],['AS','Korea Południowa','ICN:Seul Incheon'],
    ['NA','USA','JFK:Nowy Jork JFK|EWR:Newark|LAX:Los Angeles|SFO:San Francisco|MIA:Miami|ORD:Chicago'],
    ['NA','Kanada','YYZ:Toronto|YVR:Vancouver|YUL:Montreal'],['NA','Meksyk','MEX:Meksyk|CUN:Cancún'],['NA','Dominikana','PUJ:Punta Cana'],
    ['SA','Brazylia','GRU:São Paulo|GIG:Rio de Janeiro'],['SA','Argentyna','EZE:Buenos Aires'],['SA','Peru','LIM:Lima'],['SA','Chile','SCL:Santiago'],['SA','Kolumbia','BOG:Bogota'],
    ['OC','Australia','SYD:Sydney|MEL:Melbourne|PER:Perth'],['OC','Nowa Zelandia','AKL:Auckland|CHC:Christchurch'],['OC','Fidżi','NAN:Nadi']
  ];
  const airports = groups.flatMap(([continent,country,list]) => list.split('|').map(item => {const [code,city] = item.split(':');return {code,city,country,continent};}));
  const lookup = new Map(airports.map(a => [a.code,a]));
  const DAY = 86400000;
  const iso = d => d.toISOString().slice(0,10);
  const date = s => new Date(s+'T00:00:00Z');
  const addDays = (s,n) => iso(new Date(date(s).getTime()+n*DAY));
  const today = () => {const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
  const validDate = s => /^\d{4}-\d{2}-\d{2}$/.test(s||'') && !isNaN(date(s)) && iso(date(s))===s;
  const normalize = s => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ł/g,'l').toLowerCase();
  function airport(code) {return lookup.get(code) || {code,city:code,country:'Własne kody — do potwierdzenia',continent:'custom'};}
  function parseAirport(text) {
    const raw=text.trim();
    const match=raw.match(/^([a-z]{3})(?:\s|$)/i);
    if(match) return match[1].toUpperCase();
    const found=airports.filter(a=>normalize(a.city)===normalize(raw));
    return found.length===1 ? found[0].code : null;
  }
  function defaults(now=today()) {
    const start=addDays(now,7),end=addDays(start,3),month=start.slice(0,7);
    return {origins:['WRO'],destinations:[],destinationMode:'anywhere',destinationQuery:'',continent:'EU',dateMode:'exact',departDate:start,returnDate:end,departFrom:start,departTo:addDays(start,21),returnFrom:end,returnTo:addDays(end,21),departMonth:month,returnMonth:month,minDays:3,maxDays:7,departDays:[1,2,3,4,5,6,0],returnDays:[1,2,3,4,5,6,0],departTimeRule:'any',departTime:'16:00',returnTimeRule:'any',returnTime:'08:00',directOnly:false,adults:1,children:''};
  }
  function monthBounds(value) {
    if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(value||'')) throw Error('Wybierz poprawny miesiąc wylotu i powrotu.');
    const [y,m]=value.split('-').map(Number);
    return [value+'-01',iso(new Date(Date.UTC(y,m,0)))];
  }
  function validate(s,now=today()) {
    if(!Array.isArray(s.origins)||!s.origins.length||s.origins.length>10||s.origins.some(c=>! /^[A-Z]{3}$/.test(c))) throw Error('Dodaj od 1 do 10 lotnisk startowych.');
    if(!['anywhere','airports'].includes(s.destinationMode)) throw Error('Wybierz cel podróży.');
    if(!['all','EU','AF','AS','NA','SA','OC'].includes(s.continent)) throw Error('Wybierz kontynent.');
    if(!Array.isArray(s.destinations)||s.destinations.length>10||s.destinations.some(c=>! /^[A-Z]{3}$/.test(c))) throw Error('Sprawdź lotniska docelowe (maksymalnie 10).');
    if(s.destinationMode==='airports'&&!s.destinations.length) throw Error('Dodaj przynajmniej jedno lotnisko docelowe.');
    if(!Number.isInteger(+s.adults)||+s.adults<1||+s.adults>9) throw Error('Liczba dorosłych musi wynosić od 1 do 9.');
    const kids=String(s.children||'').trim();
    if(kids && (!/^\d{1,2}(\s*,\s*\d{1,2})*$/.test(kids)||kids.split(',').length>8||kids.split(',').some(a=>+a<2||+a>17))) throw Error('Wpisz wiek dzieci 2–17 lat, po przecinku (maksymalnie 8).');
    for(const kind of ['depart','return']) {
      if(!['any','before','after'].includes(s[kind+'TimeRule'])) throw Error('Sprawdź ograniczenia godzin.');
      if(s[kind+'TimeRule']!=='any'&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(s[kind+'Time']||'')) throw Error('Uzupełnij poprawną godzinę.');
    }
    if(!['exact','range','month'].includes(s.dateMode)) throw Error('Wybierz sposób ustalania dat.');
    if(s.dateMode==='exact') {
      if(!validDate(s.departDate)||!validDate(s.returnDate)||s.returnDate<=s.departDate) throw Error('Powrót musi przypadać po poprawnej dacie wylotu.');
      if(s.departDate<now) throw Error('Data wylotu nie może być w przeszłości.');
    } else {
      if(!Number.isInteger(+s.minDays)||!Number.isInteger(+s.maxDays)||+s.minDays<1||+s.maxDays>90||+s.minDays>+s.maxDays) throw Error('Długość podróży: od 1 do 90 dni; minimum nie może przekraczać maksimum.');
      for(const key of ['departDays','returnDays']) if(!Array.isArray(s[key])||!s[key].length||s[key].some(v=>!Number.isInteger(v)||v<0||v>6)) throw Error('Zaznacz przynajmniej jeden dzień tygodnia dla wylotu i powrotu.');
      let df,dt,rf,rt;
      if(s.dateMode==='month') { [df,dt]=monthBounds(s.departMonth); [rf,rt]=monthBounds(s.returnMonth); }
      else {df=s.departFrom;dt=s.departTo;rf=s.returnFrom;rt=s.returnTo;}
      if(![df,dt,rf,rt].every(validDate)||dt<df||rt<rf) throw Error('Sprawdź przedziały dat: „do” nie może być wcześniejsze niż „od”.');
      if(dt<now||rt<now) throw Error('Wybrany okres już minął.');
      if(date(dt)-date(df)>365*DAY||date(rt)-date(rf)>365*DAY) throw Error('Jeden przedział może obejmować maksymalnie 366 dni.');
    }
    return true;
  }
  function datePairs(s,now=today()) {
    validate(s,now);
    if(s.dateMode==='exact') return [{depart:s.departDate,back:s.returnDate,days:(date(s.returnDate)-date(s.departDate))/DAY}];
    let df,dt,rf,rt;
    if(s.dateMode==='month') { [df,dt]=monthBounds(s.departMonth); [rf,rt]=monthBounds(s.returnMonth); }
    else {df=s.departFrom;dt=s.departTo;rf=s.returnFrom;rt=s.returnTo;}
    if(df<now) df=now;
    const result=[];
    for(let d=df;d<=dt;d=addDays(d,1)) {
      if(!s.departDays.includes(date(d).getUTCDay())) continue;
      for(let n=+s.minDays;n<=+s.maxDays;n++) {const r=addDays(d,n);if(r>=rf&&r<=rt&&s.returnDays.includes(date(r).getUTCDay())) result.push({depart:d,back:r,days:n});}
    }
    return result;
  }
  function destinations(s) {return s.destinationMode==='airports' ? [...new Set(s.destinations)].map(airport) : airports.filter(a=>s.continent==='all'||a.continent===s.continent);}
  function skyLink(origin,destination,pair,s,previousDay=false) {
    const compact=d=>d.replaceAll('-','').slice(2);
    const back=previousDay?addDays(pair.back,-1):pair.back;
    const url=new URL(`https://www.skyscanner.net/transport/flights/${origin.toLowerCase()}/${destination.toLowerCase()}/${compact(pair.depart)}/${compact(back)}/`);
    Object.entries({adultsv2:String(s.adults),cabinclass:'economy',rtn:'1',preferdirects:String(Boolean(s.directOnly)),outboundaltsenabled:'false',inboundaltsenabled:'false',currency:'PLN',locale:'pl-PL',market:'PL',sortby:'cheapest'}).forEach(([k,v])=>url.searchParams.set(k,v));
    if(String(s.children||'').trim()) url.searchParams.set('childrenv2',s.children.split(',').map(x=>Number(x.trim())).join('|'));
    return url.href;
  }
  function googleLink(origin,destination,pair,s) {
    // Plain-language handoff, not an API or guaranteed filter transfer.
    const q=`Round trip flights from ${origin} to ${destination==='anywhere'?'anywhere':destination} departing ${pair.depart} returning ${pair.back} for ${s.adults} adults${s.directOnly?' nonstop':''}`;
    return 'https://www.google.com/travel/flights?hl=pl&q='+encodeURIComponent(q);
  }
  function durationHint(s) {
    if(s.dateMode==='exact') return '';
    if(s.departDays.length===1&&s.returnDays.length===1){
      const names=['niedziela','poniedziałek','wtorek','środa','czwartek','piątek','sobota'];
      const delta=(s.returnDays[0]-s.departDays[0]+7)%7||7;
      return `${names[s.departDays[0]]} → ${names[s.returnDays[0]]}: najkrócej ${delta} nocy między datami.`;
    }
    return 'Liczba nocy to różnica dat, nie liczba dni kalendarzowych.';
  }
  function noDatesReason(s) {
    if(s.dateMode!=='exact'){
      let fits=false;
      for(let n=+s.minDays;n<=+s.maxDays;n++)if(s.departDays.some(d=>s.returnDays.includes((d+n)%7)))fits=true;
      if(!fits)return `Wybrane dni tygodnia nie pasują do liczby nocy (${s.minDays}–${s.maxDays}). ${durationHint(s)} Zmień liczbę nocy lub dni tygodnia. To konflikt dat, nie brak lotów.`;
    }
    return 'W wybranym przedziale nie ma terminów spełniających te warunki. Sprawdź zakres wylotu, powrotu i liczbę nocy. To nie jest informacja o dostępności lotów.';
  }
  function calendarMonths(pairs){const groups=new Map();for(const p of pairs){const m=p.depart.slice(0,7);const list=groups.get(m)||[];list.push(p);groups.set(m,list);}return [...groups];}
  const api={airports,airport,parseAirport,normalize,today,date,iso,addDays,defaults,validate,datePairs,destinations,skyLink,googleLink,durationHint,noDatesReason,calendarMonths};
  root.GuidesPlanner=api;
  if(typeof module!=='undefined') module.exports=api;
})(typeof window==='undefined'?globalThis:window);
