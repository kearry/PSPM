"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PencilIcon, TrashIcon } from "lucide-react";
// Import the specific interface from EditTransactionForm
import EditTransactionForm, { EditFormTransaction } from "@/components/transactions/edit-transaction-form";
import DeleteTransactionDialog from "@/components/transactions/delete-transaction-dialog";
import { Currency } from "@/lib/validators";

// Define the Stock interface locally, matching NestedStock in EditFormTransaction
// This is also needed for the stocks prop of EditTransactionForm
interface StockForEdit {
    id: string;
    ticker: string;
    name: string;
    currency: Currency;
}

interface TransactionActionsProps {
    transaction: EditFormTransaction; // Expect the imported interface directly
}

export default function TransactionActions({
    transaction, // Prop should conform to EditFormTransaction
}: TransactionActionsProps) {
    const router = useRouter();
    const [showEditForm, setShowEditForm] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    // Prepare the object for DeleteTransactionDialog separately
    const transactionForDelete = {
        id: transaction.id,
        type: transaction.type,
        quantity: transaction.quantity,
        stock: {
            ticker: transaction.stock.ticker,
            name: transaction.stock.name,
        }
    };

    // Construct the stock array needed for EditTransactionForm's 'stocks' prop
    // Type it explicitly
    const stockArrayForEdit: StockForEdit[] = [
        {
            id: transaction.stock.id,
            ticker: transaction.stock.ticker,
            name: transaction.stock.name,
            currency: transaction.stock.currency
        }
    ];

    return (
        <div className="flex gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditForm(true)}
            >
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

            {/* Pass an INLINE object literal that matches EditFormTransaction */}
            {/* This directly addresses the error pointing to line 53 */}
            <EditTransactionForm
                transaction={{ // Construct the object directly here
                    id: transaction.id,
                    type: transaction.type,
                    quantity: transaction.quantity,
                    price: transaction.price,
                    currency: transaction.currency, // From correctly typed prop
                    exchangeRate: transaction.exchangeRate,
                    fxFee: transaction.fxFee,
                    date: transaction.date,
                    stock: {
                        id: transaction.stock.id,
                        ticker: transaction.stock.ticker,
                        name: transaction.stock.name,
                        currency: transaction.stock.currency, // From correctly typed prop
                    },
                }}
                stocks={stockArrayForEdit}      // Pass the explicitly typed stock array
                open={showEditForm}
                onOpenChange={setShowEditForm}
            />

            {/* DeleteTransactionDialog expects a simpler structure */}
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