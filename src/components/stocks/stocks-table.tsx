// src/components/stocks/stocks-table.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
    MoreHorizontalIcon,
    PencilIcon,
    TrashIcon,
    FileTextIcon,
} from "lucide-react";
import { formatCurrency, getCurrencySymbol } from "@/lib/utils";
import EditStockForm from "@/components/stocks/edit-stock-form";
import DeleteStockDialog from "@/components/stocks/delete-stock-dialog";
import { Currency } from "@/lib/validators";

// Export the Stock interface
export interface Stock {
    id: string;
    ticker: string;
    name: string;
    sectorId: string | null;
    sector: { id: string; name: string } | null;
    averagePrice: number;
    holdings: number;
    value: number;
    currency: Currency; // Expects Currency type
    transactions: number; // Expects number (count)
    notes?: { id: string; content: string; }[];
}

interface Sector {
    id: string;
    name: string;
}

interface StocksTableProps {
    stocks: Stock[]; // Uses the exported interface
    sectors: Sector[];
}

export default function StocksTable({ stocks, sectors }: StocksTableProps) {
    const [search, setSearch] = useState("");
    const [sectorFilter, setSectorFilter] = useState("all");
    const [sortBy, setSortBy] = useState<keyof Stock | "sector">("ticker");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const [stockToEdit, setStockToEdit] = useState<Stock | null>(null);
    const [stockToDelete, setStockToDelete] = useState<Stock | null>(null);

    // Apply filters
    let filteredStocks = [...stocks];

    // Apply search filter
    if (search) {
        const searchLower = search.toLowerCase();
        filteredStocks = filteredStocks.filter(
            (stock) =>
                stock.ticker.toLowerCase().includes(searchLower) ||
                stock.name.toLowerCase().includes(searchLower)
        );
    }

    // Apply sector filter
    if (sectorFilter !== "all") {
        filteredStocks = filteredStocks.filter(
            (stock) => stock.sectorId === sectorFilter
        );
    }

    // Apply sorting
    filteredStocks.sort((a, b) => {
        if (sortBy === "sector") {
            const valueA = a.sector?.name || "";
            const valueB = b.sector?.name || "";
            return sortDirection === "asc"
                ? valueA.localeCompare(valueB)
                : valueB.localeCompare(valueA);
        }
        if (sortBy === "currency") {
            const valueA = a.currency || "";
            const valueB = b.currency || "";
            return sortDirection === "asc"
                ? valueA.localeCompare(valueB)
                : valueB.localeCompare(valueA);
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
    const handleSort = (column: keyof Stock | "sector") => {
        if (sortBy === column) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortBy(column);
            setSortDirection("asc");
        }
    };

    return (
        <>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <Input
                    placeholder="Search stocks..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="sm:max-w-xs"
                />
                <Select value={sectorFilter} onValueChange={setSectorFilter}>
                    <SelectTrigger className="sm:max-w-xs">
                        <SelectValue placeholder="Filter by sector" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Sectors</SelectItem>
                        {sectors.map((sector) => (
                            <SelectItem key={sector.id} value={sector.id}>
                                {sector.name}
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
                                        onClick={() => handleSort("ticker")}
                                    >
                                        Ticker{" "}
                                        {sortBy === "ticker" && (
                                            <span className="ml-1">
                                                {sortDirection === "asc" ? "↑" : "↓"}
                                            </span>
                                        )}
                                    </th>
                                    <th
                                        className="text-left font-medium py-4 px-6 cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort("name")}
                                    >
                                        Company{" "}
                                        {sortBy === "name" && (
                                            <span className="ml-1">
                                                {sortDirection === "asc" ? "↑" : "↓"}
                                            </span>
                                        )}
                                    </th>
                                    <th
                                        className="text-left font-medium py-4 px-6 cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort("sector")}
                                    >
                                        Sector{" "}
                                        {sortBy === "sector" && (
                                            <span className="ml-1">
                                                {sortDirection === "asc" ? "↑" : "↓"}
                                            </span>
                                        )}
                                    </th>
                                    <th className="text-center font-medium py-4 px-3 cursor-pointer hover:bg-muted/50" onClick={() => handleSort("currency")} >
                                        Currency{' '}
                                        {sortBy === 'currency' && <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                                    </th>
                                    <th
                                        className="text-right font-medium py-4 px-6 cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort("holdings")}
                                    >
                                        Shares{" "}
                                        {sortBy === "holdings" && (
                                            <span className="ml-1">
                                                {sortDirection === "asc" ? "↑" : "↓"}
                                            </span>
                                        )}
                                    </th>
                                    <th
                                        className="text-right font-medium py-4 px-6 cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort("averagePrice")}
                                    >
                                        Avg Price{" "}
                                        {sortBy === "averagePrice" && (
                                            <span className="ml-1">
                                                {sortDirection === "asc" ? "↑" : "↓"}
                                            </span>
                                        )}
                                    </th>
                                    <th
                                        className="text-right font-medium py-4 px-6 cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort("value")}
                                    >
                                        Value{" "}
                                        {sortBy === "value" && (
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
                                {filteredStocks.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={9} // Adjusted colspan
                                            className="py-6 text-center text-muted-foreground"
                                        >
                                            {stocks.length === 0
                                                ? "No stocks in your portfolio. Add your first stock to get started."
                                                : "No stocks match your filters."}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredStocks.map((stock) => (
                                        <tr key={stock.id} className="hover:bg-muted/50">
                                            <td className="py-4 px-6">
                                                <Link
                                                    href={`/stocks/${stock.id}`}
                                                    className="font-medium hover:underline"
                                                >
                                                    {stock.ticker}
                                                </Link>
                                            </td>
                                            <td className="py-4 px-6">{stock.name}</td>
                                            <td className="py-4 px-6">{stock.sector?.name || "—"}</td>
                                            <td className="py-4 px-3 text-center">
                                                <span className="text-xs font-medium">
                                                    {getCurrencySymbol(stock.currency)} {stock.currency}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                {stock.holdings > 0 ? stock.holdings.toFixed(2) : "0.00"}
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                {stock.averagePrice > 0
                                                    ? formatCurrency(stock.averagePrice, stock.currency) // Use stock currency
                                                    : "—"}
                                            </td>
                                            <td className="py-4 px-6 text-right font-medium">
                                                {formatCurrency(stock.value, stock.currency)} {/* Use stock currency */}
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                {stock.notes && stock.notes.length > 0 ? (
                                                    <div className="relative group inline-flex justify-center">
                                                        <div className="cursor-pointer hover:text-primary">
                                                            <FileTextIcon className="h-5 w-5" />
                                                        </div>
                                                        <div className="invisible absolute z-10 w-64 -translate-x-1/2 -translate-y-8 rounded-md border bg-popover px-3 py-2 text-xs text-popover-foreground opacity-0 shadow-md transition-all group-hover:visible group-hover:opacity-100">
                                                            <div className="font-semibold mb-1">
                                                                {stock.notes.length}{" "}
                                                                {stock.notes.length === 1 ? "note" : "notes"}
                                                            </div>
                                                            <div className="line-clamp-2 text-muted-foreground">
                                                                {stock.notes[0].content}
                                                            </div>
                                                            <div className="text-right mt-1">
                                                                <Link
                                                                    href={`/stocks/${stock.id}`}
                                                                    className="text-primary text-xs hover:underline"
                                                                >
                                                                    View all
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground text-xs">
                                                        No notes
                                                    </span>
                                                )}
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
                                                            onClick={() => setStockToEdit(stock)} // stock already includes currency here
                                                            className="cursor-pointer"
                                                        >
                                                            <PencilIcon className="mr-2 h-4 w-4" /> Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => setStockToDelete(stock)} // stock already includes currency here
                                                            className="cursor-pointer text-destructive focus:text-destructive"
                                                        >
                                                            <TrashIcon className="mr-2 h-4 w-4" /> Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
            {stockToEdit && (
                <EditStockForm
                    stock={stockToEdit} // Pass the stock object which now matches the required type
                    open={!!stockToEdit}
                    onOpenChange={(open) => {
                        if (!open) setStockToEdit(null);
                    }}
                />
            )}
            {stockToDelete && (
                <DeleteStockDialog
                    stock={stockToDelete} // Pass the stock object
                    open={!!stockToDelete}
                    onOpenChange={(open) => {
                        if (!open) setStockToDelete(null);
                    }}
                />
            )}
        </>
    );
}