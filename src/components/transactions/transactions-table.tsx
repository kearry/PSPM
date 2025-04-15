"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
    MoreHorizontalIcon,
    PencilIcon,
    TrashIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    FileTextIcon,
    CurrencyIcon,
} from "lucide-react";
import { formatCurrency, formatDate, calculateTransactionTotal, getCurrencySymbol } from "@/lib/utils";
import { TransactionType } from "@/lib/constants";
import EditTransactionForm from "@/components/transactions/edit-transaction-form";
import DeleteTransactionDialog from "@/components/transactions/delete-transaction-dialog";
import { getCurrentUser } from "@/actions/user";

interface Transaction {
    id: string;
    type: string;
    quantity: number;
    price: number;
    currency: string;
    exchangeRate?: number | null;
    fxFee?: number | null;
    date: Date;
    stock: {
        id: string;
        ticker: string;
        name: string;
        currency: string;
        sector?: {
            id: string;
            name: string;
        } | null;
    };
    notes?: {
        id: string;
        content: string;
    }[];
}

interface Stock {
    id: string;
    ticker: string;
    name: string;
    currency: string;
    sector?: {
        id: string;
        name: string;
    } | null;
}

interface TransactionsTableProps {
    transactions: Transaction[];
    stocks: Stock[];
}

