// -----------------------------------------------------------------------------
//  src/app/stocks/page.tsx         (complete replacement file)
// -----------------------------------------------------------------------------
import { Metadata } from "next";
import { getStocks, getSectors } from "@/actions/stocks";
import { getTransactions } from "@/actions/transactions";

import StocksHeader from "@/components/stocks/stocks-header";
import StocksTable, {
    Stock as StocksTableStockType,
} from "@/components/stocks/stocks-table";

import {
    calculateAveragePrice,
    calculateTotalHoldings,
} from "@/lib/utils";

import { Currency } from "@/lib/validators";

export const metadata: Metadata = {
    title: "Stocks | Stock Manager",
    description: "Manage your stock portfolio",
};

/**
 * Collapse duplicate Stock rows that share the same (userId, ticker).
 * We keep static fields from the earliest created record and merge
 * transactions / notes from all duplicates so the UI shows a single,
 * aggregated position.
 */
export default async function StocksPage() {
    const [stocksRes, txRes, sectorsRes] = await Promise.all([
        getStocks(),
        getTransactions(),
        getSectors(),
    ]);

    const rawStocks = stocksRes.success ? stocksRes.data ?? [] : [];
    const transactions = txRes.success ? txRes.data ?? [] : [];
    const sectors = sectorsRes.success ? sectorsRes.data ?? [] : [];

    // ---------------------------------------------------------------------------
    // 1. Group duplicate stock records by ticker
    // ---------------------------------------------------------------------------
    const groups = new Map<
        string, // ticker
        {
            base: typeof rawStocks[number]; // first record encountered
            txs: typeof transactions;       // combined transactions
            notes: typeof rawStocks[number]["notes"]; // combined notes
        }
    >();

    for (const s of rawStocks) {
        const entry = groups.get(s.ticker);
        if (entry) {
            entry.txs.push(
                ...transactions.filter((t) => t.stockId === s.id),
            );
            entry.notes.push(...(s.notes || []));
        } else {
            groups.set(s.ticker, {
                base: s,
                txs: transactions.filter((t) => t.stockId === s.id),
                notes: s.notes || [],
            });
        }
    }

    // ---------------------------------------------------------------------------
    // 2. Build the array expected by <StocksTable>
    // ---------------------------------------------------------------------------
    const enhancedStocks: StocksTableStockType[] = Array.from(
        groups.values(),
    ).map(({ base, txs, notes }) => {
        const averagePrice = calculateAveragePrice(txs);
        const holdings = calculateTotalHoldings(txs);
        const value = holdings * averagePrice;

        return {
            id: base.id, // first record’s id (only used for URL)
            ticker: base.ticker,
            name: base.name,
            sectorId: base.sectorId,
            sector: base.sector,
            averagePrice,
            holdings,
            value,
            transactions: txs.length,
            notes,
            currency: (base.currency || "USD") as Currency,
        };
    });

    // ---------------------------------------------------------------------------
    // 3. Render
    // ---------------------------------------------------------------------------
    return (
        <div className="space-y-6">
            <StocksHeader />
            <StocksTable stocks={enhancedStocks} sectors={sectors} />
        </div>
    );
}