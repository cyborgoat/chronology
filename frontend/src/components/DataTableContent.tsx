import { useState } from "react";
import type { ProjectMetric, MetricType } from "../types";
import { 
  sortMetrics, 
  getAvailableMetrics, 
  separateMetrics, 
  createInitialRecord,
  tableStyles
} from "../utils/table/tableCore";
import { useTableState } from "../hooks/useTableState";
import { tableRenderUtils } from "../utils/table/tableUtils";
import { 
  DataTableHeader, 
  DataTableRow, 
  TableToolbar, 
  PendingChangesBanner,
  ConfirmationDialog
} from "./table";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Save, X } from "lucide-react";

interface DataTableContentProps {
  selectedProject: any;
  updateMetricRecord: (projectId: string, metricId: string, updates: Partial<ProjectMetric>) => Promise<void>;
  deleteMetricRecord: (projectId: string, metricId: string) => Promise<void>;
  addMetricRecord: (projectId: string, metricData: Omit<ProjectMetric, "id">) => Promise<void>;
  getAvailableModels: (projectId: string) => string[];
}

export function DataTableContent({
  selectedProject,
  updateMetricRecord,
  deleteMetricRecord,
  addMetricRecord,
  getAvailableModels
}: DataTableContentProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMetricRecord, setNewMetricRecord] = useState<Partial<ProjectMetric>>(createInitialRecord());

  const availableModels = getAvailableModels(selectedProject.id);

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

  // Use the custom hook for table state management
  const [state, handlers] = useTableState(
    selectedProject,
    updateMetricRecord,
    deleteMetricRecord,
    addMetricRecord,
    enabledCustomMetrics
  );

  // Sort metrics using utility function
  const sortedMetrics = sortMetrics(
    selectedProject.records, 
    state.sortConfig, 
    enabledDefaultMetrics, 
    enabledCustomMetrics
  );

  const handleAddMetricRecord = () => {
    if (selectedProject && newMetricRecord.timestamp && newMetricRecord.modelName) {
      const defaultMetricData = separateMetrics(newMetricRecord, enabledCustomMetrics);
      addMetricRecord(selectedProject.id, defaultMetricData as Omit<ProjectMetric, "id">);
      setNewMetricRecord(createInitialRecord());
      setShowAddForm(false);
    }
  };

  const hasPendingChanges = tableRenderUtils.hasPendingChanges(state);
  const pendingChangesSummary = tableRenderUtils.getPendingChangesSummary(state);

  return (
    <Card>
      <CardHeader>
        <TableToolbar
          selectedProject={selectedProject}
          globalEditMode={state.globalEditMode}
          onToggleEditMode={handlers.handleToggleGlobalEditMode}
          onShowAddForm={() => setShowAddForm(true)}
          onBulkSave={handlers.handleBulkSave}
          onBulkCancel={handlers.handleBulkCancel}
          hasPendingChanges={hasPendingChanges}
          pendingChangesSummary={pendingChangesSummary}
        />
      </CardHeader>
      
      <CardContent>
        {state.globalEditMode && (
          <div className={`mb-4 p-3 rounded-md text-center ${tableStyles.statusBanner}`}>
            <p className="text-sm font-medium">
              🔓 Edit Mode Active - All cells are editable. Make your changes and click "Save All Changes" when done.
            </p>
          </div>
        )}
        
        <div className={`rounded-md border ${state.globalEditMode ? 'border-sky-200' : 'border-slate-200'} overflow-hidden`}>
          <ScrollArea className="h-[600px] w-full">
            <div className="overflow-x-auto">
              <Table className="w-full table-auto">
                <DataTableHeader
                  enabledDefaultMetrics={enabledDefaultMetrics}
                  enabledCustomMetrics={enabledCustomMetrics}
                  customMetrics={selectedProject?.metricsConfig || []}
                  sortConfig={state.sortConfig}
                  onSort={handlers.handleSort}
                />
                
                <TableBody>
                  {sortedMetrics.map((metric, index) => (
                    <DataTableRow
                      key={metric.id}
                      metric={metric}
                      index={index}
                      sortedMetrics={sortedMetrics}
                      enabledDefaultMetrics={enabledDefaultMetrics}
                      enabledCustomMetrics={enabledCustomMetrics}
                      availableModels={availableModels}
                      state={state}
                      handlers={handlers}
                    />
                  ))}

                  {state.globalEditMode && state.globalAddRecords.map((addRecord, index) => (
                    <TableRow key={`add-${index}`} className={tableStyles.globalAddRow}>
                      <TableCell className="min-w-[120px]">
                        <Input
                          type="date"
                          value={addRecord.timestamp?.split("T")[0] || ""}
                          onChange={(e) => handlers.updateGlobalAddRecord(index, "timestamp", e.target.value)}
                          className="text-sm h-8"
                          placeholder="Select date"
                        />
                      </TableCell>
                      <TableCell className="min-w-[150px]">
                        <Input
                          type="text"
                          value={addRecord.modelName || ""}
                          onChange={(e) => handlers.updateGlobalAddRecord(index, "modelName", e.target.value)}
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
                            onChange={(e) => {
                              const inputValue = e.target.value;
                              if (inputValue === "" || inputValue === "0") {
                                handlers.updateGlobalAddRecord(index, key, inputValue);
                              } else {
                                const numValue = parseFloat(inputValue);
                                handlers.updateGlobalAddRecord(index, key, isNaN(numValue) ? inputValue : numValue);
                              }
                            }}
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
                            onChange={(e) => {
                              const inputValue = e.target.value;
                              if (inputValue === "" || inputValue === "0") {
                                handlers.updateGlobalAddRecord(index, customId, inputValue);
                              } else {
                                const numValue = parseFloat(inputValue);
                                handlers.updateGlobalAddRecord(index, customId, isNaN(numValue) ? inputValue : numValue);
                              }
                            }}
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

                  {showAddForm && !state.globalEditMode && (
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



        <PendingChangesBanner
          hasPendingChanges={hasPendingChanges}
          pendingChangesSummary={pendingChangesSummary}
          onSave={handlers.handleBulkSave}
          onDiscard={handlers.handleBulkCancel}
        />
      </CardContent>
      
      <ConfirmationDialog
        open={state.showConfirmationDialog}
        onOpenChange={(open) => {
          if (!open) {
            // If dialog is closed without action, just close it
            handlers.handleConfirmDiscard();
          }
        }}
        onSave={handlers.handleConfirmSave}
        onDiscard={handlers.handleConfirmDiscard}
        pendingChangesSummary={pendingChangesSummary}
      />
    </Card>
  );
} 