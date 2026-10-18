# counter-app

A counter dashboard with a React frontend and an Express API that stores the value in MySQL.

```
frontend/   Vite, React and TypeScript. Calls the API at VITE_API_URL. server.js serves the built files.
backend/    Express and mysql2. Serves /api/counter and /healthz.
```

## Run it locally

You need Node 20 or later and a MySQL server.

```
cd backend
cp .env.example .env        # set DATABASE_URL, for example mysql://user:password@localhost:3306/appdb
npm install
npm run migrate             # creates the counter table; safe to run again
npm start                   # listens on port 8080

cd frontend
cp .env.example .env        # VITE_API_URL=http://localhost:8080/api
npm install
npm run dev                 # opens on http://localhost:5173
```

## Backend settings

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | MySQL connection string. Without it the API answers 503 and `/healthz` reports `not configured`. |
| `FRONTEND_URL` | Comma-separated frontend origins allowed to call the API. Leave it unset to allow any origin. |
| `PORT` | Port to listen on. Defaults to 8080. |

## Database

`npm run migrate` creates one table, `counter`, holding a single row. It is idempotent: it creates the table only if it is missing and never resets the value.

## API

| Method and path | Purpose |
|---|---|
| `GET /healthz` | Health check. Always 200 while the server is up. |
| `GET /api/counter` | The current value, as `{ "value": 0 }`. |
| `POST /api/counter/increment` | Add one. |
| `POST /api/counter/decrement` | Subtract one. |
| `POST /api/counter/reset` | Set to zero. |
| `PUT /api/counter` | Set the value from `{ "value": 42 }`. It must be a whole number. |
