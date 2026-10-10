# Scalability Plan: From 10,000 to 10 Million

The prompt requires us to build for 10,000 employees, but a professional system must be designed to grow. Here is how we ensure the system won't crash when ACME Org hires its 10 millionth employee.

## 1. Database Indexing
If you search for a book in a library with no catalog, you have to check every book. That is a "Full Table Scan." 
By putting an `index` on the `department` and `country` columns in our database, we created a catalog. The database can now find all "Engineering" employees instantly, even if there are millions of records.

## 2. API Pagination
If we try to send 10 million employee records to the web browser, the computer will run out of memory and crash. 
Instead, our API uses **Pagination**. We only ever send 15 records to the frontend at a time (`OFFSET` and `LIMIT`). As the user clicks "Next Page", we fetch the next 15. The system remains lightning fast regardless of total size.

## 3. Asynchronous Background Workers (Celery)
A bulk update on 10 million rows will take time. If the backend API waits for it to finish, the browser will show a "Timeout Error." 
By offloading this to Celery, the API instantly replies "I've started working on it!", keeping the UI fast and responsive while the heavy lifting happens on a separate server process.
