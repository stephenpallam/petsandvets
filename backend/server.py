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


class PetInfo(BaseModel):
    pet_name: str
    pet_species: str  # Dog, Cat, Other
    pet_breed: Optional[str] = ""
    pet_gender: str  # Male, Female
    pet_age: str
    pet_weight: Optional[str] = ""
    pet_color: Optional[str] = ""
    spayed_neutered: Optional[str] = ""  # Yes, No, Unknown
    current_medications: Optional[str] = ""
    allergies: Optional[str] = ""
    vaccination_history: Optional[str] = ""
    medical_conditions: Optional[str] = ""


class PatientRegistrationForm(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Owner Information
    owner_first_name: str
    owner_last_name: str
    address: str
    city: str
    state: str
    zip_code: str
    email: str
    phone: str
    emergency_contact_name: Optional[str] = ""
    emergency_contact_phone: Optional[str] = ""
    
    # Multiple Pets Information (up to 4 pets)
    pets: List[PetInfo] = Field(..., min_items=1, max_items=4)
    
    # Medical History (shared across pets or general)
    previous_vet: Optional[str] = ""
    previous_vet_phone: Optional[str] = ""
    last_visit_date: Optional[str] = ""
    
    # Additional Information
    how_heard_about_us: Optional[str] = ""
    preferred_appointment_type: Optional[str] = ""
    special_instructions: Optional[str] = ""


class PatientRegistrationRequest(BaseModel):
    owner_first_name: str
    owner_last_name: str
    address: str
    city: str
    state: str
    zip_code: str
    email: str
    phone: str
    emergency_contact_name: Optional[str] = ""
    emergency_contact_phone: Optional[str] = ""
    pets: List[PetInfo] = Field(..., min_items=1, max_items=4)
    previous_vet: Optional[str] = ""
    previous_vet_phone: Optional[str] = ""
    last_visit_date: Optional[str] = ""
    how_heard_about_us: Optional[str] = ""
    preferred_appointment_type: Optional[str] = ""
    special_instructions: Optional[str] = ""


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


def generate_pdf(form_data: PatientRegistrationForm) -> bytes:
    """Generate a PDF from the patient registration form data"""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=18,
        spaceAfter=30,
        textColor=colors.HexColor('#29add3'),
        alignment=1  # Center alignment
    )
    
    section_style = ParagraphStyle(
        'SectionHeader',
        parent=styles['Heading2'],
        fontSize=14,
        spaceAfter=12,
        textColor=colors.HexColor('#333333'),
        borderWidth=1,
        borderColor=colors.HexColor('#29add3'),
        backColor=colors.HexColor('#f0f9ff'),
        leftIndent=10,
        spaceBefore=20
    )
    
    # Title
    story.append(Paragraph("New Patient Registration Form", title_style))
    story.append(Spacer(1, 12))
    
    # Form submission info
    story.append(Paragraph(f"Submitted on: {form_data.created_at.strftime('%B %d, %Y at %I:%M %p')}", styles['Normal']))
    story.append(Paragraph(f"Registration ID: {form_data.id}", styles['Normal']))
    story.append(Spacer(1, 20))
    
    # Owner Information Section
    story.append(Paragraph("Pet Owner Information", section_style))
    owner_data = [
        ['Name:', f"{form_data.owner_first_name} {form_data.owner_last_name}"],
        ['Address:', f"{form_data.address}"],
        ['City, State, ZIP:', f"{form_data.city}, {form_data.state} {form_data.zip_code}"],
        ['Email:', form_data.email],
        ['Phone:', form_data.phone],
        ['Emergency Contact:', form_data.emergency_contact_name or 'Not provided'],
        ['Emergency Phone:', form_data.emergency_contact_phone or 'Not provided'],
    ]
    
    owner_table = Table(owner_data, colWidths=[2*inch, 4*inch])
    owner_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f8f9fa')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e5e7eb')),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(owner_table)
    story.append(Spacer(1, 20))
    
    # Pet Information Section - Multiple Pets
    story.append(Paragraph("Pet Information", section_style))
    
    for i, pet in enumerate(form_data.pets, 1):
        # Pet header
        pet_header_style = ParagraphStyle(
            'PetHeader',
            parent=styles['Heading3'],
            fontSize=12,
            spaceAfter=8,
            textColor=colors.HexColor('#29add3'),
            spaceBefore=10 if i > 1 else 0
        )
        story.append(Paragraph(f"Pet {i}: {pet.pet_name}", pet_header_style))
        
        pet_data = [
            ['Species:', pet.pet_species],
            ['Breed:', pet.pet_breed or 'Not specified'],
            ['Gender:', pet.pet_gender],
            ['Age:', pet.pet_age],
            ['Weight:', pet.pet_weight or 'Not provided'],
            ['Color:', pet.pet_color or 'Not provided'],
            ['Spayed/Neutered:', pet.spayed_neutered or 'Unknown'],
        ]
        
        # Add medical info if provided
        if pet.current_medications:
            pet_data.append(['Current Medications:', pet.current_medications])
        if pet.allergies:
            pet_data.append(['Allergies:', pet.allergies])
        if pet.vaccination_history:
            pet_data.append(['Vaccination History:', pet.vaccination_history])
        if pet.medical_conditions:
            pet_data.append(['Medical Conditions:', pet.medical_conditions])
        
        pet_table = Table(pet_data, colWidths=[2*inch, 4*inch])
        pet_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f8f9fa')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e5e7eb')),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(pet_table)
        
        if i < len(form_data.pets):
            story.append(Spacer(1, 10))
    
    story.append(Spacer(1, 20))
    
    # Veterinary History Section (shared)
    story.append(Paragraph("Veterinary History", section_style))
    vet_data = [
        ['Previous Veterinarian:', form_data.previous_vet or 'Not provided'],
        ['Previous Vet Phone:', form_data.previous_vet_phone or 'Not provided'],
        ['Last Visit Date:', form_data.last_visit_date or 'Not provided'],
    ]
    
    vet_table = Table(vet_data, colWidths=[2*inch, 4*inch])
    vet_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f8f9fa')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e5e7eb')),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(vet_table)
    story.append(Spacer(1, 20))
    
    # Additional Information Section
    if any([form_data.how_heard_about_us, form_data.preferred_appointment_type, form_data.special_instructions]):
        story.append(Paragraph("Additional Information", section_style))
        additional_data = []
        
        if form_data.how_heard_about_us:
            additional_data.append(['How did you hear about us:', form_data.how_heard_about_us])
        if form_data.preferred_appointment_type:
            additional_data.append(['Preferred Appointment Type:', form_data.preferred_appointment_type])
        if form_data.special_instructions:
            additional_data.append(['Special Instructions:', form_data.special_instructions])
            
        if additional_data:
            additional_table = Table(additional_data, colWidths=[2*inch, 4*inch])
            additional_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f8f9fa')),
                ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e5e7eb')),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('LEFTPADDING', (0, 0), (-1, -1), 8),
                ('RIGHTPADDING', (0, 0), (-1, -1), 8),
                ('TOPPADDING', (0, 0), (-1, -1), 6),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ]))
            story.append(additional_table)
    
    # Footer
    story.append(Spacer(1, 30))
    story.append(Paragraph("Thank you for choosing our veterinary services!", styles['Normal']))
    story.append(Paragraph("Please bring this form to your appointment.", styles['Normal']))
    
    # Build PDF
    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()


