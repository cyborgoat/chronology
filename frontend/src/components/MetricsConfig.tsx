import { useState, useEffect } from 'react';
import { Plus, X, RotateCcw } from 'lucide-react';
import { useProjects } from '../contexts/ProjectContext';
import { getDefaultMetricsConfig } from '../services/api';
import type { MetricSettings, MetricValueType } from '../types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Helper function to check if a metric is a default metric
const isDefaultMetric = (metricId: string) => {
  return ['accuracy', 'loss', 'precision', 'recall', 'f1Score'].includes(metricId);
};

export function MetricsConfig() {
  const { 
    selectedProject, 
    updateProjectMetricsConfig,
    selectedMetrics,
    setSelectedMetrics,
    chartViewMode,
    selectedMetricForComparison,
    setSelectedMetricForComparison
  } = useProjects();
  const [metricsConfig, setMetricsConfig] = useState<MetricSettings[]>([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [newMetric, setNewMetric] = useState<Partial<MetricSettings>>({
    name: '',
    type: 'float',
    color: '#3b82f6',
    unit: '',
    enabled: true,
    description: ''
  });

  // Load project's metrics configuration
  useEffect(() => {
    if (selectedProject) {
      const projectMetricsConfig = selectedProject.metricsConfig;
      if (projectMetricsConfig && projectMetricsConfig.length > 0) {
        setMetricsConfig(projectMetricsConfig);
      } else {
        // If no metrics config exists, initialize with default metrics
        const defaultMetrics = getDefaultMetricsConfig();
        setMetricsConfig(defaultMetrics);
        // Save the default metrics to the project
        updateProjectMetricsConfig(selectedProject.id, defaultMetrics);
      }
    }
  }, [selectedProject, updateProjectMetricsConfig]);

  // Sync with TimelineChart selections when metrics config or chart mode changes
  useEffect(() => {
    if (metricsConfig.length > 0) {
      const enabledMetrics = metricsConfig
        .filter(metric => metric.enabled)
        .map(metric => metric.id as any); // Cast to MetricType

      if (chartViewMode === 'metric-wise') {
        // Update selectedMetrics to match enabled metrics
        setSelectedMetrics(enabledMetrics);
      } else {
        // For model-wise view, if current selectedMetricForComparison is not enabled, pick the first enabled one
        if (!selectedMetricForComparison || !enabledMetrics.includes(selectedMetricForComparison)) {
          setSelectedMetricForComparison(enabledMetrics[0] || null);
        }
      }
    }
  }, [metricsConfig, chartViewMode, setSelectedMetrics, setSelectedMetricForComparison]);

  // Auto-save when metrics config changes
  useEffect(() => {
    const saveChanges = async () => {
      if (selectedProject && metricsConfig.length > 0) {
        try {
          await updateProjectMetricsConfig(selectedProject.id, metricsConfig);
        } catch (error) {
          console.error('Failed to save metrics configuration:', error);
          setErrorMessage('Failed to save changes. Please try again.');
          // Clear error after 5 seconds
          setTimeout(() => setErrorMessage(''), 5000);
        }
      }
    };

    const timer = setTimeout(saveChanges, 500);
    return () => clearTimeout(timer);
  }, [metricsConfig, selectedProject, updateProjectMetricsConfig]);

  const toggleMetric = (metricId: string) => {
    // First, determine the current state to know what the new state will be
    const currentMetric = metricsConfig.find(m => m.id === metricId);
    const willBeEnabled = !currentMetric?.enabled;

    // Update the metrics config
    setMetricsConfig(prev => 
      prev.map(metric => 
        metric.id === metricId 
          ? { ...metric, enabled: !metric.enabled }
          : metric
      )
    );

    // Sync with TimelineChart selections based on the new state
    if (isDefaultMetric(metricId)) {
      const metricKey = metricId as any; // Cast to MetricType
      if (chartViewMode === 'metric-wise') {
        // Update selectedMetrics for metric-wise view
        if (willBeEnabled) {
          // If will be enabled, add to selection
          setSelectedMetrics([...selectedMetrics, metricKey]);
        } else {
          // If will be disabled, remove from selection
          setSelectedMetrics(selectedMetrics.filter(m => m !== metricKey));
        }
      } else {
        // Update selectedMetricForComparison for model-wise view
        if (willBeEnabled) {
          // If will be enabled, set as the selected metric for comparison
          setSelectedMetricForComparison(metricKey);
        } else {
          // If will be disabled and it's the selected metric for comparison, clear it
          if (selectedMetricForComparison === metricKey) {
            // Find another enabled metric to set as comparison, or set to null
            const otherEnabledMetrics = metricsConfig
              .filter(m => m.enabled && m.id !== metricId)
              .map(m => m.id as any);
            setSelectedMetricForComparison(otherEnabledMetrics[0] || null);
          }
        }
      }
    }
  };

  const deleteCustomMetric = (metricId: string) => {
    // Only allow deletion of custom metrics (not default ones)
    if (!isDefaultMetric(metricId)) {
      setMetricsConfig(prev => prev.filter(metric => metric.id !== metricId));
    }
  };

  const addCustomMetric = () => {
    // Clear previous error message
    setErrorMessage('');

    // Validation
    if (!newMetric.name?.trim()) {
      setErrorMessage('Metric name is required');
      return;
    }

    // Check if metric with same name already exists
    const normalizedNewName = newMetric.name.trim().toLowerCase();
    const existingMetric = metricsConfig.find(
      metric => metric.name.toLowerCase() === normalizedNewName
    );
    
    if (existingMetric) {
      setErrorMessage(`A metric with the name "${newMetric.name.trim()}" already exists`);
      return;
    }

    // Validate min/max for numeric types
    if (newMetric.type === 'int' || newMetric.type === 'float' || newMetric.type === 'percentage') {
      if (newMetric.min !== undefined && newMetric.max !== undefined && newMetric.min >= newMetric.max) {
        setErrorMessage('Minimum value must be less than maximum value');
        return;
      }
    }

    try {
      const metric: MetricSettings = {
        id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: newMetric.name.trim(),
        type: newMetric.type as MetricValueType,
        color: newMetric.color || '#3b82f6',
        unit: newMetric.unit?.trim() || '',
        enabled: true,
        description: newMetric.description?.trim() || ''
      };

      // Only add min/max if they are actually provided
      if (newMetric.type === 'int' || newMetric.type === 'float' || newMetric.type === 'percentage') {
        if (newMetric.min !== undefined && newMetric.min !== null && !isNaN(newMetric.min)) {
          metric.min = newMetric.min;
        }
        if (newMetric.max !== undefined && newMetric.max !== null && !isNaN(newMetric.max)) {
          metric.max = newMetric.max;
        }
      }

      setMetricsConfig(prev => [...prev, metric]);
      
      // Reset form
      setNewMetric({
        name: '',
        type: 'float',
        color: '#3b82f6',
        unit: '',
        enabled: true,
        description: ''
      });
      setIsPopoverOpen(false);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage('Failed to add metric. Please try again.');
      console.error('Error adding custom metric:', error);
    }
  };

  const resetToDefaults = () => {
    const defaultMetrics = getDefaultMetricsConfig();
    setMetricsConfig(defaultMetrics);
    
    // Sync with TimelineChart immediately after reset
    const allDefaultMetrics = defaultMetrics.map(m => m.id as any);
    if (chartViewMode === 'metric-wise') {
      setSelectedMetrics(allDefaultMetrics);
    } else {
      setSelectedMetricForComparison(allDefaultMetrics[0] || null);
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
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Metrics Configuration</CardTitle>
            <CardDescription>
              Manage metrics for {selectedProject.name}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={resetToDefaults}>
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-xs">Reset to default metrics</div>
                </TooltipContent>
              </Tooltip>
              <Popover open={isPopoverOpen} onOpenChange={(open) => {
                setIsPopoverOpen(open);
                if (open) {
                  // Clear error message when opening
                  setErrorMessage('');
                }
              }}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                      <Button size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </PopoverTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-xs">Add custom metric</div>
                  </TooltipContent>
                </Tooltip>
                <PopoverContent className="w-80" align="end">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">Add Custom Metric</h4>
                      <p className="text-sm text-muted-foreground">
                        Define a new metric with properties.
                      </p>
                    </div>
                    <div className="grid gap-3">
                      <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="name" className="text-sm">Name*</Label>
                        <Input
                          id="name"
                          value={newMetric.name || ''}
                          onChange={(e) => setNewMetric(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="BLEU Score"
                          className="col-span-2 h-8"
                        />
                      </div>
                      <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="type" className="text-sm">Type*</Label>
                        <Select 
                          value={newMetric.type} 
                          onValueChange={(value: MetricValueType) => setNewMetric(prev => ({ ...prev, type: value }))}
                        >
                          <SelectTrigger className="col-span-2 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="int">Integer</SelectItem>
                            <SelectItem value="float">Float</SelectItem>
                            <SelectItem value="percentage">Percentage</SelectItem>
                            <SelectItem value="string">String</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="unit" className="text-sm">Unit</Label>
                        <Input
                          id="unit"
                          value={newMetric.unit || ''}
                          onChange={(e) => setNewMetric(prev => ({ ...prev, unit: e.target.value }))}
                          placeholder="%, ms (optional)"
                          className="col-span-2 h-8"
                        />
                      </div>
                      <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="description" className="text-sm">Description</Label>
                        <Input
                          id="description"
                          value={newMetric.description || ''}
                          onChange={(e) => setNewMetric(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Brief description (optional)"
                          className="col-span-2 h-8"
                        />
                      </div>
                      <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="color" className="text-sm">Color</Label>
                        <Input
                          id="color"
                          type="color"
                          value={newMetric.color || '#3b82f6'}
                          onChange={(e) => setNewMetric(prev => ({ ...prev, color: e.target.value }))}
                          className="col-span-2 h-8"
                        />
                      </div>
                      {(newMetric.type === 'int' || newMetric.type === 'float' || newMetric.type === 'percentage') && (
                        <>
                          <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="min" className="text-sm">Min</Label>
                            <Input
                              id="min"
                              type="number"
                              step="any"
                              value={newMetric.min !== undefined ? newMetric.min : ''}
                              onChange={(e) => {
                                const value = e.target.value;
                                setNewMetric(prev => ({ 
                                  ...prev, 
                                  min: value === '' ? undefined : parseFloat(value) 
                                }));
                              }}
                              placeholder="optional"
                              className="col-span-2 h-8"
                            />
                          </div>
                          <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="max" className="text-sm">Max</Label>
                            <Input
                              id="max"
                              type="number"
                              step="any"
                              value={newMetric.max !== undefined ? newMetric.max : ''}
                              onChange={(e) => {
                                const value = e.target.value;
                                setNewMetric(prev => ({ 
                                  ...prev, 
                                  max: value === '' ? undefined : parseFloat(value) 
                                }));
                              }}
                              placeholder="optional"
                              className="col-span-2 h-8"
                            />
                          </div>
                        </>
                      )}
                      {errorMessage && (
                        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
                          {errorMessage}
                        </div>
                      )}
                      <div className="flex gap-2 pt-2">
                        <Button onClick={addCustomMetric} size="sm" className="flex-1">
                          Add
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => {
                          setIsPopoverOpen(false);
                          setErrorMessage('');
                        }}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {errorMessage && !isPopoverOpen && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
            {errorMessage}
          </div>
        )}
            <TooltipProvider>
              <div className="space-y-4">
                {/* Default Metrics Section */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Default Metrics</h3>
                  <div className="flex flex-wrap gap-2">
                    {metricsConfig
                      .filter(metric => isDefaultMetric(metric.id))
                      .map((metric) => (
                        <Tooltip key={metric.id}>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => toggleMetric(metric.id)}
                              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                metric.enabled
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground hover:bg-muted/80"
                              }`}
                            >
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: metric.color }}
                              />
                              {metric.name}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-xs">
                              <div className="font-medium">{metric.name}</div>
                              <div>Type: {metric.type}</div>
                              {metric.unit && <div>Unit: {metric.unit}</div>}
                              {metric.description && <div>{metric.description}</div>}
                              {metric.min !== undefined && <div>Min: {metric.min}</div>}
                              {metric.max !== undefined && <div>Max: {metric.max}</div>}
                              <div className="mt-1 pt-1 border-t border-gray-200">
                                <div>Status: {metric.enabled ? "Enabled" : "Disabled"}</div>
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                  </div>
                </div>

                {/* Custom Metrics Section */}
                {metricsConfig.some(metric => !isDefaultMetric(metric.id)) && (
                  <>
                    <div className="border-t border-gray-200"></div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Custom Metrics</h3>
                      <div className="flex flex-wrap gap-2">
                        {metricsConfig
                          .filter(metric => !isDefaultMetric(metric.id))
                          .map((metric) => (
                            <div key={metric.id} className="flex items-center gap-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={() => toggleMetric(metric.id)}
                                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                      metric.enabled
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                                    }`}
                                  >
                                    <div
                                      className="w-2 h-2 rounded-full"
                                      style={{ backgroundColor: metric.color }}
                                    />
                                    {metric.name}
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="text-xs">
                                    <div className="font-medium">{metric.name}</div>
                                    <div>Type: {metric.type}</div>
                                    {metric.unit && <div>Unit: {metric.unit}</div>}
                                    {metric.description && <div>{metric.description}</div>}
                                    {metric.min !== undefined && <div>Min: {metric.min}</div>}
                                    {metric.max !== undefined && <div>Max: {metric.max}</div>}
                                    <div className="mt-1 pt-1 border-t border-gray-200">
                                      <div>Status: {metric.enabled ? "Enabled" : "Disabled"}</div>
                                    </div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteCustomMetric(metric.id)}
                                    className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600 rounded-full"
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="text-xs">Delete custom metric</div>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </TooltipProvider>
          </CardContent>
    </Card>
  );
}
