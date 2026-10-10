from fastapi import APIRouter, Depends, Query, HTTPException, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
import io
import csv
from datetime import datetime
from tracenest import logger

from app.database import get_db
from app.models import Employee, SalaryHistory
from app.schemas import BulkUpdateSchema, SweetAlertResponse, EmployeeCreate
from app.tasks import process_bulk_salary_update, celery_app
from celery.result import AsyncResult

# PDF Generation Imports
from xhtml2pdf import pisa
from jinja2 import Environment, FileSystemLoader
import os

router = APIRouter()

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


# Setup Jinja2 for PDF Templates
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEMPLATE_DIR = os.path.join(BASE_DIR, "templates")
jinja_env = Environment(loader=FileSystemLoader(TEMPLATE_DIR))


@router.get("/employees")
def get_employees(
    db: Session = Depends(get_db), 
    page: int = Query(1, ge=1), 
    size: int = Query(15, ge=1, le=1000),
    search: str = None,
    department: str = None,
    country: str = None,
    city: str = None
):
    query = db.query(Employee)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Employee.first_name.ilike(search_term)) | 
            (Employee.last_name.ilike(search_term)) |
            (Employee.email.ilike(search_term)) |
            (Employee.city.ilike(search_term)) |
            (Employee.country.ilike(search_term))
        )
        
    if department:
        query = query.filter(Employee.department.ilike(f"%{department}%"))
    if country:
        query = query.filter(Employee.country.ilike(f"%{country}%"))
    if city:
        query = query.filter(Employee.city.ilike(f"%{city}%"))
        
    total = query.count()
    employees = query.order_by(Employee.first_name).offset((page - 1) * size).limit(size).all()
    
    return {
        "data": employees,
        "total": total,
        "page": page,
        "size": size
    }


@router.get("/analytics/summary")
def get_analytics_summary(db: Session = Depends(get_db)):
    total_emp = db.query(Employee).count()
    
    if total_emp == 0:
        return {
            "total_employees": 0,
            "total_payroll": 0,
            "avg_salary_by_department": {},
            "avg_salary_by_country": {}
        }
        
    total_payroll = db.query(func.sum(Employee.base_salary)).scalar() or 0
    
    dept_avg = db.query(Employee.department, func.avg(Employee.base_salary)).group_by(Employee.department).all()
    country_avg = db.query(Employee.country, func.avg(Employee.base_salary)).group_by(Employee.country).all()
    
    return {
        "total_employees": total_emp,
        "total_payroll": float(total_payroll),
        "avg_salary_by_department": {d: float(a) for d, a in dept_avg},
        "avg_salary_by_country": {c: float(a) for c, a in country_avg}
    }


@router.post("/salaries/bulk-update")
def bulk_update_salaries(payload: BulkUpdateSchema):
    logger.info(f"Triggering background bulk update for {payload.dict()}")
    # Push the task to Redis/Celery queue
    task = process_bulk_salary_update.delay(
        department=payload.department,
        country=payload.country,
        city=payload.city,
        percentage_increase=payload.percentage_increase
    )
    
    return {
        "success": True,
        "title": "Update Initiated",
        "message": "The bulk update has been queued and is processing in the background.",
        "task_id": task.id
    }

@router.get("/tasks/{task_id}")
def get_task_status(task_id: str):
    task_result = AsyncResult(task_id, app=celery_app)
    return {
        "task_id": task_id,
        "status": task_result.state,
        "result": task_result.result if task_result.state == "SUCCESS" else None
    }



