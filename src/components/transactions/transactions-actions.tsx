// path: src/components/transactions/transactions-actions.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { PencilIcon, TrashIcon } from "lucide-react";

import EditTransactionForm, {
    EditFormTransaction,
} from "@/components/transactions/edit-transaction-form";
import DeleteTransactionDialog from "@/components/transactions/delete-transaction-dialog";
import { Currency } from "@/lib/validators";

interface StockForEdit {
    id: string;
    ticker: string;
    name: string;
    currency: Currency;
}

interface TransactionsActionsProps {
    /** A fully‑typed transaction that already contains `currency` */
    transaction: EditFormTransaction;
}

export default function TransactionsActions({
    transaction,
}: TransactionsActionsProps) {
    const router = useRouter();
    const [showEditForm, setShowEditForm] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const transactionForDelete = {
        id: transaction.id,
        type: transaction.type,
        quantity: transaction.quantity,
        stock: {
            ticker: transaction.stock.ticker,
            name: transaction.stock.name,
        },
    };

    const stocksForEdit: StockForEdit[] = [
        {
            id: transaction.stock.id,
            ticker: transaction.stock.ticker,
            name: transaction.stock.name,
            currency: transaction.stock.currency,
        },
    ];

    return (
        <div className="flex gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditForm(true)}
            >
                <PencilIcon className="mr-2 h-4 w-4" />
                Edit
            </Button>

            <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => setShowDeleteDialog(true)}
            >
                <TrashIcon className="mr-2 h-4 w-4" />
                Delete
            </Button>

            {/* ---- edit ---- */}
            <EditTransactionForm
                transaction={transaction}
                stocks={stocksForEdit}
                open={showEditForm}
                onOpenChange={setShowEditForm}
            />

            {/* ---- delete ---- */}
            <DeleteTransactionDialog
                transaction={transactionForDelete}
                open={showDeleteDialog}
                onOpenChange={(open) => {
                    if (!open) {
                        setShowDeleteDialog(false);
                    } else if (!open && !transaction.id) {
                        router.push("/transactions");
                    }
                }}
            />
        </div>
    );
}