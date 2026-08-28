import { apiRequest, ApiResult } from './apiClient';
import { AuthUser, UserRole } from '../store/authStore';

export async function login(identifier: string, password: string, role: UserRole): Promise<ApiResult<AuthUser>> {
  return apiRequest<AuthUser>('/api/auth/login', {
    method: 'POST',
    body: { identifier, password, role },
  });
}

export async function registerTeacher(data: {
  name: string; phone: string; email?: string; school_name: string;
  password: string; recovery_pin: string; qualification?: string;
}): Promise<ApiResult> {
  return apiRequest('/api/auth/register/teacher', { method: 'POST', body: data });
}

export async function registerStudent(data: {
  name: string; student_code: string; class_id?: number; password?: string; recovery_pin?: string;
}): Promise<ApiResult> {
  return apiRequest('/api/auth/register/student', { method: 'POST', body: data });
}

export async function recoverPassword(identifier: string, recoveryPin: string, newPassword: string): Promise<ApiResult> {
  return apiRequest('/api/auth/recover', {
    method: 'POST',
    body: { identifier, recovery_pin: recoveryPin, new_password: newPassword },
  });
}

export async function updateLanguage(userId: number, language: string): Promise<ApiResult> {
  return apiRequest(`/api/auth/update-language?user_id=${userId}&language=${language}`, { method: 'PUT' });
}
