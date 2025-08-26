export interface User {
  id: number;
  username: string;
  email: string;
  user_type: 'manager' | 'receptionist' | 'department_staff';
  phone_number?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserCreateRequest {
  username: string;
  email: string;
  password: string;
  user_type: 'manager' | 'receptionist' | 'department_staff';
  phone_number?: string;
}

export interface UserUpdateRequest {
  username?: string;
  email?: string;
  password?: string;
  user_type?: 'manager' | 'receptionist' | 'department_staff';
  phone_number?: string;
  is_active?: boolean;
}