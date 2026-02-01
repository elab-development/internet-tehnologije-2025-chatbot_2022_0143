# Travel Chatbot 

Ovaj projekat predstavlja Single Page Web aplikaciju razvijenu u okviru seminarskog rada.
Aplikacija omogućava pregled turističkih destinacija, komunikaciju sa chatbotom, upravljanje omiljenim destinacijama i prikaz statističkih podataka.

---

## 1. Opis aplikacije

Travel Chatbot aplikacija je SPA (Single Page Application) koja se sastoji od frontend i backend dela, povezanih kroz REST API.

Glavne funkcionalnosti aplikacije:
- prikaz liste turističkih destinacija
- dodavanje i uklanjanje destinacija iz omiljenih
- chatbot komunikacija
- prikaz statistike destinacija pomoću grafičkog prikaza
- integracija sa eksternim API-jima
- role sistem (gost, registrovani korisnik, administrator)

Aplikacija je dockerizovana i može se pokrenuti jedinstvenom komandom.

---

## 2. Korišćene tehnologije

### Frontend
- Next.js (React framework)
- TypeScript
- Tailwind CSS

### Backend
- Next.js API Routes
- Prisma ORM
- PostgreSQL baza podataka

### Dodatne tehnologije
- Docker i Docker Compose
- Swagger (API dokumentacija)
- Google Charts (vizualizacija podataka)
- Eksterni REST API-ji
- GitHub Actions (CI/CD)
- Jest i Supertest (automatizovani testovi)

---

## 3. Arhitektura sistema

Aplikacija se sastoji iz sledećih servisa:
- **Frontend/Backend aplikacija** (Next.js)
- **PostgreSQL baza podataka**

Komunikacija između servisa realizovana je pomoću Docker Compose alata.

---

## 4. Pokretanje aplikacije (lokalno)

### 4.1 Preduslovi
Neophodno je da su instalirani:
- Docker
- Docker Compose

---

### 4.2 Pokretanje aplikacije

U root direktorijumu projekta pokrenuti sledeću komandu:

```bash
docker compose up --build
