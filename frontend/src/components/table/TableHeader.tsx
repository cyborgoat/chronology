import { ChevronUp, ChevronDown } from "lucide-react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { metricLabels } from "../../data/sampleData";
import type { MetricType } from "../../types";
import { tableStyles } from "../../utils/table/tableCore";
import { TABLE_CONSTANTS } from "../../utils/table/tableUtils";

interface TableHeaderProps {
  enabledDefaultMetrics: MetricType[];
  enabledCustomMetrics: string[];
  customMetrics: Array<{ id: string; name?: string }>;
  sortConfig: { key: string; direction: 'asc' | 'desc' } | null;
  onSort: (key: string) => void;
}

export function DataTableHeader({
  enabledDefaultMetrics,
  enabledCustomMetrics,
  customMetrics,
  sortConfig,
  onSort
}: TableHeaderProps) {
  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ChevronUp className="w-4 h-4 opacity-30" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="w-4 h-4 ml-1" />
    ) : (
      <ChevronDown className="w-4 h-4 ml-1" />
    );
  };

  return (
    <TableHeader>
      <TableRow className="bg-muted/50">
        <TableHead 
          className={`font-semibold ${tableStyles.sortableHeader} ${TABLE_CONSTANTS.MIN_COLUMN_WIDTHS.date}`}
          onClick={() => onSort('timestamp')}
        >
          <div className="flex items-center justify-between">
            <span>Date</span>
            <div className="w-4 h-4 flex items-center justify-center ml-2">
              {getSortIcon('timestamp')}
            </div>
          </div>
        </TableHead>
        <TableHead 
          className={`font-semibold ${tableStyles.sortableHeader} ${TABLE_CONSTANTS.MIN_COLUMN_WIDTHS.model}`}
          onClick={() => onSort('modelName')}
        >
          <div className="flex items-center justify-between">
            <span>Model</span>
            <div className="w-4 h-4 flex items-center justify-center ml-2">
              {getSortIcon('modelName')}
            </div>
          </div>
        </TableHead>
        <TableHead 
          className={`font-semibold ${tableStyles.sortableHeader} ${TABLE_CONSTANTS.MIN_COLUMN_WIDTHS.model}`}
          onClick={() => onSort('modelVersion')}
        >
          <div className="flex items-center justify-between">
            <span>Version</span>
            <div className="w-4 h-4 flex items-center justify-center ml-2">
              {getSortIcon('modelVersion')}
            </div>
          </div>
        </TableHead>
        {enabledDefaultMetrics.map((key) => (
          <TableHead 
            key={key} 
            className={`font-semibold ${tableStyles.sortableHeader} ${TABLE_CONSTANTS.MIN_COLUMN_WIDTHS.metric}`}
            onClick={() => onSort(key)}
          >
            <div className="flex items-center justify-between">
              <span className="truncate">{metricLabels[key as keyof typeof metricLabels]}</span>
              <div className="w-4 h-4 flex items-center justify-center ml-1">
                {getSortIcon(key)}
              </div>
            </div>
          </TableHead>
        ))}
        {enabledCustomMetrics.map((customId) => {
          const customMetric = customMetrics?.find(
            (m) => m.id === customId
          );
          return (
            <TableHead 
              key={customId} 
              className={`font-semibold ${tableStyles.sortableHeader} ${TABLE_CONSTANTS.MIN_COLUMN_WIDTHS.metric}`}
              onClick={() => onSort(customId)}
            >
              <div className="flex items-center justify-between">
                <span className="truncate">{customMetric?.name || customId}</span>
                <div className="w-4 h-4 flex items-center justify-center ml-1">
                  {getSortIcon(customId)}
                </div>
              </div>
            </TableHead>
          );
        })}
        <TableHead className={`font-semibold ${TABLE_CONSTANTS.MIN_COLUMN_WIDTHS.actions}`}>
          Actions
        </TableHead>
      </TableRow>
    </TableHeader>
  );
} 