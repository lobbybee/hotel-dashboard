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
    billing_cycle?: BillingCycle;
}

// Length of one billable unit. Each unit bills at the full room rate, so a 24h
// stay on a 12h cycle is 2 units.
export type BillingCycle = '24h' | '12h';

export interface VerifyCheckinData {
    register_number?: string;
    room_ids?: number[]; // For assigning multiple rooms during verification
    check_out_date?: string; // ISO datetime string for stays without room assignments
    billing_cycle?: BillingCycle; // omit to keep the stay's current cycle
    breakfast_reminder?: boolean;
    lunch_reminder?: boolean;
    dinner_reminder?: boolean;
    guest_updates?: {
        full_name?: string;
        email?: string;
        date_of_birth?: string;
        nationality?: string;
        preferred_language?: string;
        notes?: string;
        breakfast_reminder?: boolean;
        lunch_reminder?: boolean;
        dinner_reminder?: boolean;
    };
}

export interface Stay {
    id: number;
    // Add stay fields
}
