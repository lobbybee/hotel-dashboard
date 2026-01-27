import { z } from 'zod';

export const HotelSchema = z.object({
    name: z.string().min(3, 'Hotel name must be at least 3 characters').max(200),
    description: z.string().optional(),
    address: z.string().min(5, 'Address is required'),
    city: z.string().min(2, 'City is required').max(100),
    state: z.string().min(2, 'State is required').max(100),
    country: z.string().min(2, 'Country is required').max(100),
    pincode: z.string().min(5, 'Valid pincode is required').max(10),
    phone: z.string().min(10, 'Valid phone number is required').max(15),
    email: z.string().email('Invalid email address'),
    check_in_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
    time_zone: z.string().min(2, 'Time zone is required').max(50),
    google_review_link: z.string().url('Invalid URL').optional().or(z.literal('')),
    breakfast_reminder: z.boolean().optional(),
    dinner_reminder: z.boolean().optional(),
});

export const HotelDocumentSchema = z.object({
    document_type: z.enum(['gst', 'pan', 'tan', 'other']), // Adjust enums as per actual spec if known
    document_file: z.any().refine((file) => file instanceof File, 'File is required'),
});
