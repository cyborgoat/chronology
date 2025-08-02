import { useProjects } from '../contexts/ProjectContext';
import { TrendingUp, TrendingDown, BarChart, Calendar } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ProjectStats() {
  const { selectedProject, selectedMetrics } = useProjects();

  if (!selectedProject || selectedProject.records.length === 0) {
    return null;
  }

  const sortedMetrics = [...selectedProject.records].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const getLatestValue = (metricKey: string) => {
    const latest = sortedMetrics[sortedMetrics.length - 1];
    return latest[metricKey] as number | undefined;
  };

  const getImprovement = (metricKey: string) => {
    if (sortedMetrics.length < 2) return null;
    
    const latest = sortedMetrics[sortedMetrics.length - 1][metricKey] as number | undefined;
    const previous = sortedMetrics[sortedMetrics.length - 2][metricKey] as number | undefined;
    
    if (latest === undefined || previous === undefined) return null;
    
    const improvement = latest - previous;
    const percentChange = (improvement / previous) * 100;
    
    return {
      absolute: improvement,
      percent: percentChange,
      isPositive: improvement > 0
    };
  };

  const formatValue = (value: number | undefined) => {
    return value !== undefined ? value.toFixed(3) : '-';
  };

  const formatPercent = (value: number) => {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const stats = selectedMetrics.map(metric => ({
    key: metric,
    label: metric.charAt(0).toUpperCase() + metric.slice(1),
    value: getLatestValue(metric),
    improvement: getImprovement(metric)
  })).filter(stat => stat.value !== undefined);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
