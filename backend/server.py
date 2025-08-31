from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import shutil
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
import bcrypt
import jwt
import secrets
from enum import Enum
from fastapi.responses import StreamingResponse
import io
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import logging


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Google Business Profile Service
class GoogleBusinessService:
    def __init__(self):
        self.scopes = ['https://www.googleapis.com/auth/business.manage']
        self.redirect_uri = None  # Will be set dynamically
        
    def create_oauth_flow(self, client_id: str, client_secret: str, redirect_uri: str):
        """Create OAuth flow for Google Business Profile API"""
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": client_id,
                    "client_secret": client_secret,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [redirect_uri]
                }
            },
            scopes=self.scopes
        )
        flow.redirect_uri = redirect_uri
        return flow
    
    def get_auth_url(self, client_id: str, client_secret: str, redirect_uri: str, state: str):
        """Get authorization URL for OAuth flow"""
        flow = self.create_oauth_flow(client_id, client_secret, redirect_uri)
        auth_url, _ = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            state=state
        )
        return auth_url
    
    def exchange_code_for_tokens(self, client_id: str, client_secret: str, 
                               redirect_uri: str, code: str):
        """Exchange authorization code for access and refresh tokens"""
        flow = self.create_oauth_flow(client_id, client_secret, redirect_uri)
        flow.fetch_token(code=code)
        return flow.credentials
    
    def refresh_access_token(self, client_id: str, client_secret: str, refresh_token: str):
        """Refresh expired access token"""
        credentials = Credentials(
            token=None,
            refresh_token=refresh_token,
            client_id=client_id,
            client_secret=client_secret,
            token_uri="https://oauth2.googleapis.com/token"
        )
        credentials.refresh(Request())
        return credentials
    
    def get_business_service(self, access_token: str):
        """Get authenticated Google Business Profile service"""
        credentials = Credentials(token=access_token)
        return build('mybusinessbusinessinformation', 'v1', credentials=credentials)
    
    async def sync_business_hours(self, access_token: str, location_id: str, 
                                hours_data: dict, sync_type: str):
        """Sync business hours to Google Business Profile"""
        try:
            service = self.get_business_service(access_token)
            
            # Convert hours data to Google format
            google_hours = self.convert_to_google_hours_format(hours_data, sync_type)
            
            # Update location hours
            location_name = f"locations/{location_id}"
            request_body = {
                "regularHours": google_hours
            }
            
            result = service.locations().patch(
                name=location_name,
                body=request_body,
                updateMask="regularHours"
            ).execute()
            
            return {"success": True, "result": result}
            
        except HttpError as e:
            return {"success": False, "error": str(e)}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def convert_to_google_hours_format(self, hours_data: dict, sync_type: str):
        """Convert internal hours format to Google Business hours format"""
        google_hours = {
            "periods": []
        }
        
        # Days mapping
        day_mapping = {
            "monday": "MONDAY",
            "tuesday": "TUESDAY", 
            "wednesday": "WEDNESDAY",
            "thursday": "THURSDAY",
            "friday": "FRIDAY",
            "saturday": "SATURDAY",
            "sunday": "SUNDAY"
        }
        
        for day, hours in hours_data.items():
            if day in day_mapping and hours and not hours.lower().strip() in ['closed', '']:
                try:
                    # Parse hours like "9:00 AM - 6:00 PM"
                    if ' - ' in hours:
                        open_time, close_time = hours.split(' - ')
                        open_time = self.parse_time_to_google_format(open_time.strip())
                        close_time = self.parse_time_to_google_format(close_time.strip())
                        
                        google_hours["periods"].append({
                            "openDay": day_mapping[day],
                            "openTime": open_time,
                            "closeDay": day_mapping[day], 
                            "closeTime": close_time
                        })
                except Exception as e:
                    logging.error(f"Error parsing hours for {day}: {e}")
                    continue
        
        return google_hours
    
    def parse_time_to_google_format(self, time_str: str):
        """Parse time string like '9:00 AM' to Google format like '09:00'"""
        try:
            from datetime import datetime
            # Parse the time string
            time_obj = datetime.strptime(time_str, '%I:%M %p')
            # Return in 24-hour format
            return time_obj.strftime('%H:%M')
        except:
            # Fallback for different formats
            return time_str.replace(' ', '')

google_service = GoogleBusinessService()


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
    MANAGER = "manager"
    TECHNICIAN = "technician"
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


class Review(BaseModel):
    id: str
    text: str
    pet_name: str
    owner_name: str
    rating: int = 5  # Always 5 stars as per requirement
    created_at: datetime
    updated_at: datetime


class ReviewCreate(BaseModel):
    text: str
    pet_name: str
    owner_name: str


class ReviewUpdate(BaseModel):
    text: Optional[str] = None
    pet_name: Optional[str] = None
    owner_name: Optional[str] = None


class ReviewsResponse(BaseModel):
    reviews: List[Review]


class BusinessInfo(BaseModel):
    id: str
    hospital_name: str
    tagline: str
    phone: str
    email: str
    address: str
    facebook_link: Optional[str] = ""
    instagram_link: Optional[str] = ""
    twitter_link: Optional[str] = ""
    hero_images: Optional[List[str]] = []  # URLs for home page slider images
    created_at: datetime
    updated_at: datetime


class BusinessInfoUpdate(BaseModel):
    hospital_name: Optional[str] = None
    tagline: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    facebook_link: Optional[str] = None
    instagram_link: Optional[str] = None
    twitter_link: Optional[str] = None
    hero_images: Optional[List[str]] = None


class TeamMember(BaseModel):
    id: str
    name: str
    title: str
    bio: str
    credentials: str
    photo_url: str
    order: Optional[int] = 0  # For ordering team members
    created_at: datetime
    updated_at: datetime


class TeamMemberCreate(BaseModel):
    name: str
    title: str
    bio: str
    credentials: str
    photo_url: str
    order: Optional[int] = 0


