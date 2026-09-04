# Źródła rzeczywistych danych lotniczych — audyt 2026-09-04

## Rekomendowana kolejność

1. **AZair — zapytać o kontraktowe API.** Najlepsze dopasowanie produktu: elastyczne okresy, wiele lotnisk, tanie linie, ceny, czasy, połączenia i „anywhere”. Oficjalna strona deklaruje 62 linie, 302 lotniska w 51 krajach, w tym Ryanair i Wizz Air, oraz wprost zaprasza zainteresowanych API na podstawie umowy do kontaktu `info@azair.com`. Nie są publiczne: dokumentacja API, cena, limity, licencja na wyświetlanie wyników, stabilność, zakres przekierowań i warunki użycia w prywatnym PWA. Trzeba potwierdzić to przed integracją.
2. **Kontynuować linki Skyscanner/Google Flights jako bezpieczny fallback.** Nie dają one Guides zbiorczej listy ani cen, ale pozwalają użytkownikowi sprawdzić wybrany wariant.
3. **Nie wybierać Amadeus Self-Service jako głównego źródła.** Oficjalne FAQ mówi, że Self-Service nie zwraca low-cost carriers; cache Inspiration/Cheapest Date nie obejmuje wszystkich par. Nie rozwiąże kluczowego przypadku Ryanair/Wizz Air.

## Opcje odrzucone lub warunkowe

- **Skyscanner Travel API:** oficjalnie tylko komercyjnie; odrzuca osoby prywatne i serwisy poniżej 100 tys. MAU. Affiliate links/widgets mogą pozostać opcją, ale nie zastępują własnych wyników.
- **Aviasales/Travelpayouts live search:** wymaga co najmniej 50 tys. MAU, zaplecza serwerowego oraz spełniania wymagań konwersji. Cache/Data API jest orientacyjny, nie live.
- **Kiwi Tequila przez Travelpayouts:** oficjalne warunki wymagają co najmniej 50 tys. MAU.
- **Duffel:** zapewnia oferty live i filtry godzin, ale publiczna lista dostawców potwierdza część linii (np. easyJet), a nie potwierdza Ryanaira ani Wizz Aira. Model zakłada zakupy; nadmiar wyszukiwań względem rezerwacji może być rozliczany. Słabe dopasowanie do rodzinnego narzędzia inspiracyjnego.
- **SerpApi/nieoficjalne API Google Flights:** rozwiązanie pośrednie oparte na wynikach Google. Wymaga płatnej usługi i serwera. Rozważać dopiero po sprawdzeniu umowy, kompletności tanich linii, prawa do przechowywania/prezentowania danych i kosztu siatki zapytań.
- **Samodzielne pobieranie stron linii lub metawyszukiwarek:** odrzucone bez pisemnej zgody/licencji; kruche technicznie, trudne do utrzymania i ryzykowne kontraktowo.

## Architektura po uzyskaniu API

GitHub Pages pozostaje interfejsem. Sekret API nie może trafić do publicznego JavaScriptu, więc potrzebny jest mały backend/serverless proxy. Jedno świadome wyszukiwanie użytkownika wysyła kryteria, backend odpytuje dostawcę, cache'uje krótko odpowiedź i zwraca znormalizowane oferty z czasem aktualizacji. Filtry ceny, godzin, przesiadek i bagażu działają na realnych ofertach. Link zakupowy powstaje zgodnie z licencją dostawcy dopiero po kliknięciu. Limity zapytań i maksymalny koszt muszą być twardo ograniczone.

## Pytania do AZair

- Czy API jest dostępne dla małej, prywatnej aplikacji rodzinnej bez sprzedaży biletów i ruchu publicznego?
- Jaki jest koszt, limit zapytań i maksymalny zakres jednego wyszukiwania?
- Czy odpowiedź obejmuje Ryanair i Wizz Air: rozkład, aktualną cenę, walutę, bagaż i link do rezerwacji?
- Czy obsługiwane są: wiele lotnisk startowych/docelowych, „anywhere”/region, szeroki okres, dni tygodnia, godziny lokalne i loty bezpośrednie?
- Jak długo można cache'ować i prezentować wyniki? Czy wymagane jest logo/atrybucja?
- Czy można wyświetlać dane w prywatnym PWA hostowanym na GitHub Pages z własnym backendem?
- Czy dostępny jest sandbox oraz dokumentacja przed zawarciem umowy?

## Oficjalne źródła

- https://www.azair.eu/
- https://www.partners.skyscanner.net/contact/travel-api
- https://admin.developers.amadeus.com/self-service/apis-docs/guides/developer-guides/faq/
- https://duffel.com/flights/airlines
- https://duffel.com/services-agreement
- https://support.travelpayouts.com/hc/en-us/articles/30565016140434-Aviasales-Flights-Search-API-real-time-and-multi-city-search
- https://support.travelpayouts.com/hc/en-us/articles/360019237899-Kiwi-com-affiliate-program-API
