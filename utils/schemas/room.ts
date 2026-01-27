import { z } from 'zod';

export const RoomSchema = z.object({
    room_number: z.string().min(1, 'Room number is required'),
    category: z.number().min(1, 'Category is required'),
    floor: z.number().optional(),
    description: z.string().optional(),
    status: z.enum(['available', 'occupied', 'maintenance', 'cleaning']).optional(),
});

export const RoomCreateSchema = RoomSchema;

export const RoomUpdateSchema = RoomSchema.partial().extend({
    id: z.number().optional(),
});

export const RoomCategorySchema = z.object({
    name: z.string().min(1, 'Category name is required').max(100),
    description: z.string().optional(),
    base_price: z.number().positive('Price must be positive').optional(),
    max_occupancy: z.number().positive().optional(),
});

export const WifiCredentialSchema = z.object({
    network_name: z.string().min(1, 'Network name is required'),
    password: z.string().min(1, 'Password is required'),
    floor: z.number().optional(),
    room_category: z.string().optional(),
    is_active: z.boolean().optional(),
});
