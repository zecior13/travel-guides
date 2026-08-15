// Globalny filtr katalogu: pokazujemy wyłącznie dzieła potwierdzone jako dostępne
// na ekspozycji 15.08.2026. Ta warstwa działa po rozszerzeniach katalogu, ale przed
// warstwą edukacyjną, dzięki czemu usunięte pozycje nie trafiają do interfejsu.

function museumById(id) {
  return MUSEUMS.find(museum => museum.id === id);
}

function updateMuseumWork(museumId, workId, patch) {
  const work = museumById(museumId)?.works.find(item => item.id === workId);
  if (work) Object.assign(work, patch);
}

function retainMuseumWorks(museumId, ids) {
  const museum = museumById(museumId);
  if (!museum) return;
  const retained = new Set(ids);
  museum.works = museum.works.filter(work => retained.has(work.id));
}

// MoMA: usuwamy prace oznaczone jako poza ekspozycją oraz dwie pozycje,
// których oficjalne karty nie potwierdzają obecnej dostępności.
const moma = museumById("moma");
if (moma) {
  const removed = new Set(["moma-sleeping", "moma-monet-footbridge"]);
  moma.works = moma.works.filter(work => work.status !== "off" && !removed.has(work.id));
}

[
  ["moma-olives", {status:"on", floor:"5 · galeria 501", url:"https://www.moma.org/collection/works/80013"}],
  ["moma-musicians", {status:"on", floor:"5 · galeria 513", url:"https://www.moma.org/collection/works/78630"}],
  ["moma-mirror", {status:"on", floor:"5 · galeria 517", url:"https://www.moma.org/collection/works/78311"}],
  ["moma-picasso-nudes", {status:"on", floor:"5 · galeria 502", url:"https://www.moma.org/collection/works/80111"}],
  ["moma-picasso-plaiting", {status:"on", floor:"5 · galeria 502", url:"https://www.moma.org/collection/works/80393"}],
  ["moma-redstudio", {status:"on", floor:"5 · galeria 506", url:"https://www.moma.org/collection/works/78389"}],
  ["moma-brancusi", {status:"on", year:"1928", floor:"5 · galeria 508", url:"https://www.moma.org/collection/works/81033"}],
  ["moma-hope", {status:"on", floor:"5", url:"https://www.moma.org/collection/works/79792"}]
].forEach(([id, patch]) => updateMuseumWork("moma", id, {...patch, sourceNote:"MoMA · On view · weryfikacja 15.08.2026"}));

addMuseumWorks("moma", [
  {
    id:"moma-brancusi-endless-column", artist:"Constantin Brancusi", title:"Niekończąca się kolumna, wersja I", year:"1918",
    floor:"5 · galeria 508", section:"rzeźba nowoczesna", priority:"must", status:"on", pendingImageNumber:268,
    why:"Moduł o kształcie podwójnej piramidy może być powtarzany bez końca; cokół przestaje być dodatkiem i sam staje się rzeźbą.",
    look:"Śledź rytm zwężeń i rozszerzeń od podłogi ku górze. Wyobraź sobie, że ten sam moduł trwa poza fizycznym końcem obiektu.",
    url:"https://www.moma.org/collection/works/81729", sourceNote:"MoMA · On view · galeria 508 · weryfikacja 15.08.2026"
  },
  {
    id:"moma-brancusi-newborn", artist:"Constantin Brancusi", title:"Noworodek, wersja I", year:"1920",
    floor:"5 · galeria 508", section:"rzeźba nowoczesna", priority:"good", status:"on", pendingImageNumber:269,
    why:"Brancusi redukuje głowę i pierwszy krzyk do wypolerowanego owalu przeciętego otwartymi ustami — minimum formy niesie maksimum skojarzeń.",
    look:"Obejdź rzeźbę i obserwuj, jak odbicia zmieniają jej kształt. Zwróć uwagę, że cięcie ust jest zarazem pustką i najważniejszym gestem.",
    url:"https://www.moma.org/collection/works/81655", sourceNote:"MoMA · On view · galeria 508 · weryfikacja 15.08.2026"
  }
]);

