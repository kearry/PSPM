"use client";

import { useState } from "react";
import { deleteTransaction } from "@/actions/transactions";
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
import { TransactionType } from "@/lib/constants";

interface Transaction {
    id: string;
    type: string;
    quantity: number;
    stock: {
        ticker: string;
        name: string;
    };
}

interface DeleteTransactionDialogProps {
    transaction: Transaction;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function DeleteTransactionDialog({
    transaction,
    open,
    onOpenChange,
}: DeleteTransactionDialogProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            const result = await deleteTransaction(transaction.id);

            if (result.success) {
                toast({
                    title: "Transaction deleted",
                    description: `${transaction.type === TransactionType.BUY ? "Buy" : "Sell"} transaction for ${transaction.stock.ticker} has been deleted.`,
                });
                onOpenChange(false);
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Failed to delete transaction.",
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
                    <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete this {transaction.type === TransactionType.BUY ? "buy" : "sell"} transaction of {transaction.quantity} shares of {transaction.stock.ticker}?
                        This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isLoading}
                    >
                        {isLoading ? "Deleting..." : "Delete"}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}