const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const escapeHtml = value => String(value).replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
const countries = window.BEEN_COUNTRIES || [];
const countryById = new Map(countries.map(country => [country.id, country]));
const countryByNumeric = new Map(countries.map(country => [String(country.numeric).padStart(3, "0"), country]));
const continents = ["Świat", "Europa", "Afryka", "Azja", "Ameryki", "Oceania"];
const BEEN_KEY = "guides.been.v1";

const challengeTemplates = [
  { id: "wonders", icon: "✦", name: "7 nowych cudów świata", note: "Od Petry po Machu Picchu", ids: ["CHN", "JOR", "PER", "MEX", "ITA", "IND", "BRA"] },
  { id: "nordic", icon: "❄", name: "Nordycka piątka", note: "Północ w komplecie", ids: ["DNK", "FIN", "ISL", "NOR", "SWE"] },
  { id: "baltic", icon: "≈", name: "Dookoła Bałtyku", note: "Dziewięć krajów jednego morza", ids: ["DNK", "DEU", "POL", "LTU", "LVA", "EST", "RUS", "FIN", "SWE"] },
  { id: "southamerica", icon: "☀", name: "Ameryka Południowa", note: "Cały kontynent", ids: ["ARG", "BOL", "BRA", "CHL", "COL", "ECU", "GUY", "PRY", "PER", "SUR", "URY", "VEN"] },
  { id: "balkans", icon: "⌁", name: "Bałkańska mozaika", note: "Kultury południowo-wschodniej Europy", ids: ["ALB", "BIH", "BGR", "HRV", "GRC", "MNE", "MKD", "ROU", "SRB", "SVN"] },
  { id: "islands", icon: "◌", name: "10 wyspiarskich krajów", note: "Wybieramy dziesięć z gotowej listy", ids: ["ISL", "IRL", "MLT", "CYP", "JPN", "LKA", "MDV", "MUS", "NZL", "FJI"] },
  { id: "silk", icon: "◇", name: "Śladami Jedwabnego Szlaku", note: "Od Anatolii po Azję Centralną", ids: ["TUR", "GEO", "UZB", "TKM", "TJK", "KGZ", "KAZ", "CHN"] },
  { id: "safari", icon: "♘", name: "Afrykańska piątka", note: "Pięć różnych krain safari", ids: ["ZAF", "NAM", "BWA", "KEN", "TZA"] }
];
const defaultChallenges = ["wonders", "nordic", "baltic"];

let beenState = loadBeenState();
let selectedCountryId = null;
let selectedScope = "Świat";
let mapReady = false;
let globeZoom = 1;
let spinning = !matchMedia("(prefers-reduced-motion: reduce)").matches;
let projection, geoPath, mapFeatures, mapSvg, mapLayer, lastFrame;
let installPrompt = null;
let catalog = null;
let workerRegistration = null;

function loadBeenState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(BEEN_KEY));
    if (parsed && parsed.version === 1 && parsed.countries) return parsed;
  } catch (_) {}
  return { version: 1, countries: {}, challenges: [] };
}

function saveBeenState() {
  localStorage.setItem(BEEN_KEY, JSON.stringify(beenState));
}