// The Met: duży katalog bazuje na bieżącym wykazie galerii. Usuwamy trzy
// niepotwierdzone pozycje oraz Picassa, którego aktualna karta mówi Not on view.
const met = museumById("met");
if (met) {
  const removed = new Set(["met-manet", "met-bronzino", "met-seurat", "met-oa-489645"]);
  met.works = met.works.filter(work => !removed.has(work.id) && Number(work.objectId) !== 489645);
}

[
  ["met-hatshepsut", {status:"on", floor:"galeria 115", url:"https://www.metmuseum.org/art/collection/search/544449"}],
  ["met-gulf", {status:"on", floor:"galeria 767", url:"https://www.metmuseum.org/art/collection/search/11122"}],
  ["met-cassatt", {status:"on", floor:"galeria 768", url:"https://www.metmuseum.org/art/collection/search/10425"}],
  ["met-caravaggio", {status:"on", floor:"galeria 620", url:"https://www.metmuseum.org/art/collection/search/437986"}],
  ["met-duccio", {status:"on", floor:"galeria 635", objectId:438754, url:"https://www.metmuseum.org/art/collection/search/438754"}],
  ["met-vangogh-irises", {status:"on", floor:"galeria 099", url:"https://www.metmuseum.org/art/collection/search/436528"}],
  ["met-klimt", {status:"on", floor:"galeria 800", url:"https://www.metmuseum.org/art/collection/search/436819"}],
  ["met-tiffany", {status:"on", floor:"galeria 700", objectId:282, url:"https://www.metmuseum.org/art/collection/search/282"}]
].forEach(([id, patch]) => updateMuseumWork("met", id, {...patch, sourceNote:"The Met · On view · weryfikacja 15.08.2026"}));

// Guggenheim: oficjalny filtr On View in New York jest whitelistą. Pozostawiamy
// istniejące karty, które dokładnie odpowiadają wykazowi, i dokładamy wybrane
// dzieła już obecnych w aplikacji artystów.
retainMuseumWorks("guggenheim", [
  "gugg-circles", "gugg-yellowcow", "gugg-ironing", "gugg-malevich", "gugg-renoir",
  "gugg-gauguin-vanilla", "gugg-pissarro-hermitage", "gugg-braque-antwerp",
  "gugg-kandinsky-factory", "gugg-kandinsky-white-border", "gugg-picasso-moulin",
  "gugg-warhol-orange-disaster-5", "gugg-lichtenstein-entablature",
  "gugg-kusama-no-2-jb", "gugg-kusama-dancing-lights"
]);

[
  ["gugg-circles",1992], ["gugg-yellowcow",2760], ["gugg-ironing",3417],
  ["gugg-malevich",2598], ["gugg-renoir",3699], ["gugg-gauguin-vanilla",1413],
  ["gugg-pissarro-hermitage",3465], ["gugg-braque-antwerp",671],
  ["gugg-kandinsky-factory",1853], ["gugg-kandinsky-white-border",1867],
  ["gugg-picasso-moulin",3411]
].forEach(([id, artworkId]) => updateMuseumWork("guggenheim", id, {
  status:"on", floor:"Tower 2 · sprawdź etykietę", url:`https://www.guggenheim.org/artwork/${artworkId}`,
  sourceNote:"Guggenheim · On View in New York · weryfikacja 15.08.2026"
}));

