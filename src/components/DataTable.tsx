import { useState } from 'react';
import { useProjects } from '../contexts/ProjectContext';
import { metricLabels } from '../data/sampleData';
import type { ProjectMetric, MetricType } from '../types';
import { Pencil, Trash2, Plus, Save, X } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function DataTable() {
  const { selectedProject, updateMetric, deleteMetric, addMetric } = useProjects();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<ProjectMetric>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMetric, setNewMetric] = useState<Partial<ProjectMetric>>({
    timestamp: new Date().toISOString().split('T')[0],
  });

  if (!selectedProject) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <p className="text-muted-foreground">Select a project to view its data</p>
        </CardContent>
      </Card>
    );
  }

  const handleEdit = (metric: ProjectMetric) => {
    setEditingId(metric.id);
    setEditValues(metric);
  };

  const handleSave = () => {
    if (editingId && selectedProject) {
      updateMetric(selectedProject.id, editingId, editValues);
      setEditingId(null);
      setEditValues({});
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValues({});
  };

  const handleDelete = (metricId: string) => {
    if (selectedProject && confirm('Are you sure you want to delete this metric?')) {
      deleteMetric(selectedProject.id, metricId);
    }
  };

  const handleAddMetric = () => {
    if (selectedProject && newMetric.timestamp) {
      addMetric(selectedProject.id, newMetric as Omit<ProjectMetric, 'id'>);
      setNewMetric({ timestamp: new Date().toISOString().split('T')[0] });
      setShowAddForm(false);
    }
  };

  const metricKeys: MetricType[] = ['accuracy', 'loss', 'precision', 'recall', 'f1Score'];

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{selectedProject.name} - Data Table</CardTitle>
            <CardDescription>
              Manage and edit your project metrics data
            </CardDescription>
          </div>
          <Button onClick={() => setShowAddForm(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Metric
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                {metricKeys.map(key => (
                  <TableHead key={key}>{metricLabels[key]}</TableHead>
                ))}
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedProject.metrics.map(metric => (
                <TableRow key={metric.id}>
                  <TableCell>
                    {editingId === metric.id ? (
                      <Input
                        type="date"
                        value={editValues.timestamp?.split('T')[0] || ''}
                        onChange={(e) => setEditValues(prev => ({ ...prev, timestamp: e.target.value }))}
                        className="w-full"
                      />
                    ) : (
                      new Date(metric.timestamp).toLocaleDateString()
                    )}
                  </TableCell>
                  {metricKeys.map(key => (
                    <TableCell key={key}>
                      {editingId === metric.id ? (
                        <Input
                          type="number"
                          min="0"
                          max="1"
                          step="0.001"
                          value={editValues[key] || ''}
                          onChange={(e) => setEditValues(prev => ({ 
                            ...prev, 
                            [key]: e.target.value ? parseFloat(e.target.value) : undefined 
                          }))}
                          className="w-20"
                        />
                      ) : (
                        metric[key]?.toFixed(3) || '-'
                      )}
                    </TableCell>
                  ))}
                  <TableCell>
                    {editingId === metric.id ? (
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSave}
                          size="sm"
                          variant="ghost"
                          className="text-green-600 hover:text-green-800"
                        >
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={handleCancel}
                          size="sm"
                          variant="ghost"
                          className="text-gray-600 hover:text-gray-800"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEdit(metric)}
                          size="sm"
                          variant="ghost"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(metric.id)}
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              
              {showAddForm && (
                <TableRow className="bg-muted/50">
                  <TableCell>
                    <Input
                      type="date"
                      value={newMetric.timestamp?.split('T')[0] || ''}
                      onChange={(e) => setNewMetric(prev => ({ ...prev, timestamp: e.target.value }))}
                      required
                    />
                  </TableCell>
                  {metricKeys.map(key => (
                    <TableCell key={key}>
                      <Input
                        type="number"
                        min="0"
                        max="1"
                        step="0.001"
                        value={newMetric[key] || ''}
                        onChange={(e) => setNewMetric(prev => ({ 
                          ...prev, 
                          [key]: e.target.value ? parseFloat(e.target.value) : undefined 
                        }))}
                        className="w-20"
                        placeholder="0.000"
                      />
                    </TableCell>
                  ))}
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleAddMetric}
                        size="sm"
                        variant="ghost"
                        className="text-green-600 hover:text-green-800"
                      >
                        <Save className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => {
                          setShowAddForm(false);
                          setNewMetric({ timestamp: new Date().toISOString().split('T')[0] });
                        }}
                        size="sm"
                        variant="ghost"
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {selectedProject.metrics.length === 0 && !showAddForm && (
          <div className="text-center py-8 text-muted-foreground">
            No metrics data available. Click "Add Metric" to get started.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
