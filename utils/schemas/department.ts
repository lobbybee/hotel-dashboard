import { z } from 'zod';

export const DepartmentSchema = z.object({
    name: z.string().min(1, 'Department name is required').max(100),
    department_type: z.string().min(1, 'Department type is required'),
    is_active: z.boolean().optional(),
});
