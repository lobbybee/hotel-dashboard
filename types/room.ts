export enum RoomStatus {
    AVAILABLE = 'available',
    OCCUPIED = 'occupied',
    MAINTENANCE = 'maintenance',
    CLEANING = 'cleaning',
    BOOKED = 'booked',
}

export interface RoomCategory {
    id: number;
    name: string;
    room_count?: string;
    description?: string;
    base_price: string;
    max_occupancy: number;
    amenities?: Record<string, any>;
    created_at?: string;
    hotel?: string;
}

export interface Room {
    id: number;
    status_display?: string;
    room_number: string;
    floor: number;
    status?: RoomStatus | string;
    created_at?: string;
    updated_at?: string;
    hotel?: string;
    category: number | string; // ID or name depending on context, usually ID in input, name/obj in output? Spec says "category*: string" often ID in POST.
    current_guest?: string; // name
}

export interface RoomCreate extends Omit<Room, 'id' | 'status_display' | 'created_at' | 'updated_at' | 'current_guest'> {
    // category is required
}

export interface RoomUpdate extends Partial<RoomCreate> {
    id: number;
}

export interface WifiCredential {
    id: string;
    hotel?: string;
    floor: number;
    room_category?: string | null;
    room_category_name?: string;
    network_name: string;
    password: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}
