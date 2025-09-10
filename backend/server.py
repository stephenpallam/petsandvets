from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File, Header, Body
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import shutil
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta, date, timezone
import bcrypt
import jwt
import secrets
from enum import Enum
import pytz
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
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
import base64
from ai_service import ai_service


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

# Email Service
class EmailService:
    def __init__(self):
        self.encrypt_key = os.environ.get('ENCRYPT_KEY', 'your-encryption-key-change-this').encode()
    
    def encrypt_data(self, data: str) -> str:
        """Simple base64 encryption for demo purposes. In production, use proper encryption."""
        if not data:
            return ""
        return base64.b64encode(data.encode()).decode()
    
    def decrypt_data(self, encrypted_data: str) -> str:
        """Simple base64 decryption for demo purposes. In production, use proper decryption."""
        if not encrypted_data:
            return ""
        try:
            return base64.b64decode(encrypted_data.encode()).decode()
        except:
            return ""
    
    async def send_gmail_smtp(self, config: dict, to_email: str, subject: str, html_content: str) -> bool:
        """Send email using Gmail SMTP"""
        try:
            smtp_email = self.decrypt_data(config.get('smtp_email', ''))
            smtp_password = self.decrypt_data(config.get('smtp_password', ''))
            
            if not smtp_email or not smtp_password:
                raise Exception("Gmail SMTP credentials not configured")
            
            # Create message
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = smtp_email
            message["To"] = to_email
            
            # Add HTML content
            html_part = MIMEText(html_content, "html")
            message.attach(html_part)
            
            # Send email
            context = ssl.create_default_context()
            with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
                server.login(smtp_email, smtp_password)
                server.sendmail(smtp_email, to_email, message.as_string())
            
            return True
        except Exception as e:
            logging.error(f"Gmail SMTP send failed: {str(e)}")
            raise Exception(f"Gmail SMTP send failed: {str(e)}")
    
    async def send_sendgrid(self, config: dict, to_email: str, subject: str, html_content: str) -> bool:
        """Send email using SendGrid"""
        try:
            api_key = self.decrypt_data(config.get('sendgrid_api_key', ''))
            sender_email = config.get('sender_email', '')
            
            if not api_key or not sender_email:
                raise Exception("SendGrid credentials not configured")
            
            message = Mail(
                from_email=sender_email,
                to_emails=to_email,
                subject=subject,
                html_content=html_content
            )
            
            sg = SendGridAPIClient(api_key)
            response = sg.send(message)
            
            return response.status_code == 202
        except Exception as e:
            logging.error(f"SendGrid send failed: {str(e)}")
            raise Exception(f"SendGrid send failed: {str(e)}")
    
    async def send_email(self, to_email: str, subject: str, html_content: str) -> bool:
        """Send email using configured provider"""
        try:
            # Get email configuration
            config_doc = await db.email_config.find_one({})
            if not config_doc or not config_doc.get('is_enabled'):
                logging.warning("Email notifications are disabled or not configured")
                return False
            
            provider = config_doc.get('email_provider', 'gmail')
            
            if provider == 'gmail':
                return await self.send_gmail_smtp(config_doc, to_email, subject, html_content)
            elif provider == 'sendgrid':
                return await self.send_sendgrid(config_doc, to_email, subject, html_content)
            else:
                raise Exception(f"Unknown email provider: {provider}")
                
        except Exception as e:
            logging.error(f"Email send failed: {str(e)}")
            return False

email_service = EmailService()


# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Business Timezone Configuration
BUSINESS_TIMEZONE_DEFAULT = "America/New_York"

async def get_business_timezone() -> pytz.BaseTzInfo:
    """Get the business timezone from database or use default"""
    try:
        business_info = await db.business_info.find_one()
        timezone_str = BUSINESS_TIMEZONE_DEFAULT
        if business_info and business_info.get("timezone"):
            timezone_str = business_info["timezone"]
        return pytz.timezone(timezone_str)
    except Exception:
        return pytz.timezone(BUSINESS_TIMEZONE_DEFAULT)

def business_now() -> datetime:
    """Get current datetime in business timezone (naive datetime)"""
    try:
        # Use synchronous approach for default factory functions
        business_tz = pytz.timezone(BUSINESS_TIMEZONE_DEFAULT)
        utc_now = datetime.utcnow().replace(tzinfo=pytz.UTC)
        business_time = utc_now.astimezone(business_tz)
        # Return naive datetime in business timezone
        return business_time.replace(tzinfo=None)
    except Exception:
        # Fallback to UTC if timezone conversion fails
        return datetime.utcnow()

async def business_now_async() -> datetime:
    """Get current datetime in business timezone (async version)"""
    try:
        business_tz = await get_business_timezone()
        utc_now = datetime.utcnow().replace(tzinfo=pytz.UTC)
        business_time = utc_now.astimezone(business_tz)
        # Return naive datetime in business timezone
        return business_time.replace(tzinfo=None)
    except Exception:
        # Fallback to UTC if timezone conversion fails
        return datetime.utcnow()

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
    timestamp: datetime = Field(default_factory=business_now)


class StatusCheckCreate(BaseModel):
    client_name: str


class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole = UserRole.USER
    pin: Optional[str] = None  # 6+ characters including letters, numbers, and symbols for employee accounts


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    full_name: str
    role: UserRole
    is_active: bool = True
    created_at: datetime = Field(default_factory=business_now)


class Token(BaseModel):
    access_token: str
    token_type: str


class Pet(BaseModel):
    name: str

