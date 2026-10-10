from pydantic import BaseModel
from typing import Optional, List, Dict
import uuid

class BulkUpdateSchema(BaseModel):
    department: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    percentage_increase: float

class SweetAlertResponse(BaseModel):
    success: bool
    title: str
    message: str
    detail: Optional[str] = None

class EmployeeCreate(BaseModel):
    first_name: str
    last_name: str
    email: str
    department: str
    country: str
    city: str
    base_salary: float
