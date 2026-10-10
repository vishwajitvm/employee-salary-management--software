# Technology Stack (And Why We Chose It)

We carefully selected tools that are industry standards for building scalable, enterprise software.

### 1. Frontend: Next.js & React
* **What it is:** A framework for building user interfaces.
* **Why we chose it:** It provides lightning-fast page loads, excellent developer experience, and pairs perfectly with Tailwind CSS for beautiful styling.

### 2. Backend: Python FastAPI
* **What it is:** A modern, incredibly fast framework for building APIs in Python.
* **Why we chose it:** It is asynchronous (meaning it can handle thousands of requests at once without waiting in line) and automatically validates data to prevent bugs.

### 3. Database: PostgreSQL
* **What it is:** The world's most advanced open-source relational database.
* **Why we chose it:** Unlike simpler databases (like SQLite), Postgres can safely handle complex data updates, massive aggregations (averaging millions of salaries), and multiple users accessing it simultaneously without locking up.

### 4. Background Processing: Celery & Redis
* **What it is:** A system for putting long-running tasks in a queue.
* **Why we chose it:** Updating thousands of records can take a few seconds. If we did this directly in the API, the user's screen would freeze. Celery handles this in the background for a flawless user experience.

### 5. Logging: TraceNest
* **What it is:** A professional logging and monitoring UI.
* **Why we chose it:** It gives developers and admins clear visibility into what the system is doing behind the scenes.
