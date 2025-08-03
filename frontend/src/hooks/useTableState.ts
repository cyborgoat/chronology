import { useState } from "react";
import type { ProjectMetric } from "../types";
import { createEditValues, createInitialRecord, separateMetrics } from "../utils/table/tableCore";
import type { TableEditState, TableActionHandlers } from "../utils/table/tableUtils";

export function useTableState(
  selectedProject: any,
  updateMetricRecord: (projectId: string, metricId: string, updates: Partial<ProjectMetric>) => Promise<void>,
  deleteMetricRecord: (projectId: string, metricId: string) => Promise<void>,
  addMetricRecord: (projectId: string, metricData: Omit<ProjectMetric, "id">) => Promise<void>,
  enabledCustomMetrics: string[]
): [TableEditState, TableActionHandlers] {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<ProjectMetric>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [globalEditMode, setGlobalEditMode] = useState(false);
  const [bulkEditValues, setBulkEditValues] = useState<Record<string, Partial<ProjectMetric>>>({});
  const [bulkDeleteIds, setBulkDeleteIds] = useState<Set<string>>(new Set());
  const [globalAddRecords, setGlobalAddRecords] = useState<Partial<ProjectMetric>[]>([createInitialRecord()]);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [newMetricRecord, setNewMetricRecord] = useState<Partial<ProjectMetric>>(createInitialRecord());
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);

  const state: TableEditState = {
    editingId,
    editValues,
    showAddForm,
    globalEditMode,
    bulkEditValues,
    bulkDeleteIds,
    globalAddRecords,
    sortConfig,
    newMetricRecord,
    showConfirmationDialog
  };

  const handleEdit = (metric: ProjectMetric) => {
    if (globalEditMode) {
      // In global edit mode, add to bulk edit if not already there
      if (!bulkEditValues[metric.id]) {
        const editVals = createEditValues(metric);
        setBulkEditValues(prev => ({
          ...prev,
          [metric.id]: editVals
        }));
      }
    } else {
      // Regular single row edit mode
      setEditingId(metric.id);
      const editVals = createEditValues(metric);
      setEditValues(editVals);
    }
  };

  const handleToggleGlobalEditMode = (pressed: boolean) => {
    if (!pressed) {
      // Exit global edit mode - check for pending changes
      const hasPendingChanges = Object.keys(bulkEditValues).length > 0 || 
                               bulkDeleteIds.size > 0 || 
                               globalAddRecords.some(record => record.timestamp && record.modelName);
      
      if (hasPendingChanges) {
        setShowConfirmationDialog(true);
      } else {
        handleBulkCancel();
      }
    } else {
      // Enter global edit mode
      setGlobalEditMode(true);
    }
  };

  const handleBulkSave = async () => {
    if (!selectedProject) return;
    
    // Handle deletions first
    for (const deleteId of bulkDeleteIds) {
      await deleteMetricRecord(selectedProject.id, deleteId);
    }
    
    // Handle updates
    const updates = Object.entries(bulkEditValues);
    for (const [metricId, values] of updates) {
      // Skip if this record is marked for deletion
      if (bulkDeleteIds.has(metricId)) continue;
      
      const defaultMetricUpdates = separateMetrics(values, enabledCustomMetrics);
      await updateMetricRecord(selectedProject.id, metricId, defaultMetricUpdates);
    }
    
    // Handle new record additions if provided
    for (const addRecord of globalAddRecords) {
      if (addRecord.timestamp && addRecord.modelName) {
        const defaultMetricData = separateMetrics(addRecord, enabledCustomMetrics);
        await addMetricRecord(selectedProject.id, defaultMetricData as Omit<ProjectMetric, "id">);
      }
    }
    
    setBulkEditValues({});
    setBulkDeleteIds(new Set());
    setGlobalAddRecords([createInitialRecord()]);
    setGlobalEditMode(false);
  };

  const handleBulkCancel = () => {
    setBulkEditValues({});
    setBulkDeleteIds(new Set());
    setGlobalAddRecords([createInitialRecord()]);
    setGlobalEditMode(false);
  };

  const updateBulkEditValue = (metricId: string, field: string, value: any) => {
    setBulkEditValues(prev => ({
      ...prev,
      [metricId]: {
        ...prev[metricId],
        [field]: value
      }
    }));
  };

  const updateEditValue = (field: string, value: any) => {
    setEditValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleBulkDelete = (metricId: string) => {
    setBulkDeleteIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(metricId)) {
        newSet.delete(metricId);
      } else {
        newSet.add(metricId);
      }
      return newSet;
    });
  };

  const updateGlobalAddRecord = (index: number, field: string, value: any) => {
    setGlobalAddRecords(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      
      // Check if this record now has both timestamp and modelName
      // If so, and this is the last record, add a new empty record
      if (updated[index].timestamp && updated[index].modelName && index === updated.length - 1) {
        updated.push(createInitialRecord());
      }
      
      return updated;
    });
  };



  const handleConfirmSave = async () => {
    await handleBulkSave();
    setShowConfirmationDialog(false);
  };

  const handleConfirmDiscard = () => {
    handleBulkCancel();
    setShowConfirmationDialog(false);
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleSave = () => {
    if (editingId && selectedProject) {
      const defaultMetricUpdates = separateMetrics(editValues, enabledCustomMetrics);
      updateMetricRecord(selectedProject.id, editingId, defaultMetricUpdates);
      setEditingId(null);
      setEditValues({});
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValues({});
  };

  const handleDelete = (metricId: string) => {
    if (
      selectedProject &&
      confirm("Are you sure you want to delete this data record?")
    ) {
      deleteMetricRecord(selectedProject.id, metricId);
    }
  };

  const handleAddMetricRecord = () => {
    if (selectedProject && newMetricRecord.timestamp && newMetricRecord.modelName) {
      const defaultMetricData = separateMetrics(newMetricRecord, enabledCustomMetrics);
      addMetricRecord(selectedProject.id, defaultMetricData as Omit<ProjectMetric, "id">);
      setNewMetricRecord(createInitialRecord());
      setShowAddForm(false);
    }
  };

  const handlers: TableActionHandlers = {
    handleEdit,
    handleSave,
    handleCancel,
    handleDelete,
    handleBulkSave,
    handleBulkCancel,
    handleAddMetricRecord,
    handleSort,
    updateBulkEditValue,
    updateEditValue,
    toggleBulkDelete,
    updateGlobalAddRecord,
    handleToggleGlobalEditMode,
    handleConfirmSave,
    handleConfirmDiscard
  };

  return [state, handlers];
} 