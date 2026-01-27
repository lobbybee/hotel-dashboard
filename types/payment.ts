export enum TransactionType {
    PAYMENT = 'payment',
    REFUND = 'refund',
    // Add others
}

export enum TransactionStatus {
    SUCCESS = 'success',
    PENDING = 'pending',
    FAILED = 'failed',
}

export interface Transaction {
    id: string;
    hotel_name?: string;
    plan_name?: string;
    amount: string;
    transaction_type?: TransactionType | string;
    status?: TransactionStatus | string;
    transaction_id?: string;
    notes?: string;
    created_at?: string;
    updated_at?: string;
    hotel: string;
    plan: string;
}

export interface Subscription {
    id: string;
    hotel_name?: string;
    plan_name?: string;
    is_expired?: boolean;
    days_until_expiry?: number;
    start_date: string;
    end_date: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
    hotel: string;
    plan: string;
}

export interface PaymentQRCode {
    id: string;
    hotel?: string;
    name: string;
    image: File | string;
    image_url?: string;
    upi_id: string;
    active?: boolean;
    created_at?: string;
    updated_at?: string;
}
