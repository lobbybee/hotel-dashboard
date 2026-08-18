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
    // Reads flatten the FK to {id, name} (see RoomSerializer.to_representation);
    // writes take the bare id, hence the override on RoomCreate below.
    category: { id: number; name: string };
    current_guest?: string; // name
}

export interface RoomCreate extends Omit<Room, 'id' | 'status_display' | 'created_at' | 'updated_at' | 'current_guest' | 'category'> {
    category: number;
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