class TeamMemberUpdate(BaseModel):
    name: Optional[str] = None
    title: Optional[str] = None
    bio: Optional[str] = None
    credentials: Optional[str] = None
    photo_url: Optional[str] = None
    order: Optional[int] = None


class TeamMembersResponse(BaseModel):
    team_members: List[TeamMember]


class FacilityPhoto(BaseModel):
    id: str
    title: str
    description: str  
    photo_url: str
    order: Optional[int] = 0  # For ordering facility photos
    created_at: datetime
    updated_at: datetime


class FacilityPhotoCreate(BaseModel):
    title: str
    description: str
    photo_url: str
    order: Optional[int] = 0


class FacilityPhotoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    photo_url: Optional[str] = None
    order: Optional[int] = None


class FacilityPhotosResponse(BaseModel):
    facility_photos: List[FacilityPhoto]


class SliderImage(BaseModel):
    id: str
    title: str
    description: str  
    image_url: str
    order: Optional[int] = 0  # For ordering slider images
    created_at: datetime
    updated_at: datetime


class SliderImageCreate(BaseModel):
    title: str
    description: str
    image_url: str
    order: Optional[int] = 0


class SliderImageUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    order: Optional[int] = None


class SliderImagesResponse(BaseModel):
    slider_images: List[SliderImage]


# Google Business Profile Integration Models
class GoogleBusinessSettings(BaseModel):
    id: str
    client_id: str
    client_secret: str
    refresh_token: Optional[str] = None
    access_token: Optional[str] = None
    token_expiry: Optional[datetime] = None
    account_id: Optional[str] = None
    location_id: Optional[str] = None
    is_connected: bool = False
    auto_sync_enabled: bool = True
    last_sync_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class GoogleBusinessSettingsCreate(BaseModel):
    client_id: str
    client_secret: str
    auto_sync_enabled: Optional[bool] = True


class GoogleBusinessSettingsUpdate(BaseModel):
    client_id: Optional[str] = None
    client_secret: Optional[str] = None  
    auto_sync_enabled: Optional[bool] = None


class GoogleSyncLog(BaseModel):
    id: str
    sync_type: str  # "hours", "business_info", "manual", "auto"
    status: str     # "success", "failed", "partial"
    message: str
    details: Optional[dict] = None
    synced_at: datetime


class GoogleSyncLogsResponse(BaseModel):
    sync_logs: List[GoogleSyncLog]


class GoogleAuthUrl(BaseModel):
    auth_url: str
    state: str


class GoogleAuthCallback(BaseModel):
    code: str
    state: str


class GoogleSyncRequest(BaseModel):
    sync_type: str  # "general_practice", "urgent_care", "special_hours", "business_info"


class GoogleSyncResponse(BaseModel):
    success: bool
    message: str
    details: Optional[dict] = None


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


async def get_manager_or_admin_user(current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user


async def get_staff_user(current_user: User = Depends(get_current_user)):
    """Allow admin, manager, or technician access"""
    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER, UserRole.TECHNICIAN]:
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
    current_user: User = Depends(get_manager_or_admin_user)
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
    current_user: User = Depends(get_manager_or_admin_user)
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
    current_user: User = Depends(get_manager_or_admin_user)
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
    current_user: User = Depends(get_manager_or_admin_user)
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
    current_user: User = Depends(get_manager_or_admin_user)
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
    current_user: User = Depends(get_staff_user)  # Changed from get_admin_user
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
    current_user: User = Depends(get_staff_user)  # Changed from get_admin_user
):
    appointment = await db.urgent_care_appointments.find_one({"id": appointment_id})
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return UrgentCareAppointment(**appointment)


