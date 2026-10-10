import sys

with open('backend/app/api/routes.py', 'r') as f:
    content = f.read()

new_route = """
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
"""

if "get_single_employee" not in content:
    content = content.replace("@router.get(\"/reports/salary-history\")", new_route + "\n@router.get(\"/reports/salary-history\")")
    with open('backend/app/api/routes.py', 'w') as f:
        f.write(content)
