"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PencilIcon, TrashIcon } from "lucide-react";
import EditTransactionForm from "@/components/transactions/edit-transaction-form";
import DeleteTransactionDialog from "@/components/transactions/delete-transaction-dialog";

interface Transaction {
    id: string;
    type: string;
    quantity: number;
    price: number;
    date: Date;
    stock: {
        id: string;
        ticker: string;
        name: string;
    };
}

interface TransactionActionsProps {
    transaction: Transaction;
}

export default function TransactionActions({ transaction }: TransactionActionsProps) {
    const router = useRouter();
    const [showEditForm, setShowEditForm] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    return (
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

            <EditTransactionForm
                transaction={transaction}
                stocks={[transaction.stock]}
                open={showEditForm}
                onOpenChange={setShowEditForm}
            />

            <DeleteTransactionDialog
                transaction={transaction}
                open={showDeleteDialog}
                onOpenChange={(open) => {
                    if (!open) {
                        setShowDeleteDialog(false);
                    } else if (!open && !transaction.id) {
                        // If deleted successfully, redirect to transactions list
                        router.push("/transactions");
                    }
                }}
            />
        </div>
    );
}