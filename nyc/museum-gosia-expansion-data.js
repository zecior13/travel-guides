// Rozszerzenie katalogu wybrane przez Gosię.
// Zasada tej paczki: wyłącznie dzieła oficjalnie oznaczone jako „On view”
// w dniu weryfikacji 15.08.2026. Dzieł z magazynu nie dodajemy.

const GOSIA_EXPANSION_ARTISTS = [
  "J.M.W. Turner", "Leonardo da Vinci", "Sandro Botticelli", "Rafael",
  "Tycjan", "Peter Paul Rubens", "Francisco Goya", "Giotto",
  "René Magritte", "Joan Miró", "Roy Lichtenstein", "Yayoi Kusama"
];

const GOSIA_ARTIST_GUIDANCE = {
  "J.M.W. Turner": {
    why: "Turner rozpuścił pejzaż w świetle, powietrzu i kolorze, przygotowując drogę od romantyzmu ku nowoczesnemu malarstwu.",
    look: "Najpierw znajdź horyzont i największe źródło światła. Potem zobacz, gdzie architektura przestaje być bryłą, a staje się mgłą i odbiciem."
  },
  "Leonardo da Vinci": {
    why: "Leonardo łączył obserwację natury, anatomię i inżynierię z malarstwem, w którym gest oraz spojrzenie budują złożoną relację między postaciami.",
    look: "Obserwuj miękkie przejścia światła, układ dłoni i spojrzeń oraz sposób, w jaki ciało Dzieciątka łączy figury w jeden ruch."
  },
  "Sandro Botticelli": {
    why: "Botticelli nadawał opowieściom religijnym i mitologicznym linearną elegancję: kontur, rytm fałd i gest bywają ważniejsze niż pełna iluzja przestrzeni.",
    look: "Śledź płynne kontury sylwetek i tkanin. Zobacz, jak niewielki gest dłoni albo kierunek spojrzenia prowadzi całą narrację."
  },
  "Rafael": {
    why: "Rafael stał się wzorem harmonii dojrzałego renesansu, łącząc czytelną kompozycję, łagodną psychologię i idealizowane piękno.",
    look: "Sprawdź, jak figury układają się w stabilny trójkąt lub symetrię, a spojrzenia i gesty ożywiają tę pozornie spokojną konstrukcję."
  },
  "Tycjan": {
    why: "Tycjan budował formę przede wszystkim kolorem i światłem; jego weneckie malarstwo wpłynęło na kolejne pokolenia od Rubensa po impresjonistów.",
    look: "Porównaj ciepłe czerwienie i odcienie skóry z chłodniejszym tłem. Podejdź bliżej, aby zobaczyć, jak kolor zastępuje twardy kontur."
  },
  "Peter Paul Rubens": {
    why: "Rubens połączył sztukę włoskiego renesansu z barokowym ruchem, cielesnością i dramatem, tworząc kompozycje o niemal fizycznej energii.",
    look: "Szukaj przekątnych, skrętów ciał i kontrastów światła. Zobacz, jak wiele osobnych gestów składa się na jeden gwałtowny ruch."
  },
  "Francisco Goya": {
    why: "Goya przeszedł od wyrafinowanego portretu dworskiego do bezlitosnej obserwacji przemocy, przesądu i ludzkiej samotności, otwierając drogę sztuce nowoczesnej.",
    look: "Najpierw odczytaj pozycję społeczną z ubrania i rekwizytów, a potem skup się na twarzy: Goya często pozwala psychologii przeczyć oficjalnemu wizerunkowi."
  },
  "Giotto": {
    why: "Giotto zerwał z płaską, hieratyczną tradycją, nadając postaciom ciężar, przestrzeń i czytelne emocje — dlatego bywa uznawany za jednego z ojców malarstwa zachodniego.",
    look: "Zobacz, jak prosta architektura buduje głębię, a gesty i spojrzenia prowadzą od jednej postaci do następnej jak w scenie teatralnej."
  },
  "René Magritte": {
    why: "Magritte używał realistycznego stylu do przedstawiania rzeczy niemożliwych, podważając zaufanie do obrazu, języka i codziennej logiki.",
    look: "Nazwij zwyczajne elementy, a potem wskaż jedną rzecz, która łamie ich logikę. Nie szukaj symbolicznego hasła — pozwól zagadce pozostać nierozwiązaną."
  },
  "Joan Miró": {
    why: "Miró stworzył osobisty alfabet znaków na granicy rysunku, abstrakcji i surrealizmu, łącząc spontaniczny gest z bardzo świadomą kompozycją.",
    look: "Odnajdź znaki przypominające oczy, gwiazdy, ptaki lub ciało. Potem zobacz, jak cienkie linie i puste pole utrzymują między nimi napięcie."
  },
  "Roy Lichtenstein": {
    why: "Lichtenstein przeniósł język komiksu i druku reklamowego do malarstwa, ręcznie rekonstruując mechaniczny raster i badając granicę między kopią a oryginałem.",
    look: "Podejdź do kropek, konturów i powtarzalnego ornamentu, a potem odejdź. Sprawdź, kiedy ręcznie wykonany obraz zaczyna wyglądać jak przemysłowy druk."
  },
  "Yayoi Kusama": {
    why: "Kusama zamienia obsesyjnie powtarzany punkt i odbicie w doświadczenie bez granic, łącząc malarstwo, rzeźbę, performans i instalację immersyjną.",
    look: "Nie skupiaj się tylko na efekcie do zdjęcia. Zobacz, jak powtórzenie zmienia skalę, poczucie czasu i granicę między własnym ciałem a przestrzenią."
  }
};

