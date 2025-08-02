import { useState } from "react";
import { useProjects } from "../contexts/useProjectContext";
import { metricLabels } from "../data/sampleData";
import type { ProjectMetric, MetricType } from "../types";
import { Pencil, Trash2, Plus, Save, X } from "lucide-react";

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

export function DataTable() {
  const {
    selectedProject,
    updateMetric,
    deleteMetric,
    addMetric,
    getAvailableModels,
  } = useProjects();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<ProjectMetric>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMetric, setNewMetric] = useState<Partial<ProjectMetric>>({
    timestamp: new Date().toISOString().split("T")[0],
    modelName: "",
  });

  const availableModels = selectedProject
    ? getAvailableModels(selectedProject.id)
    : [];

  if (!selectedProject) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <p className="text-muted-foreground">
            Select a project to view its data
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleEdit = (metric: ProjectMetric) => {
    setEditingId(metric.id);
    setEditValues(metric);
  };

  const handleSave = () => {
    if (editingId && selectedProject) {
      updateMetric(selectedProject.id, editingId, editValues);
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
      confirm("Are you sure you want to delete this metric?")
    ) {
      deleteMetric(selectedProject.id, metricId);
    }
  };

  const handleAddMetric = () => {
    if (selectedProject && newMetric.timestamp && newMetric.modelName) {
      addMetric(selectedProject.id, newMetric as Omit<ProjectMetric, "id">);
      setNewMetric({
        timestamp: new Date().toISOString().split("T")[0],
        modelName: "",
      });
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
  const getAvailableMetrics = () => {
    if (!selectedProject?.metricsConfig) return { defaultMetrics: [], customMetrics: [] };
    
    const enabledMetrics = selectedProject.metricsConfig.filter(metric => metric.enabled);
    const defaultMetrics = enabledMetrics
      .filter(metric => metricKeys.includes(metric.id as MetricType))
      .map(metric => metric.id as MetricType);
    const customMetrics = enabledMetrics
      .filter(metric => !metricKeys.includes(metric.id as MetricType))
      .map(metric => metric.id);
    
    return { defaultMetrics, customMetrics };
  };

  const {
    defaultMetrics: enabledDefaultMetrics,
    customMetrics: enabledCustomMetrics,
  } = getAvailableMetrics();

  // Sort metrics by model name and then by date
  const sortedMetrics = selectedProject.records.sort((a, b) => {
    const modelComparison = (a.modelName || "").localeCompare(
      b.modelName || ""
    );
    if (modelComparison !== 0) return modelComparison;
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{selectedProject.name} - Data Table</CardTitle>
            <CardDescription>
              Manage and edit your project metrics data across different AI
              models
            </CardDescription>
          </div>
          <Button onClick={() => setShowAddForm(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Data
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Model</TableHead>
                {enabledDefaultMetrics.map((key) => (
                  <TableHead key={key}>{metricLabels[key as keyof typeof metricLabels]}</TableHead>
                ))}
                {enabledCustomMetrics.map((customId) => {
                  const customMetric = selectedProject?.metricsConfig?.find(
                    (m) => m.id === customId
                  );
                  return (
                    <TableHead key={customId}>
                      {customMetric?.name || customId}
                    </TableHead>
                  );
                })}
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedMetrics.map((metric, index) => {
                const isFirstOfModel =
                  index === 0 ||
                  sortedMetrics[index - 1].modelName !== metric.modelName;
                return (
                  <TableRow
                    key={metric.id}
                    className={
                      isFirstOfModel ? "border-t-2 border-t-muted" : ""
                    }
                  >
                    <TableCell>
                      {editingId === metric.id ? (
                        <Input
                          type="date"
                          value={editValues.timestamp?.split("T")[0] || ""}
                          onChange={(e) =>
                            setEditValues((prev) => ({
                              ...prev,
                              timestamp: e.target.value,
                            }))
                          }
                          className="w-full"
                        />
                      ) : (
                        new Date(metric.timestamp).toLocaleDateString()
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === metric.id ? (
                        <>
                          <Input
                            type="text"
                            value={editValues.modelName || ""}
                            onChange={(e) =>
                              setEditValues((prev) => ({
                                ...prev,
                                modelName: e.target.value,
                              }))
                            }
                            className="w-32"
                            placeholder="Model name"
                            list="available-models-edit"
                          />
                          <datalist id="available-models-edit">
                            {availableModels.map((model) => (
                              <option key={model} value={model} />
                            ))}
                          </datalist>
                        </>
                      ) : (
                        <span className="font-medium text-sm px-2 py-1 bg-muted rounded-md">
                          {metric.modelName || "-"}
                        </span>
                      )}
                    </TableCell>
                    {enabledDefaultMetrics.map((key) => (
                      <TableCell key={key}>
                        {editingId === metric.id ? (
                          <Input
                            type="number"
                            min="0"
                            max="1"
                            step="0.001"
                            value={editValues[key] || ""}
                            onChange={(e) =>
                              setEditValues((prev) => ({
                                ...prev,
                                [key]: e.target.value
                                  ? parseFloat(e.target.value)
                                  : undefined,
                              }))
                            }
                            className="w-20"
                          />
                        ) : (
                          typeof metric[key] === 'number' ? metric[key].toFixed(3) : metric[key] || "-"
                        )}
                      </TableCell>
                    ))}
                    {enabledCustomMetrics.map((customId) => (
                      <TableCell key={customId}>
                        {editingId === metric.id ? (
                          <Input
                            type="number"
                            step="0.001"
                            value={editValues[customId] || ""}
                            onChange={(e) =>
                              setEditValues((prev) => ({
                                ...prev,
                                [customId]: e.target.value
                                  ? parseFloat(e.target.value)
                                  : undefined,
                              }))
                            }
                            className="w-20"
                          />
                        ) : (
                          (metric[customId] as number)?.toFixed(3) || "-"
                        )}
                      </TableCell>
                    ))}
                    <TableCell>
                      {editingId === metric.id ? (
                        <div className="flex gap-2">
                          <Button
                            onClick={handleSave}
                            size="sm"
                            variant="ghost"
                            className="text-green-600 hover:text-green-800"
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={handleCancel}
                            size="sm"
                            variant="ghost"
                            className="text-gray-600 hover:text-gray-800"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleEdit(metric)}
                            size="sm"
                            variant="ghost"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(metric.id)}
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}

              {showAddForm && (
                <TableRow className="bg-muted/50">
                  <TableCell>
                    <Input
                      type="date"
                      value={newMetric.timestamp?.split("T")[0] || ""}
                      onChange={(e) =>
                        setNewMetric((prev) => ({
                          ...prev,
                          timestamp: e.target.value,
                        }))
                      }
                      required
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      value={newMetric.modelName || ""}
                      onChange={(e) =>
                        setNewMetric((prev) => ({
                          ...prev,
                          modelName: e.target.value,
                        }))
                      }
                      className="w-32"
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
                    <TableCell key={key}>
                      <Input
                        type="number"
                        min="0"
                        max="1"
                        step="0.001"
                        value={newMetric[key] || ""}
                        onChange={(e) =>
                          setNewMetric((prev) => ({
                            ...prev,
                            [key]: e.target.value
                              ? parseFloat(e.target.value)
                              : undefined,
                          }))
                        }
                        className="w-20"
                        placeholder="0.000"
                      />
                    </TableCell>
                  ))}
                  {enabledCustomMetrics.map((customId) => (
                    <TableCell key={customId}>
                      <Input
                        type="number"
                        step="0.001"
                        value={newMetric[customId] || ""}
                        onChange={(e) =>
                          setNewMetric((prev) => ({
                            ...prev,
                            [customId]: e.target.value
                              ? parseFloat(e.target.value)
                              : undefined,
                          }))
                        }
                        className="w-20"
                        placeholder="0.000"
                      />
                    </TableCell>
                  ))}
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleAddMetric}
                        size="sm"
                        variant="ghost"
                        className="text-green-600 hover:text-green-800"
                      >
                        <Save className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => {
                          setShowAddForm(false);
                          setNewMetric({
                            timestamp: new Date().toISOString().split("T")[0],
                            modelName: "",
                          });
                        }}
                        size="sm"
                        variant="ghost"
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {selectedProject.records.length === 0 && !showAddForm && (
          <div className="text-center py-8 text-muted-foreground">
            No data available. Click "Add Data" to get started by adding model
            performance data.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
