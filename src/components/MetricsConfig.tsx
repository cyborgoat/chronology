import { useState, useEffect } from 'react';
import { Plus, X, Edit2, Check, RotateCcw } from 'lucide-react';
import { useProjects } from '../contexts/ProjectContext';
import { metricColors, metricLabels } from '../data/sampleData';
import type { MetricType, CustomMetric as ProjectCustomMetric } from '../types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const defaultMetrics: MetricType[] = ['accuracy', 'loss', 'precision', 'recall', 'f1Score'];

export function MetricsConfig() {
  const { selectedProject, updateProjectMetricsConfig } = useProjects();
  const [customMetrics, setCustomMetrics] = useState<ProjectCustomMetric[]>([]);
  const [enabledDefaultMetrics, setEnabledDefaultMetrics] = useState<Set<MetricType>>(
    new Set(defaultMetrics)
  );
  const [newMetricName, setNewMetricName] = useState('');
  const [editingMetric, setEditingMetric] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  // Load project's metrics configuration
  useEffect(() => {
    if (selectedProject) {
      setCustomMetrics(selectedProject.customMetrics || []);
      setEnabledDefaultMetrics(new Set(
        (selectedProject.enabledDefaultMetrics || defaultMetrics) as MetricType[]
      ));
    }
  }, [selectedProject]);

  // Save changes to the project
  const saveChanges = () => {
    if (selectedProject) {
      updateProjectMetricsConfig(
        selectedProject.id, 
        customMetrics, 
        Array.from(enabledDefaultMetrics)
      );
    }
  };

  const generateColor = () => {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 50%)`;
  };

  const addCustomMetric = () => {
    if (newMetricName.trim()) {
      const newMetric: ProjectCustomMetric = {
        id: `custom_${Date.now()}`,
        name: newMetricName.trim(),
        color: generateColor(),
        enabled: true,
      };
      const updatedMetrics = [...customMetrics, newMetric];
      setCustomMetrics(updatedMetrics);
      setNewMetricName('');
      // Auto-save
      if (selectedProject) {
        updateProjectMetricsConfig(
          selectedProject.id, 
          updatedMetrics, 
          Array.from(enabledDefaultMetrics)
        );
      }
    }
  };

  const removeCustomMetric = (id: string) => {
    const updatedMetrics = customMetrics.filter(metric => metric.id !== id);
    setCustomMetrics(updatedMetrics);
    // Auto-save
    if (selectedProject) {
      updateProjectMetricsConfig(
        selectedProject.id, 
        updatedMetrics, 
        Array.from(enabledDefaultMetrics)
      );
    }
  };

  const toggleDefaultMetric = (metric: MetricType) => {
    const newEnabled = new Set(enabledDefaultMetrics);
    if (newEnabled.has(metric)) {
      newEnabled.delete(metric);
    } else {
      newEnabled.add(metric);
    }
    setEnabledDefaultMetrics(newEnabled);
    // Auto-save
    if (selectedProject) {
      updateProjectMetricsConfig(
        selectedProject.id, 
        customMetrics, 
        Array.from(newEnabled)
      );
    }
  };

  const toggleCustomMetric = (id: string) => {
    const updatedMetrics = customMetrics.map(metric =>
      metric.id === id ? { ...metric, enabled: !metric.enabled } : metric
    );
    setCustomMetrics(updatedMetrics);
    // Auto-save
    if (selectedProject) {
      updateProjectMetricsConfig(
        selectedProject.id, 
        updatedMetrics, 
        Array.from(enabledDefaultMetrics)
      );
    }
  };

  const startEditing = (metric: ProjectCustomMetric) => {
    setEditingMetric(metric.id);
    setEditName(metric.name);
  };

  const saveEdit = () => {
    if (editName.trim() && editingMetric) {
      const updatedMetrics = customMetrics.map(metric =>
        metric.id === editingMetric ? { ...metric, name: editName.trim() } : metric
      );
      setCustomMetrics(updatedMetrics);
      setEditingMetric(null);
      setEditName('');
      // Auto-save
      if (selectedProject) {
        updateProjectMetricsConfig(
          selectedProject.id, 
          updatedMetrics, 
          Array.from(enabledDefaultMetrics)
        );
      }
    }
  };

  const cancelEdit = () => {
    setEditingMetric(null);
    setEditName('');
  };

  const resetToDefaults = () => {
    const newEnabledDefaults = new Set(defaultMetrics);
    const emptyCustomMetrics: ProjectCustomMetric[] = [];
    setEnabledDefaultMetrics(newEnabledDefaults);
    setCustomMetrics(emptyCustomMetrics);
    // Auto-save
    if (selectedProject) {
      updateProjectMetricsConfig(
        selectedProject.id, 
        emptyCustomMetrics, 
        Array.from(newEnabledDefaults)
      );
    }
  };

  if (!selectedProject) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96">
          <p className="text-muted-foreground text-lg">
            Select a project to configure metrics
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Metrics Configuration</CardTitle>
              <CardDescription>
                Customize which metrics to track for {selectedProject.name}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={resetToDefaults}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Defaults
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Default Metrics Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Default Metrics</h3>
            <div className="flex flex-wrap gap-2">
              {defaultMetrics.map((metric) => (
                <button
                  key={metric}
                  onClick={() => toggleDefaultMetric(metric)}
                  className={`inline-flex items-center gap-2 px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                    enabledDefaultMetrics.has(metric)
                      ? 'bg-primary text-primary-foreground border border-primary'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80 border border-muted'
                  }`}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: metricColors[metric] }}
                  />
                  {metricLabels[metric]}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Metrics Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Custom Metrics</h3>
            
            {/* Add New Metric */}
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Enter metric name..."
                value={newMetricName}
                onChange={(e) => setNewMetricName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCustomMetric()}
                className="flex-1"
              />
              <Button
                onClick={addCustomMetric}
                disabled={!newMetricName.trim()}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </div>

            {/* Custom Metrics List */}
            {customMetrics.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {customMetrics.map((metric) => (
                  <div
                    key={metric.id}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                      metric.enabled
                        ? 'border-primary bg-primary/10'
                        : 'border-muted bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div 
                        className="flex items-center gap-2 flex-1 cursor-pointer"
                        onClick={() => toggleCustomMetric(metric.id)}
                      >
                        <div
                          className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: metric.color }}
                        />
                        {editingMetric === metric.id ? (
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') saveEdit();
                              if (e.key === 'Escape') cancelEdit();
                            }}
                            className="h-6 text-sm"
                            autoFocus
                          />
                        ) : (
                          <span className={`text-sm font-medium ${
                            metric.enabled ? 'text-primary' : 'text-muted-foreground'
                          }`}>
                            {metric.name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {editingMetric === metric.id ? (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={saveEdit}
                              className="h-6 w-6 p-0"
                            >
                              <Check className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={cancelEdit}
                              className="h-6 w-6 p-0"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => startEditing(metric)}
                              className="h-6 w-6 p-0"
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeCustomMetric(metric.id)}
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No custom metrics added yet.</p>
                <p className="text-sm">Add your first custom metric above.</p>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Active metrics: {enabledDefaultMetrics.size + customMetrics.filter(m => m.enabled).length}
              </span>
              <span>
                Total available: {defaultMetrics.length + customMetrics.length}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
