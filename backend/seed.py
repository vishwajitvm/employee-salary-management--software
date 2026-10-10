import time
import random
import uuid
from faker import Faker
from tracenest import logger
from app.database import SessionLocal, engine, Base
from app.models import Employee

fake = Faker()

DEPARTMENTS = ["Engineering", "Sales", "Marketing", "HR", "Finance", "Legal", "Operations"]
COUNTRIES = ["USA", "India", "UK", "Canada", "Germany", "Australia", "Singapore"]

def seed_data(num_records=10000):
    logger.info(f"Starting database seed for {num_records} employees...")
    start_time = time.time()

    try:
        logger.debug("Ensuring database tables exist...")
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        logger.critical(f"Database connection failed during seeding: {e}")
        return
    
    db = SessionLocal()
    
    try:
        # Check if we already have data
        count = db.query(Employee).count()
        if count > 0:
            logger.info(f"Database already contains {count} records. Skipping seed.")
            return

        logger.info("Generating realistic HR data. Please wait...")
        employees_data = []
        for _ in range(num_records):
            first = fake.first_name()
            last = fake.last_name()
            email = f"{first.lower()}.{last.lower()}.{uuid.uuid4().hex[:6]}@acme.com"
            
            employees_data.append({
                "id": uuid.uuid4(),
                "first_name": first,
                "last_name": last,
                "email": email,
                "department": random.choice(DEPARTMENTS),
                "country": random.choice(COUNTRIES),
                "base_salary": round(random.uniform(40000.00, 200000.00), 2),
                "currency": "USD"
            })

        logger.info("Data generated. Executing bulk insert (this is extremely fast)...")
        # Bulk insert for massive performance (Takes < 1 second for 10k rows)
        db.bulk_insert_mappings(Employee, employees_data)
        db.commit()
        
        end_time = time.time()
        logger.info(f"Successfully seeded {num_records} employees in {end_time - start_time:.2f} seconds!")
        
    except Exception as e:
        db.rollback()
        logger.error(f"An error occurred during seeding: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_data(10000)
