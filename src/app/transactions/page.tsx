/* -------------------------------------------------------------
   src/app/transactions/page.tsx
-------------------------------------------------------------- */
import { Metadata } from "next";

import { getTransactions } from "@/actions/transactions";
import { getStocks } from "@/actions/stocks";

import TransactionsHeader from "@/components/transactions/transactions-header";
import TransactionsTable from "@/components/transactions/transactions-table";

import { Currency } from "@/lib/validators";

export const metadata: Metadata = {
    title: "Transactions | Stock Manager",
    description: "View and manage your stock transactions",
};

export default async function TransactionsPage() {
    /* ---------- fetch ---------- */
    const [txRes, stockRes] = await Promise.all([
        getTransactions(),
        getStocks(),
    ]);

    const rawTx = txRes.success ? txRes.data ?? [] : [];
    const rawStocks = stockRes.success ? stockRes.data ?? [] : [];

    /* ---------- cast currency fields ---------- */
    const transactions = rawTx.map((tx) => ({
        ...tx,
        currency: (tx.currency || tx.stock.currency || "USD") as Currency,
        stock: {
            ...tx.stock,
            currency: (tx.stock.currency || "USD") as Currency,
        },
    }));

    const typedStocks = rawStocks.map((s) => ({
        ...s,
        currency: (s.currency || "USD") as Currency,
    }));

    /* ---------- render ---------- */
    return (
        <div className="space-y-6">
            <TransactionsHeader />
            <TransactionsTable transactions={transactions} stocks={typedStocks} />
        </div>
    );
}