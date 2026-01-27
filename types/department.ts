export interface Department {
    id: number;
    name: string;
    department_type: string;
    is_active: boolean;
    hotel?: string;
    created_at?: string;
    updated_at?: string;
}

export interface DepartmentCreate {
    name: string;
    department_type: string;
    is_active?: boolean;
}

export interface DepartmentUpdate extends Partial<DepartmentCreate> {
    id: number;
}
