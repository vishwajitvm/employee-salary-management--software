import sys

with open('backend/app/api/routes.py', 'r') as f:
    content = f.read()

new_routes = """
@router.get("/employees/check-email")
def check_email(email: str, db: Session = Depends(get_db)):
    exists = db.query(Employee).filter(Employee.email.ilike(email)).first() is not None
    return {"exists": exists}

@router.post("/employees")
def create_employee(emp: EmployeeCreate, db: Session = Depends(get_db)):
    if db.query(Employee).filter(Employee.email.ilike(emp.email)).first():
        raise HTTPException(status_code=400, detail="Email already registered")
        
    db_emp = Employee(
        first_name=emp.first_name,
        last_name=emp.last_name,
        email=emp.email,
        department=emp.department,
        country=emp.country,
        city=emp.city,
        base_salary=emp.base_salary,
        currency="USD"
    )
    db.add(db_emp)
    db.commit()
    db.refresh(db_emp)
    return {"success": True, "employee_id": db_emp.id}
"""

if "EmployeeCreate" not in content:
    content = content.replace("from app.schemas import BulkUpdateSchema, SweetAlertResponse", "from app.schemas import BulkUpdateSchema, SweetAlertResponse, EmployeeCreate")
    content = content.replace("router = APIRouter()", "router = APIRouter()\n" + new_routes)

with open('backend/app/api/routes.py', 'w') as f:
    f.write(content)