@router.get("/employees/{employee_id}")
def get_single_employee(employee_id: str, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    history = db.query(SalaryHistory).filter(SalaryHistory.employee_id == employee_id).order_by(SalaryHistory.changed_at.desc()).all()
    
    return {
        "id": emp.id,
        "first_name": emp.first_name,
        "last_name": emp.last_name,
        "email": emp.email,
        "department": emp.department,
        "country": emp.country,
        "city": emp.city,
        "base_salary": float(emp.base_salary),
        "history": [
            {
                "date": h.changed_at.isoformat() if h.changed_at else None,
                "old_salary": float(h.old_salary),
                "new_salary": float(h.new_salary),
                "percentage_change": float(h.percentage_change),
                "amount_change": float(h.amount_change)
            } for h in history
        ]
    }

@router.get("/reports/salary-history")
def export_salary_history(
    db: Session = Depends(get_db),
    search: str = None,
    department: str = None,
    country: str = None,
    city: str = None
):
    logger.info("Generating Global Salary History CSV Report...")
    
    query = db.query(
        SalaryHistory.id,
        Employee.first_name,
        Employee.last_name,
        Employee.department,
        Employee.country,
        Employee.city,
        SalaryHistory.old_salary,
        SalaryHistory.new_salary,
        SalaryHistory.percentage_change,
        SalaryHistory.amount_change,
        SalaryHistory.changed_at
    ).join(Employee)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Employee.first_name.ilike(search_term)) | 
            (Employee.last_name.ilike(search_term)) |
            (Employee.email.ilike(search_term)) |
            (Employee.city.ilike(search_term)) |
            (Employee.country.ilike(search_term))
        )
    if department:
        query = query.filter(Employee.department.ilike(f"%{department}%"))
    if country:
        query = query.filter(Employee.country.ilike(f"%{country}%"))
    if city:
        query = query.filter(Employee.city.ilike(f"%{city}%"))
        
    query = query.order_by(SalaryHistory.changed_at.desc())
    
    stream = io.StringIO()
    writer = csv.writer(stream)
    
    # Header
    writer.writerow(["History ID", "First Name", "Last Name", "Department", "Country", "City", 
                     "Old Salary", "New Salary", "Percentage Increase", "Amount Increase", "Changed At"])
    
    # Rows
    for row in query.all():
        writer.writerow(row)
        
    response = StreamingResponse(iter([stream.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=salary_history_report.csv"
    return response


@router.get("/reports/employee/{employee_id}")
def export_single_employee_report(
    employee_id: str, 
    currency: str = "USD", 
    rate: float = 1.0, 
    db: Session = Depends(get_db)
):
    logger.info(f"Generating detailed PDF dossier for employee: {employee_id} in currency: {currency}")
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    history_records = db.query(SalaryHistory).filter(SalaryHistory.employee_id == employee_id).order_by(SalaryHistory.changed_at.desc()).all()
    
    # Format the currency symbol properly
    currency_symbol = "INR " if currency == "INR" else "USD "
    
    # Prepare data for template
    formatted_history = []
    for h in history_records:
        formatted_history.append({
            "date": h.changed_at.strftime("%B %d, %Y, %I:%M %p UTC") if h.changed_at else "N/A",
            "old_salary": "{:,.2f}".format(float(h.old_salary) * rate),
            "new_salary": "{:,.2f}".format(float(h.new_salary) * rate),
            "percentage": f"{float(h.percentage_change):.2f}",
            "amount": "{:,.2f}".format(float(h.amount_change) * rate)
        })

    template = jinja_env.get_template("dossier.html")
    html_content = template.render(
        emp=emp,
        currency_display=currency_symbol,
        current_salary="{:,.2f}".format(float(emp.base_salary) * rate),
        generated_date=datetime.utcnow().strftime("%B %d, %Y, %I:%M %p UTC"),
        history=formatted_history
    )
    
    # Create PDF in memory
    pdf_stream = io.BytesIO()
    pisa_status = pisa.CreatePDF(
        src=html_content,
        dest=pdf_stream
    )
    
    if pisa_status.err:
        raise HTTPException(status_code=500, detail="Failed to generate PDF")
        
    pdf_stream.seek(0)
    
    response = StreamingResponse(iter([pdf_stream.getvalue()]), media_type="application/pdf")
    response.headers["Content-Disposition"] = f"attachment; filename=Employee_Dossier_{emp.id[:8]}.pdf"
    return response
