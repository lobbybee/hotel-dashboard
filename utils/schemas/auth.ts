import { z } from 'zod';

export const LoginSchema = z.object({
    username: z.string().min(1, 'Username is required'), // 150 chars max per spec, but min 1 is practical
    password: z.string().min(1, 'Password is required'),
});

export const PasswordResetRequestSchema = z.object({
    email: z.string().email('Invalid email address'),
});

export const PasswordResetConfirmSchema = z.object({
    email: z.string().email('Invalid email address'),
    otp: z.string().min(1, 'OTP is required'),
    new_password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const UserSchema = z.object({
    username: z.string().max(150).regex(/^[\w.@+-]+$/, 'Invalid username format'),
    email: z.string().email(),
    user_type: z.enum(['platform_admin', 'platform_staff', 'hotel_admin', 'manager', 'receptionist', 'department_staff', 'other_staff']),
    phone_number: z.string().optional(),
    password: z.string().optional(),
    hotel: z.string().optional(),
});
