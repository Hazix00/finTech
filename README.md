# FinTech Aid Requests Starter

## Description
Ce repository contient un socle minimal runnable avec :
- un backend NestJS 9 pour gérer les demandes d'aide financières
- un frontend Angular 15.2 avec deux pages (beneficiary et manager)
- un environnement Docker Compose avec PostgreSQL
- No Hasura

## Technologies
- Backend: NestJS 9, TypeORM, PostgreSQL, class-validator, Swagger
- Frontend: Angular 15.2, PrimeNG 15.4, primeicons
- Infra: Docker, Docker Compose

## Choix techniques et compromis
- Cette livraison correspond à la phase 1 : objectif de mise en place rapide d'un socle fonctionnel avec logique métier minimale.
- API en REST avec NestJS + TypeORM choisie pour cette phase pour rester simple, explicite et facilement testable.
- No Hasura (demande explicite) : le projet privilégie ici un contrôle applicatif direct dans le backend.
- Reste à faire sur les règles métier : transitions de statut, plafond de montant, nombre maximum de demandes actives, et tests.

## Lancement avec Docker
Prérequis : Docker Desktop actif.

```bash
docker compose up --build
```

Services exposés :
- API backend: http://localhost:3000
- Swagger (documentation API interactive): http://localhost:3000/api-docs
- Frontend: http://localhost:4200
- PostgreSQL: localhost:5432

## Swagger
La documentation interactive de l'API est disponible via Swagger UI à l'adresse http://localhost:3000/api-docs.
Elle permet d'explorer et de tester tous les endpoints directement depuis le navigateur, sans outil externe.

## Lancement en local (sans Docker)
### Backend
```bash
cd backend
npm install
npm run dev
```

Copier `backend/.env.example` vers `.env` et adapter si besoin.

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Notes sur les endpoints backend
- `POST /aid-requests`
- `GET /aid-requests?beneficiaryId=&status=&page=&limit=`
- `PATCH /aid-requests/:id/status`

## Réflexion technique demandée
### 1) Migration Angular 15 -> 19
- Principales difficultés attendues : migration des APIs de PrimeNG/Angular Material éventuelles, toute librairie installé peuvent être changé et il faudra vérifier la doc pour mettre à jour les importations et l'utilisation.
- Ordre proposé : migrer Angular CLI et core version par version (`ng update`), puis corriger les breaking changes framework, ensuite mettre à niveau les librairies, et enfin stabiliser via tests + build CI.

### 2) Hasura + NestJS
- Hasura direct GraphQL est pertinent pour des lectures/CRUD standards et rapidement exposer des données relationnelles avec peu de logique métier.
- NestJS REST/custom est préférable dès que des règles métier non triviales s'appliquent.
- Exemple dans ce test : les transitions de statut autorisées et la limite de 2 demandes actives doivent rester dans le backend NestJS pour garantir des contrôles explicites et centralisés et la sécurité.

### 3) BehaviorSubject vs NgRx/Signals
- Pour ce scope, `BehaviorSubject` en service est suffisant : peu d'écrans, flux simples, mise en place rapide.
- Franchement, je n'est pas d'experience avec signals mais NgRx est préférable au cas le projet deviens plus large ou quand il y a une grande collaboration globale entre les modules. Un autre plus de NgRx et le debugging et plus facile via Redux Devtools.
