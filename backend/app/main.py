from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import SQLAlchemyError
from tracenest import logger
from tracenest.ui.router import router as tracenest_router

from app.database import engine, Base
from app.api.routes import router
from app.api.seed import router as seed_router

# Create tables
logger.info("Initializing database metadata...")
try:
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables verified/created successfully.")
except Exception as e:
    logger.critical(f"Failed to initialize database: {str(e)}")

app = FastAPI(title="Employee Salary Management API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning(f"Validation error on {request.url}: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={"success": False, "title": "Validation Error", "message": "Please check the data you submitted.", "detail": str(exc.errors())}
    )

@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    logger.error(f"Database error on {request.url}: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"success": False, "title": "Database Error", "message": "A database operation failed unexpectedly.", "detail": "Our engineers have been notified."}
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.critical(f"Unhandled exception on {request.url}: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"success": False, "title": "Server Error", "message": "An unexpected error occurred.", "detail": str(exc)}
    )

# Include Routers
app.include_router(router, prefix="/api/v1")
app.include_router(seed_router, prefix="/api/v1")
app.include_router(tracenest_router)  # Already has /tracenest prefix

@app.get("/")
def health_check():
    logger.info("Health check endpoint pinged.")
    return {"status": "ok", "message": "Salary Management API is running"}
