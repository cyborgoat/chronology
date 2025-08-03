import { Plus, Save, X, Lock, Unlock, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { Badge } from "@/components/ui/badge";
import { tableStyles } from "../../utils/table/tableCore";

interface TableToolbarProps {
  selectedProject: { name: string; records: Array<{ id: string }> };
  globalEditMode: boolean;
  onToggleEditMode: (pressed: boolean) => void;
  onShowAddForm: () => void;
}

export function TableToolbar({
  selectedProject,
  globalEditMode,
  onToggleEditMode,
  onShowAddForm
}: TableToolbarProps) {
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