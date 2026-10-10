# System Architecture

## The Big Picture
Think of this system like a highly organized restaurant:
1. **The Customer (Frontend UI):** The HR Manager uses the Next.js web application. It is fast, visual, and easy to use.
2. **The Waiter (FastAPI Backend):** When the HR Manager clicks a button, the request goes to our Python backend. The backend strictly checks the request and decides where it needs to go.
3. **The Kitchen (PostgreSQL Database):** The backend fetches or saves data here. It is highly structured and organized.
4. **The Prep Cooks (Celery & Redis):** If the HR Manager asks for something that takes a long time (like updating 5,000 salaries at once), the "Waiter" doesn't stand in the kitchen waiting. Instead, he hands a ticket to the "Prep Cooks" (Celery), tells the Customer "It's being worked on", and goes back to serving other requests.

## How Data Flows
When you view the Analytics Dashboard:
* The Frontend asks the Backend for a summary.
* The Backend asks PostgreSQL to calculate the averages using highly optimized SQL queries.
* The result is sent back and drawn as a chart.

When you trigger a Bulk Update:
* The Frontend asks the Backend to increase salaries.
* The Backend puts a "Job Ticket" into Redis.
* Celery picks up the ticket, connects to PostgreSQL, and safely updates the rows in a secure transaction.
