import { BarChart3, Table } from 'lucide-react';
import type { ViewMode } from '../types';

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ViewToggleProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export function ViewToggle({ currentView, onViewChange }: ViewToggleProps) {
  return (
    <Tabs value={currentView} onValueChange={(value) => onViewChange(value as ViewMode)}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="chart" className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Chart View
        </TabsTrigger>
        <TabsTrigger value="table" className="flex items-center gap-2">
          <Table className="w-4 h-4" />
          Table View
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
