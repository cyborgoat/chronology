import { useState, useEffect } from 'react';
import { Plus, X, RotateCcw } from 'lucide-react';
import { useProjects } from '../contexts/ProjectContext';
import type { MetricSettings, MetricValueType } from '../types';
import {
  Card,
  CardContent,
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

export function MetricsConfig() {
  const { selectedProject, updateProjectMetricsConfig } = useProjects();
  const [metricsConfig, setMetricsConfig] = useState<MetricSettings[]>([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
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
      setMetricsConfig(selectedProject.metricsConfig || []);
    }
  }, [selectedProject]);

  // Save changes to the project
  const saveChanges = () => {
    if (selectedProject) {
      updateProjectMetricsConfig(selectedProject.id, metricsConfig);
    }
  };

  // Auto-save when metrics config changes
  useEffect(() => {
    const timer = setTimeout(saveChanges, 500);
    return () => clearTimeout(timer);
  }, [metricsConfig, selectedProject]);

  const toggleMetric = (metricId: string) => {
    setMetricsConfig(prev => 
      prev.map(metric => 
        metric.id === metricId 
          ? { ...metric, enabled: !metric.enabled }
          : metric
      )
    );
  };

  const deleteCustomMetric = (metricId: string) => {
    // Only allow deletion of custom metrics (not default ones)
    const isDefaultMetric = ['accuracy', 'loss', 'precision', 'recall', 'f1Score'].includes(metricId);
    if (!isDefaultMetric) {
      setMetricsConfig(prev => prev.filter(metric => metric.id !== metricId));
    }
  };

  const addCustomMetric = () => {
    if (!newMetric.name?.trim()) return;

    const metric: MetricSettings = {
      id: `custom_${Date.now()}`,
      name: newMetric.name.trim(),
      type: newMetric.type as MetricValueType,
      color: newMetric.color || '#3b82f6',
      unit: newMetric.unit || '',
      enabled: true,
      description: newMetric.description || ''
    };

    if (newMetric.type === 'int' || newMetric.type === 'float' || newMetric.type === 'percentage') {
      if (newMetric.min !== undefined) metric.min = newMetric.min;
      if (newMetric.max !== undefined) metric.max = newMetric.max;
    }

    setMetricsConfig(prev => [...prev, metric]);
    setNewMetric({
      name: '',
      type: 'float',
      color: '#3b82f6',
      unit: '',
      enabled: true,
      description: ''
    });
    setIsPopoverOpen(false);
  };

  const resetToDefaults = () => {
    const defaultMetrics: MetricSettings[] = [
      {
        id: 'accuracy',
        name: 'Accuracy',
        type: 'percentage',
        color: 'hsl(200, 100%, 50%)',
        unit: '%',
        enabled: true,
        min: 0,
        max: 1,
        description: 'Model prediction accuracy'
      },
      {
        id: 'loss',
        name: 'Loss',
        type: 'float',
        color: 'hsl(0, 100%, 50%)',
        unit: '',
        enabled: true,
        min: 0,
        description: 'Training loss value'
      },
      {
        id: 'precision',
        name: 'Precision',
        type: 'percentage',
        color: 'hsl(120, 100%, 40%)',
        unit: '%',
        enabled: true,
        min: 0,
        max: 1,
        description: 'Model precision score'
      },
      {
        id: 'recall',
        name: 'Recall',
        type: 'percentage',
        color: 'hsl(60, 100%, 50%)',
        unit: '%',
        enabled: true,
        min: 0,
        max: 1,
        description: 'Model recall score'
      },
      {
        id: 'f1Score',
        name: 'F1 Score',
        type: 'percentage',
        color: 'hsl(280, 100%, 50%)',
        unit: '%',
        enabled: true,
        min: 0,
        max: 1,
        description: 'F1 score metric'
      }
    ];
    setMetricsConfig(defaultMetrics);
  };

  const isDefaultMetric = (metricId: string) => {
    return ['accuracy', 'loss', 'precision', 'recall', 'f1Score'].includes(metricId);
  };

  if (!selectedProject) {
    return (
      <div className="p-8 text-center text-gray-500">
        Select a project to configure metrics
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Metrics Configuration</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage metrics for {selectedProject.name}
            </p>
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
              <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
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
                        <Label htmlFor="name" className="text-sm">Name</Label>
                        <Input
                          id="name"
                          value={newMetric.name || ''}
                          onChange={(e) => setNewMetric(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="BLEU Score"
                          className="col-span-2 h-8"
                        />
                      </div>
                      <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="type" className="text-sm">Type</Label>
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
                          placeholder="%, ms"
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
                              value={newMetric.min || ''}
                              onChange={(e) => setNewMetric(prev => ({ ...prev, min: parseFloat(e.target.value) || undefined }))}
                              placeholder="0"
                              className="col-span-2 h-8"
                            />
                          </div>
                          <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="max" className="text-sm">Max</Label>
                            <Input
                              id="max"
                              type="number"
                              value={newMetric.max || ''}
                              onChange={(e) => setNewMetric(prev => ({ ...prev, max: parseFloat(e.target.value) || undefined }))}
                              placeholder="1"
                              className="col-span-2 h-8"
                            />
                          </div>
                        </>
                      )}
                      <div className="flex gap-2 pt-2">
                        <Button onClick={addCustomMetric} size="sm" className="flex-1">
                          Add
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setIsPopoverOpen(false)}>
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

        <Card>
          <CardContent className="pt-4">
            <TooltipProvider>
              <div className="space-y-4">
                {/* Default Metrics Section */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Default Metrics</h3>
                  <div className="space-y-2">
                    {metricsConfig
                      .filter(metric => isDefaultMetric(metric.id))
                      .map((metric) => (
                        <div
                          key={metric.id}
                          className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: metric.color }}
                            />
                            <span className="text-sm font-medium">{metric.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant={metric.enabled ? "default" : "secondary"}
                                  size="sm"
                                  onClick={() => toggleMetric(metric.id)}
                                  className="h-6 px-3 text-xs rounded-full"
                                >
                                  {metric.enabled ? "ON" : "OFF"}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="text-xs">
                                  <div className="font-medium">{metric.name}</div>
                                  <div>Type: {metric.type}</div>
                                  {metric.unit && <div>Unit: {metric.unit}</div>}
                                  {metric.description && <div>{metric.description}</div>}
                                  {metric.min !== undefined && <div>Min: {metric.min}</div>}
                                  {metric.max !== undefined && <div>Max: {metric.max}</div>}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Custom Metrics Section */}
                {metricsConfig.some(metric => !isDefaultMetric(metric.id)) && (
                  <>
                    <div className="border-t border-gray-200"></div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Custom Metrics</h3>
                      <div className="space-y-2">
                        {metricsConfig
                          .filter(metric => !isDefaultMetric(metric.id))
                          .map((metric) => (
                            <div
                              key={metric.id}
                              className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-gray-50"
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: metric.color }}
                                />
                                <span className="text-sm font-medium">{metric.name}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant={metric.enabled ? "default" : "secondary"}
                                      size="sm"
                                      onClick={() => toggleMetric(metric.id)}
                                      className="h-6 px-3 text-xs rounded-full"
                                    >
                                      {metric.enabled ? "ON" : "OFF"}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <div className="text-xs">
                                      <div className="font-medium">{metric.name}</div>
                                      <div>Type: {metric.type}</div>
                                      {metric.unit && <div>Unit: {metric.unit}</div>}
                                      {metric.description && <div>{metric.description}</div>}
                                      {metric.min !== undefined && <div>Min: {metric.min}</div>}
                                      {metric.max !== undefined && <div>Max: {metric.max}</div>}
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => deleteCustomMetric(metric.id)}
                                      className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <div className="text-xs">Delete custom metric</div>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
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
      </div>
    </div>
  );
}
