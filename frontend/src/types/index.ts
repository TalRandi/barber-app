export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface Appointment {
  id: string;
  customerName: string;
  phone: string;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string | null;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
}

export type AppointmentStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface AppointmentFormData {
  customerName: string;
  phone: string;
  date: string;
  startTime: string;
  notes?: string;
}

export interface BusinessSettings {
  id: string;
  openTime: string;
  closeTime: string;
  slotDuration: number;
  workingDays: number[];
  breakStartTime?: string | null;
  breakEndTime?: string | null;
}

export interface AvailableSlotsResponse {
  date: string;
  slots: string[];
  isWorkingDay: boolean;
  openTime?: string;
  closeTime?: string;
  slotDuration?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}
