export interface PaginatedResult<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

export interface APIErrorResponse {
    detail?: string;
    [key: string]: any;
}