Object.assign(ARTIST_GUIDANCE, GOSIA_ARTIST_GUIDANCE);

const GOSIA_ON_VIEW_WORKS = {
  met: [
    {
      id: "met-turner-venice-salute", objectId: 437853,
      artist: "J.M.W. Turner", title: "Wenecja widziana z portyku Santa Maria della Salute", year: "ok. 1835",
      floor: "galeria 808", section: "malarstwo europejskie", priority: "must", status: "on", pendingImageNumber: 249,
      why: "Jedna z najbardziej radykalnych weneckich wizji Turnera: miasto niemal znika w złotym świetle, wodzie i atmosferze.",
      look: "Znajdź kopułę i linię nabrzeża, a potem zobacz, jak niewiele stabilnych kształtów wystarcza, by zbudować całe miasto.",
      url: "https://www.metmuseum.org/art/collection/search/437853", sourceNote: "The Met · On view · weryfikacja 15.08.2026"
    },
    {
      id: "met-leonardo-yarnwinder", objectId: 941909,
      artist: "Leonardo da Vinci", title: "Madonna z wrzecionem (Lansdowne Madonna) · Leonardo i pracownia", year: "ok. 1501",
      floor: "galeria 609", section: "malarstwo europejskie", priority: "must", status: "on", pendingImageNumber: 250,
      why: "Obraz opiera się na kompozycji Leonarda i pokazuje typową dla niego złożoną relację gestów: dziecko obejmuje wrzeciono zapowiadające krzyż, a Maria próbuje je powstrzymać.",
      look: "Prześledź spiralny ruch od twarzy Marii przez jej rękę do ciała Dzieciątka i wrzeciona. Zwróć uwagę na mglisty krajobraz w oddali.",
      url: "https://www.metmuseum.org/art/collection/search/941909", sourceNote: "The Met · On view · wypożyczenie · weryfikacja 15.08.2026"
    },
    {
      id: "met-botticelli-annunciation", objectId: 459016,
      artist: "Sandro Botticelli", title: "Zwiastowanie", year: "ok. 1490",
      floor: "galeria 952", section: "malarstwo europejskie", priority: "must", status: "on", pendingImageNumber: 251,
      why: "Botticelli buduje napięcie niemal wyłącznie linią: wygięte postacie, płynne szaty i pustka pomiędzy nimi zatrzymują chwilę spotkania.",
      look: "Zobacz, jak dłonie Gabriela i Marii zbliżają się do siebie, choć postacie pozostają rozdzielone. Prześledź rytm skrzydeł i fałd.",
      url: "https://www.metmuseum.org/art/collection/search/459016", sourceNote: "The Met · On view · weryfikacja 15.08.2026"
    },
    {
      id: "met-botticelli-jerome", objectId: 435728,
      artist: "Sandro Botticelli", title: "Ostatnia komunia świętego Hieronima", year: "pocz. lat 1490.",
      floor: "galeria 604", section: "malarstwo europejskie", priority: "good", status: "on", pendingImageNumber: 252,
      why: "Niewielki obraz zmienia publiczną ceremonię w skupioną scenę kruchości, starości i pożegnania.",
      look: "Skup się na wychudzonym ciele Hieronima i troskliwych gestach otaczających go mnichów. Zobacz, jak ciasny kadr wzmacnia intymność.",
      url: "https://www.metmuseum.org/art/collection/search/435728", sourceNote: "The Met · On view · weryfikacja 15.08.2026"
    },
    {
      id: "met-raphael-madonna-saints", objectId: 437372,
      artist: "Rafael", title: "Madonna z Dzieciątkiem na tronie i świętymi", year: "ok. 1504",
      floor: "galeria 609", section: "malarstwo europejskie", priority: "must", status: "on", pendingImageNumber: 253,
      why: "Wczesny Rafael łączy tradycję obrazu ołtarzowego z wyjątkową równowagą: każda figura ma wyraźne miejsce, ale grupa nie jest sztywna.",
      look: "Odczytaj pionową oś tronu, a potem porównaj spojrzenia i gesty świętych. Zobacz, jak spokojna geometria porządkuje emocje.",
      url: "https://www.metmuseum.org/art/collection/search/437372", sourceNote: "The Met · On view · weryfikacja 15.08.2026"
    },
    {
      id: "met-raphael-agony", objectId: 437371,
      artist: "Rafael", title: "Modlitwa w Ogrójcu", year: "ok. 1504",
      floor: "galeria 609", section: "malarstwo europejskie", priority: "good", status: "on", pendingImageNumber: 254,
      why: "Mały panel pokazuje talent Rafaela do klarownej narracji: samotna modlitwa Chrystusa i sen apostołów tworzą dwa emocjonalne poziomy tej samej sceny.",
      look: "Porównaj wzniesioną sylwetkę Chrystusa ze skulonymi postaciami uczniów. Zobacz, jak pejzaż oddziela, ale też łączy oba plany.",
      url: "https://www.metmuseum.org/art/collection/search/437371", sourceNote: "The Met · On view · weryfikacja 15.08.2026"
    },
    {
      id: "met-titian-madonna-child", objectId: 437824,
      artist: "Tycjan", title: "Madonna z Dzieciątkiem", year: "ok. 1508",
      floor: "galeria 608", section: "malarstwo europejskie", priority: "must", status: "on", pendingImageNumber: 255,
      why: "Młody Tycjan zastępuje linearną precyzję miękkim kolorem i świetlistą materią, nadając religijnej scenie cielesną bliskość.",
      look: "Porównaj ciepło skóry i czerwieni z chłodniejszym pejzażem. Zobacz, jak dotyk i ciężar ciała budują relację matki z dzieckiem.",
      url: "https://www.metmuseum.org/art/collection/search/437824", sourceNote: "The Met · On view · weryfikacja 15.08.2026"
    },
    {
      id: "met-rubens-wolf-fox-hunt", objectId: 437536,
      artist: "Peter Paul Rubens", title: "Polowanie na wilki i lisy · Rubens i pracownia", year: "ok. 1616",
      floor: "galeria 621", section: "malarstwo europejskie", priority: "must", status: "on", pendingImageNumber: 256,
      why: "Monumentalne polowanie jest barokową maszyną ruchu: ludzie, konie i zwierzęta splatają się w gwałtowną spiralę.",
      look: "Zacznij od centrum starcia i podążaj za przekątnymi włóczni, końskich nóg i skręconych ciał aż do krawędzi obrazu.",
      url: "https://www.metmuseum.org/art/collection/search/437536", sourceNote: "The Met · On view · weryfikacja 15.08.2026"
    },
    {
      id: "met-rubens-lot-daughters", objectId: 729898,
      artist: "Peter Paul Rubens", title: "Lot i jego córki", year: "ok. 1613–14",
      floor: "galeria 621", section: "malarstwo europejskie", priority: "good", status: "on", pendingImageNumber: 257,
      why: "Rubens przedstawia trudny biblijny temat poprzez zmysłową materię ciał, tkanin i naczyń, celowo pozostawiając widza w moralnym dyskomforcie.",
      look: "Zwróć uwagę, jak dłonie, kielich i kierunki spojrzeń ujawniają plan córek wcześniej niż sama poza Lota.",
      url: "https://www.metmuseum.org/art/collection/search/729898", sourceNote: "The Met · On view · weryfikacja 15.08.2026"
    },
    {
      id: "met-goya-martinez", objectId: 436541,
      artist: "Francisco Goya", title: "Sebastián Martínez y Pérez", year: "1792",
      floor: "galeria 641", section: "malarstwo europejskie", priority: "must", status: "on", pendingImageNumber: 258,
      why: "Portret przyjaciela Goi łączy reprezentacyjny strój z bezpośredniością spojrzenia, dzięki czemu model jest jednocześnie człowiekiem Oświecenia i konkretną osobą.",
      look: "Porównaj połysk zielonego jedwabiu z twarzą i dłońmi. Zobacz, jak książka i swobodna poza zmieniają oficjalny portret w rozmowę.",
      url: "https://www.metmuseum.org/art/collection/search/436541", sourceNote: "The Met · On view · weryfikacja 15.08.2026"
    },
    {
      id: "met-goya-altamira", objectId: 459090,
      artist: "Francisco Goya", title: "Hrabina Altamira z córką Maríą Agustiną", year: "1787–88",
      floor: "galeria 958", section: "malarstwo europejskie", priority: "good", status: "on", pendingImageNumber: 259,
      why: "Goya równoważy dworski splendor i domową intymność: kosztowny strój nie usuwa delikatnej, nieco niepewnej relacji matki i dziecka.",
      look: "Zobacz, jak pionowa poza matki kontrastuje z ruchem dziecka. Porównaj dekoracyjność tkanin z oszczędnie malowanym tłem.",
      url: "https://www.metmuseum.org/art/collection/search/459090", sourceNote: "The Met · On view · weryfikacja 15.08.2026"
    },
    {
      id: "met-giotto-adoration-magi", objectId: 436504,
      artist: "Giotto", title: "Pokłon Trzech Króli", year: "prawdopodobnie ok. 1320",
      floor: "galeria 601", section: "malarstwo europejskie", priority: "must", status: "on", pendingImageNumber: 260,
      why: "Giotto nadaje świętej historii fizyczną obecność: postacie zajmują wspólną przestrzeń, dotykają się i reagują na siebie czytelnymi gestami.",
      look: "Znajdź gest klęczącego króla i odpowiedź Dzieciątka. Zobacz, jak skała, stajenka i nakładające się figury tworzą prostą, ale przekonującą głębię.",
      url: "https://www.metmuseum.org/art/collection/search/436504", sourceNote: "The Met · On view · weryfikacja 15.08.2026"
    }
  ],
  moma: [
    {
      id: "moma-magritte-menaced-assassin", artist: "René Magritte", title: "Zagrożony zabójca (The Menaced Assassin)", year: "1927",
      floor: "5 · galeria 517", section: "surrealizm", priority: "must", status: "on", pendingImageNumber: 261,
      why: "Jeden z największych i najbardziej teatralnych obrazów Magritte’a zamienia kadr z kryminału Fantômas w nierozwiązywalną zagadkę.",
      look: "Policz obserwatorów i możliwe drogi ucieczki. Zobacz, że wszystkie elementy są czytelne, lecz ich wspólna historia pozostaje niemożliwa do ustalenia.",
      url: "https://www.moma.org/collection/works/79267", sourceNote: "MoMA · On view · weryfikacja 15.08.2026"
    },
    {
      id: "moma-magritte-lovers", artist: "René Magritte", title: "Kochankowie (The Lovers)", year: "1928",
      floor: "5 · galeria 517", section: "surrealizm", priority: "must", status: "on", pendingImageNumber: 262,
      why: "Pocałunek zostaje jednocześnie pokazany i zablokowany przez tkaninę, dlatego bliskość zmienia się w obraz izolacji i niespełnionego pragnienia.",
      look: "Porównaj czuły układ ciał z nieprzeniknioną barierą na twarzach. Zwróć uwagę na ciasny kadr i chłód tła.",
      url: "https://www.moma.org/collection/works/79933", sourceNote: "MoMA · On view · weryfikacja 15.08.2026"
    },
    {
      id: "moma-magritte-false-mirror", artist: "René Magritte", title: "Fałszywe zwierciadło (The False Mirror)", year: "1929",
      floor: "5 · galeria 517", section: "surrealizm", priority: "must", status: "on", pendingImageNumber: 263,
      why: "Ogromne oko jest jednocześnie narządem widzenia i niebem, które powinno się w nim odbijać — obraz pyta, czy patrzymy na świat, czy na własne przedstawienie świata.",
      look: "Zdecyduj, czy chmury znajdują się przed okiem, w oku, czy za nim. Zwróć uwagę na czarną źrenicę, która nie odbija niczego.",
      url: "https://www.moma.org/collection/works/78938", sourceNote: "MoMA · On view · weryfikacja 15.08.2026"
    },
    {
      id: "moma-magritte-portrait", artist: "René Magritte", title: "Portret (The Portrait)", year: "1935",
      floor: "5 · galeria 523", section: "surrealizm", priority: "good", status: "on", pendingImageNumber: 264,
      why: "Zwyczajny posiłek staje się niesamowity przez jedno oko spoglądające z plastra szynki; realistyczny styl wzmacnia absurd zamiast go oswajać.",
      look: "Najpierw obejrzyj obraz jak martwą naturę, potem sprawdź, w którym momencie spojrzenie z talerza odwraca role widza i oglądanego przedmiotu.",
      url: "https://www.moma.org/collection/works/79990", sourceNote: "MoMA · On view · weryfikacja 15.08.2026"
    },
    {
      id: "moma-miro-birth-world", artist: "Joan Miró", title: "Narodziny świata (The Birth of the World)", year: "1925",
      floor: "5 · galeria 517", section: "surrealizm", priority: "must", status: "on", pendingImageNumber: 265,
      why: "Miró najpierw rozlewał, rozcierał i rzucał farbę, a dopiero potem nanosił znaki; obraz łączy przypadek z precyzyjną decyzją.",
      look: "Szukaj latawca, spadającej gwiazdy i balonu. Porównaj plamy wsiąkające w płótno z cienkimi, ostrymi liniami położonymi na wierzchu.",
      url: "https://www.moma.org/collection/works/79321", sourceNote: "MoMA · On view · weryfikacja 15.08.2026"
    },
    {
      id: "moma-miro-self-portrait-1", artist: "Joan Miró", title: "Autoportret I", year: "1937–38",
      floor: "5 · galeria 523", section: "surrealizm", priority: "must", status: "on", pendingImageNumber: 266,
      why: "Powstały podczas wojny domowej w Hiszpanii autoportret rozbija twarz na halucynacyjną sieć znaków, pozostając jednocześnie mocnym potwierdzeniem własnej tożsamości.",
      look: "Odszukaj oczy i kontur głowy, a następnie zobacz, jak twarz niemal znika pod rytmem linii, kolorów i znaków.",
      url: "https://www.moma.org/collection/works/80604", sourceNote: "MoMA · On view · weryfikacja 15.08.2026"
    },
    {
      id: "moma-miro-moonbird", artist: "Joan Miró", title: "Księżycowy ptak (Moonbird)", year: "1966",
      floor: "ogród rzeźb", section: "rzeźba", priority: "good", status: "on", pendingImageNumber: 267,
      why: "Monumentalna figura przekłada malarski alfabet Miró na ciężką, organiczną bryłę, która jest jednocześnie ptakiem, postacią i fantastycznym znakiem.",
      look: "Obejdź rzeźbę i sprawdź, kiedy wyłania się dziób, oko albo nogi. Porównaj jej masę z lekkim, niemal dziecięcym skojarzeniem tytułu.",
      url: "https://www.moma.org/collection/works/81717", sourceNote: "MoMA · On view · weryfikacja 15.08.2026"
    }
  ],
  guggenheim: [
    {
      id: "gugg-warhol-orange-disaster-5", artist: "Andy Warhol", title: "Orange Disaster #5", year: "1963",
      floor: "T4/5/7 · sprawdź etykietę", section: "Guggenheim Pop: 1960 to Now", priority: "must", status: "on", pendingImageNumber: 270,
      why: "Powtarzany prasowy obraz krzesła elektrycznego pokazuje, jak mechaniczna reprodukcja może jednocześnie znieczulać na tragedię i czynić ją trudną do uniknięcia.",
      look: "Porównaj kolejne odbitki: szukaj przesunięć, zaników i miejsc, w których obraz staje się prawie abstrakcyjnym wzorem.",
      url: "https://www.guggenheim.org/artwork/4176", sourceNote: "Guggenheim · On View in New York · weryfikacja 15.08.2026"
    },
    {
      id: "gugg-lichtenstein-entablature", artist: "Roy Lichtenstein", title: "Entablature", year: "1976",
      floor: "T4/5/7 · sprawdź etykietę", section: "Guggenheim Pop: 1960 to Now", priority: "must", status: "on", pendingImageNumber: 271,
      why: "Lichtenstein potraktował klasyczny detal architektoniczny jak obraz z druku reklamowego, łącząc powagę muzealnego ornamentu z mechanicznym rastrem pop-artu.",
      look: "Zobacz, jak fryz, linie i kropki udają jednocześnie kamień, cień i druk. Porównaj monumentalność motywu z chłodną, seryjną techniką.",
      url: "https://www.guggenheim.org/artwork/2499", sourceNote: "Guggenheim · On View in New York · weryfikacja 15.08.2026"
    },
    {
      id: "gugg-kusama-no-2-jb", artist: "Yayoi Kusama", title: "No. 2. J.B.", year: "1960",
      floor: "T4/5/7 · sprawdź etykietę", section: "Guggenheim Pop: 1960 to Now", priority: "must", status: "on", pendingImageNumber: 272,
      why: "Wczesna Infinity Net pokazuje Kusamę przed pokojami lustrzanymi: tysiące drobnych, ręcznie powtarzanych łuków pochłaniają płótno i skalę obrazu.",
      look: "Podejdź blisko do nierównych, pojedynczych gestów, a potem odejdź, by zobaczyć bezkresną siatkę. Sprawdź, gdzie wzór zagęszcza się lub rozpada.",
      url: "https://www.guggenheim.org/artwork/30413", sourceNote: "Guggenheim · On View in New York · weryfikacja 15.08.2026"
    },
    {
      id: "gugg-kusama-dancing-lights", artist: "Yayoi Kusama", title: "INFINITY MIRRORED ROOM – DANCING LIGHTS THAT FLEW UP TO THE UNIVERSE", year: "2019",
      floor: "Guggenheim Pop · sprawdź kolejkę", section: "instalacja immersyjna", priority: "must", status: "on", pendingImageNumber: 273,
      why: "Lustra i pulsujące światła usuwają czytelną granicę pokoju, tworząc wrażenie przestrzeni większej od fizycznej instalacji.",
      look: "Po pierwszym efekcie nieskończoności znajdź własne odbicie i zobacz, jak ciało staje się jednym z powtarzanych elementów dzieła.",
      url: "https://www.guggenheim.org/exhibitions/frequently-asked-questions-yayoi-kusamas-infinity-mirrored-room-dancing-lights-that-flew-up-to-the-universe-2019",
      sourceNote: "Guggenheim Pop · On view do 10.01.2027 · weryfikacja 15.08.2026"
    }
  ]
};

