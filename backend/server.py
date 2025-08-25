from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
import bcrypt
import jwt
from enum import Enum
from fastapi.responses import StreamingResponse
import io
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-this')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# Security
security = HTTPBearer()

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Enums
class UserRole(str, Enum):
    ADMIN = "admin"
    USER = "user"


class DayOfWeek(str, Enum):
    MONDAY = "monday"
    TUESDAY = "tuesday"
    WEDNESDAY = "wednesday"
    THURSDAY = "thursday"
    FRIDAY = "friday"
    SATURDAY = "saturday"
    SUNDAY = "sunday"


# Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class StatusCheckCreate(BaseModel):
    client_name: str


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: UserRole = UserRole.USER


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    full_name: str
    role: UserRole
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Token(BaseModel):
    access_token: str
    token_type: str


class DayHours(BaseModel):
    is_open: bool = True
    open_time: Optional[str] = None  # Format: "09:00"
    close_time: Optional[str] = None  # Format: "17:00"


class HospitalHours(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    monday: DayHours
    tuesday: DayHours
    wednesday: DayHours
    thursday: DayHours
    friday: DayHours
    saturday: DayHours
    sunday: DayHours
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    updated_by: str


class HospitalHoursCreate(BaseModel):
    monday: DayHours
    tuesday: DayHours
    wednesday: DayHours
    thursday: DayHours
    friday: DayHours
    saturday: DayHours
    sunday: DayHours


class UrgentCareHours(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    monday: DayHours
    tuesday: DayHours
    wednesday: DayHours
    thursday: DayHours
    friday: DayHours
    saturday: DayHours
    sunday: DayHours
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    updated_by: str


class UrgentCareHoursCreate(BaseModel):
    monday: DayHours
    tuesday: DayHours
    wednesday: DayHours
    thursday: DayHours
    friday: DayHours
    saturday: DayHours
    sunday: DayHours


class SpecialHours(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    date: str  # Format: "2025-01-01"
    name: str  # e.g., "New Year's Day", "Christmas"
    general_practice: DayHours
    urgent_care: DayHours
    created_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: str


class SpecialHoursCreate(BaseModel):
    date: str
    name: str
    general_practice: DayHours
    urgent_care: DayHours


class UrgentCareAppointment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    appointment_time: str  # Format: "2025-01-15T15:30"
    owner_first_name: str
    owner_last_name: str
    email: str
    phone: str
    pet_name: str
    pet_type: str  # "dog" or "cat"
    reason_for_visit: str
    primary_vet_hospital: str = ""
    how_heard_about_us: str = ""
    status: str = "scheduled"  # "scheduled", "completed", "cancelled", "no_show", "abandoned", "verified", "checked_in"
    created_at: datetime = Field(default_factory=datetime.utcnow)


class UrgentCareAppointmentCreate(BaseModel):
    appointment_time: str
    owner_first_name: str
    owner_last_name: str
    email: str
    phone: str
    pet_name: str
    pet_type: str
    reason_for_visit: str
    primary_vet_hospital: str = ""
    how_heard_about_us: str = ""


class AppointmentListResponse(BaseModel):
    appointments: List[UrgentCareAppointment]
    total_count: int
    page: int
    page_size: int
    total_pages: int


# Auth Utilities
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def verify_password(password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = await db.users.find_one({"id": user_id})
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return User(**user)


async def get_admin_user(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user


# Initialize admin user if not exists
@app.on_event("startup")
async def create_admin_user():
    admin_exists = await db.users.find_one({"role": "admin"})
    if not admin_exists:
        admin_user = User(
            email="admin@hospital.com",
            full_name="Hospital Administrator",
            role=UserRole.ADMIN,
        )
        admin_dict = admin_user.dict()
        admin_dict["password_hash"] = hash_password("admin123")  # Default password
        await db.users.insert_one(admin_dict)
        
        # Create default hospital hours
        default_general_hours = HospitalHours(
            monday=DayHours(is_open=True, open_time="09:00", close_time="18:00"),
            tuesday=DayHours(is_open=True, open_time="09:00", close_time="18:00"),
            wednesday=DayHours(is_open=True, open_time="09:00", close_time="18:00"),
            thursday=DayHours(is_open=True, open_time="09:00", close_time="18:00"),
            friday=DayHours(is_open=True, open_time="09:00", close_time="18:00"),
            saturday=DayHours(is_open=True, open_time="09:00", close_time="17:00"),
            sunday=DayHours(is_open=False),
            updated_by=admin_user.id
        )
        
        default_urgent_hours = UrgentCareHours(
            monday=DayHours(is_open=True, open_time="15:00", close_time="22:00"),
            tuesday=DayHours(is_open=True, open_time="15:00", close_time="22:00"),
            wednesday=DayHours(is_open=True, open_time="15:00", close_time="22:00"),
            thursday=DayHours(is_open=True, open_time="15:00", close_time="22:00"),
            friday=DayHours(is_open=True, open_time="15:00", close_time="22:00"),
            saturday=DayHours(is_open=True, open_time="15:00", close_time="22:00"),
            sunday=DayHours(is_open=True, open_time="15:00", close_time="22:00"),
            updated_by=admin_user.id
        )
        
        await db.hospital_hours.insert_one(default_general_hours.dict())
        await db.urgent_care_hours.insert_one(default_urgent_hours.dict())


# Auth Routes
@api_router.post("/register", response_model=User)
async def register(user_data: UserCreate):
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        role=user_data.role
    )
    user_dict = user.dict()
    user_dict["password_hash"] = hash_password(user_data.password)
    
    await db.users.insert_one(user_dict)
    return user


@api_router.post("/login", response_model=Token)
async def login(login_data: UserLogin):
    user = await db.users.find_one({"email": login_data.email})
    if not user or not verify_password(login_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["id"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@api_router.get("/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user


# Hospital Hours Routes
@api_router.get("/hospital-hours", response_model=HospitalHours)
async def get_hospital_hours():
    hours = await db.hospital_hours.find_one()
    if not hours:
        raise HTTPException(status_code=404, detail="Hospital hours not found")
    return HospitalHours(**hours)


@api_router.put("/hospital-hours", response_model=HospitalHours)
async def update_hospital_hours(
    hours_data: HospitalHoursCreate,
    current_user: User = Depends(get_admin_user)
):
    hours = HospitalHours(
        **hours_data.dict(),
        updated_by=current_user.id
    )
    
    await db.hospital_hours.delete_many({})  # Remove existing
    await db.hospital_hours.insert_one(hours.dict())
    return hours


# Urgent Care Hours Routes
@api_router.get("/urgent-care-hours", response_model=UrgentCareHours)
async def get_urgent_care_hours():
    hours = await db.urgent_care_hours.find_one()
    if not hours:
        raise HTTPException(status_code=404, detail="Urgent care hours not found")
    return UrgentCareHours(**hours)


@api_router.put("/urgent-care-hours", response_model=UrgentCareHours)
async def update_urgent_care_hours(
    hours_data: UrgentCareHoursCreate,
    current_user: User = Depends(get_admin_user)
):
    hours = UrgentCareHours(
        **hours_data.dict(),
        updated_by=current_user.id
    )
    
    await db.urgent_care_hours.delete_many({})  # Remove existing
    await db.urgent_care_hours.insert_one(hours.dict())
    return hours


# Special Hours Routes
@api_router.get("/special-hours", response_model=List[SpecialHours])
async def get_special_hours():
    special_hours = await db.special_hours.find().sort("date", 1).to_list(1000)
    return [SpecialHours(**hours) for hours in special_hours]


@api_router.post("/special-hours", response_model=SpecialHours)
async def create_special_hours(
    special_data: SpecialHoursCreate,
    current_user: User = Depends(get_admin_user)
):
    # Check if special hours already exist for this date
    existing = await db.special_hours.find_one({"date": special_data.date})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Special hours already exist for this date"
        )
    
    special_hours = SpecialHours(
        **special_data.dict(),
        created_by=current_user.id
    )
    
    await db.special_hours.insert_one(special_hours.dict())
    return special_hours


@api_router.put("/special-hours/{special_hours_id}", response_model=SpecialHours)
async def update_special_hours(
    special_hours_id: str,
    special_data: SpecialHoursCreate,
    current_user: User = Depends(get_admin_user)
):
    existing = await db.special_hours.find_one({"id": special_hours_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Special hours not found")
    
    special_hours = SpecialHours(
        id=special_hours_id,
        **special_data.dict(),
        created_by=existing["created_by"],
        created_at=existing["created_at"]
    )
    
    await db.special_hours.replace_one({"id": special_hours_id}, special_hours.dict())
    return special_hours


@api_router.delete("/special-hours/{special_hours_id}")
async def delete_special_hours(
    special_hours_id: str,
    current_user: User = Depends(get_admin_user)
):
    result = await db.special_hours.delete_one({"id": special_hours_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Special hours not found")
    return {"message": "Special hours deleted successfully"}


# Urgent Care Appointments Routes
@api_router.post("/urgent-care-appointments", response_model=UrgentCareAppointment)
async def create_appointment(
    appointment_data: UrgentCareAppointmentCreate
):
    appointment = UrgentCareAppointment(**appointment_data.dict())
    await db.urgent_care_appointments.insert_one(appointment.dict())
    return appointment


@api_router.get("/urgent-care-appointments", response_model=AppointmentListResponse)
async def get_appointments(
    filter_days: Optional[str] = "today",  # today, last_7_days, last_15_days, last_30_days, last_3_months, last_6_months, last_1_year
    page: int = 1,
    page_size: int = 20,
    current_user: User = Depends(get_admin_user)
):
    """Get paginated and filtered appointments"""
    
    # Calculate date range based on filter
    now = datetime.utcnow()
    
    if filter_days == "today":
        start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
        end_date = now.replace(hour=23, minute=59, second=59, microsecond=999999)
    elif filter_days == "last_7_days":
        start_date = (now - timedelta(days=7)).replace(hour=0, minute=0, second=0, microsecond=0)
        end_date = (now - timedelta(days=1)).replace(hour=23, minute=59, second=59, microsecond=999999)
    elif filter_days == "last_15_days":
        start_date = (now - timedelta(days=15)).replace(hour=0, minute=0, second=0, microsecond=0)
        end_date = now.replace(hour=23, minute=59, second=59, microsecond=999999)
    elif filter_days == "last_30_days":
        start_date = (now - timedelta(days=30)).replace(hour=0, minute=0, second=0, microsecond=0)
        end_date = now.replace(hour=23, minute=59, second=59, microsecond=999999)
    elif filter_days == "last_3_months":
        start_date = (now - timedelta(days=90)).replace(hour=0, minute=0, second=0, microsecond=0)
        end_date = now.replace(hour=23, minute=59, second=59, microsecond=999999)
    elif filter_days == "last_6_months":
        start_date = (now - timedelta(days=180)).replace(hour=0, minute=0, second=0, microsecond=0)
        end_date = now.replace(hour=23, minute=59, second=59, microsecond=999999)
    elif filter_days == "last_1_year":
        start_date = (now - timedelta(days=365)).replace(hour=0, minute=0, second=0, microsecond=0)
        end_date = now.replace(hour=23, minute=59, second=59, microsecond=999999)
    else:
        # Default to today
        start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
        end_date = now.replace(hour=23, minute=59, second=59, microsecond=999999)
    
    # Build filter query
    filter_query = {
        "created_at": {
            "$gte": start_date,
            "$lte": end_date
        }
    }
    
    # Get total count
    total_count = await db.urgent_care_appointments.count_documents(filter_query)
    
    # Calculate pagination
    skip = (page - 1) * page_size
    total_pages = (total_count + page_size - 1) // page_size
    
    # Get appointments with pagination
    appointments_data = await db.urgent_care_appointments.find(filter_query).sort("appointment_time", -1).skip(skip).limit(page_size).to_list(page_size)
    
    appointments = [UrgentCareAppointment(**appointment) for appointment in appointments_data]
    
    return AppointmentListResponse(
        appointments=appointments,
        total_count=total_count,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@api_router.get("/urgent-care-appointments/{appointment_id}", response_model=UrgentCareAppointment)
async def get_appointment_details(
    appointment_id: str,
    current_user: User = Depends(get_admin_user)
):
    appointment = await db.urgent_care_appointments.find_one({"id": appointment_id})
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return UrgentCareAppointment(**appointment)


@api_router.delete("/urgent-care-appointments/{appointment_id}")
async def delete_appointment(
    appointment_id: str,
    current_user: User = Depends(get_admin_user)
):
    """Delete an urgent care appointment and free up the time slot"""
    appointment = await db.urgent_care_appointments.find_one({"id": appointment_id})
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    # Delete the appointment
    result = await db.urgent_care_appointments.delete_one({"id": appointment_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    return {"message": "Appointment deleted successfully", "freed_slot": appointment.get("appointment_time")}


@api_router.patch("/urgent-care-appointments/{appointment_id}/status")
async def update_appointment_status(
    appointment_id: str,
    status: str,
    current_user: User = Depends(get_admin_user)
):
    """Update appointment status (scheduled, completed, cancelled, no_show, abandoned)"""
    
    valid_statuses = ["scheduled", "completed", "cancelled", "no_show", "abandoned", "verified", "checked_in"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    appointment = await db.urgent_care_appointments.find_one({"id": appointment_id})
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    # Update the appointment status
    result = await db.urgent_care_appointments.update_one(
        {"id": appointment_id},
        {"$set": {"status": status}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    # If status is abandoned, the time slot becomes available again
    freed_slot = None
    if status == "abandoned":
        freed_slot = appointment.get("appointment_time")
    
    return {
        "message": f"Appointment status updated to {status}",
        "status": status,
        "freed_slot": freed_slot
    }


@api_router.get("/urgent-care-time-slots/{date}")
async def get_available_time_slots(date: str):
    """Get available time slots for urgent care booking for a specific date"""
    try:
        # FOR TESTING - Return some sample time slots for today
        from datetime import datetime, timedelta
        today_str = datetime.now().strftime("%Y-%m-%d")
        
        if date == today_str:
            # Generate some test time slots for today
            current_time = datetime.now()
            test_slots = []
            
            # Start from next hour, rounded to 30-minute intervals
            start_time = current_time.replace(minute=0 if current_time.minute < 30 else 30, second=0, microsecond=0)
            if start_time <= current_time:
                start_time += timedelta(minutes=30)
            
            # Generate 12 time slots (6 hours worth)
            for i in range(12):
                slot_time = start_time + timedelta(minutes=30 * i)
                test_slots.append({
                    "time": slot_time.strftime("%H:%M"),
                    "value": slot_time.strftime("%Y-%m-%dT%H:%M")
                })
            
            return {
                "available": True,
                "slots": test_slots,
                "date": date
            }
        else:
            return {"available": False, "message": "Test slots only available for today"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Combined Hours API for frontend consumption
@api_router.get("/hours/current")
async def get_current_hours():
    """Get current operating hours including any special hours for today"""
    today = datetime.now().strftime("%Y-%m-%d")
    
    # Check for special hours today
    special_today = await db.special_hours.find_one({"date": today})
    
    if special_today:
        return {
            "type": "special",
            "name": special_today["name"],
            "date": special_today["date"],
            "general_practice": special_today["general_practice"],
            "urgent_care": special_today["urgent_care"]
        }
    
    # Get regular hours
    hospital_hours = await db.hospital_hours.find_one()
    urgent_hours = await db.urgent_care_hours.find_one()
    
    if not hospital_hours or not urgent_hours:
        raise HTTPException(status_code=404, detail="Hours not configured")
    
    # Get today's day of week
    day_names = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    today_day = day_names[datetime.now().weekday()]
    
    return {
        "type": "regular",
        "day": today_day,
        "general_practice": hospital_hours[today_day],
        "urgent_care": urgent_hours[today_day]
    }


# Original routes
@api_router.get("/")
async def root():
    return {"message": "Hospital Management API"}


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()