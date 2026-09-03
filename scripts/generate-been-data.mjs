import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const COUNTRIES_URL = "https://cdn.jsdelivr.net/npm/world-countries@5.1.0/countries.json";
const WIKIVOYAGE_REST = "https://en.wikivoyage.org/api/rest_v1/page/html/";

const titleOverrides = {
  BOL: "Bolivia", BRN: "Brunei", COD: "Democratic Republic of the Congo",
  COG: "Republic of the Congo", CIV: "Côte d'Ivoire", CZE: "Czech Republic",
  FSM: "Micronesia", IRN: "Iran", LAO: "Laos", MDA: "Moldova",
  MKD: "North Macedonia", PSE: "Palestinian territories", RUS: "Russia",
  KOR: "South Korea", PRK: "North Korea", SYR: "Syria", TZA: "Tanzania",
  USA: "United States of America", VAT: "Vatican City", VEN: "Venezuela",
  VNM: "Vietnam"
};

const polishOverrides = {
  COD: "Demokratyczna Republika Konga", COG: "Republika Konga",
  CIV: "Wybrzeże Kości Słoniowej", PSE: "Palestyna", VAT: "Watykan"
};

const continentNames = { Africa: "Afryka", Americas: "Ameryki", Asia: "Azja", Europe: "Europa", Oceania: "Oceania" };
let dumpPlaces = {};
try { dumpPlaces = JSON.parse(await readFile("/tmp/wv-topplaces.json", "utf8")); } catch (_) {}

