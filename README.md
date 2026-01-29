# 💳 Stripe Payment Reconciliation Tool

Narzędzie do automatycznego uzgadniania płatności między eventami (Firestore/Rowy) a Stripe. Obsługuje auto-sync z Firebase oraz Stripe API przez Vercel serverless functions.

## ✨ Funkcje

- 🔄 **Auto-sync z Firestore** - automatyczne pobieranie danych eventów z Rowy
- 💳 **Auto-sync ze Stripe API** - automatyczne pobieranie płatności i wypłat przez Vercel
- 📊 **Reconciliation** - matchowanie transakcji między systemami
- 💰 **Status wypłat** - sprawdzanie czy płatność została już wypłacona na konto
- 📈 **Podsumowania finansowe** - przychody, prowizje, wypłaty per event
- 🎨 **Nowoczesny UI** - zbudowany z Tailwind CSS
- 🔒 **Bezpieczny** - Secret keys chronione przez Vercel Environment Variables

## 🚀 Szybki start

### 1. Clone repo

```bash
git clone https://github.com/filipolszewsk/stripe-reconciliation.git
cd stripe-reconciliation
```

### 2. Deploy na Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/filipolszewsk/stripe-reconciliation)

Lub przez CLI:

```bash
npm install -g vercel
vercel login
vercel
```

### 3. Dodaj Stripe Secret Key

W Vercel Dashboard:
- **Settings** → **Environment Variables**
- Dodaj: `STRIPE_SECRET_KEY` = `sk_live_...` (twój klucz ze Stripe)
- Zapisz i zrób **Redeploy**

### 4. Gotowe!

Otwórz URL z Vercel i użyj narzędzia.

## 📖 Dokumentacja

- [INSTRUKCJA-VERCEL.md](INSTRUKCJA-VERCEL.md) - Szczegółowa instrukcja wdrożenia
- [INSTRUKCJA-FIRESTORE.md](INSTRUKCJA-FIRESTORE.md) - Integracja z Firebase/Rowy
- [INSTRUKCJA.md](INSTRUKCJA.md) - Podstawowa instrukcja użycia

## 🏗️ Architektura

```
reconciliation.html           # Frontend - narzędzie do reconciliation
│
├─→ Firebase/Firestore       # Dane eventów (auto-sync)
│   └─ events_transactions
│
├─→ Vercel API               # Stripe integration (serverless)
│   ├─ /api/stripe-unified   # Główny endpoint - płatności + payouts
│   ├─ /api/stripe-payments  # Lista charges
│   ├─ /api/stripe-payouts   # Lista wypłat
│   └─ /api/stripe-balance-transactions  # Transakcje salda
│
└─→ Stripe API              # Źródło danych płatności
    └─ Balance Transactions, Charges, Payouts
```

## 📁 Struktura projektu

```
.
├── api/                    # Vercel serverless functions
│   ├── stripe-unified.js   # Główny endpoint
│   ├── stripe-payments.js
│   ├── stripe-payouts.js
│   └── stripe-balance-transactions.js
├── reconciliation.html     # Frontend tool
├── package.json
├── vercel.json            # Vercel config
└── .env.example           # Template dla environment variables
```

## 🔧 Lokalne testowanie

```bash
# Zainstaluj zależności
npm install

# Utwórz .env.local z kluczem Stripe
echo "STRIPE_SECRET_KEY=sk_live_XXXX" > .env.local

# Uruchom lokalny serwer
npm run dev
# lub
vercel dev

# Otwórz http://localhost:3000
```

## 🔑 Environment Variables

| Zmienna | Wymagana | Opis |
|---------|----------|------|
| `STRIPE_SECRET_KEY` | ✅ | Stripe Secret Key (sk_live_...) z Dashboard |

## 🛡️ Bezpieczeństwo

- ✅ Secret Key nigdy nie trafia do przeglądarki
- ✅ Przechowywany bezpiecznie w Vercel Environment Variables
- ✅ HTTPS przez Vercel
- ✅ Firestore Rules chronią dane przed nieautoryzowanym zapisem

## 📊 Workflow

1. **Otwórz narzędzie** na Vercel URL
2. **Połącz z Firestore** (dane eventów) - klik "Połącz z Firestore"
3. **Połącz ze Stripe API** (dane płatności) - klik "Połącz ze Stripe API"
4. **Przetwórz dane** - automatyczne matchowanie
5. **Analizuj** - filtruj, sortuj, eksportuj CSV

**Czas: ~10 sekund** 🚀

## 🎯 Use Cases

- Reconciliation płatności event po evencie
- Sprawdzanie statusu wypłat na konto
- Analiza przychodów i prowizji
- Export danych do księgowości
- Monitoring transakcji w czasie rzeczywistym

## 🤝 Contributing

Pull requesty są mile widziane! Dla większych zmian, najpierw otwórz issue.

## 📄 Licencja

MIT

## 👤 Autor

Filip Olszewski - [filipolszewsk@gmail.com](mailto:filipolszewsk@gmail.com)

## 🙏 Acknowledgments

- [Stripe API](https://stripe.com/docs/api)
- [Firebase/Firestore](https://firebase.google.com/docs/firestore)
- [Vercel](https://vercel.com)
- [Tailwind CSS](https://tailwindcss.com)
