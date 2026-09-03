(function () {
  'use strict';
  const C=window.GuidesPlanner,$=id=>document.getElementById(id),KEY='guides.planner.v1';
  const ids=['destinationMode','continent','dateMode','departDate','returnDate','departFrom','departTo','returnFrom','returnTo','departMonth','returnMonth','minDays','maxDays','departTimeRule','departTime','returnTimeRule','returnTime','adults','children'];
  const dayNames=[[1,'Pn'],[2,'Wt'],[3,'Śr'],[4,'Cz'],[5,'Pt'],[6,'So'],[0,'Nd']];
  let state=C.defaults(), plans=[], resultState=null, pairs=[], limits={}, draftTimer;
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt=s=>C.date(s).toLocaleDateString('pl-PL',{day:'numeric',month:'short',year:'numeric',weekday:'short',timeZone:'UTC'});
  function feedback(text){$('saveStatus').textContent=text;}
  function persist() {try{localStorage.setItem(KEY,JSON.stringify({version:1,draft:state,plans}));return true;}catch(_){feedback('Nie udało się zapisać. Pamięć przeglądarki może być pełna lub zablokowana.');return false;}}
  function safeState(value) {
    if(!value||typeof value!=='object') throw Error('Invalid saved plan');
    const s={...C.defaults()};
    for(const key of [...ids,'directOnly','origins','destinations','departDays','returnDays']) if(Object.hasOwn(value,key)) s[key]=value[key];
    // Drafts may intentionally contain incomplete dates, but never arbitrary markup or unbounded arrays.
    for(const key of ['origins','destinations']) {if(!Array.isArray(s[key])) throw Error('Invalid airports');s[key]=[...new Set(s[key].filter(c=>typeof c==='string'&&/^[A-Z]{3}$/.test(c)))].slice(0,10);}
    for(const key of ['departDays','returnDays']) {if(!Array.isArray(s[key])) throw Error('Invalid days');s[key]=s[key].filter(v=>Number.isInteger(v)&&v>=0&&v<=6);}
    for(const key of ids) if(typeof s[key]!=='string'&&typeof s[key]!=='number') throw Error('Invalid field');
    s.children=String(s.children).slice(0,100);s.directOnly=s.directOnly===true;
    return s;
  }
  function restore() {try{const data=JSON.parse(localStorage.getItem(KEY)||'null');if(!data)return;if(data.version!==1)throw Error();state=safeState(data.draft);plans=(Array.isArray(data.plans)?data.plans:[]).slice(0,20).map(p=>({id:String(p.id),name:String(p.name).slice(0,70),state:safeState(p.state)}));}catch(_){feedback('Nie udało się odczytać zapisów. Formularz działa z ustawieniami domyślnymi.');}}
  function read() {for(const id of ids)state[id]=$(id).value;state.directOnly=$('directOnly').checked;for(const id of ['departDays','returnDays'])state[id]=[...$(id).querySelectorAll('input:checked')].map(i=>+i.value);}
  function syncPanels() {
    $('continentPanel').hidden=state.destinationMode!=='anywhere';$('destinationPanel').hidden=state.destinationMode!=='airports';
    for(const mode of ['exact','range','month']) $(mode+'Panel').hidden=state.dateMode!==mode;
    $('durationPanel').hidden=state.dateMode==='exact';$('weekdaysPanel').hidden=state.dateMode==='exact';
    for(const k of ['depart','return']) $(k+'Time').disabled=state[k+'TimeRule']==='any';
  }
  function chips() {
    for(const [key,id] of [['origins','originChips'],['destinations','destinationChips']]) $(id).innerHTML=state[key].map((code,i)=>`<button class="airport-chip" type="button" data-remove="${key}" data-code="${code}" aria-label="Usuń ${esc(C.airport(code).city)}">${key==='origins'&&i===0?'★ ':''}${esc(C.airport(code).city)} · ${code} ×</button>`).join('');
    $('nearbyAirports').innerHTML=['WRO','BER','POZ','KTW','WAW','WMI','KRK'].map(code=>`<button type="button" data-quick="${code}" ${state.origins.includes(code)?'disabled':''}>＋ ${esc(C.airport(code).city)}</button>`).join('');
  }
  function fill() {
    for(const id of ids) $(id).value=state[id];$('directOnly').checked=state.directOnly;
    for(const id of ['departDays','returnDays']) $(id).innerHTML=dayNames.map(([n,name])=>`<label><input type="checkbox" value="${n}" ${state[id].includes(n)?'checked':''}><span>${name}</span></label>`).join('');
    chips();syncPanels();
  }
  function changed() {read();syncPanels();$('formError').hidden=true;if(resultState)$('dirtyNotice').hidden=false;clearTimeout(draftTimer);draftTimer=setTimeout(persist,250);}
  function error(message) {$('formError').textContent=message;$('formError').hidden=false;$('formError').focus();}
  function add(key,code) {
    if(!code){error('Wybierz lotnisko z podpowiedzi lub wpisz 3-literowy kod IATA.');return;}
    if(state[key].includes(code)){error('To lotnisko jest już dodane.');return;}
    if(state[key].length>=10){error('Możesz dodać maksymalnie 10 lotnisk na każdą stronę podróży.');return;}
    state[key].push(code);chips();changed();
    $(key==='origins'?'originInput':'destinationInput').value='';
  }
  function renderSaved() {$('savedPlans').innerHTML=plans.map(p=>`<div class="saved-row"><button class="saved-load" data-load="${esc(p.id)}" type="button">${esc(p.name)}</button><button class="saved-delete" data-delete="${esc(p.id)}" type="button" aria-label="Usuń plan ${esc(p.name)}">×</button></div>`).join('');}
  function timeNote(s) {const words={before:'przed',after:'po'};return ['depart','return'].filter(k=>s[k+'TimeRule']!=='any').map(k=>`${k==='depart'?'Wylot':'Lądowanie po powrocie'} ${words[s[k+'TimeRule']]} ${s[k+'Time']}`).join(' · ');}
  function links(o,d,p,s) {return `<div class="route-links"><a href="${esc(C.skyLink(o,d,p,s))}" target="_blank" rel="noopener noreferrer">Sprawdź w Skyscanner ↗</a><a href="${esc(C.googleLink(o,d,p,s))}" target="_blank" rel="noopener noreferrer">Google Flights ↗</a></div>`;}
  function prepare(event) {
    event?.preventDefault();read();
    try {
      const nextPairs=C.datePairs(state);
      if(!nextPairs.length)throw Error('Nie ma par dat spełniających warunki. Poszerz okres, długość podróży lub wybór dni tygodnia.');
      if(nextPairs.length>1000)throw Error('Ponad 1000 par dat. Zawęź przedział, dni tygodnia lub długość podróży, aby lista była wygodna na telefonie.');
      if(!C.destinations(state).some(d=>state.origins.some(o=>o!==d.code)))throw Error('Lotnisko startowe i docelowe nie mogą być takie same.');
      pairs=nextPairs;resultState=JSON.parse(JSON.stringify(state));limits={};persist();$('formError').hidden=true;$('dirtyNotice').hidden=true;
      $('resultOrigin').innerHTML='<option value="all">Wszystkie startowe</option>'+state.origins.map(c=>`<option value="${c}">${esc(C.airport(c).city)} · ${c}</option>`).join('');
      $('resultDates').innerHTML='<option value="all">Wszystkie pary dat</option>'+pairs.map((p,i)=>`<option value="${i}">${fmt(p.depart)} → ${fmt(p.back)} · ${p.days} dni</option>`).join('');
      $('resultSearch').value='';
      $('transferNote').innerHTML=`<strong>Co przekazujemy?</strong> Skyscanner: lotniska, daty startu obu lotów, pasażerów, prośbę o loty bezpośrednie i sortowanie cenowe. Potwierdź je po otwarciu. Google Flights: zapytanie tekstowe; ustawienia mogą wymagać ręcznego uzupełnienia.<br><strong>Do sprawdzenia ręcznie:</strong> ${esc(timeNote(state)||'godziny i dzień lądowania po powrocie')}, bagaż oraz końcowa cena. Daty w linku nie gwarantują daty lądowania. To nie jest rezerwacja.`;
      $('results').hidden=false;renderResults();$('resultsTitle').focus();$('results').scrollIntoView({behavior:'smooth',block:'start'});
    } catch(e){error(e.message);}
  }
  function renderResults() {
    if(!resultState)return;
    const s=resultState,query=C.normalize($('resultSearch').value),origins=$('resultOrigin').value==='all'?s.origins:[$('resultOrigin').value];
    const selectedPairs=$('resultDates').value==='all'?pairs:[pairs[+$('resultDates').value]];
    const dest=C.destinations(s).filter(a=>C.normalize(`${a.city} ${a.country} ${a.code}`).includes(query));
    const groups=new Map();
    for(const d of dest) {if(origins.every(o=>o===d.code))continue;const entries=groups.get(d.country)||[];entries.push(d);groups.set(d.country,entries);}
    const routeCount=dest.reduce((n,d)=>n+origins.filter(o=>o!==d.code).length,0)*selectedPairs.length;
    $('resultSummary').textContent=`Kraje: ${groups.size} · Pary dat: ${selectedPairs.length} · Kombinacje: ${routeCount.toLocaleString('pl-PL')}. Do samodzielnego sprawdzenia, bez pobierania cen ani automatycznego otwierania kart.`;
    $('globalLinks').innerHTML='';
    if(s.destinationMode==='anywhere'&&s.continent==='all'&&!query) {
      const p=selectedPairs[0];
      $('globalLinks').innerHTML=`<div class="global-card"><h3>Cały świat poza naszym katalogiem</h3><p class="hint">„Gdziekolwiek” dla ${fmt(p.depart)} → ${fmt(p.back)}${selectedPairs.length>1?' — pierwsza para dat; wybierz inną w filtrze powyżej':''}. Poniższe kraje są tylko inspiracjami. Dostawca może wymagać ponownego wyboru dat.</p>${origins.map(o=>`<p class="route-meta">Z ${esc(C.airport(o).city)} (${o})</p>${links(o,'anywhere',p,s)}`).join('')}</div>`;
    }
    $('countryResults').innerHTML=[...groups].sort((a,b)=>a[0].localeCompare(b[0],'pl')).map(([country,ds],index)=>{
      const total=ds.reduce((n,d)=>n+origins.filter(o=>o!==d.code).length,0)*selectedPairs.length;
      return `<details class="country-group" data-country="${esc(country)}" ${groups.size===1?'open':''}><summary>${esc(country)}<small>Lotniska: ${ds.length} · Kombinacje: ${total.toLocaleString('pl-PL')} · cena u dostawcy</small></summary><div class="country-body" id="country-${index}"></div></details>`;
    }).join('') || '<p class="empty-results">Brak kierunków dla tych filtrów. Zmień kraj, lotnisko lub kontynent.</p>';
    function renderGroup(el) {
      const country=el.dataset.country,ds=groups.get(country).slice().sort((a,b)=>a.city.localeCompare(b.city,'pl')),limit=limits[country]||12;
      const total=ds.reduce((n,d)=>n+origins.filter(o=>o!==d.code).length,0)*selectedPairs.length;
      const cards=[];
      outer:for(const p of selectedPairs)for(const d of ds)for(const o of origins){if(o===d.code)continue;
        cards.push(`<article class="route-card"><h3>${esc(C.airport(o).city)} → ${esc(d.city)}</h3><p class="route-meta">${o} ⇄ ${d.code} · powrót do ${o}</p><p class="route-meta">${fmt(p.depart)} → ${fmt(p.back)} · ${p.days} dni między datami</p>${links(o,d.code,p,s)}<details><summary class="hint">Powrót nocą? Alternatywna data startu</summary><p class="hint">Aby wylądować ${fmt(p.back)}, lot może zaczynać się dzień wcześniej. Sprawdź godzinę i datę lądowania.</p><div class="route-links"><a href="${esc(C.skyLink(o,d.code,p,s,true))}" target="_blank" rel="noopener noreferrer">Start powrotny ${fmt(C.addDays(p.back,-1))} ↗</a></div></details></article>`);
        if(cards.length>=limit)break outer;
      }
      el.querySelector('.country-body').innerHTML=cards.join('')+(total>limit?`<button type="button" class="more-routes">Pokaż kolejne 12 · ${cards.length} z ${total}</button>`:'');
      el.querySelector('.more-routes')?.addEventListener('click',()=>{limits[country]=limit+12;renderGroup(el);});
    }
    $('countryResults').querySelectorAll('.country-group').forEach(el=>{el.addEventListener('toggle',()=>{if(el.open&&!el.querySelector('.country-body').children.length)renderGroup(el);});if(el.open)renderGroup(el);});
  }
  restore();fill();renderSaved();
  $('airports').innerHTML=C.airports.map(a=>`<option value="${a.code} — ${esc(a.city)}">${esc(a.country)}</option>`).join('');
  $('plannerForm').addEventListener('input',changed);$('plannerForm').addEventListener('change',changed);$('plannerForm').addEventListener('submit',prepare);
  for(const [input,key] of [['originInput','origins'],['destinationInput','destinations']]) $(input).addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();add(key,C.parseAirport($(input).value));}});
  document.addEventListener('click',e=>{
    const addButton=e.target.closest('[data-add]'),quick=e.target.closest('[data-quick]'),remove=e.target.closest('[data-remove]');
    if(addButton){const key=addButton.dataset.add;add(key,C.parseAirport($(key==='origins'?'originInput':'destinationInput').value));}
    if(quick)add('origins',quick.dataset.quick);
    if(remove){state[remove.dataset.remove]=state[remove.dataset.remove].filter(c=>c!==remove.dataset.code);chips();changed();}
    const load=e.target.closest('[data-load]'),del=e.target.closest('[data-delete]');
    if(load){read();state=safeState(plans.find(p=>p.id===load.dataset.load).state);fill();persist();if(resultState)$('dirtyNotice').hidden=false;feedback('Wczytano ustawienia. Przygotuj wyszukiwania, aby przeliczyć terminy.');$('plannerForm').scrollIntoView({behavior:'smooth'});}
    if(del){const p=plans.find(p=>p.id===del.dataset.delete);if(confirm(`Usunąć plan „${p.name}”?`)){plans=plans.filter(x=>x.id!==p.id);persist();renderSaved();}}
    const preset=e.target.closest('[data-preset]');
    if(preset){read();const now=C.today();if(preset.dataset.preset==='weekend'){
      let next=C.addDays(now,1);while(C.date(next).getUTCDay()!==5)next=C.addDays(next,1);
      Object.assign(state,{dateMode:'range',departFrom:next,departTo:C.addDays(next,21),returnFrom:C.addDays(next,3),returnTo:C.addDays(next,24),minDays:3,maxDays:3,departDays:[5],returnDays:[1],departTimeRule:'after',departTime:'16:00',returnTimeRule:'before',returnTime:'08:00',directOnly:true});
    }else{const d=C.date(now);const m=C.iso(new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,1))).slice(0,7);Object.assign(state,{dateMode:'month',departMonth:m,returnMonth:m,minDays:7,maxDays:7,departDays:[0,1,2,3,4,5,6],returnDays:[0,1,2,3,4,5,6],departTimeRule:'any',returnTimeRule:'any'});}
    fill();persist();if(resultState)$('dirtyNotice').hidden=false;}
  });
  $('savePlan').addEventListener('click',()=>{read();try{C.validate(state);if(plans.length>=20)throw Error('Masz już 20 zapisów. Usuń jeden, aby zapisać kolejny.');const name=$('planName').value.trim()||`${state.origins.join(', ')} · ${state.dateMode==='month'?state.departMonth:state.dateMode==='range'?state.departFrom:state.departDate}`;plans.push({id:crypto.randomUUID(),name,state:JSON.parse(JSON.stringify(state))});if(persist())feedback('Plan zapisany na tym urządzeniu.');renderSaved();}catch(e){feedback(e.message);}});
  $('resetForm').addEventListener('click',()=>{if(confirm('Przywrócić domyślne ustawienia formularza? Zapisane plany pozostaną.')){state=C.defaults();fill();resultState=null;$('results').hidden=true;$('formError').hidden=true;persist();}});
  for(const id of ['resultOrigin','resultDates'])$(id).addEventListener('change',()=>{limits={};renderResults();});$('resultSearch').addEventListener('input',()=>{limits={};renderResults();});
  function network(){$('networkStatus').textContent=navigator.onLine?'Planer · ceny online':'Offline · formularz działa';}
  window.addEventListener('online',network);window.addEventListener('offline',network);network();
  window.addEventListener('pagehide',()=>{read();persist();});
  if('serviceWorker' in navigator)navigator.serviceWorker.register('../../sw.js',{scope:'../../',updateViaCache:'none'}).catch(()=>feedback('Tryb offline niedostępny. Formularz nadal działa online.'));
})();