@api_router.delete("/urgent-care-appointments/{appointment_id}")
async def delete_appointment(
    appointment_id: str,
    current_user: User = Depends(get_staff_user)  # Changed from get_manager_or_admin_user to allow technicians
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
    current_user: User = Depends(get_staff_user)  # Changed from get_admin_user
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
    """Generate a compact PDF matching the original form layout exactly"""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, 
        pagesize=letter,
        rightMargin=0.75*inch,
        leftMargin=0.75*inch,
        topMargin=0.6*inch,
        bottomMargin=0.6*inch
    )
    styles = getSampleStyleSheet()
    story = []
    
    # Header Section - Phone and Fax
    header_style = ParagraphStyle(
        'HeaderStyle',
        parent=styles['Normal'],
        fontSize=12,
        fontName='Helvetica-Bold',
        alignment=1,  # Center
        spaceAfter=20
    )
    
    story.append(Paragraph("Phone: 703-957-3297 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Fax: 703-957-3450", header_style))
    
    # Client Information Section
    client_section_style = ParagraphStyle(
        'ClientSection',
        parent=styles['Normal'],
        fontSize=12,
        fontName='Helvetica-Bold',
        spaceAfter=8,
        spaceBefore=10
    )
    
    story.append(Paragraph("Client Information", client_section_style))
    
    # Create client info table matching the original layout
    client_data = [
        [f"Name: {form_data.owner_first_name} {form_data.owner_last_name}", f"Cell: {form_data.phone}"],
        [f"Address: {form_data.address}", f"Email: {form_data.email}"],
        [f"City: {form_data.city}", ""],
        [f"State: {form_data.state}", f"Zip: {form_data.zip_code}"],
        [f"Emergency Contact: {form_data.emergency_contact_name or ''}", f"Emergency Phone: {form_data.emergency_contact_phone or ''}"],
    ]
    
    # Only add emergency contact rows if data exists
    if not form_data.emergency_contact_name and not form_data.emergency_contact_phone:
        client_data = client_data[:-1]  # Remove the empty emergency contact row
    
    client_table = Table(client_data, colWidths=[4*inch, 3*inch])
    client_table.setStyle(TableStyle([
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 2),
        ('RIGHTPADDING', (0, 0), (-1, -1), 2),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
    ]))
    story.append(client_table)
    
    story.append(Spacer(1, 15))
    
    # Pet Information Section
    story.append(Paragraph("Pet Information", client_section_style))
    
    # Create pet info table matching original format
    # Process up to 4 pets, each pet gets its own table section
    for i, pet in enumerate(form_data.pets[:4], 1):  # Limit to 4 pets
        pet_header_data = [[f"Pet {i}"]]
        pet_header_table = Table(pet_header_data, colWidths=[7*inch])
        pet_header_table.setStyle(TableStyle([
            ('FONTSIZE', (0, 0), (-1, -1), 11),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 3),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ]))
        story.append(pet_header_table)
        
        # Pet details in the original compact format
        pet_details_data = [
            [f"Pet Name: {pet.pet_name}"],
            [f"Species: {pet.pet_species} &nbsp;&nbsp;&nbsp; Age: {pet.pet_age}"],
            [f"Breed: {pet.pet_breed or 'Not specified'} &nbsp;&nbsp;&nbsp; Sex: {pet.pet_gender}"],
        ]
        
        # Add spayed/neutered info if provided
        if pet.spayed_neutered:
            pet_details_data.append([f"Spayed/Neutered: {pet.spayed_neutered}"])
        
        pet_details_table = Table(pet_details_data, colWidths=[7*inch])
        pet_details_table.setStyle(TableStyle([
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 3),
            ('RIGHTPADDING', (0, 0), (-1, -1), 3),
            ('TOPPADDING', (0, 0), (-1, -1), 2),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ]))
        story.append(pet_details_table)
        
        # Add small space between pets
        if i < len(form_data.pets) and i < 4:
            story.append(Spacer(1, 3))
    
    # Add empty pet slots if less than 4 pets (to match original form)
    for i in range(len(form_data.pets) + 1, 5):  # Fill up to Pet 4
        story.append(Spacer(1, 3))
        
        pet_header_data = [[f"Pet {i}"]]
        pet_header_table = Table(pet_header_data, colWidths=[7*inch])
        pet_header_table.setStyle(TableStyle([
            ('FONTSIZE', (0, 0), (-1, -1), 11),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 3),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ]))
        story.append(pet_header_table)
        
        # Empty pet details
        empty_pet_data = [
            ["Pet Name:"],
            ["Species: &nbsp;&nbsp;&nbsp; Age:"],
            ["Breed: &nbsp;&nbsp;&nbsp; Sex:"],
        ]
        
        empty_pet_table = Table(empty_pet_data, colWidths=[7*inch])
        empty_pet_table.setStyle(TableStyle([
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 3),
            ('RIGHTPADDING', (0, 0), (-1, -1), 3),
            ('TOPPADDING', (0, 0), (-1, -1), 2),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ]))
        story.append(empty_pet_table)
    
    # Add veterinary history if provided
    if form_data.previous_vet or form_data.previous_vet_phone:
        story.append(Spacer(1, 15))
        
        vet_section_style = ParagraphStyle(
            'VetSection',
            parent=styles['Normal'],
            fontSize=11,
            fontName='Helvetica-Bold',
            spaceAfter=8
        )
        
        story.append(Paragraph("Veterinary History", vet_section_style))
        
        vet_data = [
            [f"Previous Veterinarian: {form_data.previous_vet or ''}", f"Phone: {form_data.previous_vet_phone or ''}"],
        ]
        
        vet_table = Table(vet_data, colWidths=[4*inch, 3*inch])
        vet_table.setStyle(TableStyle([
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 3),
            ('RIGHTPADDING', (0, 0), (-1, -1), 3),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ]))
        story.append(vet_table)
    
    # Footer section - add space and payment policy
    story.append(Spacer(1, 25))
    
    footer_style = ParagraphStyle(
        'FooterStyle',
        parent=styles['Normal'],
        fontSize=10,
        fontName='Helvetica',
        alignment=1,  # Center
        leading=12
    )
    
    story.append(Paragraph(
        "All payments are due at the time of service rendered. We accept cash, checks, all major credit cards & Care Credit which can be approved in as little as 10 minutes.",
        footer_style
    ))
    
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
            "Content-Disposition": f"attachment; filename=patient_registration_{registration.owner_last_name}_{registration.id[:8]}.pdf"
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


# Reviews API endpoints
@api_router.get("/reviews", response_model=ReviewsResponse)
async def get_reviews():
    """Get all reviews (public endpoint for home page)"""
    reviews_data = await db.reviews.find().sort("created_at", -1).to_list(3)  # Only return 3 reviews
    reviews = [Review(**review) for review in reviews_data]
    return ReviewsResponse(reviews=reviews)


@api_router.get("/reviews/manage", response_model=ReviewsResponse)
async def get_reviews_for_management(current_user: User = Depends(get_manager_or_admin_user)):
    """Get all reviews for manager/admin management"""
    reviews_data = await db.reviews.find().sort("created_at", -1).to_list(10)
    reviews = [Review(**review) for review in reviews_data]
    return ReviewsResponse(reviews=reviews)


@api_router.post("/reviews", response_model=Review)
async def create_review(review_data: ReviewCreate, current_user: User = Depends(get_manager_or_admin_user)):
    """Create a new review (admin only)"""
    
    # Check if we already have 3 reviews
    existing_count = await db.reviews.count_documents({})
    if existing_count >= 3:
        raise HTTPException(
            status_code=400, 
            detail="Maximum of 3 reviews allowed. Please delete an existing review first."
        )
    
    now = datetime.utcnow()
    review = Review(
        id=str(uuid.uuid4()),
        text=review_data.text,
        pet_name=review_data.pet_name,
        owner_name=review_data.owner_name,
        rating=5,  # Always 5 stars
        created_at=now,
        updated_at=now
    )
    
    await db.reviews.insert_one(review.dict())
    return review


