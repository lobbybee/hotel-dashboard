import { defineStore } from 'pinia';
import type { FlowStep, FlowStepTemplate } from '~/composables/useFlow';

interface MessageFlowState {
  editableTemplate: FlowStep | FlowStepTemplate | null;
  formDialogVisible: boolean;
  isUpdating: boolean;
  customSteps: (FlowStep | FlowStepTemplate)[];
  dropdownSteps: { id: number; step_name: string }[];
}

export const useMessageFlowStore = defineStore('messageFlow', {
  state: (): MessageFlowState => ({
    editableTemplate: null,
    formDialogVisible: false,
    isUpdating: false,
    customSteps: [],
    dropdownSteps: [],
  }),

  getters: {
    stepOptions(state): { id: number; step_name: string }[] {
      const custom = state.customSteps.map(s => ({ id: s.id, step_name: s.step_name }));
      // Avoid duplicates that might come from custom steps and default templates
      const dropdown = state.dropdownSteps.filter(ds => !custom.some(cs => cs.id === ds.id));
      return [...custom, ...dropdown];
    }
  },

  actions: {
    showFormDialog(template: FlowStep | FlowStepTemplate, customSteps: (FlowStep | FlowStepTemplate)[]) {
      // Deep clone to prevent mutations from affecting the original list until saved
      this.editableTemplate = JSON.parse(JSON.stringify(template));
      this.customSteps = customSteps;
      this.formDialogVisible = true;
    },

    hideFormDialog() {
      this.formDialogVisible = false;
      this.editableTemplate = null;
      this.customSteps = [];
    },

    setUpdating(loading: boolean) {
      this.isUpdating = loading;
    },

    setDropdownSteps(steps: { id: number; step_name: string }[]) {
      this.dropdownSteps = steps;
    },
  }
});