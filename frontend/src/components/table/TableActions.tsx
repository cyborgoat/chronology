import { Pencil, Trash2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";

import { tableStyles } from "../../utils/table/tableCore";
import { TABLE_CONSTANTS } from "../../utils/table/tableUtils";

interface TableActionsProps {
  isGlobalEdit: boolean;
  isInSingleEdit: boolean;
  isMarkedForDeletion: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onToggleBulkDelete: () => void;
}

export function TableActions({
  isGlobalEdit,
  isInSingleEdit,
  isMarkedForDeletion,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onToggleBulkDelete
}: TableActionsProps) {
  if (isGlobalEdit) {
    return (
      <div className="flex gap-1">
        <Button
          onClick={onToggleBulkDelete}
          size="sm"
          variant={isMarkedForDeletion ? "default" : "ghost"}
          className={
            isMarkedForDeletion 
              ? `${tableStyles.destructiveButton} bg-red-600 hover:bg-red-700 text-white ${TABLE_CONSTANTS.BUTTON_SIZES.sm}` 
              : `${tableStyles.destructiveButton} ${TABLE_CONSTANTS.BUTTON_SIZES.sm}`
          }
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    );
  }

  if (isInSingleEdit) {
    return (
      <div className="flex gap-1">
        <Button
          onClick={onSave}
          size="sm"
          className={`${tableStyles.primaryButton} ${TABLE_CONSTANTS.BUTTON_SIZES.md} text-xs`}
        >
          <Save className="w-3 h-3 mr-1" />
          Save
        </Button>
        <Button
          onClick={onCancel}
          size="sm"
          variant="outline"
          className={`${tableStyles.secondaryButton} ${TABLE_CONSTANTS.BUTTON_SIZES.md} text-xs`}
        >
          <X className="w-3 h-3 mr-1" />
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-1">
      <Button
        onClick={onEdit}
        size="sm"
        variant="ghost"
        className="text-slate-600 hover:text-slate-800 hover:bg-slate-100 h-8 px-2 transition-colors"
      >
        <Pencil className="w-3 h-3" />
      </Button>
      <Button
        onClick={onDelete}
        size="sm"
        variant="ghost"
        className="text-red-600 hover:text-red-800 hover:bg-red-50 h-8 px-2 transition-colors"
      >
        <Trash2 className="w-3 h-3" />
      </Button>
    </div>
  );
} 