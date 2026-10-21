# QuickSite CRM

A CRM for managing clients, projects, meetings, tickets, and team members. The Next.js app proxies API requests to a local Express backend, which currently persists records as JSON under `backend/data/`.

## Current database-project status

An Express backend is already present with login, JWT-protected routes, profile and team management, and create/read/update/delete API operations for clients, projects, meetings, tickets, and team members. This is a functional backend prototype, not yet a relational database implementation: records currently live in `backend/data/crm-data.json`. Designing and implementing the relational schema, keys, constraints, and database queries is still required for the university database project.

## Requirements

- Node.js 20 or newer
- npm

## Run locally

Install dependencies from the project root:

```powershell
npm install
npm install --prefix backend
```

Copy `.env.example` to `.env` and replace `JWT_SECRET` before using the app beyond local development. Start the backend in one terminal:

```powershell
npm run backend
```

Start the frontend in another terminal:

```powershell
npm run dev
```

Open <http://localhost:3000>. The API health endpoint is <http://localhost:4000/health>.

## Local demo account

- Email: `admin@crm.local`
- Password: `Admin123!`

On first startup the backend creates its JSON data file and seeds the demo account plus sample clients. Set `SEED_ADMIN_PASSWORD` before the first backend start to change the initial password.

## Backend API

The API supports authentication and CRUD for clients, projects, meetings, tickets, and team members. Protected routes accept a bearer token; the Next.js API gateway forwards the HttpOnly auth cookie automatically. Password reset codes are printed in the backend terminal because no email provider is configured. The current settings UI includes profile, API-access, and team-access panels; API key controls and reset notifications are placeholders, and avatar uploads require S3 configuration.