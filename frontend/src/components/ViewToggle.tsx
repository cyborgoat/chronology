import { BarChart3, Table, Settings, Database } from 'lucide-react';
import type { ViewMode } from '../types';

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ViewToggleProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export function ViewToggle({ currentView, onViewChange }: ViewToggleProps) {
  return (
    <Tabs value={currentView} onValueChange={(value) => onViewChange(value as ViewMode)}>
      <TabsList className="grid grid-cols-4 w-full">
        <TabsTrigger value="chart" className="flex gap-2 items-center">
          <BarChart3 className="w-4 h-4" />
          Chart View
        </TabsTrigger>
        <TabsTrigger value="table" className="flex gap-2 items-center">
          <Table className="w-4 h-4" />
          Table View
        </TabsTrigger>
        <TabsTrigger value="metrics" className="flex gap-2 items-center">
          <Settings className="w-4 h-4" />
          Metrics
        </TabsTrigger>
        <TabsTrigger value="datasets" className="flex gap-2 items-center">
          <Database className="w-4 h-4" />
          Datasets
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
