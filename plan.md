# Message Template Editor Implementation Plan

1.  **Project Setup & Analysis:**
    *   [x] Analyze existing components in `components/MsgTemplate/`.
    *   [x] Analyze `composables/useFlow.ts` for API endpoints.
    *   [x] Analyze `pages/message_templates.vue` as the container for the editor.
    *   [x] Understand the data structures from the user request and `types/flow.ts`.

2.  **Core UI Structure:**
    *   [x] Modify `pages/message_templates.vue` to display a list of flows.
    *   [x] On selecting a flow, display its steps (`flow_step_template`s).
    *   [x] Create a main editor component that will be used to edit a selected step.

3.  **Message Type Editors:**
    *   [x] Create an editor component for `text` messages.
        *   [x] Text area for the message.
    *   [x] Create an editor component for `quick-reply` messages.
        *   [x] Text area for the body.
        *   [x] UI to add/edit/remove buttons.
        *   [x] For each button, a dropdown to select the next step (`conditional_next_steps`).
    *   [x] Create an editor component for `list-picker` messages.
        *   [x] Text area for the body.
        *   [x] Input for the action button text.
        *   [x] UI to manage sections and rows.
        *   [x] For each row, a dropdown to select the next step.

4.  **Message Visualization:**
    *   [x] Create a preview component for `text` messages.
    *   [x] Create a preview component for `quick-reply` messages.
    *   [x] Create a preview component for `list-picker` messages.
    *   [x] Integrate these previews into the editor UI.

5.  **Data & API Integration:**
    *   [x] Use `useFlow` to fetch flow and step data.
    *   [x] Implement the save functionality to update the `flow_step_template` using the appropriate endpoint from `useFlow`.
    *   [x] Ensure `options` and `conditional_next_steps` are correctly constructed before saving.

6.  **Refinement and Testing:**
    *   [x] Test the editor with all three message types.
    *   [x] Ensure the UI is intuitive and user-friendly.
    *   [x] Handle edge cases (e.g., empty flow, deleting steps).