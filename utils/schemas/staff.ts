import { z } from 'zod';

export const StaffSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters').max(150),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters').optional(),
    user_type: z.enum(['manager', 'receptionist', 'department_staff', 'other_staff']),
    phone_number: z.string().min(10, 'Valid phone number required').optional().or(z.literal('')),
    department: z.array(z.string()).optional(),
});

export const StaffUpdateSchema = StaffSchema.partial().extend({
    id: z.number().or(z.string()),
    is_active_hotel_user: z.boolean().optional(),
});
