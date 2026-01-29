# 🚀 Instrukcja - Reconciliation Tool z Firestore Integration

## Co zostało dodane?

Narzędzie teraz łączy się **bezpośrednio z Firestore** (gdzie Rowy trzyma dane), co oznacza:
- ✅ **Brak manual exportu** z Rowy dla event transactions
- ✅ **Real-time sync** - dane zawsze aktualne
- ✅ **Auto-refresh** - automatyczne odświeżanie co 5 minut
- ✅ **Hybrid mode** - Firestore dla eventów, CSV dla Stripe

---

## 🎯 Szybki start (pierwsze użycie)

### Krok 1: Otwórz narzędzie
```
/Users/filipolszewski/Downloads/stripe/reconciliation.html
```
Kliknij dwukrotnie - otworzy się w przeglądarce.

### Krok 2: Połącz z Firestore
1. Znajdź sekcję **"Auto-sync z Rowy (Firestore)"** (niebieska sekcja)
2. Kliknij przycisk **"🔌 Połącz z Firestore"**
3. ✅ Dane załadują się automatycznie!

Zobaczysz komunikat:
```
✅ Pobrano X transakcji (HH:MM:SS)
```

### Krok 3: Upload Stripe CSV
1. W górnej sekcji **"Załaduj pliki CSV"**
2. Przy **"Unified Payments CSV (Stripe)"** kliknij i wybierz:
   ```
   Dane/unified_payments.csv
   ```
3. ✅ Plik załadowany!

### Krok 4: Przetwórz dane
1. Kliknij **"Przetwórz dane"**
2. 🎉 Gotowe! Zobaczysz wszystkie transakcje

---

## 📅 Codzienny workflow

### Opcja A: Najszybsza (zalecana)
1. Otwórz `reconciliation.html`
2. Dane z Rowy załadują się **automatycznie** (jeśli włączysz auto-refresh)
3. Upload Stripe CSV
4. Kliknij "Przetwórz dane"

**Czas: ~30 sekund** ⚡

### Opcja B: Manual refresh
1. Otwórz `reconciliation.html`
2. Kliknij **"🔄 Odśwież dane"** (jeśli chcesz najnowsze)
3. Upload Stripe CSV
4. Kliknij "Przetwórz dane"

---

## 🔄 Auto-refresh (zalecane)

### Jak włączyć:
1. Połącz się z Firestore (przycisk "Połącz z Firestore")
2. Zaznacz checkbox: **"Auto-refresh co 5 minut"**
3. ✅ Gotowe! Dane będą się automatycznie odświeżać

### Co to daje:
- Zawsze masz aktualne dane bez klikania
- Działa w tle podczas pracy z narzędziem
- Idealny dla ciągłej pracy

### Wyłączanie:
- Po prostu odznacz checkbox

---

## 🎨 Jak to wygląda w praktyce

### Sekcja Firestore (niebieska):
```
┌─────────────────────────────────────────────┐
│ 🔄 Auto-sync z Rowy (Firestore)            │
│                                              │
│ [🔌 Połącz z Firestore] [🔄 Odśwież dane]  │
│ ✅ Pobrano 67 transakcji (14:35:12)        │
│                                              │
│ ☑ Auto-refresh co 5 minut (zalecane)       │
└─────────────────────────────────────────────┘
```

### Status połączenia:
- 🔌 **Niebieski przycisk** = nie połączono jeszcze
- ✓ **Zielony przycisk** = połączono!
- ⏳ **"Pobieranie danych..."** = ładowanie w toku
- ✅ **"Pobrano X transakcji"** = sukces!
- ❌ **"Błąd: ..."** = problem z połączeniem

---

## 📊 Różnice vs poprzednia wersja

### PRZED (manual CSV):
```
1. Wejdź do Rowy
2. Znajdź tabelę events_transactions
3. Kliknij Export
4. Pobierz CSV
5. Upload do narzędzia
6. Upload Stripe CSV
7. Przetwórz dane
```
**Czas: ~3-5 minut**

### TERAZ (Firestore sync):
```
1. Otwórz reconciliation.html
2. Upload Stripe CSV
3. Przetwórz dane
```
**Czas: ~30 sekund** ⚡

