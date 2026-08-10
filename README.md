# Guides

Rodzinna aplikacja PWA skupiająca przewodniki podróżnicze pod jednym adresem i jedną ikoną na telefonie.

## Pakiety offline

- Pescara — weekend w Abruzji
- Namibia — plan, safari i pakowanie
- Nowy Jork — plan dzień po dniu, mapy, muzea i zdjęcia
- Kiedy i dokąd? — małe narzędzie dołączone na stałe do aplikacji

Ekran główny pozwala pobrać, zaktualizować i usunąć każdy przewodnik osobno. Usunięcie pakietu kasuje pliki offline, ale nie czyści zapisów użytkownika w `localStorage` (np. odhaczeń).

## Aktualizacja katalogu

Po dodaniu albo zmianie plików przewodnika należy wygenerować katalog pakietów:

```bash
node scripts/generate-offline-catalog.mjs
```

Generator tworzy `offline-catalog.json`, zawierający listę plików, rozmiary i wersje pakietów. Zmieniona wersja jest automatycznie pokazywana użytkownikowi jako dostępna aktualizacja.

## Uruchomienie lokalne

Service worker wymaga serwera HTTP. W katalogu repozytorium można uruchomić dowolny prosty serwer lokalny, a następnie otworzyć jego adres w przeglądarce.

## Publikacja

Repozytorium jest publikowane przez GitHub Pages pod adresem:

<https://zecior13.github.io/travel-guides/>