Object.entries(GOSIA_ON_VIEW_WORKS).forEach(([museumId, works]) => addMuseumWorks(museumId, works));

GOSIA_EXPANSION_ARTISTS.forEach(artist => {
  if (!MUSEUM_FOCUS_ARTISTS.includes(artist)) MUSEUM_FOCUS_ARTISTS.push(artist);
});

Object.assign(ARTIST_PROFILES, {
  "J.M.W. Turner": {years:"1775–1851",style:"romantyzm, pejzaż",breakthrough:"Uczynił światło, pogodę i atmosferę głównym tematem obrazu, doprowadzając pejzaż na granicę abstrakcji.",origin:"Londyn · Wielka Brytania",bio:"Brytyjski malarz i akwarelista, niestrudzony podróżnik oraz obserwator morza, przemysłu i nowoczesności.",periods:"Topograficzna precyzja → dramatyczny romantyzm → późne obrazy światła i koloru.",curiosity:"W testamencie pozostawił narodowi ogromny zespół własnych prac, dziś znany jako Turner Bequest."},
  "Leonardo da Vinci": {years:"1452–1519",style:"wysoki renesans",breakthrough:"Połączył malarstwo z badaniem anatomii, optyki i natury; sfumato i złożone gesty nadały obrazom nieporównywalną psychologiczną głębię.",origin:"Vinci i Florencja · Włochy",bio:"Malarz, rysownik, inżynier i badacz, którego nieliczne ukończone obrazy stały się fundamentem sztuki wysokiego renesansu.",periods:"Florencja → Mediolan → ponownie Florencja i Mediolan → ostatnie lata we Francji.",curiosity:"Pozostawił tysiące stron notatników, często zapisanych charakterystycznym pismem lustrzanym."},
  "Sandro Botticelli": {years:"ok. 1445–1510",style:"wczesny renesans florencki",breakthrough:"Stworzył rozpoznawalny język płynnego konturu, eleganckiego ruchu i poetyckiej melancholii w tematach religijnych oraz mitologicznych.",origin:"Florencja · Włochy",bio:"Malarz związany z kręgiem Medyceuszy, autor obrazów o niezwykłej linearnej muzyczności i subtelnej ekspresji.",periods:"Warsztat Fra Filippo Lippiego → dwór Medyceuszy i tematy mitologiczne → późna intensywna religijność.",curiosity:"Przydomek Botticelli, czyli „beczułka”, pochodził prawdopodobnie od przezwiska jego starszego brata."},
  "Rafael": {years:"1483–1520",style:"wysoki renesans",breakthrough:"Ustanowił wzorzec harmonijnej, czytelnej kompozycji i idealizowanego piękna, który dominował w europejskich akademiach przez stulecia.",origin:"Urbino, Florencja i Rzym · Włochy",bio:"Malarz i architekt, który w krótkim życiu połączył lekcje Perugina, Leonarda i Michała Anioła we własny, niezwykle klarowny styl.",periods:"Urbino i Perugia → Florencja → wielkie zamówienia papieskie w Rzymie.",curiosity:"Zmarł w wieku 37 lat i został pochowany w rzymskim Panteonie."},
  "Tycjan": {years:"ok. 1488/90–1576",style:"renesans wenecki",breakthrough:"Budował ciało, przestrzeń i emocję warstwami koloru, wpływając na Rubensa, Velázqueza, Rembrandta i późniejsze malarstwo europejskie.",origin:"Pieve di Cadore i Wenecja · Włochy",bio:"Najważniejszy malarz renesansowej Wenecji, pracujący dla papieży, cesarzy i książąt, a zarazem odważny eksperymentator malarskiej materii.",periods:"Wczesna współpraca z Giorgionem → dojrzałe ołtarze i portrety → swobodne, niemal rozpuszczone późne malarstwo.",curiosity:"Późne obrazy poprawiał palcami i szmatką równie często jak pędzlem, budując powierzchnię przez długie miesiące."},
  "Peter Paul Rubens": {years:"1577–1640",style:"barok flamandzki",breakthrough:"Połączył monumentalność antyku i renesansu z gwałtownym ruchem, kolorem i cielesnością baroku.",origin:"Siegen, Antwerpia i europejskie dwory",bio:"Flamandzki malarz, erudyta, dyplomata i kierownik wielkiego warsztatu, który realizował zamówienia w całej Europie.",periods:"Antwerpia → osiem lat we Włoszech → międzynarodowa kariera dworska i wielki warsztat.",curiosity:"Misje dyplomatyczne prowadził równolegle z malowaniem; został nobilitowany zarówno przez Filipa IV, jak i Karola I."},
  "Francisco Goya": {years:"1746–1828",style:"rokoko, romantyzm, prekursor modernizmu",breakthrough:"Od portretu dworskiego przeszedł do bezprecedensowo osobistej i krytycznej wizji wojny, przemocy, przesądu oraz psychiki.",origin:"Fuendetodos, Madryt i Bordeaux",bio:"Hiszpański malarz królewski i grafik, świadek politycznych katastrof swojej epoki, który pod koniec życia stworzył mroczne obrazy dla samego siebie.",periods:"Kartony do tapiserii → portrecista dworu → grafiki krytyczne i wojenne → Czarne obrazy → emigracja w Bordeaux.",curiosity:"Po ciężkiej chorobie w 1793 roku stracił słuch, co pogłębiło jego izolację, ale nie przerwało niezwykle aktywnej pracy."},
  "Giotto": {years:"ok. 1267–1337",style:"proto-renesans",breakthrough:"Nadał figurom ciężar, przestrzeń i emocjonalną relację, odchodząc od płaskiego schematu bizantyjskiego i przygotowując grunt pod renesans.",origin:"okolice Florencji · Włochy",bio:"Malarz i architekt działający we Florencji, Padwie, Asyżu i Neapolu; jego freski odmieniły sposób opowiadania historii obrazem.",periods:"Wczesne prace przypisywane w Asyżu → Kaplica Scrovegnich w Padwie → dojrzałe zamówienia florenckie i neapolitańskie.",curiosity:"Dante wymienił Giotta w Boskiej komedii jako artystę, który przyćmił sławę swego poprzednika Cimabuego."},
  "René Magritte": {years:"1898–1967",style:"surrealizm",breakthrough:"Realistycznym językiem malował logicznie niemożliwe sytuacje, pokazując, że obraz rzeczy nigdy nie jest samą rzeczą.",origin:"Lessines i Bruksela · Belgia",bio:"Belgijski surrealista, który zamiast automatyzmu wybierał chłodną precyzję i konceptualne zagadki złożone ze zwyczajnych przedmiotów.",periods:"Futuryzm i kubizm → przełom surrealistyczny → lata paryskie → dojrzała twórczość w Brukseli.",curiosity:"Przez wiele lat projektował reklamy i okładki; banalna klarowność grafiki użytkowej stała się częścią siły jego obrazów."},
  "Joan Miró": {years:"1893–1983",style:"surrealizm, abstrakcja poetycka",breakthrough:"Stworzył własny alfabet biomorficznych znaków i pozwolił przypadkowi współpracować z precyzyjnie wyważoną kompozycją.",origin:"Barcelona i Mont-roig · Hiszpania",bio:"Kataloński malarz, rzeźbiarz i grafik, który czerpał z krajobrazu rodzinnej Katalonii, poezji, snu oraz sztuki dziecięcej.",periods:"Wczesny realizm kataloński → Paryż i surrealizm → wojenne Konstelacje → monumentalne rzeźby i ceramika.",curiosity:"Deklarował chęć „zamordowania malarstwa”, lecz chodziło mu o uwolnienie go od akademickich reguł, nie o porzucenie medium."},
  "Roy Lichtenstein": {years:"1923–1997",style:"pop-art",breakthrough:"Ręcznie odtwarzał estetykę komiksu i druku masowego, powiększając raster Ben-Day oraz zamieniając reprodukcję w monumentalne malarstwo.",origin:"Nowy Jork · USA",bio:"Amerykański malarz i rzeźbiarz, który badał, jak kultura popularna, reprodukcja i historia sztuki zmieniają znaczenie obrazu.",periods:"Wczesny modernizm → przełom komiksowy 1961 → serie pejzaży, wnętrz, pociągnięć pędzla i cytatów z historii sztuki.",curiosity:"Kropki wyglądają mechanicznie, lecz w wielu obrazach były żmudnie nanoszone ręcznie przy użyciu perforowanych matryc."},
  "Yayoi Kusama": {years:"ur. 1929",style:"awangarda, pop-art, minimalizm, instalacja",breakthrough:"Z obsesyjnego powtórzenia punktu i siatki uczyniła język malarstwa, performansu i środowisk lustrzanych pochłaniających widza.",origin:"Matsumoto · Japonia; Nowy Jork i Tokio",bio:"Japońska artystka działająca w malarstwie, rzeźbie, performansie, modzie i instalacji, jedna z najważniejszych postaci powojennej awangardy.",periods:"Wczesne prace w Japonii → nowojorska awangarda 1958–73 → powrót do Tokio → globalne instalacje Infinity Mirror Rooms.",curiosity:"Od dzieciństwa doświadczała halucynacji wzorów pokrywających przestrzeń; powtarzanie punktów nazywała sposobem „samounicestwienia”."}
});

MUSEUMS.forEach(museum => {
  museum.focusArtists = MUSEUM_FOCUS_ARTISTS.filter(artist => museum.works.some(work => work.artist === artist));
});

const gosiaSnapshotNotes = {
  met: "Nowa paczka Gosi obejmuje wyłącznie obiekty oznaczone przez The Met jako On view 15.08.2026; numery galerii pochodzą z bieżących kart obiektów.",
  moma: "Nowa paczka Gosi obejmuje wyłącznie obiekty oznaczone przez MoMA jako On view 15.08.2026. Roy Lichtenstein został pominięty, ponieważ żadne jego dzieło nie było wtedy wystawione.",
  guggenheim: "Nowa paczka Gosi korzysta z oficjalnego filtra On View in New York oraz strony Guggenheim Pop sprawdzonych 15.08.2026. Fernand Léger i Joan Miró zostali pominięci, ponieważ nie występowali w aktualnym wykazie."
};

MUSEUMS.forEach(museum => {
  if (gosiaSnapshotNotes[museum.id]) museum.statusNote = `${museum.statusNote || ""} ${gosiaSnapshotNotes[museum.id]}`.trim();
});
