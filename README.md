wibescoders

Project Summary
- Caregiver accounts manage up to five care recipients with known conditions.
- Caregivers can bulk register multiple recipients with a review step before submit.
- Staff can create activities and view a live dashboard with capacity status.
- Capacity is enforced server-side to prevent overbooking.

MVP Demo Script (5-7 minutes)
1) Register a caregiver and a staff account (use two browser profiles).
2) Log in as caregiver, visit Profile, add 2-3 care recipients with conditions.
3) Switch to staff, create an activity with a small capacity (e.g., 2).
4) Back as caregiver, open Activities, choose the activity, select recipients, review details, confirm signup.
5) Switch to staff dashboard and point out the live status bar and caregiver tagging.
6) Try to register more recipients than capacity; show the error and blocked state.

Getting Started (Docker Postgres)

1) Start Postgres with Docker (admin terminal):
   docker run --name minds-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=minds_db -p 5432:5432 -d postgres:16

   If it already exists:
   docker start minds-postgres

2) Backend:
   cd backend
   npm install
   npm run dev

3) Frontend (new terminal):
   cd frontend
   npm install
   npm run dev

4) Open http://localhost:3000





