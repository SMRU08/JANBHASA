"""Pydantic models for Users, Teachers, Students, Admins"""
from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from enum import Enum


class Role(str, Enum):
    admin = "admin"
    teacher = "teacher"
    student = "student"
    parent = "parent"


class UserStatus(str, Enum):
    active = "active"
    pending = "pending"
    locked = "locked"
    inactive = "inactive"


class UserBase(BaseModel):
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    selected_language: str = "hi"


class UserCreate(UserBase):
    password: str
    role: Role
    recovery_pin: Optional[str] = None

    @field_validator("password")
    @classmethod
    def password_strength(cls, v):
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v


class UserOut(UserBase):
    id: int
    role: Role
    status: UserStatus
    created_at: str
    last_login: Optional[str] = None

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    identifier: str  # email, phone, or student_code
    password: str
    role: Role


class LoginResponse(BaseModel):
    success: bool
    user: Optional[UserOut] = None
    token: Optional[str] = None
    message: str = ""


class TeacherRegisterRequest(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    school_name: str
    password: str
    recovery_pin: str
    classes_taught: Optional[str] = None
    subject: Optional[str] = None
    qualification: Optional[str] = None


class TeacherProfile(BaseModel):
    id: int
    user_id: int
    name: str
    email: Optional[str]
    phone: Optional[str]
    school_id: Optional[int]
    school_name: Optional[str]
    verification_status: str
    selected_language: str
    created_at: str


class StudentProfile(BaseModel):
    id: int
    user_id: int
    name: str
    student_code: str
    class_id: Optional[int]
    class_name: Optional[str]
    school_name: Optional[str]
    selected_language: str
    total_xp: int = 0
    level: int = 1
    current_streak: int = 0


class PasswordRecoveryRequest(BaseModel):
    identifier: str
    recovery_pin: str
    new_password: str


class AccountRecoveryAdminRequest(BaseModel):
    user_id: int
    action: str  # "reset_password", "unlock", "lock", "generate_pin"
    new_password: Optional[str] = None
    notes: Optional[str] = None
