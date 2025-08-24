# dt210g-projekt-backend

Detta är backend-delen av projektet Bokhyllan, byggd med Hapi.js och MongoDB Atlas.
Backend tillhandahåller ett REST API för användarhantering, böcker och recensioner. Projektet skapades som en del av kursmoment i DT210G.

## Teknologier

- Node.js + Hapi
- MongoDBAtlas + Mongoose
- JWT för autentisering
- dotenv för miljövariabler
- Google Books API för extern bokdata

---

## Installation

1. **Klona repot:**

git clone https://github.com/SabinaLiljestrom/dt210g-projekt-backend

2. **Installera beroenden:**
   npm install

3. **Skapa .env-fil:**
   PORT=3018
   MONGO_URI=<din-mongodb-atlas-connection-string>
   JWT_SECRET_KEY=<valfri-hemlig-nyckel>

4. **Starta servern:**
   # Utveckling
   npm run dev

# Produktion

npm start

## API-endpoints

### Auth

| Metod | Endpoint    | Beskrivning          | Skyddad |
| ----- | ----------- | -------------------- | ------- |
| POST  | `/register` | Skapa ett konto      | ❌      |
| POST  | `/login`    | Logga in, få token   | ❌      |
| GET   | `/profile`  | Hämta användarprofil | ✅      |

### Böcker

| Metod | Endpoint              | Beskrivning                  | Skyddad |
| ----- | --------------------- | ---------------------------- | ------- |
| GET   | `/books?search=title` | Sök bok via Google books API | ❌      |
| GET   | `/books/{id}`         | Hämta detaljer om en bok     | ❌      |

### Recensioner

| Metod    | Endpoint            | Beskrivning                              | Skyddad | Exempel                              |
| -------- | ------------------- | ---------------------------------------- | ------- | ------------------------------------ |
| `GET`    | `/reviews`          | Hämta alla recensioner                   | ❌ Nej  | `/reviews`                           |
| `GET`    | `/reviews/{bookId}` | Hämta recensioner för en bok             | ❌ Nej  | `/reviews/665dabc12345abcd6789efgh`  |
| `GET`    | `/my-reviews/`      | Hämta recensioner för inloggad användare | ✅ Ja   | `/my-reviews/`                       |
| `POST`   | `/reviews`          | Skapa en ny recension                    | ✅ Ja   | `body: { bookId, content, rating }`- |
| `PUT`    | `/reviews/{id}`     | Uppdatera ett befintlig recension        | ✅ Ja   | `/reviews/665dabc12345abcd6789efgh`  |
| `DELETE` | `/reviews/{id}`     | Radera en recension                      | ✅ Ja   | `/reviews/665dabc12345abcd6789efgh`  |
