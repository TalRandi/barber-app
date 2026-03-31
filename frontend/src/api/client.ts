import axios from 'axios';
import type { ApiResponse, Appointment, AppointmentFormData, AvailableSlotsResponse, BusinessSettings, LoginResponse } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post<ApiResponse<LoginResponse>>('/auth/login', { email, password });
  return data.data;
}

export async function getMe() {
  const { data } = await api.get<ApiResponse<{ id: string; email: string; name: string; role: string }>>('/auth/me');
  return data.data;
}

// Appointments
export async function getAppointments(params: { date?: string; weekOf?: string } = {}): Promise<Appointment[]> {
  const { data } = await api.get<ApiResponse<Appointment[]>>('/appointments', { params });
  return data.data;
}

export async function getAppointment(id: string): Promise<Appointment> {
  const { data } = await api.get<ApiResponse<Appointment>>(`/appointments/${encodeURIComponent(id)}`);
  return data.data;
}

export async function createAppointment(body: AppointmentFormData): Promise<Appointment> {
  const { data } = await api.post<ApiResponse<Appointment>>('/appointments', body);
  return data.data;
}

export async function updateAppointment(id: string, body: Partial<AppointmentFormData> & { status?: string }): Promise<Appointment> {
  const { data } = await api.put<ApiResponse<Appointment>>(`/appointments/${encodeURIComponent(id)}`, body);
  return data.data;
}

export async function deleteAppointment(id: string): Promise<void> {
  await api.delete(`/appointments/${encodeURIComponent(id)}`);
}

// Schedule
export async function getAvailableSlots(date: string): Promise<AvailableSlotsResponse> {
  const { data } = await api.get<ApiResponse<AvailableSlotsResponse>>('/schedule/available-slots', { params: { date } });
  return data.data;
}

// Settings
export async function getSettings(): Promise<BusinessSettings> {
  const { data } = await api.get<ApiResponse<BusinessSettings>>('/settings');
  return data.data;
}

export async function updateSettings(body: Partial<BusinessSettings>): Promise<BusinessSettings> {
  const { data } = await api.put<ApiResponse<BusinessSettings>>('/settings', body);
  return data.data;
}

// Public Booking (no auth required)
export async function getPublicAvailableSlots(date: string): Promise<AvailableSlotsResponse> {
  const { data } = await api.get<ApiResponse<AvailableSlotsResponse>>('/booking/available-slots', { params: { date } });
  return data.data;
}

export async function createPublicBooking(body: AppointmentFormData): Promise<Appointment> {
  const { data } = await api.post<ApiResponse<Appointment>>('/booking', body);
  return data.data;
}

export default api;
