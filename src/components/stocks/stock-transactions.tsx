// src/components/stocks/stock-transactions.tsx
"use client";

import { useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PlusIcon, ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import Link from "next/link";
import AddTransactionForm from "@/components/transactions/add-transaction-form";
import { TransactionType } from "@/lib/constants";
import { Currency } from "@/lib/validators"; // Import the Currency type

interface Transaction {
    id: string;
    type: string;
    quantity: number;
    price: number;
    currency: Currency; // Add currency here too for consistency
    date: Date;
}

interface Stock {
    id: string;
    ticker: string;
    name: string;
    currency: Currency; // <-- Add the currency field here
}

interface StockTransactionsProps {
    stock: Stock;
    transactions: Transaction[];
}

export default function StockTransactions({
    stock,
    transactions,
}: StockTransactionsProps) {
    const [showAddForm, setShowAddForm] = useState(false);

    // Sort transactions by date (latest first)
    const sortedTransactions = [...transactions].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                        <CardTitle>Transaction History</CardTitle>
                        <CardDescription>
                            Buy and sell transactions for {stock.ticker}
                        </CardDescription>
                    </div>
                    <Button size="sm" onClick={() => setShowAddForm(true)}>
                        <PlusIcon className="h-4 w-4 mr-2" /> Add Transaction
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {transactions.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                        <p>No transactions for this stock yet.</p>
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => setShowAddForm(true)}
                        >
                            Add your first transaction
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {sortedTransactions.map((transaction) => (
                            <div
                                key={transaction.id}
                                className="flex items-center border-b pb-4 last:border-0 last:pb-0"
                            >
                                <div
                                    className={`mr-3 flex h-9 w-9 items-center justify-center rounded-full ${transaction.type === TransactionType.BUY
                                            ? "bg-green-100 dark:bg-green-900"
                                            : "bg-red-100 dark:bg-red-900"
                                        }`}
                                >
                                    {transaction.type === TransactionType.BUY ? (
                                        <ArrowDownIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    ) : (
                                        <ArrowUpIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
                                    )}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center">
                                        <Link
                                            href={`/transactions/${transaction.id}`}
                                            className="text-sm font-medium leading-none hover:underline"
                                        >
                                            {transaction.type === TransactionType.BUY
                                                ? "Bought"
                                                : "Sold"}{" "}
                                            {transaction.quantity.toFixed(2)} shares
                                        </Link>
                                        <div className="ml-auto text-xs text-muted-foreground">
                                            {formatDate(transaction.date)}
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        @ {formatCurrency(transaction.price, transaction.currency)} per share •{" "}
                                        {formatCurrency(transaction.price * transaction.quantity, transaction.currency)} total
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
            <AddTransactionForm
                stock={stock} // This stock object now includes the currency
                open={showAddForm}
                onOpenChange={setShowAddForm}
            />
        </Card>
    );
}