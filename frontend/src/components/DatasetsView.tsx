import { useState, useEffect } from 'react';
import { DatasetCard } from './DatasetCard';
import { EmptyState } from './chart/EmptyState';
import { Loader2 } from 'lucide-react';
import type { Dataset } from '@/types';
import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';

export function DatasetsView() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.datasets}`);
        if (!response.ok) {
          throw new Error('Failed to fetch datasets');
        }
        const data = await response.json();
        setDatasets(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDatasets();
  }, []);

  const handleDatasetClick = (dataset: Dataset) => {
    // TODO: Implement dataset selection/viewing functionality
    console.log('Dataset clicked:', dataset);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Error Loading Datasets"
        description={error}
        icon="alert-circle"
      />
    );
  }

  if (datasets.length === 0) {
    return (
      <EmptyState
        title="No Datasets Available"
        description="No CSV datasets found in the backend dataset folder."
        icon="database"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Datasets</h2>
        <p className="text-muted-foreground">
          Browse and explore available CSV datasets
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {datasets.map((dataset) => (
          <DatasetCard
            key={dataset.id}
            dataset={dataset}
            onClick={() => handleDatasetClick(dataset)}
          />
        ))}
      </div>
    </div>
  );
} 