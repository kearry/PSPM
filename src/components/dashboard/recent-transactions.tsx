import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import React from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { TransactionType } from "@/lib/constants";

interface Transaction {
    id: string;
    date: Date;
    type: string;
    quantity: number;
    price: number;
    stock: {
        id: string;
        ticker: string;
        name: string;
    };
}

interface RecentTransactionsProps {
    transactions: Transaction[];
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your latest stock trades</CardDescription>
            </CardHeader>
            <CardContent>
                {transactions.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-6">
                        No recent transactions
                    </p>
                ) : (
                    <div className="space-y-4">
                        {transactions.map((transaction) => (
                            <div key={transaction.id} className="flex items-center">
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
                                            {transaction.type === TransactionType.BUY ? "Bought" : "Sold"}{" "}
                                            {transaction.stock.ticker}
                                        </Link>
                                        <div className="ml-auto text-xs text-muted-foreground">
                                            {formatDate(transaction.date)}
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {transaction.quantity.toFixed(2)} shares @ {formatCurrency(transaction.price)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <div className="mt-4 pt-4 border-t">
                    <Link
                        href="/transactions"
                        className="text-xs text-blue-500 dark:text-blue-400 hover:underline"
                    >
                        View all transactions
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}