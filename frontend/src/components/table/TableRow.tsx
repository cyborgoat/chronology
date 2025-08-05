import { TableCell, TableRow as UITableRow } from "@/components/ui/table";
import type { ProjectMetric, MetricType } from "../../types";
import { tableRenderUtils, type TableEditState, type TableActionHandlers } from "../../utils/table/tableUtils";
import { DateCell, ModelCell, ModelVersionCell, MetricCell } from "./TableCell";
import { TableActions } from "./TableActions";
import { TABLE_CONSTANTS } from "../../utils/table/tableUtils";

interface DataTableRowProps {
  metric: ProjectMetric;
  index: number;
  sortedMetrics: ProjectMetric[];
  enabledDefaultMetrics: MetricType[];
  enabledCustomMetrics: string[];
  availableModels: string[];
  state: TableEditState;
  handlers: TableActionHandlers;
}

export function DataTableRow({
  metric,
  index,
  sortedMetrics,
  enabledDefaultMetrics,
  enabledCustomMetrics,
  availableModels,
  state,
  handlers
}: DataTableRowProps) {
  const {
    isInSingleEdit,
    isEditing,
    isMarkedForDeletion,
    className
  } = tableRenderUtils.getRowClasses(metric, index, sortedMetrics, state);

  const getInputValue = (field: string): string => {
    const value = tableRenderUtils.getInputValue(field, metric, state, state.globalEditMode);
    return String(value || "");
  };

  const getCustomMetricValue = (customId: string): string => {
    const value = tableRenderUtils.getCustomMetricValue(customId, metric, state, state.globalEditMode);
    return String(value || "");
  };

  const handleValueChange = (field: string, value: string | number | undefined) => {
    if (state.globalEditMode) {
      if (!state.bulkEditValues[metric.id]) {
        handlers.handleEdit(metric);
      }
      handlers.updateBulkEditValue(metric.id, field, value);
    } else {
      // For single edit mode, update the editValues
      handlers.updateEditValue(field, value);
    }
  };

  return (
    <UITableRow className={className}>
      <TableCell className={TABLE_CONSTANTS.MIN_COLUMN_WIDTHS.date}>
        <DateCell
          metric={metric}
          isEditing={isEditing}
          isGlobalEdit={state.globalEditMode}
          isMarkedForDeletion={isMarkedForDeletion}
          value={getInputValue("timestamp")}
          onValueChange={(value) => handleValueChange("timestamp", value)}
        />
      </TableCell>
      
      <TableCell className={TABLE_CONSTANTS.MIN_COLUMN_WIDTHS.model}>
        <ModelCell
          metric={metric}
          isEditing={isEditing}
          isGlobalEdit={state.globalEditMode}
          isMarkedForDeletion={isMarkedForDeletion}
          value={getInputValue("modelName")}
          onValueChange={(value) => handleValueChange("modelName", value)}
          datalistId={state.globalEditMode ? `available-models-bulk-${metric.id}` : "available-models-edit"}
          datalistOptions={availableModels}
        />
      </TableCell>
      <TableCell className={TABLE_CONSTANTS.MIN_COLUMN_WIDTHS.model}>
        <ModelVersionCell
          metric={metric}
          isEditing={isEditing}
          isGlobalEdit={state.globalEditMode}
          isMarkedForDeletion={isMarkedForDeletion}
          value={getInputValue("modelVersion")}
          onValueChange={(value) => handleValueChange("modelVersion", value)}
        />
      </TableCell>
      
      {enabledDefaultMetrics.map((key) => (
        <TableCell key={key} className={TABLE_CONSTANTS.MIN_COLUMN_WIDTHS.metric}>
          <MetricCell
            metric={metric}
            field={key}
            isEditing={isEditing}
            isGlobalEdit={state.globalEditMode}
            isMarkedForDeletion={isMarkedForDeletion}
            value={getInputValue(key)}
            onValueChange={(value) => handleValueChange(key, value)}
          />
        </TableCell>
      ))}
      
      {enabledCustomMetrics.map((customId) => (
        <TableCell key={customId} className={TABLE_CONSTANTS.MIN_COLUMN_WIDTHS.metric}>
          <MetricCell
            metric={metric}
            field={customId}
            isEditing={isEditing}
            isGlobalEdit={state.globalEditMode}
            isMarkedForDeletion={isMarkedForDeletion}
            value={getCustomMetricValue(customId)}
            onValueChange={(value) => handleValueChange(customId, value)}
          />
        </TableCell>
      ))}
      
      <TableCell className={TABLE_CONSTANTS.MIN_COLUMN_WIDTHS.actions}>
        <TableActions
          metric={metric}
          isGlobalEdit={state.globalEditMode}
          isInSingleEdit={isInSingleEdit}
          isMarkedForDeletion={isMarkedForDeletion}
          onEdit={() => handlers.handleEdit(metric)}
          onSave={handlers.handleSave}
          onCancel={handlers.handleCancel}
          onDelete={() => handlers.handleDelete(metric.id)}
          onToggleBulkDelete={() => handlers.toggleBulkDelete(metric.id)}
        />
      </TableCell>
    </UITableRow>
  );
} 