export enum HotelStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    // Add other statuses if defined in enum
}

export interface HotelDocument {
    id?: string;
    hotel?: string;
    document_type: string; // enum
    document_file: File | string; // File for upload, string URL for view
    document_file_url?: string;
    uploaded_at?: string; // ISO datetime
}

export interface Hotel {
    id: string;
    name: string;
    description?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
    phone?: string;
    email?: string;
    google_review_link?: string;
    latitude?: string;
    longitude?: string;
    qr_code_url?: string;
    unique_qr_code?: string;
    check_in_time?: string;
    time_zone?: string;
    breakfast_reminder?: boolean;
    dinner_reminder?: boolean;
    status?: HotelStatus | string;
    is_verified?: boolean;
    is_active?: boolean;
    is_demo?: boolean;
    verification_notes?: string;
    registration_date?: string; // ISO datetime
    verified_at?: string; // ISO datetime
    updated_at?: string; // ISO datetime
    admin?: string;
    documents?: HotelDocument[];
}

export interface HotelCreate extends Omit<Hotel, 'id' | 'documents' | 'created_at' | 'updated_at'> {
    documents?: HotelDocument[]; // Can be uploaded during creation? Spec says so.
}

export interface HotelUpdate extends Partial<HotelCreate> {
    id: string;
}