function visitedIds() {
  return new Set(Object.entries(beenState.countries).filter(([, data]) => data.years?.length).map(([id]) => id));
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

function switchView(view, updateHash = true) {
  $$(".app-view").forEach(section => { section.hidden = section.dataset.view !== view; });
  $$('[data-view-target]').forEach(button => {
    const active = button.dataset.viewTarget === view;
    button.classList.toggle("is-active", active);
    if (button.classList.contains("app-tab")) button.setAttribute("aria-pressed", String(active));
  });
  if (updateHash) history.replaceState(null, "", view === "been" ? "#byłem" : location.pathname + location.search);
  if (view === "been") {
    renderBeen();
    if (!mapReady) initMap();
    else setTimeout(resizeMap, 0);
  }
  scrollTo({ top: 0, behavior: "smooth" });
}

function yearsSummary() {
  const counts = {};
  Object.values(beenState.countries).forEach(data => (data.years || []).forEach(year => { counts[year] = (counts[year] || 0) + 1; }));
  return Object.entries(counts).sort((a, b) => b[1] - a[1] || Number(b[0]) - Number(a[0]))[0] || null;
}

function scopeCountries() {
  return selectedScope === "Świat" ? countries : countries.filter(country => country.continent === selectedScope);
}

function renderStats() {
  const visited = visitedIds();
  const scoped = scopeCountries();
  const scopedVisited = scoped.filter(country => visited.has(country.id)).length;
  const record = yearsSummary();
  const activeChallenges = allChallenges().map(challengeProgress).filter(item => item.done < item.total).sort((a, b) => (b.done / b.total) - (a.done / a.total));
  const nearest = activeChallenges[0];
  $("#beenStats").innerHTML = `
    <article class="stat-card"><div class="stat-label">Odwiedzone · ${escapeHtml(selectedScope.toLowerCase())}</div><div class="stat-value">${scopedVisited} <small>/ ${scoped.length}</small></div><div class="stat-note">${scoped.length ? Math.round(scopedVisited / scoped.length * 100) : 0}% odkryte</div></article>
    <article class="stat-card"><div class="stat-label">Rekordowy rok</div><div class="stat-value">${record ? record[0] : "—"}</div><div class="stat-note">${record ? `${record[1]} ${record[1] === 1 ? "nowy kraj" : "nowe kraje"}` : "dodaj pierwszą wizytę"}</div></article>
    <article class="stat-card"><div class="stat-label">Najbliższy bonus</div><div class="stat-value">${nearest ? escapeHtml(nearest.name) : "—"}</div><div class="stat-note">${nearest ? `${nearest.done} z ${nearest.total} krajów` : "wszystkie cele zdobyte"}</div></article>`;
}

function renderScopes() {
  $("#scopeButtons").innerHTML = continents.map(scope => `<button class="scope-button ${scope === selectedScope ? "is-active" : ""}" type="button" data-scope="${scope}">${scope}</button>`).join("");
}

function renderPassport() {
  const visited = visitedIds();
  const years = [...new Set(Object.values(beenState.countries).flatMap(data => data.years || []))].sort((a, b) => a - b);
  let streak = 0, best = 0, previous = null;
  years.forEach(year => { streak = previous !== null && year === previous + 1 ? streak + 1 : 1; best = Math.max(best, streak); previous = year; });
  const continentScores = continents.slice(1).map(name => {
    const list = countries.filter(country => country.continent === name);
    return { name, done: list.filter(country => visited.has(country.id)).length, total: list.length };
  }).sort((a, b) => (b.done / b.total) - (a.done / a.total));
  const leader = continentScores[0];
  const placesSeen = Object.values(beenState.countries).reduce((sum, value) => sum + (value.places || []).length, 0);
  $("#passportStrip").innerHTML = `
    <article class="passport-item"><small>NAJBLIŻEJ KOMPLETU</small><strong>${leader.name} · ${leader.done}/${leader.total}</strong></article>
    <article class="passport-item"><small>SERIA PODRÓŻNICZA</small><strong>${best ? `${best} ${best === 1 ? "rok" : "lata"} z nowym krajem` : "Czeka na pierwszy rok"}</strong></article>
    <article class="passport-item"><small>TOP 5 ODKRYTE</small><strong>${placesSeen} zaznaczonych miejsc</strong></article>`;
}

function allChallenges() {
  const builtIn = defaultChallenges.map(id => ({ ...challengeTemplates.find(item => item.id === id), custom: false }));
  const custom = (beenState.challenges || []).map(item => ({ ...item, custom: true }));
  return [...builtIn, ...custom];
}

function challengeProgress(challenge) {
  const visited = visitedIds();
  return { ...challenge, done: challenge.ids.filter(id => visited.has(id)).length, total: challenge.ids.length };
}

function renderChallenges() {
  $("#challengeGrid").innerHTML = allChallenges().map(challengeProgress).map(challenge => {
    const percent = challenge.total ? Math.round(challenge.done / challenge.total * 100) : 0;
    return `<article class="challenge-card">${challenge.custom ? `<button class="challenge-delete" type="button" data-delete-challenge="${escapeHtml(challenge.uid)}" aria-label="Usuń wyzwanie">×</button>` : ""}<div class="challenge-icon" aria-hidden="true">${challenge.icon}</div><h3>${escapeHtml(challenge.name)}</h3><p>${escapeHtml(challenge.note)}</p><div class="challenge-progress"><span style="width:${percent}%"></span></div><div class="challenge-score">${challenge.done}/${challenge.total}${challenge.done === challenge.total ? " · zdobyte!" : ""}</div></article>`;
  }).join("");
}

function renderChallengeIdeas() {
  $("#challengeIdeas").innerHTML = challengeTemplates.slice(1).map(template => `<button class="challenge-idea" type="button" data-template="${template.id}"><strong>${template.icon} ${escapeHtml(template.name)}</strong><small>${escapeHtml(template.note)}</small></button>`).join("");
}

function renderCountryPanel() {
  const panel = $("#countryPanel");
  const country = countryById.get(selectedCountryId);
  if (!country) {
    panel.innerHTML = `<div class="country-empty"><span>◎</span><h2>Wybierz kraj</h2><p>Dotknij go na globusie albo znajdź po nazwie.</p></div>`;
    return;
  }
  const data = beenState.countries[country.id] || { years: [], places: [] };
  const isVisited = data.years?.length > 0;
  panel.innerHTML = `<div class="country-title"><div><h2>${escapeHtml(country.name)}</h2><div class="country-meta">${escapeHtml(country.continent)}</div></div><span class="flag" aria-hidden="true">${country.flag}</span></div>
    <button class="visit-toggle ${isVisited ? "remove" : ""}" type="button" data-visit-toggle="${country.id}">${isVisited ? "✓ Odwiedzony · zmień" : "＋ Oznacz jako odwiedzony"}</button>
    <div class="panel-label">LATA WIZYT</div><div class="year-list">${(data.years || []).sort((a,b)=>a-b).map(year => `<button class="year-chip" type="button" data-remove-year="${year}" title="Dotknij, aby usunąć rok">${year}</button>`).join("")}${isVisited ? `<button class="year-chip add-year" type="button" data-add-year>＋ Dodaj rok</button>` : `<span class="country-meta">Dodaj pierwszą wizytę</span>`}</div>
    <div class="panel-label">TOP 5 GUIDES</div><ul class="place-list">${country.topPlaces.map((place, index) => `<li><button class="place-button ${(data.places || []).includes(index) ? "is-seen" : ""}" type="button" data-place="${index}"><span class="star">★</span><span>${escapeHtml(place)}</span><small>${index + 1}</small></button></li>`).join("")}</ul>
    <div class="panel-tip">Gotowa piątka to punkt startowy. Gwiazdką zaznacz miejsca, które naprawdę udało Ci się zobaczyć.</div>`;
}

function renderBeen() {
  renderScopes();
  renderStats();
  renderCountryPanel();
  renderPassport();
  renderChallenges();
  updateMapStyles();
}

function selectCountry(id, focusMap = true) {
  if (!countryById.has(id)) return;
  selectedCountryId = id;
  renderCountryPanel();
  $("#searchResults").hidden = true;
  $("#countrySearch").value = "";
  $("#searchCount").textContent = "";
  if (focusMap && projection) {
    const country = countryById.get(id);
    d3.transition().duration(650).tween("rotate", () => {
      const interpolation = d3.interpolate(projection.rotate(), [-country.center[0], -country.center[1], 0]);
      return time => { projection.rotate(interpolation(time)); drawMap(); };
    });
  }
  updateMapStyles();
  if (innerWidth < 800) $("#countryPanel").scrollIntoView({ behavior: "smooth", block: "start" });
}

function addVisitYear(year) {
  if (!selectedCountryId) return;
  const data = beenState.countries[selectedCountryId] || { years: [], places: [] };
  data.years = [...new Set([...(data.years || []), Number(year)])].sort();
  data.places ||= [];
  beenState.countries[selectedCountryId] = data;
  saveBeenState();
  renderBeen();
  showToast("Wizyta dodana do paszportu");
}

function removeYear(year) {
  const data = beenState.countries[selectedCountryId];
  if (!data) return;
  data.years = data.years.filter(item => item !== Number(year));
  if (!data.years.length && !data.places?.length) delete beenState.countries[selectedCountryId];
  saveBeenState();
  renderBeen();
}

function togglePlace(index) {
  if (!selectedCountryId) return;
  const data = beenState.countries[selectedCountryId] || { years: [], places: [] };
  data.places ||= [];
  data.places = data.places.includes(index) ? data.places.filter(item => item !== index) : [...data.places, index];
  beenState.countries[selectedCountryId] = data;
  saveBeenState();
  renderBeen();
}

async function initMap() {
  if (mapReady || !window.d3 || !window.topojson) return;
  try {
    const topology = await fetch("./assets/data/countries-110m.json").then(response => response.json());
    mapFeatures = topojson.feature(topology, topology.objects.countries).features;
    mapSvg = d3.select("#worldGlobe");
    projection = d3.geoOrthographic().clipAngle(90).precision(.2);
    geoPath = d3.geoPath(projection);
    mapSvg.append("path").datum({ type: "Sphere" }).attr("class", "map-ocean").attr("fill", "#e5efec").attr("stroke", "#adc1bb");
    mapSvg.append("path").datum(d3.geoGraticule10()).attr("class", "map-grid").attr("fill", "none").attr("stroke", "#b7cbc5").attr("stroke-width", ".55").attr("opacity", ".65");
    mapLayer = mapSvg.append("g");
    mapLayer.selectAll("path").data(mapFeatures).join("path").attr("class", "map-country").attr("stroke", "#fffdf8").attr("stroke-width", ".6").style("cursor", feature => countryByNumeric.has(String(feature.id).padStart(3, "0")) ? "pointer" : "default").on("click", (_, feature) => {
      const country = countryByNumeric.get(String(feature.id).padStart(3, "0"));
      if (country) selectCountry(country.id, false);
    });
    mapSvg.call(d3.drag().on("start", () => { spinning = false; updateSpinButton(); }).on("drag", event => {
      const rotate = projection.rotate();
      projection.rotate([rotate[0] + event.dx * .35, Math.max(-85, Math.min(85, rotate[1] - event.dy * .35)), rotate[2]]);
      drawMap();
    }));
    mapSvg.on("wheel", event => {
      event.preventDefault();
      setGlobeZoom(globeZoom * (event.deltaY < 0 ? 1.12 : .89));
    }, { passive: false });
    mapReady = true;
    $("#mapLoading").hidden = true;
    resizeMap();
    requestAnimationFrame(animateGlobe);
    addEventListener("resize", resizeMap, { passive: true });
  } catch (error) {
    $("#mapLoading").textContent = "Nie udało się wczytać globusa. Lista krajów nadal działa.";
  }
}

function resizeMap() {
  if (!mapReady) return;
  const box = $(".globe-wrap");
  const width = box.clientWidth, height = box.clientHeight;
  mapSvg.attr("viewBox", `0 0 ${width} ${height}`);
  projection.translate([width / 2, height / 2]).scale(Math.min(width, height) * .42 * globeZoom);
  drawMap();
}

function setGlobeZoom(value) {
  globeZoom = Math.max(.85, Math.min(3.4, value));
  resizeMap();
  $("#zoomOut").disabled = globeZoom <= .86;
  $("#zoomIn").disabled = globeZoom >= 3.39;
}

function drawMap() {
  if (!mapReady) return;
  mapSvg.select(".map-ocean").attr("d", geoPath);
  mapSvg.select(".map-grid").attr("d", geoPath);
  mapLayer.selectAll("path").attr("d", geoPath);
  updateMapStyles();
}

function updateMapStyles() {
  if (!mapReady || !mapLayer) return;
  const visited = visitedIds();
  mapLayer.selectAll("path").attr("fill", feature => {
    const country = countryByNumeric.get(String(feature.id).padStart(3, "0"));
    if (!country) return "#c3cbc8";
    if (country.id === selectedCountryId) return "#f0bd67";
    if (visited.has(country.id)) return "#c96e4d";
    return "#bdc7c3";
  }).attr("opacity", feature => {
    const country = countryByNumeric.get(String(feature.id).padStart(3, "0"));
    return selectedScope === "Świat" || country?.continent === selectedScope ? 1 : .35;
  });
}

function animateGlobe(time) {
  if (mapReady) {
    if (spinning && lastFrame) {
      const rotate = projection.rotate();
      projection.rotate([rotate[0] + (time - lastFrame) * .004, rotate[1], rotate[2]]);
      drawMap();
    }
    lastFrame = time;
    requestAnimationFrame(animateGlobe);
  }
}

function updateSpinButton() {
  $("#spinToggle").textContent = spinning ? "Ⅱ Zatrzymaj obrót" : "▶ Uruchom obrót";
}

function focusScope(scope) {
  const targets = { Świat: [0, -10, 0], Europa: [-15, -51, 0], Afryka: [-20, 2, 0], Azja: [-90, -30, 0], Ameryki: [75, -10, 0], Oceania: [-140, 20, 0] };
  selectedScope = scope;
  globeZoom = ({ Świat: 1, Europa: 2.15, Afryka: 1.25, Azja: 1.15, Ameryki: 1.1, Oceania: 1.35 })[scope] || 1;
  renderBeen();
  if (projection) {
    const start = projection.rotate(), target = targets[scope];
    d3.transition().duration(650).tween("scope", () => {
      const interpolation = d3.interpolate(start, target);
      return time => { projection.rotate(interpolation(time)); drawMap(); };
    });
  }
}

function renderSearch(query) {
  const normalized = query.trim().toLocaleLowerCase("pl");
  const box = $("#searchResults");
  if (!normalized) { box.hidden = true; $("#searchCount").textContent = ""; return; }
  const matches = countries.filter(country => `${country.name} ${country.englishName}`.toLocaleLowerCase("pl").includes(normalized)).slice(0, 12);
  $("#searchCount").textContent = matches.length ? `${matches.length}` : "0";
  box.innerHTML = matches.length ? matches.map(country => `<button class="search-result" type="button" data-country="${country.id}"><span>${country.flag}</span><strong>${escapeHtml(country.name)}<small>${escapeHtml(country.continent)}</small></strong></button>`).join("") : `<div class="country-meta">Nie znaleziono kraju.</div>`;
  box.hidden = false;
}

function openVisitDialog() {
  const country = countryById.get(selectedCountryId);
  if (!country) return;
  $("#visitDialogTitle").textContent = `Kiedy: ${country.name}?`;
  $("#visitYear").value = new Date().getFullYear();
  $("#visitDialog").showModal();
  $("#visitYear").select();
}

function selectChallengeTemplate(id) {
  const template = challengeTemplates.find(item => item.id === id);
  if (!template) return;
  $("#challengeTemplate").value = id;
  $("#challengeName").value = template.name;
  $$(".challenge-idea").forEach(button => button.classList.toggle("is-selected", button.dataset.template === id));
}

function exportBeenData() {
  const payload = { app: "Guides", exportedAt: new Date().toISOString(), data: beenState };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `guides-paszport-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
  showToast("Kopia paszportu została pobrana");
}

async function importBeenData(file) {
  try {
    const payload = JSON.parse(await file.text());
    const data = payload.data || payload;
    if (data.version !== 1 || !data.countries) throw new Error("Nieprawidłowy plik");
    beenState = data;
    saveBeenState();
    renderBeen();
    showToast("Paszport został przywrócony");
  } catch (_) { showToast("Nie udało się odczytać tej kopii"); }
}

function initBeenEvents() {
  $("#scopeButtons").addEventListener("click", event => { const button = event.target.closest("[data-scope]"); if (button) focusScope(button.dataset.scope); });
  $("#countrySearch").addEventListener("input", event => renderSearch(event.target.value));
  $("#searchResults").addEventListener("click", event => { const button = event.target.closest("[data-country]"); if (button) selectCountry(button.dataset.country); });
  $("#countryPanel").addEventListener("click", event => {
    const visit = event.target.closest("[data-visit-toggle]");
    if (visit) {
      const data = beenState.countries[selectedCountryId];
      if (data?.years?.length) {
        if (confirm(`Usunąć ${countryById.get(selectedCountryId).name} z odwiedzonych? Znikną też lata i zaznaczone miejsca.`)) { delete beenState.countries[selectedCountryId]; saveBeenState(); renderBeen(); }
      } else openVisitDialog();
      return;
    }
    if (event.target.closest("[data-add-year]")) return openVisitDialog();
    const year = event.target.closest("[data-remove-year]");
    if (year) return removeYear(year.dataset.removeYear);
    const place = event.target.closest("[data-place]");
    if (place) togglePlace(Number(place.dataset.place));
  });
  $("#visitForm").addEventListener("submit", event => { event.preventDefault(); addVisitYear(event.currentTarget.year.value); $("#visitDialog").close(); });
  $("#spinToggle").addEventListener("click", () => { spinning = !spinning; updateSpinButton(); });
  $("#zoomIn").addEventListener("click", () => setGlobeZoom(globeZoom * 1.3));
  $("#zoomOut").addEventListener("click", () => setGlobeZoom(globeZoom / 1.3));
  $("#zoomReset").addEventListener("click", () => { globeZoom = 1; focusScope("Świat"); });
  $("#openChallengeBuilder").addEventListener("click", () => { renderChallengeIdeas(); selectChallengeTemplate("nordic"); $("#challengeDialog").showModal(); });
  $("#challengeIdeas").addEventListener("click", event => { const button = event.target.closest("[data-template]"); if (button) selectChallengeTemplate(button.dataset.template); });
  $("#challengeForm").addEventListener("submit", event => {
    event.preventDefault();
    const template = challengeTemplates.find(item => item.id === event.currentTarget.template.value);
    if (!template) return;
    beenState.challenges.push({ uid: crypto.randomUUID?.() || String(Date.now()), icon: template.icon, name: $("#challengeName").value.trim(), note: template.note, ids: [...template.ids] });
    saveBeenState(); renderChallenges(); $("#challengeDialog").close(); showToast("Wyzwanie dodane");
  });
  $("#challengeGrid").addEventListener("click", event => { const button = event.target.closest("[data-delete-challenge]"); if (button) { beenState.challenges = beenState.challenges.filter(item => item.uid !== button.dataset.deleteChallenge); saveBeenState(); renderChallenges(); } });
  $("#exportBeen").addEventListener("click", exportBeenData);
  $("#importBeen").addEventListener("click", () => $("#importBeenFile").click());
  $("#importBeenFile").addEventListener("change", event => { if (event.target.files[0]) importBeenData(event.target.files[0]); event.target.value = ""; });
}

const formatBytes = bytes => {
  if (!Number.isFinite(bytes) || bytes <= 0) return "";
  const units = ["B", "KB", "MB", "GB"], power = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1), value = bytes / 1024 ** power;
  return `${value >= 10 || power === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[power]}`;
};

function updateConnection() {
  const online = navigator.onLine, status = $("#connectionStatus");
  status.textContent = online ? "● Online · możesz pobierać przewodniki" : "● Offline · działają pobrane treści";
  status.classList.toggle("offline", !online);
}

async function updateStorage() {
  if (!navigator.storage?.estimate) return;
  const { usage, quota } = await navigator.storage.estimate();
  if (usage && quota) $("#storageStatus").textContent = `Aplikacja zajmuje ${formatBytes(usage)} z ${formatBytes(quota)}`;
}

async function getWorker() {
  if (workerRegistration?.active) return workerRegistration.active;
  workerRegistration = await navigator.serviceWorker.ready;
  return workerRegistration.active;
}

async function sendCommand(type, packageId, onProgress) {
  const worker = await getWorker();
  return new Promise((resolve, reject) => {
    const channel = new MessageChannel();
    const timeout = setTimeout(() => reject(new Error("Brak odpowiedzi modułu offline.")), 10 * 60 * 1000);
    channel.port1.onmessage = event => {
      const message = event.data || {};
      if (message.type === "PROGRESS") return onProgress?.(message);
      clearTimeout(timeout);
      message.ok === false ? reject(new Error(message.error || "Nie udało się wykonać operacji.")) : resolve(message);
    };
    worker.postMessage({ type, packageId }, [channel.port2]);
  });
}

function cardMarkup(pkg) {
  return `<article class="guide-card ${pkg.theme}" data-package="${pkg.id}"><div class="flag" aria-hidden="true">${pkg.flag}</div><h3>${pkg.title}</h3><div class="meta">${pkg.subtitle}<br>${formatBytes(pkg.size)} · ${pkg.assets.length} plików</div><div class="package-status"><span class="status-dot"></span><span class="status-text">Sprawdzam…</span></div><div class="progress" hidden><span></span></div><div class="card-actions"><a class="action primary open-link" href="./${pkg.startUrl}">Otwórz →</a><button class="action secondary package-action" type="button">Pobierz</button></div></article>`;
}

function setCardState(card, state) {
  card.dataset.state = state.stale ? "stale" : state.installed ? "installed" : "available";
  card.classList.toggle("installed", state.installed); card.classList.toggle("stale", state.stale);
  const status = card.querySelector(".status-text"), action = card.querySelector(".package-action"), open = card.querySelector(".open-link");
  if (state.stale) { status.textContent = "Dostępna aktualizacja"; action.textContent = "Aktualizuj"; }
  else if (state.installed) { status.textContent = "Gotowy offline"; action.textContent = "Usuń z telefonu"; }
  else { status.textContent = navigator.onLine ? "Dostępny do pobrania" : "Niepobrany"; action.textContent = "Pobierz"; }
  open.setAttribute("aria-disabled", String(!navigator.onLine && !state.installed && !state.stale));
}

async function refreshStates() {
  try {
    const result = await sendCommand("GET_STATUS");
    for (const pkg of catalog.packages) setCardState($("#guideGrid").querySelector(`[data-package="${pkg.id}"]`), result.packages[pkg.id] || { installed: false, stale: false });
  } catch (_) { $$("#guideGrid .status-text").forEach(node => { node.textContent = "Tryb offline uruchomi się po odświeżeniu"; }); }
}

async function handlePackageAction(card) {
  const id = card.dataset.package, action = card.querySelector(".package-action"), progress = card.querySelector(".progress"), bar = progress.querySelector("span"), status = card.querySelector(".status-text"), currentState = card.dataset.state;
  action.disabled = true;
  try {
    if (currentState === "installed") { status.textContent = "Usuwam pakiet…"; await sendCommand("DELETE_PACKAGE", id); }
    else {
      if (!navigator.onLine) throw new Error("Do pobrania przewodnika potrzebny jest internet.");
      progress.hidden = false; status.textContent = currentState === "stale" ? "Aktualizuję…" : "Pobieram…";
      await sendCommand("DOWNLOAD_PACKAGE", id, message => { const percent = Math.round(message.done / message.total * 100); bar.style.width = `${percent}%`; status.textContent = `Pobieram… ${percent}%`; });
    }
    await refreshStates(); await updateStorage();
  } catch (error) { status.textContent = error.message; }
  finally { action.disabled = false; setTimeout(() => { progress.hidden = true; bar.style.width = "0"; }, 500); }
}

async function migrateAndRegisterWorker() {
  const rootWorkerUrl = new URL("./sw.js", location.href).href, registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map(registration => { const script = registration.active?.scriptURL || registration.waiting?.scriptURL || registration.installing?.scriptURL; return script && script !== rootWorkerUrl ? registration.unregister() : Promise.resolve(); }));
  workerRegistration = await navigator.serviceWorker.register("./sw.js", { scope: "./", updateViaCache: "none" });
  await workerRegistration.update().catch(() => {});
  return navigator.serviceWorker.ready;
}

async function initTrips() {
  catalog = await fetch("./offline-catalog.json", { cache: "no-store" }).then(response => { if (!response.ok) throw new Error(`HTTP ${response.status}`); return response.json(); });
  $("#guideGrid").innerHTML = catalog.packages.map(cardMarkup).join("");
  $("#guideGrid").addEventListener("click", event => { const button = event.target.closest(".package-action"); if (button) handlePackageAction(button.closest(".guide-card")); });
  if ("serviceWorker" in navigator) { await migrateAndRegisterWorker(); await refreshStates(); }
  else $$("#guideGrid .status-text").forEach(node => { node.textContent = "Ta przeglądarka nie obsługuje trybu offline"; });
  await updateStorage();
}

function initDialogs() {
  $$('[data-dialog-close]').forEach(button => button.addEventListener("click", () => button.closest("dialog").close()));
  $$('dialog').forEach(dialog => dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); }));
  $("#installButton").addEventListener("click", async () => { if (installPrompt) { await installPrompt.prompt(); installPrompt = null; } else $("#installDialog").showModal(); });
  addEventListener("beforeinstallprompt", event => { event.preventDefault(); installPrompt = event; $("#installButton").textContent = "Zainstaluj aplikację"; });
}

function init() {
  updateConnection();
  addEventListener("online", () => { updateConnection(); refreshStates(); });
  addEventListener("offline", () => { updateConnection(); refreshStates(); });
  $$('[data-view-target]').forEach(button => button.addEventListener("click", () => switchView(button.dataset.viewTarget)));
  initDialogs(); initBeenEvents(); renderBeen(); updateSpinButton();
  const initialHash = decodeURIComponent(location.hash);
  switchView(initialHash === "#byłem" || initialHash === "#bylo" ? "been" : "trips", false);
  initTrips().catch(error => { $("#guideGrid").innerHTML = `<div class="loading-card">Nie udało się uruchomić przewodników: ${escapeHtml(error.message)}</div>`; });
}

init();
