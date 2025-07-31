import { useState } from 'react';
import { ProjectProvider } from './contexts/ProjectContext';
import { TimelineChart } from './components/TimelineChart';
import { DataTable } from './components/DataTable';
import { ProjectSelector } from './components/ProjectSelector';
import { MetricSelector } from './components/MetricSelector';
import { ViewToggle } from './components/ViewToggle';
import { ProjectStats } from './components/ProjectStats';
import type { ViewMode } from './types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function AppContent() {
  const [currentView, setCurrentView] = useState<ViewMode>('chart');
  const [editingPoint, setEditingPoint] = useState<any>(null);

  const handlePointClick = (point: any) => {
    setEditingPoint(point);
    // You could open a modal here to edit the specific data point
    console.log('Point clicked:', point);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Chronology</h1>
          <p className="text-lg text-muted-foreground">
            AI Project Performance Timeline Visualization
          </p>
        </header>
        
        <div className="space-y-6">
          {/* Project Selection */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Project Management</CardTitle>
            </CardHeader>
            <CardContent>
              <ProjectSelector />
            </CardContent>
          </Card>

          {/* Metric Selection */}
          <MetricSelector />

          {/* Project Statistics */}
          <ProjectStats />

          {/* View Toggle */}
          <div className="flex justify-between items-center">
            <ViewToggle currentView={currentView} onViewChange={setCurrentView} />
            <div className="text-sm text-muted-foreground">
              {currentView === 'chart' 
                ? 'Interactive timeline chart - click points to edit' 
                : 'Editable data table - manage your metrics'
              }
            </div>
          </div>

          {/* Main Content Area */}
          <div className="min-h-96">
            {currentView === 'chart' ? (
              <TimelineChart onPointClick={handlePointClick} />
            ) : (
              <DataTable />
            )}
          </div>

          {/* Instructions */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-800">How to use Chronology:</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• <strong>Select a project</strong> from the dropdown or create a new one</li>
                <li>• <strong>Choose metrics</strong> to display in the timeline (accuracy, loss, precision, etc.)</li>
                <li>• <strong>Switch between views</strong> - Chart for visualization, Table for data management</li>
                <li>• <strong>Add new metrics</strong> using the "Add Metric" button in table view</li>
                <li>• <strong>Edit existing data</strong> by clicking the edit button in table view or clicking chart points</li>
                <li>• <strong>Track progress</strong> with real-time statistics and trend indicators</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Point Edit Modal - you could implement this for inline editing */}
      {editingPoint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-sm mx-4">
            <CardHeader>
              <CardTitle>Edit Data Point</CardTitle>
              <CardDescription>
                This feature can be extended to allow inline editing of chart points.
                For now, use the table view to edit data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setEditingPoint(null)}
                className="w-full"
              >
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <ProjectProvider>
      <AppContent />
    </ProjectProvider>
  );
}

export default App;
