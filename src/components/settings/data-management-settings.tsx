"use client";

import { useState } from "react";
import { exportTransactionsToCSV } from "@/actions/transactions";
import { useToast } from "@/hooks/use-toast";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DownloadIcon } from "lucide-react";
import { exportToCSV } from "@/lib/utils";

export default function DataManagementSettings() {
    const { toast } = useToast();
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const result = await exportTransactionsToCSV();

            if (result.success && result.data) {
                // Export the data to CSV
                const filename = `stock_transactions_${new Date().toISOString().split('T')[0]}.csv`;
                exportToCSV(result.data, filename);

                toast({
                    title: "Export successful",
                    description: "Your transactions have been exported to CSV.",
                });
            } else {
                toast({
                    title: "Export failed",
                    description: result.error || "Failed to export transactions.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Export failed",
                description: "An unexpected error occurred.",
                variant: "destructive",
            });
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>
                    Export and manage your portfolio data
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h3 className="text-sm font-medium">Export Data</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Download your transaction history as a CSV file
                    </p>
                </div>
            </CardContent>
            <CardFooter>
                <Button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="w-full sm:w-auto"
                >
                    <DownloadIcon className="mr-2 h-4 w-4" />
                    {isExporting ? "Exporting..." : "Export Transactions"}
                </Button>
            </CardFooter>
        </Card>
    );
}