import { useState } from "react";
import { useProjects } from "../contexts/ProjectContext";
import { Plus, Trash2, Edit3 } from "lucide-react";
import type { Project } from "../types";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function Header() {
  const {
    projects,
    selectedProjectId,
    selectProject,
    addProject,
    updateProject,
    deleteProject,
  } = useProjects();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#3b82f6",
  });

  // Filter projects based on search query
  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Show dropdown when focused or has search query
  const showDropdown = isSearchFocused || searchQuery.length > 0;
  // Show all projects when focused but no search query, filtered when searching
  const projectsToShow = searchQuery.length > 0 ? filteredProjects : projects;

  const handleProjectSelect = (projectId: string) => {
    selectProject(projectId);
  };

  const handleAddProject = () => {
    if (formData.name.trim()) {
      addProject({
        name: formData.name.trim(),
        description: formData.description.trim(),
        color: formData.color,
        metrics: [],
      });
      setFormData({ name: "", description: "", color: "#3b82f6" });
      setShowAddForm(false);
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description,
      color: project.color,
    });
    setShowAddForm(true);
  };

  const handleUpdateProject = () => {
    if (editingProject && formData.name.trim()) {
      updateProject(editingProject.id, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        color: formData.color,
      });
      setEditingProject(null);
      setFormData({ name: "", description: "", color: "#3b82f6" });
      setShowAddForm(false);
    }
  };

  const handleDeleteProject = (project: Project) => {
    if (
      confirm(
        `⚠️ WARNING: This action is IRREVERSIBLE!\n\nAre you absolutely sure you want to delete "${project.name}"?\n\nThis will permanently delete:\n• The project and all its data\n• All associated metrics\n• All timeline history\n\nThis cannot be undone. Type the project name to confirm deletion.`
      )
    ) {
      // Additional confirmation by asking user to type project name
      const confirmation = prompt(
        `To confirm deletion, please type the project name exactly as shown:\n\n"${project.name}"`
      );
      
      if (confirmation === project.name) {
        deleteProject(project.id);
        // Close the edit form after deletion
        cancelForm();
      } else if (confirmation !== null) {
        alert("Project name didn't match. Deletion cancelled for your safety.");
      }
    }
  };

  const cancelForm = () => {
    setShowAddForm(false);
    setEditingProject(null);
    setFormData({ name: "", description: "", color: "#3b82f6" });
  };

  return (
    <>
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-4xl px-4">
        <div className="bg-stone-300/30 backdrop-blur-md border rounded-lg shadow-lg hover:bg-background/100 transition-all duration-200">
          <div className="flex items-center gap-4 p-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Input
                placeholder="Search projects by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                className="w-full"
              />
              
              {/* Search Results Dropdown */}
              {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg max-h-60 overflow-y-auto z-10">
                  {projectsToShow.length > 0 ? (
                    <div className="p-2">
                      {projectsToShow.map((project) => (
                        <div
                          key={project.id}
                          className={`flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors ${
                            selectedProjectId === project.id ? 'bg-muted' : ''
                          }`}
                          onClick={() => {
                            handleProjectSelect(project.id);
                            setSearchQuery(''); // Clear search after selection
                            setIsSearchFocused(false);
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-1 h-1 rounded-full"
                              style={{ backgroundColor: project.color }}
                            />
                            <div>
                              <div className="font-normal text-sm">{project.name}</div>
                              {project.description && (
                                <div className="text-xs text-muted-foreground">
                                  {project.description.slice(0, 50)}
                                  {project.description.length > 50 ? "..." : ""}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="px-2 h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditProject(project);
                            }}
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : searchQuery ? (
                    <div className="text-center py-6 text-muted-foreground">
                      No projects found matching "{searchQuery}"
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      No projects yet. Create your first project!
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Add New Project Button */}
            <Button
              onClick={() => setShowAddForm(true)}
              size="sm"
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>
      </div>

      {/* Add/Edit Project Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>
                {editingProject ? "Edit Project" : "New Project"}
              </CardTitle>
              <CardDescription>
                {editingProject
                  ? "Update project details"
                  : "Create a new AI project to track"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Project name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Brief description"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="color"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        color: e.target.value,
                      }))
                    }
                    className="w-10 h-8 border border-input rounded cursor-pointer"
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        color: e.target.value,
                      }))
                    }
                    placeholder="#3b82f6"
                    className="flex-1"
                  />
                </div>
              </div>

              {editingProject && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="text-sm text-red-800 font-medium mb-1">
                    ⚠️ Danger Zone
                  </div>
                  <div className="text-xs text-red-600">
                    Deleting this project will permanently remove all associated data and cannot be undone.
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={
                    editingProject ? handleUpdateProject : handleAddProject
                  }
                  disabled={!formData.name.trim()}
                  className="flex-1"
                >
                  {editingProject ? "Update" : "Create"}
                </Button>
                <Button
                  variant="outline"
                  onClick={cancelForm}
                  className="flex-1"
                >
                  Cancel
                </Button>
                {editingProject && (
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteProject(editingProject)}
                    className="flex-1"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
