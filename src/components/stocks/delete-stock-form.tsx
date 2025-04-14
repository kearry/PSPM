"use client";

import { useState } from "react";
import { deleteStock } from "@/actions/stocks";
import { useToast } from "@/hooks/use-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface Stock {
    id: string;
    ticker: string;
    name: string;
    transactions: number;
}

interface DeleteStockDialogProps {
    stock: Stock;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function DeleteStockDialog({
    stock,
    open,
    onOpenChange,
}: DeleteStockDialogProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            const result = await deleteStock(stock.id);

            if (result.success) {
                toast({
                    title: "Stock deleted",
                    description: `${stock.ticker} has been removed from your portfolio.`,
                });
                onOpenChange(false);
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Failed to delete stock.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "An unexpected error occurred.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Stock</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete {stock.ticker} ({stock.name}) from your portfolio?
                        {stock.transactions > 0 && (
                            <p className="mt-2 text-destructive font-medium">
                                Warning: This stock has {stock.transactions} transactions.
                                You need to delete all transactions before deleting the stock.
                            </p>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isLoading || stock.transactions > 0}
                    >
                        {isLoading ? "Deleting..." : "Delete"}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}