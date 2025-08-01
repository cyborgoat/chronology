import { ResponsiveLine } from '@nivo/line';
import { useProjects } from '../contexts/ProjectContext';
import { metricColors, metricLabels } from '../data/sampleData';
import type { ChartData, MetricType } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface TimelineChartProps {
  onPointClick?: (point: any) => void;
}

export function TimelineChart({ onPointClick }: TimelineChartProps) {
  const { selectedProject, selectedMetrics, setSelectedMetrics } = useProjects();

  const allMetrics: MetricType[] = ['accuracy', 'loss', 'precision', 'recall', 'f1Score'];

  const handleMetricToggle = (metric: MetricType) => {
    const newMetrics = selectedMetrics.includes(metric)
      ? selectedMetrics.filter((m: MetricType) => m !== metric)
      : [...selectedMetrics, metric];
    setSelectedMetrics(newMetrics);
  };

  if (!selectedProject) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96">
          <p className="text-muted-foreground text-lg">Select a project to view its timeline</p>
        </CardContent>
      </Card>
    );
  }

  const chartData: ChartData[] = selectedMetrics.map(metric => ({
    id: metricLabels[metric],
    color: metricColors[metric],
    data: selectedProject.metrics
      .filter(m => m[metric] !== undefined)
      .map(m => ({
        x: new Date(m.timestamp).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        }),
        y: m[metric] as number
      }))
  }));

  const handlePointClick = (point: any) => {
    if (onPointClick) {
      const metricType = selectedMetrics.find(m => metricLabels[m] === point.serieId) as MetricType;
      const timestamp = selectedProject.metrics.find(m => 
        new Date(m.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) === point.data.x
      )?.timestamp;
      
      onPointClick({
        ...point,
        metricType,
        timestamp,
        projectId: selectedProject.id
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{selectedProject.name} - Performance Timeline</CardTitle>
          </div>
          <div className="text-sm text-muted-foreground">
            Click on data points to edit values
          </div>
        </div>
        
        {/* Compact Metric Selector */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex flex-wrap gap-2">
            {allMetrics.map(metric => (
              <button
                key={metric}
                onClick={() => handleMetricToggle(metric)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  selectedMetrics.includes(metric)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
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
      </CardHeader>
      <CardContent>
        <div className="h-96">
          <ResponsiveLine
        data={chartData}
        margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
        xScale={{ type: 'point' }}
        yScale={{
          type: 'linear',
          min: 0,
          max: 1,
          stacked: false,
          reverse: false
        }}
        yFormat=" >-.3f"
        curve="monotoneX"
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: -45,
          legend: 'Time Period',
          legendOffset: 36,
          legendPosition: 'middle'
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Metric Value',
          legendOffset: -40,
          legendPosition: 'middle',
          format: '.2f'
        }}
        pointSize={8}
        pointColor={{ theme: 'background' }}
        pointBorderWidth={2}
        pointBorderColor={{ from: 'serieColor' }}
        pointLabelYOffset={-12}
        enablePointLabel={false}
        useMesh={true}
        onClick={handlePointClick}
        enableCrosshair={true}
        crosshairType="bottom-left"
        legends={[
          {
            anchor: 'bottom-right',
            direction: 'column',
            justify: false,
            translateX: 100,
            translateY: 0,
            itemsSpacing: 0,
            itemDirection: 'left-to-right',
            itemWidth: 80,
            itemHeight: 20,
            itemOpacity: 0.75,
            symbolSize: 12,
            symbolShape: 'circle',
            symbolBorderColor: 'rgba(0, 0, 0, .5)',
            effects: [
              {
                on: 'hover',
                style: {
                  itemBackground: 'rgba(0, 0, 0, .03)',
                  itemOpacity: 1
                }
              }
            ]
          }
        ]}
        animate={true}
        motionConfig="gentle"
      />
        </div>
      </CardContent>
    </Card>
  );
}
