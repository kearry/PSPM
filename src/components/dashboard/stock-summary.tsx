"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";

interface Stock {
    id: string;
    ticker: string;
    name: string;
    sector?: {
        id: string;
        name: string;
    } | null;
    averagePrice: number;
    holdings: number;
    value: number;
}

interface StockSummaryProps {
    stocks: Stock[];
}

export default function StockSummary({ stocks }: StockSummaryProps) {
    const [search, setSearch] = useState("");

    const filteredStocks = stocks.filter((stock) => {
        const searchLower = search.toLowerCase();
        return (
            stock.ticker.toLowerCase().includes(searchLower) ||
            stock.name.toLowerCase().includes(searchLower) ||
            stock.sector?.name.toLowerCase().includes(searchLower)
        );
    });

    // Sort by value (descending)
    const sortedStocks = [...filteredStocks].sort((a, b) => b.value - a.value);

    return (
        <Card className="col-span-full">
            <CardHeader className="space-y-0">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Stock Holdings</CardTitle>
                        <CardDescription>
                            Your current stock positions and values
                        </CardDescription>
                    </div>
                    <div className="w-64">
                        <Input
                            placeholder="Search stocks..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full"
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left font-medium py-3 px-2">Ticker</th>
                                <th className="text-left font-medium py-3 px-2">Company</th>
                                <th className="text-left font-medium py-3 px-2">Sector</th>
                                <th className="text-right font-medium py-3 px-2">Avg Price</th>
                                <th className="text-right font-medium py-3 px-2">Shares</th>
                                <th className="text-right font-medium py-3 px-2">Current Value</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {sortedStocks.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-6 text-center text-muted-foreground">
                                        {search ? "No stocks match your search" : "No stocks in your portfolio yet"}
                                    </td>
                                </tr>
                            ) : (
                                sortedStocks.map((stock) => (
                                    <tr key={stock.id} className="hover:bg-muted/50">
                                        <td className="py-3 px-2">
                                            <Link
                                                href={`/stocks/${stock.id}`}
                                                className="font-medium hover:underline"
                                            >
                                                {stock.ticker}
                                            </Link>
                                        </td>
                                        <td className="py-3 px-2">{stock.name}</td>
                                        <td className="py-3 px-2">{stock.sector?.name || "—"}</td>
                                        <td className="py-3 px-2 text-right">
                                            {formatCurrency(stock.averagePrice)}
                                        </td>
                                        <td className="py-3 px-2 text-right">{stock.holdings.toFixed(2)}</td>
                                        <td className="py-3 px-2 text-right font-medium">
                                            {formatCurrency(stock.value)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}