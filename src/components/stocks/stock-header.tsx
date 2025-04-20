// src/components/stocks/stock-header.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PencilIcon, ChevronLeftIcon, TrashIcon } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import EditStockForm from "@/components/stocks/edit-stock-form";
import DeleteStockDialog from "@/components/stocks/delete-stock-dialog";
import { Currency } from "@/lib/validators"; // Import the Currency type

interface Stock {
    id: string;
    ticker: string;
    name: string;
    sectorId: string | null;
    sector: { id: string; name: string } | null;
    averagePrice: number;
    holdings: number;
    value: number;
    currency: Currency; // <-- Add the currency field here
    transactions: { id: string }[];
    notes?: { id: string; content: string }[]; // Make notes optional if they might not exist
}

interface StockHeaderProps {
    stock: Stock;
}

export default function StockHeader({ stock }: StockHeaderProps) {
    const [showEditForm, setShowEditForm] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    // Ensure stock.notes exists before passing to DeleteStockDialog
    const stockToDelete = {
        ...stock,
        transactions: stock.transactions.length, // Keep this
    };

    // Ensure the stock object passed to EditStockForm matches its expected type
    // Notes should be optional in EditStockForm's props, but we'll ensure it's passed correctly
    const stockToEdit = {
        ...stock,
        notes: stock.notes || [], // Pass notes, defaulting to empty array if undefined
    };


    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <Link
                    href="/stocks"
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
                >
                    <ChevronLeftIcon className="h-4 w-4" /> Back to Stocks
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
                            ? `${stock.holdings.toFixed(2)} shares @ ${formatCurrency(stock.averagePrice, stock.currency)}` // Use stock currency
                            : "No shares"}
                    </div>
                    {stock.holdings > 0 && (
                        <div className="text-muted-foreground">
                            • Total value: {formatCurrency(stock.value, stock.currency)} {/* Use stock currency */}
                        </div>
                    )}
                </div>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowEditForm(true)}>
                    <PencilIcon className="h-4 w-4 mr-2" /> Edit
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setShowDeleteDialog(true)}
                >
                    <TrashIcon className="h-4 w-4 mr-2" /> Delete
                </Button>
            </div>

            {/* Pass the correctly typed stock object */}
            <EditStockForm
                stock={stockToEdit} // Pass stockToEdit which includes currency and notes
                open={showEditForm}
                onOpenChange={setShowEditForm}
            />
            <DeleteStockDialog
                stock={stockToDelete} // Pass stockToDelete
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
            />
        </div>
    );
}