import { useProjects } from '../contexts/useProjectContext';
import { TrendingUp, TrendingDown, BarChart, Calendar } from 'lucide-react';
import { formatMetricValue, getLatestValue, getImprovement, formatPercent, sortRecordsByTimestamp, capitalizeFirst } from '../utils';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ProjectStats() {
  const { selectedProject, selectedMetrics } = useProjects();

  if (!selectedProject || selectedProject.records.length === 0) {
    return null;
  }

  const sortedMetrics = sortRecordsByTimestamp(selectedProject.records);

  const formatValue = (value: number | undefined) => {
    return formatMetricValue(value);
  };

  const stats = selectedMetrics.map(metric => ({
    key: metric,
    label: capitalizeFirst(metric),
    value: getLatestValue(sortedMetrics, metric),
    improvement: getImprovement(sortedMetrics, metric)
  })).filter(stat => stat.value !== undefined);

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 xl:grid-cols-6 gap-4">
      {stats.map(stat => (
        <Card key={stat.key}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatValue(stat.value)}</div>
            {stat.improvement && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {stat.improvement.isPositive ? (
                  <TrendingUp className="h-3 w-3 text-green-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600" />
                )}
                <span className={stat.improvement.isPositive ? 'text-green-600' : 'text-red-600'}>
                  {formatPercent(stat.improvement.percent)}
                </span>
                <span>from last</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Metrics</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{selectedProject.records.length}</div>
          <p className="text-xs text-muted-foreground">
            Data points recorded
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