function cleanLink(value) {
  const raw = value.trim().replace(/'''?/g, "");
  const link = raw.match(/^\[\[([^\]]+)\]\]$/)?.[1] || raw;
  return link.includes("|") ? link.split("|").at(-1).trim() : link.trim();
}

function section(wikitext, heading) {
  const match = new RegExp(`^==\\s*${heading}\\s*==\\s*$`, "im").exec(wikitext);
  if (!match) return "";
  const rest = wikitext.slice(match.index + match[0].length);
  const end = /^==[^=].*==\s*$/m.exec(rest);
  return end ? rest.slice(0, end.index) : rest;
}

function markerNames(block) {
  const names = [];
  const re = /\{\{marker\|[^}\n]*?name=(\[\[[^\]]+\]\]|[^|}\n]+)/gi;
  for (const match of block.matchAll(re)) {
    const value = cleanLink(match[1]);
    if (value && !names.includes(value)) names.push(value);
  }
  return names;
}

function topPlaces(wikitext, capital) {
  const cities = markerNames(section(wikitext, "Cities"));
  const destinations = markerNames(section(wikitext, "Other destinations"));
  const combined = [...cities.slice(0, 2), ...destinations.slice(0, 3), ...cities.slice(2), ...destinations.slice(3)];
  const result = [...new Set(combined)].slice(0, 5);
  if (capital && !result.includes(capital) && result.length < 5) result.unshift(capital);
  return [...new Set(result)].slice(0, 5);
}

function decodeHtml(value) {
  return value.replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/<[^>]+>/g, "").trim();
}

function htmlSection(html, id) {
  const start = html.indexOf(`<h2 id="${id}">`);
  if (start < 0) return "";
  const end = html.indexOf("</section>", start);
  return end < 0 ? html.slice(start) : html.slice(start, end);
}

function htmlMarkerNames(block) {
  return [...block.matchAll(/class="fn org listing-name"[^>]*>\s*<a[^>]*>([\s\S]*?)<\/a>/gi)]
    .map(match => decodeHtml(match[1]))
    .filter((value, index, list) => value && list.indexOf(value) === index);
}

function topPlacesHtml(html, capital) {
  const cities = htmlMarkerNames(htmlSection(html, "Cities"));
  const destinations = htmlMarkerNames(htmlSection(html, "Other_destinations"));
  const result = [...new Set([...cities.slice(0, 2), ...destinations.slice(0, 3), ...cities.slice(2), ...destinations.slice(3)])].slice(0, 5);
  if (capital && !result.includes(capital) && result.length < 5) result.unshift(capital);
  return [...new Set(result)].slice(0, 5);
}

async function loadWikivoyage(title) {
  const response = await fetch(`${WIKIVOYAGE_REST}${encodeURIComponent(title.replaceAll(" ", "_"))}`, { headers: { "user-agent": "Guides-data-builder/1.0" } });
  if (!response.ok) throw new Error(`Wikivoyage ${response.status}`);
  return response.text();
}

async function mapLimit(items, limit, worker) {
  const output = Array(items.length);
  let cursor = 0;
  await Promise.all(Array.from({ length: limit }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      output[index] = await worker(items[index], index);
    }
  }));
  return output;
}

const all = await fetch(COUNTRIES_URL).then(response => response.json());
const sovereign = all
  .filter(country => country.unMember || ["PSE", "VAT"].includes(country.cca3))
  .sort((a, b) => (a.translations?.pol?.common || a.name.common).localeCompare(b.translations?.pol?.common || b.name.common, "pl"));

const countries = await mapLimit(sovereign, 8, async country => {
  const capital = country.capital?.[0] || "";
  let places = dumpPlaces[country.cca3] || [];
  if (!places.length && !Object.keys(dumpPlaces).length) {
    try {
      const text = await loadWikivoyage(titleOverrides[country.cca3] || country.name.common);
      places = topPlacesHtml(text, capital);
    } catch (error) {
      console.warn(country.cca3, error.message);
    }
  }
  return {
    id: country.cca3,
    numeric: country.ccn3,
    name: polishOverrides[country.cca3] || country.translations?.pol?.common || country.name.common,
    englishName: country.name.common,
    flag: country.flag,
    continent: continentNames[country.region] || country.region,
    capital,
    center: [country.latlng?.[1] || 0, country.latlng?.[0] || 0],
    topPlaces: places
  };
});

const manual = {
  AUS: ["Sydney", "Wielka Rafa Koralowa", "Uluru", "Melbourne", "Tasmania"],
  BHS: ["Nassau", "Exuma Cays", "Harbour Island", "Andros", "Lucayan National Park"],
  BRB: ["Bridgetown", "Bathsheba", "Harrison's Cave", "Carlisle Bay", "St. Nicholas Abbey"],
  BLR: ["Mińsk", "Zamek w Mirze", "Nieśwież", "Puszcza Białowieska", "Brześć"],
  BRA: ["Rio de Janeiro", "Wodospady Iguaçu", "Amazonia", "Salvador", "Pantanal"],
  EGY: ["Piramidy w Gizie", "Luksor", "Kair", "Abu Simbel", "Morze Czerwone"],
  ESP: ["Barcelona", "Madryt", "Sewilla", "Granada i Alhambra", "San Sebastián"],
  FRA: ["Paryż", "Mont-Saint-Michel", "Prowansja", "Lazurowe Wybrzeże", "Dolina Loary"],
  GEO: ["Tbilisi", "Kazbegi", "Kachetia", "Swane­tia", "Wardzia"],
  GBR: ["Londyn", "Edynburg", "Lake District", "Bath", "Wyspa Skye"],
  GRD: ["St. George's", "Grand Anse", "Underwater Sculpture Park", "Annandale Falls", "Carriacou"],
  GRC: ["Ateny", "Santorini", "Meteory", "Kreta", "Delfy"],
  IND: ["Tadź Mahal", "Jaipur", "Varanasi", "Kerala", "Ladakh"],
  IRL: ["Dublin", "Cliffs of Moher", "Ring of Kerry", "Galway", "Giant's Causeway"],
  ISL: ["Złoty Krąg", "Reykjavík", "Jökulsárlón", "Fiordy Zachodnie", "Landmannalaugar"],
  ITA: ["Rzym", "Florencja", "Wenecja", "Dolomity", "Wybrzeże Amalfitańskie"],
  JPN: ["Tokio", "Kioto", "Nara", "Hiroshima i Miyajima", "Góra Fuji"],
  KEN: ["Masai Mara", "Amboseli", "Nairobi", "Lamu", "Park Narodowy Tsavo"],
  KIR: ["Tarawa", "Kiritimati", "Tabuaeran", "Abaiang", "Butaritari"],
  LIE: ["Vaduz", "Zamek Gutenberg", "Malbun", "Fürstensteig", "Triesenberg"],
  LTU: ["Wilno", "Mierzeja Kurońska", "Kowno", "Troki", "Góra Krzyży"],
  LUX: ["Luksemburg", "Vianden", "Mullerthal", "Echternach", "Dolina Mozeli"],
  MDG: ["Aleja Baobabów", "Tsingy de Bemaraha", "Nosy Be", "Ranomafana", "Isalo"],
  MCO: ["Monte Carlo", "Pałac Książęcy", "Musée Océanographique", "Larvotto", "Jardin Exotique"],
  MAR: ["Marrakesz", "Fez", "Sahara", "Chefchaouen", "Essaouira"],
  MEX: ["Meksyk", "Chichén Itzá", "Oaxaca", "Tulum", "San Miguel de Allende"],
  NAM: ["Sossusvlei", "Etosha", "Swakopmund", "Damaraland", "Fish River Canyon"],
  NRU: ["Buada Lagoon", "Anibare Bay", "Command Ridge", "Moqua Caves", "Yaren"],
  NOR: ["Fiordy zachodniej Norwegii", "Lofoty", "Oslo", "Bergen", "Tromsø"],
  NZL: ["Milford Sound", "Queenstown", "Rotorua", "Aoraki / Mount Cook", "Abel Tasman"],
  PER: ["Machu Picchu", "Cusco", "Święta Dolina", "Arequipa i Colca", "Amazonia"],
  PLW: ["Rock Islands", "Jellyfish Lake", "Koror", "Ngardmau Waterfall", "Peleliu"],
  POL: ["Kraków", "Warszawa", "Tatry", "Gdańsk", "Wrocław"],
  PRT: ["Lizbona", "Porto", "Sintra", "Dolina Douro", "Madera"],
  VCT: ["Bequia", "Tobago Cays", "La Soufrière", "Kingstown", "Mustique"],
  WSM: ["To Sua Ocean Trench", "Apia", "Lalomanu", "Savai'i", "Papase'ea Sliding Rocks"],
  SMR: ["Guaita", "Cesta", "Stare Miasto San Marino", "Palazzo Pubblico", "Monte Titano"],
  SYC: ["Anse Source d'Argent", "Vallée de Mai", "Mahé", "Praslin", "Aldabra"],
  SGP: ["Marina Bay", "Gardens by the Bay", "Chinatown", "Botanic Gardens", "Pulau Ubin"],
  TON: ["Nuku'alofa", "Ha'amonga 'a Maui", "Vava'u", "Mapu'a 'a Vaea", "Eua"],
  TUV: ["Funafuti", "Funafuti Conservation Area", "Fongafale", "Nanumea", "Nui"],
  THA: ["Bangkok", "Chiang Mai", "Ayutthaya", "Krabi", "Koh Samui"],
  TUR: ["Stambuł", "Kapadocja", "Efez", "Pamukkale", "Wybrzeże Licyjskie"],
  VUT: ["Mount Yasur", "Blue Lagoon", "Espiritu Santo", "Port Vila", "Pentecost Island"],
  VAT: ["Bazylika św. Piotra", "Kaplica Sykstyńska", "Muzea Watykańskie", "Plac św. Piotra", "Ogrody Watykańskie"],
  USA: ["Nowy Jork", "Wielki Kanion", "Yellowstone", "San Francisco", "Nowy Orlean"],
  MHL: ["Majuro", "Bikini Atoll", "Arno Atoll", "Laura Beach", "Kwajalein"],
  SLB: ["Honiara", "Marovo Lagoon", "Munda", "Tetepare", "Guadalcanal"],
  STP: ["São Tomé", "Ilhéu das Rolas", "Pico Cão Grande", "Príncipe", "Obô National Park"],
  ZAF: ["Kapsztad", "Park Krugera", "Garden Route", "Drakensberg", "Winnice Cape Winelands"]
};

for (const country of countries) {
  if (manual[country.id]) country.topPlaces = manual[country.id];
  while (country.topPlaces.length < 5) {
    const fallback = country.topPlaces.length === 0 && country.capital
      ? country.capital
      : ["Najpiękniejszy region przyrodniczy", "Najważniejsze miejsce UNESCO", "Lokalna stolica kultury", "Najciekawsza trasa widokowa"][country.topPlaces.length - 1] || "Miejsce polecane przez Guides";
    if (!country.topPlaces.includes(fallback)) country.topPlaces.push(fallback);
    else country.topPlaces.push(`Miejsce polecane ${country.topPlaces.length + 1}`);
  }
}

const banner = `// Wygenerowano z world-countries 5.1.0 i list kierunków Wikivoyage.\n// Nazwy miejsc są propozycjami startowymi i użytkownik może je zastąpić.\n`;
await writeFile(path.join(ROOT, "been-data.js"), `${banner}window.BEEN_COUNTRIES = ${JSON.stringify(countries, null, 2)};\n`);
console.log(`Zapisano ${countries.length} krajów.`);