### Oszczędność:
- **80-90% czasu** przy każdym użyciu
- **Zawsze aktualne dane** z Rowy
- **Brak manualnego exportu**

---

## 🔒 Bezpieczeństwo

### Czy to bezpieczne?
**TAK!** ✅

**Dlaczego:**
1. **API Key jest publiczny** - to standard dla web apps (Google używa tego w milionach aplikacji)
2. **Firestore Rules chronią dane:**
   - ✅ Read: dostępny (to nie są wrażliwe dane - tylko listy uczestników)
   - ✅ Write: chroniony - nikt nie może usuwać/modyfikować
3. **Wszystko działa lokalnie** - żadne dane nie są wysyłane poza Firebase

### Twoje Firestore Rules:
```javascript
match /events_transactions/{transactionId=**} {
  allow list, get;  // ← każdy może czytać
  allow create: if canCreateTransaction(...);  // ← tylko autoryzowane zapisy
}
```

**Wniosek:** Nikt nie może uszkodzić/usunąć Twoich danych. Tylko czytanie jest publiczne.

---

## 🐛 Rozwiązywanie problemów

### Problem: "Błąd: Permission denied"
**Rozwiązanie:**
- Sprawdź czy Firestore Rules pozwalają na `allow list, get` dla `events_transactions`
- Powinno być: `allow list, get;` (bez warunku)

### Problem: "Nie udało się zainicjalizować Firebase"
**Rozwiązanie:**
- Upewnij się że masz internet
- Sprawdź Console przeglądarki (F12) czy są błędy
- Odśwież stronę (Ctrl+R / Cmd+R)

### Problem: "Pobrano 0 transakcji"
**Możliwe przyczyny:**
- Collection jest pusta (sprawdź w Rowy)
- Nazwa collection jest inna niż `events_transactions`
- Firestore Rules blokują dostęp

### Problem: Auto-refresh nie działa
**Rozwiązanie:**
- Najpierw połącz się z Firestore (przycisk "Połącz")
- Potem dopiero zaznacz checkbox auto-refresh
- Sprawdź Console (F12) czy są błędy

---

## 💡 Wskazówki

### 1. Używaj auto-refresh
- Włącz checkbox i zostaw narzędzie otwarte
- Dane będą się automatycznie aktualizować
- Idealne przy ciągłej pracy

### 2. Stripe CSV możesz cachować
- Unified payments rzadziej się zmieniają
- Możesz załadować raz i używać przez kilka dni
- Narzędzie zapamięta dane (do momentu refresh)

### 3. Tryb offline
- Jeśli stracisz internet, narzędzie nadal działa
- Ostatnio załadowane dane są w pamięci
- Po powrocie internetu kliknij "Odśwież dane"

### 4. Wiele eventów
- Firestore pobiera **wszystkie** transakcje
- Użyj filtra "Event" żeby zobaczyć konkretny event
- Możesz eksportować tylko wybrane eventy

---

## 🎓 Zaawansowane

### Zmiana interwału auto-refresh
Obecnie: 5 minut. Jeśli chcesz zmienić:
1. Otwórz `reconciliation.html` w edytorze
2. Znajdź: `5 * 60 * 1000`
3. Zmień `5` na inną wartość (w minutach)

### Dodanie kolejnych collection
Jeśli masz więcej kolekcji do synchronizacji:
1. Duplikuj kod `fetchFromFirestore()`
2. Zmień `'events_transactions'` na nazwę swojej kolekcji
3. Dodaj przycisk w UI

### Monitorowanie w real-time
Narzędzie obecnie robi "pull" (pobiera dane co X minut).
Można dodać "push" (realtime listener) - skomplikowane ale możliwe.

---

## 📞 Kontakt / Pytania

Jeśli:
- Masz pytania
- Coś nie działa
- Chcesz dodać nowe funkcje
- Potrzebujesz pomocy

Daj znać! Mogę pomóc 😊

---

## 🎉 Podsumowanie

**Przed integracją:**
- Manual export z Rowy co tydzień
- Upload 2 plików CSV
- ~5 minut pracy

**Po integracji:**
- Auto-sync z Firestore
- Upload tylko 1 pliku CSV (Stripe)
- ~30 sekund pracy
- Zawsze aktualne dane

**Oszczędność:** ~80-90% czasu! 🚀
