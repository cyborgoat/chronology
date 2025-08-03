import { useState } from "react";
import { useProjects } from "../contexts/useProjectContext";
import { metricLabels } from "../data/sampleData";
import type { ProjectMetric, MetricType } from "../types";
import { Pencil, Trash2, Plus, Save, X, Lock, Unlock, Edit2, ChevronUp, ChevronDown } from "lucide-react";
import { 
  sortMetrics, 
  getAvailableMetrics, 
  separateMetrics, 
  createEditValues, 
  createInitialRecord,
  tableStyles,
  type SortConfig 
} from "../lib/tableUtils";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Toggle } from "@/components/ui/toggle";
import { Badge } from "@/components/ui/badge";

export function DataTable() {
  const {
    selectedProject,
    updateMetricRecord,
    deleteMetricRecord,
    addMetricRecord,
    getAvailableModels,
  } = useProjects();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<ProjectMetric>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [globalEditMode, setGlobalEditMode] = useState(false);
  const [bulkEditValues, setBulkEditValues] = useState<Record<string, Partial<ProjectMetric>>>({});
  const [bulkDeleteIds, setBulkDeleteIds] = useState<Set<string>>(new Set());
  const [globalAddRecords, setGlobalAddRecords] = useState<Partial<ProjectMetric>[]>([createInitialRecord()]);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [newMetricRecord, setNewMetricRecord] = useState<Partial<ProjectMetric>>(createInitialRecord());

  const availableModels = selectedProject
    ? getAvailableModels(selectedProject.id)
    : [];

  if (!selectedProject) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-full bg-muted p-4">
                <Edit2 className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-lg">No Project Selected</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Select a project from the sidebar to view and manage its data records
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

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

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="w-4 h-4 ml-1" />
    ) : (
      <ChevronDown className="w-4 h-4 ml-1" />
    );
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

  const metricKeys: MetricType[] = [
    "accuracy",
    "loss",
    "precision",
    "recall",
    "f1Score",
  ];

  // Get all available metrics from metricsConfig
  const {
    defaultMetrics: enabledDefaultMetrics,
    customMetrics: enabledCustomMetrics,
  } = getAvailableMetrics(selectedProject?.metricsConfig, metricKeys);

  // Sort metrics using utility function
  const sortedMetrics = sortMetrics(
    selectedProject.records, 
    sortConfig, 
    enabledDefaultMetrics, 
    enabledCustomMetrics
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              {selectedProject.name} - Data Records
              <Badge variant="secondary" className="text-xs">
                {selectedProject.records.length} records
              </Badge>
            </CardTitle>
            <CardDescription>
              Manage and edit your project metric data records across different AI
              models
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {globalEditMode && (
              <div className="flex items-center gap-2">
                <Button 
                  onClick={handleBulkSave} 
                  size="sm" 
                  className={tableStyles.primaryButton}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save All Changes
                </Button>
                <Button 
                  onClick={handleBulkCancel} 
                  size="sm" 
                  variant="outline"
                  className={tableStyles.secondaryButton}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
            <Toggle
              pressed={globalEditMode}
              onPressedChange={setGlobalEditMode}
              variant="outline"
              size="sm"
              className={`${globalEditMode ? tableStyles.editModeActive : tableStyles.editModeInactive}`}
            >
              {globalEditMode ? <Unlock className="w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
              {globalEditMode ? "Exit Edit Mode" : "Edit Mode"}
            </Toggle>
            <Button 
              onClick={() => setShowAddForm(true)} 
              size="sm"
              disabled={globalEditMode}
              className={tableStyles.primaryButton}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Record
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {globalEditMode && (
          <div className={`mb-4 p-3 rounded-md text-center ${tableStyles.statusBanner}`}>
            <p className="text-sm font-medium">
              🔓 Edit Mode Active - All cells are editable. Make your changes and click "Save All Changes" when done.
            </p>
          </div>
        )}
        <div className={`rounded-md border ${globalEditMode ? 'border-sky-200' : 'border-slate-200'} overflow-hidden`}>
          <ScrollArea className="h-[600px] w-full">
            <div className="overflow-x-auto">
              <Table className="w-full table-auto">{/* Remove table-fixed and hardcoded width */}
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead 
                    className={`font-semibold ${tableStyles.sortableHeader} min-w-[120px]`}
                    onClick={() => handleSort('timestamp')}
                  >
                    <div className="flex items-center justify-between">
                      <span>Date</span>
                      <div className="w-4 h-4 flex items-center justify-center ml-2">
                        {getSortIcon('timestamp') || <ChevronUp className="w-4 h-4 opacity-30" />}
                      </div>
                    </div>
                  </TableHead>
                  <TableHead 
                    className={`font-semibold ${tableStyles.sortableHeader} min-w-[150px]`}
                    onClick={() => handleSort('modelName')}
                  >
                    <div className="flex items-center justify-between">
                      <span>Model</span>
                      <div className="w-4 h-4 flex items-center justify-center ml-2">
                        {getSortIcon('modelName') || <ChevronUp className="w-4 h-4 opacity-30" />}
                      </div>
                    </div>
                  </TableHead>
                  {enabledDefaultMetrics.map((key) => (
                    <TableHead 
                      key={key} 
                      className={`font-semibold ${tableStyles.sortableHeader} min-w-[100px]`}
                      onClick={() => handleSort(key)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate">{metricLabels[key as keyof typeof metricLabels]}</span>
                        <div className="w-4 h-4 flex items-center justify-center ml-1">
                          {getSortIcon(key) || <ChevronUp className="w-4 h-4 opacity-30" />}
                        </div>
                      </div>
                    </TableHead>
                  ))}
                  {enabledCustomMetrics.map((customId) => {
                    const customMetric = selectedProject?.metricsConfig?.find(
                      (m) => m.id === customId
                    );
                    return (
                      <TableHead 
                        key={customId} 
                        className={`font-semibold ${tableStyles.sortableHeader} min-w-[100px]`}
                        onClick={() => handleSort(customId)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate">{customMetric?.name || customId}</span>
                          <div className="w-4 h-4 flex items-center justify-center ml-1">
                            {getSortIcon(customId) || <ChevronUp className="w-4 h-4 opacity-30" />}
                          </div>
                        </div>
                      </TableHead>
                    );
                  })}
                  <TableHead className="font-semibold min-w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedMetrics.map((metric, index) => {
                  const isFirstOfModel =
                    index === 0 ||
                    sortedMetrics[index - 1].modelName !== metric.modelName;
                  const isInBulkEdit = globalEditMode && bulkEditValues[metric.id];
                  const isInSingleEdit = !globalEditMode && editingId === metric.id;
                  const isEditing = globalEditMode || isInSingleEdit;
                  const isMarkedForDeletion = bulkDeleteIds.has(metric.id);
                  
                  return (
                    <TableRow
                      key={metric.id}
                      className={`
                        ${isFirstOfModel ? tableStyles.firstModelRow : ""}
                        ${globalEditMode ? tableStyles.tableRowHoverEdit : tableStyles.tableRowHover}
                        ${isInBulkEdit ? tableStyles.bulkEditRow : ""}
                        ${isInSingleEdit ? tableStyles.editingRow : ""}
                        ${isMarkedForDeletion ? tableStyles.markedForDeletion : ""}
                      `}
                    >
                      <TableCell className="min-w-[120px]">
                        {isEditing ? (
                          <Input
                            type="date"
                            value={
                              globalEditMode 
                                ? bulkEditValues[metric.id]?.timestamp?.split("T")[0] || metric.timestamp.split("T")[0]
                                : editValues.timestamp?.split("T")[0] || ""
                            }
                            onChange={(e) => {
                              if (globalEditMode) {
                                // Initialize bulk edit if not already there
                                if (!bulkEditValues[metric.id]) {
                                  handleEdit(metric);
                                }
                                updateBulkEditValue(metric.id, "timestamp", e.target.value);
                              } else {
                                setEditValues((prev) => ({
                                  ...prev,
                                  timestamp: e.target.value,
                                }));
                              }
                            }}
                            className="w-full text-sm h-8"
                            disabled={isMarkedForDeletion}
                          />
                        ) : (
                          <span className="text-sm block py-1.5">
                            {new Date(metric.timestamp).toLocaleDateString()}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="min-w-[150px]">
                        {isEditing ? (
                          <>
                            <Input
                              type="text"
                              value={
                                globalEditMode 
                                  ? bulkEditValues[metric.id]?.modelName || metric.modelName || ""
                                  : editValues.modelName || ""
                              }
                              onChange={(e) => {
                                if (globalEditMode) {
                                  if (!bulkEditValues[metric.id]) {
                                    handleEdit(metric);
                                  }
                                  updateBulkEditValue(metric.id, "modelName", e.target.value);
                                } else {
                                  setEditValues((prev) => ({
                                    ...prev,
                                    modelName: e.target.value,
                                  }));
                                }
                              }}
                              className="w-full text-sm h-8"
                              placeholder="Model name"
                              list={globalEditMode ? `available-models-bulk-${metric.id}` : "available-models-edit"}
                              disabled={isMarkedForDeletion}
                            />
                            <datalist id={globalEditMode ? `available-models-bulk-${metric.id}` : "available-models-edit"}>
                              {availableModels.map((model) => (
                                <option key={model} value={model} />
                              ))}
                            </datalist>
                          </>
                        ) : (
                          <Badge variant="secondary" className="font-medium text-xs h-8 flex items-center">
                            {metric.modelName || "-"}
                          </Badge>
                        )}
                      </TableCell>
                      {enabledDefaultMetrics.map((key) => (
                        <TableCell key={key} className="min-w-[100px]">
                          {isEditing ? (
                            <Input
                              type="number"
                              min="0"
                              max="1"
                              step="0.001"
                              value={String(
                                globalEditMode 
                                  ? bulkEditValues[metric.id]?.[key] ?? metric[key] ?? ""
                                  : editValues[key] || ""
                              )}
                              onChange={(e) => {
                                const value = e.target.value ? parseFloat(e.target.value) : undefined;
                                if (globalEditMode) {
                                  if (!bulkEditValues[metric.id]) {
                                    handleEdit(metric);
                                  }
                                  updateBulkEditValue(metric.id, key, value);
                                } else {
                                  setEditValues((prev) => ({
                                    ...prev,
                                    [key]: value,
                                  }));
                                }
                              }}
                              className="w-full text-sm h-8"
                              placeholder="0.000"
                              disabled={isMarkedForDeletion}
                            />
                          ) : (
                            <span className="text-sm font-mono block py-1.5">
                              {typeof metric[key] === 'number' ? (metric[key] as number).toFixed(3) : String(metric[key] || "-")}
                            </span>
                          )}
                        </TableCell>
                      ))}
                      {enabledCustomMetrics.map((customId) => (
                        <TableCell key={customId} className="min-w-[100px]">
                          {isEditing ? (
                            <Input
                              type="number"
                              step="0.001"
                              value={String(
                                globalEditMode 
                                  ? bulkEditValues[metric.id]?.[customId] ?? metric.additionalMetrics?.[customId] ?? ""
                                  : editValues[customId] || ""
                              )}
                              onChange={(e) => {
                                const value = e.target.value ? parseFloat(e.target.value) : undefined;
                                if (globalEditMode) {
                                  if (!bulkEditValues[metric.id]) {
                                    handleEdit(metric);
                                  }
                                  updateBulkEditValue(metric.id, customId, value);
                                } else {
                                  setEditValues((prev) => ({
                                    ...prev,
                                    [customId]: value,
                                  }));
                                }
                              }}
                              className="w-full text-sm h-8"
                              placeholder="0.000"
                              disabled={isMarkedForDeletion}
                            />
                          ) : (
                            <span className="text-sm font-mono block py-1.5">
                              {(metric.additionalMetrics?.[customId] as number)?.toFixed(3) || "-"}
                            </span>
                          )}
                        </TableCell>
                      ))}
                      <TableCell className="min-w-[120px]">
                        {globalEditMode ? (
                          <div className="flex gap-1">
                            <Button
                              onClick={() => toggleBulkDelete(metric.id)}
                              size="sm"
                              variant={isMarkedForDeletion ? "default" : "ghost"}
                              className={
                                isMarkedForDeletion 
                                  ? `${tableStyles.destructiveButton} bg-red-600 hover:bg-red-700 text-white h-8 px-2` 
                                  : `${tableStyles.destructiveButton} h-8 px-2`
                              }
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : isInSingleEdit ? (
                          <div className="flex gap-1">
                            <Button
                              onClick={handleSave}
                              size="sm"
                              className={`${tableStyles.primaryButton} h-8 px-3 text-xs`}
                            >
                              <Save className="w-3 h-3 mr-1" />
                              Save
                            </Button>
                            <Button
                              onClick={handleCancel}
                              size="sm"
                              variant="outline"
                              className={`${tableStyles.secondaryButton} h-8 px-3 text-xs`}
                            >
                              <X className="w-3 h-3 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-1">
                            <Button
                              onClick={() => handleEdit(metric)}
                              size="sm"
                              variant="ghost"
                              className="text-slate-600 hover:text-slate-800 hover:bg-slate-100 h-8 px-2 transition-colors"
                            >
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <Button
                              onClick={() => handleDelete(metric.id)}
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-800 hover:bg-red-50 h-8 px-2 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}

                {globalEditMode && globalAddRecords.map((addRecord, index) => (
                  <TableRow key={`add-${index}`} className={tableStyles.globalAddRow}>
                    <TableCell className="min-w-[120px]">
                      <Input
                        type="date"
                        value={addRecord.timestamp?.split("T")[0] || ""}
                        onChange={(e) => updateGlobalAddRecord(index, "timestamp", e.target.value)}
                        className="text-sm h-8"
                        placeholder="Select date"
                      />
                    </TableCell>
                    <TableCell className="min-w-[150px]">
                      <Input
                        type="text"
                        value={addRecord.modelName || ""}
                        onChange={(e) => updateGlobalAddRecord(index, "modelName", e.target.value)}
                        className="w-full text-sm h-8"
                        placeholder="Model name"
                        list={`available-models-global-add-${index}`}
                      />
                      <datalist id={`available-models-global-add-${index}`}>
                        {availableModels.map((model) => (
                          <option key={model} value={model} />
                        ))}
                      </datalist>
                    </TableCell>
                    {enabledDefaultMetrics.map((key) => (
                      <TableCell key={key} className="min-w-[100px]">
                        <Input
                          type="number"
                          min="0"
                          max="1"
                          step="0.001"
                          value={String(addRecord[key] || "")}
                          onChange={(e) =>
                            updateGlobalAddRecord(index, key, e.target.value ? parseFloat(e.target.value) : undefined)
                          }
                          className="w-full text-sm h-8"
                          placeholder="0.000"
                        />
                      </TableCell>
                    ))}
                    {enabledCustomMetrics.map((customId) => (
                      <TableCell key={customId} className="min-w-[100px]">
                        <Input
                          type="number"
                          step="0.001"
                          value={String((addRecord as Record<string, unknown>)[customId] || "")}
                          onChange={(e) =>
                            updateGlobalAddRecord(index, customId, e.target.value ? parseFloat(e.target.value) : undefined)
                          }
                          className="w-full text-sm h-8"
                          placeholder="0.000"
                        />
                      </TableCell>
                    ))}
                    <TableCell className="min-w-[120px]">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground h-8">
                        <Plus className="w-3 h-3" />
                        <span>New Record {index + 1}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {showAddForm && !globalEditMode && (
                  <TableRow className={tableStyles.addFormRow}>
                    <TableCell className="min-w-[120px]">
                      <Input
                        type="date"
                        value={newMetricRecord.timestamp?.split("T")[0] || ""}
                        onChange={(e) =>
                          setNewMetricRecord((prev) => ({
                            ...prev,
                            timestamp: e.target.value,
                          }))
                        }
                        required
                        className="text-sm h-8"
                      />
                    </TableCell>
                    <TableCell className="min-w-[150px]">
                      <Input
                        type="text"
                        value={newMetricRecord.modelName || ""}
                        onChange={(e) =>
                          setNewMetricRecord((prev) => ({
                            ...prev,
                            modelName: e.target.value,
                          }))
                        }
                        className="w-full text-sm h-8"
                        placeholder="Model name"
                        required
                        list="available-models-new"
                      />
                      <datalist id="available-models-new">
                        {availableModels.map((model) => (
                          <option key={model} value={model} />
                        ))}
                      </datalist>
                    </TableCell>
                    {enabledDefaultMetrics.map((key) => (
                      <TableCell key={key} className="min-w-[100px]">
                        <Input
                          type="number"
                          min="0"
                          max="1"
                          step="0.001"
                          value={String(newMetricRecord[key] || "")}
                          onChange={(e) =>
                            setNewMetricRecord((prev) => ({
                              ...prev,
                              [key]: e.target.value
                                ? parseFloat(e.target.value)
                                : undefined,
                            }))
                          }
                          className="w-full text-sm h-8"
                          placeholder="0.000"
                        />
                      </TableCell>
                    ))}
                    {enabledCustomMetrics.map((customId) => (
                      <TableCell key={customId} className="min-w-[100px]">
                        <Input
                          type="number"
                          step="0.001"
                          value={String((newMetricRecord as Record<string, unknown>)[customId] || "")}
                          onChange={(e) =>
                            setNewMetricRecord((prev) => ({
                              ...prev,
                              [customId]: e.target.value
                                ? parseFloat(e.target.value)
                                : undefined,
                            }))
                          }
                          className="w-full text-sm h-8"
                          placeholder="0.000"
                        />
                      </TableCell>
                    ))}
                    <TableCell className="min-w-[120px]">
                      <div className="flex gap-1">
                        <Button
                          onClick={handleAddMetricRecord}
                          size="sm"
                          className={`${tableStyles.primaryButton} h-8 px-3 text-xs`}
                          disabled={!newMetricRecord.timestamp || !newMetricRecord.modelName}
                        >
                          <Save className="w-3 h-3 mr-1" />
                          Save
                        </Button>
                        <Button
                          onClick={() => {
                            setShowAddForm(false);
                            setNewMetricRecord({
                              timestamp: new Date().toISOString().split("T")[0],
                              modelName: "",
                            });
                          }}
                          size="sm"
                          variant="outline"
                          className={`${tableStyles.secondaryButton} h-8 px-3 text-xs`}
                        >
                          <X className="w-3 h-3 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            </div>
          </ScrollArea>
        </div>

        {selectedProject.records.length === 0 && !showAddForm && (
          <div className="text-center py-12 text-muted-foreground">
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-full bg-muted p-3">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <p className="font-medium">No data records found</p>
                <p className="text-sm">Click "Add Record" to get started with your model performance data</p>
              </div>
            </div>
          </div>
        )}

        {globalEditMode && (Object.keys(bulkEditValues).length > 0 || bulkDeleteIds.size > 0 || globalAddRecords.some(record => record.timestamp && record.modelName)) && (
          <div className={`mt-4 p-3 rounded-md ${tableStyles.pendingChanges}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sky-800">
                <Edit2 className="w-4 h-4" />
                <div className="text-sm">
                  <span className="font-medium">Pending Changes:</span>
                  <div className="flex gap-4 mt-1 text-xs">
                    {Object.keys(bulkEditValues).length > 0 && (
                      <span>{Object.keys(bulkEditValues).length} edit(s)</span>
                    )}
                    {bulkDeleteIds.size > 0 && (
                      <span className="text-red-600">{bulkDeleteIds.size} deletion(s)</span>
                    )}
                    {globalAddRecords.filter(record => record.timestamp && record.modelName).length > 0 && (
                      <span className="text-green-600">{globalAddRecords.filter(record => record.timestamp && record.modelName).length} addition(s)</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleBulkSave} 
                  size="sm" 
                  className={`${tableStyles.primaryButton} text-xs`}
                >
                  <Save className="w-3 h-3 mr-1" />
                  Save All
                </Button>
                <Button 
                  onClick={handleBulkCancel} 
                  size="sm" 
                  variant="outline"
                  className={`${tableStyles.secondaryButton} text-xs`}
                >
                  <X className="w-3 h-3 mr-1" />
                  Discard
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