addMuseumWorks("guggenheim", [
  {id:"gugg-cezanne-bibemus",artist:"Paul Cézanne",title:"Bibémus",year:"ok. 1894–95",floor:"Tower 2 · sprawdź etykietę",section:"Thannhauser Collection",priority:"must",status:"on",pendingImageNumber:274,why:"Kamieniołom staje się konstrukcją z płaszczyzn ochry, zieleni i błękitu, w której natura prowadzi ku kubizmowi.",look:"Porównaj krawędzie skał z pionami drzew. Zobacz, jak kolor buduje bryłę bez tradycyjnego światłocienia.",url:"https://www.guggenheim.org/artwork/785"},
  {id:"gugg-cezanne-peaches",artist:"Paul Cézanne",title:"Martwa natura: talerz z brzoskwiniami",year:"1879–80",floor:"Tower 2 · sprawdź etykietę",section:"Thannhauser Collection",priority:"good",status:"on",pendingImageNumber:275,why:"Pozornie prosty stół staje się laboratorium wielu punktów widzenia i relacji między ciężarem owoców, tkaniną oraz naczyniami.",look:"Sprawdź, czy krawędzie stołu i talerza naprawdę zgadzają się w jednej perspektywie. Celowe przesunięcia utrzymują obraz w napięciu.",url:"https://www.guggenheim.org/artwork/782"},
  {id:"gugg-cezanne-flask",artist:"Paul Cézanne",title:"Martwa natura: flaszka, szklanka i dzban",year:"ok. 1877",floor:"Tower 2 · sprawdź etykietę",section:"Thannhauser Collection",priority:"good",status:"on",pendingImageNumber:276,why:"Cézanne porządkuje codzienne naczynia jak architekturę, badając równowagę pionów, elips i gęstych plam koloru.",look:"Porównaj elipsy naczyń i odstępy między nimi. Zobacz, jak puste tło działa równie mocno jak same przedmioty.",url:"https://www.guggenheim.org/artwork/781"},
  {id:"gugg-kandinsky-sancta-francisca",artist:"Vasily Kandinsky",title:"Sancta Francisca",year:"1911",floor:"Tower 2 · sprawdź etykietę",section:"Modern European Currents",priority:"good",status:"on",pendingImageNumber:277,why:"Motyw religijny rozpada się na świetliste pola i rytm linii, pokazując moment przejścia Kandinsky’ego od figury do abstrakcji.",look:"Spróbuj odnaleźć postać, zanim skupisz się na autonomicznym ruchu barw. Zobacz, co pozostaje z narracji bez czytelnego konturu.",url:"https://www.guggenheim.org/artwork/1856"},
  {id:"gugg-kandinsky-lion-hunt",artist:"Vasily Kandinsky",title:"Polowanie na lwa",year:"1907",floor:"Tower 2 · sprawdź etykietę",section:"Modern European Currents",priority:"good",status:"on",pendingImageNumber:278,why:"Baśniowa scena pokazuje, jak ludowy ornament i intensywny kolor przygotowywały Kandinsky’ego do porzucenia naturalizmu.",look:"Najpierw odczytaj jeźdźców i zwierzę, potem potraktuj obraz jak układ kolorowych plam i rytmicznych kierunków.",url:"https://www.guggenheim.org/artwork/1859"},
  {id:"gugg-kandinsky-winter-church",artist:"Vasily Kandinsky",title:"Zimowy pejzaż z kościołem",year:"1910",floor:"Tower 2 · sprawdź etykietę",section:"Modern European Currents",priority:"must",status:"on",pendingImageNumber:279,why:"Śnieg nie jest biały, lecz staje się polem różów, błękitów i żółci; pejzaż działa jak emocjonalna kompozycja barwna.",look:"Odnajdź kościół i drogę, a potem zobacz, jak kolory odrywają się od przedmiotów i zaczynają prowadzić własny rytm.",url:"https://www.guggenheim.org/artwork/1851"},
  {id:"gugg-kandinsky-rolling-hills",artist:"Vasily Kandinsky",title:"Pejzaż z falującymi wzgórzami",year:"1909",floor:"Tower 2 · sprawdź etykietę",section:"Modern European Currents",priority:"good",status:"on",pendingImageNumber:280,why:"Falujące pasma krajobrazu zamieniają naturę w niemal muzyczny układ kolorów, zanim artysta całkowicie przejdzie do abstrakcji.",look:"Śledź kolejne pasy od pierwszego planu po niebo. Zwróć uwagę, jak małe domy dają skalę ogromnym plamom barwy.",url:"https://www.guggenheim.org/artwork/1852"},
  {id:"gugg-kandinsky-landscape-tower",artist:"Vasily Kandinsky",title:"Studium do Pejzażu z wieżą",year:"1908",floor:"Tower 2 · sprawdź etykietę",section:"Modern European Currents",priority:"good",status:"on",pendingImageNumber:281,why:"Szybkie studium ujawnia proces upraszczania widoku do kierunków, kontrastów i znaków, z których narodzi się abstrakcja.",look:"Znajdź wieżę, a potem policz, jak niewiele informacji potrzebujesz, by nadal odczytywać całość jako krajobraz.",url:"https://www.guggenheim.org/artwork/1843"},
  {id:"gugg-picasso-bird-tree",artist:"Pablo Picasso",title:"Ptak na drzewie",year:"1928",floor:"Tower 2 · sprawdź etykietę",section:"Thannhauser Collection",priority:"good",status:"on",pendingImageNumber:282,why:"Picasso redukuje naturę do napiętej konstrukcji biomorficznych znaków, łącząc lekkość rysunku z niepokojącą deformacją.",look:"Odnajdź ptaka i gałęzie, a potem zobacz, gdzie organizm zmienia się w abstrakcyjny symbol.",url:"https://www.guggenheim.org/artwork/3444"},
  {id:"gugg-picasso-fourteenth-july",artist:"Pablo Picasso",title:"Czternasty lipca",year:"1919",floor:"Tower 2 · sprawdź etykietę",section:"Thannhauser Collection",priority:"good",status:"on",pendingImageNumber:283,why:"Powojenny Paryż zostaje zbudowany z migotliwych, nakładających się form, w których święto miasta miesza się z kubistyczną konstrukcją.",look:"Szukaj flag i elementów architektury. Zwróć uwagę, jak drobne fragmenty tworzą wrażenie tłumu i ruchu bez jednej sceny.",url:"https://www.guggenheim.org/artwork/3414"},
  {id:"gugg-marc-white-bull",artist:"Franz Marc",title:"Biały byk",year:"1911",floor:"Tower 2 · sprawdź etykietę",section:"Modern European Currents",priority:"must",status:"on",pendingImageNumber:284,why:"Marc nadaje zwierzęciu monumentalny spokój, traktując jego ciało jak czystą, duchową formę wtopioną w krajobraz.",look:"Porównaj łuk grzbietu z liniami wzgórz. Zobacz, jak biel oddziela byka od otoczenia, a jednocześnie z nim harmonizuje.",url:"https://www.guggenheim.org/artwork/2761"},
  {id:"gugg-manet-striped-dress",artist:"Édouard Manet",title:"Kobieta w pasiastej sukni",year:"ok. 1877–80",floor:"Tower 2 · sprawdź etykietę",section:"Thannhauser Collection",priority:"good",status:"on",pendingImageNumber:285,why:"Manet zestawia modny strój z luźnym, niemal szkicowym malowaniem, dzięki czemu portret pozostaje jednocześnie elegancki i nowoczesny.",look:"Porównaj regularny rytm pasów z miękką twarzą i swobodnym tłem. Z bliska sprawdź, jak niewiele pociągnięć buduje materiał.",url:"https://www.guggenheim.org/artwork/2610"},
  {id:"gugg-vangogh-snow",artist:"Vincent van Gogh",title:"Pejzaż ze śniegiem",year:"1888",floor:"Tower 2 · sprawdź etykietę",section:"Thannhauser Collection",priority:"must",status:"on",pendingImageNumber:286,why:"Jeden z pierwszych pejzaży z Arles pokazuje, jak Van Gogh zmienia zimowe pole w rytm ukośnych bruzd i delikatnych, nieoczywistych kolorów.",look:"Śledź drogę i bruzdy prowadzące w głąb. Zobacz błękity, róże i zielenie ukryte w pozornie białym śniegu.",url:"https://www.guggenheim.org/artwork/1486"},
  {id:"gugg-vangogh-underpass",artist:"Vincent van Gogh",title:"Droga z wiaduktem",year:"1887",floor:"Tower 2 · sprawdź etykietę",section:"Thannhauser Collection",priority:"good",status:"on",pendingImageNumber:287,why:"Podmiejska infrastruktura staje się dynamicznym pejzażem, w którym droga, nasyp i niebo spotykają się w mocnych kierunkach.",look:"Zobacz, jak łuk wiaduktu kadruje drogę. Porównaj szybkie pociągnięcia roślinności z ciężką geometrią konstrukcji.",url:"https://www.guggenheim.org/artwork/1483"}
].map(work => ({...work, sourceNote:"Guggenheim · On View in New York · weryfikacja 15.08.2026"})));

