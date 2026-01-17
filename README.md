wibescoders

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





