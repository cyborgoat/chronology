import { useProjects } from "../contexts/useProjectContext";
import { Calendar, Folder } from "lucide-react";

export function ProjectInfo() {
  const { selectedProject } = useProjects();

  if (!selectedProject) {
    return (
      <div className="max-w-full mx-auto">
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <p className="text-muted-foreground font-medium">
              No project selected
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Choose a project from the floating menu above to get started
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto bg-gradient-to-br from-background to-muted/20 rounded-lg p-6">
      <div className="text-center pb-4">
        <h2 className="text-2xl font-medium tracking-tight mb-2">
          {selectedProject.name}
        </h2>
        <p className="text-base leading-relaxed mx-auto text-muted-foreground">
          {selectedProject.description}
        </p>
      </div>
      <div>
        <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 hover:text-foreground transition-colors">
            <Folder className="w-4 h-4" />
            <span>{selectedProject.records.length} metrics recorded</span>
          </div>
          <div className="flex items-center gap-2 hover:text-foreground transition-colors">
            <Calendar className="w-4 h-4" />
            <span>
              Last updated{" "}
              {new Date(selectedProject.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
