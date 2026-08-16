# Disaster Management System — DBMS Course Project

## Project Architecture

```
DBMS/
├── frontend/          # Next.js 16 + TypeScript + Tailwind CSS
├── backend/           # Node.js + Express + TypeScript
├── database/          # Oracle SQL Scripts
│   ├── 01_schema.sql  # 16 tables (ER Diagram → Relational Schema)
│   └── 02_queries.sql # 34 instructor-taught SQL queries
└── PROGRESS.md        # Development log
```

---

## How to Run (Any Computer)

### Step 1 — Oracle Database Setup
1. Install Oracle Database XE (free): https://www.oracle.com/database/technologies/xe-downloads.html
2. Create the schema: run `database/01_schema.sql` in SQL*Plus or SQLcl
3. Note your credentials: username, password, connection string (e.g., `localhost:1521/XEPDB1`)

### Step 2 — Backend Setup
```bash
cd backend
cp .env.example .env           # Copy template
# Edit .env: set DB_USER, DB_PASSWORD, DB_CONNECTION_STRING
npm install
npm run dev                    # Starts on http://localhost:5000
```

### Step 3 — Frontend Setup
```bash
cd frontend
# .env.local is already configured for localhost:5000
npm install
npm run dev                    # Starts on http://localhost:3000
```

---

## Portability — Moving to Another Computer

Only **2 files** need to be changed when moving to a different machine:

| File | What to change |
|------|---------------|
| `backend/.env` | `DB_USER`, `DB_PASSWORD`, `DB_CONNECTION_STRING` |
| `frontend/.env.local` | `NEXT_PUBLIC_API_URL` (if backend runs on different port/host) |

Everything else is machine-independent.

---

## Database Schema Summary (ER Diagram → Relational)

| Table | ER Type |
|-------|---------|
| DISASTER_EVENT | Strong Entity (PK: disaster_name) |
| WAREHOUSE | Strong Entity |
| VEHICLE | Strong Entity |
| PERSONNEL | Strong Entity + Self JOIN (supervises) |
| SHELTER | Strong Entity |
| VICTIM | Strong Entity |
| DONATION | Strong Entity |
| FAMILY_MEMBER | **Weak Entity** (PK: victim_id + member_seq_no) |
| VICTIM_PHONE | **Multivalued Attribute** (PK: victim_id + phone) |
| VOLUNTEER | **ISA Sub-entity** (PK = person_id from PERSONNEL) |
| MEDICAL_STAFF | **ISA Sub-entity** (PK = person_id from PERSONNEL) |
| VICTIM_SHELTER_STAY | **M:N Relationship** (VICTIM ↔ SHELTER) |
| DISTRIBUTION | **Aggregation Inner** (WAREHOUSE ↔ PERSONNEL) |
| VEHICLE_DISTRIBUTION | **Aggregation Outer** (VEHICLE ↔ DISTRIBUTION) |
| PERSONNEL_DEPLOYMENT | **M:N Relationship** (PERSONNEL ↔ SHELTER) |
| PERSONNEL_STATIONED | **M:N Relationship** (PERSONNEL ↔ WAREHOUSE) |

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Backend health check |
| `/api/dashboard` | GET | All KPIs in one call |
| `/api/disasters` | GET/POST | Disaster events |
| `/api/disasters/:name` | GET/PUT | Single disaster |
| `/api/victims` | GET/POST | Victims + phones + family |
| `/api/victims/:id` | GET | Victim detail |
| `/api/shelters` | GET/POST | Shelters + occupancy |
| `/api/shelters/checkin` | POST | Check victim into shelter |
| `/api/warehouses` | GET/POST | Warehouses + donation totals |
| `/api/vehicles` | GET/POST | Fleet |
| `/api/donations` | GET/POST | Donations |
| `/api/distributions` | GET/POST | Relief distribution (aggregation) |
| `/api/personnel` | GET/POST | Personnel + ISA sub-entities |
| `/api/personnel/volunteers` | GET | Volunteers only |
| `/api/personnel/medical` | GET | Medical staff only |

---

## Notes
- No PL/SQL, Triggers, or Stored Procedures (instructor did not teach these)
- Derived attributes (duration_days, available_capacity) calculated in queries, not stored
- All configuration is in `.env` files — never hardcoded
