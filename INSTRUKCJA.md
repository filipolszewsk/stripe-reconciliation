# Instrukcja użycia - Stripe Payment Reconciliation Tool

## Jak zacząć

1. **Otwórz plik w przeglądarce**
   - Znajdź plik `reconciliation.html` w folderze `/Users/filipolszewski/Downloads/stripe/`
   - Kliknij dwukrotnie na plik - otworzy się w Twojej domyślnej przeglądarce
   - Lub przeciągnij plik do okna przeglądarki

2. **Załaduj pliki CSV**
   - Kliknij "Wybierz plik" przy "Events Transactions CSV"
   - Wybierz plik z folderu `Dane/`, np. `events_transactions-2026-01-29T19_35_41.818Z.csv`
   - Kliknij "Wybierz plik" przy "Unified Payments CSV"
   - Wybierz plik `unified_payments.csv` z folderu `Dane/`

3. **Przetwórz dane**
   - Kliknij przycisk "Przetwórz dane"
   - Automatycznie pojawi się:
     - Podsumowanie (liczba transakcji, wypłacone, oczekujące, nieudane)
     - Filtry
     - Tabela z wszystkimi transakcjami

## Funkcje

### Podsumowanie
- **Wszystkie transakcje** - łączna liczba rejestracji
- **Wypłacone** - transakcje, które Stripe już przelał na Twoje konto
- **Oczekujące** - zapłacone ale jeszcze niewypłacone lub oczekujące na płatność
- **Nieudane** - transakcje odrzucone przez bank

### Filtry
- **Event** - wybierz konkretny event (np. Światłosfera)
- **Status płatności** - Zapłacone/Oczekujące/Nieudane
- **Status wypłaty** - Wypłacone/Oczekujące
- **Szukaj** - wpisz email lub nazwisko uczestnika

### Tabela
- **Sortowanie** - kliknij na nagłówek kolumny, żeby posortować
- **Kolory**:
  - 🟢 Zielony = zapłacone i wypłacone
  - 🟡 Żółty = zapłacone ale jeszcze niewypłacone
  - 🔴 Czerwony = transakcja nieudana

### Eksport
- Kliknij "Eksportuj do CSV"
- Plik zostanie pobrany z aktualnie przefiltrowanymi danymi
- Możesz go otworzyć w Excel lub zaimportować do Google Sheets

## Jak to działa

Narzędzie łączy dane z dwóch źródeł:
1. **events_transactions.csv** - Twoje rejestracje z eventu
2. **unified_payments.csv** - Dane ze Stripe

Klucz połączenia: `payment_id` (format: `pi_...`)

### Status wypłaty
Jeśli w danych Stripe jest ID payoutu (format: `po_...`), oznacza to że płatność została już przelana na Twoje konto bankowe.

## Rozwiązywanie problemów

**Nie widzę danych po kliknięciu "Przetwórz dane"**
- Upewnij się, że oba pliki zostały załadowane (powinny być zielone checkmarki)
- Sprawdź czy pliki CSV nie są puste

**Brakuje niektórych transakcji**
- To normalne - w `events_transactions` mogą być rejestracje bez `payment_id` (jeszcze niezapłacone)
- Narzędzie pokaże je jako "Oczekujące"

**Kolumna "Kwota" jest pusta**
- To znaczy, że dla tej rejestracji nie ma jeszcze płatności w Stripe
- Albo `payment_id` nie został jeszcze sparowany

## Workflow miesięczny/tygodniowy

1. Pobierz nowe pliki CSV z systemu rejestracji i Stripe
2. Otwórz `reconciliation.html`
3. Załaduj oba pliki
4. Przefiltruj po evencie jeśli masz ich więcej
5. Zobacz ile transakcji jest "Wypłacone" vs "Oczekujące"
6. Eksportuj do CSV i zaimportuj do swojego arkusza księgowego w Google Drive

## Bezpieczeństwo

- **Wszystko działa lokalnie** - żadne dane nie są wysyłane do internetu
- Pliki CSV są przetwarzane tylko w Twojej przeglądarce
- Możesz używać narzędzia offline

## Kontakt

Jeśli masz pytania lub potrzebujesz dodatkowych funkcji, daj znać!
