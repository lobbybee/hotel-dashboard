// Flow Configuration Interfaces
export interface HotelFlowConfiguration {
  id: number;
  hotel: string; // UUID
  flow_template: number;
  is_enabled: boolean;
  customization_data: Record<string, any>;
}

// Flow Template Detail Interfaces
export interface FlowStepTemplate {
  id: number; // FlowStepTemplate ID
  step_name: string;
  message_template: Record<string, any>;
  message_type: string;
  options: Record<string, any>;
  customized_message_template?: Record<string, any>;
  customized_options?: Record<string, any>;
}

export interface HotelFlowDetail {
  id: number; // FlowTemplate ID
  name: string;
  description: string;
  category: string;
  steps: FlowStepTemplate[];
}

// Flow Step Customization Interfaces
export interface StepCustomization {
  message_template?: Record<string, any>;
  options?: Record<string, any>;
  quick_reply_navigation?: Record<string, any>;
  // ... other customizable fields from FlowStepTemplate
}

export interface FlowCustomizationData {
  step_customizations: Record<string, StepCustomization>;
  // ... other top-level customization keys if any
}

export interface FlowCustomizationRequest {
  customization_data: FlowCustomizationData;
}

// Hotel Flow Step Interfaces
export interface FlowStep {
  step_id: string; // Required for POST
  message_template?: Record<string, any>;
  message_type?: string; // or quick-reply, list-picker, etc.
  options?: Record<string, any>;
  // ... other FlowStep fields
}

// Scheduled Message Template Interfaces
export interface ScheduledMessageTemplate {
  id?: number; // For responses
  message_type: string; // Required for POST
  trigger_condition: Record<string, any>; // Required for POST
  message_template: string; // Required for POST
  is_active?: boolean;
}