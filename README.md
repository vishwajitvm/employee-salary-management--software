# ACME HR & Salary Management System 🏢💸

![Docker](https://img.shields.io/badge/Docker-Enabled-blue?logo=docker)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)
![Next.js](https://img.shields.io/badge/Frontend-Next.js-black?logo=next.js)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?logo=postgresql)
![Redis](https://img.shields.io/badge/Queue-Redis-DC382D?logo=redis)

Welcome to the **ACME HR & Salary Management System**. This is an enterprise-grade web application designed to securely manage employee directories, track global salary histories, and execute massive background salary updates without skipping a beat.



## 🎥 Application Demo
<video src="https://github.com/vishwajitvm/employee-salary-management--software/raw/master/frontend/video/demo.mp4" autoplay loop muted playsinline width="100%"></video>

*(Note: If your browser does not support mp4, a `.webm` version is also available in `frontend/video/demo.webm`)*

---

## 📖 What Is This Project? (Layman's Terms)

Imagine a giant corporate phonebook, but it also securely tracks how much money everyone makes. 
If the CEO decides, *"I want to give a 15% raise to everyone in the Marketing department in Singapore,"* doing that manually for thousands of people would crash the system or take hours. 

This platform solves that. It allows HR administrators to:
1. **Search** for anyone in the company instantly.
2. **Apply Bulk Raises** to specific departments or countries in the background (so you don't have to wait for a loading screen).
3. **Download Dossiers** (PDF reports) of any employee to see their exact salary history.
4. **See Global Analytics** at a glance.

---

## 🛠️ Tech Stack: Why Did We Choose These Tools?

To build a system capable of supporting 1-Billion users seamlessly, we chose a modern, highly scalable tech stack:

1. **Next.js (React) - The Frontend:**
   * **Why?** It builds the beautiful user interface you interact with. We chose Next.js because it is blazing fast, SEO-friendly, and offers smooth transitions. It makes the app feel like a modern desktop software rather than a clunky website.
2. **FastAPI (Python) - The Backend Server:**
   * **Why?** FastAPI is one of the fastest frameworks available. It handles all the heavy lifting (like talking to the database and generating PDFs) almost instantly. 
3. **PostgreSQL - The Database:**
   * **Why?** PostgreSQL is the gold standard for financial and enterprise data. It guarantees that our salary updates are mathematically perfect and completely safe from data corruption.
4. **Redis & Celery - The Background Workers:**
   * **Why?** When you update 10,000 salaries at once, we don't want your web browser to freeze. We hand that massive job over to **Celery** (a worker robot) which uses **Redis** (a super-fast memory cache) to keep track of its progress. Your screen stays completely un-frozen while the robots work in the background!
5. **Docker - The Containerization:**
   * **Why?** "It works on my machine!" - This solves that problem. Docker wraps the entire app up so it runs exactly the same on a Windows laptop, an Apple Mac, or a massive Google Cloud server.

---

## 🚀 How to Install and Run Locally

Because we use **Docker**, you don't need to manually install Python, Node, or Databases. 

### Step 1: Start the System
Open your terminal in this folder and run:
```bash
docker compose up -d --build
```
*This command downloads everything needed and starts 4 isolated servers (Database, Cache, Backend, Frontend).*

### Step 2: Access the Application
- **Frontend Dashboard:** Go to [http://localhost:3000](http://localhost:3000)
- **Backend API Docs:** Go to [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🌱 Database Seeding (Testing with Fake Data)

When you first start the app, the database is empty. We built a dedicated page for you to generate fake enterprise data so you can test the system.

1. Go to **[http://localhost:3000/dashboard/seed](http://localhost:3000/dashboard/seed)**
2. Enter the number of fake employees you want to create (e.g., `500`).
3. Click **Generate Data**. You will see a live progress bar.
4. **Made a mistake?** Click the red **Wipe Database** button on the same page to instantly roll back and clear all data.

---

## ⚡ Key Enterprise Features

### 1. Smart Background Polling (Zero Server Lag)
When you trigger a Bulk Salary Update, the frontend doesn't aggressively ask the database "Are you done yet?". Instead, it asks the **Redis** memory cache via a lightweight API. This means even if 1 Million users hit "Update" at the same time, the main database won't crash.

### 2. PDF Dossier Generation
By clicking the document icon next to any employee, the backend will generate a highly-styled **A4 PDF Dossier** containing their exact salary history. It seamlessly adapts the currency symbol (`INR` or `USD`) and formatting based on your local settings.

### 3. Advanced Numbered Pagination
When browsing the employee directory, you have total control over the data density. Use the bottom-left dropdown to view up to **1,000 rows** at a time, and use the Google-style numbered pagination blocks (`1 2 3 ... 45`) to jump instantly across massive datasets.

### 4. TraceNest Logging
All background activities, errors, and system events are silently captured by **TraceNest**, ensuring that developers have full visibility into the system's health without disrupting the user experience. (Accessible via `http://localhost:8000/tracenest`).

---

## 🏗️ Architecture Diagram
*(See `docs/diagrams/detailed-architecture.mmd` for the full technical flowchart).*

- **UI Layer**: React / Next.js
- **API Layer**: FastAPI
- **Task Queue**: Celery 
- **Message Broker**: Redis
- **Persistence**: PostgreSQL

---
**Maintained by:** Vishwajit VM (vishwajitmall50@gmail.com) | **Status:** Stable Release 1.0
