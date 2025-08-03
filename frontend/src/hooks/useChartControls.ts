import { useMemo } from "react";
import { useProjects } from "../contexts/useProjectContext";
import { getEnabledMetrics } from "../utils";
import type { MetricType, ChartViewMode } from "../types";

export function useChartControls() {
  const {
    selectedProject,
    selectedMetrics,
    setSelectedMetrics,
    selectedModels,
    setSelectedModels,
    chartViewMode,
    setChartViewMode,
    selectedMetricForComparison,
    setSelectedMetricForComparison,
    getAvailableModels,
  } = useProjects();

  // Get enabled metrics from project's metrics configuration
  const enabledMetrics: MetricType[] = useMemo(
    () => getEnabledMetrics(selectedProject),
    [selectedProject]
  );

  const availableModels = selectedProject
    ? getAvailableModels(selectedProject.id)
    : [];

  // Event handlers
  const handleMetricToggle = (metric: MetricType) => {
    if (chartViewMode === "metric-wise") {
      // In metric-wise mode, we can select multiple metrics
      const newMetrics = selectedMetrics.includes(metric)
        ? selectedMetrics.filter((m: MetricType) => m !== metric)
        : [...selectedMetrics, metric];
      setSelectedMetrics(newMetrics);
    } else {
      // In model-wise mode, only one metric can be selected for comparison
      setSelectedMetricForComparison(metric);
    }
  };

  const handleModelToggle = (modelName: string) => {
    if (chartViewMode === "model-wise") {
      // In model-wise mode, we can select multiple models
      const newModels = selectedModels.includes(modelName)
        ? selectedModels.filter((m) => m !== modelName)
        : [...selectedModels, modelName];
      setSelectedModels(newModels);
    } else {
      // In metric-wise mode, only one model can be selected
      setSelectedModels([modelName]);
    }
  };

  const handleViewModeChange = (mode: ChartViewMode) => {
    setChartViewMode(mode);

    if (mode === "model-wise") {
      // When switching to model-wise: ensure only one metric and multiple models
      if (selectedModels.length === 0 && availableModels.length > 0) {
        setSelectedModels([availableModels[0]]);
      }
      if (!selectedMetricForComparison && enabledMetrics.length > 0) {
        setSelectedMetricForComparison(enabledMetrics[0]);
      }
    } else {
      // When switching to metric-wise: ensure one model and multiple metrics
      if (selectedModels.length === 0 && availableModels.length > 0) {
        setSelectedModels([availableModels[0]]);
      } else if (selectedModels.length > 1) {
        // If multiple models selected, keep only the first one
        setSelectedModels([selectedModels[0]]);
      }
      if (selectedMetrics.length === 0 && enabledMetrics.length > 0) {
        setSelectedMetrics(enabledMetrics.slice(0, 2)); // Select first two enabled metrics
      }
    }
  };

  const handleSelectAllMetrics = () => setSelectedMetrics(enabledMetrics);
  const handleClearAllMetrics = () => setSelectedMetrics([]);
  const handleSelectAllModels = () => setSelectedModels(availableModels);
  const handleClearAllModels = () => setSelectedModels([]);

  return {
    selectedProject,
    selectedMetrics,
    selectedModels,
    chartViewMode,
    selectedMetricForComparison,
    enabledMetrics,
    availableModels,
    handleMetricToggle,
    handleModelToggle,
    handleViewModeChange,
    handleSelectAllMetrics,
    handleClearAllMetrics,
    handleSelectAllModels,
    handleClearAllModels,
  };
} 