// Whitney: wizytę 27.08 budujemy na trzech wystawach trwających tego dnia:
// „Untitled” (America), Andy Warhol: Family Album i Mabel Dwight.
retainMuseumWorks("whitney", [
  "whitney-early", "whitney-summerdays", "whitney-white-calico", "whitney-okeeffe-blue-green",
  "whitney-second-story", "whitney-threeflags", "whitney-subway", "whitney-queerfish",
  "whitney-war", "whitney-motley", "whitney-warhol-ethel", "whitney-warhol-family"
]);

[
  ["whitney-early",46345,7], ["whitney-summerdays",7539,7], ["whitney-white-calico",1767,7],
  ["whitney-okeeffe-blue-green",415,7], ["whitney-second-story",873,7], ["whitney-threeflags",1060,7],
  ["whitney-subway",3052,7], ["whitney-war",2118,7], ["whitney-motley",47460,7],
  ["whitney-warhol-ethel",6131,7]
].forEach(([id, artworkId, floor]) => updateMuseumWork("whitney", id, {
  status:"on", floor:String(floor), url:`https://whitney.org/collection/works/${artworkId}`,
  sourceNote:"Whitney · On view · weryfikacja 15.08.2026"
}));

updateMuseumWork("whitney", "whitney-queerfish", {
  title:"Aquarium", year:"1928", status:"on", floor:"3", url:"https://whitney.org/collection/works/4085",
  why:"Dwight odwraca spojrzenie w akwarium: zbity tłum widzów sam zaczyna przypominać obserwowaną kolekcję osobliwych stworzeń.",
  look:"Porównaj twarze ludzi z rybami i sprawdź, kto właściwie jest wystawiony na pokaz. Zwróć uwagę na ciasny, satyryczny kadr.",
  sourceNote:"Whitney · Mabel Dwight: Cool Head, Warm Heart · On view, piętro 3 · weryfikacja 15.08.2026"
});
updateMuseumWork("whitney", "whitney-war", {title:"The War Series · 7 paneli na ekspozycji", status:"on", floor:"7", url:"https://whitney.org/collection/works/2118", sourceNote:"Whitney · On view · 7 paneli serii · weryfikacja 15.08.2026"});
updateMuseumWork("whitney", "whitney-warhol-family", {status:"on", floor:"7", url:"https://whitney.org/exhibitions/andy-warhol-family-album", sourceNote:"Whitney · wystawa do 19.10.2026 · weryfikacja 15.08.2026"});