export default function TransactionsTable({ transactions, stocks }: TransactionsTableProps) {
    const [search, setSearch] = useState("");
    const [stockFilter, setStockFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [currencyFilter, setCurrencyFilter] = useState("all");
    const [sortBy, setSortBy] = useState<keyof Transaction | "stock" | "total">("date");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
    const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
    const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
    const [userDefaultCurrency, setUserDefaultCurrency] = useState<string>("GBP");
    const [uniqueCurrencies, setUniqueCurrencies] = useState<string[]>([]);

    // Get user's default currency
    useEffect(() => {
        const fetchUserCurrency = async () => {
            try {
                const user = await getCurrentUser();
                setUserDefaultCurrency(user.defaultCurrency || "GBP");
            } catch (error) {
                console.error("Error fetching user currency:", error);
            }
        };

        fetchUserCurrency();
    }, []);

    // Get unique currencies in transactions
    useEffect(() => {
        const currencies = new Set<string>();
        transactions.forEach(t => {
            currencies.add(t.currency || t.stock.currency || "USD");
        });
        setUniqueCurrencies(Array.from(currencies));
    }, [transactions]);

    // Apply filters
    let filteredTransactions = [...transactions];

    // Apply search filter
    if (search) {
        const searchLower = search.toLowerCase();
        filteredTransactions = filteredTransactions.filter(
            (transaction) =>
                transaction.stock.ticker.toLowerCase().includes(searchLower) ||
                transaction.stock.name.toLowerCase().includes(searchLower)
        );
    }

    // Apply stock filter
    if (stockFilter !== "all") {
        filteredTransactions = filteredTransactions.filter(
            (transaction) => transaction.stock.id === stockFilter
        );
    }

    // Apply type filter
    if (typeFilter !== "all") {
        filteredTransactions = filteredTransactions.filter(
            (transaction) => transaction.type === typeFilter
        );
    }

    // Apply currency filter
    if (currencyFilter !== "all") {
        filteredTransactions = filteredTransactions.filter(
            (transaction) => {
                return (transaction.currency || transaction.stock.currency) === currencyFilter;
            }
        );
    }

    // Add total to transactions for sorting
    const transactionsWithTotal = filteredTransactions.map(transaction => ({
        ...transaction,
        total: calculateTransactionTotal(transaction),
    }));

    // Apply sorting
    transactionsWithTotal.sort((a, b) => {
        if (sortBy === "stock") {
            const tickerA = a.stock.ticker;
            const tickerB = b.stock.ticker;
            return sortDirection === "asc"
                ? tickerA.localeCompare(tickerB)
                : tickerB.localeCompare(tickerA);
        }

        if (sortBy === "date") {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
        }

        if (sortBy === "total") {
            return sortDirection === "asc" ? a.total - b.total : b.total - a.total;
        }

        const valueA = a[sortBy];
        const valueB = b[sortBy];

        if (typeof valueA === "string" && typeof valueB === "string") {
            return sortDirection === "asc"
                ? valueA.localeCompare(valueB)
                : valueB.localeCompare(valueA);
        }

        if (typeof valueA === "number" && typeof valueB === "number") {
            return sortDirection === "asc" ? valueA - valueB : valueB - valueA;
        }

        return 0;
    });

    // Toggle sort direction when clicking on the same column
    const handleSort = (column: keyof Transaction | "stock" | "total") => {
        if (sortBy === column) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortBy(column);
            setSortDirection("desc");
        }
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <Input
                    placeholder="Search transactions..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="sm:max-w-xs"
                />
                <Select value={stockFilter} onValueChange={setStockFilter}>
                    <SelectTrigger className="sm:max-w-xs">
                        <SelectValue placeholder="Filter by stock" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Stocks</SelectItem>
                        {stocks.map((stock) => (
                            <SelectItem key={stock.id} value={stock.id}>
                                {stock.ticker}: {stock.name} ({getCurrencySymbol(stock.currency)})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="sm:max-w-xs">
                        <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value={TransactionType.BUY}>Buy</SelectItem>
                        <SelectItem value={TransactionType.SELL}>Sell</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
                    <SelectTrigger className="sm:max-w-xs">
                        <SelectValue placeholder="Filter by currency" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Currencies</SelectItem>
                        {uniqueCurrencies.map((currency) => (
                            <SelectItem key={currency} value={currency}>
                                {getCurrencySymbol(currency)} {currency}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th
                                        className="text-left font-medium py-4 px-6 cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort("date")}
                                    >
                                        Date
                                        {sortBy === "date" && (
                                            <span className="ml-1">
                                                {sortDirection === "asc" ? "↑" : "↓"}
                                            </span>
                                        )}
                                    </th>
                                    <th
                                        className="text-left font-medium py-4 px-6 cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort("stock")}
                                    >
                                        Stock
                                        {sortBy === "stock" && (
                                            <span className="ml-1">
                                                {sortDirection === "asc" ? "↑" : "↓"}
                                            </span>
                                        )}
                                    </th>
                                    <th
                                        className="text-left font-medium py-4 px-6 cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort("type")}
                                    >
                                        Type
                                        {sortBy === "type" && (
                                            <span className="ml-1">
                                                {sortDirection === "asc" ? "↑" : "↓"}
                                            </span>
                                        )}
                                    </th>
                                    <th
                                        className="text-right font-medium py-4 px-6 cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort("quantity")}
                                    >
                                        Quantity
                                        {sortBy === "quantity" && (
                                            <span className="ml-1">
                                                {sortDirection === "asc" ? "↑" : "↓"}
                                            </span>
                                        )}
                                    </th>
                                    <th
                                        className="text-right font-medium py-4 px-6 cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort("price")}
                                    >
                                        Price
                                        {sortBy === "price" && (
                                            <span className="ml-1">
                                                {sortDirection === "asc" ? "↑" : "↓"}
                                            </span>
                                        )}
                                    </th>
                                    <th
                                        className="text-center font-medium py-4 px-3 cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort("currency")}
                                    >
                                        Currency
                                        {sortBy === "currency" && (
                                            <span className="ml-1">
                                                {sortDirection === "asc" ? "↑" : "↓"}
                                            </span>
                                        )}
                                    </th>
                                    <th
                                        className="text-right font-medium py-4 px-6 cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort("total")}
                                    >
                                        Total
                                        {sortBy === "total" && (
                                            <span className="ml-1">
                                                {sortDirection === "asc" ? "↑" : "↓"}
                                            </span>
                                        )}
                                    </th>
                                    <th className="text-center font-medium py-4 px-6">Notes</th>
                                    <th className="text-right font-medium py-4 px-6"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {transactionsWithTotal.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="py-6 text-center text-muted-foreground">
                                            {transactions.length === 0
                                                ? "No transactions yet. Add your first transaction to get started."
                                                : "No transactions match your filters."}
                                        </td>
                                    </tr>
                                ) : (
                                    transactionsWithTotal.map((transaction) => {
                                        const isBuy = transaction.type === TransactionType.BUY;
                                        const transactionCurrency = transaction.currency || transaction.stock.currency || "USD";
                                        const isForeignCurrency = transactionCurrency !== userDefaultCurrency;
                                        const currencySymbol = getCurrencySymbol(transactionCurrency);

                                        return (
                                            <tr key={transaction.id} className="hover:bg-muted/50">
                                                <td className="py-4 px-6">
                                                    {formatDate(transaction.date)}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <Link
                                                        href={`/stocks/${transaction.stock.id}`}
                                                        className="font-medium hover:underline"
                                                    >
                                                        {transaction.stock.ticker}
                                                    </Link>
                                                    <div className="text-xs text-muted-foreground">
                                                        {transaction.stock.name}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center">
                                                        <div
                                                            className={`mr-2 flex h-6 w-6 items-center justify-center rounded-full ${isBuy
                                                                ? "bg-green-100 dark:bg-green-900"
                                                                : "bg-red-100 dark:bg-red-900"
                                                                }`}
                                                        >
                                                            {isBuy ? (
                                                                <ArrowDownIcon className="h-3 w-3 text-green-600 dark:text-green-400" />
                                                            ) : (
                                                                <ArrowUpIcon className="h-3 w-3 text-red-600 dark:text-red-400" />
                                                            )}
                                                        </div>
                                                        {isBuy ? "Buy" : "Sell"}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    {transaction.quantity.toFixed(2)}
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    {currencySymbol}{transaction.price.toFixed(2)}
                                                </td>
                                                <td className="py-4 px-3 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-xs font-medium">
                                                            {transactionCurrency}
                                                        </span>
                                                        {isForeignCurrency && (
                                                            <CurrencyIcon className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-1" />
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-right font-medium">
                                                    {formatCurrency(transaction.total, userDefaultCurrency)}
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    {transaction.notes && transaction.notes.length > 0 ? (
                                                        <div className="relative group inline-flex justify-center">
                                                            <div className="cursor-pointer hover:text-primary">
                                                                <FileTextIcon className="h-5 w-5" />
                                                            </div>
                                                            <div className="invisible absolute z-10 w-64 -translate-x-1/2 -translate-y-8 rounded-md border bg-popover px-3 py-2 text-xs text-popover-foreground opacity-0 shadow-md transition-all group-hover:visible group-hover:opacity-100">
                                                                <div className="font-semibold mb-1">{transaction.notes.length} {transaction.notes.length === 1 ? 'note' : 'notes'}</div>
                                                                <div className="line-clamp-2 text-muted-foreground">
                                                                    {transaction.notes[0].content}
                                                                </div>
                                                                <div className="text-right mt-1">
                                                                    <Link href={`/transactions/${transaction.id}`} className="text-primary text-xs hover:underline">
                                                                        View all
                                                                    </Link>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : null}
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm">
                                                                <MoreHorizontalIcon className="h-4 w-4" />
                                                                <span className="sr-only">Actions</span>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem
                                                                onClick={() => setTransactionToEdit(transaction)}
                                                                className="cursor-pointer"
                                                            >
                                                                <PencilIcon className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => setTransactionToDelete(transaction)}
                                                                className="cursor-pointer text-destructive focus:text-destructive"
                                                            >
                                                                <TrashIcon className="mr-2 h-4 w-4" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {transactionToEdit && (
                <EditTransactionForm
                    transaction={transactionToEdit}
                    stocks={stocks}
                    open={!!transactionToEdit}
                    onOpenChange={(open) => {
                        if (!open) setTransactionToEdit(null);
                    }}
                />
            )}

            {transactionToDelete && (
                <DeleteTransactionDialog
                    transaction={transactionToDelete}
                    open={!!transactionToDelete}
                    onOpenChange={(open) => {
                        if (!open) setTransactionToDelete(null);
                    }}
                />
            )}
        </div>
    );
}