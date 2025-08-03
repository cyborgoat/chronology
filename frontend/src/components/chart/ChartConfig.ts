// Chart configuration constants and utilities
export const CHART_CONFIG = {
  margins: { top: 50, right: 140, bottom: 80, left: 60 },
  pointSize: 4,
  pointBorderWidth: 2,
  animation: {
    animate: true,
    motionConfig: "gentle" as const,
  },
  xScale: {
    type: "time" as const,
    format: "%Y-%m-%d",
    useUTC: false,
    min: "auto" as const,
    max: "auto" as const,
    nice: true,
  },
  yScale: {
    type: "linear" as const,
    min: "auto" as const,
    max: "auto" as const,
    stacked: false,
    reverse: false,
  },
  axisBottom: {
    tickSize: 5,
    tickPadding: 5,
    tickRotation: -45,
    legend: "Time",
    legendOffset: 60,
    legendPosition: "middle" as const,
    format: "%b %d, %Y",
    tickValues: "every 1 month" as const,
  },
  axisLeft: {
    tickSize: 5,
    tickPadding: 5,
    tickRotation: 0,
    legend: "Metric Value",
    legendOffset: -45,
    legendPosition: "middle" as const,
    format: ".3f",
  },
  legends: {
    anchor: "bottom-right" as const,
    direction: "column" as const,
    justify: false,
    translateX: 120,
    translateY: 0,
    itemsSpacing: 2,
    itemDirection: "left-to-right" as const,
    itemWidth: 100,
    itemHeight: 20,
    itemOpacity: 0.75,
    symbolSize: 12,
    symbolShape: "circle" as const,
    symbolBorderColor: "rgba(0, 0, 0, .5)",
    effects: [
      {
        on: "hover" as const,
        style: {
          itemBackground: "rgba(0, 0, 0, .03)",
          itemOpacity: 1,
        },
      },
    ],
  },
} as const;

// Utility to strictly validate timestamps for Nivo time scale
export function isValidTimestamp(ts: unknown): ts is string {
  if (typeof ts !== "string" || !ts.trim()) return false;
  
  // Handle both ISO format (2024-01-01T00:00:00) and date-only format (2024-01-01)
  const date = new Date(ts);
  return !isNaN(date.getTime());
}

// Format timestamp for Nivo (ensure consistent format)
export function formatTimestampForChart(timestamp: string): string {
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) {
    console.warn(`Invalid timestamp: ${timestamp}`);
    return new Date().toISOString().split('T')[0]; // fallback to today
  }
  return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
}