class Customer(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    first_name: str
    last_name: str
    name: Optional[str] = None  # Legacy field for backward compatibility
    pets: Optional[List[Pet]] = []  # New structured pets array
    pet_name: Optional[str] = None  # Legacy field for backward compatibility
    phone: Optional[str] = None
    email: Optional[str] = None
    sms_opt_in: bool = True
    email_subscribed: bool = True
    created_at: datetime = Field(default_factory=business_now)
    updated_at: datetime = Field(default_factory=business_now)


class CustomerCreate(BaseModel):
    first_name: str
    last_name: str
    name: Optional[str] = None  # Legacy field for backward compatibility
    pets: Optional[List[Pet]] = []  # New structured pets array
    pet_name: Optional[str] = None  # Legacy field for backward compatibility
    phone: Optional[str] = None
    email: Optional[str] = None
    sms_opt_in: bool = True
    email_subscribed: bool = True


class CustomerUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    name: Optional[str] = None  # Legacy field for backward compatibility
    pets: Optional[List[Pet]] = None  # New structured pets array
    pet_name: Optional[str] = None  # Legacy field for backward compatibility
    phone: Optional[str] = None
    email: Optional[str] = None
    sms_opt_in: Optional[bool] = None
    email_subscribed: Optional[bool] = None


class CMSSettings(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    google_sync_enabled: bool = True
    google_business_sync_enabled: bool = True
    google_calendar_sync_enabled: bool = True
    updated_at: datetime = Field(default_factory=business_now)
    updated_by: str


class CMSSettingsUpdate(BaseModel):
    google_sync_enabled: Optional[bool] = None
    google_business_sync_enabled: Optional[bool] = None
    google_calendar_sync_enabled: Optional[bool] = None


class Holiday(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    date: str  # Format: "2024-12-25" 
    month_day: str  # Format: "12-25" for recurring holidays
    is_recurring: bool = True  # Most holidays recur yearly
    is_enabled: bool = True
    category: str = "general"  # general, pet, veterinary, family
    created_at: datetime = Field(default_factory=business_now)
    updated_at: datetime = Field(default_factory=business_now)


class HolidayCreate(BaseModel):
    name: str
    date: str
    month_day: str
    is_recurring: bool = True
    is_enabled: bool = True
    category: str = "general"


class HolidayUpdate(BaseModel):
    name: Optional[str] = None
    date: Optional[str] = None
    month_day: Optional[str] = None
    is_recurring: Optional[bool] = None
    is_enabled: Optional[bool] = None
    category: Optional[str] = None


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
    updated_at: datetime = Field(default_factory=business_now)
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
    updated_at: datetime = Field(default_factory=business_now)
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
    created_at: datetime = Field(default_factory=business_now)
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
    created_at: datetime = Field(default_factory=business_now)


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


class AppointmentSlotConfig(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    slot_interval_minutes: int = 30  # 15, 30, 45, 60
    first_appointment_delay_minutes: int = 0  # 0, 15, 30, 45, 60
    last_appointment_cutoff_minutes: int = 30  # 15, 30, 45, 60
    created_at: datetime = Field(default_factory=business_now)
    updated_at: datetime = Field(default_factory=business_now)
    updated_by: str


class AppointmentSlotConfigUpdate(BaseModel):
    slot_interval_minutes: Optional[int] = None
    first_appointment_delay_minutes: Optional[int] = None  
    last_appointment_cutoff_minutes: Optional[int] = None


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
    created_at: datetime = Field(default_factory=business_now)
    
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
    timezone: Optional[str] = "America/New_York"  # Default to Eastern Time
    referral_hospital_name: Optional[str] = ""
    referral_hospital_phone: Optional[str] = ""
    facebook_link: Optional[str] = ""
    instagram_link: Optional[str] = ""
    twitter_link: Optional[str] = ""
    whatsapp_group_link: Optional[str] = ""
    google_reviews_link: Optional[str] = ""
    yelp_reviews_link: Optional[str] = ""
    facebook_reviews_link: Optional[str] = ""
    hero_images: Optional[List[str]] = []  # URLs for home page slider images
    created_at: datetime
    updated_at: datetime


class BusinessInfoUpdate(BaseModel):
    hospital_name: Optional[str] = None
    tagline: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    timezone: Optional[str] = None
    referral_hospital_name: Optional[str] = None
    referral_hospital_phone: Optional[str] = None
    facebook_link: Optional[str] = None
    instagram_link: Optional[str] = None
    twitter_link: Optional[str] = None
    whatsapp_group_link: Optional[str] = None
    google_reviews_link: Optional[str] = None
    yelp_reviews_link: Optional[str] = None
    facebook_reviews_link: Optional[str] = None
    hero_images: Optional[List[str]] = None


class EmailProvider(str, Enum):
    GMAIL = "gmail"
    SENDGRID = "sendgrid"


class SMSConfig(BaseModel):
    notification_phone: Optional[str] = None
    sms_provider: str = "twilio"  # 'twilio' or 'sendgrid'
    is_enabled: bool = False
    # Twilio fields
    twilio_account_sid: Optional[str] = None
    twilio_auth_token: Optional[str] = None
    twilio_phone_number: Optional[str] = None
    # SendGrid fields (for SMS)
    sendgrid_api_key: Optional[str] = None
    sender_phone: Optional[str] = None

class EmailConfig(BaseModel):
    id: str
    notification_email: str
    email_provider: EmailProvider = EmailProvider.GMAIL
    is_enabled: bool = False
    # Gmail SMTP fields (encrypted in database)
    smtp_email: Optional[str] = None
    smtp_password: Optional[str] = None  # This will be encrypted
    # SendGrid fields (encrypted in database)
    sendgrid_api_key: Optional[str] = None  # This will be encrypted
    sender_email: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class EmailConfigUpdate(BaseModel):
    notification_email: Optional[str] = None
    email_provider: Optional[EmailProvider] = None
    is_enabled: Optional[bool] = None
    smtp_email: Optional[str] = None
    smtp_password: Optional[str] = None
    sendgrid_api_key: Optional[str] = None
    sender_email: Optional[str] = None


class TestEmailRequest(BaseModel):
    test_email: EmailStr


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


# Timesheet System Models
class TimesheetConfig(BaseModel):
    id: str
    location_tracking_enabled: bool = False
    after_hours_cutoff_time: str = "18:00"  # Time after which after-hours pay applies (24hr format)
    auto_clockout_grace_minutes: int = 30  # Grace period before auto clock-out
    pay_period_type: str = "biweekly"  # "biweekly" or "custom"
    original_pay_period_start_date: Optional[str] = None  # Foundation date for all pay period calculations (ISO format)
    created_at: datetime
    updated_at: datetime
    updated_by: str


class TimesheetConfigUpdate(BaseModel):
    location_tracking_enabled: Optional[bool] = None
    after_hours_cutoff_time: Optional[str] = None
    auto_clockout_grace_minutes: Optional[int] = None
    pay_period_type: Optional[str] = None
    original_pay_period_start_date: Optional[str] = None  # Foundation date for all pay period calculations (ISO format)


class EmployeeConfig(BaseModel):
    id: str
    user_id: str
    hourly_rate: float = 0.0
    after_hours_rate: Optional[float] = None  # Rate for work after cutoff time
    is_active: bool = True
    created_at: datetime
    updated_at: datetime
    updated_by: str


class EmployeeConfigUpdate(BaseModel):
    hourly_rate: Optional[float] = None
    after_hours_rate: Optional[float] = None
    is_active: Optional[bool] = None


class BreakEntry(BaseModel):
    break_start: datetime
    break_end: Optional[datetime] = None
    break_type: str = "break"  # "break", "lunch", "other"
    notes: Optional[str] = None


class TimeEntry(BaseModel):
    id: str
    user_id: str
    clock_in_time: datetime
    clock_out_time: Optional[datetime] = None
    breaks: List[BreakEntry] = []
    location_data: Optional[Dict[str, Any]] = None  # IP, GPS coordinates if enabled
    total_hours: Optional[float] = None
    regular_hours: Optional[float] = None
    after_hours_hours: Optional[float] = None
    is_auto_clockout: bool = False
    notes: Optional[str] = None
    status: str = "active"  # "active", "completed", "adjusted"
    created_at: datetime
    updated_at: datetime


class TimeEntryCreate(BaseModel):
    location_data: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None


class BreakStart(BaseModel):
    break_type: str = "break"
    notes: Optional[str] = None


class BreakEnd(BaseModel):
    notes: Optional[str] = None


class TimeAdjustment(BaseModel):
    id: str
    time_entry_id: str
    user_id: str  # Employee whose time is being adjusted
    adjusted_by: str  # Manager/Admin making the adjustment
    adjustment_type: str  # "clock_in", "clock_out", "break_add", "break_edit", "break_remove", "manual_hours"
    original_value: Optional[str] = None
    new_value: Optional[str] = None
    reason: str
    adjustment_date: datetime
    created_at: datetime


class TimeAdjustmentCreate(BaseModel):
    time_entry_id: str
    user_id: str
    adjustment_type: str
    original_value: Optional[str] = None
    new_value: Optional[str] = None
    reason: str


class TimesheetReport(BaseModel):
    user_id: str
    user_name: str
    user_email: str
    user_role: str
    total_hours: float
    regular_hours: float
    after_hours_hours: float
    total_pay: float
    regular_pay: float
    after_hours_pay: float
    days_worked: int
    entries: List[TimeEntry]
    adjustments: List[TimeAdjustment]


# Employee Scheduling Models
class Shift(BaseModel):
    id: str
    user_id: str  # Employee assigned to this shift
    schedule_date: str  # Date in YYYY-MM-DD format
    start_time: str  # Time in HH:MM format
    end_time: str  # Time in HH:MM format
    shift_type: str = "regular"  # "regular", "overtime", "on_call"
    position: Optional[str] = None  # Role/position for this shift
    location: Optional[str] = None  # Work location if multiple locations
    notes: Optional[str] = None
    status: str = "scheduled"  # "scheduled", "confirmed", "completed", "cancelled", "no_show"
    created_by: str  # Manager who created the shift
    created_at: datetime
    updated_at: datetime


class ShiftCreate(BaseModel):
    user_id: str
    schedule_date: str  # Date in YYYY-MM-DD format
    start_time: str  # Time in HH:MM format
    end_time: str  # Time in HH:MM format
    shift_type: str = "regular"
    position: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None


class ShiftUpdate(BaseModel):
    user_id: Optional[str] = None
    schedule_date: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    shift_type: Optional[str] = None
    position: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None


class ScheduleTemplate(BaseModel):
    id: str
    name: str  # Template name like "Standard Week", "Holiday Schedule"
    description: Optional[str] = None
    shifts: List[Dict[str, Any]]  # Template shifts (without specific dates/users)
    created_by: str
    created_at: datetime
    updated_at: datetime


class ScheduleTemplateCreate(BaseModel):
    name: str
    description: Optional[str] = None
    shifts: List[Dict[str, Any]]


# Shift Preset Models
class ShiftPreset(BaseModel):
    id: str
    name: str
    start_time: str  # Time in HH:MM format
    end_time: str    # Time in HH:MM format
    description: Optional[str] = None
    is_active: bool = True
    created_by: str
    created_at: datetime
    updated_at: datetime


class ShiftPresetCreate(BaseModel):
    name: str
    start_time: str
    end_time: str
    description: Optional[str] = None


class ShiftPresetUpdate(BaseModel):
    name: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class TimesheetPeriod(BaseModel):
    start_date: str  # YYYY-MM-DD format
    end_date: str    # YYYY-MM-DD format


class TimesheetSummary(BaseModel):
    period: TimesheetPeriod
    reports: List[TimesheetReport]
    period_type: str
    total_employees: int
    total_hours: float
    total_pay: float


# Blocked Time Slots Models
class BlockedSlot(BaseModel):
    id: str
    date: str  # YYYY-MM-DD format
    time: str  # HH:MM format (24-hour)
    reason: Optional[str] = None
    blocked_by: str  # User ID of who blocked it
    blocked_by_name: str  # Full name for display
    blocked_at: datetime
    is_active: bool = True


class BlockedSlotCreate(BaseModel):
    date: str
    time: str
    reason: Optional[str] = None


class BlockedSlotUpdate(BaseModel):
    reason: Optional[str] = None
    is_active: Optional[bool] = None


# Auth Utilities
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def verify_password(password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))


def validate_pin(pin: str) -> bool:
    """Validate PIN format: 6+ alphanumeric characters and symbols"""
    if not pin:
        return False
    # Allow letters, numbers, and common symbols, minimum 6 characters
    return len(pin) >= 6


def generate_random_pin() -> str:
    """Generate a random 6-character PIN with letters, numbers, and symbols"""
    import random
    import string
    # Use uppercase letters, digits, and safe symbols
    chars = string.ascii_uppercase + string.digits + "!@#$%&*"
    return ''.join(random.choice(chars) for _ in range(6))


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


async def get_current_user_optional_bearer(authorization: Optional[str] = Header(None)):
    """Get current user if authenticated, otherwise return None"""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    
    try:
        token = authorization.split(" ")[1]
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
        
        user = await db.users.find_one({"id": user_id})
        if user is None:
            return None
        return User(**user)
    except:
        return None


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


async def get_timesheet_employee(current_user: User = Depends(get_current_user)):
    """Allow user, technician, or manager access (everyone except admin) for timesheet system"""
    if current_user.role not in [UserRole.USER, UserRole.TECHNICIAN, UserRole.MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only employees can use the timesheet system"
        )
    return current_user


# Production Data Management System
@app.on_event("startup")
async def initialize_production_data():
    """Initialize production data from backups or clean defaults"""
    try:
        from data_manager import ProductionDataManager
        import logging
        
        logging.basicConfig(level=logging.INFO)
        logger = logging.getLogger(__name__)
        
        data_manager = ProductionDataManager()
        
        # Check if we have existing production data
        admin_exists = await db.users.find_one({"role": "admin"})
        business_exists = await db.business_info.find_one()
        
        # First, clean any test data that might have contaminated production
        await data_manager.clean_test_data()
        
        # Try to restore from latest backup if available
        latest_backup = data_manager.get_latest_backup()
        if latest_backup and not admin_exists:
            logger.info("🔄 Restoring production data from backup...")
            await data_manager.restore_from_backup(latest_backup)
        else:
            # Initialize with clean defaults if no backup and no data exists
            if not admin_exists:
                logger.info("🏥 Initializing production data with clean defaults...")
                
                admin_user = User(
                    email="admin@hospital.com",
                    full_name="Hospital Administrator",
                    role=UserRole.ADMIN,
                )
                admin_dict = admin_user.dict()
                admin_dict["password_hash"] = hash_password("admin123")
                await db.users.insert_one(admin_dict)
                
                # Create default hospital hours only if they don't exist
                hours_exist = await db.hospital_hours.find_one()
                if not hours_exist:
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
            
            # Initialize clean business info if it doesn't exist
            await data_manager.initialize_production_data()
        
        logger.info("✅ Production data initialization completed")
        
        # Start background scheduler for processing scheduled posts
        import asyncio
        asyncio.create_task(scheduled_posts_scheduler())
        asyncio.create_task(holiday_scheduler())  # New holiday-based scheduler
        
    except Exception as e:
        logger.error(f"❌ Production data initialization failed: {e}")

# ===============================
# AI COST TRACKING ENDPOINTS
# ===============================

@api_router.get("/ai-costs/usage-logs")
async def get_usage_logs(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    period: Optional[str] = 'month',  # 'week', 'month', 'year'
    current_user: dict = Depends(get_current_user)
):
    """Get AI usage logs with filtering"""
    try:
        # Calculate date range based on period
        now = await business_now_async()
        
        if start_date and end_date:
            start_dt = datetime.fromisoformat(start_date.replace('Z', ''))
            end_dt = datetime.fromisoformat(end_date.replace('Z', ''))
        else:
            if period == 'week':
                start_dt = now - timedelta(days=7)
            elif period == 'month':
                start_dt = now - timedelta(days=30)
            elif period == 'year':
                start_dt = now - timedelta(days=365)
            else:
                start_dt = now - timedelta(days=30)
            end_dt = now
        
        # Get usage logs
        usage_logs = await db.ai_usage_logs.find({
            "created_at": {"$gte": start_dt, "$lte": end_dt}
        }).sort("created_at", -1).to_list(length=1000)
        
        return {"usage_logs": usage_logs}
        
    except Exception as e:
        logger.error(f"Error fetching usage logs: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch usage logs")

@api_router.get("/ai-costs/analytics")
async def get_cost_analytics(
    period: str = 'month',  # 'week', 'month', 'year'
    current_user: dict = Depends(get_current_user)
):
    """Get cost analytics and summaries"""
    try:
        now = await business_now_async()
        
        # Calculate date range
        if period == 'week':
            start_dt = now - timedelta(days=7)
            period_label = "This Week"
        elif period == 'month':
            start_dt = now - timedelta(days=30)
            period_label = "This Month"
        elif period == 'year':
            start_dt = now - timedelta(days=365)
            period_label = "This Year"
        else:
            start_dt = now - timedelta(days=30)
            period_label = "This Month"
        
        # Aggregate usage data
        pipeline = [
            {"$match": {"created_at": {"$gte": start_dt, "$lte": now}}},
            {"$group": {
                "_id": None,
                "total_cost": {"$sum": "$cost_usd"},
                "text_cost": {"$sum": {"$cond": [{"$eq": ["$cost_type", "text_generation"]}, "$cost_usd", 0]}},
                "image_cost": {"$sum": {"$cond": [{"$eq": ["$cost_type", "image_generation"]}, "$cost_usd", 0]}},
                "total_tokens": {"$sum": "$tokens_used"},
                "total_images": {"$sum": "$images_generated"},
                "total_requests": {"$sum": 1}
            }}
        ]
        
        summary = await db.ai_usage_logs.aggregate(pipeline).to_list(length=1)
        
        # Provider breakdown
        provider_pipeline = [
            {"$match": {"created_at": {"$gte": start_dt, "$lte": now}}},
            {"$group": {
                "_id": "$provider",
                "cost": {"$sum": "$cost_usd"},
                "requests": {"$sum": 1}
            }}
        ]
        
        provider_breakdown = await db.ai_usage_logs.aggregate(provider_pipeline).to_list(length=10)
        
        # Model breakdown
        model_pipeline = [
            {"$match": {"created_at": {"$gte": start_dt, "$lte": now}}},
            {"$group": {
                "_id": "$model",
                "cost": {"$sum": "$cost_usd"},
                "requests": {"$sum": 1}
            }}
        ]
        
        model_breakdown = await db.ai_usage_logs.aggregate(model_pipeline).to_list(length=10)
        
        # Daily trend (last 30 days)
        daily_pipeline = [
            {"$match": {"created_at": {"$gte": now - timedelta(days=30), "$lte": now}}},
            {"$group": {
                "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}},
                "daily_cost": {"$sum": "$cost_usd"},
                "daily_tokens": {"$sum": "$tokens_used"},
                "daily_images": {"$sum": "$images_generated"}
            }},
            {"$sort": {"_id": 1}}
        ]
        
        daily_trends = await db.ai_usage_logs.aggregate(daily_pipeline).to_list(length=30)
        
        result = {
            "period": period_label,
            "summary": summary[0] if summary else {
                "total_cost": 0, "text_cost": 0, "image_cost": 0,
                "total_tokens": 0, "total_images": 0, "total_requests": 0
            },
            "provider_breakdown": provider_breakdown,
            "model_breakdown": model_breakdown,
            "daily_trends": daily_trends
        }
        
        return result
        
    except Exception as e:
        logger.error(f"Error generating cost analytics: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate cost analytics")

async def holiday_scheduler():
    """Background task that processes holiday-related tasks"""
    import asyncio
    
    logger.info("🎉 Started holiday background scheduler")
    
    while True:
        try:
            await process_holiday_tasks()
            # Wait for 1 hour before next check (holidays don't need frequent checking)
            await asyncio.sleep(3600)
        except Exception as e:
            logger.error(f"Error in holiday scheduler: {e}")
            # Wait a bit before retrying on error  
            await asyncio.sleep(300)

async def process_holiday_tasks():
    """Process holiday-related tasks including creating scheduled SMS posts for upcoming holidays"""
    try:
        current_time = await business_now_async()
        current_date = current_time.date()
        
        # Task 1: Check for SMS agents that need scheduled posts created for upcoming holidays
        await schedule_upcoming_holiday_sms()
        
        # Task 2: Update passed holidays to next year (for recurring holidays)
        holidays = await db.holidays.find({
            "is_recurring": True,
            "is_enabled": True
        }).to_list(length=None)
        
        updated_count = 0
        for holiday_doc in holidays:
            try:
                holiday_date = datetime.strptime(holiday_doc["date"], "%Y-%m-%d").date()
                
                # If the holiday has passed this year, update it to next year
                if holiday_date < current_date:
                    next_year = current_date.year + 1
                    month_day = holiday_doc.get("month_day", holiday_doc["date"][5:])  # Get MM-DD part
                    new_date = f"{next_year}-{month_day}"
                    
                    # Update the holiday with the new date
                    await db.holidays.update_one(
                        {"id": holiday_doc["id"]},
                        {
                            "$set": {
                                "date": new_date,
                                "updated_at": current_time
                            }
                        }
                    )
                    updated_count += 1
                    logger.info(f"Updated holiday '{holiday_doc['name']}' to {new_date}")
                    
            except Exception as e:
                logger.error(f"Error updating holiday {holiday_doc.get('name', 'Unknown')}: {e}")
                continue
        
        if updated_count > 0:
            logger.info(f"🎉 Holiday scheduler updated {updated_count} holidays to next year")
        
    except Exception as e:
        logger.error(f"Error in process_holiday_tasks: {e}")

async def schedule_upcoming_holiday_sms():
    """Create scheduled SMS posts for upcoming holidays (within next 30 days)"""
    try:
        current_time = await business_now_async()
        current_date = current_time.date()
        
        # Get all SMS agents with selected holidays
        sms_agents = await db.ai_agents.find({
            "agent_type": "sms_agent",
            "selected_holidays": {"$exists": True, "$ne": []},
            "is_active": True
        }).to_list(length=None)
        
        if not sms_agents:
            return
        
        # Get all holidays
        holidays = await db.holidays.find({}).to_list(length=None)
        holiday_map = {h["id"]: h for h in holidays}
        
        scheduled_count = 0
        
        for agent in sms_agents:
            try:
                selected_holidays = agent.get("selected_holidays", [])
                agent_id = agent.get("id")
                
                for holiday_id in selected_holidays:
                    if holiday_id not in holiday_map:
                        continue
                    
                    holiday = holiday_map[holiday_id]
                    holiday_date = datetime.strptime(holiday["date"], "%Y-%m-%d").date()
                    
                    # Check if holiday is within next 30 days
                    days_until = (holiday_date - current_date).days
                    if days_until < 0 or days_until > 30:
                        continue
                    
                    # Check if we already have a scheduled post for this agent and holiday
                    agent_post_time = agent.get("post_time", "09:00")
                    scheduled_datetime = datetime.combine(holiday_date, datetime.strptime(agent_post_time, "%H:%M").time())
                    
                    existing_post = await db.ai_posts.find_one({
                        "agent_id": agent_id,
                        "holiday_date": holiday["date"],
                        "status": {"$in": ["scheduled", "in_review", "ready_to_publish"]}
                    })
                    
                    if existing_post:
                        continue  # Already have a post scheduled for this holiday
                    
                    # Create scheduled SMS post
                    post_id = str(uuid.uuid4())
                    
                    post_data = {
                        "id": post_id,
                        "agent_id": agent_id,
                        "agent_name": agent.get("agent_name", "SMS Agent"),
                        "agent_type": "sms_agent",
                        "content": "",  # Will be generated when scheduled time arrives
                        "sms_template": agent.get("sms_template", ""),
                        "sms_link": agent.get("sms_link", "https://petsandvetsanimalhospital.com"),
                        "holiday_name": holiday.get("name"),
                        "holiday_date": holiday["date"],
                        "status": "scheduled",
                        "scheduled_for": scheduled_datetime,
                        "created_at": current_time,
                        "updated_at": current_time
                    }
                    
                    await db.ai_posts.insert_one(post_data)
                    scheduled_count += 1
                    
                    logger.info(f"📅 Scheduled SMS post for agent '{agent.get('agent_name')}' on {holiday.get('name')} ({holiday['date']} at {agent_post_time})")
                    
            except Exception as e:
                logger.error(f"Error scheduling SMS for agent {agent.get('agent_name', 'Unknown')}: {e}")
                continue
        
        if scheduled_count > 0:
            logger.info(f"🎉 Holiday scheduler created {scheduled_count} scheduled SMS posts")
            
    except Exception as e:
        logger.error(f"Error in schedule_upcoming_holiday_sms: {e}")

async def scheduled_posts_scheduler():
    """Background task that runs the scheduled posts processor every minute"""
    import asyncio
    
    logger.info("🕐 Started scheduled posts background scheduler")
    
    while True:
        try:
            await process_scheduled_posts()
            # Wait for 1 minute before next check
            await asyncio.sleep(60)
        except Exception as e:
            logger.error(f"Error in scheduled posts scheduler: {e}")
            # Wait a bit before retrying on error  
            await asyncio.sleep(30)


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
            detail="Incorrect email or PIN",
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


# Appointment Slot Configuration Routes
@api_router.get("/appointment-slot-config", response_model=AppointmentSlotConfig)
async def get_appointment_slot_config(
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Get appointment slot configuration (manager/admin only)"""
    config = await db.appointment_slot_config.find_one()
    
    if not config:
        # Return default configuration
        now = datetime.utcnow()
        default_config = AppointmentSlotConfig(
            id=str(uuid.uuid4()),
            slot_interval_minutes=30,
            first_appointment_delay_minutes=0,
            last_appointment_cutoff_minutes=30,
            created_at=now,
            updated_at=now,
            updated_by=current_user.id
        )
        await db.appointment_slot_config.insert_one(default_config.dict())
        return default_config
    
    return AppointmentSlotConfig(**config)


@api_router.put("/appointment-slot-config", response_model=AppointmentSlotConfig)
async def update_appointment_slot_config(
    config_data: AppointmentSlotConfigUpdate,
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Update appointment slot configuration (manager/admin only)"""
    
    # Validate values
    valid_intervals = [15, 30, 45, 60]
    valid_delays = [0, 15, 30, 45, 60]
    valid_cutoffs = [15, 30, 45, 60]
    
    if config_data.slot_interval_minutes is not None and config_data.slot_interval_minutes not in valid_intervals:
        raise HTTPException(status_code=400, detail="Slot interval must be 15, 30, 45, or 60 minutes")
    
    if config_data.first_appointment_delay_minutes is not None and config_data.first_appointment_delay_minutes not in valid_delays:
        raise HTTPException(status_code=400, detail="First appointment delay must be 0, 15, 30, 45, or 60 minutes")
    
    if config_data.last_appointment_cutoff_minutes is not None and config_data.last_appointment_cutoff_minutes not in valid_cutoffs:
        raise HTTPException(status_code=400, detail="Last appointment cutoff must be 15, 30, 45, or 60 minutes")
    
    # Get existing configuration
    existing_config = await db.appointment_slot_config.find_one()
    
    if not existing_config:
        # Create new configuration
        now = datetime.utcnow()
        new_config = AppointmentSlotConfig(
            id=str(uuid.uuid4()),
            slot_interval_minutes=config_data.slot_interval_minutes or 30,
            first_appointment_delay_minutes=config_data.first_appointment_delay_minutes or 0,
            last_appointment_cutoff_minutes=config_data.last_appointment_cutoff_minutes or 30,
            created_at=now,
            updated_at=now,
            updated_by=current_user.id
        )
        await db.appointment_slot_config.insert_one(new_config.dict())
        return new_config
    
    # Update existing configuration
    update_data = {}
    if config_data.slot_interval_minutes is not None:
        update_data["slot_interval_minutes"] = config_data.slot_interval_minutes
    if config_data.first_appointment_delay_minutes is not None:
        update_data["first_appointment_delay_minutes"] = config_data.first_appointment_delay_minutes
    if config_data.last_appointment_cutoff_minutes is not None:
        update_data["last_appointment_cutoff_minutes"] = config_data.last_appointment_cutoff_minutes
    
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        update_data["updated_by"] = current_user.id
        await db.appointment_slot_config.update_one({}, {"$set": update_data})
    
    # Get updated configuration
    updated_config = await db.appointment_slot_config.find_one()
    return AppointmentSlotConfig(**updated_config)


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


@api_router.put("/urgent-care-appointments/{appointment_id}", response_model=UrgentCareAppointment)
async def update_appointment(
    appointment_id: str,
    appointment_data: UrgentCareAppointmentCreate,
    current_user: User = Depends(get_staff_user)
):
    """Update an existing urgent care appointment"""
    
    # Check if appointment exists
    existing_appointment = await db.urgent_care_appointments.find_one({"id": appointment_id})
    if not existing_appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    # Prepare update data
    update_data = {
        "owner_first_name": appointment_data.owner_first_name,
        "owner_last_name": appointment_data.owner_last_name,
        "phone": appointment_data.phone,
        "email": appointment_data.email,
        "pet_name": appointment_data.pet_name,
        "pet_type": appointment_data.pet_type,
        "pet_age": appointment_data.pet_age,
        "reason_for_visit": appointment_data.reason_for_visit,
        "appointment_time": appointment_data.appointment_time,
        "additional_notes": appointment_data.additional_notes,
        "updated_at": await business_now_async()
    }
    
    # Update the appointment
    result = await db.urgent_care_appointments.update_one(
        {"id": appointment_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Failed to update appointment")
    
    # Fetch and return the updated appointment
    updated_appointment = await db.urgent_care_appointments.find_one({"id": appointment_id})
    return UrgentCareAppointment(**updated_appointment)


@api_router.get("/urgent-care-time-slots/{date}")
async def get_available_time_slots(
    date: str,
    current_user: Optional[User] = Depends(get_current_user_optional_bearer)
):
    """Get available time slots for urgent care booking for a specific date"""
    try:
        from datetime import datetime, timedelta
        import re
        import pytz
        
        # Get business timezone from business info
        business_info = await db.business_info.find_one()
        business_timezone_str = "America/New_York"  # Default timezone
        if business_info and business_info.get("timezone"):
            business_timezone_str = business_info["timezone"]
        
        # Set up timezone
        business_tz = pytz.timezone(business_timezone_str)
        utc_tz = pytz.UTC
        
        # Get current time in business timezone
        utc_now = datetime.now(utc_tz)
        business_now = utc_now.astimezone(business_tz)
        business_today_str = business_now.strftime("%Y-%m-%d")
        
        # Only allow today's date (in business timezone)
        if date != business_today_str:
            return {
                "available": False, 
                "message": "Appointments are only available for today. For future appointments, please call us directly.",
                "date": date,
                "business_timezone": business_timezone_str,
                "business_time": business_now.strftime("%I:%M %p %Z")
            }
        
        day_name = business_now.strftime("%A").lower()
        
        # Check for special holidays first
        special_hours = await db.special_hours.find({"date": date}).to_list(length=None)
        urgent_care_hours = None
        
        if special_hours:
            # Found special hours for today
            special_hour = special_hours[0]
            if special_hour.get("closed", False):
                return {
                    "available": False,
                    "message": f"Urgent Care is closed today ({special_hour.get('name', 'Special Holiday')}). Please call us for emergency assistance.",
                    "date": date,
                    "business_timezone": business_timezone_str
                }
            urgent_care_hours = special_hour.get("urgent_care")
        else:
            # Get regular urgent care hours
            regular_hours = await db.urgent_care_hours.find_one()
            if not regular_hours:
                return {
                    "available": False,
                    "message": "Urgent care hours not configured. Please call us to schedule an appointment.",
                    "date": date,
                    "business_timezone": business_timezone_str
                }
            urgent_care_hours = regular_hours.get(day_name)
        
        # Check if urgent care is open today
        if not urgent_care_hours or not urgent_care_hours.get("is_open", True):
            return {
                "available": False,
                "message": "Urgent Care is closed today. Please call us for emergency assistance.",
                "date": date,
                "business_timezone": business_timezone_str
            }
        
        # Parse opening and closing times
        open_time_str = urgent_care_hours.get("open_time", "")
        close_time_str = urgent_care_hours.get("close_time", "")
        
        if not open_time_str or not close_time_str:
            return {
                "available": False,
                "message": "Urgent Care hours not properly configured. Please call us to schedule an appointment.",
                "date": date,
                "business_timezone": business_timezone_str
            }
        
        # Convert time strings to datetime objects in business timezone
        def parse_time(time_str):
            # Handle formats like "09:00", "9:00 AM", "09:00 AM", etc.
            time_str = time_str.strip().upper()
            
            # Remove AM/PM and extract time
            am_pm = ""
            if "AM" in time_str or "PM" in time_str:
                am_pm = "AM" if "AM" in time_str else "PM"
                time_str = re.sub(r'\s*(AM|PM)\s*', '', time_str)
            
            # Parse hour and minute
            if ":" in time_str:
                hour, minute = map(int, time_str.split(":"))
            else:
                hour = int(time_str)
                minute = 0
            
            # Convert to 24-hour format if needed
            if am_pm == "PM" and hour != 12:
                hour += 12
            elif am_pm == "AM" and hour == 12:
                hour = 0
            
            # Create timezone-aware datetime
            business_date = business_now.replace(hour=hour, minute=minute, second=0, microsecond=0)
            return business_date
        
        try:
            open_time = parse_time(open_time_str)
            close_time = parse_time(close_time_str)
        except (ValueError, TypeError) as e:
            return {
                "available": False,
                "message": "Invalid time format in urgent care hours. Please call us to schedule an appointment.",
                "date": date,
                "business_timezone": business_timezone_str
            }
        
        # Get appointment slot configuration
        slot_config = await db.appointment_slot_config.find_one()
        if not slot_config:
            # Use default configuration
            slot_interval = 30
            first_delay = 0
            last_cutoff = 30
        else:
            slot_interval = slot_config.get("slot_interval_minutes", 30)
            first_delay = slot_config.get("first_appointment_delay_minutes", 0)
            last_cutoff = slot_config.get("last_appointment_cutoff_minutes", 30)
        
        # Apply first appointment delay to opening time
        adjusted_open_time = open_time + timedelta(minutes=first_delay)
        
        # Ensure we don't start before current time (in business timezone)
        start_time = max(adjusted_open_time, business_now)
        
        # Round start time to next slot interval
        if start_time.minute % slot_interval != 0:
            minutes_to_add = slot_interval - (start_time.minute % slot_interval)
            start_time = start_time.replace(second=0, microsecond=0) + timedelta(minutes=minutes_to_add)
        else:
            start_time = start_time.replace(second=0, microsecond=0)
        
        # Last appointment slot should be [cutoff] minutes before closing
        end_time = close_time - timedelta(minutes=last_cutoff)
        
        if start_time >= end_time:
            return {
                "available": False,
                "message": "No more appointments available today. Urgent Care is closing soon. Please call us for emergency assistance.",
                "date": date,
                "business_timezone": business_timezone_str,
                "current_business_time": business_now.strftime("%I:%M %p %Z")
            }
        
        # Get existing appointments for today to exclude booked slots
        # Convert business date range to UTC for database query
        business_start_of_day = business_now.replace(hour=0, minute=0, second=0, microsecond=0)
        business_end_of_day = business_start_of_day + timedelta(days=1)
        
        utc_start_of_day = business_start_of_day.astimezone(utc_tz)
        utc_end_of_day = business_end_of_day.astimezone(utc_tz)
        
        existing_appointments = await db.urgent_care_appointments.find({
            "appointment_time": {
                "$gte": utc_start_of_day.strftime("%Y-%m-%dT%H:%M:%S"),
                "$lt": utc_end_of_day.strftime("%Y-%m-%dT%H:%M:%S")
            },
            "status": {"$ne": "cancelled"}  # Exclude cancelled appointments
        }).to_list(length=None)
        
        # Get blocked slots for this date
        blocked_slots_data = await db.blocked_slots.find({
            "date": date,
            "is_active": True
        }).to_list(length=None)
        
        # Collect booked and blocked time slots
        booked_slots = set()
        for appointment in existing_appointments:
            appointment_time = appointment.get("appointment_time", "")
            if appointment_time:
                try:
                    # Parse appointment time and convert to business timezone
                    if "T" in appointment_time:
                        appt_dt = datetime.fromisoformat(appointment_time.replace('Z', '+00:00'))
                        if appt_dt.tzinfo is None:
                            appt_dt = utc_tz.localize(appt_dt)
                        appt_business_time = appt_dt.astimezone(business_tz)
                        time_part = appt_business_time.strftime("%H:%M")
                        booked_slots.add(time_part)
                except Exception as e:
                    print(f"Error parsing appointment time {appointment_time}: {e}")
                    continue
        
        # Add blocked slots to unavailable slots
        blocked_times = set()
        for blocked_slot in blocked_slots_data:
            blocked_times.add(blocked_slot["time"])
        
        # Combine booked and blocked slots for regular users
        # Staff members will see blocked slots differently
        is_staff = current_user and current_user.role in ['manager', 'technician', 'admin']
        
        # Generate time slots
        available_slots = []
        current_slot = start_time
        
        while current_slot < end_time:
            slot_time_str = current_slot.strftime("%H:%M")
            
            # Check if slot is booked
            is_booked = slot_time_str in booked_slots
            
            # Check if slot is blocked
            blocked_slot_info = None
            for blocked_slot in blocked_slots_data:
                if blocked_slot["time"] == slot_time_str:
                    blocked_slot_info = blocked_slot
                    break
            
            is_blocked = blocked_slot_info is not None
            
            # For regular users: exclude both booked and blocked slots
            # For staff: include blocked slots with special marking
            should_include_slot = True
            
            if is_booked:
                should_include_slot = False  # Never show booked slots
            elif is_blocked and not is_staff:
                should_include_slot = False  # Don't show blocked slots to regular users
            
            if should_include_slot:
                slot_data = {
                    "time": slot_time_str,
                    "value": current_slot.astimezone(utc_tz).strftime("%Y-%m-%dT%H:%M"),  # Store as UTC
                    "display": current_slot.strftime("%I:%M %p").lstrip('0'),  # Display in business time
                    "business_time": current_slot.strftime("%I:%M %p %Z"),
                    "is_blocked": is_blocked
                }
                
                # Add blocked slot info for staff
                if is_blocked and is_staff:
                    slot_data["blocked_info"] = {
                        "id": blocked_slot_info["id"],
                        "reason": blocked_slot_info.get("reason"),
                        "blocked_by": blocked_slot_info.get("blocked_by_name"),
                        "blocked_at": blocked_slot_info.get("blocked_at")
                    }
                
                available_slots.append(slot_data)
            
            current_slot += timedelta(minutes=slot_interval)
        
        if not available_slots:
            return {
                "available": False,
                "message": "All appointment slots are booked for today. Please call us to check for cancellations or emergency assistance.",
                "date": date,
                "business_timezone": business_timezone_str,
                "current_business_time": business_now.strftime("%I:%M %p %Z")
            }
        
        return {
            "available": True,
            "slots": available_slots,
            "date": date,
            "business_timezone": business_timezone_str,
            "current_business_time": business_now.strftime("%I:%M %p %Z"),
            "hours": {
                "open": open_time.strftime("%I:%M %p").lstrip('0'),
                "close": close_time.strftime("%I:%M %p").lstrip('0')
            },
            "slot_config": {
                "interval_minutes": slot_interval,
                "first_appointment_delay_minutes": first_delay,
                "last_appointment_cutoff_minutes": last_cutoff
            }
        }
        
    except Exception as e:
        return {
            "available": False,
            "message": f"Error generating time slots: {str(e)}",
            "date": date
        }


# Blocked Time Slots API Endpoints

@api_router.get("/blocked-slots/{date}", response_model=List[BlockedSlot])
async def get_blocked_slots(
    date: str,  # YYYY-MM-DD format
    current_user: User = Depends(get_staff_user)
):
    """Get blocked time slots for a specific date (staff only)"""
    blocked_slots = await db.blocked_slots.find({
        "date": date,
        "is_active": True
    }).to_list(length=None)
    
    return [BlockedSlot(**slot) for slot in blocked_slots]


@api_router.post("/blocked-slots", response_model=BlockedSlot)
async def create_blocked_slot(
    slot_data: BlockedSlotCreate,
    current_user: User = Depends(get_staff_user)  # Managers and technicians can block
):
    """Block a time slot for a specific date and time"""
    # Check if slot is already blocked
    existing_block = await db.blocked_slots.find_one({
        "date": slot_data.date,
        "time": slot_data.time,
        "is_active": True
    })
    
    if existing_block:
        raise HTTPException(
            status_code=400,
            detail="This time slot is already blocked"
        )
    
    # Check if there's an existing appointment at this time
    from datetime import datetime
    slot_datetime_str = f"{slot_data.date}T{slot_data.time}"
    existing_appointment = await db.urgent_care_appointments.find_one({
        "appointment_time": {"$regex": f"^{slot_datetime_str}"}
    })
    
    if existing_appointment:
        raise HTTPException(
            status_code=400,
            detail="Cannot block this slot - there's already an appointment booked"
        )
    
    # Create blocked slot
    blocked_slot = BlockedSlot(
        id=str(uuid.uuid4()),
        date=slot_data.date,
        time=slot_data.time,
        reason=slot_data.reason,
        blocked_by=current_user.id,
        blocked_by_name=current_user.full_name,
        blocked_at=datetime.utcnow(),
        is_active=True
    )
    
    await db.blocked_slots.insert_one(blocked_slot.dict())
    return blocked_slot


@api_router.delete("/blocked-slots/{slot_id}")
async def unblock_slot(
    slot_id: str,
    current_user: User = Depends(get_staff_user)
):
    """Unblock a time slot"""
    blocked_slot = await db.blocked_slots.find_one({"id": slot_id})
    if not blocked_slot:
        raise HTTPException(status_code=404, detail="Blocked slot not found")
    
    # Set is_active to False (soft delete)
    await db.blocked_slots.update_one(
        {"id": slot_id},
        {"$set": {"is_active": False}}
    )
    
    return {"message": "Time slot unblocked successfully"}


@api_router.put("/blocked-slots/{slot_id}", response_model=BlockedSlot)
async def update_blocked_slot(
    slot_id: str,
    slot_data: BlockedSlotUpdate,
    current_user: User = Depends(get_staff_user)
):
    """Update a blocked time slot"""
    blocked_slot = await db.blocked_slots.find_one({"id": slot_id})
    if not blocked_slot:
        raise HTTPException(status_code=404, detail="Blocked slot not found")
    
    update_data = {}
    for field, value in slot_data.dict().items():
        if value is not None:
            update_data[field] = value
    
    await db.blocked_slots.update_one(
        {"id": slot_id},
        {"$set": update_data}
    )
    
    updated_slot = await db.blocked_slots.find_one({"id": slot_id})
    return BlockedSlot(**updated_slot)


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
@api_router.get("/business-info")
async def get_business_info():
    """Get business information including current time (public endpoint)"""
    business_info = await db.business_info.find_one()
    
    if not business_info:
        # Create default business info if none exists
        now = datetime.utcnow()
        default_info = BusinessInfo(
            id=str(uuid.uuid4()),
            hospital_name="Pets and Vets Animal Hospital & Urgent Care",
            tagline="Compassionate Care for Your Beloved Pets", 
            phone="(703) 957-3297",
            email="vet@petsandvetsanimalhospital.com",
            address="43114 Peacock Market Plaza, Suite F110, South Riding, VA 20152",
            referral_hospital_name="VCA SouthPaws",
            referral_hospital_phone="(703) 752-9100",
            facebook_link="",
            instagram_link="",
            twitter_link="",
            whatsapp_group_link="",
            google_reviews_link="",
            yelp_reviews_link="",
            facebook_reviews_link="",
            hero_images=[
                "https://customer-assets.emergentagent.com/job_peacock-pet-care/artifacts/ulwulpak_emilee.png",
                "https://customer-assets.emergentagent.com/job_peacock-pet-care/artifacts/ej59vv47_vanama.png"
            ],
            created_at=now,
            updated_at=now
        )
        # Use upsert to prevent duplicates
        await db.business_info.replace_one(
            {},  # Empty filter means any document
            default_info.dict(),
            upsert=True
        )
        
        # Add current time to the response
        business_now = await business_now_async()
        result = default_info.dict()
        result["current_time"] = business_now.isoformat()
        result["timestamp"] = business_now.timestamp()
        return result
    
    # Add current time to existing business info
    business_now = await business_now_async()
    result = BusinessInfo(**business_info).dict()
    result["current_time"] = business_now.isoformat() 
    result["timestamp"] = business_now.timestamp()
    return result


@api_router.put("/business-info", response_model=BusinessInfo)
async def update_business_info(
    business_data: BusinessInfoUpdate, 
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Update business information (admin only)"""
    
    # Get existing business info
    existing_info = await db.business_info.find_one()
    
    if not existing_info:
        # Create default business info with user-provided updates
        now = datetime.utcnow()
        new_info = BusinessInfo(
            id=str(uuid.uuid4()),
            hospital_name=business_data.hospital_name or "Pets and Vets Animal Hospital & Urgent Care",
            tagline=business_data.tagline or "Compassionate Care for Your Beloved Pets",
            phone=business_data.phone or "(703) 957-3297", 
            email=business_data.email or "vet@petsandvetsanimalhospital.com",
            address=business_data.address or "43114 Peacock Market Plaza, Suite F110, South Riding, VA 20152",
            timezone=business_data.timezone or "America/New_York",
            facebook_link=business_data.facebook_link or "",
            instagram_link=business_data.instagram_link or "",
            twitter_link=business_data.twitter_link or "",
            whatsapp_group_link=business_data.whatsapp_group_link or "",
            google_reviews_link=business_data.google_reviews_link or "",
            yelp_reviews_link=business_data.yelp_reviews_link or "",
            facebook_reviews_link=business_data.facebook_reviews_link or "",
            referral_hospital_name=business_data.referral_hospital_name or "VCA SouthPaws",
            referral_hospital_phone=business_data.referral_hospital_phone or "(703) 752-9100",
            hero_images=business_data.hero_images or [
                "https://customer-assets.emergentagent.com/job_peacock-pet-care/artifacts/ulwulpak_emilee.png",
                "https://customer-assets.emergentagent.com/job_peacock-pet-care/artifacts/ej59vv47_vanama.png"
            ],
            created_at=now,
            updated_at=now
        )
        # Use upsert to prevent duplicates
        await db.business_info.replace_one(
            {},  # Empty filter means any document
            new_info.dict(),
            upsert=True
        )
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
    if business_data.timezone is not None:
        update_data["timezone"] = business_data.timezone
    if business_data.facebook_link is not None:
        update_data["facebook_link"] = business_data.facebook_link
    if business_data.instagram_link is not None:
        update_data["instagram_link"] = business_data.instagram_link
    if business_data.twitter_link is not None:
        update_data["twitter_link"] = business_data.twitter_link
    if business_data.whatsapp_group_link is not None:
        update_data["whatsapp_group_link"] = business_data.whatsapp_group_link
    if business_data.google_reviews_link is not None:
        update_data["google_reviews_link"] = business_data.google_reviews_link
    if business_data.yelp_reviews_link is not None:
        update_data["yelp_reviews_link"] = business_data.yelp_reviews_link
    if business_data.facebook_reviews_link is not None:
        update_data["facebook_reviews_link"] = business_data.facebook_reviews_link
    if business_data.referral_hospital_name is not None:
        update_data["referral_hospital_name"] = business_data.referral_hospital_name
    if business_data.referral_hospital_phone is not None:
        update_data["referral_hospital_phone"] = business_data.referral_hospital_phone
    if business_data.hero_images is not None:
        update_data["hero_images"] = business_data.hero_images
    
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        await db.business_info.update_one({}, {"$set": update_data})
        
        # Get updated business info
        updated_info = await db.business_info.find_one()
        return BusinessInfo(**updated_info)
    
    return BusinessInfo(**existing_info)


# Email Configuration API endpoints
@api_router.get("/email-config", response_model=EmailConfig)
async def get_email_config(
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Get email configuration (manager/admin only)"""
    config = await db.email_config.find_one()
    
    if not config:
        # Return default configuration
        now = datetime.utcnow()
        default_config = EmailConfig(
            id=str(uuid.uuid4()),
            notification_email="",
            email_provider=EmailProvider.GMAIL,
            is_enabled=False,
            smtp_email=None,
            smtp_password=None,
            sendgrid_api_key=None,
            sender_email=None,
            created_at=now,
            updated_at=now
        )
        return default_config
    
    # Don't return encrypted passwords/keys for security
    config_response = EmailConfig(**config)
    config_response.smtp_password = "****" if config.get('smtp_password') else None
    config_response.sendgrid_api_key = "****" if config.get('sendgrid_api_key') else None
    
    return config_response


@api_router.post("/email-config", response_model=dict)
async def update_email_config(
    config_data: EmailConfigUpdate,
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Update email configuration (manager/admin only)"""
    
    # Get existing config
    existing_config = await db.email_config.find_one()
    
    if not existing_config:
        # Create new config
        now = datetime.utcnow()
        new_config = {
            "id": str(uuid.uuid4()),
            "notification_email": config_data.notification_email or "",
            "email_provider": config_data.email_provider or EmailProvider.GMAIL,
            "is_enabled": config_data.is_enabled or False,
            "smtp_email": email_service.encrypt_data(config_data.smtp_email) if config_data.smtp_email else None,
            "smtp_password": email_service.encrypt_data(config_data.smtp_password) if config_data.smtp_password else None,
            "sendgrid_api_key": email_service.encrypt_data(config_data.sendgrid_api_key) if config_data.sendgrid_api_key else None,
            "sender_email": config_data.sender_email,
            "created_at": now,
            "updated_at": now
        }
        await db.email_config.insert_one(new_config)
        return {"message": "Email configuration created successfully", "id": new_config["id"]}
    
    # Update existing config
    update_data = {}
    if config_data.notification_email is not None:
        update_data["notification_email"] = config_data.notification_email
    if config_data.email_provider is not None:
        update_data["email_provider"] = config_data.email_provider
    if config_data.is_enabled is not None:
        update_data["is_enabled"] = config_data.is_enabled
    if config_data.smtp_email is not None:
        update_data["smtp_email"] = email_service.encrypt_data(config_data.smtp_email)
    if config_data.smtp_password is not None:
        update_data["smtp_password"] = email_service.encrypt_data(config_data.smtp_password)
    if config_data.sendgrid_api_key is not None:
        update_data["sendgrid_api_key"] = email_service.encrypt_data(config_data.sendgrid_api_key)
    if config_data.sender_email is not None:
        update_data["sender_email"] = config_data.sender_email
    
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        await db.email_config.update_one({}, {"$set": update_data})
    
    return {"message": "Email configuration updated successfully"}


@api_router.post("/email-config/test", response_model=dict)
async def test_email_config(
    test_request: TestEmailRequest,
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Send test email to verify configuration (manager/admin only)"""
    
    try:
        subject = "Test Email - Pet Hospital Notifications"
        html_content = f"""
        <html>
            <body>
                <h2>Email Configuration Test</h2>
                <p>This is a test email to verify your email configuration is working correctly.</p>
                <p><strong>Configured by:</strong> {current_user.full_name} ({current_user.email})</p>
                <p><strong>Test sent at:</strong> {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC</p>
                <hr>
                <p><em>This email was sent from your Pet Hospital notification system.</em></p>
            </body>
        </html>
        """
        
        success = await email_service.send_email(
            to_email=test_request.test_email,
            subject=subject,
            html_content=html_content
        )
        
        if success:
            return {"message": "Test email sent successfully!"}
        else:
            raise HTTPException(status_code=500, detail="Failed to send test email")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Test email failed: {str(e)}")


# SMS Configuration endpoints
class TestSMSRequest(BaseModel):
    test_phone: str

@api_router.get("/sms-config", response_model=SMSConfig)
async def get_sms_config(current_user: User = Depends(get_manager_or_admin_user)):
    """Get SMS configuration (manager/admin only)"""
    
    config = await db.sms_config.find_one({})
    if not config:
        # Return default configuration if none exists
        return SMSConfig()
    
    # Convert MongoDB document to SMSConfig model
    config.pop('_id', None)  # Remove MongoDB _id field
    return SMSConfig(**config)

@api_router.post("/sms-config", response_model=dict)
async def update_sms_config(
    config: SMSConfig,
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Update SMS configuration (manager/admin only)"""
    
    # Convert to dict and prepare for MongoDB
    config_data = config.dict()
    
    # Add metadata
    config_data["updated_by"] = current_user.email
    config_data["updated_at"] = datetime.utcnow()
    
    # Check if configuration exists
    existing_config = await db.sms_config.find_one({})
    
    if existing_config:
        # Update existing configuration
        await db.sms_config.update_one({}, {"$set": config_data})
    else:
        # Create new configuration
        config_data["created_at"] = datetime.utcnow()
        await db.sms_config.insert_one(config_data)
    
    return {"message": "SMS configuration updated successfully"}

@api_router.post("/sms-config/test", response_model=dict)
async def test_sms_config(
    test_request: TestSMSRequest,
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Send test SMS to verify configuration (manager/admin only)"""
    
    try:
        # Get SMS configuration
        config = await db.sms_config.find_one({})
        if not config or not config.get('is_enabled'):
            raise HTTPException(status_code=400, detail="SMS is not enabled")
        
        sms_content = f"SMS Configuration Test - This is a test message to verify your SMS configuration is working correctly. Configured by {current_user.full_name} at {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC"
        
        # Send SMS based on provider
        if config.get('sms_provider') == 'sendgrid':
            result = await send_sms_via_sendgrid(test_request.test_phone, sms_content, config.get('sendgrid_api_key'))
        else:  # Default to Twilio
            result = await send_sms_via_twilio(
                test_request.test_phone, 
                sms_content, 
                config.get('twilio_account_sid'),
                config.get('twilio_auth_token'),
                config.get('twilio_phone_number')
            )
        
        if result.get('success'):
            return {"message": "Test SMS sent successfully!"}
        else:
            raise HTTPException(status_code=500, detail=f"Failed to send test SMS: {result.get('error')}")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Test SMS failed: {str(e)}")


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
    valid_categories = ["homepageslider", "team", "facility", "ai-generated"]
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
    current_user: User = Depends(get_manager_or_admin_user)
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
    current_user: User = Depends(get_manager_or_admin_user)
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
    current_user: User = Depends(get_manager_or_admin_user)
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
    current_user: User = Depends(get_manager_or_admin_user)
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
    current_user: User = Depends(get_manager_or_admin_user)
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
    current_user: User = Depends(get_manager_or_admin_user)
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
    current_user: User = Depends(get_manager_or_admin_user)
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
    current_user: User = Depends(get_manager_or_admin_user)
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
        {"$set": {"oauth_state": state, "updated_at": await business_now_async()}}
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
            "updated_at": await business_now_async()
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
                    "updated_at": await business_now_async()
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
            "updated_at": await business_now_async()
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


# ===============================
# AI SOCIAL MEDIA MODELS
# ===============================

class AIAgentType(str, Enum):
    SOCIAL_MEDIA = "social_media"
    TIME_SHEET = "time_sheet"
    EMAIL_AGENT = "email"
    SMS_AGENT = "sms_agent"
    MARKETING_AGENT = "marketing_agent"

class AIAgentMode(str, Enum):
    AUTO = "auto"  # Legacy support
    RECURRING = "recurring"
    ADHOC = "adhoc"
    WRITE = "write"

class PostStatus(str, Enum):
    GENERATING = "generating"
    READY = "ready" 
    APPROVED = "approved"
    PUBLISHED = "published"
    FAILED = "failed"
    REJECTED = "rejected"
    IN_REVIEW = "in_review"
    SCHEDULED = "scheduled"

class AIAgent(BaseModel):
    id: str
    agent_type: AIAgentType = AIAgentType.SOCIAL_MEDIA
    agent_name: Optional[str] = ""
    mode: AIAgentMode
    topic: Optional[str] = ""
    custom_topic: Optional[str] = ""
    # Write mode specific fields
    post_title: Optional[str] = ""
    post_content: Optional[str] = ""
    use_web_research: Optional[bool] = False
    # Common fields
    image_option: str  # ai_generate, upload, reference
    uploaded_images: Optional[List[str]] = []
    frequency: Optional[str] = None  # hours for recurring mode
    schedule_type: Optional[str] = "all_days"  # 'all_days' or 'selected_days'
    social_platforms: Dict[str, bool]
    post_time: Optional[str] = None
    image_text: Optional[str] = ""
    word_count: str
    days_of_week: Optional[Dict[str, bool]] = None  # recurring mode only
    auto_post: Optional[bool] = False  # recurring mode only
    post_destination: Optional[str] = "in_review"  # 'in_review', 'ready_to_publish'
    last_post_published: Optional[datetime] = None  # Track when last post was published
    post_date: Optional[str] = None  # adhoc/write mode
    immediate: Optional[bool] = False  # adhoc/write mode
    # Timesheet agent specific fields
    selected_employees: Optional[List[str]] = []  # User IDs of selected employees (empty = all employees)
    report_period: Optional[str] = "current_week"  # current_week, last_week, current_month, etc.
    custom_start_date: Optional[str] = None  # YYYY-MM-DD format
    custom_end_date: Optional[str] = None    # YYYY-MM-DD format
    include_billing_rates: Optional[bool] = True
    initial_status: Optional[str] = "in_review"  # Status for generated reports
    email_recipients: Optional[List[str]] = []  # Email addresses to send reports
    auto_email: Optional[bool] = False
    schedule_time: Optional[str] = "09:00"  # Time to generate reports
    last_manual_run: Optional[datetime] = None  # Track when agent was last run manually
    # Email agent specific fields
    selected_holidays: Optional[List[str]] = []  # Holiday IDs for scheduled email agents
    email_content_template: Optional[str] = ""  # Email template content for scheduled emails
    email_subject: Optional[str] = ""  # Email subject for write mode emails
    email_content: Optional[str] = ""  # Email content for write mode emails
    use_chatgpt_formatting: Optional[bool] = True  # Whether to use ChatGPT for email formatting
    use_customer_database: Optional[bool] = True  # Use customer database for email recipients
    email_type: Optional[str] = "bulk"  # bulk or single email
    selected_customer: Optional[str] = ""  # Customer ID for single emails
    # SMS agent specific fields
    sms_template: Optional[str] = ""  # SMS template content
    sms_subject: Optional[str] = ""  # SMS subject/title for write mode SMS
    sms_content: Optional[str] = ""  # SMS content for write mode SMS
    sms_provider: Optional[str] = "twilio"  # twilio or sendgrid
    use_sms_chatgpt_formatting: Optional[bool] = True  # Whether to use ChatGPT for SMS formatting
    sms_type: Optional[str] = "bulk"  # bulk or single SMS
    selected_sms_customer: Optional[str] = ""  # Customer ID for single SMS
    sms_character_limit: Optional[int] = 160  # SMS character limit
    sms_link: Optional[str] = "https://petsandvetsanimalhospital.com"  # Link for [LINK] placeholder replacement
    # Agent metadata
    created_at: datetime = Field(default_factory=business_now)
    updated_at: datetime = Field(default_factory=business_now)
    created_by: Optional[str] = None
    is_active: bool = True
    created_at: datetime
    updated_at: datetime
    is_active: bool = True

class AIAgentCreate(BaseModel):
    agent_type: AIAgentType = AIAgentType.SOCIAL_MEDIA
    agent_name: Optional[str] = ""
    mode: AIAgentMode
    topic: Optional[str] = ""
    custom_topic: Optional[str] = ""
    # Write mode specific fields
    post_title: Optional[str] = ""
    post_content: Optional[str] = ""
    use_web_research: Optional[bool] = False
    # Common fields
    image_option: Optional[str] = "ai_generate"
    uploaded_images: Optional[List[str]] = []
    frequency: Optional[str] = None
    social_platforms: Optional[Dict[str, bool]] = None
    post_time: Optional[str] = "09:00"
    image_text: Optional[str] = ""
    word_count: Optional[str] = "100"
    days_of_week: Optional[Dict[str, bool]] = None
    schedule_type: Optional[str] = "all_days"  # 'all_days' or 'selected_days'
    auto_post: Optional[bool] = False
    post_destination: Optional[str] = "in_review"  # 'in_review', 'ready_to_publish'
    last_post_published: Optional[datetime] = None  # Track when last post was published
    post_date: Optional[str] = None
    immediate: Optional[bool] = False
    # Timesheet agent specific fields
    selected_employees: Optional[List[str]] = []  # User IDs of selected employees (empty = all employees)
    run_every_pay_period: Optional[str] = "current_week"  # current_week, last_week, current_month, etc.
    days_after_period_end: Optional[int] = 1  # Days after period end to generate report
    report_period: Optional[str] = "current_week"  # current_week, last_week, current_month, etc.
    custom_start_date: Optional[str] = None  # YYYY-MM-DD format
    custom_end_date: Optional[str] = None    # YYYY-MM-DD format
    include_summary: Optional[bool] = True
    include_billing_rates: Optional[bool] = True
    initial_status: Optional[str] = "in_review"  # Status for generated reports
    email_recipients: Optional[List[str]] = []  # Email addresses to send reports
    auto_email: Optional[bool] = False
    schedule_time: Optional[str] = "09:00"  # Time to generate reports
    # Email agent specific fields
    selected_holidays: Optional[List[str]] = []  # Holiday IDs for scheduled email agents
    email_content_template: Optional[str] = ""  # Email template content for scheduled emails
    email_subject: Optional[str] = ""  # Email subject for write mode emails
    email_content: Optional[str] = ""  # Email content for write mode emails
    use_chatgpt_formatting: Optional[bool] = True  # Whether to use ChatGPT for email formatting
    use_customer_database: Optional[bool] = True  # Use customer database for email recipients
    email_type: Optional[str] = "bulk"  # bulk or single email
    selected_customer: Optional[str] = ""  # Customer ID for single emails
    # SMS agent specific fields
    sms_template: Optional[str] = ""  # SMS template content
    sms_subject: Optional[str] = ""  # SMS subject/title for write mode SMS
    sms_content: Optional[str] = ""  # SMS content for write mode SMS
    sms_provider: Optional[str] = "twilio"  # twilio or sendgrid
    use_sms_chatgpt_formatting: Optional[bool] = True  # Whether to use ChatGPT for SMS formatting
    sms_type: Optional[str] = "bulk"  # bulk or single SMS
    selected_sms_customer: Optional[str] = ""  # Customer ID for single SMS
    sms_character_limit: Optional[int] = 160  # SMS character limit
    sms_link: Optional[str] = "https://petsandvetsanimalhospital.com"  # Link for [LINK] placeholder replacement

class AIAgentUpdate(BaseModel):
    agent_name: Optional[str] = None
    mode: Optional[str] = None
    agent_type: Optional[str] = None
    custom_topic: Optional[str] = None
    image_text: Optional[str] = None
    word_count: Optional[str] = None
    days_of_week: Optional[Dict[str, bool]] = None
    schedule_type: Optional[str] = None  # 'all_days' or 'selected_days'
    post_time: Optional[str] = None
    auto_post: Optional[bool] = None
    post_destination: Optional[str] = None  # 'in_review', 'ready_to_publish'
    last_post_published: Optional[datetime] = None
    platforms: Optional[List[str]] = None
    status: Optional[str] = None

class AIPost(BaseModel):
    id: str
    agent_id: str
    agent_name: str
    topic: str
    content: Optional[str] = ""
    image_url: Optional[str] = ""
    image_text: Optional[str] = ""
    hashtags: Optional[List[str]] = []
    platforms: List[str]
    status: PostStatus
    workflow_origin: Optional[str] = None  # Track if post came from 'in_review' or directly to 'ready_to_publish'
    scheduled_for: Optional[datetime] = None
    published_at: Optional[datetime] = None
    social_media_links: Optional[List[Dict[str, str]]] = []
    error_message: Optional[str] = ""
    created_at: datetime
    updated_at: datetime

class AISettings(BaseModel):
    id: str
    llm_settings: Dict[str, Any]
    image_settings: Dict[str, Any]
    social_settings: Dict[str, Any]
    news_settings: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

class PostUpdate(BaseModel):
    content: Optional[str] = None
    image_text: Optional[str] = None  
    topic: Optional[str] = None

class AISettingsUpdate(BaseModel):
    llm_settings: Optional[Dict[str, Any]] = None
    image_settings: Optional[Dict[str, Any]] = None
    social_settings: Optional[Dict[str, Any]] = None
    news_settings: Optional[Dict[str, Any]] = None

# ===============================
# PAY PERIOD CONFIGURATION MODELS
# ===============================

class PayPeriodType(str, Enum):
    WEEKLY = "weekly"
    BI_WEEKLY = "bi_weekly"
    MONTHLY = "monthly"

class WeeklyPeriodConfig(BaseModel):
    start_day: str  # "monday", "tuesday", etc.
    end_day: str    # "sunday", "friday", etc.
    name: str       # "Monday to Sunday", "Monday to Friday", etc.

class BiWeeklyPeriodConfig(BaseModel):
    start_day: str  # "saturday", "sunday", etc.
    end_day: str    # "friday", "saturday", etc.
    name: str       # "Saturday to Friday", "Sunday to Saturday", etc.

class MonthlyPeriodConfig(BaseModel):
    start_day: int  # 1-31, day of month to start
    end_day: int    # 1-31, day of month to end, or -1 for last day
    name: str       # "1st to Last Day", "1st to 15th", etc.

class PayPeriodSetting(BaseModel):
    id: str
    period_type: PayPeriodType
    config_name: str  # User-defined name for this setting
    weekly_config: Optional[WeeklyPeriodConfig] = None
    bi_weekly_config: Optional[BiWeeklyPeriodConfig] = None
    monthly_config: Optional[MonthlyPeriodConfig] = None
    is_default: bool = False
    original_start_date: Optional[date] = None  # Reference date for calculating all pay periods
    created_at: datetime = Field(default_factory=business_now)
    updated_at: datetime = Field(default_factory=business_now)
    created_by: str

class PayPeriodSettingCreate(BaseModel):
    period_type: PayPeriodType
    config_name: str
    weekly_config: Optional[WeeklyPeriodConfig] = None
    bi_weekly_config: Optional[BiWeeklyPeriodConfig] = None
    monthly_config: Optional[MonthlyPeriodConfig] = None
    is_default: Optional[bool] = False
    original_start_date: Optional[date] = None  # Reference date for calculating all pay periods

class PayPeriodSettingUpdate(BaseModel):
    config_name: Optional[str] = None
    weekly_config: Optional[WeeklyPeriodConfig] = None
    bi_weekly_config: Optional[BiWeeklyPeriodConfig] = None
    monthly_config: Optional[MonthlyPeriodConfig] = None
    is_default: Optional[bool] = None
    original_start_date: Optional[date] = None  # Reference date for calculating all pay periods

# ===============================
# TIMESHEET AI AGENT MODELS
# ===============================

class TimesheetReportStatus(str, Enum):
    IN_REVIEW = "in_review"
    READY_TO_PUBLISH = "ready_to_publish"
    PUBLISHED = "published"

class TimesheetReportPeriod(str, Enum):
    CURRENT_WEEK = "current_week"
    LAST_WEEK = "last_week"
    CURRENT_MONTH = "current_month"
    LAST_MONTH = "last_month"
    CUSTOM = "custom"

class TimesheetAIAgent(BaseModel):
    """Extended AI Agent specifically for timesheet functionality"""
    id: str
    agent_name: str
    mode: AIAgentMode  # recurring or adhoc
    # Timesheet specific fields
    selected_employees: List[str] = []  # User IDs of selected employees (empty = all employees)
    report_period: TimesheetReportPeriod = TimesheetReportPeriod.CURRENT_WEEK
    custom_start_date: Optional[str] = None  # YYYY-MM-DD format
    custom_end_date: Optional[str] = None    # YYYY-MM-DD format
    include_summary: bool = True
    include_billing_rates: bool = True
    # Workflow settings
    initial_status: TimesheetReportStatus = TimesheetReportStatus.IN_REVIEW
    # Email settings
    email_recipients: List[str] = []  # Email addresses to send reports
    auto_email: bool = False
    # Scheduling (for recurring mode)
    frequency: Optional[str] = None  # "daily", "weekly", "monthly"
    schedule_time: Optional[str] = "09:00"  # Time to generate reports
    days_of_week: Optional[Dict[str, bool]] = None  # For weekly recurring
    # Agent metadata
    created_at: datetime = Field(default_factory=business_now)
    updated_at: datetime = Field(default_factory=business_now)
    created_by: str
    is_active: bool = True

class TimesheetAIAgentCreate(BaseModel):
    agent_name: str
    mode: AIAgentMode
    selected_employees: Optional[List[str]] = []
    report_period: Optional[TimesheetReportPeriod] = TimesheetReportPeriod.CURRENT_WEEK
    custom_start_date: Optional[str] = None
    custom_end_date: Optional[str] = None
    include_summary: Optional[bool] = True
    include_billing_rates: Optional[bool] = True
    initial_status: Optional[TimesheetReportStatus] = TimesheetReportStatus.IN_REVIEW
    email_recipients: Optional[List[str]] = []
    auto_email: Optional[bool] = False
    frequency: Optional[str] = None
    schedule_time: Optional[str] = "09:00"
    days_of_week: Optional[Dict[str, bool]] = None

class TimesheetAIAgentUpdate(BaseModel):
    agent_name: Optional[str] = None
    selected_employees: Optional[List[str]] = None
    report_period: Optional[TimesheetReportPeriod] = None
    custom_start_date: Optional[str] = None
    custom_end_date: Optional[str] = None
    include_summary: Optional[bool] = None
    include_billing_rates: Optional[bool] = None
    initial_status: Optional[TimesheetReportStatus] = None
    email_recipients: Optional[List[str]] = None
    auto_email: Optional[bool] = None
    frequency: Optional[str] = None
    schedule_time: Optional[str] = None
    days_of_week: Optional[Dict[str, bool]] = None
    is_active: Optional[bool] = None

class TimesheetAIReport(BaseModel):
    """Generated timesheet report with AI summary"""
    id: str
    agent_id: str
    agent_name: str
    # Report metadata
    report_period: TimesheetReportPeriod
    start_date: str  # YYYY-MM-DD
    end_date: str    # YYYY-MM-DD
    # Report content
    employee_data: List[Dict[str, Any]] = []  # Individual employee timesheet data
    summary: Optional[str] = None  # AI-generated summary
    total_hours: float = 0.0
    total_employees: int = 0
    total_cost: float = 0.0
    # Detailed breakdown
    regular_hours: float = 0.0
    after_hours_hours: float = 0.0
    regular_pay: float = 0.0
    after_hours_pay: float = 0.0
    # Workflow
    status: TimesheetReportStatus
    # Email tracking
    email_sent: bool = False
    email_sent_at: Optional[datetime] = None
    email_recipients: List[str] = []
    # Report links
    report_url: Optional[str] = None  # Link to view report
    pdf_url: Optional[str] = None    # Link to download PDF
    # Metadata
    created_at: datetime = Field(default_factory=business_now)
    updated_at: datetime = Field(default_factory=business_now)
    created_by: str

class TimesheetReportCreate(BaseModel):
    """Request to create a timesheet report"""
    selected_employees: Optional[List[str]] = []
    report_period: TimesheetReportPeriod
    custom_start_date: Optional[str] = None
    custom_end_date: Optional[str] = None
    include_summary: Optional[bool] = True
    include_billing_rates: Optional[bool] = True
    email_recipients: Optional[List[str]] = []

class TimesheetReportUpdate(BaseModel):
    """Update timesheet report status and content"""
    status: Optional[TimesheetReportStatus] = None
    summary: Optional[str] = None
    email_recipients: Optional[List[str]] = None

# ===============================
# AI COST TRACKING MODELS
# ===============================

class CostType(str, Enum):
    TEXT_GENERATION = "text_generation"
    IMAGE_GENERATION = "image_generation"
    EMAIL_FORMATTING = "email_formatting"

class AIUsageLog(BaseModel):
    id: str
    user_id: Optional[str] = None
    agent_id: Optional[str] = None
    cost_type: CostType
    provider: str  # 'openai', 'anthropic', 'google', 'emergent', 'stability'
    model: str  # 'gpt-4', 'dall-e-3', 'claude-3', etc.
    tokens_used: Optional[int] = None  # For text generation
    images_generated: Optional[int] = None  # For image generation
    prompt_tokens: Optional[int] = None
    completion_tokens: Optional[int] = None
    cost_usd: float  # Actual cost in USD
    request_details: Optional[Dict[str, Any]] = None  # Extra context
    created_at: datetime = Field(default_factory=business_now)

class CostAnalytics(BaseModel):
    id: str
    period_type: str  # 'daily', 'weekly', 'monthly', 'yearly'
    period_start: datetime
    period_end: datetime
    total_cost: float
    text_generation_cost: float
    image_generation_cost: float
    total_tokens: int
    total_images: int
    provider_breakdown: Dict[str, float]  # {'openai': 45.50, 'anthropic': 12.30}
    model_breakdown: Dict[str, float]  # {'gpt-4': 30.20, 'dall-e-3': 15.80}
    created_at: datetime = Field(default_factory=business_now)
    updated_at: datetime = Field(default_factory=business_now)

# ===============================
# COST CALCULATION UTILITIES
# ===============================

# Cost per token for different models (as of 2024)
TEXT_MODEL_COSTS = {
    # OpenAI Models (per 1K tokens)
    'gpt-4': {'input': 0.03, 'output': 0.06},
    'gpt-4-turbo': {'input': 0.01, 'output': 0.03},
    'gpt-3.5-turbo': {'input': 0.0015, 'output': 0.002},
    
    # Anthropic Models (per 1K tokens)
    'claude-3-opus': {'input': 0.015, 'output': 0.075},
    'claude-3-sonnet': {'input': 0.003, 'output': 0.015},
    'claude-3-haiku': {'input': 0.00025, 'output': 0.00125},
    
    # Google Models (per 1K tokens)
    'gemini-pro': {'input': 0.00025, 'output': 0.0005},
    'gemini-pro-vision': {'input': 0.00025, 'output': 0.0005},
    
    # Emergent (unified pricing)
    'emergent': {'input': 0.002, 'output': 0.004}
}

# Cost per image for different models
IMAGE_MODEL_COSTS = {
    # OpenAI DALL-E
    'dall-e-3': {'1024x1024': 0.040, '1024x1024-hd': 0.080, '1792x1024': 0.080, '1792x1024-hd': 0.120},
    'dall-e-2': {'1024x1024': 0.020, '512x512': 0.018, '256x256': 0.016},
    
    # Stability AI
    'stable-diffusion-xl': {'1024x1024': 0.040},
    'stable-diffusion-v1-6': {'512x512': 0.020},
    
    # Google
    'nano-banana': {'1024x1024': 0.020},
    'imagen-3': {'1024x1024': 0.040}
}

def calculate_text_cost(provider: str, model: str, prompt_tokens: int, completion_tokens: int) -> float:
    """Calculate cost for text generation"""
    try:
        if model in TEXT_MODEL_COSTS:
            costs = TEXT_MODEL_COSTS[model]
            input_cost = (prompt_tokens / 1000) * costs['input']
            output_cost = (completion_tokens / 1000) * costs['output']
            return round(input_cost + output_cost, 4)
        else:
            # Default fallback pricing
            return round(((prompt_tokens + completion_tokens) / 1000) * 0.002, 4)
    except Exception as e:
        logger.error(f"Error calculating text cost: {e}")
        return 0.0

def calculate_image_cost(provider: str, model: str, size: str, quality: str = 'standard', count: int = 1) -> float:
    """Calculate cost for image generation"""
    try:
        if model in IMAGE_MODEL_COSTS:
            size_key = f"{size}-{quality}" if quality == 'hd' else size
            if size_key in IMAGE_MODEL_COSTS[model]:
                return round(IMAGE_MODEL_COSTS[model][size_key] * count, 4)
            else:
                # Fallback to base size
                return round(IMAGE_MODEL_COSTS[model].get(size, 0.040) * count, 4)
        else:
            # Default fallback pricing
            return round(0.040 * count, 4)
    except Exception as e:
        logger.error(f"Error calculating image cost: {e}")
        return 0.0

async def log_ai_usage(
    cost_type: CostType,
    provider: str,
    model: str,
    cost_usd: float,
    user_id: str = None,
    agent_id: str = None,
    tokens_used: int = None,
    images_generated: int = None,
    prompt_tokens: int = None,
    completion_tokens: int = None,
    request_details: dict = None
):
    """Log AI usage for cost tracking"""
    try:
        usage_log = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "agent_id": agent_id,
            "cost_type": cost_type,
            "provider": provider,
            "model": model,
            "tokens_used": tokens_used,
            "images_generated": images_generated,
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "cost_usd": cost_usd,
            "request_details": request_details or {},
            "created_at": await business_now_async()
        }
        
        await db.ai_usage_logs.insert_one(usage_log)
        logger.info(f"Logged AI usage: {cost_type} - {provider}/{model} - ${cost_usd}")
        
    except Exception as e:
        logger.error(f"Error logging AI usage: {e}")

# ===============================
# AI CONTENT GENERATION FUNCTIONS
# ===============================



async def generate_post_for_agent(agent_id: str, agent_data: dict):
    """Generate a post for an AI agent - handles both social media and timesheet agents"""
    try:
        # Check agent type and route accordingly
        agent_type = agent_data.get('agent_type', AIAgentType.SOCIAL_MEDIA)
        
        if agent_type == AIAgentType.TIME_SHEET:
            # Handle timesheet agent - generate timesheet report
            return await generate_timesheet_report_for_agent(agent_id, agent_data)
        elif agent_type == AIAgentType.EMAIL_AGENT:
            # Handle email agent - generate email content
            return await generate_email_for_agent(agent_id, agent_data)
        elif agent_type == AIAgentType.SMS_AGENT:
            # Handle SMS agent - generate SMS content
            return await generate_sms_for_agent(agent_id, agent_data)
        else:
            # Handle social media agent - existing logic
            return await generate_social_media_post_for_agent(agent_id, agent_data)
            
    except Exception as e:
        logger.error(f"Error in generate_post_for_agent: {str(e)}")
        raise
async def generate_timesheet_report_for_agent(agent_id: str, agent_data: dict):
    """Generate a timesheet report for a timesheet agent and create a post entry"""
    try:
        logger.info(f"Generating timesheet report for agent {agent_id}")
        
        # Calculate date range based on agent's pay period configuration
        # Use run_every_pay_period for recurring agents, report_period for adhoc agents
        pay_period_setting = agent_data.get("run_every_pay_period") or agent_data.get("report_period", "current_week")
        
        logger.info(f"Calculating timesheet period for agent {agent_id}: pay_period_setting={pay_period_setting}")
        
        start_date, end_date = await calculate_report_period(
            pay_period_setting,
            agent_data.get("custom_start_date"),
            agent_data.get("custom_end_date"),
            agent_id  # Pass agent_id for agent-specific period calculation
        )
        
        logger.info(f"Final calculated period for agent {agent_id}: {start_date} to {end_date}")
        
        # Check if report already exists for this period and agent
        existing_post = await db.ai_posts.find_one({
            "agent_id": agent_id,
            "agent_type": "time_sheet",
            "timesheet_data.start_date": start_date,
            "timesheet_data.end_date": end_date
        })
        
        # Get selected employees or all employees
        selected_employees = agent_data.get("selected_employees", [])
        if not selected_employees:
            # Get all active employees
            employees_cursor = db.users.find({"role": {"$in": ["user", "technician", "manager"]}})
            all_employees = await employees_cursor.to_list(length=None)
            selected_employees = [emp["id"] for emp in all_employees]
        
        # Get timesheet data for the period
        employee_data = []
        total_hours = 0.0
        total_cost = 0.0
        
        for employee_id in selected_employees:
            # Get employee info
            employee = await db.users.find_one({"id": employee_id})
            if not employee:
                continue
            
            # Get employee config for rates
            employee_config = await db.employee_configs.find_one({"user_id": employee_id})
            if not employee_config:
                continue
            
            # Get time entries for the period
            start_datetime = datetime.strptime(start_date, '%Y-%m-%d')
            end_datetime = datetime.strptime(end_date, '%Y-%m-%d') + timedelta(days=1)
            
            time_entries_cursor = db.time_entries.find({
                "user_id": employee_id,
                "clock_in_time": {
                    "$gte": start_datetime,
                    "$lt": end_datetime
                },
                "clock_out_time": {"$ne": None}
            })
            time_entries = await time_entries_cursor.to_list(length=None)
            
            # Process each time entry to create detailed daily records
            daily_entries = []
            emp_regular_hours = 0.0
            emp_after_hours = 0.0
            
            # Group entries by date
            entries_by_date = {}
            for entry in time_entries:
                entry_date = entry["clock_in_time"].strftime("%Y-%m-%d")
                if entry_date not in entries_by_date:
                    entries_by_date[entry_date] = []
                entries_by_date[entry_date].append(entry)
            
            # Process each date
            for entry_date, date_entries in entries_by_date.items():
                date_regular_hours = 0.0
                date_after_hours = 0.0
                
                for entry in date_entries:
                    hours_calc = await calculate_hours(entry)
                    date_regular_hours += hours_calc.get("regular_hours", 0)
                    date_after_hours += hours_calc.get("after_hours_hours", 0)
                
                # Add daily entry record
                daily_entries.append({
                    "date": entry_date,
                    "regular_hours": date_regular_hours,
                    "after_hours": date_after_hours,
                    "total_hours": date_regular_hours + date_after_hours
                })
                
                emp_regular_hours += date_regular_hours
                emp_after_hours += date_after_hours
            
            emp_total_hours = emp_regular_hours + emp_after_hours
            
            # Calculate pay
            hourly_rate = employee_config.get("hourly_rate", 0.0)
            after_hours_rate = employee_config.get("after_hours_rate", hourly_rate * 1.5)
            
            emp_regular_pay = emp_regular_hours * hourly_rate
            emp_after_hours_pay = emp_after_hours * after_hours_rate
            emp_total_pay = emp_regular_pay + emp_after_hours_pay
            
            # Count unique days worked
            unique_dates = set()
            for entry in time_entries:
                work_date = entry["clock_in_time"].strftime("%Y-%m-%d")
                unique_dates.add(work_date)
            
            employee_data.append({
                "user_id": employee_id,
                "user_name": employee.get("full_name", "Unknown"),
                "user_email": employee.get("email", ""),
                "user_role": employee.get("role", "user"),
                "total_hours": emp_total_hours,
                "regular_hours": emp_regular_hours,
                "after_hours_hours": emp_after_hours,
                "hourly_rate": hourly_rate,
                "after_hours_rate": after_hours_rate,
                "regular_pay": emp_regular_pay,
                "after_hours_pay": emp_after_hours_pay,
                "total_pay": emp_total_pay,
                "days_worked": len(unique_dates),
                "daily_entries": daily_entries  # Detailed daily breakdown
            })
            
            total_hours += emp_total_hours
            total_cost += emp_total_pay
        
        # Create summary content (no AI generation)
        content = f"Timesheet Report: {start_date} to {end_date}\nTotal Employees: {len(employee_data)}\nTotal Hours: {total_hours:.2f}\nTotal Cost: ${total_cost:.2f}"
        
        # Use existing post ID if replacing, otherwise create new
        post_id = existing_post["id"] if existing_post else str(uuid.uuid4())
        now = await business_now_async()  # Use business timezone like social media posts
        
        # Determine the initial status based on agent configuration
        initial_status = agent_data.get("initial_status", "in_review")
        if initial_status == "ready_to_publish":
            post_status = PostStatus.READY
        else:
            post_status = PostStatus.IN_REVIEW
        
        # Create post record for the timesheet report
        post_data = {
            "id": post_id,
            "agent_id": agent_id,
            "agent_name": agent_data.get('agent_name', 'Timesheet AI Agent'),
            "agent_type": "time_sheet",
            "topic": f"Timesheet Report: {start_date} to {end_date}",
            "content": content,
            "image_url": None,  # No image for timesheet reports
            "image_text": None,  # No image text
            "hashtags": [],  # No hashtags for timesheet reports
            "platforms": ["timesheet"],
            "status": post_status,
            "workflow_status": post_status,
            "scheduled_for": None,
            "published_at": None,
            "social_media_links": [],
            "error_message": "",
            "created_at": existing_post["created_at"] if existing_post else now,
            "updated_at": now,
            # Detailed timesheet data for frontend rendering
            "timesheet_data": {
                "report_period": agent_data.get("report_period", "current_week"),
                "start_date": start_date,
                "end_date": end_date,
                "employee_data": employee_data,  # Includes daily_entries for each employee
                "total_hours": total_hours,
                "total_employees": len(employee_data),
                "total_cost": total_cost,
                "regular_hours": sum(emp["regular_hours"] for emp in employee_data),
                "after_hours_hours": sum(emp["after_hours_hours"] for emp in employee_data),
                "regular_pay": sum(emp["regular_pay"] for emp in employee_data),
                "after_hours_pay": sum(emp["after_hours_pay"] for emp in employee_data),
                "email_recipients": agent_data.get("email_recipients", []),
                "include_summary": False,  # No AI summary
                "include_billing_rates": True
            }
        }
        
        # Replace existing post or insert new one
        if existing_post:
            logger.info(f"Replacing existing timesheet report {post_id} for agent {agent_id}")
            await db.ai_posts.update_one(
                {"id": post_id},
                {"$set": post_data}
            )
        else:
            logger.info(f"Creating new AI post for timesheet agent {agent_id} with status {PostStatus.READY}")
            await db.ai_posts.insert_one(post_data)
        
        logger.info(f"Successfully created/updated AI post {post_id} for timesheet agent {agent_id}")
        
        logger.info(f"Successfully generated timesheet report {post_id} for agent {agent_id}")
        return post_id
            
    except Exception as e:
        logger.error(f"Error in generate_timesheet_report_for_agent: {str(e)}")
        raise

async def email_timesheet_report_post(post_id: str, email_data: dict):
    """Email a timesheet report post link to recipients"""
    try:
        # Get the post
        post = await db.ai_posts.find_one({"id": post_id})
        if not post:
            raise Exception("Timesheet report post not found")
        
        # Get email recipients
        recipients = email_data.get("recipients", post.get("timesheet_data", {}).get("email_recipients", []))
        if not recipients:
            raise Exception("No email recipients specified")
        
        # Generate report URL (this would point to the timesheet reports page)
        report_url = f"/timesheet-reports?post_id={post_id}"
        
        timesheet_data = post.get("timesheet_data", {})
        
        # Prepare email content
        subject = f"Timesheet Report - {post.get('agent_name', 'Generated Report')}"
        html_content = f"""
        <html>
        <body>
            <h2>Timesheet Report</h2>
            <p>A new timesheet report has been generated:</p>
            <ul>
                <li><strong>Report Period:</strong> {timesheet_data.get('start_date')} to {timesheet_data.get('end_date')}</li>
                <li><strong>Total Employees:</strong> {timesheet_data.get('total_employees', 0)}</li>
                <li><strong>Total Hours:</strong> {timesheet_data.get('total_hours', 0.0):.2f}</li>
                <li><strong>Total Cost:</strong> ${timesheet_data.get('total_cost', 0.0):.2f}</li>
            </ul>
            <p><a href="{report_url}" style="background-color: #29add3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Report</a></p>
            <br>
            <p>Best regards,<br>Timesheet AI Agent</p>
        </body>
        </html>
        """
        
        # Send emails to all recipients (placeholder - implement actual email service)
        email_sent = True  # Assume success for now
        
        return {"email_sent": email_sent, "recipients": recipients}
        
    except Exception as e:
        logger.error(f"Error emailing timesheet report post: {str(e)}")
        raise

def generate_topic_email_subject(topic: str, customer_name: str, pet_names: str) -> str:
    """Generate a topic-specific email subject line"""
    try:
        # Create a personalized subject based on topic and customer info
        if pet_names and pet_names.strip():
            pet_part = pet_names
        else:
            pet_part = "your pet"
        
        # Topic-specific subject templates
        topic_lower = topic.lower()
        
        if "vaccination" in topic_lower or "vaccine" in topic_lower:
            return f"Important Vaccination Reminder for {pet_part}"
        elif "dental" in topic_lower:
            return f"Dental Health Update for {pet_part}"
        elif "wellness" in topic_lower or "checkup" in topic_lower:
            return f"Wellness Check Reminder for {pet_part}"
        elif "nutrition" in topic_lower or "diet" in topic_lower:
            return f"Nutrition Tips for {pet_part}"
        elif "seasonal" in topic_lower or "weather" in topic_lower:
            return f"Seasonal Care Tips for {pet_part}"
        elif "emergency" in topic_lower or "urgent" in topic_lower:
            return f"Important Health Alert for {pet_part}"
        elif "holiday" in topic_lower:
            return f"Holiday Safety Tips for {pet_part}"
        elif "trending" in topic_lower and "health" in topic_lower:
            return f"Latest Health News for {pet_part}"
        else:
            # Generic subject for other topics
            return f"Important Update About {pet_part}'s Care"
            
    except Exception as e:
        # Fallback subject if generation fails
        return f"Important Pet Health Update - {topic}"

async def generate_recurring_email_for_agent(agent_id: str, agent_data: dict, post_id: str, now, email_template: str):
    """Generate email for recurring (topic-based) email agent"""
    try:
        use_chatgpt = agent_data.get('use_chatgpt_formatting', True)
        topic = agent_data.get('topic', 'General Update')
        
        logger.info(f"Generating recurring email for topic: {topic}")
        
        # Get a random customer from the database for preview
        customers_cursor = db.customers.aggregate([{"$sample": {"size": 1}}])
        customers_list = await customers_cursor.to_list(length=1)
        
        if not customers_list:
            logger.warning(f"No customers found in database for agent {agent_id}, using placeholder data")
            customer_name = "John Smith"
            pet_names = "Buddy"
            customer_email = "customer@example.com"
        else:
            customer = customers_list[0]
            customer_name = customer.get('name', 'Valued Customer')
            customer_email = customer.get('email', 'customer@example.com')
            
            # Get pet name(s) for this customer - handle both data structures
            pet_names = "your pet"  # Default fallback
            
            # Check for pets array structure (new format)
            pets = customer.get('pets', [])
            if pets:
                # Extract pet names from pets array
                valid_pet_names = [pet.get('name', '').strip() for pet in pets if pet.get('name', '').strip()]
                if valid_pet_names:
                    if len(valid_pet_names) == 1:
                        pet_names = valid_pet_names[0]
                    elif len(valid_pet_names) == 2:
                        pet_names = f"{valid_pet_names[0]} and {valid_pet_names[1]}"
                    else:
                        # For 3+ pets: "Buddy, Max, and Luna"
                        pet_names = ", ".join(valid_pet_names[:-1]) + f", and {valid_pet_names[-1]}"
            
            # Check for single pet_name field (current format)
            elif customer.get('pet_name', '').strip():
                pet_names = customer.get('pet_name').strip()
            
            logger.info(f"Using customer {customer_name} with pet(s): {pet_names} for email preview")
        
        # Create topic-specific content that properly incorporates the topic
        topic_specific_content = f"""Dear {customer_name},

I hope this message finds you and {pet_names} in excellent health!

As part of our commitment to keeping you informed about the latest developments in pet care, we're excited to share important updates about {topic}.

This information can help you make informed decisions about {pet_names}'s health and wellbeing. Our veterinary team stays current with the latest research and trends to provide you with valuable insights.

Here are some key points about {topic} that every pet owner should know:

• Stay informed about the latest veterinary research and recommendations
• Regular preventive care remains the foundation of good pet health
• Understanding current trends helps you make better decisions for {pet_names}
• Our team is always here to discuss any questions you may have

We believe that informed pet owners like you are the best advocates for their pets' health. If you have any questions about {topic} or how it might relate to {pet_names}'s care, please don't hesitate to reach out to our team.

Thank you for trusting us with {pet_names}'s care!

Best regards,
The Veterinary Care Team"""
        
        if use_chatgpt:
            # Try ChatGPT for minor enhancements, but don't rely on it completely
            try:
                from ai_service import format_topic_email_content
                
                enhanced_content = await format_topic_email_content(
                    template=topic_specific_content,
                    customer_name=customer_name,
                    pet_names=pet_names,
                    topic=topic
                )
                
                # Only use ChatGPT result if it's actually different and longer
                if enhanced_content != topic_specific_content and len(enhanced_content) > len(topic_specific_content):
                    logger.info(f"ChatGPT enhanced email content for agent {agent_id}")
                    topic_specific_content = enhanced_content
                else:
                    logger.info(f"Using template-based content for agent {agent_id} (ChatGPT did not improve)")
                
            except Exception as e:
                logger.error(f"ChatGPT formatting failed for agent {agent_id}: {str(e)}")
                logger.info(f"Using well-structured template-based content for agent {agent_id}")
        
        # Generate topic-specific email subject line
        subject_line = generate_topic_email_subject(topic, customer_name, pet_names)
        
        sample_content = topic_specific_content
        
        # Create post record for email preview
        post_data = {
            "id": post_id,
            "agent_id": agent_id,
            "agent_name": agent_data.get('agent_name', 'Email Agent'),
            "topic": f"{topic} - {agent_data.get('agent_name', 'Email Agent')}",
            "content": sample_content,
            "email_subject": subject_line,  # Add email subject line
            "image_url": "",
            "image_option": agent_data.get('image_option', 'none'),
            "platforms": ["email"],  # Email-specific platform
            "status": agent_data.get('post_destination', 'in_review'),
            "agent_type": "email",
            "created_at": now,
            "updated_at": now,
            "is_active": True,
            "word_count": str(len(sample_content.split())),
            "use_chatgpt_formatting": use_chatgpt,
            # Store email-specific metadata for mass sending
            "email_template": email_template,  # Original template with placeholders
            "sample_customer_name": customer_name,  # Customer used for preview
            "sample_pet_names": pet_names,  # Pet(s) used for preview
            "sample_customer_email": customer_email,  # Email used for preview
            "topic": topic,  # Topic context
            "ready_for_mass_email": False  # Will be set to True when published
        }
        
        # Insert post into database
        await db.ai_posts.insert_one(post_data)
        
        logger.info(f"Created recurring email post {post_id} for agent {agent_id} with status: {post_data['status']}")
        
        return {"post_id": post_id, "status": "completed"}
        
    except Exception as e:
        logger.error(f"Error in generate_recurring_email_for_agent: {str(e)}")
        import traceback
        traceback.print_exc()
        return

async def generate_email_for_agent(agent_id: str, agent_data: dict):
    """Generate an email for an AI email agent - handles both scheduled (holiday-based) and recurring (topic-based) agents"""
    try:
        # Create initial post record for email preview
        post_id = str(uuid.uuid4())
        now = await business_now_async()
        
        logger.info(f"Generating email for agent {agent_id}")
        
        # Get agent mode
        agent_mode = agent_data.get('mode', 'scheduled')
        
        # Handle different agent modes
        if agent_mode == 'write':
            # This is a write mode email agent - use email_content instead of email_content_template
            email_content = agent_data.get('email_content', '')
            if not email_content:
                logger.error(f"No email content found for write mode agent {agent_id}")
                return
            return await generate_write_mode_email_for_agent(agent_id, agent_data, post_id, now, email_content)
        elif agent_mode == 'recurring':
            # This is a topic-based recurring email agent
            email_template = agent_data.get('email_content_template', '')
            if not email_template:
                logger.error(f"No email template found for recurring agent {agent_id}")
                return
            return await generate_recurring_email_for_agent(agent_id, agent_data, post_id, now, email_template)
        else:
            # This is a scheduled (holiday-based) email agent
            email_template = agent_data.get('email_content_template', '')
            if not email_template:
                logger.error(f"No email template found for scheduled agent {agent_id}")
                return
            return await generate_scheduled_email_for_agent(agent_id, agent_data, post_id, now, email_template)
            
    except Exception as e:
        logger.error(f"Error in generate_email_for_agent: {str(e)}")
        import traceback
        traceback.print_exc()
        return

async def generate_scheduled_email_for_agent(agent_id: str, agent_data: dict, post_id: str, now, email_template: str):
    """Generate email for scheduled (holiday-based) email agent"""
    try:
        use_chatgpt = agent_data.get('use_chatgpt_formatting', True)
        selected_holidays = agent_data.get('selected_holidays', [])
        
        if not selected_holidays:
            logger.error(f"No holidays selected for scheduled email agent {agent_id}")
            return
        
        # Get holiday information for context
        holidays_cursor = db.holidays.find({"id": {"$in": selected_holidays}})
        holidays_list = await holidays_cursor.to_list(length=None)
        
        if not holidays_list:
            logger.error(f"No holiday data found for selected holidays {selected_holidays}")
            return
        
        # Find the next upcoming holiday from selected holidays
        from datetime import datetime
        today = datetime.now().date()
        
        # Parse and sort holidays by date to find the next upcoming one
        valid_holidays = []
        for holiday in holidays_list:
            try:
                holiday_date = datetime.strptime(holiday['date'], '%Y-%m-%d').date()
                valid_holidays.append({
                    'holiday_data': holiday,
                    'parsed_date': holiday_date
                })
            except Exception as e:
                logger.warning(f"Could not parse holiday date {holiday.get('date', 'unknown')}: {e}")
                continue
        
        if not valid_holidays:
            logger.error(f"No valid holiday dates found for scheduled agent {agent_id}")
            return
        
        # Sort holidays by date
        valid_holidays.sort(key=lambda x: x['parsed_date'])
        
        # Find the next upcoming holiday (today or later)
        upcoming_holiday = None
        for holiday_info in valid_holidays:
            if holiday_info['parsed_date'] >= today:
                upcoming_holiday = holiday_info['holiday_data']
                break
        
        # If no upcoming holiday found, use the earliest holiday (for past year wrap-around)
        if not upcoming_holiday:
            upcoming_holiday = valid_holidays[0]['holiday_data']
            logger.info(f"No upcoming holidays found, using earliest selected holiday: {upcoming_holiday.get('name')}")
        
        holiday_name = upcoming_holiday.get('name', 'Holiday')
        holiday_date = upcoming_holiday.get('date', '')
        
        logger.info(f"Using holiday context: {holiday_name} ({holiday_date})")
        
        # Get a random customer from the database for preview
        customers_cursor = db.customers.aggregate([{"$sample": {"size": 1}}])
        customers_list = await customers_cursor.to_list(length=1)
        
        if not customers_list:
            logger.warning(f"No customers found in database for agent {agent_id}, using placeholder data")
            customer_name = "John Smith"
            pet_names = "Buddy"
            customer_email = "customer@example.com"
        else:
            customer = customers_list[0]
            customer_name = customer.get('name', 'Valued Customer')
            customer_email = customer.get('email', 'customer@example.com')
            
            # Get pet name(s) for this customer - handle both data structures
            pet_names = "your pet"  # Default fallback
            
            # Check for pets array structure (new format)
            pets = customer.get('pets', [])
            if pets:
                # Extract pet names from pets array
                valid_pet_names = [pet.get('name', '').strip() for pet in pets if pet.get('name', '').strip()]
                if valid_pet_names:
                    if len(valid_pet_names) == 1:
                        pet_names = valid_pet_names[0]
                    elif len(valid_pet_names) == 2:
                        pet_names = f"{valid_pet_names[0]} and {valid_pet_names[1]}"
                    else:
                        # For 3+ pets: "Buddy, Max, and Luna"
                        pet_names = ", ".join(valid_pet_names[:-1]) + f", and {valid_pet_names[-1]}"
            
            # Check for single pet_name field (current format)
            elif customer.get('pet_name', '').strip():
                pet_names = customer.get('pet_name').strip()
            
            logger.info(f"Using customer {customer_name} with pet(s): {pet_names} for email preview")
        
        # Create holiday-specific content using the template
        # Replace all placeholders: customer, pets, and holiday context
        holiday_specific_content = email_template.replace('[CUSTOMER_NAME]', customer_name)
        holiday_specific_content = holiday_specific_content.replace('[PET_NAME]', pet_names)  # Legacy support
        holiday_specific_content = holiday_specific_content.replace('[PET_NAMES]', pet_names)  # New plural support
        holiday_specific_content = holiday_specific_content.replace('[HOLIDAY_NAME]', holiday_name)
        holiday_specific_content = holiday_specific_content.replace('[HOLIDAY_DATE]', holiday_date)
        
        if use_chatgpt:
            # Call actual ChatGPT API to format the email professionally
            try:
                from ai_service import format_email_content
                
                holiday_specific_content = await format_email_content(
                    template=holiday_specific_content,
                    customer_name=customer_name,
                    pet_names=pet_names,
                    holiday_name=holiday_name,
                    holiday_date=holiday_date
                )
                
                logger.info(f"ChatGPT formatting applied for email agent {agent_id}")
                
            except Exception as e:
                logger.error(f"ChatGPT formatting failed for agent {agent_id}: {str(e)}")
                # Fallback to basic formatting if ChatGPT fails
                holiday_specific_content = f"""Dear {customer_name},

{holiday_specific_content}

Wishing you and {pet_names} a wonderful {holiday_name}!

Warm regards,
The Veterinary Care Team"""
        
        sample_content = holiday_specific_content
        
        # Create post record for email preview
        post_data = {
            "id": post_id,
            "agent_id": agent_id,
            "agent_name": agent_data.get('agent_name', 'Email Agent'),
            "topic": f"{holiday_name} Email - {agent_data.get('agent_name', 'Email Agent')}",
            "content": sample_content,
            "image_url": "",
            "image_option": agent_data.get('image_option', 'none'),
            "platforms": ["email"],  # Email-specific platform
            "status": agent_data.get('post_destination', 'in_review'),
            "agent_type": "email",
            "created_at": now,
            "updated_at": now,
            "is_active": True,
            "word_count": str(len(sample_content.split())),
            "use_chatgpt_formatting": use_chatgpt,
            # Store email-specific metadata for mass sending
            "email_template": email_template,  # Original template with placeholders
            "sample_customer_name": customer_name,  # Customer used for preview
            "sample_pet_names": pet_names,  # Pet(s) used for preview
            "sample_customer_email": customer_email,  # Email used for preview
            "selected_holidays": agent_data.get('selected_holidays', []),  # Holiday context
            "holiday_name": holiday_name,  # Current holiday name
            "holiday_date": holiday_date,  # Current holiday date
            "ready_for_mass_email": False  # Will be set to True when published
        }
        
        # Insert post into database
        await db.ai_posts.insert_one(post_data)
        
        logger.info(f"Created email post {post_id} for agent {agent_id} with status: {post_data['status']}")
        
        return {"post_id": post_id, "status": "completed"}
        
    except Exception as e:
        logger.error(f"Error in generate_scheduled_email_for_agent: {str(e)}")
        import traceback
        traceback.print_exc()
        return

async def generate_write_mode_email_for_agent(agent_id: str, agent_data: dict, post_id: str, now, email_content: str):
    """Generate email for write mode email agent"""
    try:
        logger.info(f"Generating write mode email for agent {agent_id}")
        
        # Get agent settings
        use_chatgpt = agent_data.get('use_chatgpt_formatting', True)
        email_subject = agent_data.get('email_subject', 'Email from Your Veterinary Team')
        agent_name = agent_data.get('agent_name', 'Write Mode Email Agent')
        
        # Get a random customer for preview (same logic as other email functions)
        customers_cursor = db.customers.aggregate([{"$sample": {"size": 1}}])
        customers_list = await customers_cursor.to_list(length=1)
        
        if not customers_list:
            logger.warning("No customers found for email preview")
            customer_name = "Valued Customer"
            pet_names = "your pet"
        else:
            customer = customers_list[0]
            customer_name = customer.get('name', 'Valued Customer')
            
            # Handle pet names (both new pets array and legacy pet_name field)
            pets = customer.get('pets', [])
            if pets:
                # New format: array of pet objects
                valid_pet_names = [pet.get('name', '').strip() for pet in pets if pet.get('name', '').strip()]
            elif customer.get('pet_name', '').strip():
                # Legacy format: comma-separated string
                pet_names_str = customer.get('pet_name').strip()
                valid_pet_names = [name.strip() for name in pet_names_str.split(',') if name.strip()]
            else:
                valid_pet_names = []
            
            # Format pet names grammatically
            if len(valid_pet_names) == 0:
                pet_names = "your pet"
            elif len(valid_pet_names) == 1:
                pet_names = valid_pet_names[0]
            elif len(valid_pet_names) == 2:
                pet_names = f"{valid_pet_names[0]} and {valid_pet_names[1]}"
            else:
                pet_names = ", ".join(valid_pet_names[:-1]) + f", and {valid_pet_names[-1]}"
        
        logger.info(f"Using customer {customer_name} with pet(s): {pet_names} for email preview")
        
        # Replace placeholders in email content
        personalized_content = email_content.replace('[CUSTOMER_NAME]', customer_name)
        personalized_content = personalized_content.replace('[PET_NAME]', pet_names)
        personalized_content = personalized_content.replace('[PET_NAMES]', pet_names)
        
        # Apply ChatGPT formatting if enabled
        final_content = personalized_content
        if use_chatgpt:
            try:
                # For write mode emails, we need to create a custom formatting function
                # since the existing functions are for holiday/topic-based emails
                from ai_service import ai_service
                
                # Create a comprehensive prompt for write mode email formatting
                email_prompt = f"""You are a professional email formatter for a veterinary clinic. Please take the following email content and create a warm, grammatically perfect, and professionally formatted email.

INSTRUCTIONS:
1. Fix any grammatical errors
2. Make the tone warm but professional
3. Ensure the email flows naturally
4. Remove any duplicate or redundant closing statements
5. Create ONE cohesive, well-structured email
6. Keep the core message but enhance the language
7. Make it specific and personal to the customer and their pets
8. DO NOT include any subject line or "Subject:" in the email content - the subject is handled separately
9. Start directly with the greeting, do not add any subject line

EMAIL CONTENT TO ENHANCE:
{personalized_content}

DETAILS:
- Customer: {customer_name}
- Pet(s): {pet_names}

IMPORTANT: The email subject "{email_subject}" is already set separately. DO NOT include any subject line in your response. Start your email directly with the greeting.

Please create a complete, polished email body (no subject line) that a veterinary clinic would be proud to send. Include:
- A warm greeting (Dear {customer_name}, etc.)
- The main message (enhanced from the content)
- A single, professional closing

Make sure there are no duplicate signatures, subject lines, or redundant messages."""

                # Call ChatGPT using Emergent integrations
                from emergentintegrations.llm.chat import LlmChat, UserMessage
                
                chat = LlmChat(
                    api_key=ai_service.emergent_key,
                    session_id=f"write_email_format_{agent_id}_{now.timestamp()}",
                    system_message="You are a professional email formatter for a veterinary clinic specializing in write mode email enhancement."
                ).with_model("openai", "gpt-4o-mini")
                
                user_message = UserMessage(text=email_prompt)
                response = await chat.send_message(user_message)
                
                formatted_content = response.strip()
                
                if formatted_content and formatted_content.strip():
                    final_content = formatted_content
                    logger.info(f"Applied ChatGPT formatting to write mode email for agent {agent_id}")
                else:
                    logger.info(f"ChatGPT formatting returned empty, using original content for agent {agent_id}")
            except Exception as e:
                logger.error(f"ChatGPT formatting failed for agent {agent_id}: {str(e)}")
                logger.info(f"Using original content for agent {agent_id}")
        
        # Create the email post
        email_post = {
            "id": post_id,
            "agent_id": agent_id,
            "agent_name": agent_name,
            "agent_type": "email",
            "topic": email_subject,
            "content": final_content,
            "status": "in_review",
            "created_at": now,
            "updated_at": now,
            "platforms": ["email"],
            "email_template": email_content,  # Store original template for mass sending
            "sample_customer_name": customer_name,
            "sample_pet_names": pet_names,
            "email_subject": email_subject,
            "use_chatgpt_formatting": use_chatgpt,
            "email_type": agent_data.get('email_type', 'bulk'),
            "ready_for_mass_email": False,
            "mass_emails_sent": 0,
            "mass_emails_failed": 0
        }
        
        # Insert the post
        await db.ai_posts.insert_one(email_post)
        
        logger.info(f"Created write mode email post {post_id} for agent {agent_id} with status: in_review")
        
        return {
            "post_id": post_id,
            "status": "in_review",
            "content_preview": final_content[:200] + "..." if len(final_content) > 200 else final_content
        }
        
    except Exception as e:
        logger.error(f"Error in generate_write_mode_email_for_agent: {str(e)}")
        import traceback
        traceback.print_exc()
        return

async def send_mass_emails_from_post(post_id: str, post_data: dict):
    """Send personalized emails to all customers using the approved email template"""
    try:
        logger.info(f"Starting mass email sending for post {post_id}")
        
        # Get the original email template and holiday context from the post
        email_template = post_data.get('email_template', '')
        email_subject = post_data.get('email_subject', 'Important Message from Your Veterinary Team')
        use_chatgpt = post_data.get('use_chatgpt_formatting', True)
        holiday_name = post_data.get('holiday_name', 'Holiday')
        holiday_date = post_data.get('holiday_date', '')
        
        if not email_template:
            logger.error(f"No email template found in post {post_id}")
            return
        
        # Get all customers with email addresses
        customers = await db.customers.find({"email": {"$exists": True, "$ne": ""}}).to_list(length=None)
        
        if not customers:
            logger.warning(f"No customers found for mass email sending from post {post_id}")
            return
        
        logger.info(f"Found {len(customers)} customers for mass email sending")
        
        emails_sent = 0
        emails_failed = 0
        
        for customer in customers:
            try:
                customer_name = customer.get('name', 'Valued Customer')
                customer_email = customer.get('email')
                
                # Get pet name(s) for this customer - handle both data structures
                pet_names = "your pet"  # Default fallback
                
                # Check for pets array structure (new format)
                pets = customer.get('pets', [])
                if pets:
                    # Extract pet names from pets array
                    valid_pet_names = [pet.get('name', '').strip() for pet in pets if pet.get('name', '').strip()]
                    if valid_pet_names:
                        if len(valid_pet_names) == 1:
                            pet_names = valid_pet_names[0]
                        elif len(valid_pet_names) == 2:
                            pet_names = f"{valid_pet_names[0]} and {valid_pet_names[1]}"
                        else:
                            # For 3+ pets: "Buddy, Max, and Luna"
                            pet_names = ", ".join(valid_pet_names[:-1]) + f", and {valid_pet_names[-1]}"
                
                # Check for single pet_name field (current format)
                elif customer.get('pet_name', '').strip():
                    pet_names = customer.get('pet_name').strip()
                
                # Personalize the email content with customer, pet, and holiday context
                personalized_content = email_template.replace('[CUSTOMER_NAME]', customer_name)
                personalized_content = personalized_content.replace('[PET_NAME]', pet_names)
                personalized_content = personalized_content.replace('[PET_NAMES]', pet_names)
                personalized_content = personalized_content.replace('[HOLIDAY_NAME]', holiday_name)
                personalized_content = personalized_content.replace('[HOLIDAY_DATE]', holiday_date)
                
                if use_chatgpt:
                    # Apply ChatGPT formatting for mass emails too
                    try:
                        from ai_service import format_email_content
                        
                        personalized_content = await format_email_content(
                            template=personalized_content,
                            customer_name=customer_name,
                            pet_names=pet_names,
                            holiday_name=holiday_name,
                            holiday_date=holiday_date
                        )
                        
                    except Exception as e:
                        logger.error(f"ChatGPT formatting failed for customer {customer_name}: {str(e)}")
                        # Fallback to basic formatting
                        personalized_content = f"Dear {customer_name},\n\n{personalized_content}\n\nWarm regards,\nThe Veterinary Care Team"
                
                # Use the email service to send the actual email
                # The email_subject field is used for the actual email subject line
                personalized_subject = email_subject.replace('[CUSTOMER_NAME]', customer_name)
                personalized_subject = personalized_subject.replace('[PET_NAME]', pet_names)
                personalized_subject = personalized_subject.replace('[PET_NAMES]', pet_names)
                
                # Send email using the email service
                try:
                    success = await email_service.send_email(
                        to_email=customer_email,
                        subject=personalized_subject,
                        html_content=personalized_content
                    )
                    if success:
                        logger.info(f"Successfully sent email to {customer_email} for {customer_name}")
                        emails_sent += 1
                    else:
                        logger.warning(f"Failed to send email to {customer_email} for {customer_name}")
                        emails_failed += 1
                except Exception as email_error:
                    logger.error(f"Email service error for {customer_email}: {str(email_error)}")
                    emails_failed += 1
                
            except Exception as customer_error:
                logger.error(f"Failed to send email to customer {customer.get('name', 'Unknown')}: {str(customer_error)}")
                emails_failed += 1
        
        # Update post with mass email sending results
        await db.ai_posts.update_one(
            {"id": post_id},
            {
                "$set": {
                    "mass_emails_sent": emails_sent,
                    "mass_emails_failed": emails_failed,
                    "mass_email_sent_at": await business_now_async(),
                    "ready_for_mass_email": True
                }
            }
        )
        
        logger.info(f"Mass email sending completed for post {post_id}: {emails_sent} sent, {emails_failed} failed")
        
    except Exception as e:
        logger.error(f"Error in mass email sending for post {post_id}: {str(e)}")
        raise

async def send_sms_via_twilio(phone_number: str, message: str, twilio_account_sid: str = None, twilio_auth_token: str = None, twilio_phone_number: str = None):
    """Send SMS via Twilio"""
    try:
        from twilio.rest import Client
        
        # Use environment variables if not provided
        account_sid = twilio_account_sid or os.getenv('TWILIO_ACCOUNT_SID')
        auth_token = twilio_auth_token or os.getenv('TWILIO_AUTH_TOKEN')
        from_phone = twilio_phone_number or os.getenv('TWILIO_PHONE_NUMBER')
        
        if not all([account_sid, auth_token, from_phone]):
            raise Exception("Missing Twilio credentials. Please provide TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER")
        
        client = Client(account_sid, auth_token)
        
        message = client.messages.create(
            body=message,
            from_=from_phone,
            to=phone_number
        )
        
        logger.info(f"SMS sent successfully via Twilio to {phone_number}, SID: {message.sid}")
        return {"success": True, "message_sid": message.sid}
        
    except Exception as e:
        logger.error(f"Error sending SMS via Twilio to {phone_number}: {str(e)}")
        return {"success": False, "error": str(e)}

async def send_sms_via_sendgrid(phone_number: str, message: str, sendgrid_api_key: str = None):
    """Send SMS via SendGrid (which uses Twilio under the hood)"""
    try:
        # SendGrid primarily uses Twilio for SMS, so we'll use Twilio client
        # This is a placeholder - in production you might want to use SendGrid's SMS API
        return await send_sms_via_twilio(phone_number, message)
        
    except Exception as e:
        logger.error(f"Error sending SMS via SendGrid to {phone_number}: {str(e)}")
        return {"success": False, "error": str(e)}

async def send_mass_sms_from_post(post_id: str, post_data: dict):
    """Send personalized SMS to all customers using the approved SMS template"""
    try:
        logger.info(f"Starting mass SMS sending for post {post_id}")
        
        # Get SMS template from post
        sms_template = post_data.get('sms_template', post_data.get('content', ''))
        sms_provider = post_data.get('sms_provider', 'twilio')
        
        if not sms_template:
            logger.error(f"No SMS template found for post {post_id}")
            return
        
        # Get all customers from database
        customers_cursor = db.customers.find({})
        customers_list = await customers_cursor.to_list(length=None)
        
        if not customers_list:
            logger.warning("No customers found in database for mass SMS")
            return
        
        sms_sent = 0
        sms_failed = 0
        
        for customer in customers_list:
            try:
                # Skip customers without phone numbers
                phone_number = customer.get('phone', '').strip() 
                if not phone_number:
                    logger.warning(f"No phone number for customer {customer.get('name', 'Unknown')}")
                    sms_failed += 1
                    continue
                
                # Get customer data using new helper function
                customer_name = get_customer_full_name(customer)
                
                # Handle pet names (support both pets array and pet_name field)
                pets = customer.get('pets', [])
                pet_names = "your pet"  # Default fallback
                
                if pets:
                    # New pets array format
                    valid_pet_names = [pet.get('name', '').strip() for pet in pets if pet.get('name', '').strip()]
                    if valid_pet_names:
                        if len(valid_pet_names) == 1:
                            pet_names = valid_pet_names[0]
                        elif len(valid_pet_names) == 2:
                            pet_names = f"{valid_pet_names[0]} and {valid_pet_names[1]}"
                        else:
                            pet_names = ", ".join(valid_pet_names[:-1]) + f", and {valid_pet_names[-1]}"
                elif customer.get('pet_name', '').strip():
                    # Legacy pet_name field format
                    pet_names = customer.get('pet_name').strip()
                
                # Personalize SMS content
                personalized_sms = sms_template.replace('[CUSTOMER_NAME]', customer_name)
                personalized_sms = personalized_sms.replace('[PET_NAME]', pet_names)
                personalized_sms = personalized_sms.replace('[PET_NAMES]', pet_names)
                
                # Replace [LINK] placeholder with actual link
                sms_link = post_data.get('sms_link', 'https://petsandvetsanimalhospital.com')
                personalized_sms = personalized_sms.replace('[LINK]', sms_link)
                
                # Ensure SMS is within character limit
                if len(personalized_sms) > 160:
                    personalized_sms = personalized_sms[:157] + "..."
                
                # Send SMS based on provider
                if sms_provider == 'sendgrid':
                    result = await send_sms_via_sendgrid(phone_number, personalized_sms)
                else:  # Default to Twilio
                    result = await send_sms_via_twilio(phone_number, personalized_sms)
                
                if result.get('success'):
                    sms_sent += 1
                    logger.info(f"SMS sent to {customer_name} at {phone_number}")
                else:
                    sms_failed += 1
                    logger.error(f"Failed to send SMS to {customer_name} at {phone_number}: {result.get('error')}")
                
                # Add small delay to avoid rate limiting
                await asyncio.sleep(0.1)
                
            except Exception as customer_error:
                logger.error(f"Error sending SMS to customer {customer.get('name', 'Unknown')}: {str(customer_error)}")
                sms_failed += 1
                continue
        
        # Update post with mass SMS results
        await db.ai_posts.update_one(
            {"id": post_id},
            {
                "$set": {
                    "mass_sms_sent": sms_sent,
                    "mass_sms_failed": sms_failed,
                    "mass_sms_sent_at": await business_now_async(),
                    "ready_for_mass_sms": True
                }
            }
        )
        
        logger.info(f"Mass SMS sending completed for post {post_id}: {sms_sent} sent, {sms_failed} failed")
        
    except Exception as e:
        logger.error(f"Error in mass SMS sending for post {post_id}: {str(e)}")
        raise

async def generate_social_media_post_for_agent(agent_id: str, agent_data: dict):
    """Generate a social media post for an AI agent"""
    try:
        # Create initial post record
        post_id = str(uuid.uuid4())
        now = await business_now_async()
        
        # Extract platforms that are enabled
        enabled_platforms = [platform for platform, enabled in agent_data.get('social_platforms', {}).items() if enabled]
        
        if not enabled_platforms:
            logger.warning(f"No platforms enabled for agent {agent_id}")
            return
        
        # Create post record with generating status
        post_data = {
            "id": post_id,
            "agent_id": agent_id,
            "agent_name": agent_data.get('agent_name', 'AI Agent'),
            "topic": agent_data.get('custom_topic') if agent_data.get('topic') == 'Custom' else agent_data.get('topic'),
            "content": "",
            "image_url": "",
            "image_text": agent_data.get('image_text', ''),
            "hashtags": [],
            "platforms": enabled_platforms,
            "status": PostStatus.GENERATING,
            "scheduled_for": None,
            "published_at": None,
            "social_media_links": [],
            "error_message": "",
            "created_at": now,
            "updated_at": now
        }
        
        # Insert initial post record
        await db.ai_posts.insert_one(post_data)
        
        try:
            # Generate or format content based on mode
            if agent_data.get('mode') == 'write':
                # Format custom written content
                content_result = await ai_service.format_custom_content(
                    post_title=agent_data.get('post_title', ''),
                    post_content=agent_data.get('post_content', ''),
                    word_count=agent_data.get('word_count', '100'),
                    platforms=enabled_platforms,
                    use_web_research=agent_data.get('use_web_research', False),
                    image_text=agent_data.get('image_text')
                )
            else:
                # Generate content using AI service
                content_result = await ai_service.generate_social_media_content(
                    topic=agent_data.get('topic'),
                    word_count=agent_data.get('word_count', '100'),
                    platforms=enabled_platforms,
                    custom_topic=agent_data.get('custom_topic'),
                    image_text=agent_data.get('image_text'),
                    track_usage=True,
                    user_id="admin",  # TODO: Get actual user ID
                    agent_id=agent_id
                )
                
                # Log text generation cost
                if content_result.get('usage_info') and content_result.get('track_usage'):
                    usage_info = content_result['usage_info']
                    track_info = content_result['track_usage']
                    
                    cost = calculate_text_cost(
                        track_info['provider'], 
                        track_info['model'], 
                        usage_info.get('prompt_tokens', 0),
                        usage_info.get('completion_tokens', 0)
                    )
                    
                    await log_ai_usage(
                        cost_type=CostType.TEXT_GENERATION,
                        provider=track_info['provider'],
                        model=track_info['model'],
                        cost_usd=cost,
                        user_id=track_info['user_id'],
                        agent_id=track_info['agent_id'],
                        tokens_used=usage_info.get('total_tokens', 0),
                        prompt_tokens=usage_info.get('prompt_tokens', 0),
                        completion_tokens=usage_info.get('completion_tokens', 0),
                        request_details={'topic': agent_data.get('topic'), 'word_count': agent_data.get('word_count')}
                    )
            
            # Update post with generated content
            update_data = {
                "content": content_result.get('content', ''),
                "hashtags": content_result.get('hashtags', []),
                "updated_at": await business_now_async()
            }
            
            # Generate image if requested
            if agent_data.get('image_option') in ['ai_generate', 'reference']:
                try:
                    image_result = await ai_service.generate_image(
                        content=content_result.get('content', ''),
                        topic=content_result.get('topic', ''),
                        image_text=agent_data.get('image_text'),
                        size="1024x1024",
                        quality="standard",
                        track_usage=True,
                        user_id="admin",  # TODO: Get actual user ID
                        agent_id=agent_id
                    )
                    
                    if image_result and isinstance(image_result, dict):
                        image_url = image_result.get('image_url')
                        
                        # Log image generation cost
                        if image_result.get('track_usage'):
                            track_info = image_result['track_usage']
                            
                            cost = calculate_image_cost(
                                track_info['provider'],
                                track_info['model'],
                                image_result.get('size', '1024x1024'),
                                image_result.get('quality', 'standard'),
                                image_result.get('images_generated', 1)
                            )
                            
                            await log_ai_usage(
                                cost_type=CostType.IMAGE_GENERATION,
                                provider=track_info['provider'],
                                model=track_info['model'],
                                cost_usd=cost,
                                user_id=track_info['user_id'],
                                agent_id=track_info['agent_id'],
                                images_generated=image_result.get('images_generated', 1),
                                request_details={
                                    'size': image_result.get('size', '1024x1024'),
                                    'quality': image_result.get('quality', 'standard'),
                                    'topic': content_result.get('topic', '')
                                }
                            )
                    else:
                        # Handle legacy return format
                        image_url = image_result
                    if image_url:
                        update_data["image_url"] = image_url
                except Exception as img_error:
                    logger.error(f"Error generating image for post {post_id}: {str(img_error)}")
                    # Continue without image
            
            # Check if agent has auto_post enabled
            # Handle post destination and scheduling
            post_destination = agent_data.get('post_destination', 'in_review')
            
            if post_destination == 'auto_post':
                # Handle auto post - could be immediate or scheduled
                if agent_data.get('mode') == 'adhoc' and agent_data.get('post_date') and agent_data.get('post_time'):
                    # Scheduled auto post for adhoc mode
                    scheduled_datetime = await calculate_scheduled_datetime(
                        agent_data.get('post_date'), 
                        agent_data.get('post_time')
                    )
                    
                    if scheduled_datetime and scheduled_datetime > await business_now_async():
                        # Schedule for future publication
                        update_data["status"] = PostStatus.SCHEDULED
                        update_data["scheduled_for"] = scheduled_datetime
                        logger.info(f"Post {post_id} scheduled for {scheduled_datetime} (business timezone)")
                    else:
                        # Publish immediately (past time or invalid date)
                        update_data["status"] = PostStatus.PUBLISHED
                        update_data["published_at"] = await business_now_async()
                        logger.info(f"Post {post_id} published immediately (past scheduled time)")
                else:
                    # Immediate auto post (for auto mode or adhoc without date/time)
                    update_data["status"] = PostStatus.PUBLISHED
                    update_data["published_at"] = await business_now_async()
                    logger.info(f"Post {post_id} published immediately")
                # TODO: Actually publish to social media platforms
            else:
                # Respect the post_destination setting for review workflow
                if post_destination == 'in_review':
                    update_data["status"] = PostStatus.IN_REVIEW
                else:  # Default to 'ready_to_publish'
                    update_data["status"] = PostStatus.READY
            
            # Update post record
            await db.ai_posts.update_one(
                {"id": post_id},
                {"$set": update_data}
            )
            
            logger.info(f"Successfully generated post {post_id} for agent {agent_id}")
            
        except Exception as content_error:
            # Update post with error status
            await db.ai_posts.update_one(
                {"id": post_id},
                {"$set": {
                    "status": PostStatus.FAILED,
                    "error_message": str(content_error),
                    "updated_at": await business_now_async()
                }}
            )
            logger.error(f"Error generating content for post {post_id}: {str(content_error)}")
            
    except Exception as e:
        logger.error(f"Error in generate_post_for_agent: {str(e)}")

async def generate_sms_for_agent(agent_id: str, agent_data: dict):
    """Generate SMS content for an AI SMS agent"""
    try:
        # Create initial post record (using ai_posts collection like email agents)
        post_id = str(uuid.uuid4())
        now = await business_now_async()
        
        logger.info(f"Generating SMS for agent {agent_id}")
        
        # Get agent mode
        agent_mode = agent_data.get('mode', 'scheduled')
        
        # Create post record with generating status
        post_data = {
            "id": post_id,
            "agent_id": agent_id,
            "agent_name": agent_data.get('agent_name', 'SMS Agent'),
            "agent_type": "sms_agent",  # Set agent type for SMS
            "content": "",
            "sms_template": "",  # Store original template for mass sending
            "sms_provider": agent_data.get('sms_provider', 'twilio'),
            "status": "generating",
            "scheduled_for": None,
            "published_at": None,
            "error_message": "", 
            "created_at": now,
            "updated_at": now
        }
        
        # Insert initial post record
        await db.ai_posts.insert_one(post_data)
        
        try:
            # Generate SMS content based on mode
            if agent_mode == 'write':
                # Use provided SMS content
                sms_content = agent_data.get('sms_content', '')
                if not sms_content:
                    raise Exception("No SMS content provided for write mode")
                content_result = {"content": sms_content}
            elif agent_mode == 'recurring' and agent_data.get('selected_holidays'):
                # This is a scheduled (holiday-based) SMS agent - use holiday context
                selected_holidays = agent_data.get('selected_holidays', [])
                
                if not selected_holidays:
                    raise Exception("No holidays selected for scheduled SMS agent")
                
                # Get holiday information for context
                holidays_cursor = db.holidays.find({"id": {"$in": selected_holidays}})
                holidays_list = await holidays_cursor.to_list(length=None)
                
                if not holidays_list:
                    raise Exception(f"No holiday data found for selected holidays {selected_holidays}")
                
                # Find the next upcoming holiday from selected holidays
                from datetime import datetime
                today = datetime.now().date()
                
                # Parse and sort holidays by date to find the next upcoming one
                valid_holidays = []
                for holiday in holidays_list:
                    try:
                        holiday_date = datetime.strptime(holiday['date'], '%Y-%m-%d').date()
                        valid_holidays.append({
                            'holiday_data': holiday,
                            'parsed_date': holiday_date
                        })
                    except Exception as e:
                        logger.warning(f"Could not parse holiday date {holiday.get('date', 'unknown')}: {e}")
                        continue
                
                if not valid_holidays:
                    raise Exception(f"No valid holiday dates found for scheduled SMS agent")
                
                # Sort holidays by date
                valid_holidays.sort(key=lambda x: x['parsed_date'])
                
                # Find the next upcoming holiday (today or later)
                upcoming_holiday = None
                for holiday_info in valid_holidays:
                    if holiday_info['parsed_date'] >= today:
                        upcoming_holiday = holiday_info['holiday_data']
                        break
                
                # If no upcoming holiday found, use the earliest holiday (for past year wrap-around)
                if not upcoming_holiday:
                    upcoming_holiday = valid_holidays[0]['holiday_data']
                    logger.info(f"No upcoming holidays found, using earliest selected holiday: {upcoming_holiday.get('name')}")
                
                holiday_name = upcoming_holiday.get('name', 'Holiday')
                holiday_date = upcoming_holiday.get('date', '')
                
                logger.info(f"Using holiday context for SMS: {holiday_name} ({holiday_date})")
                
                # Use holiday context for SMS generation
                content_result = await ai_service.generate_sms_content(
                    topic=f"Holiday SMS for {holiday_name}",
                    custom_topic=f"Create a warm, festive SMS message for {holiday_name} on {holiday_date}. Keep it brief and include a call to action.",
                    track_usage=True,
                    user_id="admin",
                    agent_id=agent_id
                )
            else:
                # Generate SMS content using AI service for topic-based recurring SMS agents
                topic = agent_data.get('topic', 'General SMS')
                content_result = await ai_service.generate_sms_content(
                    topic=topic,
                    custom_topic=agent_data.get('custom_topic'),
                    track_usage=True,
                    user_id="admin",  # TODO: Get actual user ID
                    agent_id=agent_id
                )
                
                # Log text generation cost if available
                if content_result.get('usage_info') and content_result.get('track_usage'):
                    usage_info = content_result['usage_info']
                    track_info = content_result['track_usage']
                    
                    cost = calculate_text_cost(
                        track_info['provider'], 
                        track_info['model'], 
                        usage_info.get('prompt_tokens', 0),
                        usage_info.get('completion_tokens', 0)
                    )
                    
                    await log_ai_usage(
                        cost_type=CostType.TEXT_GENERATION,
                        provider=track_info['provider'],
                        model=track_info['model'],
                        cost_usd=cost,
                        user_id=track_info['user_id'],
                        agent_id=track_info['agent_id'],
                        tokens_used=usage_info.get('total_tokens', 0),
                        prompt_tokens=usage_info.get('prompt_tokens', 0),
                        completion_tokens=usage_info.get('completion_tokens', 0),
                        request_details={'topic': topic}
                    )
            
            # Update post with generated content
            update_data = {
                "content": content_result.get('content', ''),
                "sms_template": content_result.get('content', ''),  # Store template for mass sending
                "sms_link": agent_data.get('sms_link', 'https://petsandvetsanimalhospital.com'),  # Store link for placeholder replacement
                "status": "in_review",  # Default to review workflow like email agents
                "updated_at": await business_now_async()
            }
            
            # Handle SMS destination and scheduling (similar to email agents)
            sms_destination = agent_data.get('post_destination', 'in_review')
            
            if sms_destination == 'ready_to_publish':
                update_data["status"] = "ready_to_publish"
            # For auto_send, we would handle scheduling here, but for now default to review
            
            # Update post record
            await db.ai_posts.update_one(
                {"id": post_id},
                {"$set": update_data}
            )
            
            logger.info(f"Successfully generated SMS post {post_id} for agent {agent_id}")
            return post_id
            
        except Exception as content_error:
            # Update post with error status
            await db.ai_posts.update_one(
                {"id": post_id},
                {"$set": {
                    "status": "failed",
                    "error_message": str(content_error),
                    "updated_at": await business_now_async()
                }}
            )
            logger.error(f"Error generating SMS content for {post_id}: {str(content_error)}")
            raise content_error
            
    except Exception as e:
        logger.error(f"Error in generate_sms_for_agent: {str(e)}")
        raise

async def schedule_post_generation(agent_id: str, agent_data: dict):
    """Schedule post generation for later (placeholder for now)"""
    # For now, we'll just generate immediately
    # In production, this would use a task queue like Celery
    await generate_post_for_agent(agent_id, agent_data)

# ===============================
# AI AGENT ENDPOINTS
# ===============================

@api_router.post("/ai-agents", response_model=dict)
async def create_ai_agent(
    agent_data: AIAgentCreate,
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Create a new AI agent configuration"""
    try:
        # Validate required fields based on mode
        if agent_data.mode in [AIAgentMode.AUTO, AIAgentMode.RECURRING] and not agent_data.agent_name:
            raise HTTPException(status_code=400, detail="Agent name is required for recurring mode")
        
        if agent_data.mode == AIAgentMode.WRITE:
            # For email agents, check email_content; for SMS agents, check sms_content; for others, check post_content
            if agent_data.agent_type == AIAgentType.EMAIL_AGENT:
                if not agent_data.email_content:
                    raise HTTPException(status_code=400, detail="Email content is required for email write mode")
            elif agent_data.agent_type == AIAgentType.SMS_AGENT:
                if not agent_data.sms_content:
                    raise HTTPException(status_code=400, detail="SMS content is required for SMS write mode")
            else:
                if not agent_data.post_content:
                    raise HTTPException(status_code=400, detail="Post content is required for write mode")
            # Note: post_title is optional - AI can generate if not provided
        
        # Topic validation - only required for social media agents
        if (agent_data.mode in [AIAgentMode.ADHOC, AIAgentMode.AUTO, AIAgentMode.RECURRING] 
            and not agent_data.topic 
            and agent_data.agent_type == AIAgentType.SOCIAL_MEDIA):
            raise HTTPException(status_code=400, detail="Topic is required for social media agents")
        
        # Only validate social platforms for social media agents
        if agent_data.agent_type == AIAgentType.SOCIAL_MEDIA:
            # Ensure social platforms is set
            social_platforms = agent_data.social_platforms or {
                "facebook": False,
                "instagram": False, 
                "twitter": False,
                "whatsapp": False
            }
            
            # Check if at least one platform is selected
            if not any(social_platforms.values()):
                raise HTTPException(status_code=400, detail="At least one social media platform must be selected")
        else:
            # For non-social media agents, set empty/default social platforms
            social_platforms = {
                "facebook": False,
                "instagram": False, 
                "twitter": False,
                "whatsapp": False
            }
        
        # Timesheet agent specific validation
        if agent_data.agent_type == AIAgentType.TIME_SHEET:
            # Agent name is required for timesheet agents
            if not agent_data.agent_name:
                raise HTTPException(status_code=400, detail="Agent name is required")
            
            # Report period is required for adhoc timesheet agents
            if agent_data.mode == AIAgentMode.ADHOC and not agent_data.report_period:
                raise HTTPException(status_code=400, detail="Report period is required for adhoc timesheet agents")
            
            # Validate custom date range for timesheet agents
            if hasattr(agent_data, 'report_period') and agent_data.report_period == 'custom':
                if not agent_data.custom_start_date or not agent_data.custom_end_date:
                    raise HTTPException(status_code=400, detail="Custom start and end dates are required for custom period")
                
                # Validate that start date is before end date
                if agent_data.custom_start_date >= agent_data.custom_end_date:
                    raise HTTPException(status_code=400, detail="Start date must be before end date")
        
        # SMS agent specific validation
        if agent_data.agent_type == AIAgentType.SMS_AGENT:
            # Agent name is required for SMS agents
            if not agent_data.agent_name:
                raise HTTPException(status_code=400, detail="Agent name is required for SMS agents")
            
            # Validate SMS content length (160 character limit)
            if agent_data.mode == AIAgentMode.WRITE and agent_data.sms_content:
                if len(agent_data.sms_content) > (agent_data.sms_character_limit or 160):
                    raise HTTPException(status_code=400, detail=f"SMS content exceeds {agent_data.sms_character_limit or 160} character limit")
            
            # Validate SMS provider
            if agent_data.sms_provider and agent_data.sms_provider not in ['twilio', 'sendgrid']:
                raise HTTPException(status_code=400, detail="SMS provider must be either 'twilio' or 'sendgrid'")
        
        now = await business_now_async()
        agent_dict = agent_data.dict()
        agent_dict["social_platforms"] = social_platforms
        
        agent = AIAgent(
            id=str(uuid.uuid4()),
            **agent_dict,
            created_at=now,
            updated_at=now,
            is_active=True
        )
        
        # Insert agent into database (unified collection for all agent types)
        await db.ai_agents.insert_one(agent.dict())
        
        logger.info(f"Created AI agent: {agent.id} with mode: {agent.mode} and type: {agent.agent_type}")
        
        # Debug logging for email agents
        if agent.agent_type == AIAgentType.EMAIL_AGENT:
            logger.info(f"Email agent debug - use_chatgpt_formatting: {agent_dict.get('use_chatgpt_formatting')}")
            logger.info(f"Email agent debug - email_content_template: {agent_dict.get('email_content_template', 'NOT_FOUND')}")
        
        # Trigger post generation based on mode
        if agent.mode == AIAgentMode.ADHOC and agent.immediate:
            # Trigger immediate post generation in background
            asyncio.create_task(generate_post_for_agent(agent.id, agent.dict()))
        elif agent.mode == AIAgentMode.ADHOC and not agent.immediate:
            # Schedule post generation for later
            asyncio.create_task(schedule_post_generation(agent.id, agent.dict()))
        elif agent.mode == AIAgentMode.WRITE:
            # For write mode, always process immediately or schedule
            if agent.immediate:
                asyncio.create_task(generate_post_for_agent(agent.id, agent.dict()))
            else:
                asyncio.create_task(schedule_post_generation(agent.id, agent.dict()))
        
        return {"message": f"{agent.agent_type.title() if agent.agent_type else 'AI'} agent created successfully", "agent_id": agent.id}
        
    except Exception as e:
        logger.error(f"Error creating AI agent: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create AI agent")

@api_router.put("/ai-agents/{agent_id}", response_model=dict)
async def update_ai_agent(
    agent_id: str,
    agent_data: AIAgentCreate,
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Update an existing AI agent configuration"""
    try:
        # Validate required fields based on mode
        if agent_data.mode in [AIAgentMode.AUTO, AIAgentMode.RECURRING] and not agent_data.agent_name:
            raise HTTPException(status_code=400, detail="Agent name is required for recurring mode")
        
        if agent_data.mode == AIAgentMode.WRITE:
            # For email agents, check email_content; for SMS agents, check sms_content; for others, check post_content
            if agent_data.agent_type == AIAgentType.EMAIL_AGENT:
                if not agent_data.email_content:
                    raise HTTPException(status_code=400, detail="Email content is required for email write mode")
            elif agent_data.agent_type == AIAgentType.SMS_AGENT:
                if not agent_data.sms_content:
                    raise HTTPException(status_code=400, detail="SMS content is required for SMS write mode")
            else:
                if not agent_data.post_content:
                    raise HTTPException(status_code=400, detail="Post content is required for write mode")
            # Note: post_title is optional - AI can generate if not provided
        
        # Topic validation - only required for social media agents
        if (agent_data.mode in [AIAgentMode.ADHOC, AIAgentMode.AUTO, AIAgentMode.RECURRING] 
            and not agent_data.topic 
            and agent_data.agent_type == AIAgentType.SOCIAL_MEDIA):
            raise HTTPException(status_code=400, detail="Topic is required for social media agents")
        
        # Only validate social platforms for social media agents
        if agent_data.agent_type == AIAgentType.SOCIAL_MEDIA:
            # Ensure social platforms is set
            social_platforms = agent_data.social_platforms or {
                "facebook": False,
                "instagram": False, 
                "twitter": False,
                "whatsapp": False
            }
            
            # Check if at least one platform is selected
            if not any(social_platforms.values()):
                raise HTTPException(status_code=400, detail="At least one social media platform must be selected")
        else:
            # For non-social media agents, set empty/default social platforms
            social_platforms = {
                "facebook": False,
                "instagram": False, 
                "twitter": False,
                "whatsapp": False
            }
        
        # Timesheet agent specific validation
        if agent_data.agent_type == AIAgentType.TIME_SHEET:
            # Agent name is required for timesheet agents
            if not agent_data.agent_name:
                raise HTTPException(status_code=400, detail="Agent name is required")
            
            # Report period is required for adhoc timesheet agents
            if agent_data.mode == AIAgentMode.ADHOC and not agent_data.report_period:
                raise HTTPException(status_code=400, detail="Report period is required for adhoc timesheet agents")
            
            # Validate custom date range for timesheet agents
            if hasattr(agent_data, 'report_period') and agent_data.report_period == 'custom':
                if not agent_data.custom_start_date or not agent_data.custom_end_date:
                    raise HTTPException(status_code=400, detail="Custom start and end dates are required for custom period")
                
                # Validate that start date is before end date
                if agent_data.custom_start_date >= agent_data.custom_end_date:
                    raise HTTPException(status_code=400, detail="Start date must be before end date")
        
        # SMS agent specific validation
        if agent_data.agent_type == AIAgentType.SMS_AGENT:
            # Agent name is required for SMS agents
            if not agent_data.agent_name:
                raise HTTPException(status_code=400, detail="Agent name is required for SMS agents")
            
            # Validate SMS content length (160 character limit)
            if agent_data.mode == AIAgentMode.WRITE and agent_data.sms_content:
                if len(agent_data.sms_content) > (agent_data.sms_character_limit or 160):
                    raise HTTPException(status_code=400, detail=f"SMS content exceeds {agent_data.sms_character_limit or 160} character limit")
            
            # Validate SMS provider
            if agent_data.sms_provider and agent_data.sms_provider not in ['twilio', 'sendgrid']:
                raise HTTPException(status_code=400, detail="SMS provider must be either 'twilio' or 'sendgrid'")
        
        # Check if agent exists in the main ai_agents collection (unified architecture)
        existing_agent = await db.ai_agents.find_one({"id": agent_id})
        
        # If not found in main collection, check if it exists in the old timesheet collection and migrate it
        if not existing_agent and agent_data.agent_type == AIAgentType.TIME_SHEET:
            old_timesheet_agent = await db.timesheet_ai_agents.find_one({"id": agent_id})
            if old_timesheet_agent:
                # Migrate from old collection to main collection
                old_timesheet_agent["agent_type"] = "time_sheet"  # Ensure correct agent_type
                await db.ai_agents.insert_one(old_timesheet_agent)
                # Remove from old collection
                await db.timesheet_ai_agents.delete_one({"id": agent_id})
                existing_agent = old_timesheet_agent
        
        if not existing_agent:
            raise HTTPException(status_code=404, detail="AI agent not found")
        
        # Prepare update data
        now = datetime.utcnow()
        agent_dict = agent_data.dict()
        agent_dict["social_platforms"] = social_platforms
        agent_dict["updated_at"] = now
        
        # Update the agent in the main ai_agents collection (unified architecture)
        result = await db.ai_agents.update_one(
            {"id": agent_id},
            {"$set": agent_dict}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="AI agent not found")
        
        return {"message": "AI agent updated successfully", "agent_id": agent_id}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating AI agent: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update AI agent")

@api_router.get("/ai-agent-types", response_model=List[dict])
async def get_ai_agent_types():
    """Get available AI agent types"""
    try:
        agent_types = [
            {
                "value": AIAgentType.SOCIAL_MEDIA,
                "label": "Social Media Agent",
                "description": "Create and manage social media posts across multiple platforms"
            },
            {
                "value": AIAgentType.TIME_SHEET,
                "label": "Timesheet Agent", 
                "description": "Automated timesheet generation and reporting with AI-powered summaries"
            },
            {
                "value": AIAgentType.EMAIL_AGENT,
                "label": "Email Agent",
                "description": "Create and send automated email campaigns and newsletters"
            },
            {
                "value": AIAgentType.SMS_AGENT,
                "label": "SMS Agent",
                "description": "Send automated SMS messages and text campaigns"
            },
            {
                "value": AIAgentType.MARKETING_AGENT,
                "label": "Marketing Agent",
                "description": "Create comprehensive marketing campaigns across multiple channels"
            }
        ]
        
        return agent_types
        
    except Exception as e:
        logger.error(f"Error fetching AI agent types: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch AI agent types")

@api_router.get("/ai-agents", response_model=List[dict])
async def get_ai_agents(
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Get all AI agent configurations (unified endpoint for all agent types)"""
    try:
        # Get all agents from the unified ai_agents collection
        agents_cursor = db.ai_agents.find({})
        agents = await agents_cursor.to_list(length=None)
        
        # Also check for any remaining agents in the old timesheet collection and migrate them
        old_timesheet_cursor = db.timesheet_ai_agents.find({})
        old_timesheet_agents = await old_timesheet_cursor.to_list(length=None)
        
        if old_timesheet_agents:
            logger.info(f"Found {len(old_timesheet_agents)} agents in old timesheet collection, migrating...")
            for old_agent in old_timesheet_agents:
                # Ensure agent_type is set
                old_agent["agent_type"] = "time_sheet"
                # Check if already exists in main collection
                existing = await db.ai_agents.find_one({"id": old_agent["id"]})
                if not existing:
                    await db.ai_agents.insert_one(old_agent)
                    agents.append(old_agent)
            
            # Remove migrated agents from old collection
            await db.timesheet_ai_agents.delete_many({})
            logger.info(f"Migrated {len(old_timesheet_agents)} timesheet agents to main collection")
        
        # Convert ObjectId to string for JSON serialization
        for agent in agents:
            agent['_id'] = str(agent['_id'])
        
        return agents
        
    except Exception as e:
        logger.error(f"Error fetching AI agents: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch AI agents")

@api_router.delete("/ai-agents/{agent_id}")
async def delete_ai_agent(
    agent_id: str,
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Delete an AI agent"""
    try:
        result = await db.ai_agents.delete_one({"id": agent_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="AI agent not found")
        
        return {"message": "AI agent deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting AI agent: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete AI agent")

@api_router.post("/ai-agents/{agent_id}/toggle")
async def toggle_ai_agent_status(
    agent_id: str,
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Toggle AI agent active/inactive status"""
    try:
        # First get the current agent to check its status - check both collections
        agent = await db.ai_agents.find_one({"id": agent_id})
        collection_name = "ai_agents"
        
        # If not found in ai_agents, check timesheet_ai_agents collection
        if not agent:
            agent = await db.timesheet_ai_agents.find_one({"id": agent_id})
            if agent:
                collection_name = "timesheet_ai_agents"
        
        if not agent:
            raise HTTPException(status_code=404, detail="AI agent not found")
        
        # Toggle the is_active status
        new_status = not agent.get("is_active", True)
        
        # Update in the correct collection
        if collection_name == "timesheet_ai_agents":
            result = await db.timesheet_ai_agents.update_one(
                {"id": agent_id},
                {"$set": {"is_active": new_status, "updated_at": await business_now_async()}}
            )
        else:
            result = await db.ai_agents.update_one(
                {"id": agent_id},
                {"$set": {"is_active": new_status, "updated_at": await business_now_async()}}
            )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="AI agent not found")
        
        status_text = "activated" if new_status else "paused"
        return {
            "message": f"AI agent {status_text} successfully",
            "is_active": new_status
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error toggling AI agent: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to toggle AI agent")

@api_router.post("/ai-agents/{agent_id}/run")
async def run_agent(
    agent_id: str,
    request_body: dict = Body(default={}),
    current_user: dict = Depends(get_current_user)
):
    """Run any AI agent immediately and generate content - unified endpoint for all agent types"""
    try:
        logger.info(f"Running agent {agent_id} with request_body: {request_body}")
        
        # Get the agent
        agent = await db.ai_agents.find_one({"id": agent_id})
        if not agent:
            raise HTTPException(status_code=404, detail="AI agent not found")
        
        # Check if agent is active
        if not agent.get("is_active", False):
            raise HTTPException(status_code=400, detail="Agent is not active")
        
        # Update last manual run timestamp
        await db.ai_agents.update_one(
            {"id": agent_id},
            {"$set": {"last_manual_run": await business_now_async()}}  # Use business timezone
        )
        
        # If custom period is provided for timesheet agents, add it to agent data
        if request_body and request_body.get("custom_period") and agent.get("agent_type") == "time_sheet":
            custom_period = request_body["custom_period"]
            agent["custom_start_date"] = custom_period.get("start_date")
            agent["custom_end_date"] = custom_period.get("end_date")
            logger.info(f"✅ RECEIVED CUSTOM PERIOD: start={custom_period.get('start_date')}, end={custom_period.get('end_date')}")
        else:
            logger.info(f"❌ NO CUSTOM PERIOD: request_body={request_body}, agent_type={agent.get('agent_type')}")
        
        # Generate content using the existing generate_post_for_agent function
        # This function already handles all agent modes (recurring, adhoc, write)
        generation_result = await generate_post_for_agent(agent_id, agent)
        
        # Prepare response with generation result
        response = {
            "message": "Agent executed successfully",
            "agent_id": agent_id,
            "agent_name": agent.get("agent_name", agent.get("name", "AI Agent")),
            "mode": agent.get("mode", "recurring")
        }
        
        # Include post_id if generation was successful
        if generation_result and isinstance(generation_result, dict):
            if "post_id" in generation_result:
                response["post_id"] = generation_result["post_id"]
            if "status" in generation_result:
                response["status"] = generation_result["status"]
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error running agent {agent_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to run agent: {str(e)}")

@api_router.post("/ai-agents/{agent_id}/run-write-post")
async def run_write_post_agent(
    agent_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Run a Write Your Post agent immediately and generate content"""
    try:
        # Get the agent
        agent = await db.ai_agents.find_one({"id": agent_id})
        if not agent:
            raise HTTPException(status_code=404, detail="AI agent not found")
        
        # Verify it's a write your post agent
        if agent.get("mode") != "write":
            raise HTTPException(status_code=400, detail="This endpoint is only for Write Your Post agents")
        
        # Generate the post using the existing post generation logic
        post_id = str(uuid.uuid4())
        
        # Prepare agent data for post generation
        agent_data = {
            "id": agent_id,
            "mode": "write",
            "agent_name": agent.get("agent_name", agent.get("name", "Write Your Post Agent")),
            "post_title": agent.get("post_title", ""),
            "post_content": agent.get("post_content", ""),
            "word_count": agent.get("word_count", "100"),
            "image_option": agent.get("image_option", "ai_generate"),
            "image_text": agent.get("image_text", ""),
            "social_platforms": agent.get("social_platforms", {}),
            "post_destination": agent.get("post_destination", "in_review"),
            "post_date": agent.get("post_date"),
            "post_time": agent.get("post_time"),
            "use_web_research": agent.get("use_web_research", False),
            "agent_type": agent.get("agent_type", "social_media")
        }
        
        # Create initial post record
        now = await business_now_async()
        initial_post = {
            "id": post_id,
            "agent_id": agent_id,
            "agent_name": agent_data["agent_name"],
            "topic": agent_data["post_title"],
            "content": "Generating content...",
            "status": PostStatus.GENERATING,
            "platforms": [k for k, v in agent_data["social_platforms"].items() if v],
            "agent_type": agent_data["agent_type"],
            "created_at": now,
            "updated_at": now,
            "workflow_origin": "write_post_run"
        }
        
        await db.ai_posts.insert_one(initial_post)
        
        # Generate content using AI service
        try:
            from ai_service import generate_content_for_write_post
            
            # Generate content
            content_result = await generate_content_for_write_post(
                title=agent_data["post_title"],
                existing_content=agent_data["post_content"],
                word_count=agent_data["word_count"],
                use_web_research=agent_data.get("use_web_research", False)
            )
            
            # Generate image if needed
            image_url = None
            if agent_data["image_option"] == "ai_generate" and agent_data["image_text"]:
                from ai_service import ai_service
                image_url = await ai_service.generate_image(
                    content=content_result["content"],
                    topic=agent_data["post_title"],
                    image_text=agent_data["image_text"]
                )
            
            # Update post with generated content
            update_data = {
                "content": content_result["content"],
                "updated_at": now
            }
            
            if image_url:
                update_data["image_url"] = image_url
            
            # Handle post destination and scheduling
            post_destination = agent_data.get("post_destination", "in_review")
            
            if post_destination == "auto_post":
                # Handle auto post - could be immediate or scheduled
                if agent_data.get("post_date") and agent_data.get("post_time"):
                    # Scheduled auto post
                    scheduled_datetime = await calculate_scheduled_datetime(
                        agent_data.get("post_date"), 
                        agent_data.get("post_time")
                    )
                    
                    if scheduled_datetime and scheduled_datetime > await business_now_async():
                        # Schedule for future publication
                        update_data["status"] = PostStatus.SCHEDULED
                        update_data["scheduled_for"] = scheduled_datetime
                        logger.info(f"Post {post_id} scheduled for {scheduled_datetime} (business timezone)")
                    else:
                        # Publish immediately (past time or invalid date)
                        update_data["status"] = PostStatus.PUBLISHED
                        update_data["published_at"] = await business_now_async()
                        logger.info(f"Post {post_id} published immediately")
                else:
                    # Immediate auto post
                    update_data["status"] = PostStatus.PUBLISHED
                    update_data["published_at"] = await business_now_async()
                    logger.info(f"Post {post_id} published immediately")
            else:
                # Respect the post_destination setting for review workflow
                if post_destination == "in_review":
                    update_data["status"] = PostStatus.IN_REVIEW
                else:  # ready_to_publish
                    update_data["status"] = PostStatus.READY
            
            # Update the post with final data
            await db.ai_posts.update_one(
                {"id": post_id},
                {"$set": update_data}
            )
            
            return {
                "message": "Content generated successfully",
                "post_id": post_id,
                "status": update_data["status"],
                "destination": post_destination,
                "scheduled_for": update_data.get("scheduled_for")
            }
            
        except Exception as generation_error:
            logger.error(f"Error generating content for post {post_id}: {generation_error}")
            
            # Update post with error status
            await db.ai_posts.update_one(
                {"id": post_id},
                {
                    "$set": {
                        "status": PostStatus.FAILED,
                        "error_message": str(generation_error),
                        "updated_at": await business_now_async()
                    }
                }
            )
            
            raise HTTPException(status_code=500, detail=f"Failed to generate content: {str(generation_error)}")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error running Write Your Post agent: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to run agent")

async def stop_agent_by_id(agent_id: str):
    """Stop a specific agent"""
    # Check both collections for the agent
    agent = await db.ai_agents.find_one({"id": agent_id})
    collection_name = "ai_agents"
    
    if not agent:
        agent = await db.timesheet_ai_agents.find_one({"id": agent_id})
        if agent:
            collection_name = "timesheet_ai_agents"
    
    if agent:
        # Update in the correct collection
        if collection_name == "timesheet_ai_agents":
            await db.timesheet_ai_agents.update_one(
                {"id": agent_id},
                {"$set": {"is_active": False, "updated_at": await business_now_async()}}
            )
        else:
            await db.ai_agents.update_one(
                {"id": agent_id},
                {"$set": {"is_active": False, "updated_at": await business_now_async()}}
            )

async def calculate_scheduled_datetime(post_date: str, post_time: str) -> Optional[datetime]:
    """
    Calculate the scheduled datetime in business timezone (naive datetime)
    
    Args:
        post_date: Date string in YYYY-MM-DD format
        post_time: Time string in HH:MM format
        
    Returns:
        datetime object in business timezone (naive) or None if invalid
    """
    try:
        # Parse date and time directly in business timezone
        scheduled_date = datetime.strptime(post_date, '%Y-%m-%d').date()
        scheduled_time = datetime.strptime(post_time, '%H:%M').time()
        
        # Combine date and time as naive datetime (already in business timezone)
        scheduled_datetime = datetime.combine(scheduled_date, scheduled_time)
        
        logger.info(f"Scheduled time: {post_date} {post_time} (business timezone) -> {scheduled_datetime}")
        
        return scheduled_datetime
        
    except Exception as e:
        logger.error(f"Error calculating scheduled datetime: {e}")
        return None

async def process_scheduled_sms_post(post: dict, current_time: datetime):
    """Process a scheduled SMS post by generating content and sending it"""
    try:
        # Generate SMS content using holiday-specific context
        agent_id = post.get("agent_id")
        holiday_name = post.get("holiday_name", "")
        holiday_date = post.get("holiday_date", "")
        sms_link = post.get("sms_link", "https://petsandvetsanimalhospital.com")
        
        # Get the agent details
        agent = await db.ai_agents.find_one({"id": agent_id})
        if not agent:
            raise Exception(f"SMS agent {agent_id} not found")
        
        # Generate SMS content using the existing SMS generation service
        topic = f"Holiday SMS for {holiday_name}"
        custom_topic = f"Create a warm, festive SMS message for {holiday_name} on {holiday_date}. Keep it brief, include placeholders [CUSTOMER_NAME] and [PET_NAME], and add [LINK] for the website link."
        
        content_result = await ai_service.generate_sms_content(
            topic=topic,
            custom_topic=custom_topic,
            track_usage=True,
            user_id="scheduler",
            agent_id=agent_id
        )
        
        if not content_result or not content_result.get("content"):
            raise Exception("Failed to generate SMS content")
        
        sms_content = content_result.get("content", "")
        
        # Update the post with generated content and mark as published
        await db.ai_posts.update_one(
            {"id": post["id"]},
            {
                "$set": {
                    "content": sms_content,
                    "sms_template": sms_content,  # Store template for mass sending
                    "sms_link": sms_link,  # Store link for placeholder replacement
                    "status": PostStatus.PUBLISHED,
                    "published_at": current_time,
                    "updated_at": current_time
                }
            }
        )
        
        logger.info(f"📱 Generated and published SMS post {post['id']} for {holiday_name}: {sms_content[:50]}...")
        
        # Trigger mass SMS sending
        try:
            await send_mass_sms_from_post(post["id"], {
                **post,
                "content": sms_content,
                "sms_template": sms_content,
                "sms_link": sms_link
            })
            logger.info(f"📱 Sent mass SMS for scheduled post {post['id']}")
        except Exception as sms_error:
            logger.error(f"Error sending mass SMS for post {post['id']}: {sms_error}")
            # Don't fail the whole process if SMS sending fails
        
    except Exception as e:
        logger.error(f"Error processing scheduled SMS post {post.get('id', 'unknown')}: {e}")
        
        # Mark post as failed
        await db.ai_posts.update_one(
            {"id": post["id"]},
            {
                "$set": {
                    "status": PostStatus.FAILED,
                    "error_message": str(e),
                    "updated_at": current_time
                }
            }
        )

async def process_scheduled_posts():
    """
    Process scheduled posts that are ready to be published
    This function should be called periodically (e.g., every minute)
    """
    try:
        current_time = await business_now_async()
        
        # Find posts that are scheduled and ready to publish
        scheduled_posts = await db.ai_posts.find({
            "status": PostStatus.SCHEDULED,
            "scheduled_for": {"$lte": current_time}
        }).to_list(length=None)
        
        logger.info(f"Found {len(scheduled_posts)} scheduled posts ready for publication")
        
        for post in scheduled_posts:
            try:
                # Special handling for scheduled SMS posts - generate content and send
                if post.get("agent_type") == "sms_agent" and not post.get("content"):
                    await process_scheduled_sms_post(post, current_time)
                else:
                    # Regular scheduled post - just update status to published
                    await db.ai_posts.update_one(
                        {"id": post["id"]},
                        {
                            "$set": {
                                "status": PostStatus.PUBLISHED,
                                "published_at": current_time,
                                "updated_at": current_time
                            }
                        }
                    )
                
                logger.info(f"Published scheduled post {post['id']} at {current_time}")
                
                # Clear schedule fields for adhoc and write your post agents (make them ready for next post)
                if post.get("agent_id"):
                    # Check both collections for the agent
                    agent = await db.ai_agents.find_one({"id": post["agent_id"]})
                    collection_name = "ai_agents"
                    
                    if not agent:
                        agent = await db.timesheet_ai_agents.find_one({"id": post["agent_id"]})
                        if agent:
                            collection_name = "timesheet_ai_agents"
                    
                    if agent and agent.get("mode") in ["adhoc", "write"]:
                        # Update in the correct collection
                        if collection_name == "timesheet_ai_agents":
                            await db.timesheet_ai_agents.update_one(
                                {"id": post["agent_id"]},
                                {
                                    "$unset": {
                                        "post_date": "",
                                        "post_time": ""
                                    },
                                    "$set": {
                                        "updated_at": current_time,
                                        "last_post_published": current_time
                                    }
                                }
                            )
                        else:
                            await db.ai_agents.update_one(
                                {"id": post["agent_id"]},
                                {
                                    "$unset": {
                                        "post_date": "",
                                        "post_time": ""
                                    },
                                    "$set": {
                                        "updated_at": current_time,
                                        "last_post_published": current_time
                                    }
                                }
                            )
                        logger.info(f"Cleared schedule fields for {agent.get('mode')} agent {post['agent_id']} - ready for next post")
                
                # TODO: Actually publish to social media platforms
                # This is where you would integrate with social media APIs
                
            except Exception as post_error:
                logger.error(f"Error publishing scheduled post {post['id']}: {post_error}")
                
                # Mark post as failed
                await db.ai_posts.update_one(
                    {"id": post["id"]},
                    {
                        "$set": {
                            "status": PostStatus.FAILED,
                            "error_message": str(post_error),
                            "updated_at": current_time
                        }
                    }
                )
                
    except Exception as e:
        logger.error(f"Error processing scheduled posts: {e}")

# ===============================
# AI POSTS ENDPOINTS
# ===============================

@api_router.get("/ai-posts/ready-to-publish", response_model=dict)
async def get_posts_ready_to_publish(
    page: int = 1,
    limit: int = 10,
    agent_type: Optional[str] = None,
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Get posts ready for review and publishing with pagination"""
    try:
        query = {"status": {"$in": [PostStatus.READY, PostStatus.SCHEDULED]}}
        if agent_type and agent_type != "all":
            query["agent_type"] = agent_type
        
        # Get total count
        total_count = await db.ai_posts.count_documents(query)
        
        # Calculate pagination
        skip = (page - 1) * limit
        total_pages = (total_count + limit - 1) // limit
        
        # Get paginated posts, sorted by created_at descending (latest first)
        posts_cursor = db.ai_posts.find(query).sort("created_at", -1).skip(skip).limit(limit)
        posts = await posts_cursor.to_list(length=limit)
        
        for post in posts:
            post['_id'] = str(post['_id'])
            # Ensure published_at is properly formatted for frontend
            if post.get('published_at'):
                post['published_at'] = post['published_at'].isoformat() if hasattr(post['published_at'], 'isoformat') else str(post['published_at'])
            # Also ensure created_at and updated_at are properly formatted
            if post.get('created_at'):
                post['created_at'] = post['created_at'].isoformat() if hasattr(post['created_at'], 'isoformat') else str(post['created_at'])
            if post.get('updated_at'):
                post['updated_at'] = post['updated_at'].isoformat() if hasattr(post['updated_at'], 'isoformat') else str(post['updated_at'])
        
        return {
            "posts": posts,
            "pagination": {
                "current_page": page,
                "total_pages": total_pages,
                "total_count": total_count,
                "limit": limit,
                "has_next": page < total_pages,
                "has_prev": page > 1
            }
        }
        
    except Exception as e:
        logger.error(f"Error fetching ready posts: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch posts")

@api_router.get("/ai-posts/published", response_model=dict)
async def get_published_posts(
    page: int = 1,
    limit: int = 10,
    agent_type: Optional[str] = None,
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Get published posts with pagination"""
    try:
        query = {"status": PostStatus.PUBLISHED}
        if agent_type and agent_type != "all":
            query["agent_type"] = agent_type
        
        # Get total count
        total_count = await db.ai_posts.count_documents(query)
        
        # Calculate pagination
        skip = (page - 1) * limit
        total_pages = (total_count + limit - 1) // limit
        
        # Get paginated posts, sorted by published_at descending (latest first)
        posts_cursor = db.ai_posts.find(query).sort("published_at", -1).skip(skip).limit(limit)
        posts = await posts_cursor.to_list(length=limit)
        
        for post in posts:
            post['_id'] = str(post['_id'])
            # Ensure published_at is properly formatted for frontend
            if post.get('published_at'):
                post['published_at'] = post['published_at'].isoformat() if hasattr(post['published_at'], 'isoformat') else str(post['published_at'])
            # Also ensure created_at and updated_at are properly formatted
            if post.get('created_at'):
                post['created_at'] = post['created_at'].isoformat() if hasattr(post['created_at'], 'isoformat') else str(post['created_at'])
            if post.get('updated_at'):
                post['updated_at'] = post['updated_at'].isoformat() if hasattr(post['updated_at'], 'isoformat') else str(post['updated_at'])
        
        return {
            "posts": posts,
            "pagination": {
                "current_page": page,
                "total_pages": total_pages,
                "total_count": total_count,
                "limit": limit,
                "has_next": page < total_pages,
                "has_prev": page > 1
            }
        }
        
    except Exception as e:
        logger.error(f"Error fetching published posts: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch published posts")

@api_router.get("/ai-posts/in-review", response_model=dict)
async def get_posts_in_review(
    page: int = 1,
    limit: int = 10,
    agent_type: Optional[str] = None,
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Get posts currently in review or processing with pagination"""
    try:
        query = {
            "status": {"$in": [PostStatus.GENERATING, PostStatus.IN_REVIEW, PostStatus.FAILED]}
        }
        if agent_type and agent_type != "all":
            query["agent_type"] = agent_type
        
        # Get total count
        total_count = await db.ai_posts.count_documents(query)
        
        # Calculate pagination
        skip = (page - 1) * limit
        total_pages = (total_count + limit - 1) // limit
        
        # Get paginated posts, sorted by created_at descending (latest first)
        posts_cursor = db.ai_posts.find(query).sort("created_at", -1).skip(skip).limit(limit)
        posts = await posts_cursor.to_list(length=limit)
        
        for post in posts:
            post['_id'] = str(post['_id'])
            # Ensure published_at is properly formatted for frontend
            if post.get('published_at'):
                post['published_at'] = post['published_at'].isoformat() if hasattr(post['published_at'], 'isoformat') else str(post['published_at'])
            # Also ensure created_at and updated_at are properly formatted
            if post.get('created_at'):
                post['created_at'] = post['created_at'].isoformat() if hasattr(post['created_at'], 'isoformat') else str(post['created_at'])
            if post.get('updated_at'):
                post['updated_at'] = post['updated_at'].isoformat() if hasattr(post['updated_at'], 'isoformat') else str(post['updated_at'])
        
        return {
            "posts": posts,
            "pagination": {
                "current_page": page,
                "total_pages": total_pages,
                "total_count": total_count,
                "limit": limit,
                "has_next": page < total_pages,
                "has_prev": page > 1
            }
        }
        
    except Exception as e:
        logger.error(f"Error fetching in-review posts: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch in-review posts")

@api_router.get("/ai-posts/{post_id}")
async def get_ai_post(
    post_id: str,
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Get individual AI post by ID"""
    try:
        post = await db.ai_posts.find_one({"id": post_id})
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        
        # Convert ObjectId to string if present
        if "_id" in post:
            del post["_id"]
        
        return post
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching AI post: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch post")

@api_router.post("/ai-posts/{post_id}/approve")
async def approve_post(
    post_id: str,
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Approve and publish a post"""
    try:
        # Update post status to approved and set published_at
        result = await db.ai_posts.update_one(
            {"id": post_id, "status": PostStatus.READY},
            {
                "$set": {
                    "status": PostStatus.PUBLISHED,
                    "published_at": await business_now_async(),
                    "updated_at": await business_now_async()
                }
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Post not found or not ready for approval")
        
        # Get the published post to check if it's an email or SMS
        published_post = await db.ai_posts.find_one({"id": post_id})
        
        if published_post and published_post.get("agent_type") == "email":
            # This is an email post - trigger mass email sending
            await send_mass_emails_from_post(post_id, published_post)
            return {"message": "Email post approved and mass emails are being sent to customers"}
        elif published_post and published_post.get("agent_type") == "sms_agent":
            # This is an SMS post - trigger mass SMS sending
            await send_mass_sms_from_post(post_id, published_post)
            return {"message": "SMS post approved and mass SMS messages are being sent to customers"}
        else:
            # TODO: Actually publish to social media platforms here
            return {"message": "Post approved and published successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error approving post: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to approve post")

@api_router.post("/ai-posts/{post_id}/reject")
async def reject_post(
    post_id: str,
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Reject a post"""
    try:
        result = await db.ai_posts.update_one(
            {"id": post_id},
            {
                "$set": {
                    "status": PostStatus.REJECTED,
                    "updated_at": await business_now_async()
                }
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Post not found")
        
        return {"message": "Post rejected successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error rejecting post: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to reject post")

@api_router.delete("/ai-posts/{post_id}")
async def delete_post(
    post_id: str,
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Delete a post"""
    try:
        result = await db.ai_posts.delete_one({"id": post_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Post not found")
        
        return {"message": "Post deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting post: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete post")

@api_router.put("/ai-posts/{post_id}/edit")
async def edit_post(
    post_id: str,
    post_update: PostUpdate,
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Edit a post (content, image_text, and topic)"""
    try:
        # Build update data with only non-None fields
        update_data = {"updated_at": await business_now_async()}
        
        # Clear reviewed_at when content is updated so it shows "Updated" instead of "Reviewed"
        content_changed = False
        if post_update.content is not None:
            update_data["content"] = post_update.content
            content_changed = True
        if post_update.image_text is not None:
            update_data["image_text"] = post_update.image_text
            content_changed = True
        if post_update.topic is not None:
            update_data["topic"] = post_update.topic
            content_changed = True
            
        # If content was changed, clear reviewed_at
        if content_changed:
            update_data["reviewed_at"] = None
        
        # Update the post
        result = await db.ai_posts.update_one(
            {"id": post_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Post not found")
        
        # Return success message with the updated fields
        updated_fields = [k for k in update_data.keys() if k != "updated_at"]
        return {
            "message": "Post updated successfully",
            "updated_fields": updated_fields,
            "updated_at": update_data["updated_at"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error editing post: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to edit post")

@api_router.put("/ai-posts/{post_id}/adjust-hours")
async def adjust_timesheet_hours(
    post_id: str,
    timesheet_data: dict,
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Adjust hours for a timesheet post"""
    try:
        # Get the existing post to verify it's a timesheet post
        post = await db.ai_posts.find_one({"id": post_id})
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        
        if post.get("agent_type") != "time_sheet":
            raise HTTPException(status_code=400, detail="Post is not a timesheet post")
        
        # Update the post with new timesheet data
        update_data = {
            "timesheet_data": timesheet_data.get("timesheet_data"),
            "updated_at": await business_now_async()
        }
        
        result = await db.ai_posts.update_one(
            {"id": post_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Post not found")
        
        return {
            "message": "Hours adjusted successfully",
            "updated_at": update_data["updated_at"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adjusting timesheet hours: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to adjust hours")

@api_router.post("/ai-posts/{post_id}/regenerate-image")
async def regenerate_image(
    post_id: str,
    image_data: dict,
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Regenerate image for a post"""
    try:
        # Get the existing post
        post = await db.ai_posts.find_one({"id": post_id})
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        
        # Extract content and image_text from request
        content = image_data.get("content", post.get("content", ""))
        image_text = image_data.get("image_text", post.get("image_text", ""))
        
        # Generate new image using AI service
        image_url = await ai_service.generate_image(content, image_text)
        
        if image_url:
            # Update the post with new image
            result = await db.ai_posts.update_one(
                {"id": post_id},
                {
                    "$set": {
                        "image_url": image_url,
                        "image_text": image_text,
                        "updated_at": await business_now_async(),
                        "reviewed_at": None
                    }
                }
            )
            
            if result.matched_count == 0:
                raise HTTPException(status_code=404, detail="Post not found during update")
            
            return {
                "message": "Image regenerated successfully",
                "image_url": image_url,
                "image_text": image_text
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to generate image")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error regenerating image: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to regenerate image")

@api_router.post("/ai-posts/{post_id}/regenerate-content")
async def regenerate_content(
    post_id: str,
    content_data: dict,
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Regenerate content for a post using LLM"""
    try:
        # Get the existing post
        post = await db.ai_posts.find_one({"id": post_id})
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        
        # Extract current content and topic from request
        current_content = content_data.get("current_content", post.get("content", ""))
        topic = content_data.get("topic", post.get("topic", "social media post"))
        
        # Generate new content using AI service
        new_content = await ai_service.regenerate_content(current_content, topic)
        
        if new_content:
            return {
                "message": "Content regenerated successfully",
                "new_content": new_content,
                "original_content": current_content
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to generate new content")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error regenerating content: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to regenerate content")

@api_router.post("/ai-posts/{post_id}/review-complete")
async def review_complete(
    post_id: str,
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Move post from in_review to ready_to_publish"""
    try:
        result = await db.ai_posts.update_one(
            {"id": post_id, "status": PostStatus.IN_REVIEW},
            {
                "$set": {
                    "status": PostStatus.READY,
                    "workflow_origin": "in_review",
                    "reviewed_at": await business_now_async(),
                    "updated_at": await business_now_async()
                }
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Post not found or not in review status")
        
        return {"message": "Post moved to ready to publish successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error completing review: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to complete review")

@api_router.post("/ai-posts/{post_id}/back-to-review")
async def back_to_review(
    post_id: str,
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Move post from ready_to_publish back to in_review"""
    try:
        result = await db.ai_posts.update_one(
            {"id": post_id, "status": PostStatus.READY},
            {
                "$set": {
                    "status": PostStatus.IN_REVIEW,
                    "updated_at": await business_now_async()
                }
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Post not found or not ready to publish")
        
        return {"message": "Post moved back to review successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error moving post back to review: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to move post back to review")

@api_router.post("/ai-posts/{post_id}/move-to-ready")
async def move_post_to_ready(
    post_id: str,
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Move a post from in-review to ready-to-publish"""
    try:
        result = await db.ai_posts.update_one(
            {"id": post_id, "status": {"$in": [PostStatus.IN_REVIEW, PostStatus.FAILED]}},
            {
                "$set": {
                    "status": PostStatus.READY,
                    "updated_at": await business_now_async()
                }
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Post not found or not in review")
        
        return {"message": "Post moved to ready for review"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error moving post: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to move post")

# ===============================
# PAY PERIOD SETTINGS ENDPOINTS
# ===============================

@api_router.post("/pay-period-settings", response_model=dict)
async def create_pay_period_setting(
    setting_data: PayPeriodSettingCreate,
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Create a new pay period setting"""
    try:
        # Validate configuration based on period type
        if setting_data.period_type == PayPeriodType.WEEKLY and not setting_data.weekly_config:
            raise HTTPException(status_code=400, detail="Weekly configuration is required for weekly period type")
        elif setting_data.period_type == PayPeriodType.BI_WEEKLY and not setting_data.bi_weekly_config:
            raise HTTPException(status_code=400, detail="Bi-weekly configuration is required for bi-weekly period type")
        elif setting_data.period_type == PayPeriodType.MONTHLY and not setting_data.monthly_config:
            raise HTTPException(status_code=400, detail="Monthly configuration is required for monthly period type")
        
        # If this is set as default, unset other defaults of the same type
        if setting_data.is_default:
            await db.pay_period_settings.update_many(
                {"period_type": setting_data.period_type, "is_default": True},
                {"$set": {"is_default": False, "updated_at": await business_now_async()}}
            )
        
        # Create the setting
        setting = PayPeriodSetting(
            id=str(uuid.uuid4()),
            **setting_data.dict(),
            created_by=current_user.id
        )
        
        await db.pay_period_settings.insert_one(setting.dict())
        
        return {"message": "Pay period setting created successfully", "setting_id": setting.id}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating pay period setting: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create pay period setting")

@api_router.get("/pay-period-settings", response_model=List[dict])
async def get_pay_period_settings(
    period_type: Optional[str] = None,
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Get all pay period settings, optionally filtered by type"""
    try:
        # Build query
        query = {}
        if period_type and period_type in ["weekly", "bi_weekly", "monthly"]:
            query["period_type"] = period_type
        
        # Get settings
        settings_cursor = db.pay_period_settings.find(query).sort("created_at", -1)
        settings = await settings_cursor.to_list(length=None)
        
        # Convert ObjectId to string for JSON serialization
        for setting in settings:
            setting['_id'] = str(setting['_id'])
        
        return settings
        
    except Exception as e:
        logger.error(f"Error fetching pay period settings: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch pay period settings")

@api_router.get("/pay-period-settings/{setting_id}", response_model=dict)
async def get_pay_period_setting(
    setting_id: str,
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Get a specific pay period setting"""
    try:
        setting = await db.pay_period_settings.find_one({"id": setting_id})
        if not setting:
            raise HTTPException(status_code=404, detail="Pay period setting not found")
        
        # Convert ObjectId to string for JSON serialization
        setting['_id'] = str(setting['_id'])
        
        return setting
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching pay period setting: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch pay period setting")

@api_router.put("/pay-period-settings/{setting_id}", response_model=dict)
async def update_pay_period_setting(
    setting_id: str,
    setting_data: PayPeriodSettingUpdate,
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Update a pay period setting"""
    try:
        # Check if setting exists
        existing_setting = await db.pay_period_settings.find_one({"id": setting_id})
        if not existing_setting:
            raise HTTPException(status_code=404, detail="Pay period setting not found")
        
        # If this is being set as default, unset other defaults of the same type
        if setting_data.is_default:
            await db.pay_period_settings.update_many(
                {"period_type": existing_setting["period_type"], "is_default": True, "id": {"$ne": setting_id}},
                {"$set": {"is_default": False, "updated_at": await business_now_async()}}
            )
        
        # Prepare update data
        update_data = {k: v for k, v in setting_data.dict().items() if v is not None}
        update_data["updated_at"] = await business_now_async()
        
        # Update the setting
        result = await db.pay_period_settings.update_one(
            {"id": setting_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Pay period setting not found")
        
        return {"message": "Pay period setting updated successfully", "setting_id": setting_id}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating pay period setting: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update pay period setting")

@api_router.delete("/pay-period-settings/{setting_id}")
async def delete_pay_period_setting(
    setting_id: str,
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Delete a pay period setting"""
    try:
        result = await db.pay_period_settings.delete_one({"id": setting_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Pay period setting not found")
        
        return {"message": "Pay period setting deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting pay period setting: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete pay period setting")

@api_router.get("/pay-period-settings/default/{period_type}", response_model=dict)
async def get_default_pay_period_setting(
    period_type: str,
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Get the default pay period setting for a specific type"""
    try:
        if period_type not in ["weekly", "bi_weekly", "monthly"]:
            raise HTTPException(status_code=400, detail="Invalid period type")
        
        setting = await db.pay_period_settings.find_one({"period_type": period_type, "is_default": True})
        if not setting:
            raise HTTPException(status_code=404, detail=f"No default {period_type} pay period setting found")
        
        # Convert ObjectId to string for JSON serialization
        setting['_id'] = str(setting['_id'])
        
        return setting
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching default pay period setting: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch default pay period setting")

# ===============================
# AI SETTINGS ENDPOINTS
# ===============================

@api_router.get("/ai-settings", response_model=dict)
async def get_ai_settings(
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Get AI settings"""
    try:
        settings = await db.ai_settings.find_one()
        
        if not settings:
            # Return default settings
            return {
                "llm_settings": {
                    "provider": "emergent",
                    "model": "auto",
                    "temperature": 0.7,
                    "max_tokens": 1000
                },
                "image_settings": {
                    "provider": "openai",
                    "model": "dall-e-3",
                    "quality": "standard",
                    "size": "1024x1024"
                },
                "social_settings": {
                    "facebook": {"app_id": "", "app_secret": "", "access_token": "", "page_id": ""},
                    "instagram": {"access_token": "", "user_id": ""},
                    "twitter": {"api_key": "", "api_secret": "", "access_token": "", "access_token_secret": ""},
                    "whatsapp": {"business_account_id": "", "access_token": "", "phone_number_id": ""}
                },
                "news_settings": {
                    "sources": {
                        "veterinary_news": True,
                        "pet_health_articles": True,
                        "animal_welfare_updates": True,
                        "veterinary_journals": True
                    },
                    "keywords": ["veterinary", "pet health", "animal care", "pet nutrition", "veterinary medicine"],
                    "update_frequency": "1"
                }
            }
        
        # Convert ObjectId to string
        settings['_id'] = str(settings['_id'])
        return settings
        
    except Exception as e:
        logger.error(f"Error fetching AI settings: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch AI settings")

@api_router.put("/ai-settings", response_model=dict)
async def update_ai_settings(
    settings_data: AISettingsUpdate,
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Update AI settings"""
    try:
        now = datetime.utcnow()
        
        # Check if settings exist
        existing_settings = await db.ai_settings.find_one()
        
        if not existing_settings:
            # Create new settings
            new_settings = AISettings(
                id=str(uuid.uuid4()),
                llm_settings=settings_data.llm_settings or {},
                image_settings=settings_data.image_settings or {},
                social_settings=settings_data.social_settings or {},
                news_settings=settings_data.news_settings or {},
                created_at=now,
                updated_at=now
            )
            await db.ai_settings.insert_one(new_settings.dict())
        else:
            # Update existing settings
            update_data = {"updated_at": now}
            if settings_data.llm_settings is not None:
                update_data["llm_settings"] = settings_data.llm_settings
            if settings_data.image_settings is not None:
                update_data["image_settings"] = settings_data.image_settings
            if settings_data.social_settings is not None:
                update_data["social_settings"] = settings_data.social_settings
            if settings_data.news_settings is not None:
                update_data["news_settings"] = settings_data.news_settings
            
            await db.ai_settings.update_one(
                {"id": existing_settings["id"]},
                {"$set": update_data}
            )
        
        return {"message": "AI settings updated successfully"}
        
    except Exception as e:
        logger.error(f"Error updating AI settings: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update AI settings")

@api_router.post("/ai-settings/test/{service}")
async def test_ai_service_connection(
    service: str,
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Test connection to AI services"""
    try:
        if service == "llm":
            # Test LLM connection
            results = await ai_service.test_connection()
            if results.get("llm", False):
                return {"message": "LLM connection test successful"}
            else:
                raise HTTPException(status_code=500, detail="LLM connection test failed")
                
        elif service == "image":
            # Test image generation connection
            results = await ai_service.test_connection()
            if results.get("image", False):
                return {"message": "Image generation connection test successful"}
            else:
                raise HTTPException(status_code=500, detail="Image generation connection test failed")
                
        else:
            return {"message": f"{service} connection test successful (placeholder)"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error testing {service} connection: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to test {service} connection")


# ===============================
# TIMESHEET AI AGENT ENDPOINTS
# ===============================

@api_router.post("/timesheet-ai-agents", response_model=dict)
async def create_timesheet_ai_agent(
    agent_data: TimesheetAIAgentCreate,
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Create a new Timesheet AI Agent"""
    try:
        # Validate required fields
        if not agent_data.agent_name:
            raise HTTPException(status_code=400, detail="Agent name is required")
        
        # Validate date range if custom period
        if agent_data.report_period == TimesheetReportPeriod.CUSTOM:
            if not agent_data.custom_start_date or not agent_data.custom_end_date:
                raise HTTPException(status_code=400, detail="Custom start and end dates are required for custom period")
            
            # Validate that start date is before end date
            if agent_data.custom_start_date >= agent_data.custom_end_date:
                raise HTTPException(status_code=400, detail="Start date must be before end date")
        
        # Validate frequency for recurring mode
        if agent_data.mode == AIAgentMode.RECURRING and not agent_data.frequency:
            raise HTTPException(status_code=400, detail="Frequency is required for recurring mode")
        
        # Create timesheet AI agent
        agent = TimesheetAIAgent(
            id=str(uuid.uuid4()),
            **agent_data.dict(),
            created_by=current_user.id
        )
        
        await db.timesheet_ai_agents.insert_one(agent.dict())
        
        return {"message": "Timesheet AI agent created successfully", "agent_id": agent.id}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating timesheet AI agent: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create timesheet AI agent")

@api_router.get("/timesheet-ai-agents", response_model=List[dict])
async def get_timesheet_ai_agents(
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Get all Timesheet AI Agents"""
    try:
        # Get agents from timesheet_ai_agents collection
        agents_cursor = db.timesheet_ai_agents.find({})
        agents = await agents_cursor.to_list(length=None)
        
        # Also get timesheet agents from ai_agents collection
        ai_agents_cursor = db.ai_agents.find({"agent_type": "time_sheet"})
        ai_agents = await ai_agents_cursor.to_list(length=None)
        
        # Combine both lists and ensure no duplicates by ID
        all_agents = agents + ai_agents
        seen_ids = set()
        unique_agents = []
        for agent in all_agents:
            if agent.get("id") not in seen_ids:
                unique_agents.append(agent)
                seen_ids.add(agent.get("id"))
        
        all_agents = unique_agents
        
        # Convert ObjectId to string for JSON serialization
        for agent in all_agents:
            agent['_id'] = str(agent['_id'])
        
        return all_agents
        
    except Exception as e:
        logger.error(f"Error fetching timesheet AI agents: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch timesheet AI agents")

@api_router.put("/timesheet-ai-agents/{agent_id}", response_model=dict)
async def update_timesheet_ai_agent(
    agent_id: str,
    agent_data: TimesheetAIAgentUpdate,
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Update a Timesheet AI Agent"""
    try:
        # Check if agent exists in timesheet_ai_agents collection first
        existing_agent = await db.timesheet_ai_agents.find_one({"id": agent_id})
        collection_name = "timesheet_ai_agents"
        
        # If not found in timesheet_ai_agents, check ai_agents collection for timesheet agents
        if not existing_agent:
            existing_agent = await db.ai_agents.find_one({"id": agent_id, "agent_type": "time_sheet"})
            if existing_agent:
                collection_name = "ai_agents"
        
        if not existing_agent:
            raise HTTPException(status_code=404, detail="Timesheet AI agent not found")
        
        # Prepare update data
        update_data = {k: v for k, v in agent_data.dict().items() if v is not None}
        update_data["updated_at"] = await business_now_async()
        
        # Update the agent in the correct collection
        if collection_name == "timesheet_ai_agents":
            result = await db.timesheet_ai_agents.update_one(
                {"id": agent_id},
                {"$set": update_data}
            )
        else:
            result = await db.ai_agents.update_one(
                {"id": agent_id, "agent_type": "time_sheet"},
                {"$set": update_data}
            )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Timesheet AI agent not found")
        
        return {"message": "Timesheet AI agent updated successfully", "agent_id": agent_id}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating timesheet AI agent: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update timesheet AI agent")

@api_router.delete("/timesheet-ai-agents/{agent_id}")
async def delete_timesheet_ai_agent(
    agent_id: str,
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Delete a Timesheet AI Agent"""
    try:
        # Try to delete from timesheet_ai_agents collection first
        result = await db.timesheet_ai_agents.delete_one({"id": agent_id})
        
        # If not found in timesheet_ai_agents, try ai_agents collection for timesheet agents
        if result.deleted_count == 0:
            result = await db.ai_agents.delete_one({"id": agent_id, "agent_type": "time_sheet"})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Timesheet AI agent not found")
        
        return {"message": "Timesheet AI agent deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting timesheet AI agent: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete timesheet AI agent")

@api_router.post("/timesheet-ai-agents/{agent_id}/run", response_model=dict)
async def run_timesheet_ai_agent(
    agent_id: str,
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Run a Timesheet AI Agent to generate a report"""
    try:
        # Get the agent from timesheet_ai_agents collection first
        agent = await db.timesheet_ai_agents.find_one({"id": agent_id})
        
        # If not found in timesheet_ai_agents, check ai_agents collection for timesheet agents
        if not agent:
            agent = await db.ai_agents.find_one({"id": agent_id, "agent_type": "time_sheet"})
        
        if not agent:
            raise HTTPException(status_code=404, detail="Timesheet AI agent not found")
        
        # Check if agent is active
        if not agent.get("is_active", True):
            raise HTTPException(status_code=400, detail="Agent is not active")
        
        # Generate timesheet report
        report_id = await generate_timesheet_report(agent_id, agent, current_user.id)
        
        return {
            "message": "Timesheet report generated successfully",
            "agent_id": agent_id,
            "report_id": report_id,
            "agent_name": agent.get("agent_name")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error running timesheet AI agent {agent_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to run timesheet AI agent: {str(e)}")

@api_router.get("/timesheet-reports", response_model=List[dict])
async def get_timesheet_reports(
    status_filter: Optional[str] = None,  # "in_review", "ready_to_publish", "published"
    page: int = 1,
    limit: int = 20,
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Get timesheet reports with optional status filtering"""
    try:
        # Build query based on status filter
        query = {}
        if status_filter and status_filter in ["in_review", "ready_to_publish", "published"]:
            query["status"] = status_filter
        
        # Calculate skip for pagination
        skip = (page - 1) * limit
        
        # Get reports
        reports_cursor = db.timesheet_reports.find(query).sort("created_at", -1).skip(skip).limit(limit)
        reports = await reports_cursor.to_list(length=limit)
        
        # Convert ObjectId to string for JSON serialization
        for report in reports:
            report['_id'] = str(report['_id'])
        
        return reports
        
    except Exception as e:
        logger.error(f"Error fetching timesheet reports: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch timesheet reports")

@api_router.get("/timesheet-reports/{report_id}", response_model=dict)
async def get_timesheet_report(
    report_id: str,
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Get a specific timesheet report"""
    try:
        report = await db.timesheet_reports.find_one({"id": report_id})
        if not report:
            raise HTTPException(status_code=404, detail="Timesheet report not found")
        
        # Convert ObjectId to string for JSON serialization
        report['_id'] = str(report['_id'])
        
        return report
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching timesheet report: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch timesheet report")

@api_router.put("/timesheet-reports/{report_id}/status", response_model=dict)
async def update_timesheet_report_status(
    report_id: str,
    status_data: TimesheetReportUpdate,
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Update timesheet report status (workflow: In Review → Ready to Publish → Published)"""
    try:
        # Check if report exists
        existing_report = await db.timesheet_reports.find_one({"id": report_id})
        if not existing_report:
            raise HTTPException(status_code=404, detail="Timesheet report not found")
        
        # Prepare update data
        update_data = {k: v for k, v in status_data.dict().items() if v is not None}
        update_data["updated_at"] = await business_now_async()
        
        # Update the report
        result = await db.timesheet_reports.update_one(
            {"id": report_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Timesheet report not found")
        
        return {"message": "Timesheet report status updated successfully", "report_id": report_id}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating timesheet report status: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update timesheet report status")

@api_router.post("/timesheet-reports/{report_id}/email", response_model=dict)
async def email_timesheet_report(
    report_id: str,
    email_data: dict,
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Email a timesheet report link to recipients"""
    try:
        # Get the report
        report = await db.timesheet_reports.find_one({"id": report_id})
        if not report:
            raise HTTPException(status_code=404, detail="Timesheet report not found")
        
        # Get email recipients
        recipients = email_data.get("recipients", report.get("email_recipients", []))
        if not recipients:
            raise HTTPException(status_code=400, detail="No email recipients specified")
        
        # Generate report URL
        report_url = f"/timesheet-reports/{report_id}"
        
        # Prepare email content
        subject = f"Timesheet Report - {report.get('agent_name', 'Generated Report')}"
        html_content = f"""
        <html>
        <body>
            <h2>Timesheet Report</h2>
            <p>A new timesheet report has been generated:</p>
            <ul>
                <li><strong>Report Period:</strong> {report.get('start_date')} to {report.get('end_date')}</li>
                <li><strong>Total Employees:</strong> {report.get('total_employees', 0)}</li>
                <li><strong>Total Hours:</strong> {report.get('total_hours', 0.0):.2f}</li>
                <li><strong>Total Cost:</strong> ${report.get('total_cost', 0.0):.2f}</li>
            </ul>
            <p><a href="{report_url}" style="background-color: #29add3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Report</a></p>
            <br>
            <p>Best regards,<br>Timesheet AI Agent</p>
        </body>
        </html>
        """
        
        # Send emails to all recipients
        email_sent = False
        for recipient in recipients:
            try:
                success = await email_service.send_email(recipient, subject, html_content)
                if success:
                    email_sent = True
            except Exception as e:
                logger.error(f"Failed to send email to {recipient}: {str(e)}")
        
        # Update report with email status
        if email_sent:
            await db.timesheet_reports.update_one(
                {"id": report_id},
                {
                    "$set": {
                        "email_sent": True,
                        "email_sent_at": await business_now_async(),
                        "email_recipients": recipients,
                        "updated_at": await business_now_async()
                    }
                }
            )
        
        return {
            "message": "Email sent successfully" if email_sent else "Email sending failed",
            "email_sent": email_sent,
            "recipients": recipients
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error emailing timesheet report: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to email timesheet report")

async def generate_timesheet_report(agent_id: str, agent_data: dict, created_by: str) -> str:
    """Generate a comprehensive timesheet report with AI summary"""
    try:
        # Calculate date range based on agent's pay period configuration
        # Use run_every_pay_period for recurring agents, report_period for adhoc agents
        pay_period_setting = agent_data.get("run_every_pay_period") or agent_data.get("report_period", "current_week")
        
        logger.info(f"Calculating timesheet period for agent {agent_id}: pay_period_setting={pay_period_setting}")
        
        start_date, end_date = await calculate_report_period(
            pay_period_setting,
            agent_data.get("custom_start_date"),
            agent_data.get("custom_end_date"),
            agent_id  # Pass agent_id for agent-specific period calculation
        )
        
        logger.info(f"Final calculated period for agent {agent_id}: {start_date} to {end_date}")
        
        # Get selected employees or all employees
        selected_employees = agent_data.get("selected_employees", [])
        if not selected_employees:
            # Get all active employees
            employees_cursor = db.users.find({"role": {"$in": ["user", "technician", "manager"]}})
            all_employees = await employees_cursor.to_list(length=None)
            selected_employees = [emp["id"] for emp in all_employees]
        
        # Get timesheet data for the period
        employee_data = []
        total_hours = 0.0
        total_cost = 0.0
        
        for employee_id in selected_employees:
            # Get employee info
            employee = await db.users.find_one({"id": employee_id})
            if not employee:
                continue
            
            # Get employee config for rates
            employee_config = await db.employee_configs.find_one({"user_id": employee_id})
            if not employee_config:
                continue
            
            # Get time entries for the period
            start_datetime = datetime.strptime(start_date, '%Y-%m-%d')
            end_datetime = datetime.strptime(end_date, '%Y-%m-%d') + timedelta(days=1)
            
            time_entries_cursor = db.time_entries.find({
                "user_id": employee_id,
                "clock_in_time": {
                    "$gte": start_datetime,
                    "$lt": end_datetime
                },
                "clock_out_time": {"$ne": None}
            })
            time_entries = await time_entries_cursor.to_list(length=None)
            
            # Calculate hours and pay for this employee
            emp_regular_hours = 0.0
            emp_after_hours = 0.0
            
            for entry in time_entries:
                hours_calc = await calculate_hours(entry)
                emp_regular_hours += hours_calc.get("regular_hours", 0)
                emp_after_hours += hours_calc.get("after_hours_hours", 0)
            
            emp_total_hours = emp_regular_hours + emp_after_hours
            
            # Calculate pay
            hourly_rate = employee_config.get("hourly_rate", 0.0)
            after_hours_rate = employee_config.get("after_hours_rate", hourly_rate * 1.5)
            
            emp_regular_pay = emp_regular_hours * hourly_rate
            emp_after_hours_pay = emp_after_hours * after_hours_rate
            emp_total_pay = emp_regular_pay + emp_after_hours_pay
            
            employee_data.append({
                "user_id": employee_id,
                "user_name": employee.get("full_name", "Unknown"),
                "user_email": employee.get("email", ""),
                "user_role": employee.get("role", "user"),
                "total_hours": emp_total_hours,
                "regular_hours": emp_regular_hours,
                "after_hours_hours": emp_after_hours,
                "hourly_rate": hourly_rate,
                "after_hours_rate": after_hours_rate,
                "regular_pay": emp_regular_pay,
                "after_hours_pay": emp_after_hours_pay,
                "total_pay": emp_total_pay,
                "days_worked": len(time_entries)
            })
            
            total_hours += emp_total_hours
            total_cost += emp_total_pay
        
        # Generate AI summary if requested
        summary = None
        if agent_data.get("include_summary", True):
            summary = await generate_ai_timesheet_summary(employee_data, start_date, end_date)
        
        # Create report record
        report_id = str(uuid.uuid4())
        report = TimesheetAIReport(
            id=report_id,
            agent_id=agent_id,
            agent_name=agent_data.get("agent_name", "Timesheet AI Agent"),
            report_period=agent_data.get("report_period", "current_week"),
            start_date=start_date,
            end_date=end_date,
            employee_data=employee_data,
            summary=summary,
            total_hours=total_hours,
            total_employees=len(employee_data),
            total_cost=total_cost,
            regular_hours=sum(emp["regular_hours"] for emp in employee_data),
            after_hours_hours=sum(emp["after_hours_hours"] for emp in employee_data),
            regular_pay=sum(emp["regular_pay"] for emp in employee_data),
            after_hours_pay=sum(emp["after_hours_pay"] for emp in employee_data),
            status=agent_data.get("initial_status", TimesheetReportStatus.IN_REVIEW),
            email_recipients=agent_data.get("email_recipients", []),
            report_url=f"/timesheet-reports/{report_id}",
            created_by=created_by
        )
        
        await db.timesheet_reports.insert_one(report.dict())
        
        # Also create an AI post entry so it appears in the AI workflow (Ready to Publish)
        try:
            post_id = str(uuid.uuid4())
            post_data = {
                "id": post_id,
                "agent_id": agent_id,
                "agent_name": agent_data.get("agent_name", "Timesheet AI Agent"),
                "agent_type": "time_sheet",
                "platform": "timesheet",
                "topic": f"Timesheet Report: {start_date} to {end_date}",
                "content": f"Timesheet report generated for period {start_date} to {end_date}. Total employees: {len(employee_data)}, Total hours: {total_hours:.2f}, Total cost: ${total_cost:.2f}",
                "status": PostStatus.READY,
                "workflow_status": PostStatus.READY,
                "scheduled_time": None,
                "posted_time": None,
                "image_url": None,
                "image_text": None,
                "likes": 0,
                "shares": 0,
                "comments": 0,
                "engagement_rate": 0.0,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc),
                "created_by": created_by,
                "report_url": f"/timesheet-reports/{report_id}",
                "timesheet_data": {
                    "report_id": report_id,
                    "report_period": agent_data.get("report_period", "current_week"),
                    "start_date": start_date,
                    "end_date": end_date,
                    "total_employees": len(employee_data),
                    "total_hours": total_hours,
                    "total_cost": total_cost,
                    "employee_data": employee_data,
                    "summary": summary
                }
            }
            
            logger.info(f"Creating AI post for timesheet report {report_id} with status {PostStatus.READY}")
            await db.ai_posts.insert_one(post_data)
            logger.info(f"Successfully created AI post {post_id} for timesheet report {report_id}")
            
        except Exception as post_error:
            logger.error(f"Error creating AI post for timesheet report {report_id}: {str(post_error)}")
            # Don't fail the entire function if AI post creation fails
            pass
        
        # Send email if auto_email is enabled
        if agent_data.get("auto_email", False) and agent_data.get("email_recipients"):
            try:
                await email_timesheet_report(report_id, {"recipients": agent_data["email_recipients"]}, None)
            except Exception as e:
                logger.error(f"Failed to send auto email for report {report_id}: {str(e)}")
        
        return report_id
        
    except Exception as e:
        logger.error(f"Error generating timesheet report: {str(e)}")
        raise Exception(f"Failed to generate timesheet report: {str(e)}")

async def calculate_report_period(period: str, custom_start: Optional[str] = None, custom_end: Optional[str] = None, agent_id: Optional[str] = None) -> tuple[str, str]:
    """Calculate start and end dates for report period"""
    try:
        # If custom start and end dates are provided, use them directly
        if custom_start and custom_end:
            logger.info(f"Using custom period from frontend: {custom_start} to {custom_end}")
            return custom_start, custom_end
        else:
            logger.info(f"No custom period provided, calculating period for: {period}")
            
        business_now = await business_now_async()
        today = business_now.date()
        
        if period == "current_week" or period == "weekly":
            # Calculate current weekly period based on foundation date
            try:
                # Get the actual foundation date from timesheet config
                timesheet_config = await db.timesheet_configs.find_one({})
                if timesheet_config and timesheet_config.get("original_pay_period_start_date"):
                    foundation_date_str = timesheet_config["original_pay_period_start_date"]
                    foundation_date = datetime.strptime(foundation_date_str, '%Y-%m-%d').date()
                else:
                    # Ultimate fallback - use Monday of current week
                    days_since_monday = today.weekday()
                    foundation_date = today - timedelta(days=days_since_monday)
                
                # Calculate how many weeks have passed since foundation
                days_since_foundation = (today - foundation_date).days
                weeks_since_foundation = days_since_foundation // 7
                
                # Calculate current period start
                current_period_start = foundation_date + timedelta(days=weeks_since_foundation * 7)
                
                # If we're past the current period, move to next period
                current_period_end = current_period_start + timedelta(days=6)
                if today > current_period_end:
                    current_period_start = current_period_start + timedelta(days=7)
                
                start_date = current_period_start
                end_date = current_period_start + timedelta(days=6)
                
                logger.info(f"Weekly period calculation: {start_date} to {end_date} (foundation: {foundation_date})")
                
            except Exception as e:
                logger.error(f"Error calculating weekly period: {str(e)}")
                # Fallback to Monday-Sunday calculation
                days_since_monday = today.weekday()
                start_date = today - timedelta(days=days_since_monday)
                end_date = start_date + timedelta(days=6)
        elif period == "bi_weekly" or period == "biweekly":
            # Calculate current bi-weekly period based on foundation date
            try:
                # Get the actual foundation date from timesheet config
                timesheet_config = await db.timesheet_configs.find_one({})
                if timesheet_config and timesheet_config.get("original_pay_period_start_date"):
                    foundation_date_str = timesheet_config["original_pay_period_start_date"]
                    foundation_date = datetime.strptime(foundation_date_str, '%Y-%m-%d').date()
                else:
                    # Ultimate fallback to a default Monday
                    foundation_date = datetime(2025, 1, 6).date()  # Monday, Jan 6, 2025 as default start
                
                # Calculate how many bi-weekly periods have passed since foundation
                days_since_foundation = (today - foundation_date).days
                bi_weeks_since_foundation = days_since_foundation // 14
                
                # Calculate current period start
                current_period_start = foundation_date + timedelta(days=bi_weeks_since_foundation * 14)
                
                # If we're past the current period, move to next period
                current_period_end = current_period_start + timedelta(days=13)  # 14 days - 1
                if today > current_period_end:
                    current_period_start = current_period_start + timedelta(days=14)
                
                start_date = current_period_start
                end_date = current_period_start + timedelta(days=13)
                
                logger.info(f"Bi-weekly period calculation: {start_date} to {end_date} (foundation: {foundation_date})")
                
            except Exception as e:
                logger.error(f"Error calculating bi-weekly period: {str(e)}")
                # Fallback to weekly calculation
                days_since_monday = today.weekday()
                start_date = today - timedelta(days=days_since_monday)
                end_date = start_date + timedelta(days=6)
        elif period == "last_week":
            days_since_monday = today.weekday()
            current_week_start = today - timedelta(days=days_since_monday)
            start_date = current_week_start - timedelta(days=7)
            end_date = current_week_start - timedelta(days=1)
        elif period == "current_month":
            start_date = today.replace(day=1)
            if today.month == 12:
                next_month_start = today.replace(year=today.year + 1, month=1, day=1)
            else:
                next_month_start = today.replace(month=today.month + 1, day=1)
            end_date = next_month_start - timedelta(days=1)
        elif period == "last_month":
            if today.month == 1:
                start_date = today.replace(year=today.year - 1, month=12, day=1)
                end_date = today.replace(day=1) - timedelta(days=1)
            else:
                start_date = today.replace(month=today.month - 1, day=1)
                end_date = today.replace(day=1) - timedelta(days=1)
        elif period == "custom":
            if not custom_start or not custom_end:
                raise ValueError("Custom start and end dates are required for custom period")
            start_date = datetime.strptime(custom_start, '%Y-%m-%d').date()
            end_date = datetime.strptime(custom_end, '%Y-%m-%d').date()
        else:
            # Default to current week
            days_since_monday = today.weekday()
            start_date = today - timedelta(days=days_since_monday)
            end_date = start_date + timedelta(days=6)
        
        return start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d')
        
    except Exception as e:
        logger.error(f"Error calculating report period: {str(e)}")
        raise Exception(f"Failed to calculate report period: {str(e)}")

async def generate_ai_timesheet_summary(employee_data: List[dict], start_date: str, end_date: str) -> Optional[str]:
    """Generate AI-powered summary of timesheet data"""
    try:
        # Prepare data for AI analysis
        total_employees = len(employee_data)
        total_hours = sum(emp["total_hours"] for emp in employee_data)
        total_cost = sum(emp["total_pay"] for emp in employee_data)
        avg_hours_per_employee = total_hours / total_employees if total_employees > 0 else 0
        
        # Create prompt for AI summary
        prompt = f"""
Analyze this timesheet data and provide a professional summary:

Period: {start_date} to {end_date}
Total Employees: {total_employees}
Total Hours Worked: {total_hours:.2f}
Total Labor Cost: ${total_cost:.2f}
Average Hours per Employee: {avg_hours_per_employee:.2f}

Top Performers (by hours worked):
"""
        
        # Add top 5 employees by hours
        sorted_employees = sorted(employee_data, key=lambda x: x["total_hours"], reverse=True)
        for i, emp in enumerate(sorted_employees[:5]):
            prompt += f"\n{i+1}. {emp['user_name']}: {emp['total_hours']:.2f} hours (${emp['total_pay']:.2f})"
        
        prompt += """

Please provide a concise, professional summary highlighting:
1. Overall productivity insights
2. Key observations about work patterns
3. Any notable trends or outliers
4. Recommendations for management

Keep the summary to 3-4 paragraphs maximum.
"""
        
        # Use the existing AI service to generate summary
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        api_key = os.getenv('EMERGENT_LLM_KEY')
        if not api_key:
            logger.warning("No Emergent LLM key available for timesheet summary generation")
            return None
        
        chat = LlmChat(
            api_key=api_key,
            session_id=f"timesheet_summary_{datetime.now().timestamp()}",
            system_message="You are a professional HR analyst providing insights on employee timesheet data. Be concise, professional, and focus on actionable insights for management."
        ).with_model("openai", "gpt-4o-mini")
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        return response.strip() if response else None
        
    except Exception as e:
        logger.error(f"Error generating AI timesheet summary: {str(e)}")
        return None


# Timesheet System API Endpoints

# Helper functions for timesheet calculations
async def calculate_hours(time_entry: dict) -> dict:
    """Calculate regular and after-hours hours for a time entry"""
    from datetime import datetime, timedelta
    import pytz
    
    if not time_entry.get("clock_out_time"):
        return {"total_hours": 0, "regular_hours": 0, "after_hours_hours": 0}
    
    try:
        # Get business timezone
        business_tz = await get_business_timezone()
        
        # Parse times - handle both datetime objects and ISO strings
        clock_in_str = time_entry["clock_in_time"]
        clock_out_str = time_entry["clock_out_time"]
        
        # Convert to datetime objects if they're strings
        if isinstance(clock_in_str, str):
            if clock_in_str.endswith('Z'):
                clock_in = datetime.fromisoformat(clock_in_str.replace("Z", "+00:00"))
            else:
                clock_in = datetime.fromisoformat(clock_in_str)
        else:
            clock_in = clock_in_str
            
        if isinstance(clock_out_str, str):
            if clock_out_str.endswith('Z'):
                clock_out = datetime.fromisoformat(clock_out_str.replace("Z", "+00:00"))
            else:
                clock_out = datetime.fromisoformat(clock_out_str)
        else:
            clock_out = clock_out_str
        
        # Ensure both times are timezone-aware
        if clock_in.tzinfo is None:
            clock_in = clock_in.replace(tzinfo=pytz.UTC)
        if clock_out.tzinfo is None:
            clock_out = clock_out.replace(tzinfo=pytz.UTC)
        
        # Convert to business timezone
        clock_in = clock_in.astimezone(business_tz)
        clock_out = clock_out.astimezone(business_tz)
        
        # Calculate total worked time minus breaks
        total_minutes = (clock_out - clock_in).total_seconds() / 60
        
        # Subtract break time
        break_minutes = 0
        for break_entry in time_entry.get("breaks", []):
            if break_entry.get("break_end"):
                break_start_str = break_entry["break_start"]
                break_end_str = break_entry["break_end"]
                
                # Parse break times
                if isinstance(break_start_str, str):
                    if break_start_str.endswith('Z'):
                        break_start = datetime.fromisoformat(break_start_str.replace("Z", "+00:00"))
                    else:
                        break_start = datetime.fromisoformat(break_start_str)
                else:
                    break_start = break_start_str
                    
                if isinstance(break_end_str, str):
                    if break_end_str.endswith('Z'):
                        break_end = datetime.fromisoformat(break_end_str.replace("Z", "+00:00"))
                    else:
                        break_end = datetime.fromisoformat(break_end_str)
                else:
                    break_end = break_end_str
                
                # Ensure timezone awareness for breaks
                if break_start.tzinfo is None:
                    break_start = break_start.replace(tzinfo=pytz.UTC)
                if break_end.tzinfo is None:
                    break_end = break_end.replace(tzinfo=pytz.UTC)
                    
                break_start = break_start.astimezone(business_tz)
                break_end = break_end.astimezone(business_tz)
                break_minutes += (break_end - break_start).total_seconds() / 60
        
        worked_minutes = total_minutes - break_minutes
        total_hours = worked_minutes / 60
        
        # Get after hours cutoff from config
        config = await db.timesheet_config.find_one()
        after_hours_cutoff = "18:00"  # Default
        if config:
            after_hours_cutoff = config.get("after_hours_cutoff_time", "18:00")
        
        # Parse after hours cutoff
        cutoff_hour, cutoff_minute = map(int, after_hours_cutoff.split(":"))
        cutoff_time = clock_in.replace(hour=cutoff_hour, minute=cutoff_minute, second=0, microsecond=0)
        
        # Calculate after hours hours (work after cutoff time)
        after_hours_hours = 0
        regular_hours = total_hours
        
        if clock_out > cutoff_time:
            # Some work was done after cutoff time
            if clock_in >= cutoff_time:
                # All work was after cutoff
                after_hours_hours = total_hours
                regular_hours = 0
            else:
                # Part of work was after cutoff
                regular_end = min(clock_out, cutoff_time)
                regular_minutes = (regular_end - clock_in).total_seconds() / 60
                
                # Subtract breaks that occurred during regular hours
                regular_break_minutes = 0
                for break_entry in time_entry.get("breaks", []):
                    if break_entry.get("break_end"):
                        break_start_str = break_entry["break_start"]
                        break_end_str = break_entry["break_end"]
                        
                        # Parse break times (same logic as above)
                        if isinstance(break_start_str, str):
                            if break_start_str.endswith('Z'):
                                break_start = datetime.fromisoformat(break_start_str.replace("Z", "+00:00"))
                            else:
                                break_start = datetime.fromisoformat(break_start_str)
                        else:
                            break_start = break_start_str
                            
                        if isinstance(break_end_str, str):
                            if break_end_str.endswith('Z'):
                                break_end = datetime.fromisoformat(break_end_str.replace("Z", "+00:00"))
                            else:
                                break_end = datetime.fromisoformat(break_end_str)
                        else:
                            break_end = break_end_str
                        
                        if break_start.tzinfo is None:
                            break_start = break_start.replace(tzinfo=pytz.UTC)
                        if break_end.tzinfo is None:
                            break_end = break_end.replace(tzinfo=pytz.UTC)
                            
                        break_start = break_start.astimezone(business_tz)
                        break_end = break_end.astimezone(business_tz)
                        
                        # Check if break overlaps with regular hours
                        if break_start < cutoff_time and break_end > clock_in:
                            overlap_start = max(break_start, clock_in)
                            overlap_end = min(break_end, cutoff_time)
                            if overlap_end > overlap_start:
                                regular_break_minutes += (overlap_end - overlap_start).total_seconds() / 60
                
                regular_hours = (regular_minutes - regular_break_minutes) / 60
                after_hours_hours = total_hours - regular_hours
        
        return {
            "total_hours": round(total_hours, 2),
            "regular_hours": round(max(0, regular_hours), 2),
            "after_hours_hours": round(max(0, after_hours_hours), 2)
        }
        
    except Exception as e:
        # Log the error for debugging
        print(f"Error in calculate_hours: {str(e)}")
        print(f"Time entry data: {time_entry}")
        # Return zero values if calculation fails
        return {"total_hours": 0, "regular_hours": 0, "after_hours_hours": 0}


# Timesheet Configuration Endpoints
@api_router.get("/timesheet-config", response_model=TimesheetConfig)
async def get_timesheet_config(current_user: User = Depends(get_manager_or_admin_user)):
    """Get timesheet system configuration"""
    config = await db.timesheet_config.find_one()
    if not config:
        # Create default configuration
        default_config = TimesheetConfig(
            id=str(uuid.uuid4()),
            location_tracking_enabled=False,
            after_hours_cutoff_time="18:00",
            auto_clockout_grace_minutes=30,
            pay_period_type="biweekly",
            created_at=await business_now_async(),
            updated_at=await business_now_async(),
            updated_by=current_user.id
        )
        await db.timesheet_config.insert_one(default_config.dict())
        return default_config
    return TimesheetConfig(**config)


@api_router.put("/timesheet-config", response_model=TimesheetConfig)
async def update_timesheet_config(
    config_data: TimesheetConfigUpdate,
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Update timesheet system configuration"""
    existing_config = await db.timesheet_config.find_one()
    if not existing_config:
        raise HTTPException(status_code=404, detail="Timesheet configuration not found")
    
    update_data = config_data.dict(exclude_unset=True)
    update_data["updated_at"] = await business_now_async()
    update_data["updated_by"] = current_user.id
    
    await db.timesheet_config.update_one(
        {"id": existing_config["id"]},
        {"$set": update_data}
    )
    
    updated_config = await db.timesheet_config.find_one({"id": existing_config["id"]})
    return TimesheetConfig(**updated_config)


# Employee Configuration Endpoints
@api_router.get("/employee-configs", response_model=List[EmployeeConfig])
async def get_employee_configs(current_user: User = Depends(get_manager_or_admin_user)):
    """Get all employee configurations"""
    configs = await db.employee_configs.find().to_list(length=None)
    return [EmployeeConfig(**config) for config in configs]


@api_router.get("/employee-configs/{user_id}", response_model=EmployeeConfig)
async def get_employee_config(
    user_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get employee configuration (users can see their own, managers can see all)"""
    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER] and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Can only view your own configuration")
    
    config = await db.employee_configs.find_one({"user_id": user_id})
    if not config:
        # Create default configuration
        user = await db.users.find_one({"id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        default_config = EmployeeConfig(
            id=str(uuid.uuid4()),
            user_id=user_id,
            hourly_rate=0.0,
            is_active=True,
            created_at=await business_now_async(),
            updated_at=await business_now_async(),
            updated_by=current_user.id
        )
        await db.employee_configs.insert_one(default_config.dict())
        return default_config
    
    return EmployeeConfig(**config)


@api_router.put("/employee-configs/{user_id}", response_model=EmployeeConfig)
async def update_employee_config(
    user_id: str,
    config_data: EmployeeConfigUpdate,
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Update employee configuration (managers/admins only)"""
    existing_config = await db.employee_configs.find_one({"user_id": user_id})
    if not existing_config:
        raise HTTPException(status_code=404, detail="Employee configuration not found")
    
    update_data = config_data.dict(exclude_unset=True)
    update_data["updated_at"] = await business_now_async()
    update_data["updated_by"] = current_user.id
    
    await db.employee_configs.update_one(
        {"user_id": user_id},
        {"$set": update_data}
    )
    
    updated_config = await db.employee_configs.find_one({"user_id": user_id})
    return EmployeeConfig(**updated_config)


# Clock In/Out Endpoints
@api_router.post("/timesheet/clock-in", response_model=TimeEntry)
async def clock_in(
    clock_data: TimeEntryCreate,
    current_user: User = Depends(get_timesheet_employee)
):
    """Clock in for work"""
    # Check if user is already clocked in
    active_entry = await db.time_entries.find_one({
        "user_id": current_user.id,
        "status": "active"
    })
    
    if active_entry:
        raise HTTPException(status_code=400, detail="You are already clocked in")
    
    # Create new time entry
    time_entry = TimeEntry(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        clock_in_time=await business_now_async(),
        location_data=clock_data.location_data,
        notes=clock_data.notes,
        status="active",
        created_at=await business_now_async(),
        updated_at=await business_now_async()
    )
    
    await db.time_entries.insert_one(time_entry.dict())
    return time_entry


@api_router.post("/timesheet/clock-out")
async def clock_out(current_user: User = Depends(get_timesheet_employee)):
    """Clock out from work"""
    # Find active time entry
    active_entry = await db.time_entries.find_one({
        "user_id": current_user.id,
        "status": "active"
    })
    
    if not active_entry:
        raise HTTPException(status_code=400, detail="You are not currently clocked in")
    
    # End any active breaks
    breaks = active_entry.get("breaks", [])
    for break_entry in breaks:
        if not break_entry.get("break_end"):
            break_entry["break_end"] = (await business_now_async()).isoformat()
    
    # Update time entry
    clock_out_time = await business_now_async()
    active_entry["clock_out_time"] = clock_out_time.isoformat()
    active_entry["breaks"] = breaks
    active_entry["status"] = "completed"
    active_entry["updated_at"] = clock_out_time.isoformat()
    
    # Calculate hours
    try:
        hours_calc = await calculate_hours(active_entry)
        active_entry.update(hours_calc)
    except Exception as e:
        # If calculation fails, set default values
        active_entry.update({
            "total_hours": 0,
            "regular_hours": 0,
            "after_hours_hours": 0
        })
    
    await db.time_entries.update_one(
        {"id": active_entry["id"]},
        {"$set": active_entry}
    )
    
    # Return clock-out summary
    return {
        "message": "Successfully clocked out",
        "total_hours": active_entry.get("total_hours", 0),
        "regular_hours": active_entry.get("regular_hours", 0),
        "after_hours_hours": active_entry.get("after_hours_hours", 0)
    }


# Break Management Endpoints
@api_router.post("/timesheet/break-start", response_model=TimeEntry)
async def start_break(
    break_data: BreakStart,
    current_user: User = Depends(get_timesheet_employee)
):
    """Start a break"""
    # Find active time entry
    active_entry = await db.time_entries.find_one({
        "user_id": current_user.id,
        "status": "active"
    })
    
    if not active_entry:
        raise HTTPException(status_code=400, detail="You must be clocked in to start a break")
    
    # Check if already on break
    breaks = active_entry.get("breaks", [])
    for break_entry in breaks:
        if not break_entry.get("break_end"):
            raise HTTPException(status_code=400, detail="You are already on a break")
    
    # Add new break
    new_break = BreakEntry(
        break_start=await business_now_async(),
        break_type=break_data.break_type,
        notes=break_data.notes
    )
    
    breaks.append(new_break.dict())
    
    await db.time_entries.update_one(
        {"id": active_entry["id"]},
        {"$set": {"breaks": breaks, "updated_at": (await business_now_async()).isoformat()}}
    )
    
    updated_entry = await db.time_entries.find_one({"id": active_entry["id"]})
    return TimeEntry(**updated_entry)


@api_router.post("/timesheet/break-end", response_model=TimeEntry)
async def end_break(
    break_data: BreakEnd,
    current_user: User = Depends(get_timesheet_employee)
):
    """End current break"""
    # Find active time entry
    active_entry = await db.time_entries.find_one({
        "user_id": current_user.id,
        "status": "active"
    })
    
    if not active_entry:
        raise HTTPException(status_code=400, detail="You must be clocked in to end a break")
    
    # Find active break
    breaks = active_entry.get("breaks", [])
    active_break = None
    for break_entry in breaks:
        if not break_entry.get("break_end"):
            active_break = break_entry
            break
    
    if not active_break:
        raise HTTPException(status_code=400, detail="You are not currently on a break")
    
    # End the break
    active_break["break_end"] = (await business_now_async()).isoformat()
    if break_data.notes:
        active_break["notes"] = break_data.notes
    
    await db.time_entries.update_one(
        {"id": active_entry["id"]},
        {"$set": {"breaks": breaks, "updated_at": (await business_now_async()).isoformat()}}
    )
    
    updated_entry = await db.time_entries.find_one({"id": active_entry["id"]})
    return TimeEntry(**updated_entry)


# Timesheet Status Endpoints
@api_router.get("/timesheet/status", response_model=dict)
async def get_timesheet_status(current_user: User = Depends(get_timesheet_employee)):
    """Get current timesheet status for logged-in user"""
    # Find active time entry
    active_entry = await db.time_entries.find_one({
        "user_id": current_user.id,
        "status": "active"
    })
    
    if not active_entry:
        return {
            "is_clocked_in": False,
            "is_on_break": False,
            "clock_in_time": None,
            "current_break": None,
            "daily_hours": 0
        }
    
    # Check for active break
    active_break = None
    for break_entry in active_entry.get("breaks", []):
        if not break_entry.get("break_end"):
            active_break = break_entry
            break
    
    # Calculate daily hours so far
    try:
        from datetime import datetime
        clock_in = active_entry["clock_in_time"]
        if isinstance(clock_in, str):
            clock_in = datetime.fromisoformat(clock_in.replace("Z", "+00:00"))
        current_time = await business_now_async()
        
        # Estimate hours worked so far (including current time)
        temp_entry = active_entry.copy()
        temp_entry["clock_out_time"] = current_time.isoformat()  # Convert to ISO string
        hours_calc = await calculate_hours(temp_entry)
        daily_hours = hours_calc["total_hours"]
    except Exception as e:
        # If calculation fails, default to 0 hours
        daily_hours = 0
    
    return {
        "is_clocked_in": True,
        "is_on_break": active_break is not None,
        "clock_in_time": active_entry["clock_in_time"],
        "current_break": active_break,
        "daily_hours": daily_hours,
        "breaks_today": len(active_entry.get("breaks", []))
    }


# Timesheet Reports Endpoints
@api_router.get("/timesheet/my-hours", response_model=List[TimeEntry])
async def get_my_timesheet(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: User = Depends(get_timesheet_employee)
):
    """Get timesheet entries for current user"""
    query = {"user_id": current_user.id}
    
    if start_date or end_date:
        from datetime import datetime
        date_query = {}
        if start_date:
            try:
                start_datetime = datetime.fromisoformat(start_date + "T00:00:00")
                date_query["$gte"] = start_datetime
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid start_date format. Use YYYY-MM-DD")
        if end_date:
            try:
                end_datetime = datetime.fromisoformat(end_date + "T23:59:59")
                date_query["$lte"] = end_datetime
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid end_date format. Use YYYY-MM-DD")
        query["clock_in_time"] = date_query
    
    entries = await db.time_entries.find(query).sort("clock_in_time", -1).to_list(length=None)
    return [TimeEntry(**entry) for entry in entries]


@api_router.get("/timesheet/reports", response_model=TimesheetSummary)
async def get_timesheet_reports(
    start_date: str,
    end_date: str,
    user_id: Optional[str] = None,
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Get timesheet reports for a period (managers/admins only)"""
    # Build query
    from datetime import datetime
    
    # Convert string dates to datetime objects for proper MongoDB comparison
    try:
        start_datetime = datetime.fromisoformat(start_date + "T00:00:00")
        end_datetime = datetime.fromisoformat(end_date + "T23:59:59")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    query = {
        "clock_in_time": {"$gte": start_datetime, "$lte": end_datetime},
        "status": {"$in": ["completed", "adjusted"]}
    }
    
    if user_id:
        query["user_id"] = user_id
    
    # Get time entries
    entries = await db.time_entries.find(query).to_list(length=None)
    
    # Group by user
    user_reports = {}
    for entry in entries:
        user_id = entry["user_id"]
        if user_id not in user_reports:
            # Get user info
            user = await db.users.find_one({"id": user_id})
            if not user:
                continue
            
            # Get employee config for rates
            emp_config = await db.employee_configs.find_one({"user_id": user_id})
            hourly_rate = emp_config.get("hourly_rate", 0) if emp_config else 0
            
            # Get overtime multiplier
            timesheet_config = await db.timesheet_config.find_one()
            overtime_multiplier = timesheet_config.get("overtime_multiplier", 1.5) if timesheet_config else 1.5
            
            user_reports[user_id] = {
                "user_id": user_id,
                "user_name": user["full_name"],
                "user_email": user["email"],
                "user_role": user["role"],
                "total_hours": 0,
                "regular_hours": 0,
                "after_hours_hours": 0,
                "total_pay": 0,
                "regular_pay": 0,
                "after_hours_pay": 0,
                "days_worked": 0,
                "worked_dates": set(),  # Track unique dates worked
                "entries": [],
                "adjustments": [],
                "hourly_rate": hourly_rate,
                "after_hours_rate": emp_config.get("after_hours_rate") or hourly_rate if emp_config else hourly_rate
            }
        
        # Add entry to report
        user_reports[user_id]["entries"].append(TimeEntry(**entry))
        user_reports[user_id]["total_hours"] += entry.get("total_hours", 0)
        user_reports[user_id]["regular_hours"] += entry.get("regular_hours", 0)
        user_reports[user_id]["after_hours_hours"] += entry.get("after_hours_hours", 0)
        
        # Track unique worked dates
        if entry.get("clock_in_time"):
            # Extract date from clock_in_time
            if isinstance(entry["clock_in_time"], str):
                work_date = entry["clock_in_time"][:10]  # Extract YYYY-MM-DD
            else:
                work_date = entry["clock_in_time"].strftime("%Y-%m-%d")
            user_reports[user_id]["worked_dates"].add(work_date)
    
    # Calculate days worked as count of unique dates
    for user_id in user_reports:
        user_reports[user_id]["days_worked"] = len(user_reports[user_id]["worked_dates"])
        # Remove the set as it's not JSON serializable
        del user_reports[user_id]["worked_dates"]
    
    # Calculate pay for each user
    for user_id in user_reports:
        report = user_reports[user_id]
        hourly_rate = report["hourly_rate"] or 0
        after_hours_rate = report["after_hours_rate"] or hourly_rate or 0
        
        report["regular_pay"] = report["regular_hours"] * hourly_rate
        report["after_hours_pay"] = report["after_hours_hours"] * after_hours_rate
        report["total_pay"] = report["regular_pay"] + report["after_hours_pay"]
        
        # Get adjustments for this period
        adjustments = await db.time_adjustments.find({
            "user_id": user_id,
            "adjustment_date": {"$gte": start_datetime, "$lte": end_datetime}
        }).to_list(length=None)
        report["adjustments"] = [TimeAdjustment(**adj) for adj in adjustments]
    
    # Calculate summary totals
    total_hours = sum(report["total_hours"] for report in user_reports.values())
    total_pay = sum(report["total_pay"] for report in user_reports.values())
    
    return TimesheetSummary(
        period=TimesheetPeriod(start_date=start_date, end_date=end_date),
        reports=[TimesheetReport(**report) for report in user_reports.values()],
        period_type="custom",
        total_employees=len(user_reports),
        total_hours=total_hours,
        total_pay=total_pay
    )


# Time Adjustment Endpoints
@api_router.post("/timesheet/adjustments", response_model=TimeAdjustment)
async def create_time_adjustment(
    adjustment_data: TimeAdjustmentCreate,
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Create a time adjustment (managers/admins only)"""
    adjustment = TimeAdjustment(
        id=str(uuid.uuid4()),
        time_entry_id=adjustment_data.time_entry_id,
        user_id=adjustment_data.user_id,
        adjusted_by=current_user.id,
        adjustment_type=adjustment_data.adjustment_type,
        original_value=adjustment_data.original_value,
        new_value=adjustment_data.new_value,
        reason=adjustment_data.reason,
        adjustment_date=await business_now_async(),
        created_at=await business_now_async()
    )
    
    await db.time_adjustments.insert_one(adjustment.dict())
    
    # Update the time entry status to "adjusted"
    await db.time_entries.update_one(
        {"id": adjustment_data.time_entry_id},
        {"$set": {"status": "adjusted", "updated_at": await business_now_async()}}
    )
    
    return adjustment


@api_router.get("/timesheet/all-entries", response_model=List[TimeEntry])
async def get_all_time_entries(
    start_date: str,
    end_date: str,
    user_id: Optional[str] = None,
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Get time entries for all employees or specific employee (managers/admins only)"""
    from datetime import datetime
    
    # Convert string dates to datetime objects for proper MongoDB comparison
    try:
        start_datetime = datetime.fromisoformat(start_date + "T00:00:00")
        end_datetime = datetime.fromisoformat(end_date + "T23:59:59")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    query = {
        "clock_in_time": {"$gte": start_datetime, "$lte": end_datetime}
    }
    
    if user_id:
        query["user_id"] = user_id
    
    entries = await db.time_entries.find(query).sort("clock_in_time", -1).to_list(length=None)
    return [TimeEntry(**entry) for entry in entries]

@api_router.post("/timesheet/manual-entry")
async def create_manual_time_entry(
    entry_data: dict,
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Create a manual time entry for an employee"""
    try:
        # Validate required fields
        required_fields = ['user_id', 'date', 'clock_in_time', 'reason']
        for field in required_fields:
            if field not in entry_data or not entry_data[field]:
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        # Check if employee exists
        employee = await db.users.find_one({"id": entry_data['user_id']})
        if not employee:
            raise HTTPException(status_code=404, detail="Employee not found")
        
        # Parse datetime strings
        try:
            clock_in_time = datetime.fromisoformat(entry_data['clock_in_time'].replace('Z', '+00:00'))
            clock_out_time = None
            if entry_data.get('clock_out_time'):
                clock_out_time = datetime.fromisoformat(entry_data['clock_out_time'].replace('Z', '+00:00'))
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid datetime format")
        
        # Validate clock out time is after clock in time
        if clock_out_time and clock_out_time <= clock_in_time:
            raise HTTPException(status_code=400, detail="Clock out time must be after clock in time")
        
        # Check for existing entries on the same date
        date_start = clock_in_time.replace(hour=0, minute=0, second=0, microsecond=0)
        date_end = date_start.replace(hour=23, minute=59, second=59, microsecond=999999)
        
        existing_entry = await db.time_entries.find_one({
            "user_id": entry_data['user_id'],
            "clock_in_time": {"$gte": date_start, "$lte": date_end}
        })
        
        if existing_entry:
            raise HTTPException(status_code=400, detail="An entry already exists for this employee on this date")
        
        # Create the time entry
        time_entry = {
            "id": str(uuid.uuid4()),
            "user_id": entry_data['user_id'],
            "clock_in_time": clock_in_time,
            "clock_out_time": clock_out_time,
            "status": "completed" if clock_out_time else "active",
            "is_manual_entry": True,
            "manual_entry_reason": entry_data['reason'],
            "created_by": current_user['id'],
            "created_at": await business_now_async(),
            "updated_at": await business_now_async()
        }
        
        # Calculate hours if both times are provided
        if clock_out_time:
            total_hours = (clock_out_time - clock_in_time).total_seconds() / 3600
            time_entry["total_hours"] = total_hours
        
        await db.time_entries.insert_one(time_entry)
        
        return {
            "message": "Manual time entry created successfully",
            "entry_id": time_entry["id"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating manual time entry: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create manual time entry: {str(e)}")


# Employee Management Endpoints
@api_router.get("/employees", response_model=List[User])
async def get_all_employees(
    active_only: bool = True,
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Get all employees (users with non-admin roles) with optional active filtering"""
    # Base query to exclude admin users
    user_query = {"role": {"$ne": "admin"}}
    
    # Get all employees
    employees = await db.users.find(user_query).to_list(length=None)
    
    if not active_only:
        # Return all employees regardless of active status
        return [User(**emp) for emp in employees]
    
    # Filter by active status from employee configs
    active_employee_ids = []
    configs = await db.employee_configs.find({"is_active": True}).to_list(length=None)
    active_employee_ids = [config["user_id"] for config in configs]
    
    # Filter employees to only include active ones
    active_employees = [emp for emp in employees if emp["id"] in active_employee_ids]
    return [User(**emp) for emp in active_employees]


@api_router.get("/employees/{user_id}", response_model=User)
async def get_employee(
    user_id: str,
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Get specific employee details"""
    employee = await db.users.find_one({"id": user_id})
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    if employee.get("role") == "admin":
        raise HTTPException(status_code=403, detail="Cannot access admin user details")
    
    return User(**employee)


@api_router.post("/employees", response_model=User)
async def create_employee(
    employee_data: UserCreate,
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Create a new employee with PIN-based authentication"""
    # Check if user already exists
    existing_user = await db.users.find_one({"email": employee_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Don't allow creating admin users through this endpoint
    if employee_data.role == "admin":
        raise HTTPException(status_code=403, detail="Cannot create admin users through this endpoint")
    
    # Handle PIN: use provided PIN or generate a random one
    if employee_data.pin:
        if not validate_pin(employee_data.pin):
            raise HTTPException(status_code=400, detail="PIN must be at least 6 characters (letters, numbers, and symbols allowed)")
        pin = employee_data.pin
    else:
        pin = generate_random_pin()
    
    # Create user with PIN as password
    hashed_pin = hash_password(pin)
    user = User(
        id=str(uuid.uuid4()),
        email=employee_data.email,
        full_name=employee_data.full_name,
        hashed_password=hashed_pin,
        role=employee_data.role,
        created_at=await business_now_async()
    )
    
    await db.users.insert_one(user.dict())
    
    # Create default employee config
    emp_config = EmployeeConfig(
        id=str(uuid.uuid4()),
        user_id=user.id,
        hourly_rate=0.0,
        is_active=True,
        created_at=await business_now_async(),
        updated_at=await business_now_async(),
        updated_by=current_user.id
    )
    await db.employee_configs.insert_one(emp_config.dict())
    
    # Return user object with the plain PIN (only for creation response)
    user_response = user.dict()
    user_response["pin"] = pin  # Include PIN in response for manager to give to employee
    
    return user_response


@api_router.put("/employees/{user_id}", response_model=User)
async def update_employee(
    user_id: str,
    employee_data: dict,
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Update employee details"""
    employee = await db.users.find_one({"id": user_id})
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    if employee.get("role") == "admin":
        raise HTTPException(status_code=403, detail="Cannot modify admin users")
    
    # Don't allow changing to admin role
    if employee_data.get("role") == "admin":
        raise HTTPException(status_code=403, detail="Cannot change user to admin role")
    
    # Update only provided fields
    update_data = {}
    allowed_fields = ["full_name", "email", "role"]
    
    for field in allowed_fields:
        if field in employee_data:
            update_data[field] = employee_data[field]
    
    # Handle PIN change
    if "pin" in employee_data and employee_data["pin"]:
        pin = employee_data["pin"]
        if not validate_pin(pin):
            raise HTTPException(status_code=400, detail="PIN must be at least 6 characters (letters, numbers, and symbols allowed)")
        update_data["hashed_password"] = hash_password(pin)
    
    if update_data:
        update_data["updated_at"] = await business_now_async()
        await db.users.update_one(
            {"id": user_id},
            {"$set": update_data}
        )
    
    updated_employee = await db.users.find_one({"id": user_id})
    return User(**updated_employee)


@api_router.delete("/employees/{user_id}")
async def delete_employee(
    user_id: str,
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Deactivate an employee (soft delete)"""
    employee = await db.users.find_one({"id": user_id})
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    if employee.get("role") == "admin":
        raise HTTPException(status_code=403, detail="Cannot delete admin users")
    
    # Deactivate employee config instead of deleting user
    await db.employee_configs.update_one(
        {"user_id": user_id},
        {"$set": {
            "is_active": False,
            "updated_at": await business_now_async(),
            "updated_by": current_user.id
        }}
    )
    
    return {"message": "Employee deactivated successfully"}


@api_router.get("/employees/{user_id}/time-entries-count")
async def get_employee_time_entries_count(
    user_id: str,
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Get count of time entries for an employee"""
    employee = await db.users.find_one({"id": user_id})
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    # Count time entries and adjustments
    time_entries_count = await db.time_entries.count_documents({"user_id": user_id})
    adjustments_count = await db.time_adjustments.count_documents({"user_id": user_id})
    
    return {
        "time_entries_count": time_entries_count,
        "adjustments_count": adjustments_count,
        "has_timesheet_data": time_entries_count > 0 or adjustments_count > 0
    }


@api_router.delete("/employees/{user_id}/permanent")
async def permanently_delete_employee(
    user_id: str,
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Permanently delete an employee (hard delete) - WARNING: This cannot be undone"""
    employee = await db.users.find_one({"id": user_id})
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    if employee.get("role") == "admin":
        raise HTTPException(status_code=403, detail="Cannot delete admin users")
    
    # Count time entries for this employee
    time_entries_count = await db.time_entries.count_documents({"user_id": user_id})
    
    # Delete all associated data
    # Delete time entries
    await db.time_entries.delete_many({"user_id": user_id})
    
    # Delete timesheet adjustments
    await db.time_adjustments.delete_many({"user_id": user_id})
    
    # Delete employee configuration
    await db.employee_configs.delete_one({"user_id": user_id})
    
    # Delete the user account
    await db.users.delete_one({"id": user_id})
    
    return {
        "message": "Employee permanently deleted successfully",
        "deleted_time_entries": time_entries_count,
        "warning": "All associated time entries and adjustments have been permanently deleted"
    }
    
    # Delete the user
    await db.users.delete_one({"id": user_id})
    
    return {"message": "Employee permanently deleted successfully"}


# Auto Clock-Out Background Task
async def auto_clockout_task():
    """Background task to automatically clock out employees after business hours + grace period"""
    try:
        # Get timesheet configuration
        config = await db.timesheet_config.find_one()
        grace_minutes = 30  # Default
        if config:
            grace_minutes = config.get("auto_clockout_grace_minutes", 30)
        
        # Get business hours
        business_hours = await db.hospital_hours.find_one()
        if not business_hours:
            return
        
        # Get current business time
        business_tz = await get_business_timezone()
        current_time = datetime.now(business_tz)
        current_day = current_time.strftime("%A").lower()
        
        # Get closing time for today
        day_hours = business_hours.get(current_day)
        if not day_hours or not day_hours.get("is_open"):
            return
        
        close_time_str = day_hours.get("close_time", "17:00")
        close_hour, close_minute = map(int, close_time_str.split(":"))
        close_time = current_time.replace(hour=close_hour, minute=close_minute, second=0, microsecond=0)
        
        # Add grace period
        auto_clockout_time = close_time + timedelta(minutes=grace_minutes)
        
        # Only proceed if current time is past auto clock-out time
        if current_time < auto_clockout_time:
            return
        
        # Find employees who are still clocked in
        active_entries = await db.time_entries.find({"status": "active"}).to_list(length=None)
        
        for entry in active_entries:
            # Check if clock-in was today
            clock_in_time = datetime.fromisoformat(entry["clock_in_time"].replace("Z", "+00:00"))
            clock_in_business = clock_in_time.astimezone(business_tz)
            
            if clock_in_business.date() == current_time.date():
                # Auto clock out this employee
                breaks = entry.get("breaks", [])
                for break_entry in breaks:
                    if not break_entry.get("break_end"):
                        break_entry["break_end"] = auto_clockout_time
                
                entry["clock_out_time"] = auto_clockout_time
                entry["breaks"] = breaks
                entry["status"] = "completed"
                entry["is_auto_clockout"] = True
                entry["updated_at"] = current_time
                
                # Calculate hours
                hours_calc = await calculate_hours(entry)
                entry.update(hours_calc)
                
                await db.time_entries.update_one(
                    {"id": entry["id"]},
                    {"$set": entry}
                )
                
                logger.info(f"Auto clocked out user {entry['user_id']} at {auto_clockout_time}")
    
    except Exception as e:
        logger.error(f"Error in auto clock-out task: {str(e)}")


# Employee Scheduling API Endpoints

@api_router.get("/schedule/shifts", response_model=List[Shift])
async def get_shifts(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    user_id: Optional[str] = None,
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Get scheduled shifts for a date range"""
    query = {}
    
    if user_id:
        query["user_id"] = user_id
    
    if start_date and end_date:
        query["schedule_date"] = {"$gte": start_date, "$lte": end_date}
    elif start_date:
        query["schedule_date"] = {"$gte": start_date}
    elif end_date:
        query["schedule_date"] = {"$lte": end_date}
    
    shifts = await db.shifts.find(query).sort("schedule_date", 1).to_list(length=None)
    return [Shift(**shift) for shift in shifts]


@api_router.post("/schedule/shifts", response_model=Shift)
async def create_shift(
    shift_data: ShiftCreate,
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Create a new scheduled shift"""
    # Validate employee exists
    employee = await db.users.find_one({"id": shift_data.user_id})
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    # Check for conflicts
    existing_shift = await db.shifts.find_one({
        "user_id": shift_data.user_id,
        "schedule_date": shift_data.schedule_date,
        "status": {"$in": ["scheduled", "confirmed"]}
    })
    
    if existing_shift:
        raise HTTPException(
            status_code=400, 
            detail=f"Employee already has a shift scheduled for {shift_data.schedule_date}"
        )
    
    # Create shift
    shift = Shift(
        id=str(uuid.uuid4()),
        user_id=shift_data.user_id,
        schedule_date=shift_data.schedule_date,
        start_time=shift_data.start_time,
        end_time=shift_data.end_time,
        shift_type=shift_data.shift_type,
        position=shift_data.position,
        location=shift_data.location,
        notes=shift_data.notes,
        status="scheduled",
        created_by=current_user.id,
        created_at=await business_now_async(),
        updated_at=await business_now_async()
    )
    
    await db.shifts.insert_one(shift.dict())
    return shift


@api_router.put("/schedule/shifts/{shift_id}", response_model=Shift)
async def update_shift(
    shift_id: str,
    shift_data: ShiftUpdate,
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Update a scheduled shift"""
    shift = await db.shifts.find_one({"id": shift_id})
    if not shift:
        raise HTTPException(status_code=404, detail="Shift not found")
    
    # If changing user or date, check for conflicts
    if shift_data.user_id or shift_data.schedule_date:
        new_user_id = shift_data.user_id or shift["user_id"]
        new_date = shift_data.schedule_date or shift["schedule_date"]
        
        # Don't check conflict with the same shift
        existing_shift = await db.shifts.find_one({
            "user_id": new_user_id,
            "schedule_date": new_date,
            "status": {"$in": ["scheduled", "confirmed"]},
            "id": {"$ne": shift_id}
        })
        
        if existing_shift:
            raise HTTPException(
                status_code=400,
                detail=f"Employee already has a shift scheduled for {new_date}"
            )
    
    # Update shift
    update_data = {}
    for field, value in shift_data.dict().items():
        if value is not None:
            update_data[field] = value
    
    if update_data:
        update_data["updated_at"] = (await business_now_async()).isoformat()
        
        await db.shifts.update_one(
            {"id": shift_id},
            {"$set": update_data}
        )
    
    updated_shift = await db.shifts.find_one({"id": shift_id})
    return Shift(**updated_shift)


@api_router.delete("/schedule/shifts/{shift_id}")
async def delete_shift(
    shift_id: str,
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Delete a scheduled shift"""
    result = await db.shifts.delete_one({"id": shift_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Shift not found")
    
    return {"message": "Shift deleted successfully"}


@api_router.get("/schedule/employees", response_model=List[dict])
async def get_schedule_employees(current_user: User = Depends(get_manager_or_admin_user)):
    """Get all employees available for scheduling (excludes admins)"""
    employees = await db.users.find({
        "role": {"$ne": "admin"}
    }).to_list(length=None)
    
    result = []
    for emp in employees:
        # Get employee config for status
        config = await db.employee_configs.find_one({"user_id": emp["id"]})
        is_active = config.get("is_active", True) if config else True
        
        result.append({
            "id": emp["id"],
            "full_name": emp["full_name"],
            "email": emp["email"],
            "role": emp["role"],
            "is_active": is_active
        })
    
    return result


@api_router.get("/schedule/week/{week_start}", response_model=dict)
async def get_weekly_schedule(
    week_start: str,  # YYYY-MM-DD format for Monday of the week
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Get complete schedule for a specific week"""
    from datetime import datetime, timedelta
    
    # Calculate week end date
    start_date = datetime.strptime(week_start, "%Y-%m-%d")
    end_date = start_date + timedelta(days=6)
    end_date_str = end_date.strftime("%Y-%m-%d")
    
    # Get all shifts for the week
    shifts = await db.shifts.find({
        "schedule_date": {"$gte": week_start, "$lte": end_date_str}
    }).to_list(length=None)
    
    # Get all employees
    employees = await get_schedule_employees(current_user)
    
    # Organize shifts by date and user
    schedule = {}
    for i in range(7):
        day_date = (start_date + timedelta(days=i)).strftime("%Y-%m-%d")
        schedule[day_date] = {}
    
    for shift in shifts:
        date = shift["schedule_date"]
        user_id = shift["user_id"]
        
        if date not in schedule:
            schedule[date] = {}
        
        schedule[date][user_id] = {
            "id": shift["id"],
            "start_time": shift["start_time"],
            "end_time": shift["end_time"],
            "shift_type": shift["shift_type"],
            "position": shift.get("position"),
            "location": shift.get("location"),
            "notes": shift.get("notes"),
            "status": shift["status"]
        }
    
    return {
        "week_start": week_start,
        "week_end": end_date_str,
        "employees": employees,
        "schedule": schedule
    }


# Shift Preset Management API Endpoints

@api_router.get("/shift-presets", response_model=List[ShiftPreset])
async def get_shift_presets(current_user: User = Depends(get_manager_or_admin_user)):
    """Get all active shift presets"""
    presets = await db.shift_presets.find({"is_active": True}).sort("name", 1).to_list(length=None)
    return [ShiftPreset(**preset) for preset in presets]


@api_router.post("/shift-presets", response_model=ShiftPreset)
async def create_shift_preset(
    preset_data: ShiftPresetCreate,
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Create a new shift preset"""
    # Check if name already exists
    existing_preset = await db.shift_presets.find_one({
        "name": preset_data.name,
        "is_active": True
    })
    
    if existing_preset:
        raise HTTPException(
            status_code=400, 
            detail=f"Shift preset with name '{preset_data.name}' already exists"
        )
    
    # Create preset
    preset = ShiftPreset(
        id=str(uuid.uuid4()),
        name=preset_data.name,
        start_time=preset_data.start_time,
        end_time=preset_data.end_time,
        description=preset_data.description,
        is_active=True,
        created_by=current_user.id,
        created_at=await business_now_async(),
        updated_at=await business_now_async()
    )
    
    await db.shift_presets.insert_one(preset.dict())
    return preset


@api_router.put("/shift-presets/{preset_id}", response_model=ShiftPreset)
async def update_shift_preset(
    preset_id: str,
    preset_data: ShiftPresetUpdate,
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Update a shift preset"""
    preset = await db.shift_presets.find_one({"id": preset_id})
    if not preset:
        raise HTTPException(status_code=404, detail="Shift preset not found")
    
    # Check if new name conflicts with existing presets
    if preset_data.name and preset_data.name != preset["name"]:
        existing_preset = await db.shift_presets.find_one({
            "name": preset_data.name,
            "is_active": True,
            "id": {"$ne": preset_id}
        })
        
        if existing_preset:
            raise HTTPException(
                status_code=400,
                detail=f"Shift preset with name '{preset_data.name}' already exists"
            )
    
    # Update preset
    update_data = {}
    for field, value in preset_data.dict().items():
        if value is not None:
            update_data[field] = value
    
    if update_data:
        update_data["updated_at"] = (await business_now_async()).isoformat()
        
        await db.shift_presets.update_one(
            {"id": preset_id},
            {"$set": update_data}
        )
    
    updated_preset = await db.shift_presets.find_one({"id": preset_id})
    return ShiftPreset(**updated_preset)


@api_router.delete("/shift-presets/{preset_id}")
async def delete_shift_preset(
    preset_id: str,
    current_user: User = Depends(get_manager_or_admin_user)
):
    """Soft delete a shift preset"""
    preset = await db.shift_presets.find_one({"id": preset_id})
    if not preset:
        raise HTTPException(status_code=404, detail="Shift preset not found")
    
    # Soft delete by setting is_active to False
    await db.shift_presets.update_one(
        {"id": preset_id},
        {"$set": {
            "is_active": False,
            "updated_at": (await business_now_async()).isoformat()
        }}
    )
    
    return {"message": "Shift preset deleted successfully"}


# Helper function to get customer's full name
def get_customer_full_name(customer: dict) -> str:
    """Get the full name of a customer, handling both new and legacy data formats"""
    # Priority: first_name + last_name > name (legacy) > fallback
    first_name = customer.get('first_name', '').strip()
    last_name = customer.get('last_name', '').strip()
    
    if first_name and last_name:
        return f"{first_name} {last_name}"
    elif first_name:
        return first_name
    elif last_name:
        return last_name
    elif customer.get('name', '').strip():
        # Fallback to legacy name field
        return customer.get('name').strip()
    else:
        return 'Valued Customer'

# Customer Management Routes
@api_router.get("/customers")
async def get_customers(
    page: int = 1,
    limit: int = 20,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Get paginated list of customers with search functionality"""
    skip = (page - 1) * limit
    
    # Build query with search functionality
    query = {}
    if search:
        # Search across first_name, last_name, name (legacy), email, and pet names
        search_conditions = [
            {"first_name": {"$regex": search, "$options": "i"}},
            {"last_name": {"$regex": search, "$options": "i"}},
            {"name": {"$regex": search, "$options": "i"}},  # Legacy field
            {"email": {"$regex": search, "$options": "i"}},
            {"pets.name": {"$regex": search, "$options": "i"}}
        ]
        query["$or"] = search_conditions
    
    # Get total count for pagination
    total_count = await db.customers.count_documents(query)
    
    # Get customers with pagination, sorted by first_name then last_name
    customers_cursor = db.customers.find(query).sort([("first_name", 1), ("last_name", 1)]).skip(skip).limit(limit)
    customers = await customers_cursor.to_list(length=limit)
    
    # Convert to Customer objects
    customer_list = [Customer(**customer) for customer in customers]
    
    return {
        "customers": customer_list,
        "total": total_count,
        "page": page,
        "limit": limit,
        "total_pages": (total_count + limit - 1) // limit
    }


@api_router.post("/customers", response_model=Customer)
async def create_customer(
    customer_data: CustomerCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new customer"""
    now = await business_now_async()
    
    # Handle pets array and pet_name field conversion
    customer_dict = customer_data.dict()
    
    # Generate full name from first_name and last_name for backward compatibility
    if customer_dict.get('first_name') and customer_dict.get('last_name'):
        customer_dict['name'] = f"{customer_dict['first_name']} {customer_dict['last_name']}"
    
    # If pets array is provided, also create pet_name for backward compatibility
    if customer_dict.get('pets') and len(customer_dict['pets']) > 0:
        valid_pet_names = [pet['name'] for pet in customer_dict['pets'] if pet.get('name', '').strip()]
        if valid_pet_names:
            customer_dict['pet_name'] = ', '.join(valid_pet_names)
    
    # If pet_name is provided but no pets array, convert pet_name to pets array
    elif customer_dict.get('pet_name') and not customer_dict.get('pets'):
        pet_names = [name.strip() for name in customer_dict['pet_name'].split(',') if name.strip()]
        customer_dict['pets'] = [{'name': name} for name in pet_names]
    
    customer = Customer(
        **customer_dict,
        created_at=now,
        updated_at=now
    )
    
    customer_dict = customer.dict()
    await db.customers.insert_one(customer_dict)
    
    return customer


@api_router.get("/customers/{customer_id}", response_model=Customer)
async def get_customer(
    customer_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get a specific customer by ID"""
    customer = await db.customers.find_one({"id": customer_id})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    return Customer(**customer)


@api_router.put("/customers/{customer_id}", response_model=Customer)
async def update_customer(
    customer_id: str,
    customer_data: CustomerUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update a customer"""
    customer = await db.customers.find_one({"id": customer_id})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Update only provided fields
    update_data = {k: v for k, v in customer_data.dict().items() if v is not None}
    
    # Generate full name if first_name or last_name is being updated
    if 'first_name' in update_data or 'last_name' in update_data:
        current_first_name = customer.get('first_name', update_data.get('first_name', ''))
        current_last_name = customer.get('last_name', update_data.get('last_name', ''))
        
        # Use updated values if provided, otherwise use existing values
        first_name = update_data.get('first_name', current_first_name)
        last_name = update_data.get('last_name', current_last_name)
        
        if first_name and last_name:
            update_data['name'] = f"{first_name} {last_name}"
    
    # Handle pets array and pet_name field conversion
    if 'pets' in update_data and update_data['pets']:
        # If pets array is provided, also update pet_name for backward compatibility
        valid_pet_names = [pet['name'] for pet in update_data['pets'] if pet.get('name', '').strip()]
        if valid_pet_names:
            update_data['pet_name'] = ', '.join(valid_pet_names)
        else:
            update_data['pet_name'] = ''
    
    elif 'pet_name' in update_data and update_data['pet_name'] and 'pets' not in update_data:
        # If pet_name is provided but no pets array, convert pet_name to pets array
        pet_names = [name.strip() for name in update_data['pet_name'].split(',') if name.strip()]
        update_data['pets'] = [{'name': name} for name in pet_names]
    
    update_data["updated_at"] = await business_now_async()
    
    await db.customers.update_one(
        {"id": customer_id},
        {"$set": update_data}
    )
    
    updated_customer = await db.customers.find_one({"id": customer_id})
    return Customer(**updated_customer)


@api_router.delete("/customers/{customer_id}")
async def delete_customer(
    customer_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a customer"""
    customer = await db.customers.find_one({"id": customer_id})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    await db.customers.delete_one({"id": customer_id})
    return {"message": "Customer deleted successfully"}


@api_router.post("/customers/import")
async def import_customers_csv(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Import customers from CSV file"""
    import csv
    import io
    
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")
    
    # Read and decode the CSV file
    content = await file.read()
    decoded_content = content.decode('utf-8')
    csv_reader = csv.DictReader(io.StringIO(decoded_content))
    
    # Expected headers: name, pet_name, phone, email, sms_opt_in, email_subscribed
    expected_headers = {"name"}  # Required header
    optional_headers = {"pet_name", "phone", "email", "sms_opt_in", "email_subscribed"}
    
    # Validate headers
    headers = set(csv_reader.fieldnames or [])
    if not expected_headers.issubset(headers):
        raise HTTPException(
            status_code=400, 
            detail=f"CSV must contain required headers: {', '.join(expected_headers)}"
        )
    
    customers_to_insert = []
    errors = []
    now = await business_now_async()
    
    for row_num, row in enumerate(csv_reader, start=2):  # Start at 2 to account for header
        try:
            # Clean and validate data
            name = row.get('name', '').strip()
            if not name:
                errors.append(f"Row {row_num}: Name is required")
                continue
            
            pet_name = row.get('pet_name', '').strip() if row.get('pet_name') else None
            phone = row.get('phone', '').strip() if row.get('phone') else None
            email = row.get('email', '').strip() if row.get('email') else None
            
            # Parse boolean fields with defaults
            sms_opt_in = True  # Default
            if 'sms_opt_in' in row:
                sms_value = row['sms_opt_in'].strip().lower()
                sms_opt_in = sms_value not in ['false', 'no', '0', 'n']
            
            email_subscribed = True  # Default
            if 'email_subscribed' in row:
                email_value = row['email_subscribed'].strip().lower()
                email_subscribed = email_value not in ['false', 'no', '0', 'n']
            
            customer = Customer(
                name=name,
                pet_name=pet_name,
                phone=phone,
                email=email,
                sms_opt_in=sms_opt_in,
                email_subscribed=email_subscribed,
                created_at=now,
                updated_at=now
            )
            
            customers_to_insert.append(customer.dict())
            
        except Exception as e:
            errors.append(f"Row {row_num}: {str(e)}")
    
    # Insert valid customers
    imported_count = 0
    if customers_to_insert:
        await db.customers.insert_many(customers_to_insert)
        imported_count = len(customers_to_insert)
    
    return {
        "message": f"Successfully imported {imported_count} customers",
        "imported_count": imported_count,
        "error_count": len(errors),
        "errors": errors[:10]  # Limit errors returned to first 10
    }


# CMS Settings Management Routes
@api_router.get("/cms-settings", response_model=CMSSettings)
async def get_cms_settings(current_user: User = Depends(get_current_user)):
    """Get CMS settings (Admin only)"""
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Access denied. Admin privileges required.")
    
    # Get existing settings or create default if none exist
    settings = await db.cms_settings.find_one()
    if not settings:
        # Create default settings
        default_settings = CMSSettings(updated_by=current_user.email)
        settings_dict = default_settings.dict()
        await db.cms_settings.insert_one(settings_dict)
        return default_settings
    
    return CMSSettings(**settings)


@api_router.put("/cms-settings", response_model=CMSSettings)
async def update_cms_settings(
    settings_data: CMSSettingsUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update CMS settings (Admin only)"""
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Access denied. Admin privileges required.")
    
    # Get existing settings or create default
    existing_settings = await db.cms_settings.find_one()
    if not existing_settings:
        # Create new settings if none exist
        new_settings = CMSSettings(
            **settings_data.dict(exclude_unset=True),
            updated_by=current_user.email
        )
        settings_dict = new_settings.dict()
        await db.cms_settings.insert_one(settings_dict)
        return new_settings
    
    # Update existing settings
    update_data = settings_data.dict(exclude_unset=True)
    update_data["updated_at"] = await business_now_async()
    update_data["updated_by"] = current_user.email
    
    await db.cms_settings.update_one(
        {"id": existing_settings["id"]},
        {"$set": update_data}
    )
    
    updated_settings = await db.cms_settings.find_one({"id": existing_settings["id"]})
    return CMSSettings(**updated_settings)


@api_router.get("/cms-settings/public")
async def get_public_cms_settings():
    """Get public CMS settings (accessible to all authenticated users)"""
    settings = await db.cms_settings.find_one()
    if not settings:
        # Return default settings if none exist
        return {
            "google_sync_enabled": True,
            "google_business_sync_enabled": True,
            "google_calendar_sync_enabled": True
        }
    
    return {
        "google_sync_enabled": settings.get("google_sync_enabled", True),
        "google_business_sync_enabled": settings.get("google_business_sync_enabled", True),
        "google_calendar_sync_enabled": settings.get("google_calendar_sync_enabled", True)
    }


# Holiday Management Routes
@api_router.get("/holidays")
async def get_holidays(current_user: User = Depends(get_current_user)):
    """Get all holidays"""
    holidays = await db.holidays.find().sort("month_day", 1).to_list(length=None)
    return [Holiday(**holiday) for holiday in holidays]


@api_router.post("/holidays", response_model=Holiday)
async def create_holiday(
    holiday_data: HolidayCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new holiday (Admin/Manager only)"""
    if current_user.role not in ['admin', 'manager']:
        raise HTTPException(status_code=403, detail="Access denied. Admin or Manager privileges required.")
    
    holiday = Holiday(**holiday_data.dict())
    holiday_dict = holiday.dict()
    await db.holidays.insert_one(holiday_dict)
    return holiday


@api_router.put("/holidays/{holiday_id}", response_model=Holiday)
async def update_holiday(
    holiday_id: str,
    holiday_data: HolidayUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update a holiday (Admin/Manager only)"""
    if current_user.role not in ['admin', 'manager']:
        raise HTTPException(status_code=403, detail="Access denied. Admin or Manager privileges required.")
    
    holiday = await db.holidays.find_one({"id": holiday_id})
    if not holiday:
        raise HTTPException(status_code=404, detail="Holiday not found")
    
    update_data = holiday_data.dict(exclude_unset=True)
    update_data["updated_at"] = await business_now_async()
    
    await db.holidays.update_one(
        {"id": holiday_id},
        {"$set": update_data}
    )
    
    updated_holiday = await db.holidays.find_one({"id": holiday_id})
    return Holiday(**updated_holiday)


@api_router.delete("/holidays/{holiday_id}")
async def delete_holiday(
    holiday_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a holiday (Admin only)"""
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Access denied. Admin privileges required.")
    
    holiday = await db.holidays.find_one({"id": holiday_id})
    if not holiday:
        raise HTTPException(status_code=404, detail="Holiday not found")
    
    await db.holidays.delete_one({"id": holiday_id})
    return {"message": "Holiday deleted successfully"}


@api_router.get("/holidays/enabled")
async def get_enabled_holidays(current_user: User = Depends(get_current_user)):
    """Get enabled holidays for agent scheduling"""
    holidays = await db.holidays.find({"is_enabled": True}).sort("month_day", 1).to_list(length=None)
    return [Holiday(**holiday) for holiday in holidays]


# Initialize default holidays
@api_router.post("/holidays/initialize-defaults")
async def initialize_default_holidays(current_user: User = Depends(get_current_user)):
    """Initialize default holidays (Admin only)"""
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Access denied. Admin privileges required.")
    
    # Check if holidays already exist
    existing_count = await db.holidays.count_documents({})
    if existing_count > 0:
        return {"message": "Holidays already initialized", "count": existing_count}
    
    default_holidays = [
        # Major Holidays - 2025
        {"name": "New Year's Day 2025", "month_day": "01-01", "date": "2025-01-01", "category": "general"},
        {"name": "Martin Luther King Jr. Day 2025", "month_day": "01-20", "date": "2025-01-20", "category": "general"},
        {"name": "Valentine's Day 2025", "month_day": "02-14", "date": "2025-02-14", "category": "general"},
        {"name": "Presidents' Day 2025", "month_day": "02-17", "date": "2025-02-17", "category": "general"},
        {"name": "Easter Sunday 2025", "month_day": "04-20", "date": "2025-04-20", "category": "general"},
        {"name": "Mother's Day 2025", "month_day": "05-11", "date": "2025-05-11", "category": "family"},
        {"name": "Memorial Day 2025", "month_day": "05-26", "date": "2025-05-26", "category": "general"},
        {"name": "Father's Day 2025", "month_day": "06-15", "date": "2025-06-15", "category": "family"},
        {"name": "Independence Day 2025", "month_day": "07-04", "date": "2025-07-04", "category": "general"},
        {"name": "Labor Day 2025", "month_day": "09-01", "date": "2025-09-01", "category": "general"},
        {"name": "Columbus Day 2025", "month_day": "10-13", "date": "2025-10-13", "category": "general"},
        {"name": "Halloween 2025", "month_day": "10-31", "date": "2025-10-31", "category": "general"},
        {"name": "Veterans Day 2025", "month_day": "11-11", "date": "2025-11-11", "category": "general"},
        {"name": "Thanksgiving 2025", "month_day": "11-27", "date": "2025-11-27", "category": "general"},
        {"name": "Christmas Day 2025", "month_day": "12-25", "date": "2025-12-25", "category": "general"},
        
        # Major Holidays - 2026
        {"name": "New Year's Day 2026", "month_day": "01-01", "date": "2026-01-01", "category": "general"},
        {"name": "Martin Luther King Jr. Day 2026", "month_day": "01-19", "date": "2026-01-19", "category": "general"},
        {"name": "Valentine's Day 2026", "month_day": "02-14", "date": "2026-02-14", "category": "general"},
        {"name": "Presidents' Day 2026", "month_day": "02-16", "date": "2026-02-16", "category": "general"},
        {"name": "Easter Sunday 2026", "month_day": "04-05", "date": "2026-04-05", "category": "general"},
        {"name": "Mother's Day 2026", "month_day": "05-10", "date": "2026-05-10", "category": "family"},
        {"name": "Memorial Day 2026", "month_day": "05-25", "date": "2026-05-25", "category": "general"},
        {"name": "Father's Day 2026", "month_day": "06-21", "date": "2026-06-21", "category": "family"},
        {"name": "Independence Day 2026", "month_day": "07-04", "date": "2026-07-04", "category": "general"},
        {"name": "Labor Day 2026", "month_day": "09-07", "date": "2026-09-07", "category": "general"},
        {"name": "Columbus Day 2026", "month_day": "10-12", "date": "2026-10-12", "category": "general"},
        {"name": "Halloween 2026", "month_day": "10-31", "date": "2026-10-31", "category": "general"},
        {"name": "Veterans Day 2026", "month_day": "11-11", "date": "2026-11-11", "category": "general"},
        {"name": "Thanksgiving 2026", "month_day": "11-26", "date": "2026-11-26", "category": "general"},
        {"name": "Christmas Day 2026", "month_day": "12-25", "date": "2026-12-25", "category": "general"},
        
        # Pet-Related Days - 2025
        {"name": "National Puppy Day 2025", "month_day": "03-23", "date": "2025-03-23", "category": "pet"},
        {"name": "National Pet Day 2025", "month_day": "04-11", "date": "2025-04-11", "category": "pet"},
        {"name": "National Dog Day 2025", "month_day": "08-26", "date": "2025-08-26", "category": "pet"},
        {"name": "World Animal Day 2025", "month_day": "10-04", "date": "2025-10-04", "category": "pet"},
        {"name": "National Cat Day 2025", "month_day": "10-29", "date": "2025-10-29", "category": "pet"},
        
        # Pet-Related Days - 2026
        {"name": "National Puppy Day 2026", "month_day": "03-23", "date": "2026-03-23", "category": "pet"},
        {"name": "National Pet Day 2026", "month_day": "04-11", "date": "2026-04-11", "category": "pet"},
        {"name": "National Dog Day 2026", "month_day": "08-26", "date": "2026-08-26", "category": "pet"},
        {"name": "World Animal Day 2026", "month_day": "10-04", "date": "2026-10-04", "category": "pet"},
        {"name": "National Cat Day 2026", "month_day": "10-29", "date": "2026-10-29", "category": "pet"},
        
        # Veterinary Days - 2025
        {"name": "World Veterinary Day 2025", "month_day": "04-26", "date": "2025-04-26", "category": "veterinary"},
        {"name": "National Veterinary Technician Week 2025", "month_day": "10-12", "date": "2025-10-12", "category": "veterinary"},
        
        # Veterinary Days - 2026
        {"name": "World Veterinary Day 2026", "month_day": "04-25", "date": "2026-04-25", "category": "veterinary"},
        {"name": "National Veterinary Technician Week 2026", "month_day": "10-11", "date": "2026-10-11", "category": "veterinary"},
    ]
    
    holiday_objects = []
    now = await business_now_async()
    
    for holiday_data in default_holidays:
        holiday = Holiday(
            **holiday_data,
            is_recurring=True,
            is_enabled=True,
            created_at=now,
            updated_at=now
        )
        holiday_objects.append(holiday.dict())
    
    await db.holidays.insert_many(holiday_objects)
    
    return {"message": f"Successfully initialized {len(holiday_objects)} default holidays", "count": len(holiday_objects)}


# Reset and reinitialize holidays with updated dates
@api_router.post("/holidays/reset-and-initialize")
async def reset_and_initialize_holidays(current_user: User = Depends(get_current_user)):
    """Reset existing holidays and initialize with updated 2025/2026 dates (Admin only)"""
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Access denied. Admin privileges required.")
    
    # Delete all existing holidays
    delete_result = await db.holidays.delete_many({})
    deleted_count = delete_result.deleted_count
    
    # Initialize new holidays with updated dates
    default_holidays = [
        # Major Holidays - 2025
        {"name": "New Year's Day 2025", "month_day": "01-01", "date": "2025-01-01", "category": "general"},
        {"name": "Martin Luther King Jr. Day 2025", "month_day": "01-20", "date": "2025-01-20", "category": "general"},
        {"name": "Valentine's Day 2025", "month_day": "02-14", "date": "2025-02-14", "category": "general"},
        {"name": "Presidents' Day 2025", "month_day": "02-17", "date": "2025-02-17", "category": "general"},
        {"name": "Easter Sunday 2025", "month_day": "04-20", "date": "2025-04-20", "category": "general"},
        {"name": "Mother's Day 2025", "month_day": "05-11", "date": "2025-05-11", "category": "family"},
        {"name": "Memorial Day 2025", "month_day": "05-26", "date": "2025-05-26", "category": "general"},
        {"name": "Father's Day 2025", "month_day": "06-15", "date": "2025-06-15", "category": "family"},
        {"name": "Independence Day 2025", "month_day": "07-04", "date": "2025-07-04", "category": "general"},
        {"name": "Labor Day 2025", "month_day": "09-01", "date": "2025-09-01", "category": "general"},
        {"name": "Columbus Day 2025", "month_day": "10-13", "date": "2025-10-13", "category": "general"},
        {"name": "Halloween 2025", "month_day": "10-31", "date": "2025-10-31", "category": "general"},
        {"name": "Veterans Day 2025", "month_day": "11-11", "date": "2025-11-11", "category": "general"},
        {"name": "Thanksgiving 2025", "month_day": "11-27", "date": "2025-11-27", "category": "general"},
        {"name": "Christmas Day 2025", "month_day": "12-25", "date": "2025-12-25", "category": "general"},
        
        # Major Holidays - 2026
        {"name": "New Year's Day 2026", "month_day": "01-01", "date": "2026-01-01", "category": "general"},
        {"name": "Martin Luther King Jr. Day 2026", "month_day": "01-19", "date": "2026-01-19", "category": "general"},
        {"name": "Valentine's Day 2026", "month_day": "02-14", "date": "2026-02-14", "category": "general"},
        {"name": "Presidents' Day 2026", "month_day": "02-16", "date": "2026-02-16", "category": "general"},
        {"name": "Easter Sunday 2026", "month_day": "04-05", "date": "2026-04-05", "category": "general"},
        {"name": "Mother's Day 2026", "month_day": "05-10", "date": "2026-05-10", "category": "family"},
        {"name": "Memorial Day 2026", "month_day": "05-25", "date": "2026-05-25", "category": "general"},
        {"name": "Father's Day 2026", "month_day": "06-21", "date": "2026-06-21", "category": "family"},
        {"name": "Independence Day 2026", "month_day": "07-04", "date": "2026-07-04", "category": "general"},
        {"name": "Labor Day 2026", "month_day": "09-07", "date": "2026-09-07", "category": "general"},
        {"name": "Columbus Day 2026", "month_day": "10-12", "date": "2026-10-12", "category": "general"},
        {"name": "Halloween 2026", "month_day": "10-31", "date": "2026-10-31", "category": "general"},
        {"name": "Veterans Day 2026", "month_day": "11-11", "date": "2026-11-11", "category": "general"},
        {"name": "Thanksgiving 2026", "month_day": "11-26", "date": "2026-11-26", "category": "general"},
        {"name": "Christmas Day 2026", "month_day": "12-25", "date": "2026-12-25", "category": "general"},
        
        # Pet-Related Days - 2025
        {"name": "National Puppy Day 2025", "month_day": "03-23", "date": "2025-03-23", "category": "pet"},
        {"name": "National Pet Day 2025", "month_day": "04-11", "date": "2025-04-11", "category": "pet"},
        {"name": "National Dog Day 2025", "month_day": "08-26", "date": "2025-08-26", "category": "pet"},
        {"name": "World Animal Day 2025", "month_day": "10-04", "date": "2025-10-04", "category": "pet"},
        {"name": "National Cat Day 2025", "month_day": "10-29", "date": "2025-10-29", "category": "pet"},
        
        # Pet-Related Days - 2026
        {"name": "National Puppy Day 2026", "month_day": "03-23", "date": "2026-03-23", "category": "pet"},
        {"name": "National Pet Day 2026", "month_day": "04-11", "date": "2026-04-11", "category": "pet"},
        {"name": "National Dog Day 2026", "month_day": "08-26", "date": "2026-08-26", "category": "pet"},
        {"name": "World Animal Day 2026", "month_day": "10-04", "date": "2026-10-04", "category": "pet"},
        {"name": "National Cat Day 2026", "month_day": "10-29", "date": "2026-10-29", "category": "pet"},
        
        # Veterinary Days - 2025
        {"name": "World Veterinary Day 2025", "month_day": "04-26", "date": "2025-04-26", "category": "veterinary"},
        {"name": "National Veterinary Technician Week 2025", "month_day": "10-12", "date": "2025-10-12", "category": "veterinary"},
        
        # Veterinary Days - 2026
        {"name": "World Veterinary Day 2026", "month_day": "04-25", "date": "2026-04-25", "category": "veterinary"},
        {"name": "National Veterinary Technician Week 2026", "month_day": "10-11", "date": "2026-10-11", "category": "veterinary"},
    ]
    
    holiday_objects = []
    now = await business_now_async()
    
    for holiday_data in default_holidays:
        holiday = Holiday(
            name=holiday_data["name"],
            date=holiday_data["date"],
            month_day=holiday_data["month_day"],
            is_recurring=True,
            is_enabled=True,
            category=holiday_data["category"],
            created_at=now
        )
        holiday_objects.append(holiday.dict())
    
    await db.holidays.insert_many(holiday_objects)
    
    return {
        "message": f"Successfully reset and initialized holidays", 
        "deleted_count": deleted_count,
        "created_count": len(holiday_objects)
    }


# Smart refresh holidays based on current date
@api_router.post("/holidays/refresh-dates")
async def refresh_holiday_dates(current_user: User = Depends(get_current_user)):
    """Refresh holiday dates based on current date - move passed holidays to next year (Admin/Manager only)"""
    if current_user.role not in ['admin', 'manager']:
        raise HTTPException(status_code=403, detail="Access denied. Admin or Manager privileges required.")
    
    # Get current date
    current_date = datetime.now().date()
    current_year = current_date.year
    next_year = current_year + 1
    
    # Fetch all holidays
    holidays = await db.holidays.find({}).to_list(length=None)
    
    if not holidays:
        raise HTTPException(status_code=404, detail="No holidays found to refresh")
    
    updated_count = 0
    errors = []
    
    for holiday in holidays:
        try:
            # Parse the current holiday date
            holiday_date = datetime.strptime(holiday['date'], '%Y-%m-%d').date()
            month_day = holiday.get('month_day', holiday_date.strftime('%m-%d'))
            
            # Check if holiday has passed this year
            holiday_this_year = datetime.strptime(f"{current_year}-{month_day}", '%Y-%m-%d').date()
            
            new_date = None
            new_name = holiday['name']
            
            if holiday_this_year < current_date:
                # Holiday has passed, move to next year
                new_date = datetime.strptime(f"{next_year}-{month_day}", '%Y-%m-%d').date()
                # Update name to reflect new year if it contains a year
                if str(current_year) in new_name:
                    new_name = new_name.replace(str(current_year), str(next_year))
                elif str(current_year - 1) in new_name:
                    new_name = new_name.replace(str(current_year - 1), str(next_year))
                elif not any(year_str in new_name for year_str in [str(y) for y in range(2020, 2030)]):
                    # Add year if no year is present
                    new_name = f"{new_name} {next_year}"
            else:
                # Holiday hasn't passed, keep in current year but update if year is wrong
                new_date = holiday_this_year
                if str(current_year - 1) in new_name:
                    new_name = new_name.replace(str(current_year - 1), str(current_year))
                elif str(current_year + 1) in new_name:
                    new_name = new_name.replace(str(current_year + 1), str(current_year))
                elif not any(year_str in new_name for year_str in [str(y) for y in range(2020, 2030)]):
                    # Add year if no year is present
                    new_name = f"{new_name} {current_year}"
            
            # Update the holiday if date or name changed
            if new_date and (new_date.strftime('%Y-%m-%d') != holiday['date'] or new_name != holiday['name']):
                await db.holidays.update_one(
                    {"_id": holiday['_id']},
                    {
                        "$set": {
                            "name": new_name,
                            "date": new_date.strftime('%Y-%m-%d'),
                            "month_day": new_date.strftime('%m-%d')
                        }
                    }
                )
                updated_count += 1
                
        except Exception as e:
            errors.append(f"Error updating {holiday.get('name', 'Unknown')}: {str(e)}")
    
    result = {
        "message": f"Successfully refreshed holiday dates",
        "updated_count": updated_count,
        "total_holidays": len(holidays),
        "current_date": current_date.strftime('%Y-%m-%d')
    }
    
    if errors:
        result["errors"] = errors
    
    return result


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