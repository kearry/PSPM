import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getTransactionById } from "@/actions/transactions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowDownIcon, ArrowUpIcon, ChevronLeftIcon } from "lucide-react";
import { TransactionType } from "@/lib/constants";
import TransactionActions from "@/components/transactions/transaction-actions";
import TransactionNotes from "@/components/transactions/transaction-notes";

interface TransactionPageProps {
    params: {
        id: string;
    };
}

export async function generateMetadata({ params }: TransactionPageProps): Promise<Metadata> {
    const { success, data, error } = await getTransactionById(params.id);

    if (!success || !data) {
        return {
            title: "Transaction Not Found | Stock Manager",
        };
    }

    return {
        title: `${data.type} ${data.stock.ticker} | Stock Manager`,
        description: `Transaction details for ${data.stock.ticker}`,
    };
}

export default async function TransactionPage({ params }: TransactionPageProps) {
    const { success, data: transaction, error } = await getTransactionById(params.id);

    if (!success || !transaction) {
        notFound();
    }

    const isBuy = transaction.type === TransactionType.BUY;
    const total = transaction.quantity * transaction.price;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <Link
                        href="/transactions"
                        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
                    >
                        <ChevronLeftIcon className="h-4 w-4" />
                        Back to Transactions
                    </Link>
                    <h2 className="text-2xl font-bold tracking-tight">
                        {isBuy ? "Buy" : "Sell"} Transaction: {transaction.stock.ticker}
                    </h2>
                    <p className="text-muted-foreground">
                        {formatDate(transaction.date)}
                    </p>
                </div>
                <TransactionActions transaction={transaction} />
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div
                            className={`flex h-9 w-9 items-center justify-center rounded-full ${isBuy
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
                        <CardTitle>Transaction Details</CardTitle>
                    </div>
                    <CardDescription>
                        <Link href={`/stocks/${transaction.stock.id}`} className="hover:underline">
                            {transaction.stock.ticker}: {transaction.stock.name}
                        </Link>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">Type</div>
                            <div className="text-lg font-medium">
                                {isBuy ? "Buy" : "Sell"}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">Quantity</div>
                            <div className="text-lg font-medium">{transaction.quantity.toFixed(2)}</div>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">Price</div>
                            <div className="text-lg font-medium">
                                {formatCurrency(transaction.price)}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">Total</div>
                            <div className="text-lg font-medium">
                                {formatCurrency(total)}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <TransactionNotes transactionId={transaction.id} notes={transaction.notes || []} />
        </div>
    );
}