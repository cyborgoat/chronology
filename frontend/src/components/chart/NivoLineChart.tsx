import { ResponsiveLine } from "@nivo/line";
import { forwardRef } from "react";
import type { ChartData, MetricType, Project, ChartPoint } from "../../types";
import { CHART_CONFIG } from "./ChartConfig";
import { ChartTooltip } from "./ChartTooltip";

export interface NivoLineChartProps {
  chartData: ChartData[];
  selectedProject: Project;
  chartViewMode: "metric-wise" | "model-wise";
  selectedMetrics: MetricType[];
  selectedMetricForComparison: MetricType | null;
  getMetricLabel: (metric: MetricType) => string;
  onPointClick?: (point: ChartPoint) => void;
  currentModelName?: string;
}

export const NivoLineChart = forwardRef<HTMLDivElement, NivoLineChartProps>(({
  chartData,
  chartViewMode,
  selectedMetrics,
  selectedMetricForComparison,
  getMetricLabel,
  onPointClick,
  currentModelName,
}, ref) => {
  // Debug logging
  console.log('NivoLineChart render:', {
    chartDataLength: chartData.length,
    chartData: chartData,
    chartViewMode,
    selectedMetrics,
    selectedMetricForComparison
  });
  const handlePointClick = (point: unknown) => {
    if (onPointClick) {
      // Convert Nivo point to our ChartPoint format
      const nivoPoint = point as {
        id: string;
        data: { x: string | Date; y: number };
        seriesId: string;
        seriesColor: string;
      };
      const chartPoint: ChartPoint = {
        id: nivoPoint.id,
        x: nivoPoint.data.x,
        y: nivoPoint.data.y,
        serieId: nivoPoint.seriesId,
        serieColor: nivoPoint.seriesColor,
        seriesId: nivoPoint.seriesId,
        data: nivoPoint.data,
      };
      onPointClick(chartPoint);
    }
  };

  // If no chart data, show a placeholder
  if (chartData.length === 0) {
    return (
      <div ref={ref} className="flex justify-center items-center w-full h-full">
        <p className="text-muted-foreground">No chart data available</p>
      </div>
    );
  }

  return (
    <div ref={ref} className="w-full h-full">
      <ResponsiveLine
        data={chartData}
        colors={chartData.map((series) => series.color)}
        margin={CHART_CONFIG.margins}
        xScale={CHART_CONFIG.xScale}
        yScale={CHART_CONFIG.yScale}
        yFormat=" >-.3f"
        curve="monotoneX"
        axisTop={null}
        axisRight={null}
        axisBottom={CHART_CONFIG.axisBottom}
        axisLeft={CHART_CONFIG.axisLeft}
        pointSize={CHART_CONFIG.pointSize}
        pointColor="transparent"
        pointBorderWidth={CHART_CONFIG.pointBorderWidth}
        pointBorderColor="rgba(128, 128, 128, 0.6)"
        pointLabelYOffset={-12}
        enablePointLabel={false}
        enablePoints={true}
        useMesh={true}
        onClick={handlePointClick}
        enableCrosshair={true}
        crosshairType="cross"
        tooltip={(props) => {
          // Convert Nivo point to our format
          const chartPoint: ChartPoint = {
            id: props.point.id,
            x: props.point.data.x,
            y: props.point.data.y,
            serieId: props.point.seriesId,
            serieColor: props.point.seriesColor,
            seriesId: props.point.seriesId,
            data: props.point.data,
          };
          return (
            <ChartTooltip
              point={chartPoint}
              chartViewMode={chartViewMode}
              selectedMetrics={selectedMetrics}
              selectedMetricForComparison={selectedMetricForComparison}
              getMetricLabel={getMetricLabel}
              currentModelName={currentModelName}
            />
          );
        }}
        legends={[
          {
            anchor: "bottom-right",
            direction: "column",
            justify: false,
            translateX: 120,
            translateY: 0,
            itemsSpacing: 2,
            itemDirection: "left-to-right",
            itemWidth: 100,
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
        animate={CHART_CONFIG.animation.animate}
        motionConfig={CHART_CONFIG.animation.motionConfig}
      />
    </div>
  );
});
