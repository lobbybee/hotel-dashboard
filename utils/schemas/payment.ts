import { z } from 'zod';

export const PaymentQRCodeSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100),
    upi_id: z.string().min(1, 'UPI ID is required').regex(/^[\w.\-]+@[\w]+$/, 'Invalid UPI ID format'),
    active: z.boolean().optional(),
});

export const SendToWhatsAppSchema = z.object({
    qr_code_id: z.string().min(1),
    guest_id: z.number().positive(),
});
