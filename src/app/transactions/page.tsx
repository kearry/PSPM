import { Metadata } from "next";
import { getTransactions } from "@/actions/transactions";
import { getStocks } from "@/actions/stocks";
import TransactionsHeader from "@/components/transactions/transactions-header";
import TransactionsTable from "@/components/transactions/transactions-table";

export const metadata: Metadata = {
    title: "Transactions | Stock Manager",
    description: "View and manage your stock transactions",
};

export default async function TransactionsPage() {
    const [transactionsResponse, stocksResponse] = await Promise.all([
        getTransactions(),
        getStocks(),
    ]);

    const transactions = transactionsResponse.success ? transactionsResponse.data ?? [] : [];
    const stocks = stocksResponse.success ? stocksResponse.data ?? [] : [];

    return (
        <div className="space-y-6">
            <TransactionsHeader />
            <TransactionsTable transactions={transactions} stocks={stocks} />
        </div>
    );
}