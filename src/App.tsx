import { useState } from "react";
import { ProjectProvider } from "./contexts/ProjectContext";
import { Header } from "./components/Header";
import { ProjectInfo } from "./components/ProjectInfo";
import { TimelineChart } from "./components/TimelineChart";
import { DataTable } from "./components/DataTable";
import { ViewToggle } from "./components/ViewToggle";
import { ProjectStats } from "./components/ProjectStats";
import type { ViewMode } from "./types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function AppContent() {
  const [currentView, setCurrentView] = useState<ViewMode>("chart");
  const [editingPoint, setEditingPoint] = useState<any>(null);

  const handlePointClick = (point: any) => {
    setEditingPoint(point);
    // You could open a modal here to edit the specific data point
    console.log("Point clicked:", point);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 space-y-8">
        {/* Project Information */}
        <ProjectInfo />

        {/* View Toggle */}
        <div className="flex justify-center">
          <div className="w-80">
            <ViewToggle
              currentView={currentView}
              onViewChange={setCurrentView}
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="space-y-6">
          {currentView === "chart" ? (
            <TimelineChart onPointClick={handlePointClick} />
          ) : (
            <DataTable />
          )}
        </div>

        {/* Project Stats */}
        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            <ProjectStats />
          </div>
        </div>
      </main>

      {/* Point Edit Modal - you could implement this for inline editing */}
      {editingPoint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-sm mx-4">
            <CardHeader>
              <CardTitle>Edit Data Point</CardTitle>
              <CardDescription>
                This feature can be extended to allow inline editing of chart
                points. For now, use the table view to edit data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setEditingPoint(null)} className="w-full">
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
