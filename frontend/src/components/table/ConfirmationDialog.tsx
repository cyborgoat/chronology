import { Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  onDiscard: () => void;
  pendingChangesSummary: { edits: number; deletions: number; additions: number };
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  onSave,
  onDiscard,
  pendingChangesSummary
}: ConfirmationDialogProps) {
  const hasChanges = pendingChangesSummary.edits > 0 || pendingChangesSummary.deletions > 0 || pendingChangesSummary.additions > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Unsaved Changes</DialogTitle>
          <DialogDescription>
            You have unsaved changes that will be lost if you exit edit mode. Would you like to save your changes or discard them?
          </DialogDescription>
        </DialogHeader>
        
        {hasChanges && (
          <div className="text-sm text-muted-foreground">
            <div className="flex gap-4">
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
        )}
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onDiscard}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Discard Changes
          </Button>
          <Button
            onClick={onSave}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 