# Patient Registration Form Routes
@api_router.post("/patient-registration")
async def submit_patient_registration(form_data: PatientRegistrationRequest):
    """Submit patient registration form and store in database"""
    registration = PatientRegistrationForm(**form_data.dict())
    await db.patient_registrations.insert_one(registration.dict())
    return {
        "message": "Registration submitted successfully",
        "registration_id": registration.id
    }


@api_router.post("/patient-registration/pdf")
async def generate_registration_pdf(form_data: PatientRegistrationRequest):
    """Generate and return PDF for patient registration form"""
    registration = PatientRegistrationForm(**form_data.dict())
    
    # Store in database
    await db.patient_registrations.insert_one(registration.dict())
    
    # Generate PDF
    pdf_bytes = generate_pdf(registration)
    
    # Create streaming response
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=patient_registration_{form_data.owner_last_name}_{registration.id[:8]}.pdf"
        }
    )


@api_router.get("/patient-registration/{registration_id}/pdf")
async def get_registration_pdf(registration_id: str):
    """Get PDF for existing registration"""
    registration_data = await db.patient_registrations.find_one({"id": registration_id})
    if not registration_data:
        raise HTTPException(status_code=404, detail="Registration not found")
    
    registration = PatientRegistrationForm(**registration_data)
    pdf_bytes = generate_pdf(registration)
    
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=patient_registration_{registration.pet_name}_{registration.id[:8]}.pdf"
        }
    )


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