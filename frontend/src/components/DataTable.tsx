import { useProjects } from "../contexts/useProjectContext";
import { Plus } from "lucide-react";
import { DataTableContent } from "./DataTableContent";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

export function DataTable() {
  const {
    selectedProject,
    updateMetricRecord,
    deleteMetricRecord,
    addMetricRecord,
    getAvailableModels,
  } = useProjects();

  if (!selectedProject) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-full bg-muted p-4">
                <Plus className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-lg">No Project Selected</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Select a project from the sidebar to view and manage its data records
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <DataTableContent
      selectedProject={selectedProject}
      updateMetricRecord={updateMetricRecord}
      deleteMetricRecord={deleteMetricRecord}
      addMetricRecord={addMetricRecord}
      getAvailableModels={getAvailableModels}
    />
  );
}
