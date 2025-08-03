import type { ProjectMetric, MetricType } from "../../types";
import { tableStyles } from "./tableCore";

/**
 * Table state management utilities
 */
export interface TableEditState {
  editingId: string | null;
  editValues: Partial<ProjectMetric>;
  showAddForm: boolean;
  globalEditMode: boolean;
  bulkEditValues: Record<string, Partial<ProjectMetric>>;
  bulkDeleteIds: Set<string>;
  globalAddRecords: Partial<ProjectMetric>[];
  sortConfig: { key: string; direction: 'asc' | 'desc' } | null;
  newMetricRecord: Partial<ProjectMetric>;
  showConfirmationDialog: boolean;
}

/**
 * Table action handlers
 */
export interface TableActionHandlers {
  handleEdit: (metric: ProjectMetric) => void;
  handleSave: () => void;
  handleCancel: () => void;
  handleDelete: (metricId: string) => void;
  handleBulkSave: () => void;
  handleBulkCancel: () => void;
  handleAddMetricRecord: () => void;
  handleSort: (key: string) => void;
  updateBulkEditValue: (metricId: string, field: string, value: any) => void;
  updateEditValue: (field: string, value: any) => void;
  toggleBulkDelete: (metricId: string) => void;
  updateGlobalAddRecord: (index: number, field: string, value: any) => void;

  handleToggleGlobalEditMode: (pressed: boolean) => void;
  handleConfirmSave: () => void;
  handleConfirmDiscard: () => void;
}

/**
 * Table rendering utilities
 */
export const tableRenderUtils = {
  /**
   * Get sort icon for table headers
   */
  getSortIcon: (key: string, sortConfig: { key: string; direction: 'asc' | 'desc' } | null) => {
    if (!sortConfig || sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === 'asc' ? 'asc' : 'desc';
  },

  /**
   * Get row styling classes
   */
  getRowClasses: (
    metric: ProjectMetric,
    index: number,
    sortedMetrics: ProjectMetric[],
    state: TableEditState
  ) => {
    const isFirstOfModel = index === 0 || sortedMetrics[index - 1].modelName !== metric.modelName;
    const isInBulkEdit = state.globalEditMode && state.bulkEditValues[metric.id];
    const isInSingleEdit = !state.globalEditMode && state.editingId === metric.id;
    const isEditing = state.globalEditMode || isInSingleEdit;
    const isMarkedForDeletion = state.bulkDeleteIds.has(metric.id);

    return {
      isFirstOfModel,
      isInBulkEdit,
      isInSingleEdit,
      isEditing,
      isMarkedForDeletion,
      className: `
        ${isFirstOfModel ? tableStyles.firstModelRow : ""}
        ${state.globalEditMode ? tableStyles.tableRowHoverEdit : tableStyles.tableRowHover}
        ${isInBulkEdit ? tableStyles.bulkEditRow : ""}
        ${isInSingleEdit ? tableStyles.editingRow : ""}
        ${isMarkedForDeletion ? tableStyles.markedForDeletion : ""}
      `.trim()
    };
  },

  /**
   * Get input value for editing cells
   */
  getInputValue: (
    field: string,
    metric: ProjectMetric,
    state: TableEditState,
    isGlobalEdit: boolean
  ) => {
    if (isGlobalEdit) {
      return state.bulkEditValues[metric.id]?.[field] ?? metric[field as keyof ProjectMetric] ?? "";
    }
    // For single edit mode, use editValues if available, otherwise use metric data
    return state.editValues[field as keyof ProjectMetric] ?? metric[field as keyof ProjectMetric] ?? "";
  },

  /**
   * Get custom metric value
   */
  getCustomMetricValue: (
    customId: string,
    metric: ProjectMetric,
    state: TableEditState,
    isGlobalEdit: boolean
  ) => {
    if (isGlobalEdit) {
      return state.bulkEditValues[metric.id]?.[customId] ?? metric.additionalMetrics?.[customId] ?? "";
    }
    // For single edit mode, use editValues if available, otherwise use metric data
    return state.editValues[customId] ?? metric.additionalMetrics?.[customId] ?? "";
  },

  /**
   * Check if there are pending changes
   */
  hasPendingChanges: (state: TableEditState) => {
    return (
      Object.keys(state.bulkEditValues).length > 0 ||
      state.bulkDeleteIds.size > 0 ||
      state.globalAddRecords.some(record => record.timestamp && record.modelName)
    );
  },

  /**
   * Get pending changes summary
   */
  getPendingChangesSummary: (state: TableEditState) => {
    const edits = Object.keys(state.bulkEditValues).length;
    const deletions = state.bulkDeleteIds.size;
    const additions = state.globalAddRecords.filter(record => record.timestamp && record.modelName).length;

    return { edits, deletions, additions };
  }
};

/**
 * Table validation utilities
 */
export const tableValidationUtils = {
  /**
   * Check if a record can be saved
   */
  canSaveRecord: (record: Partial<ProjectMetric>) => {
    return !!(record.timestamp && record.modelName);
  },

  /**
   * Validate metric value
   */
  validateMetricValue: (value: string): number | undefined => {
    const numValue = parseFloat(value);
    return isNaN(numValue) ? undefined : numValue;
  },

  /**
   * Format metric value for display
   */
  formatMetricValue: (value: any): string => {
    if (typeof value === 'number') {
      return value.toFixed(3);
    }
    return String(value || "-");
  }
};

/**
 * Table constants
 */
export const TABLE_CONSTANTS = {
  MIN_COLUMN_WIDTHS: {
    date: 'min-w-[120px]',
    model: 'min-w-[150px]',
    metric: 'min-w-[100px]',
    actions: 'min-w-[120px]'
  },
  INPUT_CLASSES: 'w-full text-sm h-8',
  BUTTON_SIZES: {
    sm: 'h-8 px-2',
    md: 'h-8 px-3'
  }
}; 