# Lynbrook Sports Medicine Portal API

TypeScript/Express API for the Lynbrook Sports Medicine portal. It enforces Firebase Authentication, role-based access (super_user, provider, intern), and approval-based onboarding for providers.

## Tech Stack
- Node.js (TypeScript), Express 5
- Firebase Admin SDK + Firestore
- dotenv for local config

## Prerequisites
- Node.js 18+ and npm
- Firebase project with a service account JSON (kept out of Git)

## Setup
1) Install dependencies:
```bash
npm install
```
2) Add your service account JSON (gitignored) and point `GOOGLE_APPLICATION_CREDENTIALS` at it:
```
GOOGLE_APPLICATION_CREDENTIALS=./firebase-service-account.json
PORT=3000
# FIREBASE_DATABASE_URL=https://<project-id>.firebaseio.com  # optional
```
3) Run locally:
```bash
npm run dev          # reloads on change
npm run build && npm start
```

## API
All protected routes expect `Authorization: Bearer <Firebase ID token>`.

- `GET /health` — basic readiness check.
- `GET /api/me` — returns the caller’s profile. If the user does not yet exist, a Firestore record is created with role `intern` and status `pending`, and the request returns 403 with that status.
- `GET /api/admin/users` — list all users. Requires an active account with role `super_user` or `provider`.
- `PATCH /api/admin/users/:uid` — update `role` (`super_user|provider|intern`) and/or `status` (`pending|active|disabled`) for a user. Same access rules as the list endpoint.

### Access Control Flow
- `requireAuth` validates the Firebase ID token and loads `req.firebaseUser`.
- `requireActiveUser` ensures the user exists in Firestore and has `status: active` (creating a pending record if absent).
- `requireRole` gates admin routes to allowed roles.

### Data Model
Firestore `users` documents use:
```
uid: string
email: string
displayName: string
role: "super_user" | "provider" | "intern"
status: "pending" | "active" | "disabled"
createdAt: Firestore Timestamp
updatedAt: Firestore Timestamp
```

## Notes
- Keep `.env` files and `firebase-service-account.json` out of source control (already gitignored).
- If running outside Google Cloud, `GOOGLE_APPLICATION_CREDENTIALS` is required so Firebase Admin can load credentials.
