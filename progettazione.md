# PLANNING-UNCHAINED-25-SETTEMBRE

## sito funzionante e deployato su render

https://autodealer-frontend.onrender.com

## Credenziali admin

- Email: `admin@autodealer.local`
- Password: `pswjaviunchained`

---

# Progettazione Salone Auto

## Stack tecnologico

- Java 21
- Maven
- Spring Boot
- Lombok
- Spring Boot DevTools
- Spring Web
- Spring Data JPA
- PostgreSQL Driver
- Validation
- JavaMailSender
- Spring Security
- BCrypt
- Spring Boot Actuator

> In aggiunta: verificare le dipendenze esatte di Spring in base ai moduli richiesti.

---

## Entità principali

### User

Lo schema è semplice ma mantiene una netta separazione per ruolo tramite enum. Si inizierà con un `superuser` per poter creare altri admin.

- `id`: GUID
- `username`: string
- `email`: string
- `password`: bcrypt
- `role`: enum (`USER`, `ADMIN`)
- Funzioni: registrazione, login e gestione ruoli

### Auto

Basato sui modelli della biblioteca creata questa settimana.

- `id`: GUID
- `marca`: string
- `modello`: string
- `descrizione`: text
- `prezzoAcquisto`: decimal (visibile solo agli admin)
- `prezzoVendita`: decimal
- `inBozza`: boolean (se `true`, visibile solo agli admin)

### Preferite

- `id`: GUID
- `user`: FK
- `auto`: FK

### Avvisi

- `id`: GUID
- `user`: FK
- `auto`: FK
- `sogliaPrezzo`: decimal
- `inviato`: boolean (default `false`)
- `unsubscribeToken`: GUID (usato per gestire la disattivazione)

---

## Controller e endpoint

### Login, registrazione e utente

- `POST /register`: registrazione utente (riceve DTO, non l'entità)
- `POST /login`: login e restituzione JWT
- `DELETE /users/{id}`: eliminazione account

Service:

- validazione DTO
- controllo del ruolo assegnato

### Catalogo auto (pubblico e admin)

- `GET /cars`: catalogo pubblico
- `GET /cars/{id}`: singola auto
- `POST /cars`: creazione auto (solo admin, altrimenti 403)
- `PUT /cars/{id}` o `PATCH /cars/{id}`: modifica auto e prezzo (solo admin, altrimenti 403)

Service:

- evitare concatenazione SQL per prevenire injection
- restituire DTO per nascondere prezzo di acquisto e auto in bozza ai non admin

### Preferiti

- `POST /favorites`: aggiungi ai preferiti
- `GET /favorites`: lista preferiti dell'utente connesso
- `DELETE /favorites/{id}`: rimuovi preferito

Service:

- controllo doppio su `id` e proprietario
- restituisce 404 se si tenta di accedere a un preferito di un altro utente, non 403

### Avvisi (Price Alerts)

- `POST /alerts`: crea avviso soglia
- `GET /alerts`: lista avvisi dell'utente connesso
- `DELETE /alerts/{id}`: rimuovi/disattiva avviso
- `GET /alerts/unsubscribe?token=...`: disattivazione via link email con `unsubscribeToken`, senza ID utente

Service:

- controllo proprietario
- restituisce 404 per ID altrui

---

## Ascoltatore

Come da scheda:

```java
@TransactionalEventListener(phase = AFTER_COMMIT)
@Async
```

Il service ascolta il cambiamento di prezzo.

---

## Legale e policy (frontend)

- `GET /privacy-policy`
- `GET /cookie-policy`

Service:

- pagine statiche descrittive reali sui dati raccolti (email, nome, preferiti, soglie)
- spiegazione dello scopo e della conservazione
- uso del `localStorage` per il token JWT
- opzione di cancellazione dei dati

---

## Step previsti

### Miei step

1. Creare il database e collegarlo al backend tramite `application.properties`
2. Definire classi, DTO e scaffolding
3. Implementare sicurezza: ruoli JWT, CORS e controllo permessi (404/403)
4. Implementare logica auto e avvisi
5. Implementare il frontend, senza `dangerouslySetInnerHTML`
6. Creare pagine Privacy e Cookie
7. Commit finale, impostare variabili su Render e fare deploy completo

### Step AI

1. Generazione scaffolding e configurazione CORS e DB
2. Stesura DTO, entità, controller e service
3. Supporto nella stesura dell'Event Listener async e della query atomica per evitare invii multipli di email
4. Verifica sicurezza, validazioni e controllo accessi tramite token
5. Generazione base di Privacy e Cookie policy