@api_router.put("/reviews/{review_id}", response_model=Review)
async def update_review(
    review_id: str, 
    review_data: ReviewUpdate, 
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Update a review (admin only)"""
    existing_review = await db.reviews.find_one({"id": review_id})
    if not existing_review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    update_data = {}
    if review_data.text is not None:
        update_data["text"] = review_data.text
    if review_data.pet_name is not None:
        update_data["pet_name"] = review_data.pet_name
    if review_data.owner_name is not None:
        update_data["owner_name"] = review_data.owner_name
    
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        await db.reviews.update_one({"id": review_id}, {"$set": update_data})
        
        # Get updated review
        updated_review_data = await db.reviews.find_one({"id": review_id})
        return Review(**updated_review_data)
    
    return Review(**existing_review)


@api_router.delete("/reviews/{review_id}")
async def delete_review(review_id: str, current_user: User = Depends(get_manager_or_admin_user)):
    """Delete a review (admin only)"""
    result = await db.reviews.delete_one({"id": review_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Review not found")
    
    return {"message": "Review deleted successfully"}


# Business Information API endpoints
@api_router.get("/business-info", response_model=BusinessInfo)
async def get_business_info():
    """Get business information (public endpoint)"""
    business_info = await db.business_info.find_one()
    
    if not business_info:
        # Return default values if no business info exists
        now = datetime.utcnow()
        default_info = BusinessInfo(
            id=str(uuid.uuid4()),
            hospital_name="Pets and Vets Animal Hospital & Urgent Care",
            tagline="Compassionate Care for Your Beloved Pets", 
            phone="(703) 957-3297",
            email="vet@petsandvetsanimalhospital.com",
            address="43114 Peacock Market Plaza, Suite F110, South Riding, VA 20152",
            facebook_link="",
            instagram_link="",
            twitter_link="",
            hero_images=[
                "https://customer-assets.emergentagent.com/job_peacock-pet-care/artifacts/ulwulpak_emilee.png",
                "https://customer-assets.emergentagent.com/job_peacock-pet-care/artifacts/ej59vv47_vanama.png"
            ],
            created_at=now,
            updated_at=now
        )
        # Save default to database
        await db.business_info.insert_one(default_info.dict())
        return default_info
    
    return BusinessInfo(**business_info)


@api_router.put("/business-info", response_model=BusinessInfo)
async def update_business_info(
    business_data: BusinessInfoUpdate, 
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Update business information (admin only)"""
    
    # Get existing business info
    existing_info = await db.business_info.find_one()
    
    if not existing_info:
        # Create new business info if doesn't exist
        now = datetime.utcnow()
        new_info = BusinessInfo(
            id=str(uuid.uuid4()),
            hospital_name=business_data.hospital_name or "Pets and Vets Animal Hospital & Urgent Care",
            tagline=business_data.tagline or "Compassionate Care for Your Beloved Pets",
            phone=business_data.phone or "(703) 957-3297", 
            email=business_data.email or "vet@petsandvetsanimalhospital.com",
            address=business_data.address or "43114 Peacock Market Plaza, Suite F110, South Riding, VA 20152",
            facebook_link=business_data.facebook_link or "",
            instagram_link=business_data.instagram_link or "",
            twitter_link=business_data.twitter_link or "",
            hero_images=business_data.hero_images or [
                "https://customer-assets.emergentagent.com/job_peacock-pet-care/artifacts/ulwulpak_emilee.png",
                "https://customer-assets.emergentagent.com/job_peacock-pet-care/artifacts/ej59vv47_vanama.png"
            ],
            created_at=now,
            updated_at=now
        )
        await db.business_info.insert_one(new_info.dict())
        return new_info
    
    # Update existing business info
    update_data = {}
    if business_data.hospital_name is not None:
        update_data["hospital_name"] = business_data.hospital_name
    if business_data.tagline is not None:
        update_data["tagline"] = business_data.tagline
    if business_data.phone is not None:
        update_data["phone"] = business_data.phone
    if business_data.email is not None:
        update_data["email"] = business_data.email
    if business_data.address is not None:
        update_data["address"] = business_data.address
    if business_data.facebook_link is not None:
        update_data["facebook_link"] = business_data.facebook_link
    if business_data.instagram_link is not None:
        update_data["instagram_link"] = business_data.instagram_link
    if business_data.twitter_link is not None:
        update_data["twitter_link"] = business_data.twitter_link
    if business_data.hero_images is not None:
        update_data["hero_images"] = business_data.hero_images
    
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        await db.business_info.update_one({}, {"$set": update_data})
        
        # Get updated business info
        updated_info = await db.business_info.find_one()
        return BusinessInfo(**updated_info)
    
    return BusinessInfo(**existing_info)


# File Upload API endpoints
UPLOAD_DIR = Path("/app/data/upload/photos")
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

def validate_file(file: UploadFile, category: str) -> str:
    """Validate uploaded file and return the save path"""
    # Check file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Check file size
    if file.size and file.size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE // (1024*1024)}MB"
        )
    
    # Validate category
    valid_categories = ["homepageslider", "team", "facility"]
    if category not in valid_categories:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid category. Allowed: {', '.join(valid_categories)}"
        )
    
    # Generate safe filename
    import time
    timestamp = int(time.time())
    safe_filename = f"{timestamp}_{file.filename}"
    
    return str(UPLOAD_DIR / category / safe_filename)


