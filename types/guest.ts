export interface Guest {
    id?: number;
    full_name: string;
    whatsapp_number?: string;
    email?: string;
    document_type?: string;
    document_number?: string;
    // Add other guest fields from API spec if any
}

export interface PrimaryGuestData {
    full_name: string;
    whatsapp_number: string;
    email?: string;
    document_type?: string;
    document_number?: string;
}

export interface AccompanyingGuestData {
    full_name: string;
    document_type?: string;
    document_number?: string;
}

export interface CreateGuestData {
    primary_guest: PrimaryGuestData;
    accompanying_guests?: AccompanyingGuestData[];
    documents?: FormData; // For upload
}

export interface CheckinOfflineData {
    primary_guest_id: number;
    room_ids: number[];
    check_in_date: string; // ISO datetime
    check_out_date: string; // ISO datetime
    guest_names?: string[];
}

export interface VerifyCheckinData {
    register_number?: string;
    room_id?: number; // For room assignment or changes during verification
    check_out_date?: string; // ISO datetime string for stays without room assignments
    guest_updates?: {
        full_name?: string;
        email?: string;
        date_of_birth?: string;
        nationality?: string;
        preferred_language?: string;
        notes?: string;
        hours_24?: boolean;
        breakfast_reminder?: boolean;
        dinner_reminder?: boolean;
    };
}

export interface Stay {
    id: number;
    // Add stay fields
}

