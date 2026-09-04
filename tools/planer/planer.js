(function () {
  'use strict';
  const C=window.GuidesPlanner,$=id=>document.getElementById(id),KEY='guides.planner.v1';
  const ids=['destinationMode','destinationQuery','continent','dateMode','departDate','returnDate','departFrom','departTo','returnFrom','returnTo','departMonth','returnMonth','minDays','maxDays','departTimeRule','departTime','returnTimeRule','returnTime','adults','children'];
  const dayNames=[[1,'Pn'],[2,'Wt'],[3,'Śr'],[4,'Cz'],[5,'Pt'],[6,'So'],[0,'Nd']];
  let state=C.defaults(),plans=[],active=false,resultState=null,pairs=[],selected=[],destination='',origin='',timer;
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const key=p=>p.depart+'/'+p.back;
  const fmt=s=>C.date(s).toLocaleDateString('pl-PL',{day:'numeric',month:'short',year:'numeric',weekday:'short',timeZone:'UTC'});
  const short=s=>C.date(s).toLocaleDateString('pl-PL',{day:'numeric',month:'short',timeZone:'UTC'});
  const night=n=>n===1?'1 noc':n+' '+(n%10>=2&&n%10<=4&&(n%100<12||n%100>14)?'noce':'nocy');
  const adult=n=>+n===1?'1 dorosły':n+' dorosłych';
  function feedback(text){$('saveStatus').textContent=text;}
  function persist(){try{localStorage.setItem(KEY,JSON.stringify({version:1,draft:state,plans}));return true;}catch(_){feedback('Zapis niedostępny — pamięć przeglądarki może być pełna lub zablokowana.');return false;}}
  function safeState(value){
    if(!value||typeof value!=='object')throw Error('Invalid saved plan');
    const s={...C.defaults()};
    for(const k of [...ids,'directOnly','origins','destinations','departDays','returnDays'])if(Object.hasOwn(value,k))s[k]=value[k];
    for(const k of ['origins','destinations']){if(!Array.isArray(s[k]))throw Error('Invalid airports');s[k]=[...new Set(s[k].filter(c=>typeof c==='string'&&/^[A-Z]{3}$/.test(c)))].slice(0,10);}
    for(const k of ['departDays','returnDays']){if(!Array.isArray(s[k]))throw Error('Invalid weekdays');s[k]=s[k].filter(n=>Number.isInteger(n)&&n>=0&&n<=6);}
    for(const k of ids)if(typeof s[k]!=='string'&&typeof s[k]!=='number')throw Error('Invalid field');
    s.children=String(s.children).slice(0,100);s.destinationQuery=String(s.destinationQuery).slice(0,100);s.directOnly=s.directOnly===true;return s;
  }
  function restore(){try{const data=JSON.parse(localStorage.getItem(KEY)||'null');if(!data)return;if(data.version!==1)throw Error();state=safeState(data.draft);plans=(Array.isArray(data.plans)?data.plans:[]).slice(0,20).map(p=>({id:String(p.id),name:String(p.name).slice(0,70),state:safeState(p.state)}));}catch(_){feedback('Nie udało się odczytać zapisów. Formularz działa z ustawieniami domyślnymi.');}}
  function read(){for(const id of ids)state[id]=$(id).value;state.directOnly=$('directOnly').checked;for(const id of ['departDays','returnDays'])state[id]=[...$(id).querySelectorAll('input:checked')].map(i=>+i.value);}
  function timeNote(s){return ['depart','return'].filter(k=>s[k+'TimeRule']!=='any').map(k=>(k==='depart'?'wylot':'lądowanie')+' '+(s[k+'TimeRule']==='before'?'przed':'po')+' '+s[k+'Time']).join(' · ');}
  function sync(){
    $('continentPanel').hidden=state.destinationMode!=='anywhere';$('destinationPanel').hidden=state.destinationMode!=='airports';
    for(const mode of ['exact','range','month'])$(mode+'Panel').hidden=state.dateMode!==mode;
    $('durationPanel').hidden=state.dateMode==='exact';$('weekdaysPanel').hidden=state.dateMode==='exact';
    for(const k of ['depart','return'])$(k+'Time').disabled=state[k+'TimeRule']==='any';
    $('durationExample').textContent=C.durationHint(state);
    const from=state.origins.length?C.airport(state.origins[0]).city+(state.origins.length>1?' + '+(state.origins.length-1)+' lotnisk':''):'Dodaj lotnisko';
    const to=state.destinationMode==='anywhere'?$('continent').selectedOptions[0]?.textContent||'Gdziekolwiek':state.destinations.join(', ')||'Wybierz cel';
    const length=state.dateMode==='exact'?state.departDate+' → '+state.returnDate:state.minDays+'–'+state.maxDays+' nocy';
    const days=state.dateMode==='exact'?'':state.departDays.map(n=>dayNames.find(d=>d[0]===n)[1]).join('/')+' → '+state.returnDays.map(n=>dayNames.find(d=>d[0]===n)[1]).join('/');
    const dates=state.dateMode==='month'?state.departMonth+' → '+state.returnMonth:state.dateMode==='range'?state.departFrom+' → '+state.returnTo:'';
    $('searchSummary').textContent=[from,to,state.destinationQuery,length,days,dates,timeNote(state)].filter(Boolean).join(' · ');
  }
  function chips(){
    for(const [k,id] of [['origins','originChips'],['destinations','destinationChips']])$(id).innerHTML=state[k].map((c,i)=>'<button class="airport-chip" type="button" data-remove="'+k+'" data-code="'+c+'" aria-label="Usuń '+esc(C.airport(c).city)+'">'+(k==='origins'&&i===0?'★ ':'')+esc(C.airport(c).city)+' · '+c+' ×</button>').join('');
    $('nearbyAirports').innerHTML=['WRO','BER','POZ','KTW','WAW','WMI','KRK','PRG'].map(c=>'<button type="button" data-quick="'+c+'" '+(state.origins.includes(c)?'disabled':'')+'>＋ '+esc(C.airport(c).city)+'</button>').join('');
  }
  function fill(){for(const id of ids)$(id).value=state[id];$('directOnly').checked=state.directOnly;for(const id of ['departDays','returnDays'])$(id).innerHTML=dayNames.map(([n,name])=>'<label><input type="checkbox" value="'+n+'" '+(state[id].includes(n)?'checked':'')+'><span>'+name+'</span></label>').join('');chips();sync();}
  function changed(){
    read();sync();$('formError').hidden=true;clearTimeout(timer);
    // Changed filters immediately disable stale links; recompute without moving focus.
    if(active){$('planContent').hidden=true;$('resultSummary').textContent='Aktualizuję terminy…';}
    timer=setTimeout(()=>{persist();if(active)compute(false);},300);
  }
  function error(message,focus=false){$('formError').textContent=message;$('formError').hidden=false;if(focus)$('formError').focus();}
  function add(k,code){if(!code)return error('Wybierz lotnisko lub wpisz 3-literowy kod IATA.',true);if(state[k].includes(code))return error('To lotnisko jest już dodane.',true);if(state[k].length>=10)return error('Maksymalnie 10 lotnisk po każdej stronie podróży.',true);state[k].push(code);chips();$(k==='origins'?'originInput':'destinationInput').value='';changed();}
  function renderSaved(){$('savedPlans').innerHTML=plans.map(p=>'<div class="saved-row"><button class="saved-load" data-load="'+esc(p.id)+'" type="button">'+esc(p.name)+'</button><button class="saved-delete" data-delete="'+esc(p.id)+'" type="button" aria-label="Usuń plan '+esc(p.name)+'">×</button></div>').join('');}
  function candidateAirports(s){const q=C.normalize(s.destinationQuery||'');return C.destinations(s).filter(a=>s.origins.some(o=>o!==a.code)&&C.normalize(a.country+' '+a.city+' '+a.code).includes(q));}
  function compute(collapse){
    read();sync();
    try{
      const next=C.datePairs(state);
      if(!next.length)throw Error(C.noDatesReason(state));
      if(next.length>1000)throw Error('Ponad 1000 terminów. Zawęź przedział dat lub liczbę nocy, aby wygodnie porównać je na telefonie.');
      const destinations=candidateAirports(state);
      if(!destinations.length)throw Error('Brak kierunków w naszym katalogu dla tych ustawień. Zmień kraj lub lotniska. To nie jest informacja o braku lotów.');
      const oldSelected=selected.slice();
      selected=selected.filter(k=>next.some(p=>key(p)===k));
      if(next.length===1)selected=[key(next[0])];
      if(!destinations.some(a=>a.code===destination)&&destination!=='anywhere')destination='';
      if(destination==='anywhere'&&(state.destinationMode!=='anywhere'||state.continent!=='all'||state.destinationQuery))destination='';
      if(state.destinationMode==='airports'&&destinations.length===1)destination=destinations[0].code;
      origin=state.origins.includes(origin)&&origin!==destination?origin:state.origins.find(o=>o!==destination)||'';
      pairs=next;resultState=JSON.parse(JSON.stringify(state));active=true;persist();
      $('formError').hidden=true;$('planError').hidden=true;$('results').hidden=false;$('planContent').hidden=false;
      $('autoUpdateNote').hidden=false;$('prepareButton').textContent='Zwiń i zobacz plan ↓';
      $('resultsTitle').textContent=state.destinationMode==='anywhere'?'Najpierw termin. Potem kierunek.':'Najpierw kierunek. Potem termin.';
      $('resultSummary').textContent='Pasujące terminy: '+pairs.length+'. Daty zgodne z Twoimi ustawieniami — bez potwierdzenia lotów.';
      $('selectionStatus').textContent=oldSelected.some(k=>!selected.includes(k))?'Wybrane wcześniej daty nie spełniają nowych warunków. Wybierz nowe terminy.':'';
      renderCalendar();renderDirections();renderHandoff();
      if(collapse){$('filterPanel').open=false;$('filterSummary').focus();$('results').scrollIntoView({behavior:'smooth',block:'start'});}
    }catch(e){
      resultState=null;pairs=[];$('planContent').hidden=true;error(e.message,collapse);
      if(active){$('resultSummary').textContent='Sprawdź ustawienia na górze.';$('planError').textContent=e.message;$('planError').hidden=false;}
    }
  }
  function renderCalendar(){
    const openMonths=new Set([...$('monthCalendar').querySelectorAll('details[open]')].map(el=>el.dataset.month));
    $('selectedDates').innerHTML=selected.length?selected.map(k=>{const p=pairs.find(p=>key(p)===k);return '<button type="button" data-date="'+k+'" class="selected-date" aria-label="Odznacz '+esc(fmt(p.depart))+' do '+esc(fmt(p.back))+'">'+short(p.depart)+' → '+short(p.back)+' ×</button>';}).join(''):'<span class="hint">Nie wybrano jeszcze terminu.</span>';
    $('monthCalendar').innerHTML=C.calendarMonths(pairs).map(([month,list],i)=>'<details class="month-block" data-month="'+month+'" '+(openMonths.has(month)||(!openMonths.size&&i===0)?'open':'')+'><summary>'+esc(C.date(month+'-01').toLocaleDateString('pl-PL',{month:'long',year:'numeric',timeZone:'UTC'}))+'<small>Terminy: '+list.length+'</small></summary><div class="date-tiles">'+list.map(p=>'<button class="date-tile '+(selected.includes(key(p))?'selected':'')+'" type="button" data-date="'+key(p)+'" aria-pressed="'+selected.includes(key(p))+'"><strong>'+short(p.depart)+' → '+short(p.back)+'</strong><span>'+dayNames.find(d=>d[0]===C.date(p.depart).getUTCDay())[1]+' → '+dayNames.find(d=>d[0]===C.date(p.back).getUTCDay())[1]+' · '+night(p.days)+'</span></button>').join('')+'</div></details>').join('');
  }
  function renderDirections(){
    if(!resultState)return;
    const s=resultState,any=s.destinationMode==='anywhere',picker=$('directionPicker');
    (any?$('afterCalendar'):$('beforeCalendar')).append(picker);
    $('calendarSection').hidden=!any&&!destination;
    $('directionTitle').textContent=any?'Dokąd w wybranym terminie?':'Wybierz kierunek';
    $('directionHint').textContent=any?(selected.length?'Kraje i miasta z katalogu inspiracji — nie potwierdzona siatka połączeń. Wybierz jedno miasto.':'Zaznacz termin w kalendarzu, aby przejść do kierunków.'):'Wybierz miasto, a następnie jeden lub kilka terminów. Listę kierunków zmienisz w ustawieniach na górze.';
    if(any&&!selected.length){$('countryResults').innerHTML='';return;}
    const openCountries=new Set([...$('countryResults').querySelectorAll('details[open]')].map(el=>el.dataset.country));
    const groups=new Map();for(const d of candidateAirports(s)){const list=groups.get(d.country)||[];list.push(d);groups.set(d.country,list);}
    $('countryResults').innerHTML=(any&&s.continent==='all'&&!s.destinationQuery?'<button type="button" class="destination-choice world-choice '+(destination==='anywhere'?'selected':'')+'" data-destination="anywhere" aria-pressed="'+(destination==='anywhere')+'">◎ Gdziekolwiek w Skyscannerze <small>Także poza naszym katalogiem</small></button>':'')+[...groups].sort((a,b)=>a[0].localeCompare(b[0],'pl')).map(([country,ds])=>'<details class="country-group" data-country="'+esc(country)+'" '+(openCountries.has(country)||ds.some(d=>d.code===destination)||groups.size===1?'open':'')+'><summary>'+esc(country)+'<small>Lotniska w katalogu: '+ds.length+'</small></summary><div class="destination-choices">'+ds.sort((a,b)=>a.city.localeCompare(b.city,'pl')).map(d=>'<button class="destination-choice '+(destination===d.code?'selected':'')+'" type="button" data-destination="'+d.code+'" aria-pressed="'+(destination===d.code)+'">'+esc(d.city)+' <small>'+d.code+'</small></button>').join('')+'</div></details>').join('');
  }
  function renderHandoff(){
    $('handoff').hidden=!resultState||!selected.length||!destination;
    if($('handoff').hidden)return;
    const s=resultState,d=destination==='anywhere'?'Gdziekolwiek':C.airport(destination).city,os=s.origins.filter(o=>o!==destination);
    if(!os.includes(origin))origin=os[0];
    $('handoffRoute').textContent=C.airport(origin).city+' → '+d+' · powrót do '+origin;
    $('originChoices').innerHTML='<span>Otwórz wyszukiwanie z:</span>'+os.map(o=>'<button type="button" class="origin-choice '+(o===origin?'selected':'')+'" data-origin="'+o+'" aria-pressed="'+(o===origin)+'" title="'+esc(C.airport(o).city)+'">'+o+'</button>').join('');
    $('transferNote').textContent='Do potwierdzenia u dostawcy: '+(timeNote(s)||'godziny i data lądowania')+(s.directOnly?' · bez przesiadek':'')+' · bagaż i cena. Każdy przycisk otwiera jeden wariant, nie gotową rezerwację.';
    $('handoffLinks').innerHTML=selected.map(k=>{const p=pairs.find(p=>key(p)===k);return '<article class="handoff-card"><h4>'+fmt(p.depart)+' → '+fmt(p.back)+'</h4><p>'+night(p.days)+' między datami · '+adult(s.adults)+(s.children?' + dzieci: '+esc(s.children):'')+'</p><div class="route-links"><a href="'+esc(C.skyLink(origin,destination,p,s))+'" target="_blank" rel="noopener noreferrer">Sprawdź cenę w Skyscanner ↗</a><a href="'+esc(C.googleLink(origin,destination,p,s))+'" target="_blank" rel="noopener noreferrer">Google Flights ↗</a></div><details class="overnight"><summary>Lot powrotny zaczyna się dzień wcześniej?</summary><p class="hint">Link główny ustawia start powrotny na '+short(p.back)+'. Jeśli lot jest nocny, sprawdź też wcześniejszy start i potwierdź datę lądowania.</p><a href="'+esc(C.skyLink(origin,destination,p,s,true))+'" target="_blank" rel="noopener noreferrer">Sprawdź start powrotny '+short(C.addDays(p.back,-1))+' ↗</a></details></article>';}).join('');
  }
  function selectDate(k){
    if(!resultState||!pairs.some(p=>key(p)===k))return;
    if(selected.includes(k))selected=selected.filter(v=>v!==k);else{if(selected.length>=3){$('selectionStatus').textContent='Porównuj do 3 terminów naraz. Odznacz jeden, aby wybrać kolejny.';return;}selected.push(k);}
    $('selectionStatus').textContent='';renderCalendar();renderDirections();renderHandoff();
    $('monthCalendar').querySelector('[data-date="'+k+'"]')?.focus({preventScroll:true});
  }
  restore();fill();renderSaved();
  $('airports').innerHTML=C.airports.map(a=>'<option value="'+a.code+' — '+esc(a.city)+'">'+esc(a.country)+'</option>').join('');
  const form=$('plannerForm');form.addEventListener('input',changed);form.addEventListener('change',changed);
  form.addEventListener('submit',e=>{e.preventDefault();clearTimeout(timer);compute(true);});
  for(const [id,k] of [['originInput','origins'],['destinationInput','destinations']])$(id).addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();add(k,C.parseAirport($(id).value));}});
  document.addEventListener('click',e=>{
    const a=e.target.closest('[data-add]'),quick=e.target.closest('[data-quick]'),remove=e.target.closest('[data-remove]');
    if(a)add(a.dataset.add,C.parseAirport($(a.dataset.add==='origins'?'originInput':'destinationInput').value));
    if(quick)add('origins',quick.dataset.quick);
    if(remove){state[remove.dataset.remove]=state[remove.dataset.remove].filter(c=>c!==remove.dataset.code);chips();changed();}
    const date=e.target.closest('[data-date]');if(date)selectDate(date.dataset.date);
    const dest=e.target.closest('[data-destination]');if(dest&&resultState){destination=dest.dataset.destination;renderDirections();renderHandoff();$('countryResults').querySelector('[data-destination="'+destination+'"]')?.focus({preventScroll:true});}
    const start=e.target.closest('[data-origin]');if(start&&resultState){origin=start.dataset.origin;renderHandoff();$('originChoices').querySelector('[data-origin="'+origin+'"]')?.focus({preventScroll:true});}
    const load=e.target.closest('[data-load]'),del=e.target.closest('[data-delete]');
    if(load){clearTimeout(timer);state=safeState(plans.find(p=>p.id===load.dataset.load).state);fill();persist();if(active)compute(false);feedback('Wczytano plan.');}
    if(del){const p=plans.find(p=>p.id===del.dataset.delete);if(confirm('Usunąć plan „'+p.name+'”?')){plans=plans.filter(x=>x.id!==p.id);persist();renderSaved();}}
    const preset=e.target.closest('[data-preset]');
    if(preset){clearTimeout(timer);read();const now=C.today();
      if(preset.dataset.preset==='weekend'){let next=C.addDays(now,1);while(C.date(next).getUTCDay()!==5)next=C.addDays(next,1);Object.assign(state,{dateMode:'range',departFrom:next,departTo:C.addDays(next,21),returnFrom:C.addDays(next,2),returnTo:C.addDays(next,23),minDays:2,maxDays:2,departDays:[5],returnDays:[0],departTimeRule:'after',departTime:'16:00',returnTimeRule:'after',returnTime:'19:00',directOnly:true});}
      else{const d=C.date(now),m=C.iso(new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,1))).slice(0,7);Object.assign(state,{dateMode:'month',departMonth:m,returnMonth:m,minDays:7,maxDays:7,departDays:[0,1,2,3,4,5,6],returnDays:[0,1,2,3,4,5,6],departTimeRule:'any',returnTimeRule:'any'});}
      fill();persist();if(active)compute(false);
    }
  });
  $('savePlan').addEventListener('click',()=>{read();try{C.validate(state);if(plans.length>=20)throw Error('Masz już 20 zapisów. Usuń jeden, aby dodać kolejny.');const name=$('planName').value.trim()||state.origins.join(', ')+' · '+(state.dateMode==='month'?state.departMonth:state.dateMode==='range'?state.departFrom:state.departDate);plans.push({id:crypto.randomUUID(),name,state:JSON.parse(JSON.stringify(state))});if(persist())feedback('Plan zapisany na tym urządzeniu.');renderSaved();}catch(e){feedback(e.message);}});
  $('resetForm').addEventListener('click',()=>{if(confirm('Przywrócić ustawienia domyślne? Zapisane plany pozostaną.')){clearTimeout(timer);state=C.defaults();active=false;resultState=null;pairs=[];selected=[];destination='';origin='';fill();$('results').hidden=true;$('formError').hidden=true;$('autoUpdateNote').hidden=true;$('prepareButton').textContent='Pokaż pasujące terminy ↗';$('filterPanel').open=true;persist();}});
  function network(){$('networkStatus').textContent=navigator.onLine?'Planer · propozycje':'Offline · formularz działa';}
  window.addEventListener('online',network);window.addEventListener('offline',network);network();
  window.addEventListener('pagehide',()=>{clearTimeout(timer);read();persist();});
  function headerSize(){document.documentElement.style.setProperty('--planner-header',document.querySelector('.app-header').getBoundingClientRect().height+'px');}
  new ResizeObserver(headerSize).observe(document.querySelector('.app-header'));headerSize();
  if('serviceWorker' in navigator)navigator.serviceWorker.register('../../sw.js',{scope:'../../',updateViaCache:'none'}).catch(()=>feedback('Tryb offline niedostępny. Formularz nadal działa online.'));
})();