addMuseumWorks("whitney", [
  {id:"whitney-hopper-seven-am",artist:"Edward Hopper",title:"Seven A.M.",year:"1948",floor:"7",section:"„Untitled” (America)",priority:"must",status:"on",pendingImageNumber:288,why:"Pusty sklep i jasny skraj lasu tworzą scenę oczekiwania, w której dokładna godzina nie wyjaśnia, co wydarzyło się przed chwilą ani co ma nadejść.",look:"Porównaj prostokąty witryny, zegara i jasnej ściany z organiczną ciemnością drzew. Sprawdź, gdzie wzrok zatrzymuje się najdłużej.",url:"https://whitney.org/collection/works/732"},
  {id:"whitney-johns-racing-thoughts",artist:"Jasper Johns",title:"Racing Thoughts",year:"1983",floor:"7",section:"„Untitled” (America)",priority:"must",status:"on",pendingImageNumber:289,why:"Johns skleja cytaty z historii sztuki, przedmioty pracowni i fragmenty własnego życia w obraz o pamięci działającej przez skojarzenia.",look:"Rozpoznaj wannę, spodnie, naczynia i fragment Mona Lisy. Zobacz, jak sznur i krawędzie dzielą obraz na konkurujące wspomnienia.",url:"https://whitney.org/collection/works/165"},
  {id:"whitney-johns-painted-bronze",artist:"Jasper Johns",title:"Painted Bronze",year:"1960 · odlew 1964",floor:"7",section:"„Untitled” (America)",priority:"must",status:"on",pendingImageNumber:290,why:"Dwie puszki po piwie wyglądają jak zwykły odpad, lecz są ciężkim, ręcznie malowanym brązem — dowcipem o oryginale, kopii i wartości sztuki.",look:"Szukaj różnic między puszkami i śladów ręcznego malowania. Wyobraź sobie ich ciężar, zanim przeczytasz materiał na etykiecie.",url:"https://whitney.org/collection/works/63528"},
  {id:"whitney-dwight-toy-shop",artist:"Mabel Dwight",title:"Toy Shop Window",year:"1927",floor:"3",section:"Mabel Dwight: Cool Head, Warm Heart",priority:"good",status:"on",pendingImageNumber:291,why:"Witryna z zabawkami pozwala Dwight połączyć dziecięcą ciekawość z miejskim spektaklem oglądania i bycia oglądanym.",look:"Przenieś wzrok między szybą, zabawkami i odbiorcami. Zobacz, jak witryna tworzy scenę w scenie.",url:"https://whitney.org/collection/works/10567"},
  {id:"whitney-dwight-brothers",artist:"Mabel Dwight",title:"Brothers",year:"1928",floor:"3",section:"Mabel Dwight: Cool Head, Warm Heart",priority:"must",status:"on",pendingImageNumber:292,why:"Małpy za kratami i obserwujący je ludzie zostają zestawieni tak, że tytuł podważa wygodną granicę między widzem a eksponatem.",look:"Porównaj pozy i twarze po obu stronach krat. Zdecyduj, która grupa zachowuje się bardziej jak widowisko.",url:"https://whitney.org/collection/works/4086"},
  {id:"whitney-dwight-clinch",artist:"Mabel Dwight",title:"The Clinch, Movie Theatre",year:"1928",floor:"3",section:"Mabel Dwight: Cool Head, Warm Heart",priority:"must",status:"on",pendingImageNumber:293,why:"Ekranowy pocałunek i reakcje publiczności tworzą podwójny spektakl — satyrę na masowe emocje produkowane przez kino.",look:"Najpierw obejrzyj scenę na ekranie, potem każdą twarz widza. Zwróć uwagę na snop projektora łączący oba światy.",url:"https://whitney.org/collection/works/4087"},
  {id:"whitney-dwight-mechano",artist:"Mabel Dwight",title:"Mechano, Wonder of the World",year:"1928",floor:"3",section:"Mabel Dwight: Cool Head, Warm Heart",priority:"good",status:"on",pendingImageNumber:294,why:"Vaudeville’owy cud techniki staje się komicznym obrazem publiczności gotowej uwierzyć w każde sprawnie sprzedane widowisko.",look:"Porównaj teatralną prezentację z twarzami widzów. Szukaj drobnych gestów, którymi Dwight buduje ironię.",url:"https://whitney.org/collection/works/4091"},
  {id:"whitney-dwight-self-portrait",artist:"Mabel Dwight",title:"Self-Portrait",year:"1932",floor:"3",section:"Mabel Dwight: Cool Head, Warm Heart",priority:"good",status:"on",pendingImageNumber:295,why:"Artystka pokazuje siebie bez heroizacji: skupioną, dojrzałą kobietę przy pracy, która dopiero po pięćdziesiątce znalazła właściwe medium.",look:"Zwróć uwagę na okulary, narzędzie i bezpośrednie spojrzenie. Porównaj spokojną pozę z energią kreskowania.",url:"https://whitney.org/collection/works/4093"},
  {id:"whitney-dwight-merchants",artist:"Mabel Dwight",title:"Merchants of Death",year:"1935",floor:"3",section:"Mabel Dwight: Cool Head, Warm Heart",priority:"must",status:"on",pendingImageNumber:296,why:"Antywojenna procesja szkieletu, biznesmenów i sępów zamienia polityczny protest w czytelną, gorzką groteskę.",look:"Idź od szkieletu-perkusisty wzdłuż pochodu. Zobacz, jak rytm marszu łączy humor karykatury z realnym zagrożeniem.",url:"https://whitney.org/collection/works/10571"},
  {id:"whitney-warhol-green-coke",artist:"Andy Warhol",title:"Green Coca-Cola Bottles",year:"1962",floor:"7",section:"„Untitled” (America)",priority:"must",status:"on",pendingImageNumber:297,why:"Siatka butelek wygląda jak mechaniczna produkcja, lecz różnice w odbitkach ujawniają ręczną pracę i napięcie między masowością a indywidualnością.",look:"Porównaj kolejne butelki: przesunięcia i różna siła czerni łamią regularność. Zobacz, gdzie logo zastępuje podpis artysty.",url:"https://whitney.org/collection/works/3253"},
  {id:"whitney-lichtenstein-crystal-bowl",artist:"Roy Lichtenstein",title:"Still Life with Crystal Bowl",year:"1972",floor:"7",section:"„Untitled” (America)",priority:"must",status:"on",pendingImageNumber:298,why:"Klasyczna martwa natura zostaje przepuszczona przez język komiksu, reklamy i dekoracyjnego druku, przez co znajomy gatunek staje się chłodnym znakiem.",look:"Porównaj raster, płaskie kontury i imitację połysku kryształu. Sprawdź, co w tym obrazie udaje przestrzeń, a co otwarcie pozostaje wzorem.",url:"https://whitney.org/collection/works/1501"}
].map(work => ({...work, sourceNote:"Whitney · On view · weryfikacja 15.08.2026"})));

