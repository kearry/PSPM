"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import AddTransactionForm from "@/components/transactions/add-transaction-form";

export default function TransactionsHeader() {
    const [showAddForm, setShowAddForm] = useState(false);

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Transactions</h2>
                <p className="text-muted-foreground">
                    View and manage your stock buy and sell transactions
                </p>
            </div>
            <Button onClick={() => setShowAddForm(true)} className="sm:w-auto w-full">
                <PlusIcon className="mr-2 h-4 w-4" />
                Add Transaction
            </Button>

            <AddTransactionForm
                open={showAddForm}
                onOpenChange={setShowAddForm}
            />
        </div>
    );
}