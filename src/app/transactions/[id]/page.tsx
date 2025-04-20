import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getTransactionById } from "@/actions/transactions";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    formatCurrency,
    formatDate,
    calculateTransactionTotal,
    getCurrencySymbol,
} from "@/lib/utils";
import {
    ArrowDownIcon,
    ArrowUpIcon,
    ChevronLeftIcon,
} from "lucide-react";
import { TransactionType } from "@/lib/constants";
import TransactionActions from "@/components/transactions/transaction-actions";
import TransactionNotes from "@/components/transactions/transaction-notes";
import { getCurrentUser } from "@/actions/user";
import { Currency } from "@/lib/validators";
// Import the specific interface TransactionActions expects
import { EditFormTransaction } from "@/components/transactions/edit-transaction-form";

interface TransactionPageProps {
    params: { id: string };
}

export async function generateMetadata({
    params,
}: TransactionPageProps): Promise<Metadata> {
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
    const { success, data: transactionFromDb, error } = await getTransactionById(
        params.id
    );
    const user = await getCurrentUser();
    const userCurrency = (user.defaultCurrency || "GBP") as Currency; // Cast user currency

    if (!success || !transactionFromDb) {
        notFound();
    }

    const isBuy = transactionFromDb.type === TransactionType.BUY;
    const transactionCurrency = (transactionFromDb.currency ||
        transactionFromDb.stock.currency ||
        "USD") as Currency; // Determine and cast transaction currency

    const total = calculateTransactionTotal(transactionFromDb);
    const isForeignCurrency = transactionCurrency !== userCurrency;

    // Create a correctly typed transaction object conforming to EditFormTransaction
    const typedTransactionForActions: EditFormTransaction = {
        id: transactionFromDb.id,
        type: transactionFromDb.type,
        quantity: transactionFromDb.quantity,
        price: transactionFromDb.price,
        currency: transactionCurrency, // Use the casted transaction currency
        exchangeRate: transactionFromDb.exchangeRate, // Already number | null
        fxFee: transactionFromDb.fxFee,             // Already number | null
        date: transactionFromDb.date,           // Already Date
        stock: {
            id: transactionFromDb.stock.id,
            ticker: transactionFromDb.stock.ticker,
            name: transactionFromDb.stock.name,
            currency: (transactionFromDb.stock.currency || "USD") as Currency, // Cast nested stock currency
        },
        // Note: EditFormTransaction doesn't include notes, so we don't pass them here
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <Link
                        href="/transactions"
                        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
                    >
                        <ChevronLeftIcon className="h-4 w-4" /> Back to Transactions
                    </Link>
                    <h2 className="text-2xl font-bold tracking-tight">
                        {isBuy ? "Buy" : "Sell"} Transaction: {transactionFromDb.stock.ticker}
                    </h2>
                    <p className="text-muted-foreground">
                        {formatDate(transactionFromDb.date)}
                    </p>
                </div>
                {/* Pass the correctly typed transaction object */}
                <TransactionActions transaction={typedTransactionForActions} />
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
                        <Link
                            href={`/stocks/${transactionFromDb.stock.id}`}
                            className="hover:underline"
                        >
                            {transactionFromDb.stock.ticker}: {transactionFromDb.stock.name}
                        </Link>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">Type</div>
                            <div className="text-lg font-medium">{isBuy ? "Buy" : "Sell"}</div>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">Quantity</div>
                            <div className="text-lg font-medium">
                                {transactionFromDb.quantity.toFixed(2)}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">Price</div>
                            <div className="text-lg font-medium">
                                {/* Use transactionCurrency for formatting price */}
                                {formatCurrency(transactionFromDb.price, transactionCurrency)}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">Total</div>
                            <div className="text-lg font-medium">
                                {formatCurrency(total, userCurrency)}
                            </div>
                        </div>
                    </div>
                    {isForeignCurrency && (
                        <div className="mt-4 pt-4 border-t">
                            <h3 className="font-medium mb-2">Currency Details</h3>
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">
                                        Transaction Currency
                                    </div>
                                    <div className="text-lg font-medium">
                                        {getCurrencySymbol(transactionCurrency)} {transactionCurrency}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">
                                        Base Currency
                                    </div>
                                    <div className="text-lg font-medium">
                                        {getCurrencySymbol(userCurrency)} {userCurrency}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">
                                        Exchange Rate
                                    </div>
                                    <div className="text-lg font-medium">
                                        {transactionFromDb.exchangeRate?.toFixed(4)}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">FX Fee</div>
                                    <div className="text-lg font-medium">
                                        {transactionFromDb.fxFee
                                            ? formatCurrency(transactionFromDb.fxFee, userCurrency)
                                            : `${getCurrencySymbol(userCurrency)}0.00`}
                                    </div>
                                </div>
                                <div className="col-span-full">
                                    <div className="text-sm font-medium text-muted-foreground">
                                        Calculation
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {transactionFromDb.quantity.toFixed(2)} ×{" "}
                                        {formatCurrency(transactionFromDb.price, transactionCurrency)} ×{" "}
                                        {transactionFromDb.exchangeRate?.toFixed(4)}{" "}
                                        {transactionFromDb.fxFee
                                            ? (isBuy ? " + " : " - ") +
                                            formatCurrency(transactionFromDb.fxFee || 0, userCurrency) +
                                            " fee"
                                            : ""}{" "}
                                        {" = "}{formatCurrency(total, userCurrency)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
            <TransactionNotes
                transactionId={transactionFromDb.id}
                notes={transactionFromDb.notes || []}
            />
        </div>
    );
}