# Strategic Architecture & Execution Flow
## Incubyte Employee Salary Management Assessment

### 1. Architectural Foundation (The 10M Scale Setup)
To ensure the system easily handles 10,000 records today and scales seamlessly to 10 million in the future, we will use a robust, containerized stack:

*   **Infrastructure:** Docker & Docker Compose (Everything runs in isolated containers).
*   **Database:** PostgreSQL. (Chosen over SQLite for robust concurrency, complex aggregations, and high-volume scalability).
*   **Backend:** Python + FastAPI. (Asynchronous, incredibly fast, and great for building scalable APIs).
*   **Background Processing:** Celery + Redis. (Crucial for scale. Bulk operations like importing salaries, generating heavy payroll reports, or seeding 10M records will happen in the background so the UI never freezes).
*   **Frontend:** Next.js (React) with Tailwind CSS and Shadcn UI. (Provides a deeply professional, high-performance, and visually stunning interface).

### 2. Project Structure & Documentation
As requested, everything will be meticulously documented. Our workspace will look like this:
```text
/project-root
  /docs
    /diagrams (Mermaid .mmd files)
    - requirements.md (The requested 1-pager)
    - architecture.md (ADRs, trade-offs, AI prompts used)
  /backend (FastAPI, Celery, Tests)
  /frontend (Next.js)
  - docker-compose.yml
```

### 3. Product Features (HR Manager Persona)
We will build a product that makes the HR Manager's life vastly easier than Excel:
*   **Dashboard:** High-level metrics (Total Payroll, Avg Salary by Country/Dept).
*   **Employee Directory:** A fast, paginated, searchable, and filterable data grid.
*   **Bulk Operations:** The ability to apply a % salary increment to a specific department or country asynchronously (via Celery).
*   **Data Seeding:** A highly optimized script capable of generating and inserting 10k+ records into Postgres in seconds using bulk inserts.

### 4. Development Flow (How we build this end-to-end)

Instead of phases, this is the unified pipeline we will execute sequentially to generate a perfect commit history:

**Step A: Documentation & Scoping**
*   Write the `requirements.md`.
*   Generate the Mermaid architecture diagrams (Entity-Relationship diagram, System Architecture diagram) and save them in `/docs/diagrams/`.

**Step B: Container & DB Setup**
*   Create the `docker-compose.yml` to orchestrate Postgres, Redis, FastAPI, Celery, and Next.js.
*   Write the optimized Python seeding script using SQLAlchemy bulk inserts to handle data generation safely and rapidly.

**Step C: Backend API & Business Logic**
*   Develop FastAPI endpoints with strict Pydantic validation.
*   Implement server-side pagination, search, and filtering.
*   Setup Celery tasks for heavy queries or bulk updates.

**Step D: Rigorous Testing**
*   Write `pytest` suites focusing on edge cases: negative salaries, massive pagination offsets, database transaction rollbacks, and API response times.

**Step E: Frontend & UI Excellence**
*   Build the Next.js application.
*   Create a beautiful, highly responsive dashboard with charts (using a library like Recharts) to satisfy the "answer questions about how the org pays people" requirement.
*   Build the Data Table with server-side sorting and filtering.

**Step F: Final Polish & "The AI Artifacts"**
*   Ensure all code is exceptionally clean (linted with Ruff/Black).
*   Compile the final document detailing our AI usage, prompts, and architectural trade-offs, ensuring we hit every single expectation in their rubric.