@api_router.post("/upload/{category}")
async def upload_file(
    category: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Upload a file to specified category folder (admin only)"""
    
    # Validate file and get save path
    file_path = validate_file(file, category)
    
    # Create directory if it doesn't exist
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    
    try:
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Return file info including URL
        filename = os.path.basename(file_path)
        file_url = f"/api/files/{category}/{filename}"
        
        return {
            "filename": filename,
            "category": category,
            "url": file_url,
            "size": os.path.getsize(file_path),
            "message": "File uploaded successfully"
        }
        
    except Exception as e:
        # Clean up file if something went wrong
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@api_router.get("/files/{category}/{filename}")
async def get_file(category: str, filename: str):
    """Serve uploaded files (public endpoint)"""
    valid_categories = ["homepageslider", "team", "facility"]
    if category not in valid_categories:
        raise HTTPException(status_code=404, detail="Category not found")
    
    file_path = UPLOAD_DIR / category / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(file_path)


@api_router.get("/files/{category}")
async def list_files(category: str, current_user: User = Depends(get_manager_or_admin_user)):
    """List all files in a category (admin only)"""
    valid_categories = ["homepageslider", "team", "facility"]
    if category not in valid_categories:
        raise HTTPException(status_code=404, detail="Category not found")
    
    category_path = UPLOAD_DIR / category
    files = []
    
    if category_path.exists():
        for file_path in category_path.glob("*"):
            if file_path.is_file() and file_path.suffix.lower() in ALLOWED_EXTENSIONS:
                files.append({
                    "filename": file_path.name,
                    "url": f"/api/files/{category}/{file_path.name}",
                    "size": file_path.stat().st_size,
                    "category": category
                })
    
    return {"files": files, "category": category}


@api_router.delete("/files/{category}/{filename}")
async def delete_file(
    category: str, 
    filename: str, 
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Delete a file from specified category (admin only)"""
    valid_categories = ["homepageslider", "team", "facility"]
    if category not in valid_categories:
        raise HTTPException(status_code=404, detail="Category not found")
    
    file_path = UPLOAD_DIR / category / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        os.remove(file_path)
        return {"message": "File deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Delete failed: {str(e)}")


# Team Member API endpoints
@api_router.get("/team-members", response_model=TeamMembersResponse)
async def get_team_members():
    """Get all team members (public endpoint)"""
    team_members = await db.team_members.find().sort("order", 1).to_list(100)
    return TeamMembersResponse(team_members=[TeamMember(**member) for member in team_members])


@api_router.post("/team-members", response_model=TeamMember)
async def create_team_member(
    team_data: TeamMemberCreate, 
    current_user: User = Depends(get_admin_user)
):
    """Create a new team member (admin only)"""
    now = datetime.utcnow()
    team_member = TeamMember(
        id=str(uuid.uuid4()),
        name=team_data.name,
        title=team_data.title,
        bio=team_data.bio,
        credentials=team_data.credentials,
        photo_url=team_data.photo_url,
        order=team_data.order,
        created_at=now,
        updated_at=now
    )
    
    await db.team_members.insert_one(team_member.dict())
    return team_member


@api_router.put("/team-members/{member_id}", response_model=TeamMember)
async def update_team_member(
    member_id: str,
    team_data: TeamMemberUpdate,
    current_user: User = Depends(get_admin_user)
):
    """Update a team member (admin only)"""
    existing_member = await db.team_members.find_one({"id": member_id})
    if not existing_member:
        raise HTTPException(status_code=404, detail="Team member not found")
    
    update_data = {}
    if team_data.name is not None:
        update_data["name"] = team_data.name
    if team_data.title is not None:
        update_data["title"] = team_data.title
    if team_data.bio is not None:
        update_data["bio"] = team_data.bio
    if team_data.credentials is not None:
        update_data["credentials"] = team_data.credentials
    if team_data.photo_url is not None:
        update_data["photo_url"] = team_data.photo_url
    if team_data.order is not None:
        update_data["order"] = team_data.order
    
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        await db.team_members.update_one({"id": member_id}, {"$set": update_data})
        
        # Get updated team member
        updated_member = await db.team_members.find_one({"id": member_id})
        return TeamMember(**updated_member)
    
    return TeamMember(**existing_member)


@api_router.delete("/team-members/{member_id}")
async def delete_team_member(
    member_id: str, 
    current_user: User = Depends(get_admin_user)
):
    """Delete a team member (admin only)"""
    result = await db.team_members.delete_one({"id": member_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Team member not found")
    
    return {"message": "Team member deleted successfully"}


# Facility Photo API endpoints
@api_router.get("/facility-photos", response_model=FacilityPhotosResponse)
async def get_facility_photos():
    """Get all facility photos (public endpoint)"""
    facility_photos = await db.facility_photos.find().sort("order", 1).to_list(100)
    return FacilityPhotosResponse(facility_photos=[FacilityPhoto(**photo) for photo in facility_photos])


@api_router.post("/facility-photos", response_model=FacilityPhoto)
async def create_facility_photo(
    photo_data: FacilityPhotoCreate, 
    current_user: User = Depends(get_admin_user)
):
    """Create a new facility photo (admin only)"""
    now = datetime.utcnow()
    facility_photo = FacilityPhoto(
        id=str(uuid.uuid4()),
        title=photo_data.title,
        description=photo_data.description,
        photo_url=photo_data.photo_url,
        order=photo_data.order,
        created_at=now,
        updated_at=now
    )
    
    await db.facility_photos.insert_one(facility_photo.dict())
    return facility_photo


@api_router.put("/facility-photos/{photo_id}", response_model=FacilityPhoto)
async def update_facility_photo(
    photo_id: str,
    photo_data: FacilityPhotoUpdate,
    current_user: User = Depends(get_admin_user)
):
    """Update a facility photo (admin only)"""
    existing_photo = await db.facility_photos.find_one({"id": photo_id})
    if not existing_photo:
        raise HTTPException(status_code=404, detail="Facility photo not found")
    
    update_data = {}
    if photo_data.title is not None:
        update_data["title"] = photo_data.title
    if photo_data.description is not None:
        update_data["description"] = photo_data.description
    if photo_data.photo_url is not None:
        update_data["photo_url"] = photo_data.photo_url
    if photo_data.order is not None:
        update_data["order"] = photo_data.order
    
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        await db.facility_photos.update_one({"id": photo_id}, {"$set": update_data})
        
        # Get updated facility photo
        updated_photo = await db.facility_photos.find_one({"id": photo_id})
        return FacilityPhoto(**updated_photo)
    
    return FacilityPhoto(**existing_photo)


@api_router.delete("/facility-photos/{photo_id}")
async def delete_facility_photo(
    photo_id: str, 
    current_user: User = Depends(get_admin_user)
):
    """Delete a facility photo (admin only)"""
    result = await db.facility_photos.delete_one({"id": photo_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Facility photo not found")
    
    return {"message": "Facility photo deleted successfully"}


# Slider Image API endpoints  
@api_router.get("/slider-images", response_model=SliderImagesResponse)
async def get_slider_images():
    """Get all slider images (public endpoint)"""
    slider_images = await db.slider_images.find().sort("order", 1).to_list(100)
    return SliderImagesResponse(slider_images=[SliderImage(**image) for image in slider_images])


@api_router.post("/slider-images", response_model=SliderImage)
async def create_slider_image(
    image_data: SliderImageCreate, 
    current_user: User = Depends(get_admin_user)
):
    """Create a new slider image (admin only)"""
    now = datetime.utcnow()
    slider_image = SliderImage(
        id=str(uuid.uuid4()),
        title=image_data.title,
        description=image_data.description,
        image_url=image_data.image_url,
        order=image_data.order,
        created_at=now,
        updated_at=now
    )
    
    await db.slider_images.insert_one(slider_image.dict())
    return slider_image


@api_router.put("/slider-images/{image_id}", response_model=SliderImage)
async def update_slider_image(
    image_id: str,
    image_data: SliderImageUpdate,
    current_user: User = Depends(get_admin_user)
):
    """Update a slider image (admin only)"""
    existing_image = await db.slider_images.find_one({"id": image_id})
    if not existing_image:
        raise HTTPException(status_code=404, detail="Slider image not found")
    
    update_data = {}
    if image_data.title is not None:
        update_data["title"] = image_data.title
    if image_data.description is not None:
        update_data["description"] = image_data.description
    if image_data.image_url is not None:
        update_data["image_url"] = image_data.image_url
    if image_data.order is not None:
        update_data["order"] = image_data.order
    
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        await db.slider_images.update_one({"id": image_id}, {"$set": update_data})
        
        # Get updated slider image
        updated_image = await db.slider_images.find_one({"id": image_id})
        return SliderImage(**updated_image)
    
    return SliderImage(**existing_image)


@api_router.delete("/slider-images/{image_id}")
async def delete_slider_image(
    image_id: str, 
    current_user: User = Depends(get_admin_user)
):
    """Delete a slider image (admin only)"""
    result = await db.slider_images.delete_one({"id": image_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Slider image not found")
    
    return {"message": "Slider image deleted successfully"}


# Google Business Profile Integration API endpoints
@api_router.get("/google-business/settings")
async def get_google_business_settings(
    current_user: User = Depends(get_admin_user)
):
    """Get current Google Business settings (admin only)"""
    settings = await db.google_business_settings.find_one()
    if not settings:
        return {
            "is_connected": False,
            "auto_sync_enabled": True,
            "last_sync_at": None
        }
    
    # Don't return sensitive data
    return {
        "is_connected": settings.get("is_connected", False),
        "auto_sync_enabled": settings.get("auto_sync_enabled", True),
        "last_sync_at": settings.get("last_sync_at"),
        "client_id": settings.get("client_id", ""),
        "account_id": settings.get("account_id"),
        "location_id": settings.get("location_id")
    }


@api_router.post("/google-business/configure")
async def configure_google_business(
    settings_data: GoogleBusinessSettingsCreate,
    current_user: User = Depends(get_admin_user)
):
    """Configure Google Business Profile settings (admin only)"""
    now = datetime.utcnow()
    
    # Check if settings already exist
    existing_settings = await db.google_business_settings.find_one()
    
    if existing_settings:
        # Update existing settings
        update_data = {
            "client_id": settings_data.client_id,
            "client_secret": settings_data.client_secret,
            "auto_sync_enabled": settings_data.auto_sync_enabled,
            "updated_at": now
        }
        
        await db.google_business_settings.update_one(
            {"id": existing_settings["id"]},
            {"$set": update_data}
        )
        
        settings_id = existing_settings["id"]
    else:
        # Create new settings
        settings = GoogleBusinessSettings(
            id=str(uuid.uuid4()),
            client_id=settings_data.client_id,
            client_secret=settings_data.client_secret,
            auto_sync_enabled=settings_data.auto_sync_enabled,
            is_connected=False,
            created_at=now,
            updated_at=now
        )
        
        await db.google_business_settings.insert_one(settings.dict())
        settings_id = settings.id
    
    return {"message": "Google Business settings saved successfully", "id": settings_id}


@api_router.get("/google-business/auth-url", response_model=GoogleAuthUrl)
async def get_google_auth_url(
    current_user: User = Depends(get_admin_user)
):
    """Get Google OAuth authorization URL (admin only)"""
    settings = await db.google_business_settings.find_one()
    if not settings or not settings.get("client_id") or not settings.get("client_secret"):
        raise HTTPException(status_code=400, detail="Google Business settings not configured")
    
    # Generate state for security
    state = secrets.token_urlsafe(32)
    
    # Store state in database for verification
    await db.google_business_settings.update_one(
        {"id": settings["id"]},
        {"$set": {"oauth_state": state, "updated_at": datetime.utcnow()}}
    )
    
    # Create redirect URI (frontend will handle the callback)
    redirect_uri = f"{os.environ.get('FRONTEND_URL', 'http://localhost:3000')}/google-integration/callback"
    
    try:
        auth_url = google_service.get_auth_url(
            settings["client_id"],
            settings["client_secret"], 
            redirect_uri,
            state
        )
        
        return GoogleAuthUrl(auth_url=auth_url, state=state)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate auth URL: {str(e)}")


@api_router.post("/google-business/callback")
async def handle_google_callback(
    callback_data: GoogleAuthCallback,
    current_user: User = Depends(get_admin_user)
):
    """Handle Google OAuth callback (admin only)"""
    settings = await db.google_business_settings.find_one()
    if not settings:
        raise HTTPException(status_code=400, detail="Google Business settings not found")
    
    # Verify state
    if settings.get("oauth_state") != callback_data.state:
        raise HTTPException(status_code=400, detail="Invalid state parameter")
    
    redirect_uri = f"{os.environ.get('FRONTEND_URL', 'http://localhost:3000')}/google-integration/callback"
    
    try:
        # Exchange code for tokens
        credentials = google_service.exchange_code_for_tokens(
            settings["client_id"],
            settings["client_secret"],
            redirect_uri,
            callback_data.code
        )
        
        # Update settings with tokens
        update_data = {
            "access_token": credentials.token,
            "refresh_token": credentials.refresh_token,
            "token_expiry": credentials.expiry,
            "is_connected": True,
            "updated_at": datetime.utcnow()
        }
        
        await db.google_business_settings.update_one(
            {"id": settings["id"]},
            {"$set": update_data}
        )
        
        return {"message": "Google Business Profile connected successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to connect: {str(e)}")


@api_router.post("/google-business/sync", response_model=GoogleSyncResponse)
async def sync_to_google_business(
    sync_request: GoogleSyncRequest,
    current_user: User = Depends(get_admin_user)
):
    """Manually sync data to Google Business Profile (admin only)"""
    settings = await db.google_business_settings.find_one()
    if not settings or not settings.get("is_connected"):
        raise HTTPException(status_code=400, detail="Google Business Profile not connected")
    
    # Check if token needs refresh
    if settings.get("token_expiry") and datetime.utcnow() >= settings["token_expiry"]:
        try:
            credentials = google_service.refresh_access_token(
                settings["client_id"],
                settings["client_secret"], 
                settings["refresh_token"]
            )
            
            # Update tokens
            await db.google_business_settings.update_one(
                {"id": settings["id"]},
                {"$set": {
                    "access_token": credentials.token,
                    "token_expiry": credentials.expiry,
                    "updated_at": datetime.utcnow()
                }}
            )
            
            settings["access_token"] = credentials.token
            
        except Exception as e:
            raise HTTPException(status_code=401, detail=f"Failed to refresh token: {str(e)}")
    
    sync_result = {"success": False, "message": "Unknown sync type"}
    
    try:
        if sync_request.sync_type == "general_practice":
            # Get current hospital hours
            hospital_hours = await db.hospital_hours.find_one()
            if hospital_hours:
                hours_data = {
                    "monday": hospital_hours.get("monday"),
                    "tuesday": hospital_hours.get("tuesday"),
                    "wednesday": hospital_hours.get("wednesday"),
                    "thursday": hospital_hours.get("thursday"),
                    "friday": hospital_hours.get("friday"),
                    "saturday": hospital_hours.get("saturday"),
                    "sunday": hospital_hours.get("sunday")
                }
                
                sync_result = await google_service.sync_business_hours(
                    settings["access_token"],
                    settings.get("location_id", ""),
                    hours_data,
                    "general_practice"
                )
            else:
                sync_result = {"success": False, "message": "No hospital hours found"}
                
        elif sync_request.sync_type == "urgent_care":
            # Get current urgent care hours  
            urgent_hours = await db.urgent_care_hours.find_one()
            if urgent_hours:
                # Urgent care typically has same hours daily
                hours_data = {
                    "monday": "3:00 PM - 10:00 PM",
                    "tuesday": "3:00 PM - 10:00 PM", 
                    "wednesday": "3:00 PM - 10:00 PM",
                    "thursday": "3:00 PM - 10:00 PM",
                    "friday": "3:00 PM - 10:00 PM",
                    "saturday": "3:00 PM - 10:00 PM",
                    "sunday": "3:00 PM - 10:00 PM"
                }
                
                sync_result = await google_service.sync_business_hours(
                    settings["access_token"],
                    settings.get("location_id", ""),
                    hours_data,
                    "urgent_care"
                )
            else:
                sync_result = {"success": False, "message": "No urgent care hours found"}
        
        elif sync_request.sync_type == "business_info":
            # Get current business info
            business_info = await db.business_info.find_one()
            if business_info:
                # Note: Business info sync would require additional Google API calls
                # For now, just log the sync attempt
                sync_result = {"success": True, "message": "Business info sync scheduled (feature coming soon)"}
            else:
                sync_result = {"success": False, "message": "No business info found"}
        
        # Log the sync attempt
        log_entry = GoogleSyncLog(
            id=str(uuid.uuid4()),
            sync_type=sync_request.sync_type,
            status="success" if sync_result["success"] else "failed",
            message=sync_result.get("message", ""),
            details=sync_result,
            synced_at=datetime.utcnow()
        )
        
        await db.google_sync_logs.insert_one(log_entry.dict())
        
        # Update last sync time
        await db.google_business_settings.update_one(
            {"id": settings["id"]},
            {"$set": {"last_sync_at": datetime.utcnow()}}
        )
        
        return GoogleSyncResponse(
            success=sync_result["success"],
            message=sync_result.get("message", "Sync completed"),
            details=sync_result
        )
        
    except Exception as e:
        # Log the failed sync
        log_entry = GoogleSyncLog(
            id=str(uuid.uuid4()),
            sync_type=sync_request.sync_type,
            status="failed",
            message=str(e),
            details={"error": str(e)},
            synced_at=datetime.utcnow()
        )
        
        await db.google_sync_logs.insert_one(log_entry.dict())
        
        raise HTTPException(status_code=500, detail=f"Sync failed: {str(e)}")


@api_router.get("/google-business/sync-logs", response_model=GoogleSyncLogsResponse)
async def get_google_sync_logs(
    limit: int = 50,
    current_user: User = Depends(get_admin_user)
):
    """Get Google Business sync history (admin only)"""
    logs = await db.google_sync_logs.find().sort("synced_at", -1).limit(limit).to_list(limit)
    return GoogleSyncLogsResponse(sync_logs=[GoogleSyncLog(**log) for log in logs])


@api_router.delete("/google-business/disconnect")
async def disconnect_google_business(
    current_user: User = Depends(get_admin_user)
):
    """Disconnect Google Business Profile (admin only)"""
    result = await db.google_business_settings.update_many(
        {},
        {"$set": {
            "access_token": None,
            "refresh_token": None, 
            "token_expiry": None,
            "is_connected": False,
            "updated_at": datetime.utcnow()
        }}
    )
    
    return {"message": "Google Business Profile disconnected successfully"}


# ===============================
# USER MANAGEMENT ENDPOINTS
# ===============================

# Pydantic models for user management
class UserListResponse(BaseModel):
    users: List[dict]
    total: int

class UserUpdateRequest(BaseModel):
    fullName: Optional[str] = None
    password: Optional[str] = None
    role: Optional[UserRole] = None
    isBlocked: Optional[bool] = None

class UserBlockRequest(BaseModel):
    isBlocked: bool
    reason: Optional[str] = None

@api_router.get("/users", response_model=UserListResponse)
async def get_all_users(
    page: int = 1,
    page_size: int = 10,
    search: str = "",
    role_filter: str = "",
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Get all users with pagination and filtering"""
    try:
        skip = (page - 1) * page_size
        
        # Build query based on current user's role
        query = {}
        
        # Add search filter
        if search:
            query["$or"] = [
                {"full_name": {"$regex": search, "$options": "i"}},
                {"email": {"$regex": search, "$options": "i"}}
            ]
        
        # Add role filter
        if role_filter:
            query["role"] = role_filter
        
        # Role-based access control
        if current_user.role == UserRole.MANAGER:
            # Managers can only see users and technicians, not other managers or admins
            query["role"] = {"$in": [UserRole.USER, UserRole.TECHNICIAN]}
        
        # Get total count
        total = await db.users.count_documents(query)
        
        # Get users with pagination
        cursor = db.users.find(query).skip(skip).limit(page_size).sort("createdAt", -1)
        users = await cursor.to_list(length=page_size)
        
        # Convert to dict and remove sensitive info
        user_list = []
        for user in users:
            user_dict = {
                "id": user["id"],
                "fullName": user["full_name"],  # Convert snake_case to camelCase for API response
                "email": user["email"],
                "role": user["role"],
                "isBlocked": user.get("isBlocked", False),
                "createdAt": user.get("createdAt", ""),
                "lastLogin": user.get("lastLogin", "")
            }
            user_list.append(user_dict)
        
        return UserListResponse(users=user_list, total=total)
        
    except Exception as e:
        logger.error(f"Error fetching users: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch users")

@api_router.put("/users/{user_id}")
async def update_user(
    user_id: str,
    user_update: UserUpdateRequest,
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Update user information"""
    try:
        # Get target user
        target_user = await db.users.find_one({"id": user_id})
        if not target_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Role-based access control
        if current_user.role == UserRole.MANAGER:
            # Managers can only update users and technicians
            if target_user["role"] not in [UserRole.USER, UserRole.TECHNICIAN]:
                raise HTTPException(status_code=403, detail="Cannot update this user")
        
        # Build update query
        update_data = {}
        if user_update.fullName is not None:
            update_data["full_name"] = user_update.fullName  # Convert camelCase to snake_case for database
        if user_update.password is not None:
            update_data["password_hash"] = hash_password(user_update.password)  # Use correct field name
        if user_update.role is not None and current_user.role == UserRole.ADMIN:
            # Only admins can change roles
            update_data["role"] = user_update.role
        if user_update.isBlocked is not None:
            update_data["isBlocked"] = user_update.isBlocked
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No valid fields to update")
        
        update_data["updatedAt"] = datetime.utcnow().isoformat()
        
        # Update user
        result = await db.users.update_one(
            {"id": user_id},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=400, detail="No changes made")
        
        return {"message": "User updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating user: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update user")

@api_router.patch("/users/{user_id}/block")
async def block_unblock_user(
    user_id: str,
    block_request: UserBlockRequest,
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Block or unblock a user"""
    try:
        # Get target user
        target_user = await db.users.find_one({"id": user_id})
        if not target_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Prevent users from blocking themselves
        if target_user["id"] == current_user.id:
            raise HTTPException(status_code=400, detail="Cannot block yourself")
        
        # Role-based access control
        if current_user.role == UserRole.MANAGER:
            # Managers can only block users and technicians
            if target_user["role"] not in [UserRole.USER, UserRole.TECHNICIAN]:
                raise HTTPException(status_code=403, detail="Cannot block this user")
        
        # Update user block status
        update_data = {
            "isBlocked": block_request.isBlocked,
            "updatedAt": datetime.utcnow().isoformat()
        }
        
        if block_request.reason:
            update_data["blockReason"] = block_request.reason
        
        result = await db.users.update_one(
            {"id": user_id},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=400, detail="No changes made")
        
        action = "blocked" if block_request.isBlocked else "unblocked"
        return {"message": f"User {action} successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error blocking/unblocking user: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update user status")

@api_router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Delete a user"""
    try:
        # Get target user
        target_user = await db.users.find_one({"id": user_id})
        if not target_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Prevent users from deleting themselves
        if target_user["id"] == current_user.id:
            raise HTTPException(status_code=400, detail="Cannot delete yourself")
        
        # Role-based access control
        if current_user.role == UserRole.MANAGER:
            # Managers can only delete users and technicians
            if target_user["role"] not in [UserRole.USER, UserRole.TECHNICIAN]:
                raise HTTPException(status_code=403, detail="Cannot delete this user")
        
        # Delete user
        result = await db.users.delete_one({"id": user_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=400, detail="Failed to delete user")
        
        return {"message": "User deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting user: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete user")


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