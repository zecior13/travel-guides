# Planer — phase 1

Static search planner, **not** a flight-price or availability engine. No API keys, paid services, background requests, scraping or invented fares.

- Multiple origin/destination airports (up to 10 on either side), curated worldwide airport catalogue, custom IATA codes.
- Exact dates, bounded date ranges, departure/return months including cross-year trips; duration is the difference between local dates (Fri–Mon = 3).
- Weekday/date constraints are applied locally. Time/arrival constraints are saved and displayed as a manual handoff checklist, not falsely applied to nonexistent flight data.
- Return links use the requested arrival date as the *departure* date for the return leg; each option also offers the previous day for overnight flights. Neither guarantees arrival on time. Confirm local dates and times in the provider.
- Geographic continent classification follows airport location (e.g. Canaries and Madeira in AF, Cyprus in AS, Istanbul split by airport), not nationality. The catalogue is deliberately incomplete and is not a route map.
- Country groups are alphabetical; dates chronological; destinations alphabetical within a date. No price ordering in Guides. Skyscanner links request `sortby=cheapest`.
- Skyscanner handoff uses its public transport URL pattern. Google Flights uses a plain-language query; users must confirm all transferred settings. Children/ages must be set manually in Google Flights.
- Browser-local draft and up to 20 named saved searches under `guides.planner.v1`, isolated from passport and guide data.
- Live result narrowing by destination text, origin and date pair. Other form changes mark existing output stale and need an explicit regeneration. Rendering is lazy and paginated per country.
- Offline shell supports form/saved searches; external providers need internet.

Official handoff reference checked 2026-09-03:
https://developers.skyscanner.net/docs/referrals/flights-parameters

Run tests: `node --test scripts/test-planner.cjs`.

For live pricing, add an authenticated server-side provider adapter with quotas and price timestamps. Test low-cost carrier coverage and booking handoff before choosing a provider. Never put provider secrets in this repository. Airport/date candidates must not be presented as available flights until live verification exists.

This shell-only change preserves package versions in offline-catalog.json, avoiding unrelated redownloads after cloning (the existing generator hashes file mtimes).
