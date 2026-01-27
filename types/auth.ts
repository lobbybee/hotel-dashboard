export interface LoginRequest {
    username?: string;
    password?: string;
}

export interface RefreshRequest {
    refresh: string;
}

export interface TokenResponse {
    access: string;
    refresh: string;
    user?: User;
}

export interface PasswordResetRequest {
    email: string;
}

export interface PasswordResetConfirm {
    email: string;
    otp: string;
    new_password: string;
}

export enum UserType {
    PLATFORM_ADMIN = 'platform_admin',
    PLATFORM_STAFF = 'platform_staff',
    HOTEL_ADMIN = 'hotel_admin',
    MANAGER = 'manager',
    RECEPTIONIST = 'receptionist',
    DEPARTMENT_STAFF = 'department_staff',
    OTHER_STAFF = 'other_staff',
}

export interface Department {
    id: number;
    name: string;
    // Add other department fields as needed
}


export interface User {
    id: number;
    username: string;
    email: string;
    user_type: UserType | string;
    phone_number?: string;
    password?: string; // Only for creation/update
    hotel?: string; // ID or key
    hotel_id?: string | null; // Hotel ID for API responses
    hotel_name?: string | null; // Hotel name for display
    first_name?: string;
    last_name?: string;
    created_by?: string;
    is_active_hotel_user?: boolean;
    is_verified?: boolean;
    department?: any; // The spec says json/object, could be specific type if known
}

