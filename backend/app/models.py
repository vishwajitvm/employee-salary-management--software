from sqlalchemy import Column, String, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.database import Base

class Employee(Base):
    __tablename__ = "employees"

    id = Column(String, primary_key=True, default=lambda: uuid.uuid4().hex)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    department = Column(String, index=True, nullable=False)
    country = Column(String, index=True, nullable=False)
    city = Column(String, index=True, nullable=False)
    base_salary = Column(Numeric(10, 2), nullable=False)
    currency = Column(String, default="USD")
    
    # Relationship to salary history
    salary_history = relationship("SalaryHistory", back_populates="employee", cascade="all, delete-orphan")

class SalaryHistory(Base):
    __tablename__ = "salary_history"

    id = Column(String, primary_key=True, default=lambda: uuid.uuid4().hex)
    employee_id = Column(String, ForeignKey("employees.id"), index=True)
    old_salary = Column(Numeric(10, 2), nullable=False)
    new_salary = Column(Numeric(10, 2), nullable=False)
    percentage_change = Column(Numeric(5, 2), nullable=False)
    amount_change = Column(Numeric(10, 2), nullable=False)
    changed_at = Column(DateTime(timezone=True), server_default=func.now())

    employee = relationship("Employee", back_populates="salary_history")
