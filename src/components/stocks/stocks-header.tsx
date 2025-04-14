"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import AddStockForm from "@/components/stocks/add-stock-form";

export default function StocksHeader() {
    const [showAddForm, setShowAddForm] = useState(false);

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Stocks</h2>
                <p className="text-muted-foreground">
                    Manage your stock portfolio and view positions
                </p>
            </div>
            <Button onClick={() => setShowAddForm(true)} className="sm:w-auto w-full">
                <PlusIcon className="mr-2 h-4 w-4" />
                Add Stock
            </Button>

            <AddStockForm
                open={showAddForm}
                onOpenChange={setShowAddForm}
            />
        </div>
    );
}