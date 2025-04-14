"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PencilIcon, ChevronLeftIcon, TrashIcon } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import EditStockForm from "@/components/stocks/edit-stock-form";
import DeleteStockDialog from "@/components/stocks/delete-stock-dialog";

interface Stock {
    id: string;
    ticker: string;
    name: string;
    sectorId: string | null;
    sector: {
        id: string;
        name: string;
    } | null;
    averagePrice: number;
    holdings: number;
    value: number;
    transactions: {
        id: string;
    }[];
}

interface StockHeaderProps {
    stock: Stock;
}

export default function StockHeader({ stock }: StockHeaderProps) {
    const [showEditForm, setShowEditForm] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <Link
                    href="/stocks"
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
                >
                    <ChevronLeftIcon className="h-4 w-4" />
                    Back to Stocks
                </Link>
                <h2 className="text-3xl font-bold tracking-tight">
                    {stock.ticker}: {stock.name}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                    <div className="text-muted-foreground">
                        {stock.sector?.name || "No sector"} •
                    </div>
                    <div className="font-medium">
                        {stock.holdings > 0
                            ? `${stock.holdings.toFixed(2)} shares @ ${formatCurrency(stock.averagePrice)}`
                            : "No shares"}
                    </div>
                    {stock.holdings > 0 && (
                        <div className="text-muted-foreground">
                            • Total value: {formatCurrency(stock.value)}
                        </div>
                    )}
                </div>
            </div>
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowEditForm(true)}
                >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setShowDeleteDialog(true)}
                >
                    <TrashIcon className="h-4 w-4 mr-2" />
                    Delete
                </Button>
            </div>

            <EditStockForm
                stock={stock}
                open={showEditForm}
                onOpenChange={setShowEditForm}
            />

            <DeleteStockDialog
                stock={{
                    ...stock,
                    transactions: stock.transactions.length,
                }}
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
            />
        </div>
    );
}