# 🚀 Instrukcja - Stripe API z Vercel

## Co to daje?

Zamiast ręcznego eksportu CSV ze Stripe Dashboard, narzędzie automatycznie pobiera dane przez Stripe API. Działa tak samo jak integracja z Firestore!

**Przed:** Export CSV → Upload → Przetwórz
**Po:** Kliknij "Połącz ze Stripe API" → Gotowe! ✅

---

## 📋 Wymagania

1. Konto Stripe z dostępem do Dashboard
2. Konto na Vercel (darmowe) - https://vercel.com
3. (Opcjonalnie) Git zainstalowany lokalnie

---

## 🔧 Krok 1: Pobierz Stripe Secret Key

1. Zaloguj się do Stripe Dashboard: https://dashboard.stripe.com
2. Przejdź do **Developers** → **API keys**
3. Skopiuj **Secret key** (zaczyna się od `sk_live_...`)

⚠️ **WAŻNE:** Użyj klucza LIVE, nie TEST (test widzi tylko testowe transakcje)

---

## 🌐 Krok 2: Deploy na Vercel

### Opcja A: Przez Vercel CLI (zalecana)

```bash
# 1. Zainstaluj Vercel CLI (jeśli nie masz)
npm install -g vercel

# 2. Przejdź do folderu projektu
cd /Users/filipolszewski/Downloads/stripe

# 3. Zaloguj się do Vercel
vercel login

# 4. Deploy!
vercel

# 5. Przy pytaniach:
#    - Set up and deploy? → Y
#    - Which scope? → (twoje konto)
#    - Link to existing project? → N
#    - Project name? → stripe-reconciliation (lub inna nazwa)
#    - Directory? → ./ (domyślne)
#    - Override settings? → N

# 6. Po deploymencie dostaniesz URL, np:
#    https://stripe-reconciliation-xxx.vercel.app
```

### Opcja B: Przez GitHub + Vercel Dashboard

1. Utwórz nowe repo na GitHub
2. Push kodu:
   ```bash
   cd /Users/filipolszewski/Downloads/stripe
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/TWOJ_USER/stripe-reconciliation.git
   git push -u origin main
   ```
3. W Vercel Dashboard: **New Project** → Import z GitHub
4. Wybierz repo i kliknij Deploy

---

## 🔑 Krok 3: Dodaj Secret Key do Vercel

1. W Vercel Dashboard, otwórz swój projekt
2. Przejdź do **Settings** → **Environment Variables**
3. Dodaj zmienną:
   - **Name:** `STRIPE_SECRET_KEY`
   - **Value:** `sk_live_XXXXXXXXXXXX` (twój klucz)
   - **Environment:** Production (zaznacz też Preview i Development)
4. Kliknij **Save**
5. **WAŻNE:** Redeploy projekt żeby zmienna zadziałała:
   - **Deployments** → wybierz ostatni → **...** → **Redeploy**

---

## ✅ Krok 4: Testuj połączenie

1. Otwórz URL z Vercel (np. `https://stripe-reconciliation-xxx.vercel.app`)
2. W sekcji **"Auto-sync ze Stripe API"**:
   - URL API zostaw puste (bo HTML jest na tym samym serwerze)
   - Wybierz zakres dat (np. "Ostatnie 90 dni")
   - Kliknij **"💳 Połącz ze Stripe API"**
3. Powinieneś zobaczyć: `✅ Pobrano X płatności`

---

## 🖥️ Lokalne testowanie (opcjonalnie)

Jeśli chcesz testować lokalnie przed deploymentem:

```bash
# 1. Zainstaluj zależności
cd /Users/filipolszewski/Downloads/stripe
npm install

# 2. Utwórz plik .env.local z kluczem
echo "STRIPE_SECRET_KEY=sk_live_XXXX" > .env.local

# 3. Uruchom lokalny serwer Vercel
npm run dev
# lub
vercel dev

# 4. Otwórz http://localhost:3000
```

---

## 📊 Struktura API

Projekt zawiera następujące endpointy:

| Endpoint | Opis |
|----------|------|
| `/api/stripe-unified` | **Główny** - pobiera wszystkie płatności z payout info |
| `/api/stripe-payments` | Lista charges (płatności kartą) |
| `/api/stripe-payouts` | Lista wypłat na konto bankowe |
| `/api/stripe-balance-transactions` | Szczegółowe transakcje salda |

### Parametry zapytań:

```
/api/stripe-unified?days=90&limit=500
```

- `days` - ile dni wstecz (domyślnie 90)
- `limit` - max liczba rekordów (domyślnie 100, max 500)

---

## 🔒 Bezpieczeństwo

1. **Secret Key jest bezpieczny** - przechowywany jako Environment Variable na Vercel, nigdy nie trafia do przeglądarki
2. **API jest publiczne** - każdy z linkiem może pobrać dane
   - Jeśli to problem, możesz dodać prosty token autoryzacji (daj znać)
3. **HTTPS** - Vercel automatycznie zapewnia SSL

---

## 🐛 Rozwiązywanie problemów

### "STRIPE_SECRET_KEY not configured"
- Sprawdź czy dodałeś zmienną w Vercel Settings → Environment Variables
- Zrób Redeploy po dodaniu zmiennej

### "Failed to fetch" / "Network error"
- Sprawdź czy URL API jest poprawny
- Sprawdź konsolę przeglądarki (F12) czy są błędy CORS

### "Invalid API Key"
- Upewnij się że używasz klucza LIVE (nie TEST)
- Sprawdź czy klucz nie wygasł

### Brak transakcji / 0 wyników
- Sprawdź zakres dat (może transakcje są starsze)
- Upewnij się że używasz LIVE key (test key widzi tylko test data)

---

## 🔄 Workflow po wdrożeniu

1. Otwórz https://twoja-app.vercel.app
2. Kliknij "Połącz z Firestore" (dane eventów)
3. Kliknij "Połącz ze Stripe API" (dane płatności)
4. Kliknij "Przetwórz dane"
5. Gotowe! 🎉

**Czas: ~10 sekund** (vs ~5 minut z ręcznym CSV)

---

## 📞 Pomoc

Jeśli masz pytania lub coś nie działa - daj znać!
