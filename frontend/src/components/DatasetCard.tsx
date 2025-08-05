import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { FileText, Calendar, HardDrive, Users, FileDigit } from "lucide-react";
import type { Dataset } from "@/types";
import { formatFileSize, formatDate } from "@/utils/general";

interface DatasetCardProps {
    dataset: Dataset;
    onClick?: () => void;
}

export function DatasetCard({ dataset, onClick }: DatasetCardProps) {
    return (
        <Card
            className="transition-shadow duration-200 cursor-pointer hover:shadow-md"
            onClick={onClick}
        >
            <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-semibold">
                        {dataset.name}
                    </CardTitle>
                    <FileText className="w-5 h-5 text-muted-foreground" />
                </div>
                <CardDescription className="text-sm">
                    {dataset.description ||
                        `Dataset with ${dataset.samples} samples`}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex gap-2 items-center text-sm text-muted-foreground">
                    <HardDrive className="w-4 h-4" />
                    <span>{formatFileSize(dataset.size)}</span>
                </div>
                <div className="flex gap-2 items-center text-sm text-muted-foreground">
                    <FileDigit className="w-4 h-4" />
                    <span>{dataset.samples.toLocaleString()} samples</span>
                </div>
                <div className="flex gap-2 items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Created {formatDate(dataset.createdAt)}</span>
                </div>
            </CardContent>
        </Card>
    );
}
