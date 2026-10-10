from celery import Celery
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.sql import text
from tracenest import logger

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/acme_salary_db")

celery_app = Celery("salary_tasks", broker=REDIS_URL, backend=REDIS_URL)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@celery_app.task
def process_bulk_salary_update(department: str, country: str, city: str, percentage_increase: float):
    logger.info(f"Starting async bulk update: {percentage_increase}% for dept={department}, country={country}, city={city}")
    db = SessionLocal()
    try:
        # Build dynamic query filters
        conditions = []
        params = {"pct": 1 + (percentage_increase / 100.0), "pct_val": percentage_increase}
        if department:
            conditions.append("department = :dept")
            params["dept"] = department
        if country:
            conditions.append("country = :country")
            params["country"] = country
        if city:
            conditions.append("city = :city")
            params["city"] = city
        
        where_clause = " AND ".join(conditions) if conditions else "1=1"
        
        # 1. Insert into history table directly using INSERT INTO ... SELECT
        history_query = f"""
            INSERT INTO salary_history (id, employee_id, old_salary, new_salary, percentage_change, amount_change)
            SELECT 
                gen_random_uuid()::varchar,
                id, 
                base_salary, 
                base_salary * :pct, 
                :pct_val, 
                (base_salary * :pct) - base_salary
            FROM employees
            WHERE {where_clause}
        """
        
        db.execute(text(history_query), params)
        
        # 2. Update the main table
        update_query = f"""
            UPDATE employees 
            SET base_salary = base_salary * :pct
            WHERE {where_clause}
        """
        
        result = db.execute(text(update_query), params)
        db.commit()
        
        affected = result.rowcount
        logger.info(f"Successfully processed bulk update. {affected} employees updated.")
        return {"affected_rows": affected}
        
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to process bulk update: {str(e)}")
        raise e
    finally:
        db.close()
