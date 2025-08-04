import { Plus, Save, X, Lock, Unlock, Edit2, Download, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { tableStyles } from "../../utils/table/tableCore";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface TableToolbarProps {
  selectedProject: { name: string; records: Array<{ id: string }> };
  globalEditMode: boolean;
  onToggleEditMode: (pressed: boolean) => void;
  onShowAddForm: () => void;
  exportData: () => Array<Record<string, unknown>>;
}

export function TableToolbar({
  selectedProject,
  globalEditMode,
  onToggleEditMode,
  onShowAddForm,
  exportData
}: TableToolbarProps) {
  const handleExport = (format: 'csv' | 'xlsx' | 'json') => {
    const data = exportData();
    const filename = `${selectedProject.name}-data.${format}`;
    
    // Debug logging
    console.log('Exporting data:', {
      format,
      recordCount: data.length,
      sampleRecord: data[0]
    });
    
    if (format === 'json') {
      const jsonData = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      saveAs(blob, filename);
    } else if (format === 'csv') {
      // Convert to CSV
      const headers = Object.keys(data[0] || {});
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const value = row[header];
            // Escape commas and quotes in CSV
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        )
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      saveAs(blob, filename);
    } else if (format === 'xlsx') {
      // Convert to XLSX
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
      const xlsxBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([xlsxBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, filename);
    }
  };

  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          {selectedProject.name} - Data Records
          <Badge variant="secondary" className="text-xs">
            {selectedProject.records.length} records
          </Badge>
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage and edit your project metric data records across different AI models
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <Toggle
          pressed={globalEditMode}
          onPressedChange={onToggleEditMode}
          variant="outline"
          size="sm"
          className={`${globalEditMode ? tableStyles.editModeActive : tableStyles.editModeInactive}`}
        >
          {globalEditMode ? <Unlock className="w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
          {globalEditMode ? "Exit Edit Mode" : "Edit Mode"}
        </Toggle>
        
        <Button 
          onClick={onShowAddForm} 
          size="sm"
          disabled={globalEditMode}
          className={tableStyles.primaryButton}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Record
        </Button>

        {/* Export dropdown menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex gap-2 items-center">
              <Download className="w-4 h-4" />
              Export Data
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleExport('csv')}>
              <Download className="mr-2 w-4 h-4" />
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('xlsx')}>
              <Download className="mr-2 w-4 h-4" />
              Export as XLSX
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('json')}>
              <Download className="mr-2 w-4 h-4" />
              Export as JSON
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

interface PendingChangesBannerProps {
  hasPendingChanges: boolean;
  pendingChangesSummary: { edits: number; deletions: number; additions: number };
  onSave: () => void;
  onDiscard: () => void;
}

export function PendingChangesBanner({
  hasPendingChanges,
  pendingChangesSummary,
  onSave,
  onDiscard
}: PendingChangesBannerProps) {
  if (!hasPendingChanges) return null;

  return (
    <div className={`mt-4 p-3 rounded-md ${tableStyles.pendingChanges}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sky-800">
          <Edit2 className="w-4 h-4" />
          <div className="text-sm">
            <span className="font-medium">Pending Changes:</span>
            <div className="flex gap-4 mt-1 text-xs">
              {pendingChangesSummary.edits > 0 && (
                <span>{pendingChangesSummary.edits} edit(s)</span>
              )}
              {pendingChangesSummary.deletions > 0 && (
                <span className="text-red-600">{pendingChangesSummary.deletions} deletion(s)</span>
              )}
              {pendingChangesSummary.additions > 0 && (
                <span className="text-green-600">{pendingChangesSummary.additions} addition(s)</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={onSave} 
            size="sm" 
            className={`${tableStyles.primaryButton} text-xs`}
          >
            <Save className="w-3 h-3 mr-1" />
            Save All
          </Button>
          <Button 
            onClick={onDiscard} 
            size="sm" 
            variant="outline"
            className={`${tableStyles.secondaryButton} text-xs`}
          >
            <X className="w-3 h-3 mr-1" />
            Discard
          </Button>
        </div>
      </div>
    </div>
  );
} 