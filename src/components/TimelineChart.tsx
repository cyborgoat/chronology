import { ResponsiveLine } from "@nivo/line";
import { useProjects } from "../contexts/ProjectContext";
import { metricColors, metricLabels, modelColors } from "../data/sampleData";
import type { ChartData, MetricType, ChartViewMode } from "../types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface TimelineChartProps {
  onPointClick?: (point: any) => void;
}

export function TimelineChart({ onPointClick }: TimelineChartProps) {
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

  const allMetrics: MetricType[] = [
    "accuracy",
    "loss",
    "precision",
    "recall",
    "f1Score",
  ];
  const availableModels = selectedProject
    ? getAvailableModels(selectedProject.id)
    : [];

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
      if (!selectedMetricForComparison) {
        setSelectedMetricForComparison("accuracy");
      }
    } else {
      // When switching to metric-wise: ensure one model and multiple metrics
      if (selectedModels.length === 0 && availableModels.length > 0) {
        setSelectedModels([availableModels[0]]);
      } else if (selectedModels.length > 1) {
        // If multiple models selected, keep only the first one
        setSelectedModels([selectedModels[0]]);
      }
      if (selectedMetrics.length === 0) {
        setSelectedMetrics(["accuracy", "loss"]);
      }
    }
  };

  if (!selectedProject) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96">
          <p className="text-muted-foreground text-lg">
            Select a project to view its timeline
          </p>
        </CardContent>
      </Card>
    );
  }

  // Only show empty states after user has made selections but chart has no data
  const hasValidData = () => {
    if (chartViewMode === "metric-wise") {
      return (
        selectedMetrics.length > 0 &&
        selectedProject.metrics.some(
          (m) =>
            selectedMetrics.some((metric) => m[metric] !== undefined) &&
            (selectedModels.length === 0 ||
              selectedModels.includes(m.modelName))
        )
      );
    } else {
      return (
        selectedModels.length > 0 &&
        selectedMetricForComparison &&
        selectedProject.metrics.some(
          (m) =>
            selectedModels.includes(m.modelName) &&
            m[selectedMetricForComparison] !== undefined
        )
      );
    }
  };

  // Generate chart data based on view mode
  let chartData: ChartData[] = [];

  if (chartViewMode === "metric-wise") {
    // Show multiple metrics for the selected project, but only for the first selected model (or first available model)
    const modelToShow = selectedModels.length > 0 ? selectedModels[0] : (availableModels.length > 0 ? availableModels[0] : undefined);
    chartData = selectedMetrics.map((metric) => ({
      id: metricLabels[metric],
      color: metricColors[metric],
      data: selectedProject.metrics
        .filter(
          (m) =>
            m[metric] !== undefined &&
            m.modelName === modelToShow
        )
        .map((m) => ({
          x: new Date(m.timestamp).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
          }),
          y: m[metric] as number,
        })),
    }));
  } else if (chartViewMode === "model-wise" && selectedMetricForComparison) {
    // Show one metric across multiple models within the same project
    chartData = selectedModels.map((modelName) => {
      const modelColor = modelColors[modelName] || modelColors["default-1"];
      return {
        id: modelName,
        color: modelColor,
        data: selectedProject.metrics
          .filter(
            (m) =>
              m.modelName === modelName &&
              m[selectedMetricForComparison] !== undefined
          )
          .map((m) => ({
            x: new Date(m.timestamp).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
            }),
            y: m[selectedMetricForComparison] as number,
          })),
      };
    });
  }

  // Check if we should show empty state after selections are made
  const shouldShowEmptyState = () => {
    if (chartViewMode === "metric-wise") {
      return selectedMetrics.length > 0 && !hasValidData();
    } else {
      return (
        selectedModels.length > 0 &&
        selectedMetricForComparison &&
        !hasValidData()
      );
    }
  };

  const handlePointClick = (point: any) => {
    if (onPointClick) {
      let metricType: MetricType;
      let timestamp: string | undefined;
      let modelName: string | undefined;

      if (chartViewMode === "metric-wise") {
        metricType = selectedMetrics.find(
          (m) => metricLabels[m] === point.seriesId
        ) as MetricType;
        // Find the metric entry that matches this point
        const matchingMetric = selectedProject.metrics.find(
          (m) =>
            new Date(m.timestamp).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
            }) === point.data.x && m[metricType] === point.data.y
        );
        timestamp = matchingMetric?.timestamp;
        modelName = matchingMetric?.modelName;
      } else {
        metricType = selectedMetricForComparison!;
        modelName = point.seriesId;
        const matchingMetric = selectedProject.metrics.find(
          (m) =>
            m.modelName === modelName &&
            new Date(m.timestamp).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
            }) === point.data.x &&
            m[metricType] === point.data.y
        );
        timestamp = matchingMetric?.timestamp;
      }

      onPointClick({
        ...point,
        metricType,
        timestamp,
        modelName,
        projectId: selectedProject.id,
      });
    }
  };

  const getTitle = () => {
    if (chartViewMode === "metric-wise") {
      return `${selectedProject.name} - Performance Timeline`;
    } else {
      return `${selectedProject.name} - Model Comparison (${
        metricLabels[selectedMetricForComparison!]
      })`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{getTitle()}</CardTitle>
            <CardDescription>
              {chartViewMode === "metric-wise"
                ? "Track your AI model metrics over time"
                : "Compare different AI models performance"}
            </CardDescription>
          </div>
          <div className="text-sm text-muted-foreground">
            Click on data points to edit values
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm font-medium">View Mode:</span>
            <div className="flex gap-2">
              <button
                onClick={() => handleViewModeChange("metric-wise")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  chartViewMode === "metric-wise"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                Metric-wise
              </button>
              <button
                onClick={() => handleViewModeChange("model-wise")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  chartViewMode === "model-wise"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                Model-wise
              </button>
            </div>
          </div>

          {chartViewMode === "metric-wise" ? (
            /* Metric-wise View: Select metrics and optionally filter by models */
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium">Metrics:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedMetrics(allMetrics)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      selectedMetrics.length === allMetrics.length
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    All Metrics
                  </button>
                  {allMetrics.map((metric) => (
                    <button
                      key={metric}
                      onClick={() => handleMetricToggle(metric)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        selectedMetrics.includes(metric)
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
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
                {selectedMetrics.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Select metrics to display in the timeline
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium">
                    Filter by Models (optional):
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableModels.map((modelName, idx) => {
                    // In metric-wise view, only the first selected model is used for chart, so highlight only that one
                    const isActive = chartViewMode === "metric-wise"
                      ? selectedModels.length > 0
                        ? selectedModels[0] === modelName
                        : idx === 0 // fallback for initial state
                      : selectedModels.includes(modelName);
                    return (
                      <button
                        key={modelName}
                        onClick={() => handleModelToggle(modelName)}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor:
                              modelColors[modelName] || modelColors["default-1"],
                          }}
                        />
                        {modelName}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Model-wise View: Select one metric and multiple models to compare */
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium">Compare Metric:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {allMetrics.map((metric) => (
                    <button
                      key={metric}
                      onClick={() => handleMetricToggle(metric)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        selectedMetricForComparison === metric
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
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

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium">
                    Models to Compare:
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedModels(availableModels)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      selectedModels.length === availableModels.length
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    All Models
                  </button>
                  {availableModels.map((modelName) => (
                    <button
                      key={modelName}
                      onClick={() => handleModelToggle(modelName)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        selectedModels.includes(modelName)
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor:
                            modelColors[modelName] || modelColors["default-1"],
                        }}
                      />
                      {modelName}
                    </button>
                  ))}
                </div>
                {selectedModels.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Select models to compare
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {shouldShowEmptyState() ? (
          <div className="flex items-center justify-center h-96">
            <p className="text-muted-foreground text-lg">
              {chartViewMode === "metric-wise"
                ? "No data available for selected metrics and models"
                : "No data available for selected models and metric"}
            </p>
          </div>
        ) : (
          <div className="h-96">
            <ResponsiveLine
              data={chartData}
              colors={chartData.map(series => series.color)}
              margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
              xScale={{ type: "point" }}
              yScale={{
                type: "linear",
                min: 0,
                max: 1,
                stacked: false,
                reverse: false,
              }}
              yFormat=" >-.3f"
              curve="monotoneX"
              axisTop={null}
              axisRight={null}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: -45,
                legend: "Time Period",
                legendOffset: 36,
                legendPosition: "middle",
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: "Metric Value",
                legendOffset: -40,
                legendPosition: "middle",
                format: ".2f",
              }}
              pointSize={10}
              pointColor={{ theme: "background" }}
              pointBorderWidth={3}
              pointBorderColor={{ from: "serieColor" }}
              pointLabelYOffset={-12}
              enablePointLabel={false}
              useMesh={true}
              onClick={handlePointClick}
              enableCrosshair={true}
              crosshairType="cross"
              tooltip={({ point }) => {
                const metricType =
                  chartViewMode === "metric-wise"
                    ? selectedMetrics.find(
                        (m) => metricLabels[m] === point.seriesId
                      )
                    : selectedMetricForComparison;

                const modelName =
                  chartViewMode === "metric-wise"
                    ? selectedProject.metrics.find(
                        (m) =>
                          new Date(m.timestamp).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                          }) === point.data.x &&
                          m[metricType as MetricType] === point.data.y
                      )?.modelName
                    : point.seriesId;

                const timestamp = selectedProject.metrics.find(
                  (m) =>
                    new Date(m.timestamp).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                    }) === point.data.x &&
                    (chartViewMode === "metric-wise"
                      ? m[metricType as MetricType] === point.data.y
                      : m.modelName === modelName &&
                        m[metricType as MetricType] === point.data.y)
                )?.timestamp;

                return (
                  <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg min-w-64">
                    <div className="font-semibold text-gray-800 mb-3 text-center border-b pb-2">
                      Data Point Information
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          <strong>Date:</strong>
                        </span>
                        <span className="font-medium">
                          {timestamp
                            ? new Date(timestamp).toLocaleDateString()
                            : point.data.x}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          <strong>Model:</strong>
                        </span>
                        <span className="font-medium">
                          {modelName || "Unknown"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          <strong>Metric Type:</strong>
                        </span>
                        <span className="font-medium">
                          {metricType ? metricLabels[metricType] : "Unknown"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          <strong>Value:</strong>
                        </span>
                        <span className="font-bold text-blue-600">
                          {typeof point.data.y === "number"
                            ? point.data.y.toFixed(3)
                            : point.data.y}
                        </span>
                      </div>
                      <hr className="my-2 border-gray-200" />
                      <div className="text-xs text-gray-500 space-y-0.5">
                        <div>
                          <strong>X-Axis:</strong> Time Period (Monthly)
                        </div>
                        <div>
                          <strong>Y-Axis:</strong> Metric Value (0.0 - 1.0)
                        </div>
                        <div>
                          <strong>Series:</strong> {point.seriesId}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }}
              legends={[ 
                { 
                  anchor: "bottom-right", 
                  direction: "column", 
                  justify: false, 
                  translateX: 100, 
                  translateY: 0, 
                  itemsSpacing: 0, 
                  itemDirection: "left-to-right", 
                  itemWidth: 80, 
                  itemHeight: 20, 
                  itemOpacity: 0.75, 
                  symbolSize: 12, 
                  symbolShape: "circle", 
                  symbolBorderColor: "rgba(0, 0, 0, .5)", 
                  data: chartData.map((series) => ({
                    id: series.id,
                    label: series.id,
                    color: series.color,
                  })),
                  effects: [ 
                    { 
                      on: "hover", 
                      style: { 
                        itemBackground: "rgba(0, 0, 0, .03)", 
                        itemOpacity: 1, 
                      }, 
                    }, 
                  ], 
                }, 
              ]}
              animate={true}
              motionConfig="gentle"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
