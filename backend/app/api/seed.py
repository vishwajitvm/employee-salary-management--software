from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from tracenest import logger
import uuid
import random
from faker import Faker

from app.database import get_db
from app.models import Employee

router = APIRouter()
fake = Faker()

DEPARTMENTS = ["Engineering", "Sales", "Marketing", "HR", "Finance", "Legal", "Operations"]
LOCATIONS = {
    "USA": ["New York", "San Francisco", "Austin", "Seattle", "Chicago"],
    "India": ["Bangalore", "Mumbai", "Delhi", "Hyderabad", "Pune"],
    "UK": ["London", "Manchester", "Edinburgh", "Bristol", "Birmingham"],
    "Canada": ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa"],
    "Germany": ["Berlin", "Munich", "Frankfurt", "Hamburg", "Stuttgart"],
    "Australia": ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide"],
    "Singapore": ["Singapore"]
}
COUNTRIES = list(LOCATIONS.keys())

@router.post("/seed/chunk")
def seed_chunk(chunk_size: int = 1000, db: Session = Depends(get_db)):
    logger.info(f"Received request to seed {chunk_size} employees.")
    try:
        employees_data = []
        for _ in range(chunk_size):
            first = fake.first_name()
            last = fake.last_name()
            email = f"{first.lower()}.{last.lower()}.{uuid.uuid4().hex[:6]}@acme.com"
            
            country = random.choice(COUNTRIES)
            city = random.choice(LOCATIONS[country])
            
            # Start salaries out naturally between 4L - 50L INR approx.
            # but we are storing as USD equivalent base initially (as per previous logic).
            # The prompt asked about INR and USD.
            base = round(random.uniform(40000.00, 200000.00), 2)
            
            employees_data.append({
                "id": uuid.uuid4().hex,
                "first_name": first,
                "last_name": last,
                "email": email,
                "department": random.choice(DEPARTMENTS),
                "country": country,
                "city": city,
                "base_salary": base,
                "currency": "USD"
            })

        db.bulk_insert_mappings(Employee, employees_data)
        db.commit()
        
        logger.info(f"Successfully seeded {chunk_size} rows.")
        return {"success": True, "inserted": chunk_size}
        
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to seed chunk: {e}")
        raise HTTPException(status_code=500, detail="Failed to seed chunk. Transaction rolled back.")

@router.delete("/seed/clear")
def clear_seed_data(db: Session = Depends(get_db)):
    logger.warning("Clearing all employee data!")
    try:
        # Also clears SalaryHistory because of cascade delete
        db.execute(text("DELETE FROM employees"))
        db.commit()
        return {"success": True, "message": "All data cleared successfully."}
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to clear data: {e}")
        raise HTTPException(status_code=500, detail="Failed to clear data.")
