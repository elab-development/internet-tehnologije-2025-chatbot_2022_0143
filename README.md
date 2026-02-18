# Travel Chatbot

Ovaj projekat predstavlja Single Page Web aplikaciju razvijenu u okviru seminarskog rada.
Aplikacija omogućava komunikaciju sa travel chatbot-om, upravljanje podacima o destinacijama i prikaz statističkih podataka.

---

## 1. Opis aplikacije

Travel Chatbot aplikacija je SPA (Single Page Application) razvijena pomoću Next.js framework-a.

Aplikacija se sastoji iz frontend i backend dela, koji komuniciraju preko REST API-ja.

### Glavne funkcionalnosti:

- Chatbot komunikacija sa korisnikom
- Odgovori iz baze podataka (FAQ sistem)
- AI fallback odgovor pomoću Google Gemini API-ja
- Prikaz povezanih pitanja
- Role sistem (gost, registrovani korisnik, administrator)
- Čuvanje istorije razgovora za registrovane korisnike
- Swagger API dokumentacija
- Grafički prikaz statistike pomoću Google Charts

---

## 2. Način rada chatbot-a

Chatbot funkcioniše po sledećoj logici:

1. Korisnik postavlja pitanje.
2. Sistem pokušava da pronađe najrelevantniji odgovor u bazi podataka.
3. Ako se pronađe odgovarajući odgovor → vraća se odgovor iz baze.
4. Ako odgovor ne postoji u bazi → koristi se Google Gemini AI kao fallback.
5. Odgovor se beleži u istoriji (za registrovane korisnike).

Na ovaj način obezbeđena je kombinacija lokalne baze znanja i eksternog AI sistema.

---

## 3. Korišćene tehnologije

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend
- Next.js API Routes
- Prisma ORM
- PostgreSQL baza podataka

### AI integracija
- Google Gemini API (@google/genai)

### Dodatne tehnologije
- Docker
- Docker Compose
- Swagger
- Google Charts
- GitHub Actions (CI)
- Jest i Supertest (testiranje)

---

## 4. Arhitektura sistema

Aplikacija se sastoji iz:

- Next.js aplikacije (frontend + backend)
- PostgreSQL baze podataka
- Google Gemini API integracije

Svi servisi se pokreću putem Docker Compose alata.

---

## 5. Produkciona verzija (Render Deployment)

Aplikacija je javno dostupna putem Render platforme:

 https://travel-chatbot-app.onrender.com/

Deployment je automatski povezan sa GitHub repozitorijumom.
Svaki novi commit na glavnoj grani pokreće automatski build i deploy.

---

## 6. Pokretanje aplikacije (lokalno - Docker)

### 6.1 Preduslovi

Neophodno je da su instalirani:

- Docker
- Docker Compose

---

### 6.2 Podešavanje environment varijabli

U root folderu projekta kreirati `.env` fajl sa sledećim vrednostima:

```
DATABASE_URL=postgresql://postgres:postgres@db:5432/travelchatbot
GEMINI_API_KEY=VAŠ_GEMINI_API_KLJUČ
GEMINI_MODEL=gemini-1.5-flash
```

Napomena: Gemini API ključ dobija se preko Google AI Studio platforme.

---

### 6.3 Pokretanje aplikacije

U root direktorijumu projekta pokrenuti:

```bash
docker compose up --build
```

Nakon uspešnog pokretanja aplikacija je dostupna na:

```
http://localhost:3000
```

---

## 7. Pokretanje bez Docker-a (razvojni režim)

Ako se aplikacija pokreće bez Docker-a:

1. Instalirati dependencies:

```bash
npm install
```

2. Pokrenuti razvojni server:

```bash
npm run dev
```

Aplikacija će biti dostupna na:

```
http://localhost:3000
```

---

## 8. CI / GitHub Actions

Projekat koristi GitHub Actions za:

- Build proveru
- Testiranje
- Docker build validaciju

CI koristi `npm ci`, zbog čega je neophodno da `package-lock.json` bude uvek sinhronizovan sa `package.json`.

---

## 9. Testiranje

Za pokretanje testova:

```bash
npm test
```

---


