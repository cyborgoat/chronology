import { useState } from 'react';
import { useProjects } from '../contexts/useProjectContext';
import { Plus, Folder, Calendar, Trash2, Edit3 } from 'lucide-react';
import type { Project } from '../types';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ProjectSelector() {
  const { 
    projects, 
    selectedProjectId, 
    selectProject, 
    addProject, 
    updateProject, 
    deleteProject 
  } = useProjects();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3b82f6'
  });

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const handleProjectSelect = (projectId: string) => {
    selectProject(projectId);
  };

  const handleAddProject = () => {
    if (formData.name.trim()) {
      addProject({
        name: formData.name.trim(),
        description: formData.description.trim(),
        color: formData.color,
        records: [],
        metricsConfig: []
      });
      setFormData({ name: '', description: '', color: '#3b82f6' });
      setShowAddForm(false);
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description,
      color: project.color
    });
    setShowAddForm(true);
  };

  const handleUpdateProject = () => {
    if (editingProject && formData.name.trim()) {
      updateProject(editingProject.id, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        color: formData.color
      });
      setEditingProject(null);
      setFormData({ name: '', description: '', color: '#3b82f6' });
      setShowAddForm(false);
    }
  };

  const handleDeleteProject = (project: Project) => {
    if (confirm(`Are you sure you want to delete "${project.name}"? This will delete all associated metrics.`)) {
      deleteProject(project.id);
    }
  };

  const cancelForm = () => {
    setShowAddForm(false);
    setEditingProject(null);
    setFormData({ name: '', description: '', color: '#3b82f6' });
  };

  return (
    <div className="space-y-4">
      {/* Main Project Selection Row */}
      <div className="flex gap-3 items-center">
        <div className="flex-1">
          <Select value={selectedProjectId || ""} onValueChange={handleProjectSelect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a project..." />
            </SelectTrigger>
            <SelectContent>
              {projects.map(project => (
                <SelectItem key={project.id} value={project.id}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="font-medium">{project.name}</span>
                    {project.description && (
                      <span className="text-xs text-muted-foreground ml-1">
                        • {project.description.slice(0, 30)}{project.description.length > 30 ? '...' : ''}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={() => setShowAddForm(true)} size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-1" />
          New
        </Button>

        {/* Project Actions */}
        {selectedProject && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="px-2">
                <Edit3 className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEditProject(selectedProject)}>
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Project
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleDeleteProject(selectedProject)}
                className="text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Compact Project Info */}
      {selectedProject && (
        <div className="flex items-center gap-4 text-sm text-muted-foreground bg-muted/30 rounded-md p-2">
          <span className="flex items-center gap-1">
            <Folder className="w-3 h-3" />
            {selectedProject.records.length} records
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(selectedProject.updatedAt).toLocaleDateString()}
          </span>
        </div>
      )}

      {/* Add/Edit Project Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>
                {editingProject ? 'Edit Project' : 'New Project'}
              </CardTitle>
              <CardDescription>
                {editingProject 
                  ? 'Update project details' 
                  : 'Create a new AI project to track'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Project name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
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
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-10 h-8 border border-input rounded cursor-pointer"
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    placeholder="#3b82f6"
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={editingProject ? handleUpdateProject : handleAddProject}
                  disabled={!formData.name.trim()}
                  className="flex-1"
                >
                  {editingProject ? 'Update' : 'Create'}
                </Button>
                <Button variant="outline" onClick={cancelForm} className="flex-1">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