MUSEUMS.forEach(museum => {
  museum.works.forEach(work => {
    if (work.pendingImageNumber) {
      work.image = `assets/photos/${work.pendingImageNumber}.jpg`;
    }
    if (!work.url && museum.id === "met" && work.objectId) {
      work.url = `https://www.metmuseum.org/art/collection/search/${work.objectId}`;
    }
    if (!work.url && museum.id === "met") {
      work.url = `https://www.metmuseum.org/art/collection/search?q=${encodeURIComponent(`${work.artist} ${work.title}`)}`;
    }
    if (!work.url && museum.id === "moma") {
      work.url = `https://www.moma.org/collection/?q=${encodeURIComponent(`${work.artist} ${work.title}`)}`;
    }
    if (!work.url && museum.id === "guggenheim") {
      work.url = `https://www.guggenheim.org/artwork?query=${encodeURIComponent(`${work.artist} ${work.title}`)}`;
    }
    if (!work.url && museum.id === "whitney") {
      work.url = `https://whitney.org/collection/works?q%5Bsearch_cont%5D=${encodeURIComponent(`${work.artist} ${work.title}`)}&q%5Bon_view_true%5D=1`;
    }
    if (work.status === "on" && !work.sourceNote) work.sourceNote = "Oficjalny katalog muzeum · On view · stan 15.08.2026";
  });
  museum.focusArtists = MUSEUM_FOCUS_ARTISTS.filter(artist => museum.works.some(work => work.artist === artist));
});

Object.assign(moma, {statusNote:"Globalny audyt On view 15.08.2026. Katalog zawiera tylko dzieła potwierdzone na ekspozycji; układ sal może się zmienić przed wizytą."});
Object.assign(met, {statusNote:"Globalny audyt On view 15.08.2026. Zachowano dzieła z aktualnymi numerami galerii; pozycje niepotwierdzone usunięto."});
Object.assign(museumById("guggenheim"), {statusNote:"Katalog oparty wyłącznie na oficjalnym filtrze On View in New York i wystawie Guggenheim Pop, sprawdzonych 15.08.2026."});
Object.assign(museumById("whitney"), {statusNote:"Stan na wizytę 27.08.2026: „Untitled” (America), Andy Warhol: Family Album oraz Mabel Dwight: Cool Head, Warm Heart."});
