import { ResponsiveLine } from "@nivo/line";
import type { ChartData, MetricType } from "../../types";
import { CHART_CONFIG } from "./ChartConfig";
import { ChartTooltip } from "./ChartTooltip";

export interface NivoLineChartProps {
  chartData: ChartData[];
  selectedProject: any;
  chartViewMode: "metric-wise" | "model-wise";
  selectedMetrics: MetricType[];
  selectedMetricForComparison: MetricType | null;
  getMetricLabel: (metric: MetricType) => string;
  onPointClick?: (point: any) => void;
}

export function NivoLineChart({
  chartData,
  selectedProject,
  chartViewMode,
  selectedMetrics,
  selectedMetricForComparison,
  getMetricLabel,
  onPointClick,
}: NivoLineChartProps) {
  return (
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
      pointColor={{ theme: "background" }}
      pointBorderWidth={CHART_CONFIG.pointBorderWidth}
      pointBorderColor={{ from: "serieColor" }}
      pointLabelYOffset={-12}
      enablePointLabel={false}
      useMesh={true}
      onClick={onPointClick}
      enableCrosshair={true}
      crosshairType="cross"
      tooltip={(props) => (
        <ChartTooltip
          point={props.point}
          selectedProject={selectedProject}
          chartViewMode={chartViewMode}
          selectedMetrics={selectedMetrics}
          selectedMetricForComparison={selectedMetricForComparison}
          getMetricLabel={getMetricLabel}
        />
      )}
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
  );
}
