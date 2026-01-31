import { z } from 'zod';

export const GuestSchema = z.object({
    full_name: z.string().min(2, 'Name must be at least 2 characters'),
    whatsapp_number: z.string().min(10, 'Valid phone number is required'),
    email: z.string().email().optional().or(z.literal('')),
    document_type: z.string().optional(),
    document_number: z.string().optional(),
});

export const PrimaryGuestSchema = z.object({
    full_name: z.string().min(2, 'Name must be at least 2 characters'),
    whatsapp_number: z.string().min(10, 'Valid phone number is required'), // Adjust regex if needed
    email: z.string().email().optional().or(z.literal('')),
    document_type: z.string().optional(),
    document_number: z.string().optional(),
});

export const AccompanyingGuestSchema = z.object({
    full_name: z.string().min(2, 'Name must be at least 2 characters'),
    document_type: z.string().optional(),
    document_number: z.string().optional(),
});

export const CreateGuestSchema = z.object({
    primary_guest: PrimaryGuestSchema,
    accompanying_guests: z.array(AccompanyingGuestSchema).optional(),
});

export const EnforcedAccompanyingGuestSchema = AccompanyingGuestSchema.extend({
    document_type: z.string().min(1, 'Document type is required'),
    document_number: z.string().min(1, 'Document number is required'),
});

export const ManualWalkinGuestSchema = z.object({
    primary_guest: PrimaryGuestSchema,
    accompanying_guests: z.array(EnforcedAccompanyingGuestSchema).optional(),
});

export const CheckinOfflineSchema = z.object({
    primary_guest_id: z.number(),
    room_ids: z.array(z.number()).min(1, 'At least one room must be selected'),
    check_in_date: z.string(), // validate ISO/Date format if needed
    check_out_date: z.string(),
});
