import Link from "next/link";
import {
    formatCurrency,
    formatDate,
    getCurrencySymbol,
} from "@/lib/utils";
import {
    ArrowDownIcon,
    ArrowUpIcon,
    CurrencyIcon,
} from "lucide-react";
import React from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { TransactionType } from "@/lib/constants";
import { Currency } from "@/lib/validators";

interface Transaction {
    id: string;
    date: Date;
    type: string;
    quantity: number;
    price: number;
    currency: Currency;
    stock: { id: string; ticker: string; name: string };
}

interface RecentTransactionsProps {
    transactions: Transaction[];
    /** user’s base currency (defaults to GBP) */
    baseCurrency?: Currency;
}

export default function RecentTransactions({
    transactions,
    baseCurrency = "GBP" as Currency,
}: RecentTransactionsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your latest stock trades</CardDescription>
            </CardHeader>

            <CardContent>
                {transactions.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                        No recent transactions
                    </p>
                ) : (
                    <div className="space-y-4">
                        {transactions.map((t) => {
                            const isBuy = t.type === TransactionType.BUY;
                            const foreign = t.currency !== baseCurrency;

                            return (
                                <div key={t.id} className="flex items-center">
                                    <div
                                        className={`mr-3 flex h-9 w-9 items-center justify-center rounded-full ${isBuy
                                                ? "bg-green-100 dark:bg-green-900"
                                                : "bg-red-100 dark:bg-red-900"
                                            }`}
                                    >
                                        {isBuy ? (
                                            <ArrowDownIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                                        ) : (
                                            <ArrowUpIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
                                        )}
                                    </div>

                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center">
                                            <Link
                                                href={`/transactions/${t.id}`}
                                                className="text-sm font-medium leading-none hover:underline"
                                            >
                                                {isBuy ? "Bought" : "Sold"} {t.stock.ticker}
                                            </Link>
                                            <div className="ml-auto text-xs text-muted-foreground">
                                                {formatDate(t.date)}
                                            </div>
                                        </div>

                                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                            {t.quantity.toFixed(2)} shares @{" "}
                                            {formatCurrency(t.price, t.currency)}
                                            {foreign && (
                                                <CurrencyIcon className="h-3 w-3 text-blue-500 dark:text-blue-400" />
                                            )}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="mt-4 border-t pt-4">
                    <Link
                        href="/transactions"
                        className="text-xs text-blue-500 hover:underline dark:text-blue-400"
                    >
                        View all transactions
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}