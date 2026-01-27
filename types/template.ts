export interface MessageTemplate {
    id: string;
    name: string;
    body: string;
    template_type: string;
    is_active: boolean;
    hotel?: string;
    created_at?: string;
    updated_at?: string;
}

export interface MessageTemplateCreate {
    name: string;
    body: string;
    template_type: string;
    is_active?: boolean;
}

export interface MessageTemplateUpdate extends Partial<MessageTemplateCreate> {
    id: string;
}
