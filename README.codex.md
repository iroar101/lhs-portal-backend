# Codex Guide: Lynbrook Sports Medicine Portal API

This doc summarizes the current API surface, data sources, middleware, and environment assumptions for the backend in `src/`.

## Runtime & Stack
- Express 5 + TypeScript (`src/index.ts`)
- Firebase Admin SDK (Firestore + Auth) initialized once in `src/firebase.ts` using `GOOGLE_APPLICATION_CREDENTIALS`
- dotenv for local env loading; CORS + JSON body parsing enabled globally

## Environment Inputs
- `GOOGLE_APPLICATION_CREDENTIALS`: path to the Firebase service account JSON (required outside GCP)
- `PORT`: HTTP port (defaults to `3000`)
- Optional: `FIREBASE_DATABASE_URL` (not required for current features)

## Data Model (Firestore)
- Collection: `users`
- Document fields (`src/types.ts`):
  - `uid`, `email`, `displayName`
  - `role`: `super_user | provider | intern`
  - `status`: `pending | active | disabled`
  - `createdAt`, `updatedAt`: Firestore `Timestamp`

## Middleware Pipeline
- `requireAuth` (`src/middleware/auth.ts`): Validates `Authorization: Bearer <Firebase ID token>`, attaches `req.firebaseUser`.
- `requireActiveUser` (`src/middleware/requireActiveUser.ts`): Loads user from Firestore; if missing, creates a `pending` `intern` record. Requires `status === active` to proceed, otherwise 403.
- `requireRole(allowedRoles)` (`src/middleware/requireRole.ts`): Ensures `req.appUser.role` is in the allowed set; otherwise 403.

## Routes
- `GET /health`: Readiness probe, returns `{ ok: true }`.
- `GET /`: Service banner + version from `package.json`.
- `GET /api/me` (`src/routes/me.ts`):
  - Requires Firebase ID token.
  - If user does not exist, creates a `pending` `intern` record and returns 403 with status `pending`.
  - If user exists but `status !== active`, returns 403 with that status.
  - If active, returns `uid`, `email`, `displayName`, `role`, `status`.
- `GET /api/admin/users` (`src/routes/adminUsers.ts`):
  - Requires active user with role `super_user` or `provider`.
  - Returns all `users` documents as `AppUser[]`.
- `PATCH /api/admin/users/:uid` (`src/routes/adminUsers.ts`):
  - Same access rules as the GET above.
  - Accepts `role` (`super_user|provider|intern`) and/or `status` (`pending|active|disabled`); updates Firestore document timestamps via `updatedAt`.
  - Validation errors return 400; missing user returns 404.

## Scripts
- `npm run dev`: `ts-node-dev` watch on `src/index.ts`
- `npm run build`: `tsc` -> `dist/`
- `npm start`: runs compiled `dist/index.js`

## External Touchpoints
- Firebase Auth: ID token verification (`getAuth().verifyIdToken`)
- Firestore: `users` collection CRUD
- No other external APIs are called currently.
