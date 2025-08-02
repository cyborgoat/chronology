import { useProjects } from '../contexts/useProjectContext';
import { metricLabels, metricColors } from '../data/sampleData';
import type { MetricType } from '../types';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export function MetricSelector() {
  const { selectedMetrics, setSelectedMetrics } = useProjects();

  const allMetrics: MetricType[] = ['accuracy', 'loss', 'precision', 'recall', 'f1Score'];

  const handleMetricToggle = (metric: MetricType) => {
    const newMetrics = selectedMetrics.includes(metric)
      ? selectedMetrics.filter((m: MetricType) => m !== metric)
      : [...selectedMetrics, metric];
    setSelectedMetrics(newMetrics);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Metrics to Display</CardTitle>
        <CardDescription>
          Choose which metrics to show in the timeline chart
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {allMetrics.map(metric => (
            <Label 
              key={metric}
              className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors"
              htmlFor={`metric-${metric}`}
            >
              <input
                id={`metric-${metric}`}
                type="checkbox"
                checked={selectedMetrics.includes(metric)}
                onChange={() => handleMetricToggle(metric)}
                className="sr-only"
              />
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                selectedMetrics.includes(metric)
                  ? 'border-primary bg-primary'
                  : 'border-input'
              }`}>
                {selectedMetrics.includes(metric) && (
                  <svg className="w-3 h-3 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: metricColors[metric as keyof typeof metricColors] }}
              />
              <span className="text-sm font-medium">
                {metricLabels[metric as keyof typeof metricLabels]}
              </span>
            </Label>
          ))}
        </div>
        
        {selectedMetrics.length === 0 && (
          <p className="text-sm text-muted-foreground mt-3 text-center">
            Please select at least one metric to display in the timeline chart
          </p>
        )}
      </CardContent>
    </Card>
  );
}
