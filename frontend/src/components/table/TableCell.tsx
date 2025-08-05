import { Input } from "@/components/ui/input";
import type { ProjectMetric } from "../../types";
import { tableValidationUtils, TABLE_CONSTANTS } from "../../utils/table/tableUtils";

interface TableCellProps {
  metric: ProjectMetric;
  field: string;
  isEditing: boolean;
  isGlobalEdit: boolean;
  isMarkedForDeletion: boolean;
  value: string | number;
  inputType?: "text" | "number" | "date";
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  datalistId?: string;
  datalistOptions?: string[];
  onValueChange: (value: string | number | undefined) => void;
  displayValue?: string;
  displayComponent?: React.ReactNode;
}

export function DataTableCell({
  isEditing,
  isMarkedForDeletion,
  value,
  inputType = "text",
  placeholder,
  min,
  max,
  step,
  datalistId,
  onValueChange,
  displayValue,
  displayComponent
}: TableCellProps) {
  if (isEditing) {
    return (
      <Input
        type={inputType}
        value={String(value)}
        onChange={(e) => {
          if (inputType === "number") {
            // For number inputs, allow empty string and "0" as valid input states
            const inputValue = e.target.value;
            if (inputValue === "" || inputValue === "0") {
              onValueChange(inputValue);
            } else {
              const numValue = tableValidationUtils.validateMetricValue(inputValue);
              onValueChange(numValue !== undefined ? numValue : inputValue);
            }
          } else {
            onValueChange(e.target.value);
          }
        }}
        className={`${TABLE_CONSTANTS.INPUT_CLASSES} ${isMarkedForDeletion ? 'opacity-50' : ''}`}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        list={datalistId}
        disabled={isMarkedForDeletion}
      />
    );
  }

  if (displayComponent) {
    return displayComponent;
  }

  return (
    <span className="text-sm block py-1.5">
      {displayValue || tableValidationUtils.formatMetricValue(value)}
    </span>
  );
}

interface DateCellProps {
  metric: ProjectMetric;
  isEditing: boolean;
  isGlobalEdit: boolean;
  isMarkedForDeletion: boolean;
  value: string;
  onValueChange: (value: string | number | undefined) => void;
}

export function DateCell({
  metric,
  isEditing,
  isGlobalEdit,
  isMarkedForDeletion,
  value,
  onValueChange
}: DateCellProps) {
  // Format the date value for HTML date input (YYYY-MM-DD format)
  const formatDateForInput = (dateValue: string | number) => {
    if (!dateValue) return "";
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split('T')[0];
  };

  // Use the value prop for display, which contains the current edit state
  const displayValue = value ? new Date(value).toLocaleDateString() : new Date(metric.timestamp).toLocaleDateString();
  const inputValue = formatDateForInput(value || metric.timestamp);
  
  return (
    <DataTableCell
      metric={metric}
      field="timestamp"
      isEditing={isEditing}
      isGlobalEdit={isGlobalEdit}
      isMarkedForDeletion={isMarkedForDeletion}
      value={inputValue}
      inputType="date"
      onValueChange={onValueChange}
      displayValue={displayValue}
    />
  );
}

interface ModelCellProps {
  metric: ProjectMetric;
  isEditing: boolean;
  isGlobalEdit: boolean;
  isMarkedForDeletion: boolean;
  value: string;
  onValueChange: (value: string | number | undefined) => void;
  datalistId: string;
  datalistOptions: string[];
}

export function ModelCell({
  metric,
  isEditing,
  isGlobalEdit,
  isMarkedForDeletion,
  value,
  onValueChange,
  datalistId,
  datalistOptions
}: ModelCellProps) {
  return (
    <>
      <DataTableCell
        metric={metric}
        field="modelName"
        isEditing={isEditing}
        isGlobalEdit={isGlobalEdit}
        isMarkedForDeletion={isMarkedForDeletion}
        value={value}
        inputType="text"
        placeholder="Model name"
        datalistId={datalistId}
        onValueChange={onValueChange}
        displayValue={metric.modelName || "-"}
      />
      <datalist id={datalistId}>
        {datalistOptions.map((model) => (
          <option key={model} value={model} />
        ))}
      </datalist>
    </>
  );
}

interface ModelVersionCellProps {
  metric: ProjectMetric;
  isEditing: boolean;
  isGlobalEdit: boolean;
  isMarkedForDeletion: boolean;
  value: string;
  onValueChange: (value: string | number | undefined) => void;
}

export function ModelVersionCell({
  metric,
  isEditing,
  isGlobalEdit,
  isMarkedForDeletion,
  value,
  onValueChange
}: ModelVersionCellProps) {
  return (
    <DataTableCell
      metric={metric}
      field="modelVersion"
      isEditing={isEditing}
      isGlobalEdit={isGlobalEdit}
      isMarkedForDeletion={isMarkedForDeletion}
      value={value}
      inputType="text"
      placeholder="Model version"
      onValueChange={onValueChange}
      displayValue={metric.modelVersion || "-"}
    />
  );
}

interface MetricCellProps {
  metric: ProjectMetric;
  field: string;
  isEditing: boolean;
  isGlobalEdit: boolean;
  isMarkedForDeletion: boolean;
  value: string | number;
  onValueChange: (value: string | number | undefined) => void;
}

export function MetricCell({
  metric,
  field,
  isEditing,
  isGlobalEdit,
  isMarkedForDeletion,
  value,
  onValueChange
}: MetricCellProps) {
  // Get the actual metric value for display
  // Check if it's a default metric first, then check additionalMetrics
  const metricValue = metric[field as keyof ProjectMetric] as number | undefined;
  const customMetricValue = metric.additionalMetrics?.[field] as number | undefined;
  const displayValue = typeof metricValue === 'number' ? metricValue.toFixed(3) : 
                     typeof customMetricValue === 'number' ? customMetricValue.toFixed(3) : 
                     String(metricValue || customMetricValue || "-");
  
  return (
    <DataTableCell
      metric={metric}
      field={field}
      isEditing={isEditing}
      isGlobalEdit={isGlobalEdit}
      isMarkedForDeletion={isMarkedForDeletion}
      value={value}
      inputType="number"
      min={0}
      max={1}
      step={0.001}
      placeholder="0.000"
      onValueChange={onValueChange}
      displayValue={displayValue}
    />
  );
} 